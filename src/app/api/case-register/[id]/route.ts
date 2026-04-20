import { NextResponse } from "next/server";

import { parsePositiveInt, updateCaseRegister } from "@/lib/case-workspace";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function resolveCaseRegisterId(context: RouteContext) {
  const { id } = await context.params;
  return parsePositiveInt(id, "case_register_id");
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const caseRegisterId = await resolveCaseRegisterId(context);
    const body = await request.json();

    await updateCaseRegister(caseRegisterId, body);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update case register";

    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}
