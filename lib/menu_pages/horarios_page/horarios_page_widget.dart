import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:flutter/material.dart';
import 'horarios_page_model.dart';
export 'horarios_page_model.dart';

class HorariosPageWidget extends StatefulWidget {
  const HorariosPageWidget({super.key});

  static String routeName = 'horariosPage';
  static String routePath = '/horariosPage';

  @override
  State<HorariosPageWidget> createState() => _HorariosPageWidgetState();
}

class _HorariosPageWidgetState extends State<HorariosPageWidget> {
  static const Color _bg      = Color(0xFF080E1E);
  static const Color _surface = Color(0xFF0F1C30);
  static const Color _accent  = Color(0xFFBF1E2E);
  static const Color _border  = Color(0xFF1E2E4A);
  static const Color _muted   = Color(0xFFB5B5B5);

  late HorariosPageModel _model;
  final scaffoldKey = GlobalKey<ScaffoldState>();

  // Calcula cuál es el próximo servicio
  String _getProximoServicio() {
    final now = DateTime.now();
    final weekday = now.weekday; // 1=lun ... 7=dom
    final hour = now.hour;

    // Domingo = 7, si aún no pasaron las 10am
    if (weekday == 7 && hour < 10) return 'domingo';
    // Miércoles = 3, antes de las 7:30pm
    if (weekday == 3 && hour < 19) return 'miercoles';
    // Si ya pasó el domingo, el próximo es el miércoles (o viceversa)
    if (weekday <= 3) return 'miercoles';
    return 'domingo';
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => HorariosPageModel());
    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  @override
  void dispose() {
    _model.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final proximo = _getProximoServicio();

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
          'Horarios',
          style: FlutterFlowTheme.of(context).titleLarge.override(
                fontFamily: FlutterFlowTheme.of(context).titleLargeFamily,
                color: Colors.white,
                fontSize: 18.0,
                fontWeight: FontWeight.w700,
                letterSpacing: 0.0,
                useGoogleFonts: !FlutterFlowTheme.of(context).titleLargeIsCustom,
              ),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 24, 20, 48),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 900),
            child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [

            // ── Próximo servicio banner ──────────────────────────────────────
            _buildProximoBanner(proximo),
            const SizedBox(height: 28),

            // ── Sección: Servicios semanales ─────────────────────────────────
            _sectionLabel('SERVICIOS SEMANALES'),
            const SizedBox(height: 14),

            // Domingo — servicio principal (acento fuerte)
            _buildServiceCard(
              nombre: 'Servicio Principal',
              dia: 'Domingo',
              hora: '10:00 AM',
              descripcion: 'Culto de adoración y predicación de la Palabra.',
              isPrimary: true,
              isNext: proximo == 'domingo',
            ),
            const SizedBox(height: 12),

            // Miércoles — servicio intermedio (acento suave)
            _buildServiceCard(
              nombre: 'Servicio Intermedio',
              dia: 'Miércoles',
              hora: '7:30 PM',
              descripcion: 'Estudio bíblico y tiempo de oración.',
              isPrimary: false,
              isNext: proximo == 'miercoles',
            ),
            const SizedBox(height: 28),

            // ── Sección: GPS ─────────────────────────────────────────────────
            _sectionLabel('GRUPOS PEQUEÑOS · GPS'),
            const SizedBox(height: 14),
            _buildGpsCard(context),
            const SizedBox(height: 28),

            // ── Sección: Actividades especiales ─────────────────────────────
            _sectionLabel('ACTIVIDADES ESPECIALES'),
            const SizedBox(height: 14),
            _buildCalendaroCTA(context),
          ],
            ),   // Column
          ),     // ConstrainedBox
        ),       // Center
      ),
    );
  }

  // ── Banner "Próximo servicio" ──────────────────────────────────────────────
  Widget _buildProximoBanner(String proximo) {
    final esDomingo = proximo == 'domingo';
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            _accent.withOpacity(0.18),
            _accent.withOpacity(0.05),
          ],
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: _accent.withOpacity(0.35)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: _accent.withOpacity(0.15),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.church_rounded, color: _accent, size: 22),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Próximo servicio',
                  style: TextStyle(
                      color: _accent,
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.8),
                ),
                const SizedBox(height: 2),
                Text(
                  esDomingo ? 'Servicio Principal' : 'Servicio Intermedio',
                  style: const TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 2),
                Text(
                  esDomingo ? 'Domingo · 10:00 AM' : 'Miércoles · 7:30 PM',
                  style: const TextStyle(color: _muted, fontSize: 13),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(
              color: _accent.withOpacity(0.15),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: _accent.withOpacity(0.4)),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.circle, color: _accent, size: 6),
                SizedBox(width: 5),
                Text('Esta semana',
                    style: TextStyle(
                        color: _accent,
                        fontSize: 11,
                        fontWeight: FontWeight.w600)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ── Card de servicio ───────────────────────────────────────────────────────
  Widget _buildServiceCard({
    required String nombre,
    required String dia,
    required String hora,
    required String descripcion,
    required bool isPrimary,
    required bool isNext,
  }) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(16),
      child: Container(
      decoration: BoxDecoration(
        color: _surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isNext ? const Color(0xFF4A2A30) : _border,
        ),
      ),
      child: IntrinsicHeight(
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
          // Barra lateral izquierda
          Container(
            width: 4,
            color: isPrimary ? const Color(0xFF8B3A42) : const Color(0xFF2A4060),
          ),
          // Contenido
          Expanded(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 16),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Día pill
                  Column(
                    children: [
                      Container(
                        width: 52,
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        decoration: BoxDecoration(
                          color: isPrimary
                              ? _accent.withOpacity(0.12)
                              : const Color(0xFF1A2B42),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                            color: isPrimary
                                ? _accent.withOpacity(0.3)
                                : _border,
                          ),
                        ),
                        child: Column(
                          children: [
                            Text(
                              dia.substring(0, 3).toUpperCase(),
                              style: TextStyle(
                                  color: isPrimary
                                      ? _accent
                                      : const Color(0xFF7A9ABF),
                                  fontSize: 10,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: 0.5),
                            ),
                            const SizedBox(height: 2),
                            Icon(
                              isPrimary
                                  ? Icons.wb_sunny_rounded
                                  : Icons.nights_stay_rounded,
                              color: isPrimary
                                  ? _accent
                                  : const Color(0xFF7A9ABF),
                              size: 18,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(width: 14),
                  // Info
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(nombre,
                                  style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 15,
                                      fontWeight: FontWeight.w700)),
                            ),
                            if (isNext)
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF1A3A1A),
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(
                                      color: const Color(0xFF2D6A2D)),
                                ),
                                child: const Text('Próximo',
                                    style: TextStyle(
                                        color: Color(0xFF4CAF50),
                                        fontSize: 10,
                                        fontWeight: FontWeight.w700)),
                              ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Row(
                          children: [
                            const Icon(Icons.access_time_rounded,
                                color: Color(0xFF7A9ABF), size: 13),
                            const SizedBox(width: 4),
                            Text(hora,
                                style: const TextStyle(
                                    color: Color(0xFF7A9ABF), fontSize: 12)),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(descripcion,
                            style: const TextStyle(
                                color: _muted, fontSize: 13, height: 1.5)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
        ),  // Row
      ),    // IntrinsicHeight
      ),    // Container
    );      // ClipRRect
  }

  // ── GPS Card ───────────────────────────────────────────────────────────────
  Widget _buildGpsCard(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(16),
      child: Container(
      decoration: BoxDecoration(
        color: _surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: _border),
      ),
      child: IntrinsicHeight(
        child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            width: 4,
            color: const Color(0xFF2A6A4A),
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          color: const Color(0x222A7A5A),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                              color: const Color(0xFF2A7A5A).withOpacity(0.4)),
                        ),
                        child: const Icon(Icons.groups_rounded,
                            color: Color(0xFF4CAF50), size: 22),
                      ),
                      const SizedBox(width: 12),
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Grupos Pequeños',
                                style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 15,
                                    fontWeight: FontWeight.w700)),
                            Text('Varios días · Según tu grupo',
                                style: TextStyle(
                                    color: Color(0xFF7A9ABF), fontSize: 12)),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  const Text(
                    'Reuniones semanales en casas para crecer en comunidad. Consultá el horario de tu grupo con tu líder.',
                    style: TextStyle(color: _muted, fontSize: 13, height: 1.5),
                  ),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () =>
                              context.pushNamed('registroGpsPage'),
                          icon: const Icon(Icons.person_add_rounded, size: 16),
                          label: const Text('Unirme a un GPS'),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: const Color(0xFF4CAF50),
                            side: const BorderSide(
                                color: Color(0xFF2A7A5A)),
                            padding: const EdgeInsets.symmetric(vertical: 10),
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10)),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () =>
                              context.pushNamed('creacionGpsPage'),
                          icon: const Icon(Icons.add_location_alt_rounded,
                              size: 16),
                          label: const Text('Crear GPS'),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: const Color(0xFF7A9ABF),
                            side: const BorderSide(color: Color(0xFF1E2E4A)),
                            padding: const EdgeInsets.symmetric(vertical: 10),
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10)),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
        ),    // Row
      ),      // IntrinsicHeight
      ),      // Container
    );        // ClipRRect
  }

  // ── Actividades especiales → CTA al calendario ────────────────────────────
  Widget _buildCalendaroCTA(BuildContext context) {
    return InkWell(
      onTap: () => context.pushNamed('eventsPage'),
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: _surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: _border),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFF1A2B42),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(Icons.calendar_month_rounded,
                  color: Color(0xFF7EB8F7), size: 24),
            ),
            const SizedBox(width: 14),
            const Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Ver Calendario de Eventos',
                      style: TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                          fontWeight: FontWeight.w700)),
                  SizedBox(height: 3),
                  Text(
                    'Campamentos, retiros, cultos especiales y más.',
                    style: TextStyle(color: _muted, fontSize: 12, height: 1.4),
                  ),
                ],
              ),
            ),
            const Icon(Icons.arrow_forward_ios_rounded,
                color: Colors.white24, size: 16),
          ],
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
