import dataBase from "./database";
import { fillDatabase } from "./add.widgets.data";

console.log("[SEED] Starting manual database seeding...");

try {
  fillDatabase(dataBase);
  console.log("[SEED] Manual seeding completed successfully.");
} catch (error) {
  console.error("[SEED] Error during manual seeding:", error);
  throw error;
}
