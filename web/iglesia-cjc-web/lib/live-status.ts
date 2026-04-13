import { supabase } from "@/lib/supabase";

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
      { next: { revalidate: 120 } }
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
      { next: { revalidate: 120 } }
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
  // Obtener estado previo guardado
  const { data: cfg } = await supabase
    .from("config_live")
    .select("auto_video_id, auto_titulo")
    .eq("id", 1)
    .single();

  if (isLive && videoId) {
    // Si hay un live activo y cambió el video, actualizar
    if (cfg?.auto_video_id !== videoId) {
      await supabase
        .from("config_live")
        .update({ auto_video_id: videoId, auto_titulo: title })
        .eq("id", 1);
    }
  } else {
    // No hay live — si había uno guardado, archivarlo
    if (cfg?.auto_video_id) {
      // Verificar que no esté ya archivado
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

      // Limpiar estado
      await supabase
        .from("config_live")
        .update({ auto_video_id: null, auto_titulo: null })
        .eq("id", 1);
    }
  }
}

export async function getLiveStatus(): Promise<LiveStatus> {
  if (!API_KEY || !CHANNEL_ID) {
    return { isLive: false, videoId: null, title: null, thumbnail: null };
  }
  try {
    const videoId = await getLatestVideoIdFromRSS(CHANNEL_ID);
    if (!videoId) {
      await autoArchiveIfEnded(false, null, null);
      return { isLive: false, videoId: null, title: null, thumbnail: null };
    }

    const { isLive, title, thumbnail } = await checkIfVideoIsLive(videoId, API_KEY);
    await autoArchiveIfEnded(isLive, isLive ? videoId : null, isLive ? title : null);

    if (!isLive) return { isLive: false, videoId: null, title: null, thumbnail: null };
    return { isLive: true, videoId, title, thumbnail };
  } catch {
    return { isLive: false, videoId: null, title: null, thumbnail: null };
  }
}
