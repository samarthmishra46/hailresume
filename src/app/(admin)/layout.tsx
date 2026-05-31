import { AppHeader } from "@/components/AppHeader";
import { requireAdmin } from "@/lib/auth";

// Admin area: requireAdmin redirects non-admins.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireAdmin();

  return (
    <div className="flex min-h-full flex-1 flex-col bg-slate-50">
      <AppHeader profile={profile} />
      <div className="flex-1">{children}</div>
    </div>
  );
}
