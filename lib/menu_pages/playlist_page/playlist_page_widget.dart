import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'package:flutter/material.dart';
import 'playlist_page_model.dart';
export 'playlist_page_model.dart';

/// Canción del repertorio de la iglesia
class _Cancion {
  final String titulo;
  final String artista;
  final String? videoId; // YouTube videoId, nullable

  const _Cancion(this.titulo, this.artista, [this.videoId]);
}

class PlaylistPageWidget extends StatefulWidget {
  const PlaylistPageWidget({super.key});

  static String routeName = 'playlistPage';
  static String routePath = '/playlistPage';

  @override
  State<PlaylistPageWidget> createState() => _PlaylistPageWidgetState();
}

class _PlaylistPageWidgetState extends State<PlaylistPageWidget> {
  static const Color _bg = Color(0xFF050505);
  static const Color _surface = Color(0xFF171717);
  static const Color _accent = Color(0xFFE8D5B0);
  static const Color _muted = Color(0xFFB5B5B5);
  static const Color _divider = Color(0xFF2B2B2B);

  late PlaylistPageModel _model;
  final scaffoldKey = GlobalKey<ScaffoldState>();

  // Repertorio de la iglesia — actualiza los videoId de YouTube cuando los tengas
  final List<_Cancion> _canciones = const [
    _Cancion('Playlist de la Iglesia', 'Iglesia CJC'),
  ];

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => PlaylistPageModel());
    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  @override
  void dispose() {
    _model.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: scaffoldKey,
      backgroundColor: _bg,
      appBar: AppBar(
        backgroundColor: const Color(0xFF1A1A1A),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_rounded, color: Colors.white),
          onPressed: () => context.safePop(),
        ),
        title: Text(
          'Playlist',
          style: FlutterFlowTheme.of(context).titleLarge.override(
                fontFamily: FlutterFlowTheme.of(context).titleLargeFamily,
                color: Colors.white,
                fontSize: 18.0,
                fontWeight: FontWeight.w700,
                letterSpacing: 0.0,
                useGoogleFonts:
                    !FlutterFlowTheme.of(context).titleLargeIsCustom,
              ),
        ),
        centerTitle: true,
      ),
      body: Column(
        children: [
          // Header banner
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  _accent.withOpacity(0.15),
                  Colors.transparent,
                ],
              ),
            ),
            child: Row(
              children: [
                Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    color: _accent.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.music_note_rounded,
                      color: _accent, size: 36),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text('Repertorio IglesiaCJC',
                          style: TextStyle(
                              color: Colors.white,
                              fontSize: 17,
                              fontWeight: FontWeight.w700)),
                      SizedBox(height: 4),
                      Text('Canciones de alabanza y adoración',
                          style: TextStyle(color: _muted, fontSize: 13)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const Divider(color: _divider, height: 1),

          // Botón ir a la playlist completa en YouTube
          Padding(
            padding:
                const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            child: FFButtonWidget(
              onPressed: () => launchURL(
                  'https://www.youtube.com/@iglesiacjc217/playlists'),
              text: 'Ver playlists en YouTube',
              icon: const Icon(Icons.play_circle_outline_rounded,
                  size: 20, color: Colors.white),
              options: FFButtonOptions(
                width: double.infinity,
                height: 48,
                color: const Color(0xFFFF0000).withOpacity(0.85),
                textStyle: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w600,
                    fontSize: 15),
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),

          const Divider(color: _divider, height: 1),

          // Lista de canciones
          Expanded(
            child: _canciones.isEmpty
                ? const Center(
                    child: Text('El repertorio llegará pronto',
                        style: TextStyle(color: _muted)))
                : ListView.separated(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    itemCount: _canciones.length,
                    separatorBuilder: (_, __) =>
                        const Divider(color: _divider, height: 1, indent: 72),
                    itemBuilder: (context, i) {
                      final c = _canciones[i];
                      return ListTile(
                        contentPadding: const EdgeInsets.symmetric(
                            horizontal: 20, vertical: 6),
                        leading: Container(
                          width: 48,
                          height: 48,
                          decoration: BoxDecoration(
                            color: _surface,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: _divider),
                          ),
                          child: c.videoId != null
                              ? ClipRRect(
                                  borderRadius: BorderRadius.circular(7),
                                  child: Image.network(
                                    'https://img.youtube.com/vi/${c.videoId}/default.jpg',
                                    fit: BoxFit.cover,
                                    errorBuilder: (_, __, ___) => const Icon(
                                        Icons.music_note_rounded,
                                        color: _accent),
                                  ),
                                )
                              : const Icon(Icons.music_note_rounded,
                                  color: _accent),
                        ),
                        title: Text(
                          c.titulo,
                          style: const TextStyle(
                              color: Colors.white,
                              fontSize: 15,
                              fontWeight: FontWeight.w500),
                        ),
                        subtitle: Text(c.artista,
                            style: const TextStyle(
                                color: _muted, fontSize: 12)),
                        trailing: c.videoId != null
                            ? IconButton(
                                icon: const Icon(Icons.play_arrow_rounded,
                                    color: _accent),
                                onPressed: () => launchURL(
                                    'https://www.youtube.com/watch?v=${c.videoId}'),
                              )
                            : null,
                        onTap: c.videoId != null
                            ? () => launchURL(
                                'https://www.youtube.com/watch?v=${c.videoId}')
                            : null,
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
