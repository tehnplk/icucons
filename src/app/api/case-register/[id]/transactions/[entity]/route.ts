import { NextResponse } from "next/server";

import { isCaseChildEntityKey } from "@/lib/case-transaction-config";
import {
  createCaseTransaction,
  parsePositiveInt,
} from "@/lib/case-workspace";

type RouteContext = {
  params: Promise<{ id: string; entity: string }>;
};

async function resolveRouteParams(context: RouteContext) {
  const { id, entity } = await context.params;
  const caseRegisterId = parsePositiveInt(id, "case_register_id");

  if (!isCaseChildEntityKey(entity)) {
    throw new Error("Invalid case transaction");
  }

  return {
    caseRegisterId,
    entity,
  };
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { caseRegisterId, entity } = await resolveRouteParams(context);
    const body = await request.json();
    const recordId = await createCaseTransaction(caseRegisterId, entity, body);

    return NextResponse.json({ ok: true, recordId }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create transaction";

    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}
