import 'package:cached_network_image/cached_network_image.dart';
import '/backend/supabase_service.dart';
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
  static const Color _bg      = Color(0xFF080E1E);
  static const Color _surface = Color(0xFF0F1C30);
  static const Color _border  = Color(0xFF1E2E4A);
  static const Color _muted   = Color(0xFFB5B5B5);

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

  // ── Classify cargo ────────────────────────────────────────────────────────
  bool _isAnciano(String cargo) =>
      cargo.toLowerCase().contains('ancian');

  // ── Role pill colors ──────────────────────────────────────────────────────
  Color _roleBg(String cargo) =>
      _isAnciano(cargo) ? const Color(0xFF1F1600) : const Color(0xFF0A1628);

  Color _roleBorder(String cargo) =>
      _isAnciano(cargo) ? const Color(0xFF3D2900) : const Color(0xFF1A2E48);

  Color _roleText(String cargo) =>
      _isAnciano(cargo) ? const Color(0xFFD4A017) : const Color(0xFF7EB8F7);

  Color _avatarRing(String cargo) =>
      _isAnciano(cargo)
          ? const Color(0xFFD4A017).withOpacity(0.35)
          : const Color(0xFF7EB8F7).withOpacity(0.25);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: scaffoldKey,
      backgroundColor: _bg,
      appBar: AppBar(
        backgroundColor: const Color(0xFF0D1628),
        elevation: 0,
        toolbarHeight: 56,
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
        stream: SupabaseService.instance.pastoresStream(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(
                child: CircularProgressIndicator(
                    color: Color(0xFFD4A017), strokeWidth: 2));
          }
          final pastores = snapshot.data ?? [];
          if (pastores.isEmpty) {
            return const Center(
              child: Text('Próximamente',
                  style: TextStyle(color: Colors.white38, fontSize: 15)),
            );
          }

          final ancianos = pastores.where((p) => _isAnciano(p.cargo)).toList();
          final generales = pastores.where((p) => !_isAnciano(p.cargo)).toList();

          return SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(20, 24, 20, 48),
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 900),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [

                    // ── Intro ─────────────────────────────────────────────────
                    const Text(
                      'Liderazgo\npastoral',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 26,
                        fontWeight: FontWeight.w800,
                        height: 1.2,
                      ),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'Conocé a quienes guían y sirven a nuestra iglesia.',
                      style: TextStyle(color: Color(0xFF7A9ABF), fontSize: 14),
                    ),
                    const SizedBox(height: 28),

                    // ── Pastores Generales ────────────────────────────────────
                    if (generales.isNotEmpty) ...[
                      _sectionLabel('PASTORES GENERALES'),
                      const SizedBox(height: 12),
                      ...generales.map((p) => Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: _buildPastorCard(p),
                          )),
                      const SizedBox(height: 16),
                    ],

                    // ── Pastores Ancianos ────────────────────────────────────
                    if (ancianos.isNotEmpty) ...[
                      _sectionLabel('PASTORES ANCIANOS'),
                      const SizedBox(height: 12),
                      ...ancianos.map((p) => Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: _buildPastorCard(p),
                          )),
                    ],
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildPastorCard(Pastor pastor) {
    final ringColor = _avatarRing(pastor.cargo);

    return Container(
      decoration: BoxDecoration(
        color: _surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: _border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Header row ──────────────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                // Avatar
                Container(
                  width: 68,
                  height: 68,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: ringColor, width: 2.5),
                  ),
                  child: ClipOval(
                    child: pastor.fotoUrl != null &&
                            pastor.fotoUrl!.isNotEmpty
                        ? CachedNetworkImage(
                            imageUrl: pastor.fotoUrl!,
                            fit: BoxFit.cover,
                            errorWidget: (_, __, ___) =>
                                _avatarFallback(pastor.nombre, pastor.cargo),
                          )
                        : _avatarFallback(pastor.nombre, pastor.cargo),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        pastor.nombre,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          height: 1.2,
                        ),
                      ),
                      const SizedBox(height: 6),
                      // Wrap for multi-badge cargos (e.g. "Pastora Anciana · Líder de Jóvenes")
                      Wrap(
                        spacing: 6,
                        runSpacing: 4,
                        children: _buildCargoBadges(pastor.cargo),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // ── Bio ──────────────────────────────────────────────────────────
          if (pastor.bio.isNotEmpty) ...[
            Divider(height: 1, color: _border),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 14, 16, 16),
              child: Text(
                pastor.bio,
                style: const TextStyle(
                  color: _muted,
                  fontSize: 13,
                  height: 1.65,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  /// Splits "Pastora Anciana · Líder de Jóvenes CJC" into multiple pills
  List<Widget> _buildCargoBadges(String cargo) {
    final parts = cargo.split(RegExp(r'[·•/]'));
    return parts.map((part) {
      final label = part.trim();
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3),
        decoration: BoxDecoration(
          color: _roleBg(label),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: _roleBorder(label)),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: _roleText(label),
            fontSize: 11,
            fontWeight: FontWeight.w600,
          ),
        ),
      );
    }).toList();
  }

  Widget _avatarFallback(String nombre, String cargo) {
    final initials = nombre.isNotEmpty
        ? nombre.trim().split(' ').take(2).map((w) => w[0]).join()
        : '?';
    final bg = _isAnciano(cargo)
        ? const Color(0xFF241900)
        : const Color(0xFF0A1830);
    final fg = _roleText(cargo);
    return Container(
      color: bg,
      alignment: Alignment.center,
      child: Text(
        initials.toUpperCase(),
        style: TextStyle(
          color: fg,
          fontSize: 22,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }

  Widget _sectionLabel(String label) {
    return Text(
      label,
      style: const TextStyle(
        color: Color(0xFF4A6A8A),
        fontSize: 11,
        fontWeight: FontWeight.w700,
        letterSpacing: 1.2,
      ),
    );
  }
}
