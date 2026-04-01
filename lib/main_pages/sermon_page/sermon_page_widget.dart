import 'package:cached_network_image/cached_network_image.dart';
import 'package:intl/intl.dart';
import '/backend/firebase_service.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:flutter/material.dart';
import 'sermon_page_model.dart';
export 'sermon_page_model.dart';

class SermonPageWidget extends StatefulWidget {
  const SermonPageWidget({super.key});

  static String routeName = 'sermonPage';
  static String routePath = '/sermonPage';

  @override
  State<SermonPageWidget> createState() => _SermonPageWidgetState();
}

class _SermonPageWidgetState extends State<SermonPageWidget> {
  static const Color _bg = Color(0xFF050505);
  static const Color _surface = Color(0xFF171717);
  static const Color _accent = Color(0xFFE8D5B0);
  static const String _playlistUrl =
      'https://www.youtube.com/@iglesiacjc217/playlists';

  late SermonPageModel _model;
  final scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => SermonPageModel());
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
          'Sermones',
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
        actions: [
          IconButton(
            onPressed: () => launchURL(_playlistUrl),
            icon: const Icon(Icons.open_in_new_rounded,
                color: Colors.white70, size: 22),
            tooltip: 'Ver canal',
          ),
        ],
      ),
      body: StreamBuilder<List<Sermon>>(
        stream: FirebaseService.instance.sermonesStream(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(
                child: CircularProgressIndicator(color: _accent));
          }
          if (snapshot.hasError) {
            return _buildEmpty('Error al cargar sermones');
          }
          final sermones = snapshot.data ?? [];
          if (sermones.isEmpty) {
            return _buildEmpty('Próximamente\ncargamos los sermones aquí');
          }
          return ListView.separated(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
            itemCount: sermones.length,
            separatorBuilder: (_, __) => const SizedBox(height: 12),
            itemBuilder: (context, i) => _buildSermonCard(context, sermones[i]),
          );
        },
      ),
    );
  }

  Widget _buildSermonCard(BuildContext context, Sermon sermon) {
    final thumbUrl =
        'https://img.youtube.com/vi/${sermon.videoId}/hqdefault.jpg';
    final videoUrl = 'https://www.youtube.com/watch?v=${sermon.videoId}';
    final fecha = DateFormat('d MMM yyyy', 'es').format(sermon.fecha);

    return GestureDetector(
      onTap: () => launchURL(videoUrl),
      child: Container(
        decoration: BoxDecoration(
          color: _surface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: const Color(0xFF2B2B2B)),
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Thumbnail
            Stack(
              children: [
                AspectRatio(
                  aspectRatio: 16 / 9,
                  child: CachedNetworkImage(
                    imageUrl: thumbUrl,
                    fit: BoxFit.cover,
                    errorWidget: (_, __, ___) => Container(
                      color: const Color(0xFF222222),
                      child: const Icon(Icons.play_circle_outline_rounded,
                          color: Colors.white38, size: 48),
                    ),
                  ),
                ),
                Positioned.fill(
                  child: Center(
                    child: Container(
                      width: 52,
                      height: 52,
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.55),
                        borderRadius: BorderRadius.circular(26),
                      ),
                      child: const Icon(Icons.play_arrow_rounded,
                          color: Colors.white, size: 34),
                    ),
                  ),
                ),
              ],
            ),
            // Info
            Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    sermon.titulo,
                    style: const TextStyle(
                        color: Colors.white,
                        fontSize: 15,
                        fontWeight: FontWeight.w600),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      if (sermon.predicador.isNotEmpty) ...[
                        const Icon(Icons.person_rounded,
                            color: Color(0xFFB5B5B5), size: 14),
                        const SizedBox(width: 4),
                        Text(sermon.predicador,
                            style: const TextStyle(
                                color: Color(0xFFB5B5B5), fontSize: 12)),
                        const SizedBox(width: 12),
                      ],
                      const Icon(Icons.calendar_today_rounded,
                          color: Color(0xFFB5B5B5), size: 14),
                      const SizedBox(width: 4),
                      Text(fecha,
                          style: const TextStyle(
                              color: Color(0xFFB5B5B5), fontSize: 12)),
                    ],
                  ),
                  if (sermon.descripcion.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Text(
                      sermon.descripcion,
                      style: const TextStyle(
                          color: Color(0xFF9A9A9A), fontSize: 13, height: 1.4),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmpty(String message) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.video_library_rounded,
                color: Colors.white24, size: 72),
            const SizedBox(height: 16),
            Text(
              message,
              textAlign: TextAlign.center,
              style: const TextStyle(
                  color: Color(0xFFB5B5B5), fontSize: 16, height: 1.5),
            ),
            const SizedBox(height: 24),
            OutlinedButton.icon(
              onPressed: () => launchURL(_playlistUrl),
              icon: const Icon(Icons.open_in_new_rounded, color: _accent),
              label: const Text('Ver canal de YouTube',
                  style: TextStyle(color: _accent)),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Color(0xFF2B2B2B)),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
