import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { Button } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/signin");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <LayoutDashboard className="h-5 w-5" />
            TaskMaster Pro
          </Link>
          <nav className="flex items-center gap-2" aria-label="Main navigation">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                Workspaces
              </Button>
            </Link>
            <Link href="/analytics">
              <Button variant="ghost" size="sm">
                Analytics
              </Button>
            </Link>
            <ThemeToggle />
            <UserMenu user={session.user} />
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
