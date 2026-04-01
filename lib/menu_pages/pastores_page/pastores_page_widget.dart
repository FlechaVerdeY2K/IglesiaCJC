import 'package:cached_network_image/cached_network_image.dart';
import '/backend/firebase_service.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:flutter/material.dart';
import 'pastores_page_model.dart';
export 'pastores_page_model.dart';

class PastoresPageWidget extends StatefulWidget {
  const PastoresPageWidget({super.key});

  static String routeName = 'pastoresPage';
  static String routePath = '/pastoresPage';

  @override
  State<PastoresPageWidget> createState() => _PastoresPageWidgetState();
}

class _PastoresPageWidgetState extends State<PastoresPageWidget> {
  static const Color _bg = Color(0xFF050505);
  static const Color _surface = Color(0xFF171717);
  static const Color _accent = Color(0xFFE8D5B0);

  late PastoresPageModel _model;
  final scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => PastoresPageModel());
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
          'Pastores',
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
      body: StreamBuilder<List<Pastor>>(
        stream: FirebaseService.instance.pastoresStream(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(
                child: CircularProgressIndicator(color: _accent));
          }
          final pastores = snapshot.data ?? [];
          if (pastores.isEmpty) {
            return const Center(
              child: Text('Próximamente',
                  style: TextStyle(color: Colors.white54, fontSize: 16)),
            );
          }
          return ListView.separated(
            padding: const EdgeInsets.fromLTRB(20, 24, 20, 40),
            itemCount: pastores.length,
            separatorBuilder: (_, __) => const SizedBox(height: 16),
            itemBuilder: (context, i) =>
                _buildPastorCard(context, pastores[i]),
          );
        },
      ),
    );
  }

  Widget _buildPastorCard(BuildContext context, Pastor pastor) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: _surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF2B2B2B)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              // Avatar
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(36),
                  border: Border.all(color: _accent.withOpacity(0.4), width: 2),
                ),
                clipBehavior: Clip.antiAlias,
                child: pastor.fotoUrl != null && pastor.fotoUrl!.isNotEmpty
                    ? CachedNetworkImage(
                        imageUrl: pastor.fotoUrl!,
                        fit: BoxFit.cover,
                        errorWidget: (_, __, ___) => _buildAvatarFallback(pastor.nombre),
                      )
                    : _buildAvatarFallback(pastor.nombre),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      pastor.nombre,
                      style: const TextStyle(
                          color: Colors.white,
                          fontSize: 17,
                          fontWeight: FontWeight.w700),
                    ),
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 3),
                      decoration: BoxDecoration(
                        color: _accent.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                            color: _accent.withOpacity(0.3), width: 1),
                      ),
                      child: Text(
                        pastor.cargo,
                        style: const TextStyle(
                            color: _accent,
                            fontSize: 12,
                            fontWeight: FontWeight.w600),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          if (pastor.bio.isNotEmpty) ...[
            const SizedBox(height: 16),
            const Divider(color: Color(0xFF2B2B2B), height: 1),
            const SizedBox(height: 16),
            Text(
              pastor.bio,
              style: const TextStyle(
                  color: Color(0xFFB5B5B5), fontSize: 14, height: 1.6),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildAvatarFallback(String nombre) {
    final initials = nombre.isNotEmpty
        ? nombre.trim().split(' ').take(2).map((w) => w[0]).join()
        : '?';
    return Container(
      color: const Color(0xFF2B2B2B),
      child: Center(
        child: Text(initials.toUpperCase(),
            style: const TextStyle(
                color: _accent, fontSize: 24, fontWeight: FontWeight.w700)),
      ),
    );
  }
}
