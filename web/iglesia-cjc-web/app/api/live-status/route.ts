import { NextResponse } from "next/server";

const API_KEY = process.env.YOUTUBE_API_KEY!;
const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID!;

export const revalidate = 60; // cache 60 seconds

export async function GET() {
  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=id,snippet&channelId=${CHANNEL_ID}&type=video&eventType=live&key=${API_KEY}`,
      { next: { revalidate: 60 } }
    );

    if (!res.ok) {
      return NextResponse.json({ isLive: false, videoId: null, title: null });
    }

    const data = await res.json();
    const item = data.items?.[0];

    if (!item) {
      return NextResponse.json({ isLive: false, videoId: null, title: null });
    }

    return NextResponse.json({
      isLive: true,
      videoId: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails?.high?.url ?? null,
    });
  } catch {
    return NextResponse.json({ isLive: false, videoId: null, title: null });
  }
}
