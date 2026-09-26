import { NextResponse } from "next/server";
import { BLUEPRINT_NAME, BLUEPRINT_PRICE_LABEL, KEEP_PLANNED_LABEL, blueprintSaleReady } from "@/lib/paid-config";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    ready: blueprintSaleReady(),
    name: BLUEPRINT_NAME,
    price: BLUEPRINT_PRICE_LABEL,
    keepPlanned: KEEP_PLANNED_LABEL,
  });
}
