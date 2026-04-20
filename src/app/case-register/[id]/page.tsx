import { notFound } from "next/navigation";

import { CaseWorkspaceView } from "@/app/case-register/[id]/case-workspace";
import { parsePositiveInt, fetchCaseWorkspace } from "@/lib/case-workspace";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CaseWorkspacePage({ params }: PageProps) {
  const { id } = await params;
  const caseRegisterId = parsePositiveInt(id, "case_register_id");
  const workspace = await fetchCaseWorkspace(caseRegisterId);

  if (!workspace) {
    notFound();
  }

  return <CaseWorkspaceView workspace={workspace} />;
}
