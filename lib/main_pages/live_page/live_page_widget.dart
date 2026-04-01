import 'package:cached_network_image/cached_network_image.dart';
import '/backend/firebase_service.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:flutter/material.dart';
import 'live_page_model.dart';
export 'live_page_model.dart';

/// Los En Vivos
class LivePageWidget extends StatefulWidget {
  const LivePageWidget({super.key});

  static String routeName = 'livePage';
  static String routePath = '/livePage';

  @override
  State<LivePageWidget> createState() => _LivePageWidgetState();
}

class _LivePageWidgetState extends State<LivePageWidget> {
  static const Color _bg = Color(0xFF050505);
  static const Color _surface = Color(0xFF171717);
  static const Color _accent = Color(0xFFE8D5B0);
  static const String _channelLiveUrl =
      'https://www.youtube.com/@iglesiacjc217/live';

  late LivePageModel _model;
  final scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => LivePageModel());
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
          'En Vivo',
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
      body: FutureBuilder<LiveConfig?>(
        future: FirebaseService.instance.getLiveConfig(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(
              child: CircularProgressIndicator(color: _accent),
            );
          }
          final live = snapshot.data;
          if (live != null && live.activo && live.videoId.isNotEmpty) {
            return _buildLivePlayer(context, live);
          }
          return _buildNoLive(context);
        },
      ),
    );
  }

  Widget _buildLivePlayer(BuildContext context, LiveConfig live) {
    final thumbUrl =
        'https://img.youtube.com/vi/${live.videoId}/maxresdefault.jpg';
    final videoUrl = 'https://www.youtube.com/watch?v=${live.videoId}';

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // ── Thumbnail con overlay EN VIVO ──
          Stack(
            children: [
              AspectRatio(
                aspectRatio: 16 / 9,
                child: CachedNetworkImage(
                  imageUrl: thumbUrl,
                  fit: BoxFit.cover,
                  errorWidget: (_, __, ___) => Container(
                    color: _surface,
                    child: const Icon(Icons.video_library_rounded,
                        color: Colors.white38, size: 64),
                  ),
                ),
              ),
              Positioned.fill(
                child: Container(
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [Color(0x00000000), Color(0xCC000000)],
                    ),
                  ),
                ),
              ),
              Positioned(
                top: 12,
                left: 12,
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: Colors.red,
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.circle, color: Colors.white, size: 8),
                      SizedBox(width: 5),
                      Text('EN VIVO',
                          style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w700,
                              fontSize: 12,
                              letterSpacing: 0.5)),
                    ],
                  ),
                ),
              ),
              Positioned.fill(
                child: Center(
                  child: GestureDetector(
                    onTap: () => launchURL(videoUrl),
                    child: Container(
                      width: 68,
                      height: 68,
                      decoration: BoxDecoration(
                        color: Colors.red.withOpacity(0.92),
                        borderRadius: BorderRadius.circular(34),
                        boxShadow: [
                          BoxShadow(
                              color: Colors.black.withOpacity(0.4),
                              blurRadius: 12)
                        ],
                      ),
                      child: const Icon(Icons.play_arrow_rounded,
                          color: Colors.white, size: 44),
                    ),
                  ),
                ),
              ),
            ],
          ),
          // ── Info ──
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                if (live.titulo.isNotEmpty)
                  Text(
                    live.titulo,
                    style: const TextStyle(
                        color: Colors.white,
                        fontSize: 19,
                        fontWeight: FontWeight.w700),
                  ),
                if (live.descripcion.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Text(
                    live.descripcion,
                    style: const TextStyle(
                        color: Color(0xFFB5B5B5), fontSize: 14, height: 1.55),
                  ),
                ],
                const SizedBox(height: 20),
                FilledButton.icon(
                  onPressed: () => launchURL(videoUrl),
                  icon: const Icon(Icons.open_in_new_rounded),
                  label: const Text('Ver en YouTube'),
                  style: FilledButton.styleFrom(
                    backgroundColor: Colors.red,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNoLive(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const SizedBox(height: 32),
          Center(
            child: Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                color: _surface,
                borderRadius: BorderRadius.circular(50),
                border: Border.all(color: const Color(0xFF2B2B2B)),
              ),
              child: const Icon(Icons.live_tv_rounded,
                  color: Colors.white38, size: 52),
            ),
          ),
          const SizedBox(height: 24),
          const Text(
            'No hay transmisión\nen vivo ahora',
            textAlign: TextAlign.center,
            style: TextStyle(
                color: Colors.white, fontSize: 22, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 12),
          const Text(
            'Los domingos transmitimos nuestros servicios en vivo.\nSíguenos en YouTube para recibir notificaciones.',
            textAlign: TextAlign.center,
            style: TextStyle(
                color: Color(0xFFB5B5B5), fontSize: 15, height: 1.55),
          ),
          const SizedBox(height: 32),
          _buildScheduleTile('Domingo', 'Servicio Principal', '10:00 AM'),
          const SizedBox(height: 10),
          _buildScheduleTile('Miércoles', 'Servicio Intermedio', '7:30 PM'),
          const SizedBox(height: 32),
          FilledButton.icon(
            onPressed: () => launchURL(_channelLiveUrl),
            icon: const Icon(Icons.play_circle_filled_rounded),
            label: const Text('Ir al Canal de YouTube'),
            style: FilledButton.styleFrom(
              backgroundColor: Colors.red,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
            ),
          ),
          const SizedBox(height: 12),
          OutlinedButton.icon(
            onPressed: () =>
                launchURL('https://www.youtube.com/@iglesiacjc217'),
            icon: const Icon(Icons.subscriptions_rounded, color: _accent),
            label: const Text('Ver transmisiones pasadas',
                style: TextStyle(color: _accent)),
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: Color(0xFF2B2B2B)),
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildScheduleTile(String dia, String nombre, String hora) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: _surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF2B2B2B)),
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: const Color(0xFF272727),
              borderRadius: BorderRadius.circular(22),
            ),
            child: const Icon(Icons.schedule_rounded, color: _accent, size: 22),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(nombre,
                    style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                        fontSize: 15)),
                const SizedBox(height: 2),
                Text('$dia — $hora',
                    style: const TextStyle(
                        color: Color(0xFFB5B5B5), fontSize: 13)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
