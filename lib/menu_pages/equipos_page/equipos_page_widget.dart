import '/backend/supabase_service.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/backend/auth_service.dart';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'equipos_page_model.dart';
export 'equipos_page_model.dart';

class EquiposPageWidget extends StatefulWidget {
  const EquiposPageWidget({super.key});

  static String routeName = 'equiposPage';
  static String routePath = '/equiposPage';

  @override
  State<EquiposPageWidget> createState() => _EquiposPageWidgetState();
}

class _EquiposPageWidgetState extends State<EquiposPageWidget> {
  static const Color _bg      = Color(0xFF080E1E);
  static const Color _surface = Color(0xFF0F1C30);
  static const Color _border  = Color(0xFF1E2E4A);
  static const Color _muted   = Color(0xFFB5B5B5);

  late EquiposPageModel _model;
  final scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => EquiposPageModel());
    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  @override
  void dispose() {
    _model.dispose();
    super.dispose();
  }

  // ── Icono + color por tipo ────────────────────────────────────────────────
  (IconData, Color) _iconAndColor(String? name) {
    switch (name) {
      case 'welcome':
        return (Icons.waving_hand_rounded,    const Color(0xFF4CAF50));
      case 'sound':
        return (Icons.speaker_rounded,        const Color(0xFF7EB8F7));
      case 'music':
        return (Icons.music_note_rounded,     const Color(0xFFB07FD4));
      case 'prayer':
        return (Icons.volunteer_activism_rounded, const Color(0xFFBF1E2E));
      case 'kids':
        return (Icons.child_care_rounded,     const Color(0xFFD4A017));
      case 'youth':
        return (Icons.groups_rounded,         const Color(0xFF7EB8F7));
      case 'media':
        return (Icons.camera_alt_rounded,     const Color(0xFF4FC3F7));
      case 'missions':
        return (Icons.public_rounded,         const Color(0xFF4CAF50));
      default:
        return (Icons.people_alt_rounded,     const Color(0xFF7A9ABF));
    }
  }

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
          'Equipos',
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
      body: StreamBuilder<List<Equipo>>(
        stream: SupabaseService.instance.equiposStream(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(
                child: CircularProgressIndicator(
                    color: Color(0xFFBF1E2E), strokeWidth: 2));
          }
          final equipos = snapshot.data ?? [];
          if (equipos.isEmpty) {
            return const Center(
              child: Text('Próximamente',
                  style: TextStyle(color: Colors.white38, fontSize: 15)),
            );
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(20, 24, 20, 48),
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 900),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [

                    // ── Header ───────────────────────────────────────────────
                    const Text(
                      'Equipos de\nministerio',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 26,
                        fontWeight: FontWeight.w800,
                        height: 1.2,
                      ),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'Sirve junto a nosotros en el ministerio que Dios puso en tu corazón.',
                      style: TextStyle(color: Color(0xFF7A9ABF), fontSize: 14),
                    ),
                    const SizedBox(height: 28),

                    // ── Lista ────────────────────────────────────────────────
                    ...equipos.map((e) => Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: _buildEquipoCard(e),
                        )),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildEquipoCard(Equipo equipo) {
    final (icon, color) = _iconAndColor(equipo.iconName);

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () => _showDetail(equipo, icon, color),
        borderRadius: BorderRadius.circular(14),
        splashColor: color.withOpacity(0.08),
        highlightColor: color.withOpacity(0.04),
        child: Ink(
          decoration: BoxDecoration(
            color: _surface,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: _border),
          ),
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ── Icono coloreado ───────────────────────────────────────
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.10),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: color.withOpacity(0.2)),
                  ),
                  alignment: Alignment.center,
                  child: Icon(icon, color: color, size: 22),
                ),
                const SizedBox(width: 14),

                // ── Contenido ─────────────────────────────────────────────
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        equipo.nombre,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          height: 1.2,
                        ),
                      ),
                      if (equipo.lider.isNotEmpty) ...[
                        const SizedBox(height: 5),
                        Row(
                          children: [
                            Icon(Icons.person_rounded,
                                color: color.withOpacity(0.7), size: 13),
                            const SizedBox(width: 4),
                            Text(
                              equipo.lider,
                              style: TextStyle(
                                color: color.withOpacity(0.85),
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ],
                      if (equipo.descripcion.isNotEmpty) ...[
                        const SizedBox(height: 7),
                        Text(
                          equipo.descripcion,
                          style: const TextStyle(
                              color: _muted, fontSize: 13, height: 1.55),
                        ),
                      ],
                    ],
                  ),
                ),

                // ── Chevron ───────────────────────────────────────────────
                Padding(
                  padding: const EdgeInsets.only(top: 2),
                  child: Icon(Icons.chevron_right_rounded,
                      color: color.withOpacity(0.55), size: 20),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showDetail(Equipo equipo, IconData icon, Color color) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _EquipoDetailSheet(
        equipo: equipo,
        icon: icon,
        color: color,
      ),
    );
  }
}

