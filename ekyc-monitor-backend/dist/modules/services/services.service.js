// src/modules/services/services.service.ts
import { db } from "../../db/index.js";
import { services } from "../../db/schema.js";
export async function getAllServices() {
    return db.select().from(services);
}
