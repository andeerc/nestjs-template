import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table.bigint('id').primary();
    table.string('first_name').notNullable();
    table.string('last_name').notNullable();
    table.string('phone').nullable();
    table.text('avatar_url').nullable();
    table.enum('role', ['admin', 'user', 'manager']).defaultTo('user');
    table.boolean('is_active').defaultTo(true);
    table.boolean('email_verified').defaultTo(false);
    table.timestamp('email_verified_at').nullable();
    table.json('preferences').nullable();
    table.json('metadata').nullable();
    table.timestamps(true, true);

    table.index(['role']);
    table.index(['is_active']);
    table.index(['email_verified']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('users');
}
