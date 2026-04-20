import { NextResponse } from "next/server";

import { isCaseChildEntityKey } from "@/lib/case-transaction-config";
import {
  deleteCaseTransaction,
  parsePositiveInt,
  updateCaseTransaction,
} from "@/lib/case-workspace";

type RouteContext = {
  params: Promise<{ id: string; entity: string; recordId: string }>;
};

async function resolveRouteParams(context: RouteContext) {
  const { id, entity, recordId } = await context.params;
  const caseRegisterId = parsePositiveInt(id, "case_register_id");
  const transactionId = parsePositiveInt(recordId, "record_id");

  if (!isCaseChildEntityKey(entity)) {
    throw new Error("Invalid case transaction");
  }

  return {
    caseRegisterId,
    entity,
    transactionId,
  };
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { caseRegisterId, entity, transactionId } =
      await resolveRouteParams(context);
    const body = await request.json();

    await updateCaseTransaction(caseRegisterId, entity, transactionId, body);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update transaction";

    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { caseRegisterId, entity, transactionId } =
      await resolveRouteParams(context);

    await deleteCaseTransaction(caseRegisterId, entity, transactionId);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to delete transaction";

    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}
