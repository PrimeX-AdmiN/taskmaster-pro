import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("changeme123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@taskmaster.pro" },
    update: {},
    create: {
      email: "admin@taskmaster.pro",
      name: "Admin User",
      password: hashedPassword,
    },
  });

  const workspace = await prisma.workspace.upsert({
    where: { slug: "demo-workspace" },
    update: {},
    create: {
      name: "Demo Workspace",
      slug: "demo-workspace",
      description: "Sample workspace for testing",
    },
  });

  await prisma.workspaceMember.upsert({
    where: {
      userId_workspaceId: { userId: admin.id, workspaceId: workspace.id },
    },
    update: { role: "owner" },
    create: {
      userId: admin.id,
      workspaceId: workspace.id,
      role: "owner",
    },
  });

  const project = await prisma.project.create({
    data: {
      name: "Getting Started",
      description: "Initial project",
      color: "#3B82F6",
      workspaceId: workspace.id,
    },
  });

  await prisma.task.createMany({
    data: [
      {
        title: "Welcome to TaskMaster Pro",
        description: "Explore the platform and create your first task",
        status: "done",
        priority: "high",
        workspaceId: workspace.id,
        projectId: project.id,
        createdById: admin.id,
      },
      {
        title: "Invite your team",
        description: "Add team members to collaborate",
        status: "in_progress",
        priority: "medium",
        workspaceId: workspace.id,
        projectId: project.id,
        createdById: admin.id,
      },
      {
        title: "Create your first project",
        description: "Organize tasks into projects",
        status: "todo",
        priority: "medium",
        workspaceId: workspace.id,
        projectId: project.id,
        createdById: admin.id,
      },
    ],
  });

  console.log("Seed completed. Admin: admin@taskmaster.pro / changeme123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
