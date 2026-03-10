import { getDossier } from "@/data/mock";
import { Sidebar } from "@/components/sidebar";
import { notFound } from "next/navigation";

export default function DossierLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const dossier = getDossier(params.id);
  if (!dossier) notFound();

  return (
    <div className="flex h-screen">
      <Sidebar dossier={dossier} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
