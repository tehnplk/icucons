import { NextResponse } from "next/server";

import { fetchPatientOptions } from "@/lib/patient";

export async function GET() {
  const options = await fetchPatientOptions();
  return NextResponse.json(options);
}

