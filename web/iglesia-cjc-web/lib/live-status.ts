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

type LiveHit = { videoId: string; title: string | null; thumbnail: string | null } | null;

async function searchLiveOnChannel(channelId: string, apiKey: string): Promise<LiveHit> {
  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=live&type=video&maxResults=1&key=${apiKey}`,
      { cache: "no-store" }
    );
    if (!res.ok) {
      console.error("[live-status] search.list http fail:", res.status, await res.text().catch(() => ""));
      return null;
    }
    const data = await res.json();
    if (data.error) {
      console.error("[live-status] search.list api error:", data.error.code, data.error.message);
      return null;
    }
    const item = data.items?.[0];
    if (!item?.id?.videoId) return null;
    return {
      videoId: item.id.videoId,
      title: item.snippet?.title ?? null,
      thumbnail: item.snippet?.thumbnails?.high?.url ?? null,
    };
  } catch (e) {
    console.error("[live-status] search.list exception:", e);
    return null;
  }
}

async function verifyStillLive(videoId: string, apiKey: string): Promise<LiveHit> {
  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.error) {
      console.error("[live-status] videos.list verify error:", data.error.message);
      return null;
    }
    const item = data.items?.[0];
    if (!item) return null;
    if (item.snippet?.liveBroadcastContent !== "live") return null;
    return {
      videoId,
      title: item.snippet?.title ?? null,
      thumbnail: item.snippet?.thumbnails?.high?.url ?? null,
    };
  } catch (e) {
    console.error("[live-status] videos.list verify exception:", e);
    return null;
  }
}

async function autoArchiveIfEnded(isLive: boolean, videoId: string | null, title: string | null) {
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
      console.error("[live-status] missing env vars", { hasKey: !!API_KEY, hasChannel: !!CHANNEL_ID });
      return { isLive: false, videoId: null, title: null, thumbnail: null, _raw: { videoId: null, title: null, isLive: false } };
    }

    const hit = await searchLiveOnChannel(CHANNEL_ID, API_KEY);
    if (!hit) {
      return { isLive: false, videoId: null, title: null, thumbnail: null, _raw: { videoId: null, title: null, isLive: false } };
    }

    const verified = await verifyStillLive(hit.videoId, API_KEY);
    if (!verified) {
      return { isLive: false, videoId: null, title: null, thumbnail: null, _raw: { videoId: hit.videoId, title: hit.title, isLive: false } };
    }

    return {
      isLive: true,
      videoId: verified.videoId,
      title: verified.title,
      thumbnail: verified.thumbnail,
      _raw: { videoId: verified.videoId, title: verified.title, isLive: true },
    };
  },
  ["live-status"],
  { revalidate: 180 }
);

export async function getLiveStatus(): Promise<LiveStatus> {
  const result = await fetchLiveStatusCached();
  void autoArchiveIfEnded(result._raw.isLive, result._raw.videoId, result._raw.title);
  const { _raw: _, ...status } = result;
  return status;
}
