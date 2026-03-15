"use client";

import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
  const { data: user, isLoading } = trpc.auth.me.useQuery();

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Name</label>
            <p className="mt-1 text-slate-900 dark:text-white">{user.name ?? "—"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Email</label>
            <p className="mt-1 text-slate-900 dark:text-white">{user.email}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
