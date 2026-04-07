import '/backend/supabase_service.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:flutter/material.dart';
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
  static const Color _bg = Color(0xFF080E1E);
  static const Color _surface = Color(0xFF0F1C30);
  static const Color _accent = Color(0xFFBF1E2E);

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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: scaffoldKey,
      backgroundColor: _bg,
      appBar: AppBar(
        backgroundColor: const Color(0xFF0D1628),
        elevation: 0,
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
                child: CircularProgressIndicator(color: _accent));
          }
          final equipos = snapshot.data ?? [];
          if (equipos.isEmpty) {
            return const Center(
              child: Text('Próximamente',
                  style: TextStyle(color: Colors.white54, fontSize: 16)),
            );
          }
          return ListView.separated(
            padding: const EdgeInsets.fromLTRB(20, 24, 20, 40),
            itemCount: equipos.length,
            separatorBuilder: (_, __) => const SizedBox(height: 12),
            itemBuilder: (context, i) =>
                _buildEquipoCard(context, equipos[i]),
          );
        },
      ),
    );
  }

  Widget _buildEquipoCard(BuildContext context, Equipo equipo) {
    final iconData = _iconFromName(equipo.iconName);
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: _surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFF1E2E4A)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              color: const Color(0xFF272727),
              borderRadius: BorderRadius.circular(26),
              border: Border.all(color: const Color(0xFF3A3A3A)),
            ),
            child: Icon(iconData, color: _accent, size: 26),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  equipo.nombre,
                  style: const TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w700),
                ),
                if (equipo.lider.isNotEmpty) ...[
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.person_rounded,
                          color: Color(0xFF7A7A7A), size: 14),
                      const SizedBox(width: 4),
                      Text(equipo.lider,
                          style: const TextStyle(
                              color: Color(0xFF7A7A7A), fontSize: 13)),
                    ],
                  ),
                ],
                if (equipo.descripcion.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Text(
                    equipo.descripcion,
                    style: const TextStyle(
                        color: Color(0xFFB5B5B5), fontSize: 13, height: 1.5),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  IconData _iconFromName(String? name) {
    switch (name) {
      case 'music':
        return Icons.music_note_rounded;
      case 'kids':
        return Icons.child_care_rounded;
      case 'youth':
        return Icons.groups_rounded;
      case 'media':
        return Icons.camera_alt_rounded;
      case 'prayer':
        return Icons.volunteer_activism_rounded;
      case 'welcome':
        return Icons.waving_hand_rounded;
      case 'missions':
        return Icons.public_rounded;
      case 'sound':
        return Icons.speaker_rounded;
      default:
        return Icons.people_alt_rounded;
    }
  }
}
