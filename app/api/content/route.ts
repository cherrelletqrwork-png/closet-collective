import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getSiteContent, updateSiteContent } from "@/lib/store";
import type { SiteContent } from "@/lib/types";
import { DEFAULT_SITE_CONTENT } from "@/lib/content";

export async function GET() {
  return NextResponse.json(await getSiteContent());
}

export async function PUT(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | Partial<SiteContent>
    | null;
  if (!body) {
    return NextResponse.json({ error: "Invalid content." }, { status: 400 });
  }

  // Merge over defaults so a partial payload can never blank out the site.
  const current = await getSiteContent();
  const next: SiteContent = { ...DEFAULT_SITE_CONTENT, ...current };
  for (const key of Object.keys(DEFAULT_SITE_CONTENT) as (keyof SiteContent)[]) {
    const value = body[key];
    if (key === "payment_terms") {
      if (Array.isArray(value)) {
        next.payment_terms = value
          .map((line) => String(line).trim())
          .filter(Boolean);
      }
    } else if (typeof value === "string") {
      next[key] = value;
    }
  }

  return NextResponse.json(await updateSiteContent(next));
}
