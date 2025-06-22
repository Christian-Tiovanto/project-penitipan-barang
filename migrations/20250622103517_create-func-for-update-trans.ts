import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    CREATE OR REPLACE FUNCTION update_transaction_n_product(trans_in_id integer,new_prod_id integer, new_unit_id integer, new_qty integer)
    RETURNS transaction_ins
    LANGUAGE plpgsql
    AS $$
    DECLARE
        OLD_TRANS_IN transaction_ins%ROWTYPE;
        NEW_TRANS_IN transaction_ins%ROWTYPE;
        CHECK_TRANS_OUT integer;
        NEW_PRODUCT_UNITS product_units%ROWTYPE;
    BEGIN
        SELECT * INTO OLD_TRANS_IN FROM transaction_ins where id = trans_in_id LIMIT 1;
        IF OLD_TRANS_IN is null THEN
          RAISE EXCEPTION 'Transaction In with ID % not found.', trans_in_id
              USING ERRCODE = 'P0002';
        END IF;

        SELECT id INTO CHECK_TRANS_OUT FROM transaction_outs where transaction_inId = trans_in_id LIMIT 1;
        IF CHECK_TRANS_OUT is not null THEN
            RAISE EXCEPTION 'Cant update a Transaction In that already have Transaction Out'
              USING ERRCODE = 'P0004';
        END IF;

        NEW_TRANS_IN := OLD_TRANS_IN;
        NEW_TRANS_IN.qty = COALESCE(new_qty, OLD_TRANS_IN.qty);

        IF new_unit_id is not null THEN
            select * INTO NEW_PRODUCT_UNITS from product_units WHERE id = new_unit_id and productid = new_prod_id;
            IF NEW_PRODUCT_UNITS is null THEN
              RAISE EXCEPTION 'Product Units with ID % and Product ID % not found.', new_unit_id, new_prod_id
                USING ERRCODE = 'P0002';
            END IF;
            NEW_TRANS_IN.unit = NEW_PRODUCT_UNITS.name;
            NEW_TRANS_IN.conversion_to_kg = NEW_PRODUCT_UNITS.conversion_to_kg;
        END IF;
        NEW_TRANS_IN.converted_qty  = NEW_TRANS_IN.qty * NEW_TRANS_IN.conversion_to_kg;

        IF new_prod_id != OLD_TRANS_IN.productid  THEN
            NEW_TRANS_IN.productid := new_prod_id;
            UPDATE products SET qty = qty + NEW_TRANS_IN.converted_qty where id = new_prod_id;
            UPDATE products set qty = qty - OLD_TRANS_IN.converted_qty where id = OLD_TRANS_IN.productid;
        ELSIF NEW_TRANS_IN.converted_qty != OLD_TRANS_IN.converted_qty THEN
            UPDATE products SET qty = qty - (OLD_TRANS_IN.converted_qty - NEW_TRANS_IN.converted_qty) where id = OLD_TRANS_IN.productid;
        END IF;

        UPDATE transaction_ins
        SET
            productid = NEW_TRANS_IN.productid,
            qty = NEW_TRANS_IN.qty,
            unit = NEW_TRANS_IN.unit,
            conversion_to_kg = NEW_TRANS_IN.conversion_to_kg,
            converted_qty = NEW_TRANS_IN.converted_qty,
            remaining_qty = NEW_TRANS_IN.remaining_qty
        WHERE id = trans_in_id
        RETURNING * INTO NEW_TRANS_IN; 
        RETURN NEW_TRANS_IN;
    END;
    $$;
    `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
      DROP FUNCTION update_transaction_n_product (integer, integer, integer, integer);
    `);
}
