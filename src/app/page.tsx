import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <header className="border-b border-slate-200/50 dark:border-slate-800">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <span className="text-xl font-bold text-slate-900 dark:text-white">TaskMaster Pro</span>
          <nav className="flex items-center gap-4">
            {session ? (
              <Link href="/dashboard">
                <Button>Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/signin">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-6xl">
            Collaborate on tasks.
            <br />
            <span className="text-blue-600 dark:text-blue-400">Ship faster.</span>
          </h1>
          <p className="mt-6 text-lg text-slate-600 dark:text-slate-400">
            TaskMaster Pro brings your team together with real-time task management, AI-powered
            prioritization, and seamless collaboration.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            {!session && (
              <Link href="/auth/signup">
                <Button size="lg" className="h-12 px-8">
                  Start Free Trial
                </Button>
              </Link>
            )}
            <Link href={session ? "/dashboard" : "/auth/signin"}>
              <Button size="lg" variant="outline" className="h-12 px-8">
                {session ? "Go to Dashboard" : "Sign In"}
              </Button>
            </Link>
          </div>
          <div className="mt-20 grid gap-8 sm:grid-cols-3">
            <FeatureCard
              title="Real-time Sync"
              description="See updates instantly with WebSocket-powered live collaboration."
            />
            <FeatureCard
              title="AI Assistant"
              description="Auto-prioritize tasks and summarize descriptions with OpenAI."
            />
            <FeatureCard
              title="Team Workspaces"
              description="Organize projects, assign tasks, and track progress together."
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{description}</p>
    </div>
  );
}
