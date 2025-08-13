import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('email_verification_tokens', (table) => {
    table.bigint('id').primary();
    table.bigint('user_id').notNullable();
    table.string('token', 255).notNullable().unique();
    table.string('email').notNullable();
    table.timestamp('expires_at').notNullable();
    table.boolean('is_used').defaultTo(false);
    table.timestamps(true, true);

    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.index(['token']);
    table.index(['user_id']);
    table.index(['email']);
    table.index(['expires_at']);
    table.index(['is_used']);
  });
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('email_verification_tokens');
}

