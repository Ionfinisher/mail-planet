import { eq, sql } from "drizzle-orm";
import { db } from "./index";
import { InsertIpLocation, SelectIpLocation, ipLocationsTable } from "./schema";

export async function createIpLocation(data: InsertIpLocation) {
  await db.insert(ipLocationsTable).values(data).returning();
}

export async function getAllIpLocations(): Promise<SelectIpLocation[]> {
  return db.select().from(ipLocationsTable);
}

export async function getIpLocationByIp(
  ipAddress: string
): Promise<SelectIpLocation | null> {
  const result = await db
    .select()
    .from(ipLocationsTable)
    .where(eq(ipLocationsTable.ipAddress, ipAddress))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function incrementEmailCount(
  ipAddress: string
): Promise<SelectIpLocation | null> {
  const result = await db
    .update(ipLocationsTable)
    .set({
      emailCount: sql`${ipLocationsTable.emailCount} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(ipLocationsTable.ipAddress, ipAddress))
    .returning();

  return result.length > 0 ? result[0] : null;
}
