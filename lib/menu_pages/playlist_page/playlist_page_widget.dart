import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:flutter/material.dart';
import 'playlist_page_model.dart';
export 'playlist_page_model.dart';

class _Cancion {
  final String titulo;
  final String artista;
  final String? videoId;
  final String categoria;

  const _Cancion(this.titulo, this.artista, {this.videoId, this.categoria = 'Adoración'});
}

class PlaylistPageWidget extends StatefulWidget {
  const PlaylistPageWidget({super.key});

  static String routeName = 'playlistPage';
  static String routePath = '/playlistPage';

  @override
  State<PlaylistPageWidget> createState() => _PlaylistPageWidgetState();
}

class _PlaylistPageWidgetState extends State<PlaylistPageWidget> {
  static const Color _bg       = Color(0xFF080E1E);
  static const Color _surface  = Color(0xFF0F1C30);
  static const Color _accent   = Color(0xFFBF1E2E);
  static const Color _muted    = Color(0xFF8FA3BF);
  static const Color _divider  = Color(0xFF1E2E4A);
  static const String _ytPlaylist =
      'https://www.youtube.com/playlist?list=PLHWMjKQNdSZjzCyXJZ_Fc7TLsvZLl9n1D';

  late PlaylistPageModel _model;
  final scaffoldKey = GlobalKey<ScaffoldState>();

  final List<_Cancion> _canciones = const [
    _Cancion('Playlist de la Iglesia', 'Iglesia CJC', categoria: 'Alabanza'),
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
      body: CustomScrollView(
        slivers: [
          // ── Hero AppBar ────────────────────────────────────────────────────
          SliverAppBar(
            expandedHeight: 220,
            pinned: true,
            backgroundColor: const Color(0xFF0D1628),
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_ios_rounded, color: Colors.white),
              onPressed: () => context.safePop(),
            ),
            flexibleSpace: FlexibleSpaceBar(
              titlePadding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              title: const Text(
                'Alabanza & Adoración',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 17,
                  fontWeight: FontWeight.w800,
                  letterSpacing: -0.3,
                ),
              ),
              background: Stack(
                fit: StackFit.expand,
                children: [
                  // Background gradiente musical
                  Container(
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          Color(0xFF3D0010),
                          Color(0xFF0D1628),
                          Color(0xFF080E1E),
                        ],
                        stops: [0.0, 0.6, 1.0],
                      ),
                    ),
                  ),
                  // Ícono decorativo grande
                  Positioned(
                    right: -20,
                    top: -10,
                    child: Icon(
                      Icons.music_note_rounded,
                      size: 180,
                      color: Colors.white.withOpacity(0.05),
                    ),
                  ),
                  // Info del repertorio
                  Positioned(
                    left: 20,
                    top: 70,
                    child: Row(
                      children: [
                        Container(
                          width: 72,
                          height: 72,
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [Color(0xFFBF1E2E), Color(0xFF7B1020)],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            borderRadius: BorderRadius.circular(16),
                            boxShadow: [
                              BoxShadow(
                                color: _accent.withOpacity(0.2),
                                blurRadius: 8,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: const Icon(Icons.music_note_rounded,
                              color: Colors.white, size: 38),
                        ),
                        const SizedBox(width: 16),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: _accent.withOpacity(0.2),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(
                                    color: _accent.withOpacity(0.4)),
                              ),
                              child: const Text(
                                'REPERTORIO OFICIAL',
                                style: TextStyle(
                                    color: _accent,
                                    fontSize: 9,
                                    fontWeight: FontWeight.w800,
                                    letterSpacing: 1.2),
                              ),
                            ),
                            const SizedBox(height: 6),
                            const Text(
                              'Iglesia CJC',
                              style: TextStyle(
                                  color: Colors.white70,
                                  fontSize: 13,
                                  fontWeight: FontWeight.w500),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // ── Botón YouTube ──────────────────────────────────────────────────
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 4),
              child: _YoutubeButton(onTap: () => launchURL(_ytPlaylist)),
            ),
          ),

          // ── Sección canciones ──────────────────────────────────────────────
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 24, 20, 8),
              child: Row(
                children: [
                  Container(
                    width: 3,
                    height: 16,
                    decoration: BoxDecoration(
                      color: _accent,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'CANCIONES (${_canciones.length})',
                    style: const TextStyle(
                        color: _muted,
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 1.5),
                  ),
                ],
              ),
            ),
          ),

