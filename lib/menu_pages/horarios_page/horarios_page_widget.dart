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
  static const Color _bg = Color(0xFF050505);
  static const Color _surface = Color(0xFF171717);
  static const Color _accent = Color(0xFFE8D5B0);

  late HorariosPageModel _model;
  final scaffoldKey = GlobalKey<ScaffoldState>();

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
          'Horarios',
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
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 24, 20, 40),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _buildSectionHeader('Servicios semanales'),
            const SizedBox(height: 12),
            _buildHorarioCard(
              dia: 'Domingo',
              nombre: 'Servicio Principal',
              hora: '10:00 AM',
              descripcion: 'Culto de adoración y predicación de la Palabra.',
              icon: Icons.church_rounded,
              color: const Color(0xFFE8D5B0),
            ),
            const SizedBox(height: 10),
            _buildHorarioCard(
              dia: 'Miércoles',
              nombre: 'Servicio Intermedio',
              hora: '7:30 PM',
              descripcion: 'Estudio bíblico y tiempo de oración.',
              icon: Icons.menu_book_rounded,
              color: const Color(0xFF7EB8F7),
            ),
            const SizedBox(height: 24),
            _buildSectionHeader('GPS — Grupos Pequeños'),
            const SizedBox(height: 12),
            _buildHorarioCard(
              dia: 'Varios días',
              nombre: 'Grupos Pequeños (GPS)',
              hora: 'Según tu grupo',
              descripcion:
                  'Reuniones semanales en casas para crecer en comunidad. Consulta el horario de tu grupo con tu líder.',
              icon: Icons.groups_rounded,
              color: const Color(0xFF8BC4A0),
            ),
            const SizedBox(height: 24),
            _buildSectionHeader('Actividades especiales'),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: _surface,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFF2B2B2B)),
              ),
              child: const Text(
                'Las actividades especiales se anuncian con anticipación en la sección de Anuncios y Calendario.\nEstamos activos en redes sociales con todas las novedades.',
                style: TextStyle(
                    color: Color(0xFFB5B5B5), fontSize: 14, height: 1.6),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Text(
      title,
      style: const TextStyle(
        color: Colors.white,
        fontSize: 17,
        fontWeight: FontWeight.w700,
      ),
    );
  }

  Widget _buildHorarioCard({
    required String dia,
    required String nombre,
    required String hora,
    required String descripcion,
    required IconData icon,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: _surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFF2B2B2B)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: color.withOpacity(0.12),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: color.withOpacity(0.3)),
            ),
            child: Icon(icon, color: color, size: 24),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(nombre,
                    style: const TextStyle(
                        color: Colors.white,
                        fontSize: 15,
                        fontWeight: FontWeight.w700)),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Icon(Icons.calendar_today_rounded,
                        color: color, size: 13),
                    const SizedBox(width: 4),
                    Text('$dia',
                        style: TextStyle(color: color, fontSize: 12)),
                    const SizedBox(width: 10),
                    Icon(Icons.access_time_rounded, color: color, size: 13),
                    const SizedBox(width: 4),
                    Text(hora,
                        style: TextStyle(color: color, fontSize: 12)),
                  ],
                ),
                const SizedBox(height: 8),
                Text(descripcion,
                    style: const TextStyle(
                        color: Color(0xFFB5B5B5),
                        fontSize: 13,
                        height: 1.5)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
