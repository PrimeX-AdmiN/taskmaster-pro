"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc/client";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const signUp = trpc.auth.signUp.useMutation({
    onSuccess: async () => {
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.ok) {
        router.push("/dashboard");
        router.refresh();
      } else setError("Account created but sign-in failed. Try signing in.");
    },
    onError: (e) => setError(e.message),
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    signUp.mutate({ email, password, name });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="w-full max-w-md space-y-8 rounded-xl border border-slate-200 bg-white p-8 shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create account</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Get started with TaskMaster Pro
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div
              className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
              role="alert"
            >
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              aria-label="Full name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              aria-label="Email address"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              aria-label="Password (min 8 characters)"
            />
          </div>
          <Button type="submit" className="w-full" disabled={signUp.isPending}>
            {signUp.isPending ? "Creating account..." : "Create account"}
          </Button>
        </form>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200 dark:border-slate-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-500 dark:bg-slate-900 dark:text-slate-400">
              Or continue with
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            aria-label="Sign up with Google"
          >
            Google
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
            aria-label="Sign up with GitHub"
          >
            GitHub
          </Button>
        </div>
        <p className="text-center text-sm text-slate-600 dark:text-slate-400">
          Already have an account?{" "}
          <Link href="/auth/signin" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
