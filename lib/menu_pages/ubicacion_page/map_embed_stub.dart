import 'package:flutter/material.dart';

Widget buildMapEmbed() {
  return Container(
    color: const Color(0xFF0A1628),
    child: const Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.map_rounded, color: Color(0xFF1E2E4A), size: 48),
          SizedBox(height: 8),
          Text('Abre la app de mapas para ver la ubicación',
              style: TextStyle(color: Color(0xFF4A6A8A), fontSize: 13)),
        ],
      ),
    ),
  );
}
