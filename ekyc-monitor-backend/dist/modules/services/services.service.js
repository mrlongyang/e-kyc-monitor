// src/modules/services/services.service.ts
import { db } from "../../db/index.js";
import { services } from "../../db/schema.js";
export async function getAllServices() {
    return db.select().from(services);
}
import { executeRemoteCommand } from "../../utils/remoteShell.js";
const ALLOWED_SERVICES = [
    "bio-assay",
    "bio-auth",
    "bio-facerecognition",
    "bio-fingerprint",
    "bio-gateway",
    "bio-oam",
    "bio-ocr",
    "bio-oss",
];
const ALLOWED_ACTIONS = ["start", "stop", "restart"];
export async function controlDockerService(serviceName, action) {
    if (!ALLOWED_SERVICES.includes(serviceName)) {
        throw new Error("Service is not allowed");
    }
    if (!ALLOWED_ACTIONS.includes(action)) {
        throw new Error("Action is not allowed");
    }
    const composeDirectory = "/home/fbadmin/FeelBiometric/feelbiometric2.1_docker_installation/fb";
    const command = `cd ${composeDirectory} && ` +
        `docker compose ${action} ${serviceName}`;
    return executeRemoteCommand(command);
}
