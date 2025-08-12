import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('user_logins', (table) => {
    table.bigint('id').primary();
    table.bigint('user_id').references('id').inTable('users').onDelete('CASCADE').notNullable();
    table.string('email').unique().notNullable();
    table.string('password_hash').notNullable();
    table.string('salt').notNullable();
    table.enum('status', ['active', 'inactive', 'suspended', 'locked']).defaultTo('active');
    table.integer('failed_attempts').defaultTo(0);
    table.timestamp('locked_until').nullable();
    table.timestamp('last_login_at').nullable();
    table.string('last_login_ip').nullable();
    table.timestamps(true, true);

    table.index(['email']);
    table.index(['user_id']);
    table.index(['status']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('user_logins');
}
