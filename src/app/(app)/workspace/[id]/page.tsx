"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KanbanBoard } from "@/components/kanban-board";
import { Plus, ArrowLeft } from "lucide-react";

export default function WorkspacePage() {
  const params = useParams();
  const id = params.id as string;
  const { data: workspace, isLoading } = trpc.workspace.get.useQuery({ id });
  const { data: tasks } = trpc.task.list.useQuery({ workspaceId: id });
  const { data: projects } = trpc.project.list.useQuery({ workspaceId: id });

  if (isLoading || !workspace) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" aria-label="Back to workspaces">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{workspace.name}</h1>
          {workspace.description && (
            <p className="text-slate-600 dark:text-slate-400">{workspace.description}</p>
          )}
        </div>
        <Link href={`/workspace/${id}/task/new`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New task
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {projects?.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/workspace/${id}?project=${p.id}`}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: p.color ?? "#64748b" }}
                    />
                    {p.name} ({p._count.tasks})
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <div className="lg:col-span-2">
          <KanbanBoard workspaceId={id} tasks={tasks ?? []} projects={projects ?? []} />
        </div>
      </div>
    </div>
  );
}
