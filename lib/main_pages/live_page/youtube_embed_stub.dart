import 'package:flutter/material.dart';
import 'package:youtube_player_iframe/youtube_player_iframe.dart';

final _controllers = <String, YoutubePlayerController>{};

Widget buildYoutubeEmbed(String videoId) {
  final ctrl = _controllers.putIfAbsent(
    videoId,
    () => YoutubePlayerController.fromVideoId(
      videoId: videoId,
      autoPlay: false,
      params: const YoutubePlayerParams(
        showFullscreenButton: true,
        showControls: true,
      ),
    ),
  );
  return YoutubePlayer(controller: ctrl);
}
