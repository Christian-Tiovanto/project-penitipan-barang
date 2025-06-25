CREATE OR REPLACE FUNCTION create_trans_out(
    trans_out_dto jsonb,
    trans_out_luar_dto jsonb,
    p_customerid integer,
    p_spbid integer,
    p_transout_date date
)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
    -- Loop variables
    trans_out_item          jsonb;
    trans_out_luar_item     jsonb;
    trans_in_record         record;

    -- Product and Unit Information
    product_info        products%ROWTYPE;
    product_unit_info   product_units%ROWTYPE;

    customer_code       text;

    -- Quantity tracking
    total_converted_qty_for_trans_out           integer;
    qty_for_trans_out                 integer;
    available_stock_in_kg                       integer;

    -- Financials
    charge_per_item     integer := 0;
    fine_for_item       integer := 0;
    charge_amount_base  integer;

    -- Invoice
    invoice_id integer;
    total_amount_for_invoice integer := 0;
    total_charge_for_invoice integer := 0;
    total_fine_for_invoice integer := 0;
    total_order_for_invoice integer := 0;
    total_order_converted_for_invoice integer := 0;

    -- Aggregates for the invoice (optional, can be calculated later with a SUM query)
    -- total_charge_for_invoice integer := 0;
    -- total_fine_for_invoice integer := 0;
