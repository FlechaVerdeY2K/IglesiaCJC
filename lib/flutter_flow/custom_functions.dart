import 'dart:convert';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:timeago/timeago.dart' as timeago;
import 'lat_lng.dart';
import 'place.dart';
import 'uploaded_file.dart';

int? calcTodayIndex(
  int listLength,
  int? offsetDays,
) {
  /// Devuelve un índice 0..listLength-1 basado en el día actual.
  /// - listLength: tamaño de tu lista (p.ej. FFAppState().verseIDs.length)
  /// - offsetDays: corrimiento opcional (p.ej. para cambiar la semilla o zona)

  // Evita divisiones por cero o listas vacías
  if (listLength <= 0) return 0;

  // BASE local (no UTC). Puedes cambiar la fecha si quieres otra semilla.
  final baseLocalMidnight = DateTime(2025, 1, 1);

  // "Hoy" normalizado a medianoche LOCAL (00:00).
  final now = DateTime.now();
  final todayLocalMidnight = DateTime(now.year, now.month, now.day);

  // Diferencia de días entre medianoches locales (estable todo el día).
  int days = todayLocalMidnight.difference(baseLocalMidnight).inDays;

  // Corrimiento opcional
  days += (offsetDays ?? 0);

  // Módulo seguro en rango [0, listLength-1]
  final int r = days % listLength;
  return (r < 0) ? r + listLength : r;
}

/// Devuelve el elemento de `items` correspondiente al índice del día.
/// Si la lista está vacía, devuelve ''.
String pickByDay(List<String> items, {int? offsetDays}) {
  if (items.isEmpty) return '';
  final idx = calcTodayIndex(items.length, offsetDays ?? 0) ?? 0;
  return items[idx];
}

String? cleanBibleHtml(String? html) {
  if (html == null || html.isEmpty) return null;

  var text = html;

  // 1) Quita spans de números de verso: <span class="v">33</span>
  text = text.replaceAll(
    RegExp(r'<span[^>]*class="v"[^>]*>.*?<\/span>',
        multiLine: true, caseSensitive: false, dotAll: true),
    '',
  );

  // 2) Elimina TODAS las etiquetas HTML restantes
  text = text.replaceAll(
    RegExp(r'<[^>]+>', multiLine: true, dotAll: true),
    ' ',
  );

  // 3) Decodifica entidades HTML comunes
  final replacements = <String, String>{
    '&nbsp;': ' ',
    '&amp;': '&',
    '&quot;': '"',
    '&#34;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&lt;': '<',
    '&gt;': '>',
    '&ldquo;': '“',
    '&rdquo;': '”',
    '&lsquo;': '`',
    '&rsquo;': '`',
    '&hellip;': '…',
  };
  replacements.forEach((k, v) => text = text.replaceAll(k, v));

  // 4) Colapsa espacios y recorta
  text = text.replaceAll(RegExp(r'\s+'), ' ').trim();

  return text.isEmpty ? null : text;
}

String? formatVerseForShare(
  String? plainText,
  String? bibleReference,
) {
  if (plainText!.trim().isEmpty || bibleReference!.trim().isEmpty) return '';

  final body = plainText.trim();
  final ref = bibleReference.trim();

  return '“$body”\n— $ref\n\nCompartido desde la app Iglesia CJC';
}