// ── Detail Sheet ──────────────────────────────────────────────────────────────
class _EquipoDetailSheet extends StatefulWidget {
  final Equipo equipo;
  final IconData icon;
  final Color color;

  const _EquipoDetailSheet({
    required this.equipo,
    required this.icon,
    required this.color,
  });

  @override
  State<_EquipoDetailSheet> createState() => _EquipoDetailSheetState();
}

class _EquipoDetailSheetState extends State<_EquipoDetailSheet> {
  static const Color _bg    = Color(0xFF0F1C30);
  static const Color _muted = Color(0xFFB5B5B5);

  EquipoSolicitud? _solicitud;
  bool _loading = true;
  bool _sending = false;
  bool _isAdmin = false;

  @override
  void initState() {
    super.initState();
    _loadSolicitud();
    SupabaseService.instance.isAdmin.then((v) {
      if (mounted) setState(() => _isAdmin = v);
    });
  }

  Future<void> _loadSolicitud() async {
    final s = await SupabaseService.instance.miSolicitudPorEquipo(widget.equipo.id);
    if (mounted) setState(() { _solicitud = s; _loading = false; });
  }

  Future<void> _enviarSolicitud() async {
    setState(() => _sending = true);
    final error = await SupabaseService.instance.enviarSolicitudEquipo(
      equipoId: widget.equipo.id,
      equipoNombre: widget.equipo.nombre,
    );
    if (!mounted) return;
    if (error != null) {
      setState(() => _sending = false);
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(error),
        backgroundColor: Colors.redAccent,
      ));
    } else {
      await _loadSolicitud();
      setState(() => _sending = false);
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text('¡Solicitud enviada! El admin revisará tu petición.'),
        backgroundColor: Color(0xFF40C072),
      ));
    }
  }

  @override
  Widget build(BuildContext context) {
    final isLoggedIn = AuthService.instance.currentUser != null;

    return Container(
      decoration: const BoxDecoration(
        color: _bg,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.88,
      ),
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Handle
            Center(
              child: Container(
                width: 36, height: 4,
                decoration: BoxDecoration(
                  color: Colors.white24,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Icon + nombre
            Row(
              children: [
                Container(
                  width: 56, height: 56,
                  decoration: BoxDecoration(
                    color: widget.color.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: widget.color.withOpacity(0.25)),
                  ),
                  alignment: Alignment.center,
                  child: Icon(widget.icon, color: widget.color, size: 26),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Text(
                    widget.equipo.nombre,
                    style: const TextStyle(
                      color: Colors.white, fontSize: 20,
                      fontWeight: FontWeight.w800, height: 1.2,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Líder
            if (widget.equipo.lider.isNotEmpty) ...[
              Row(children: [
                Icon(Icons.person_rounded, color: widget.color, size: 15),
                const SizedBox(width: 6),
                Text(
                  'Líder: ${widget.equipo.lider}',
                  style: TextStyle(color: widget.color, fontSize: 13, fontWeight: FontWeight.w600),
                ),
              ]),
              const SizedBox(height: 14),
            ],

            // Descripción
            if (widget.equipo.descripcion.isNotEmpty) ...[
              Text(
                widget.equipo.descripcion,
                style: const TextStyle(color: _muted, fontSize: 15, height: 1.65),
              ),
              const SizedBox(height: 24),
            ],

            // Estado / botón
            if (_loading)
              const Center(child: CircularProgressIndicator(color: Color(0xFFBF1E2E), strokeWidth: 2))
            else if (!isLoggedIn)
              _InfoBanner(
                icon: Icons.lock_outline_rounded,
                color: Colors.white38,
                text: 'Inicia sesión para unirte al equipo.',
              )
            else
              _buildActionArea(),

            const SizedBox(height: 28),

            // ── Miembros ────────────────────────────────────────────────────
            _buildMiembrosSection(),
            const SizedBox(height: 24),

            // ── Recursos del equipo ─────────────────────
            _buildRecursosSection(),          ],
        ),
      ),
    );
  }

  bool get _isApprovedMember => _solicitud?.estado == 'aprobado';

  Widget _buildRecursosSection() {
    return StreamBuilder<List<Recurso>>(
      stream: SupabaseService.instance.recursosEquipoStream(widget.equipo.id),
      builder: (context, snap) {
        final recursos = snap.data ?? [];
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header row
            Row(
              children: [
                Icon(Icons.library_books_rounded, color: widget.color, size: 16),
                const SizedBox(width: 8),
                Text(
                  'RECURSOS',
                  style: TextStyle(
                    color: widget.color,
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 1.3,
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                  decoration: BoxDecoration(
                    color: widget.color.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    '${recursos.length}',
                    style: TextStyle(
                        color: widget.color, fontSize: 11, fontWeight: FontWeight.w700),
                  ),
                ),
                if (_isApprovedMember || _isAdmin) ...[                  const Spacer(),
                  GestureDetector(
                    onTap: () => _showRecursoForm(),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: widget.color.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: widget.color.withOpacity(0.3)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.add_rounded, color: widget.color, size: 14),
                          const SizedBox(width: 4),
                          Text('Agregar',
                              style: TextStyle(
                                  color: widget.color,
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700)),
                        ],
                      ),
                    ),
                  ),
                ],
              ],
            ),
            const SizedBox(height: 10),
            if (snap.connectionState == ConnectionState.waiting && recursos.isEmpty)
              const SizedBox(
                height: 40,
                child: Center(
                    child: CircularProgressIndicator(
                        color: Colors.white24, strokeWidth: 2)),
              )
            else if (recursos.isEmpty)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 14),
                decoration: BoxDecoration(
                  color: const Color(0xFF080E1E),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Center(
                  child: Text('Aún no hay recursos en este equipo',
                      style: TextStyle(color: Colors.white38, fontSize: 13)),
                ),
              )
            else
              ...recursos.map((r) => _RecursoEquipoTile(
                    recurso: r,
                    color: widget.color,
                    onDelete: (_isAdmin || _isApprovedMember)
                        ? () => SupabaseService.instance.eliminarRecurso(r.id)
                        : null,
                  )),
          ],
        );
      },
    );
  }

  void _showRecursoForm() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF111D2E),
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => _RecursoEquipoForm(
        equipoId: widget.equipo.id,
        equipoNombre: widget.equipo.nombre,
        color: widget.color,
      ),
    );
  }

  Widget _buildMiembrosSection() {
    return StreamBuilder<List<EquipoSolicitud>>(
      stream: SupabaseService.instance.solicitudesPorEquipoStream(widget.equipo.id),
      builder: (context, snap) {
        final all = snap.data ?? [];
        final aprobados = all.where((s) => s.estado == 'aprobado').toList();
        final pendientes = all.where((s) => s.estado == 'pendiente').toList();
        final rechazados = all.where((s) => s.estado == 'rechazado').toList();

        if (all.isEmpty && snap.connectionState == ConnectionState.waiting) {
          return const SizedBox();
        }

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Section header
            Row(
              children: [
                Icon(Icons.groups_rounded, color: widget.color, size: 16),
                const SizedBox(width: 8),
                Text(
                  'MIEMBROS',
                  style: TextStyle(
                    color: widget.color,
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 1.3,
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                  decoration: BoxDecoration(
                    color: widget.color.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    '${aprobados.length}',
                    style: TextStyle(
                      color: widget.color, fontSize: 11, fontWeight: FontWeight.w700),
                  ),
                ),
                if (_isAdmin && pendientes.isNotEmpty) ...[
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: const Color(0xFFD4A017).withOpacity(0.15),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: const Color(0xFFD4A017).withOpacity(0.3)),
                    ),
                    child: Text(
                      '${pendientes.length} pendiente${pendientes.length == 1 ? '' : 's'}',
                      style: const TextStyle(
                        color: Color(0xFFD4A017), fontSize: 11, fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ],
            ),
            const SizedBox(height: 10),

            if (aprobados.isEmpty)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 14),
                decoration: BoxDecoration(
                  color: const Color(0xFF080E1E),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Center(
                  child: Text('Aún no hay miembros',
                      style: TextStyle(color: Colors.white38, fontSize: 13)),
                ),
              )
            else
              ...aprobados.map((s) => _MiembroTile(solicitud: s, color: widget.color)),

            // Admin section: pendientes + rechazados
            if (_isAdmin && pendientes.isNotEmpty) ...[
              const SizedBox(height: 14),
              Row(children: [
                const Icon(Icons.hourglass_top_rounded, color: Color(0xFFD4A017), size: 14),
                const SizedBox(width: 6),
                const Text('EN ESPERA',
                    style: TextStyle(color: Color(0xFFD4A017), fontSize: 11,
                        fontWeight: FontWeight.w700, letterSpacing: 1.2)),
              ]),
              const SizedBox(height: 8),
              ...pendientes.map((s) => _MiembroTile(
                    solicitud: s,
                    color: const Color(0xFFD4A017),
                    pending: true,
                  )),
            ],
          ],
        );
      },
    );
  }

  Widget _buildActionArea() {
    final s = _solicitud;

    if (s == null) {
      // No solicitud → botón unirse
      return SizedBox(
        width: double.infinity,
        child: ElevatedButton.icon(
          style: ElevatedButton.styleFrom(
            backgroundColor: widget.color,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 15),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            elevation: 0,
          ),
          icon: _sending
              ? const SizedBox(width: 16, height: 16,
                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
              : const Icon(Icons.volunteer_activism_rounded, size: 18),
          label: Text(
            _sending ? 'Enviando…' : 'Quiero unirme',
            style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
          ),
          onPressed: _sending ? null : _enviarSolicitud,
        ),
      );
    }

    switch (s.estado) {
      case 'pendiente':
        return _InfoBanner(
          icon: Icons.hourglass_top_rounded,
          color: const Color(0xFFD4A017),
          text: 'Tu solicitud está en revisión. El admin te notificará pronto.',
        );
      case 'aprobado':
        return _InfoBanner(
          icon: Icons.check_circle_rounded,
          color: const Color(0xFF40C072),
          text: '¡Eres miembro de este equipo! Bienvenido/a.',
        );
      case 'rechazado':
        return Column(
          children: [
            _InfoBanner(
              icon: Icons.cancel_rounded,
              color: Colors.redAccent,
              text: s.motivo != null && s.motivo!.isNotEmpty
                  ? 'Solicitud rechazada: ${s.motivo}'
                  : 'Solicitud rechazada por el admin.',
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                style: OutlinedButton.styleFrom(
                  side: BorderSide(color: widget.color.withOpacity(0.5)),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  padding: const EdgeInsets.symmetric(vertical: 13),
                ),
                onPressed: _sending ? null : _enviarSolicitud,
                child: Text('Volver a intentar',
                    style: TextStyle(color: widget.color, fontWeight: FontWeight.w600)),
              ),
            ),
          ],
        );
      default:
        return const SizedBox();
    }
  }
}

