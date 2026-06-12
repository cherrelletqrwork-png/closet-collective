import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { createListing, getListings } from "@/lib/store";
import type { ListingInput } from "@/lib/types";

export async function GET() {
  return NextResponse.json(await getListings());
}

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const input = (await request.json()) as ListingInput;
  const listing = await createListing(input);
  return NextResponse.json(listing, { status: 201 });
}
