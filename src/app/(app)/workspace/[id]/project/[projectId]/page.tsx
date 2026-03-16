"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as Icons from "lucide-react";
import { Upload } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.id as string;
  const projectId = params.projectId as string;

  const { data, isLoading } = trpc.project.get.useQuery({ id: projectId });
  const updateProject = trpc.project.update.useMutation();
  const updateRole = trpc.workspace.updateMemberRole.useMutation();
  const removeMember = trpc.workspace.removeMember.useMutation();

  const [imageUrl, setImageUrl] = useState<string>(data?.project.image ?? "");
  const [icon, setIcon] = useState<string>((data as any)?.project?.icon ?? "Folder");
  const [isUploading, setIsUploading] = useState(false);

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const { project, workspaceMembers, currentMemberRole } = data as any;
  const canManage = currentMemberRole === "owner" || currentMemberRole === "member";
  const canEditRoles = currentMemberRole === "owner";
  const Icon =
    (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[icon] ??
    Icons.Folder;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Back to workspace"
          onClick={() => router.push(`/workspace/${workspaceId}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{project.name}</h1>
          {project.description && (
            <p className="text-slate-600 dark:text-slate-400">{project.description}</p>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Project branding</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div
                className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-md border"
                style={{ backgroundColor: (project.color ?? "#64748b") + "20" }}
              >
                {project.image ? (
                  <Image src={project.image} alt={project.name} fill className="object-cover" />
                ) : (
                  <Icon className="h-6 w-6" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-slate-900 dark:text-white">Card preview</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  This is how it appears in the workspace project list.
                </div>
              </div>
            </div>
            {project.image && (
              <div className="relative h-48 w-full overflow-hidden rounded-md border bg-slate-50 dark:bg-slate-900">
                <Image
                  src={project.image}
                  alt={project.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            {canManage && (
              <form
                className="space-y-2"
                onSubmit={async (e) => {
                  e.preventDefault();
                  await updateProject.mutateAsync({
                    id: project.id,
                    icon,
                    image: imageUrl || null,
                  });
                }}
              >
                <Label htmlFor="project-icon">Icon</Label>
                <select
                  id="project-icon"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
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

                <Label htmlFor="image-url">Image URL</Label>
                <Input
                  id="image-url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                />
                <p className="text-xs text-muted-foreground">
                  Paste an image URL for this project (e.g. from your storage/CDN).
                </p>
                <div className="space-y-2">
                  <Label htmlFor="project-image-file">Upload image</Label>
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
                          const path = `projects/${workspaceId}/${projectId}/${crypto.randomUUID()}.${ext}`;
                          const { error } = await supabase.storage
                            .from("project-images")
                            .upload(path, file, { upsert: true, contentType: file.type });
                          if (error) throw error;
                          const { data } = supabase.storage.from("project-images").getPublicUrl(path);
                          setImageUrl(data.publicUrl);
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
                <Button type="submit" size="sm" disabled={updateProject.isPending}>
                  Save
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">People on this project</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {workspaceMembers.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-md border px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  {m.user.image ? (
                    <Image
                      src={m.user.image}
                      alt={m.user.name ?? m.user.email}
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-100">
                      {(m.user.name ?? m.user.email).charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-medium text-slate-900 dark:text-white">
                      {m.user.name ?? m.user.email}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {m.user.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {canEditRoles ? (
                    <Select
                      value={m.role}
                      onValueChange={(role) =>
                        updateRole.mutate({
                          workspaceId,
                          memberId: m.id,
                          role: role as "owner" | "member" | "viewer",
                        })
                      }
                    >
                      <SelectTrigger className="h-8 w-[110px] text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="owner">Owner</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs capitalize text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      {m.role}
                    </span>
                  )}
                  {canEditRoles && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 text-xs"
                      onClick={() =>
                        removeMember.mutate({
                          workspaceId,
                          memberId: m.id,
                        })
                      }
                    >
                      ×
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

