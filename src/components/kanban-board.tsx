"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { GripVertical } from "lucide-react";
import type { RouterOutputs } from "@/lib/trpc/client";

type Task = RouterOutputs["task"]["list"][number];
type Project = { id: string; name: string; color: string | null }[];

const STATUSES = ["todo", "in_progress", "done"] as const;

function TaskCard({
  task,
  onStatusChange,
}: {
  task: Task;
  onStatusChange: (id: string, status: string) => void;
}) {
  const router = useRouter();
  const [{ isDragging }, drag] = useDrag({
    type: "TASK",
    item: { id: task.id },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  return (
    <div
      ref={drag as unknown as React.Ref<HTMLDivElement>}
      className={`cursor-grab rounded-lg border bg-white p-3 shadow-sm transition-opacity dark:bg-slate-900 ${
        isDragging ? "opacity-50" : ""
      }`}
      onClick={() => router.push(`/task/${task.id}`)}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-slate-900 dark:text-white">{task.title}</p>
          {task.project && (
            <span
              className="mt-1 inline-block rounded px-1.5 py-0.5 text-xs"
              style={{
                backgroundColor: (task.project.color ?? "#64748b") + "20",
                color: task.project.color ?? "#64748b",
              }}
            >
              {task.project.name}
            </span>
          )}
          <div onClick={(e) => e.stopPropagation()}>
            <Select
              value={task.status}
              onValueChange={(v) => onStatusChange(task.id, v)}
            >
              <SelectTrigger className="mt-2 h-8 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s.replace("_", " ")}
                </SelectItem>
              ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}

function Column({
  status,
  tasks,
  onStatusChange,
  onDrop,
}: {
  status: string;
  tasks: Task[];
  onStatusChange: (id: string, status: string) => void;
  onDrop: (taskId: string, newStatus: string) => void;
}) {
  const [{ isOver }, drop] = useDrop({
    accept: "TASK",
    drop: (item: { id: string }) => onDrop(item.id, status),
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  });

  return (
    <div
      ref={drop as unknown as React.Ref<HTMLDivElement>}
      className={`flex min-h-[200px] flex-1 flex-col rounded-lg border-2 border-dashed p-4 transition-colors ${
        isOver ? "border-primary bg-primary/5" : "border-slate-200 dark:border-slate-700"
      }`}
    >
      <h3 className="mb-4 font-semibold capitalize text-slate-700 dark:text-slate-300">
        {status.replace("_", " ")}
      </h3>
      <div className="space-y-2">
        {tasks.map((t) => (
          <TaskCard key={t.id} task={t} onStatusChange={onStatusChange} />
        ))}
      </div>
    </div>
  );
}

export function KanbanBoard({
  workspaceId,
  tasks,
  projects,
}: {
  workspaceId: string;
  tasks: Task[];
  projects: Project;
}) {
  const utils = trpc.useUtils();
  const updateTask = trpc.task.update.useMutation({
    onSuccess: () => {
      utils.task.list.invalidate({ workspaceId });
    },
  });

  const onStatusChange = useCallback(
    (id: string, status: string) => {
      updateTask.mutate({ id, status: status as "todo" | "in_progress" | "done" });
    },
    [updateTask]
  );

  const onDrop = useCallback(
    (taskId: string, newStatus: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task || task.status === newStatus) return;
      updateTask.mutate({ id: taskId, status: newStatus as "todo" | "in_progress" | "done" });
    },
    [tasks, updateTask]
  );

  const byStatus = (s: string) => tasks.filter((t) => t.status === s);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STATUSES.map((status) => (
          <Column
            key={status}
            status={status}
            tasks={byStatus(status)}
            onStatusChange={onStatusChange}
            onDrop={onDrop}
          />
        ))}
      </div>
    </DndProvider>
  );
}
