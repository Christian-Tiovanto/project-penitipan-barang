 CREATE OR REPLACE FUNCTION create_ar_payment(
    create_ar_dto jsonb,
    p_payment_methodid integer,
    p_spbid integer,
    p_transout_date date
    )
    RETURNS integer
    LANGUAGE plpgsql
    AS $$
    DECLARE
        -- Loop variables
        create_ar_dto          jsonb;
        trans_out_luar_item     jsonb;
        create_ar_record         record;

        -- Product and Unit Information
        payment_method        payment_methods%ROWTYPE;

    BEGIN
        SELECT * into payment_method FROM payment_methods WHERE id = p_payment_methodid;
         
        -- Loop through each product item requested for transaction out
        FOR create_ar_record IN SELECT * FROM jsonb_array_elements(create_ar_dto) LOOP
            
            -- 1. GET PRODUCT INFO AND VALIDATE
            ----------------------------------------------------
            SELECT * INTO product_info FROM products p WHERE p.id = (trans_out_item ->> 'productId')::integer;
            UPDATE 
            IF NOT FOUND THEN
                RAISE EXCEPTION 'Product with ID % not found.', trans_out_item ->> 'productId' USING ERRCODE = 'P0002';
            END IF;

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


        END LOOP; -- end of trans_out_dto loop
    RETURN invoice_id;
    END;
    $$;