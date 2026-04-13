import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const translation = searchParams.get("t") ?? "RVR60";
  const book = searchParams.get("b");
  const chapter = searchParams.get("c");

  if (!book || !chapter) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://bolls.life/get-text/${translation}/${book}/${chapter}/`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; IglesiaCJC/1.0)",
          "Accept": "application/json",
        },
        signal: AbortSignal.timeout(12000),
      }
    );
    if (!res.ok) throw new Error(`bolls.life ${res.status}`);
    const data = await res.json();
    // Strip HTML tags from verse text at the source
    const cleaned = Array.isArray(data)
      ? data.map((v: { verse: number; text: string; pk?: number }) => ({
          ...v,
          text: v.text.replace(/<[^>]*>/g, "").trim(),
        }))
      : data;
    return NextResponse.json(cleaned);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
