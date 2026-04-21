import { int, mysqlTable, serial, varchar, text, timestamp, date, decimal, double, tinyint } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm/sql/sql';

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
// ✅ SCHEMES TABLE
export const schemesTable = mysqlTable('m_credit_scheme_master', {
  id: int('id').primaryKey().autoincrement(),
  schemeName: varchar('schemeName', { length: 255 }),
  shortSchName: varchar('shortSchName', { length: 255 }),
});

export const bankTable = mysqlTable('m_module_name', {
  id: int('intModuleId').primaryKey().autoincrement(),
  vchModuleName : varchar('vchModuleName', { length: 255 }),
  vchAliasName: varchar('vchAliasName', { length: 255 }),
});

export const districtTable = mysqlTable('m_district_code', {
  id: int('intId').primaryKey().autoincrement(),
  intDistrictId : int('intDistrictId').notNull(),
  vchName: varchar('vchName', { length: 255 }),
});

export const dummySchemeTxnTable = mysqlTable("dummy_sheme_transcation_details", {
  id: serial("id").primaryKey().notNull(),
  schemeName: varchar("SchemeName", { length: 200 }),
  moduleName: varchar("ModuleName", { length: 150 }),
  ifscCode: varchar("IFSCCode", { length: 150 }),
  applicantName: varchar("applicantName", { length: 150 }),
  districtName: varchar("DistrictName", { length: 150 }),
  applicationDate: date("applicationDate"),
  loanApplied: decimal("loanApplied", { precision: 15, scale: 2 }),
  sanctionDate: date("sanctionDate"),
  loanSanctioned: decimal("loanSanctioned", { precision: 15, scale: 2 }),
  disbursementDate: date("disbursementDate").notNull(),
  loanDisbursed: double("loanDisbursed", { precision: 15, scale: 2 }),
  rejectionDate: date("rejectionDate"),
  reasonRejection: text("reasonRejection"),
  uniqueId: int("uniqueID").notNull().default(0), // Labeled as Masked Adhaar Number in your screenshot
  tinstatus: tinyint("tinstatus").notNull().default(1),
  bitDeletedFlag: tinyint("bitDeletedFlag").notNull().default(0),
  stmCreatedOn: timestamp("stmCreatedOn")
    .default(sql`CURRENT_TIMESTAMP`)
    .onUpdateNow(),
  intCreatedBy: int("intCreatedBy").notNull().default(0),
  stmUpdatedOn: timestamp("stmUpdatedOn")
    .default(sql`CURRENT_TIMESTAMP`)
    .onUpdateNow(),
  intUpdatedBy: int("intUpdatedBy").notNull().default(0),
});

export const schemeTransactions = mysqlTable("t_c_sheme_transcation_details", {
  id: serial("id").primaryKey().autoincrement(),
  intSchemeId: int("intSchemeId").notNull(),
  intModuleId: int("intModuleId").notNull(),
  ifscCode: varchar("IFSCCode", { length: 150 }),
  applicantName: varchar("applicantName", { length: 150 }),
  intDistrictId: int("intDistrictId").notNull(),
  applicationDate: date("applicationDate"),
  loanApplied: decimal("loanApplied", { precision: 15, scale: 2 }),
  sanctionDate: date("sanctionDate").notNull(),
  loanSanctioned: decimal("loanSanctioned", { precision: 15, scale: 2 }),
  disbursementDate: date("disbursementDate").notNull(),
  loanDisbursed: double("loanDisbursed", { precision: 15, scale: 2 }),
  rejectionDate: date("rejectionDate").notNull(),
  reasonRejection: text("reasonRejection").notNull(),
  uniqueId: int("uniqueID").notNull(), // Masked Adhaar Number
  tinstatus: tinyint("tinstatus").notNull().default(1),
  bitDeletedFlag: tinyint("bitDeletedFlag").notNull().default(0),
  stmCreatedOn: timestamp("stmCreatedOn")
    .default(sql`CURRENT_TIMESTAMP`),
  intCreatedBy: int("intCreatedBy").notNull().default(0),
  stmUpdatedOn: timestamp("stmUpdatedOn")
    .default(sql`CURRENT_TIMESTAMP`)
    .onUpdateNow(),
  intUpdatedBy: int("intUpdatedBy").notNull().default(0),
});