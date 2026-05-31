import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { getProfile } from "@/lib/auth";

// Client area: any signed-in user. Admins can use it too.
export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  return (
    <div className="flex min-h-full flex-1 flex-col bg-slate-50">
      <AppHeader profile={profile} />
      <div className="flex-1">{children}</div>
    </div>
  );
}