class _MiembroTile extends StatelessWidget {
  final EquipoSolicitud solicitud;
  final Color color;
  final bool pending;

  const _MiembroTile({required this.solicitud, required this.color, this.pending = false});

  @override
  Widget build(BuildContext context) {
    final initials = solicitud.usuarioNombre.isNotEmpty
        ? solicitud.usuarioNombre.trim().split(' ').take(2)
            .map((w) => w.isNotEmpty ? w[0].toUpperCase() : '')
            .join()
        : '?';

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
      decoration: BoxDecoration(
        color: const Color(0xFF080E1E),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: color.withOpacity(0.15)),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 16,
            backgroundColor: color.withOpacity(0.15),
            child: Text(initials,
                style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w700)),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  solicitud.usuarioNombre.isEmpty ? 'Miembro' : solicitud.usuarioNombre,
                  style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600),
                ),
                if (solicitud.usuarioEmail.isNotEmpty)
                  Text(solicitud.usuarioEmail,
                      style: const TextStyle(color: Color(0xFFB5B5B5), fontSize: 11)),
              ],
            ),
          ),
          if (pending)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text('pendiente',
                  style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.w600)),
            ),
        ],
      ),
    );
  }
}

// ── Recurso tile inside equipo ─────────────────────────────────────────────────

