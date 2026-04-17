import { supabase } from "@/lib/supabase";
import { unstable_cache } from "next/cache";

const API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;

export type LiveStatus = {
  isLive: boolean;
  videoId: string | null;
  title: string | null;
  thumbnail: string | null;
};

async function getLatestVideoIdFromRSS(channelId: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const xml = await res.text();
    const match = xml.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

async function checkIfVideoIsLive(
  videoId: string,
  apiKey: string
): Promise<{ isLive: boolean; title: string | null; thumbnail: string | null }> {
  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails&id=${videoId}&key=${apiKey}`,
      { cache: "no-store" }
    );
    if (!res.ok) return { isLive: false, title: null, thumbnail: null };
    const data = await res.json();
    if (data.error) return { isLive: false, title: null, thumbnail: null };
    const item = data.items?.[0];
    if (!item) return { isLive: false, title: null, thumbnail: null };
    return {
      isLive: item.snippet?.liveBroadcastContent === "live",
      title: item.snippet?.title ?? null,
      thumbnail: item.snippet?.thumbnails?.high?.url ?? null,
    };
  } catch {
    return { isLive: false, title: null, thumbnail: null };
  }
}

async function autoArchiveIfEnded(
  isLive: boolean,
  videoId: string | null,
  title: string | null
) {
  const { data: cfg } = await supabase
    .from("config_live")
    .select("auto_video_id, auto_titulo")
    .eq("id", 1)
    .single();

  if (isLive && videoId) {
    if (cfg?.auto_video_id !== videoId) {
      await supabase
        .from("config_live")
        .update({ auto_video_id: videoId, auto_titulo: title })
        .eq("id", 1);
    }
  } else {
    if (cfg?.auto_video_id) {
      const { data: existing } = await supabase
        .from("lives")
        .select("id")
        .eq("video_id", cfg.auto_video_id)
        .maybeSingle();

      if (!existing) {
        await supabase.from("lives").insert({
          video_id: cfg.auto_video_id,
          titulo: cfg.auto_titulo,
          fecha: new Date().toISOString(),
        });
      }

      await supabase
        .from("config_live")
        .update({ auto_video_id: null, auto_titulo: null })
        .eq("id", 1);
    }
  }
}

const fetchLiveStatusCached = unstable_cache(
  async (): Promise<LiveStatus & { _raw: { videoId: string | null; title: string | null; isLive: boolean } }> => {
    if (!API_KEY || !CHANNEL_ID) {
      return { isLive: false, videoId: null, title: null, thumbnail: null, _raw: { videoId: null, title: null, isLive: false } };
    }
    const videoId = await getLatestVideoIdFromRSS(CHANNEL_ID);
    if (!videoId) {
      return { isLive: false, videoId: null, title: null, thumbnail: null, _raw: { videoId: null, title: null, isLive: false } };
    }
    const { isLive, title, thumbnail } = await checkIfVideoIsLive(videoId, API_KEY);
    return {
      isLive,
      videoId: isLive ? videoId : null,
      title: isLive ? title : null,
      thumbnail: isLive ? thumbnail : null,
      _raw: { videoId, title, isLive },
    };
  },
  ["live-status"],
  { revalidate: 120 }
);

export async function getLiveStatus(): Promise<LiveStatus> {
  const result = await fetchLiveStatusCached();
  // Auto-archive runs after cache is built — fire-and-forget, doesn't block render
  void autoArchiveIfEnded(result._raw.isLive, result._raw.videoId, result._raw.title);
  const { _raw: _, ...status } = result;
  return status;
}
