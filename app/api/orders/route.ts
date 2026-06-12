import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getOrders } from "@/lib/store";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await getOrders());
}
