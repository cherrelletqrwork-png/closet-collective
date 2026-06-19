import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { addSoldLogEntry, getOrders } from "@/lib/store";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await getOrders());
}

interface SoldLogBody {
  item?: string;
  buyer?: string;
  amount?: number;
  soldOn?: string;
  notes?: string;
}

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as SoldLogBody | null;
  const item = body?.item?.trim();
  if (!item) {
    return NextResponse.json(
      { error: "Please enter the item name." },
      { status: 400 }
    );
  }

  const entry = await addSoldLogEntry({
    item,
    buyer: body?.buyer?.trim() ?? "",
    amount: Number(body?.amount) || 0,
    soldOn: body?.soldOn || new Date().toISOString(),
    notes: body?.notes?.trim() ?? "",
  });
  return NextResponse.json(entry);
}
