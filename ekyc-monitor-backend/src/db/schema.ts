// src/db/schema.ts
import {
  mysqlTable,
  int,
  varchar,
  datetime,
  text,
  boolean,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  username: varchar("username", { length: 100 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).default("operator"),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const services = mysqlTable("services", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 100 }).notNull(),
  containerName: varchar("container_name", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }),
  port: varchar("port", { length: 100 }),
  cpuUsage: varchar("cpu_usage", { length: 50 }),
  memoryUsage: varchar("memory_usage", { length: 50 }),
  lastCheckedAt: datetime("last_checked_at"),
});

export const alerts = mysqlTable("alerts", {
  id: int("id").primaryKey().autoincrement(),
  serviceName: varchar("service_name", { length: 100 }),
  message: text("message").notNull(),
  severity: varchar("severity", { length: 50 }).default("warning"),
  isResolved: boolean("is_resolved").default(false),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
});