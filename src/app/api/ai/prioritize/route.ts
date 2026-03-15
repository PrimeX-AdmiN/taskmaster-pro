import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI not configured" }, { status: 503 });
    }
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const { tasks } = (await req.json()) as { tasks: { title: string; description?: string }[] };
    if (!Array.isArray(tasks) || tasks.length === 0) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const taskList = tasks.map((t) => `- ${t.title}${t.description ? `: ${t.description}` : ""}`).join("\n");
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a task prioritization assistant. Given a list of tasks, return a JSON array of objects with keys: index (0-based), priority (low/medium/high), reason. Keep reasons brief.",
        },
        {
          role: "user",
          content: `Prioritize these tasks:\n${taskList}`,
        },
      ],
      response_format: { type: "json_object" },
    });
    const text = completion.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(text) as { priorities?: { index: number; priority: string; reason: string }[] };
    return NextResponse.json(parsed.priorities ?? []);
  } catch (e) {
    console.error("AI prioritize error:", e);
    return NextResponse.json({ error: "AI service error" }, { status: 500 });
  }
}
