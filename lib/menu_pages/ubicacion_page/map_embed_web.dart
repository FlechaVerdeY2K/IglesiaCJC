// ignore: avoid_web_libraries_in_flutter
import 'dart:html' as html;
import 'dart:ui_web' as ui_web;
import 'package:flutter/material.dart';

bool _registered = false;

Widget buildMapEmbed() {
  const viewType = 'osm-map-iglesia-cjc';
  if (!_registered) {
    _registered = true;
    ui_web.platformViewRegistry.registerViewFactory(viewType, (int id) {
      return html.IFrameElement()
        ..src =
            'https://www.openstreetmap.org/export/embed.html'
            '?bbox=-84.060348,9.942379,-84.040348,9.962379'
            '&layer=mapnik'
            '&marker=9.952379,-84.050348'
        ..style.border = 'none'
        ..style.width = '100%'
        ..style.height = '100%'
        ..setAttribute('allowfullscreen', 'true');
    });
  }
  return const HtmlElementView(viewType: viewType);
}