          // ── Lista ──────────────────────────────────────────────────────────
          SliverList(
            delegate: SliverChildBuilderDelegate(
              (context, i) {
                final c = _canciones[i];
                return _CancionTile(
                  cancion: c,
                  index: i + 1,
                  onTap: c.videoId != null
                      ? () => launchURL(
                          'https://www.youtube.com/watch?v=${c.videoId}')
                      : () => launchURL(_ytPlaylist),
                );
              },
              childCount: _canciones.length,
            ),
          ),

          const SliverToBoxAdapter(child: SizedBox(height: 40)),
        ],
      ),
    );
  }
}

// ── YouTube CTA Button ──────────────────────────────────────────────────────
class _YoutubeButton extends StatelessWidget {
  final VoidCallback onTap;
  const _YoutubeButton({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 52,
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFFFF0000), Color(0xFFCC0000)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(14),
          boxShadow: [
            BoxShadow(
              color: Colors.red.withOpacity(0.15),
              blurRadius: 6,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.15),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.play_arrow_rounded,
                  color: Colors.white, size: 22),
            ),
            const SizedBox(width: 12),
            const Text(
              'Ver Repertorio en YouTube',
              style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w700,
                  fontSize: 15,
                  letterSpacing: 0.2),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Canción Tile ────────────────────────────────────────────────────────────
class _CancionTile extends StatelessWidget {
  final _Cancion cancion;
  final int index;
  final VoidCallback onTap;

  const _CancionTile({
    required this.cancion,
    required this.index,
    required this.onTap,
  });

  static const Color _bg      = Color(0xFF080E1E);
  static const Color _surface = Color(0xFF0F1C30);
  static const Color _accent  = Color(0xFFBF1E2E);
  static const Color _muted   = Color(0xFF8FA3BF);
  static const Color _divider = Color(0xFF1E2E4A);

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        splashColor: _accent.withOpacity(0.08),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
          child: Row(
            children: [
              // Número / índice
              SizedBox(
                width: 28,
                child: Text(
                  '$index',
                  style: TextStyle(
                      color: Colors.white.withOpacity(0.25),
                      fontSize: 13,
                      fontWeight: FontWeight.w600),
                  textAlign: TextAlign.center,
                ),
              ),
              const SizedBox(width: 12),
              // Thumbnail o ícono
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  color: _surface,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: _divider),
                ),
                child: cancion.videoId != null
                    ? ClipRRect(
                        borderRadius: BorderRadius.circular(9),
                        child: Image.network(
                          'https://img.youtube.com/vi/${cancion.videoId}/mqdefault.jpg',
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => const Icon(
                              Icons.music_note_rounded,
                              color: _accent),
                        ),
                      )
                    : const Icon(Icons.music_note_rounded,
                        color: _accent, size: 24),
              ),
              const SizedBox(width: 14),
              // Info
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      cancion.titulo,
                      style: const TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                          fontWeight: FontWeight.w600),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 3),
                    Row(
                      children: [
                        Text(
                          cancion.artista,
                          style: const TextStyle(
                              color: _muted, fontSize: 12),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: _accent.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            cancion.categoria,
                            style: const TextStyle(
                                color: _accent,
                                fontSize: 9,
                                fontWeight: FontWeight.w700,
                                letterSpacing: 0.5),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              // Play icon
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: _accent.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.play_arrow_rounded,
                    color: _accent, size: 20),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
