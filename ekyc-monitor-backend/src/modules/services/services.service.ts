// src/modules/services/services.service.ts
import { db } from "../../db";
import { services } from "../../db/schema";

export async function getAllServices() {
  return db.select().from(services);
}