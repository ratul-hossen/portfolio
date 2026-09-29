import { notFound } from "next/navigation";
import { canWrite, loadContent } from "@/lib/store";
import { SectionEditor } from "../_editor/section-editor";
import { getSection, isSectionId } from "../_lib/sections";

export const dynamic = "force-dynamic";

export default async function AdminSectionPage({ params }: PageProps<"/admin/[section]">) {
  const { section } = await params;
  if (!isSectionId(section)) notFound();
  const initial = getSection(await loadContent(), section);
  // Keyed by section so switching pages starts from fresh state.
  return <SectionEditor key={section} id={section} initial={initial} canEdit={canWrite} />;
}
