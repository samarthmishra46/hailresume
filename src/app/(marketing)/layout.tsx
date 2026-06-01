import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { Footer } from "@/components/marketing/Footer";
import { getSessionUser } from "@/lib/auth";

// Public marketing shell. getSessionUser() is a fast local claims check used
// only to flip the header CTA between "Sign in" and "Go to my resumes".
export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  return (
    <div className="flex min-h-full flex-1 flex-col bg-white">
      <MarketingHeader loggedIn={!!user} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