class _RecursoEquipoTile extends StatelessWidget {
  final Recurso recurso;
  final Color color;
  final VoidCallback? onDelete;

  const _RecursoEquipoTile({
    required this.recurso,
    required this.color,
    this.onDelete,
  });

  static IconData _icon(String tipo) {
    switch (tipo.toLowerCase()) {
      case 'pdf':   return Icons.picture_as_pdf_rounded;
      case 'audio': return Icons.headphones_rounded;
      case 'video': return Icons.play_circle_rounded;
      default:      return Icons.insert_drive_file_rounded;
    }
  }

  static Color _tipoColor(String tipo) {
    switch (tipo.toLowerCase()) {
      case 'pdf':   return Colors.redAccent;
      case 'audio': return Colors.tealAccent;
      case 'video': return Colors.orangeAccent;
      default:      return Colors.white54;
    }
  }

  @override
  Widget build(BuildContext context) {
    final tc = _tipoColor(recurso.tipo);
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(10),
        child: InkWell(
          onTap: () => launchURL(recurso.url),
          borderRadius: BorderRadius.circular(10),
          splashColor: tc.withOpacity(0.08),
          child: Ink(
            decoration: BoxDecoration(
              color: const Color(0xFF080E1E),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: tc.withOpacity(0.2)),
            ),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              child: Row(
                children: [
                  Container(
                    width: 36, height: 36,
                    decoration: BoxDecoration(
                      color: tc.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    alignment: Alignment.center,
                    child: Icon(_icon(recurso.tipo), color: tc, size: 18),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          recurso.titulo,
                          style: const TextStyle(
                              color: Colors.white,
                              fontSize: 13,
                              fontWeight: FontWeight.w600),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        if (recurso.descripcion.isNotEmpty) ...[
                          const SizedBox(height: 2),
                          Text(
                            recurso.descripcion,
                            style: const TextStyle(
                                color: Colors.white38, fontSize: 11),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ],
                    ),
                  ),
                  if (onDelete != null)
                    GestureDetector(
                      onTap: onDelete,
                      child: const Padding(
                        padding: EdgeInsets.all(4),
                        child: Icon(Icons.delete_outline_rounded,
                            color: Colors.white24, size: 18),
                      ),
                    )
                  else
                    const Icon(Icons.open_in_new_rounded,
                        color: Colors.white24, size: 16),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// ── Form for team members to add a resource ────────────────────────────────────

class _RecursoEquipoForm extends StatefulWidget {
  final String equipoId;
  final String equipoNombre;
  final Color color;

  const _RecursoEquipoForm({
    required this.equipoId,
    required this.equipoNombre,
    required this.color,
  });

  @override
  State<_RecursoEquipoForm> createState() => _RecursoEquipoFormState();
}

class _RecursoEquipoFormState extends State<_RecursoEquipoForm> {
  final _tituloCtrl = TextEditingController();
  final _descCtrl   = TextEditingController();
  final _urlCtrl    = TextEditingController();
  String _tipo = 'pdf';
  bool _saving = false;

  static const _tipos = ['pdf', 'audio', 'video'];
  static const _tipoColors = {
    'pdf':   Colors.redAccent,
    'audio': Colors.tealAccent,
    'video': Colors.orangeAccent,
  };
  static const _tipoIcons = {
    'pdf':   Icons.picture_as_pdf_rounded,
    'audio': Icons.headphones_rounded,
    'video': Icons.play_circle_rounded,
  };

  @override
  void dispose() {
    _tituloCtrl.dispose();
    _descCtrl.dispose();
    _urlCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (_tituloCtrl.text.trim().isEmpty || _urlCtrl.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('Título y URL son obligatorios')));
      return;
    }
    setState(() => _saving = true);
    try {
      await SupabaseService.instance.crearRecursoDeEquipo(
        titulo: _tituloCtrl.text,
        descripcion: _descCtrl.text,
        url: _urlCtrl.text,
        tipo: _tipo,
        equipoId: widget.equipoId,
      );
      if (mounted) Navigator.pop(context);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Error: $e')));
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final c = _tipoColors[_tipo] ?? widget.color;
    return Padding(
      padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
          left: 20, right: 20, top: 24),
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            // Header
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: widget.color.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(Icons.library_add_rounded,
                      color: widget.color, size: 20),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Agregar recurso',
                          style: TextStyle(
                              color: Colors.white,
                              fontSize: 17,
                              fontWeight: FontWeight.w700)),
                      Text(widget.equipoNombre,
                          style: TextStyle(
                              color: widget.color.withOpacity(0.7),
                              fontSize: 12)),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Tipo selector
            _label('TIPO'),
            const SizedBox(height: 6),
            Row(
              children: _tipos.map((t) {
                final sel = t == _tipo;
                final tc = _tipoColors[t] ?? widget.color;
                return Expanded(
                  child: Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: GestureDetector(
                      onTap: () => setState(() => _tipo = t),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 180),
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          color: sel
                              ? tc.withOpacity(0.15)
                              : const Color(0xFF0F1C30),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                              color: sel ? tc : const Color(0xFF1E2E4A)),
                        ),
                        child: Column(
                          children: [
                            Icon(_tipoIcons[t]!,
                                color: sel ? tc : Colors.white38, size: 20),
                            const SizedBox(height: 4),
                            Text(t.toUpperCase(),
                                style: TextStyle(
                                    color: sel ? tc : Colors.white38,
                                    fontSize: 10,
                                    fontWeight: FontWeight.w700)),
                          ],
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 16),

            // Título
            _label('TÍTULO'),
            const SizedBox(height: 6),
            _field(controller: _tituloCtrl, hint: 'Ej: Presentación reunión'),
            const SizedBox(height: 14),

            // Descripción
            _label('DESCRIPCIÓN  (opcional)'),
            const SizedBox(height: 6),
            _field(
                controller: _descCtrl,
                hint: 'Breve descripción',
                maxLines: 2),
            const SizedBox(height: 14),

            // URL
            _label('URL DEL ARCHIVO'),
            const SizedBox(height: 4),
            Container(
              padding: const EdgeInsets.all(10),
              margin: const EdgeInsets.only(bottom: 6),
              decoration: BoxDecoration(
                color: c.withOpacity(0.07),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: c.withOpacity(0.3)),
              ),
              child: Row(
                children: [
                  Icon(Icons.info_outline_rounded, color: c, size: 14),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      _tipo == 'pdf'
                          ? 'Google Drive, Cloudinary u otro hosting PDF'
                          : _tipo == 'audio'
                              ? 'SoundCloud, Google Drive o similar'
                              : 'YouTube, Vimeo o similar',
                      style:
                          TextStyle(color: c, fontSize: 11, height: 1.4),
                    ),
                  ),
                ],
              ),
            ),
            _field(
                controller: _urlCtrl,
                hint: 'https://...',
                keyboardType: TextInputType.url),
            const SizedBox(height: 24),

            // Save button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: widget.color,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: _saving ? null : _save,
                child: _saving
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                            color: Colors.white, strokeWidth: 2))
                    : const Text('Publicar recurso',
                        style: TextStyle(
                            fontWeight: FontWeight.w700, fontSize: 15)),
              ),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _label(String t) => Text(
        t,
        style: const TextStyle(
            color: Color(0xFF8FA3BF),
            fontSize: 10,
            fontWeight: FontWeight.w700,
            letterSpacing: 1.2),
      );

  Widget _field({
    required TextEditingController controller,
    required String hint,
    int maxLines = 1,
    TextInputType keyboardType = TextInputType.text,
  }) =>
      TextField(
        controller: controller,
        maxLines: maxLines,
        keyboardType: keyboardType,
        style: const TextStyle(color: Colors.white, fontSize: 14),
        decoration: InputDecoration(
          hintText: hint,
          hintStyle:
              const TextStyle(color: Colors.white38, fontSize: 13),
          filled: true,
          fillColor: const Color(0xFF0F1C30),
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: Color(0xFF1E2E4A))),
          enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: Color(0xFF1E2E4A))),
          focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: BorderSide(color: widget.color.withOpacity(0.6))),
        ),
      );
}

class _InfoBanner extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String text;
  const _InfoBanner({required this.icon, required this.color, required this.text});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          Icon(icon, color: color, size: 18),
          const SizedBox(width: 10),
          Expanded(
            child: Text(text, style: TextStyle(color: color, fontSize: 13, height: 1.4)),
          ),
        ],
      ),
    );
  }
}
