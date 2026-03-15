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
    const { text } = (await req.json()) as { text: string };
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Summarize the given text concisely in 1-2 sentences. Preserve key action items if any.",
        },
        { role: "user", content: text },
      ],
    });
    const summary = completion.choices[0]?.message?.content ?? "";
    return NextResponse.json({ summary });
  } catch (e) {
    console.error("AI summarize error:", e);
    return NextResponse.json({ error: "AI service error" }, { status: 500 });
  }
}
