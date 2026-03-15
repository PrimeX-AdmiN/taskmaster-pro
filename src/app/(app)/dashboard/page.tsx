"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Users, FolderKanban } from "lucide-react";

export default function WorkspacesPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { data: memberships, isLoading } = trpc.workspace.list.useQuery();
  const utils = trpc.useUtils();
  const create = trpc.workspace.create.useMutation({
    onSuccess: () => {
      utils.workspace.list.invalidate();
      setShowCreate(false);
      setName("");
      setDescription("");
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const workspaces = memberships?.map((m) => m.workspace) ?? [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Workspaces</h1>
        <Button onClick={() => setShowCreate(true)} aria-label="Create workspace">
          <Plus className="mr-2 h-4 w-4" />
          New workspace
        </Button>
      </div>

      {showCreate && (
        <Card>
          <CardHeader>
            <CardTitle>Create workspace</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                create.mutate({ name, description: description || undefined });
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="ws-name">Name</Label>
                <Input
                  id="ws-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Workspace"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ws-desc">Description (optional)</Label>
                <Input
                  id="ws-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={create.isPending}>
                  Create
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {workspaces.map((ws) => (
          <Link key={ws.id} href={`/workspace/${ws.id}`}>
            <Card className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50">
              <CardHeader className="flex flex-row items-center gap-2">
                <FolderKanban className="h-8 w-8 text-primary" />
                <CardTitle className="text-lg">{ws.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                  {ws.description || "No description"}
                </p>
                <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {ws._count?.members ?? 0} members
                  </span>
                  <span className="flex items-center gap-1">
                    <FolderKanban className="h-3 w-3" />
                    {ws._count?.projects ?? 0} projects
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {workspaces.length === 0 && !showCreate && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FolderKanban className="h-12 w-12 text-slate-400" />
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              No workspaces yet. Create one to get started.
            </p>
            <Button className="mt-4" onClick={() => setShowCreate(true)}>
              Create workspace
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
