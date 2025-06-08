import { NextResponse } from "next/server";
import { db } from "@/db/index";
import { ipLocationsTable } from "@/db/schema";

export async function GET() {
  try {
    const allLocations = await db.select().from(ipLocationsTable);
    console.log("Fetched IP locations:", allLocations);
    return NextResponse.json(allLocations, { status: 200 });
  } catch (error) {
    console.error("Error fetching IP locations:", error);
    return NextResponse.json(
      { error: "Failed to fetch IP locations" },
      { status: 500 }
    );
  }
}
