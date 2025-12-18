/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    // Drop the primary key constraint and the existing auto-incrementing column
    await knex.schema.alterTable('messages', (table) => {
        table.dropColumn('id');
    });

    // Add back the id column as a string primary key
    await knex.schema.alterTable('messages', (table) => {
        table.string('id', 255).primary();
    });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    await knex.schema.alterTable('messages', (table) => {
        table.dropColumn('id');
    });
    await knex.schema.alterTable('messages', (table) => {
        table.increments('id').primary();
    });
}
