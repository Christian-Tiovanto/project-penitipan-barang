import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
     CREATE OR REPLACE FUNCTION create_ar_payment(
    create_ar_dto jsonb,
    p_payment_methodid integer,
    p_reference_no text,
    p_transfer_date date
    )
    RETURNS integer
    LANGUAGE plpgsql
    AS $$
    DECLARE
        -- Loop variables
        create_ar_dto_detail    jsonb;

        -- Payment Method Row
        payment_method        payment_methods%ROWTYPE;
        
        -- Ar Row
        updated_ar        ar%ROWTYPE;

    BEGIN
        SELECT * into payment_method FROM payment_methods WHERE id = p_payment_methodid;
         
        -- Loop through each product item requested for transaction out
        FOR create_ar_dto_detail IN SELECT * FROM jsonb_array_elements(create_ar_dto) LOOP
            -- 1. Update AR Data and Validate to_paid total
            UPDATE ar SET 
            to_paid = to_paid - (create_ar_dto_detail ->> 'total_paid')::integer, 
            total_paid = total_paid + (create_ar_dto_detail ->> 'total_paid')::integer, 
            status = CASE
                 WHEN (to_paid - (create_ar_dto_detail ->> 'total_paid')::numeric) = 0 THEN 'completed'::order_status
                 ELSE 'partial'::order_status
            END
            WHERE id = (create_ar_dto_detail ->> 'arId')::integer
            RETURNING * into updated_ar;

            IF updated_ar.to_paid < 0 THEN
                RAISE EXCEPTION 'AR % To Paid Only %.', updated_ar.ar_no, updated_ar.to_paid + (create_ar_dto_detail ->> 'total_paid')::integer USING ERRCODE = 'P0002';
            END IF;

            -- 2. Update Invoice Status To Complete if AR is fully paid
            IF updated_ar.to_paid = 0 THEN
                UPDATE invoices set status = 'completed'
                WHERE id = updated_ar.invoiceid;
            END IF;

            -- 3. Create AR Payment
            INSERT INTO ar_payment(arid, total_Paid, customer_paymentId, transfer_date, reference_no, customerid, payment_method_name)
            VALUES (updated_ar.id, (create_ar_dto_detail ->> 'total_paid')::integer, payment_method.id, p_transfer_date, p_reference_no, updated_ar.customerid, payment_method.name );

            -- 4. Create Cashflow
            INSERT INTO cashflows(type, amount, "from") values ('in', (create_ar_dto_detail ->> 'total_paid')::integer, 'payment');
        END LOOP; -- end of create_ar_dto loop
    RETURN 1;
    END;
    $$;
    `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    DROP FUNCTION create_ar_payment(jsonb, integer, text, date);
  `);
}
