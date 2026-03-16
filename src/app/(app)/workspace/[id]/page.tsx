"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KanbanBoard } from "@/components/kanban-board";
import * as Icons from "lucide-react";
import { Plus, ArrowLeft, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function WorkspacePage() {
  const params = useParams();
  const id = params.id as string;
  const { data: workspace, isLoading } = trpc.workspace.get.useQuery({ id });
  const { data: tasks } = trpc.task.list.useQuery({ workspaceId: id });
  const { data: projects } = trpc.project.list.useQuery({ workspaceId: id });
  const utils = trpc.useUtils();

  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectColor, setProjectColor] = useState("#64748b");
  const [projectImageUrl, setProjectImageUrl] = useState("");
  const [projectIcon, setProjectIcon] = useState("Folder");
  const [isUploading, setIsUploading] = useState(false);

  const createProject = trpc.project.create.useMutation({
    onSuccess: async (p) => {
      await utils.project.list.invalidate({ workspaceId: id });
      setProjectName("");
      setProjectDescription("");
      setProjectColor("#64748b");
      setProjectImageUrl("");
      setProjectIcon("Folder");
      setIsCreatingProject(false);
      // Optionally route to the newly created project
      // router.push(`/workspace/${id}/project/${p.id}`);
    },
  });

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
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base">Projects</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCreatingProject((v) => !v)}
              >
                <Plus className="mr-2 h-4 w-4" />
                New project
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isCreatingProject && (
              <form
                className="mb-4 space-y-3 rounded-md border p-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  createProject.mutate({
                    workspaceId: id,
                    name: projectName.trim(),
                    description: projectDescription.trim() || undefined,
                    color: projectColor || undefined,
                    icon: projectIcon,
                    image: projectImageUrl.trim() || undefined,
                  });
                }}
              >
                <div className="space-y-1">
                  <Label htmlFor="project-name">Name</Label>
                  <Input
                    id="project-name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g. Website redesign"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="project-description">Description</Label>
                  <Input
                    id="project-description"
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="Optional"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="project-color">Color</Label>
                    <Input
                      id="project-color"
                      type="color"
                      value={projectColor}
                      onChange={(e) => setProjectColor(e.target.value)}
                      className="h-10 p-1"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="project-icon">Icon</Label>
                    <select
                      id="project-icon"
                      value={projectIcon}
                      onChange={(e) => setProjectIcon(e.target.value)}
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                    >
                      {[
                        "Folder",
                        "Briefcase",
                        "Rocket",
                        "LayoutGrid",
                        "ClipboardList",
                        "Bug",
                        "Palette",
                        "Wrench",
                        "Shield",
                        "Users",
                        "Target",
                        "LineChart",
                      ].map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="project-image">Image URL (optional)</Label>
                  <Input
                    id="project-image"
                    value={projectImageUrl}
                    onChange={(e) => setProjectImageUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project-image-file">Upload image (optional)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="project-image-file"
                      type="file"
                      accept="image/*"
                      disabled={isUploading}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          setIsUploading(true);
                          const supabase = getSupabaseBrowserClient();
                          const ext = file.name.split(".").pop() || "png";
                          const path = `projects/${id}/${crypto.randomUUID()}.${ext}`;
                          const { error } = await supabase.storage
                            .from("project-images")
                            .upload(path, file, { upsert: true, contentType: file.type });
                          if (error) throw error;
                          const { data } = supabase.storage.from("project-images").getPublicUrl(path);
                          setProjectImageUrl(data.publicUrl);
                        } catch (err) {
                          console.error(err);
                          alert(
                            "Upload failed. Ensure Supabase bucket 'project-images' exists and is public, and NEXT_PUBLIC_SUPABASE_* env vars are set."
                          );
                        } finally {
                          setIsUploading(false);
                        }
                      }}
                    />
                    <Button type="button" variant="outline" size="sm" disabled={isUploading}>
                      <Upload className="mr-2 h-4 w-4" />
                      {isUploading ? "Uploading..." : "Upload"}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button type="submit" size="sm" disabled={createProject.isPending}>
                    Create
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setIsCreatingProject(false)}
                  >
                    Cancel
                  </Button>
                </div>
                {createProject.error?.message && (
                  <p className="text-sm text-red-600">{createProject.error.message}</p>
                )}
              </form>
            )}
            <div className="grid gap-3">
              {projects?.map((p) => {
                const Icon =
                  (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[
                    (p as any).icon ?? "Folder"
                  ] ?? Icons.Folder;
                const image = (p as any).image as string | null | undefined;
                return (
                  <Link
                    key={p.id}
                    href={`/workspace/${id}/project/${p.id}`}
                    className="group rounded-lg border p-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-md"
                        style={{ backgroundColor: (p.color ?? "#64748b") + "20" }}
                      >
                        {image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={image} alt={p.name} className="h-10 w-10 object-cover" />
                        ) : (
                          <Icon className="h-5 w-5" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="truncate font-medium text-slate-900 dark:text-white">
                            {p.name}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {p._count.tasks} tasks
                          </div>
                        </div>
                        <div className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                          {p.description || "No description"}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
        <div className="lg:col-span-2">
          <KanbanBoard workspaceId={id} tasks={tasks ?? []} projects={projects ?? []} />
        </div>
      </div>
    </div>
  );
}