BEGIN
    INSERT INTO invoices (customerid) VALUES (p_customerid) RETURNING id into invoice_id;
    SELECT code into customer_code FROM customers where id = p_customerid;

    -- Fetch the base charge amount once to avoid querying inside a loop
    SELECT amount INTO charge_amount_base FROM charges WHERE id = 1;
    IF NOT FOUND THEN
        -- Or set to 0 if charges are optional
        RAISE EXCEPTION 'Base charge with ID 1 not found.' USING ERRCODE = 'P0002';
    END IF;

    -- Loop through each product item requested for transaction out
    FOR trans_out_item IN SELECT * FROM jsonb_array_elements(trans_out_dto) LOOP
        
        -- 1. GET PRODUCT INFO AND VALIDATE
        ----------------------------------------------------
        SELECT * INTO product_info FROM products p WHERE p.id = (trans_out_item ->> 'productId')::integer;
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Product with ID % not found.', trans_out_item ->> 'productId' USING ERRCODE = 'P0002';
        END IF;

        SELECT * INTO product_unit_info FROM product_units pu WHERE pu.productid = product_info.id;
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Product Unit for Product ID % not found.', product_info.id USING ERRCODE = 'P0002';
        END IF;

        -- 2. CHECK STOCK AVAILABILITY
        ----------------------------------------------------
        total_converted_qty_for_trans_out := (trans_out_item ->> 'qty')::integer * product_unit_info.conversion_to_kg;

        SELECT COALESCE(sum(ti.remaining_qty), 0) INTO available_stock_in_kg
        FROM transaction_ins ti
        WHERE ti.productid = product_info.id AND ti.customerid = p_customerid;

        IF total_converted_qty_for_trans_out > available_stock_in_kg THEN
            RAISE EXCEPTION 'Not enough stock for Product ID %. Required (kg): %, Available (kg): %',
                product_info.id, total_converted_qty_for_trans_out, available_stock_in_kg
                USING ERRCODE = 'P0002';
        END IF;

        -- 3. PROCESS FIFO (First-In, First-Out)
        ----------------------------------------------------
        -- Loop through available incoming transactions, oldest first
        total_order_for_invoice := total_order_for_invoice + (trans_out_item ->> 'qty')::integer;
        total_order_converted_for_invoice := total_order_converted_for_invoice + total_converted_qty_for_trans_out;
        FOR trans_in_record IN
            SELECT * FROM transaction_ins ti
            WHERE ti.productid = product_info.id AND ti.remaining_qty > 0 AND ti.customerid = p_customerid
            ORDER BY ti.created_at ASC
        LOOP
            -- Reset per-item financials
            fine_for_item := 0;
            charge_per_item := 0;

            -- Determine how much quantity to take from this trans_in record
            IF total_converted_qty_for_trans_out <= trans_in_record.remaining_qty THEN
                -- This trans_in record is enough to fulfill the rest of the order
                qty_for_trans_out := total_converted_qty_for_trans_out;
                UPDATE transaction_ins ti SET remaining_qty = ti.remaining_qty - total_converted_qty_for_trans_out WHERE ti.id = trans_in_record.id;
                total_converted_qty_for_trans_out := 0; -- The order for this product is now fulfilled
            ELSE
                -- This trans_in record is not enough, so we consume it completely
                qty_for_trans_out := trans_in_record.remaining_qty;
                UPDATE transaction_ins ti SET remaining_qty = 0 WHERE ti.id = trans_in_record.id;
                total_converted_qty_for_trans_out := total_converted_qty_for_trans_out - trans_in_record.remaining_qty;
            END IF;

            -- 4. CALCULATE CHARGES AND FINES for the fulfilled portion
            ----------------------------------------------------
            -- Corrected charge logic
            IF (trans_out_item ->> 'is_charge')::boolean  THEN
                charge_per_item := charge_per_item + charge_amount_base;
                total_charge_for_invoice := total_charge_for_invoice + charge_per_item;

            END IF;
            IF  trans_in_record.is_charge THEN
                charge_per_item := charge_per_item + charge_amount_base;
                total_charge_for_invoice := total_charge_for_invoice + charge_per_item;
            END IF;
            
            -- Fine calculation based on age
            IF is_past_days(trans_in_record.created_at, 120, p_transout_date) THEN
                fine_for_item := product_info.price * 4 * qty_for_trans_out;
            ELSIF is_past_days(trans_in_record.created_at, 90, p_transout_date) THEN
                fine_for_item := product_info.price * 3 * qty_for_trans_out;
            ELSIF is_past_days(trans_in_record.created_at, 60, p_transout_date) THEN
                fine_for_item := product_info.price * 2 * qty_for_trans_out;
            ELSIF is_past_days(trans_in_record.created_at, 30, p_transout_date) THEN
                fine_for_item := product_info.price * 1 * qty_for_trans_out;
            END IF;

            total_fine_for_invoice := total_fine_for_invoice + fine_for_item;
            -- 5. INSERT THE TRANSACTION OUT RECORD
            ----------------------------------------------------
            INSERT INTO transaction_outs(
                productid, productname, customerid, transaction_inid, invoiceid, spbid,
                qty, converted_qty, conversion_to_kg, unit,
                price, total_price,
                total_fine, total_charge, is_charge,
                total_days, -- This seems to be a hardcoded '30' in your original query, adjust if needed
                created_at, updated_at
            ) VALUES (
                product_info.id, product_info.name, p_customerid, trans_in_record.id, invoice_id, p_spbid,
                qty_for_trans_out / product_unit_info.conversion_to_kg, -- Original quantity
                qty_for_trans_out, -- Quantity in KG
                product_unit_info.conversion_to_kg, product_unit_info.name,
                product_info.price, product_info.price * qty_for_trans_out,
                fine_for_item, charge_per_item, (trans_out_item ->> 'is_charge')::boolean,
                30, -- Assuming this is intentional
                p_transout_date, p_transout_date
            );

            total_amount_for_invoice := total_amount_for_invoice + product_info.price * qty_for_trans_out;
            -- If the required quantity for this product is fulfilled, exit the inner loop
            IF total_converted_qty_for_trans_out = 0 THEN
                EXIT;
            END IF;

        END LOOP; -- end of trans_in loop

    END LOOP; -- end of trans_out_dto loop
    FOR trans_out_luar_item IN SELECT * FROM jsonb_array_elements(trans_out_luar_dto) LOOP
        INSERT INTO transaction_outs(
            productid, productname, customerid, invoiceid, spbid,
            converted_qty,
            price, total_price,
            total_days,
            created_at, updated_at
        ) VALUES (
            null, (trans_out_luar_item ->> 'productName'), p_customerid, invoice_id, p_spbid,
            (trans_out_luar_item ->> 'converted_qty')::integer,
            (trans_out_luar_item ->> 'price')::integer, (trans_out_luar_item ->> 'total_price')::integer,
            30,
            p_transout_date, p_transout_date
        );
    END LOOP;
    UPDATE invoices SET invoice_no = customer_code || '-' || LPAD(invoice_id::text, 5, '0'), total_amount = total_amount_for_invoice, charge = total_charge_for_invoice, fine = total_fine_for_invoice, discount = 0, total_order = total_order_for_invoice, total_order_converted = total_order_converted_for_invoice, tax = 0 where id = invoice_id;
    -- Return the ID of the invoice that these transactions belong to
    RETURN invoice_id;
END;
$$;