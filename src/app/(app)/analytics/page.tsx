"use client";

import { useState, useEffect, useMemo } from "react";
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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ArrowLeft } from "lucide-react";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"];

export default function AnalyticsPage() {
  const { data: memberships } = trpc.workspace.list.useQuery();
  const [workspaceId, setWorkspaceId] = useState<string>("");
  const workspaces = useMemo(() => memberships?.map((m) => m.workspace) ?? [], [memberships]);
  const selectedId = workspaceId || workspaces[0]?.id;

  useEffect(() => {
    if (!workspaceId && workspaces.length > 0) {
      setWorkspaceId(workspaces[0].id);
    }
  }, [workspaceId, workspaces]);

  const { data: analytics, isLoading } = trpc.analytics.dashboard.useQuery(
    { workspaceId: selectedId },
    { enabled: !!selectedId }
  );

  if (isLoading || !analytics) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const statusData = [
    { name: "To Do", value: analytics.tasksByStatus.todo ?? 0 },
    { name: "In Progress", value: analytics.tasksByStatus.in_progress ?? 0 },
    { name: "Done", value: analytics.tasksByStatus.done ?? 0 },
  ];

  const priorityData = [
    { name: "Low", value: analytics.tasksByPriority.low ?? 0 },
    { name: "Medium", value: analytics.tasksByPriority.medium ?? 0 },
    { name: "High", value: analytics.tasksByPriority.high ?? 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics</h1>
        <Select value={selectedId} onValueChange={setWorkspaceId}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select workspace" />
          </SelectTrigger>
          <SelectContent>
            {workspaces.map((ws) => (
              <SelectItem key={ws.id} value={ws.id}>
                {ws.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{analytics.totalTasks}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{analytics.completedTasks}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{analytics.completionRate.toFixed(1)}%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tasks by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6" name="Tasks" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tasks by Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }: { name: string; value: number }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                  >
                    {priorityData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
