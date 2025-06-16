import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE users
    ALTER COLUMN password TYPE text;    
    `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE users
    ALTER COLUMN password TYPE varchar(55)
    USING substring(password, 1, 55);
`);
}
