import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";

export default async function LayoutPrivate({
                                              children,
                                            }: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/");

  const user = session.user;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <Navbar user={user} />
      <main className="max-w-7xl mx-auto md:px-6 py-6 pb-20 pt-2">{children}</main>
    </div>
  );
}
