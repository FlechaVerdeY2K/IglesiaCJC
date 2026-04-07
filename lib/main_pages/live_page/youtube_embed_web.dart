// ignore: avoid_web_libraries_in_flutter
import 'dart:html' as html;
import 'dart:ui_web' as ui_web;
import 'package:flutter/material.dart';

final _registeredIds = <String>{};

Widget buildYoutubeEmbed(String videoId) {
  final viewType = 'yt-$videoId';
  if (!_registeredIds.contains(viewType)) {
    _registeredIds.add(viewType);
    ui_web.platformViewRegistry.registerViewFactory(viewType, (int id) {
      return html.IFrameElement()
        ..src =
            'https://www.youtube.com/embed/$videoId?rel=0&playsinline=1&enablejsapi=1'
        ..allowFullscreen = true
        ..setAttribute(
          'allow',
          'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
        )
        ..style.border = 'none'
        ..style.width = '100%'
        ..style.height = '100%';
    });
  }
  return HtmlElementView(viewType: viewType);
}
