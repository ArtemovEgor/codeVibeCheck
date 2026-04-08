import dataBase from "./database";
import { fillDatabase } from "./add.widgets.data";

console.log("[SEED] Starting manual database seeding...");

try {
  fillDatabase(dataBase, true); // Force seed to sync data even if tables are not empty
  console.log("[SEED] Manual seeding completed successfully.");
} catch (error) {
  console.error("[SEED] Error during manual seeding:", error);
  throw error;
}
