import { int, mysqlTable, serial, varchar, text, timestamp } from 'drizzle-orm/mysql-core';

export const usersTable = mysqlTable('dbrap_users_table', {
  id: serial().primaryKey(),
  username: varchar({ length: 255 }).notNull(),
  
  password: varchar({length: 66}).notNull(),
  salt: text('salt'),

  role: varchar({length:20}).notNull(),
  refreshToken: varchar('refresh_token', {length:255}),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').$onUpdate(()=>new Date())
});
