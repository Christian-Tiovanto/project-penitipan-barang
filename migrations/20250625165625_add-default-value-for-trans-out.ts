import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
      ALTER TABLE transaction_outs
        ALTER COLUMN qty SET DEFAULT 0,
        ALTER COLUMN converted_qty SET DEFAULT 0,
        ALTER COLUMN conversion_to_kg SET DEFAULT 0,
        ALTER COLUMN total_price SET DEFAULT 0,
        ALTER COLUMN total_fine SET DEFAULT 0,
        ALTER COLUMN total_charge SET DEFAULT 0,
        ALTER COLUMN productname SET NOT NULL,
        ALTER COLUMN customerid SET NOT NULL,
        ALTER COLUMN is_charge SET DEFAULT false;
        `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
      ALTER TABLE transaction_outs
        ALTER COLUMN qty SET DEFAULT null,
        ALTER COLUMN converted_qty DROP DEFAULT,
        ALTER COLUMN conversion_to_kg DROP DEFAULT,
        ALTER COLUMN total_price SET DEFAULT null,
        ALTER COLUMN total_fine SET DEFAULT null,
        ALTER COLUMN total_charge SET DEFAULT null,
        ALTER COLUMN productname DROP NOT NULL,
        ALTER COLUMN customerid DROP NOT NULL,
        ALTER COLUMN is_charge SET DEFAULT null;

  `);
}
