"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: task, isLoading } = trpc.task.get.useQuery({ id });
  const [summary, setSummary] = useState<string | null>(null);
  const [summarizing, setSummarizing] = useState(false);

  const utils = trpc.useUtils();
  const updateTask = trpc.task.update.useMutation({
    onSuccess: () => {
      if (task) utils.task.get.invalidate({ id });
    },
  });
  const deleteTask = trpc.task.delete.useMutation({
    onSuccess: () => {
      if (task) router.push(`/workspace/${task.workspaceId}`);
    },
  });

  async function handleSummarize() {
    if (!task?.description) return;
    setSummarizing(true);
    try {
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: task.description }),
      });
      const data = await res.json();
      setSummary(data.summary ?? "");
    } catch {
      setSummary("Failed to summarize");
    } finally {
      setSummarizing(false);
    }
  }

  if (isLoading || !task) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/workspace/${task.workspaceId}`}>
          <Button variant="ghost" size="icon" aria-label="Back to workspace">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{task.title}</h1>
          {task.project && (
            <span
              className="mt-1 inline-block rounded px-2 py-0.5 text-sm"
              style={{
                backgroundColor: (task.project.color ?? "#64748b") + "30",
                color: task.project.color ?? "#64748b",
              }}
            >
              {task.project.name}
            </span>
          )}
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => deleteTask.mutate({ id })}
          disabled={deleteTask.isPending}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Description</CardTitle>
            {task.description && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSummarize}
                disabled={summarizing}
                className="w-fit"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {summarizing ? "Summarizing..." : "AI Summarize"}
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">
              {task.description || "No description"}
            </p>
            {summary && (
              <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
                <p className="text-sm font-medium text-primary">AI Summary</p>
                <p className="mt-1 text-slate-600 dark:text-slate-400">{summary}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Status</label>
              <Select
                value={task.status}
                onValueChange={(v) =>
                  updateTask.mutate({ id, status: v as "todo" | "in_progress" | "done" })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To do</SelectItem>
                  <SelectItem value="in_progress">In progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Priority</label>
              <Select
                value={task.priority}
                onValueChange={(v) =>
                  updateTask.mutate({ id, priority: v as "low" | "medium" | "high" })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Created by</p>
              <p className="mt-1 text-slate-900 dark:text-white">{task.creator.name ?? "Unknown"}</p>
            </div>
            {task.assignments.length > 0 && (
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Assigned to</p>
                <ul className="mt-1 space-y-1">
                  {task.assignments.map((a) => (
                    <li key={a.userId} className="text-slate-900 dark:text-white">
                      {a.user.name ?? a.user.email}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
