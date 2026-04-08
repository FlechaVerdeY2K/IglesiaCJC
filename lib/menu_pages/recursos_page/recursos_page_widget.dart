import '/backend/supabase_service.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:flutter/material.dart';
import 'recursos_page_model.dart';
export 'recursos_page_model.dart';

class RecursosPageWidget extends StatefulWidget {
  const RecursosPageWidget({super.key});

  static String routeName = 'recursosPage';
  static String routePath = '/recursosPage';

  @override
  State<RecursosPageWidget> createState() => _RecursosPageWidgetState();
}

class _RecursosPageWidgetState extends State<RecursosPageWidget>
    with SingleTickerProviderStateMixin {
  static const Color _bg = Color(0xFF080E1E);
  static const Color _surface = Color(0xFF0F1C30);
  static const Color _accent = Color(0xFFBF1E2E);
  static const Color _muted = Color(0xFFB5B5B5);

  late RecursosPageModel _model;
  final scaffoldKey = GlobalKey<ScaffoldState>();

  final List<String> _tabs = ['Todos', 'Equipos', 'PDF', 'Audio', 'Video'];
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => RecursosPageModel());
    _tabController = TabController(length: _tabs.length, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  @override
  void dispose() {
    _tabController.dispose();
    _model.dispose();
    super.dispose();
  }

  IconData _iconForTipo(String tipo) {
    switch (tipo.toLowerCase()) {
      case 'pdf':
        return Icons.picture_as_pdf_rounded;
      case 'audio':
        return Icons.headphones_rounded;
      case 'video':
        return Icons.play_circle_outline_rounded;
      case 'equipos':
        return Icons.groups_rounded;
      default:
        return Icons.insert_drive_file_rounded;
    }
  }

  Color _colorForTipo(String tipo) {
    switch (tipo.toLowerCase()) {
      case 'pdf':
        return Colors.redAccent;
      case 'audio':
        return Colors.tealAccent;
      case 'video':
        return Colors.orangeAccent;
      default:
        return _accent;
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
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_rounded, color: Colors.white),
          onPressed: () => context.safePop(),
        ),
        title: Text(
          'Recursos',
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
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          tabAlignment: TabAlignment.start,
          indicator:
              const UnderlineTabIndicator(borderSide: BorderSide(color: _accent, width: 2)),
          labelColor: _accent,
          unselectedLabelColor: _muted,
          labelStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
          tabs: _tabs.map((t) => Tab(text: t)).toList(),
        ),
      ),
      body: StreamBuilder<List<Recurso>>(
        stream: SupabaseService.instance.recursosStream(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(
                child: CircularProgressIndicator(color: _accent));
          }
          final todos = snapshot.data ?? [];
          if (todos.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.05),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.library_books_rounded,
                        color: Colors.white24, size: 48),
                  ),
                  const SizedBox(height: 16),
                  const Text('Los recursos llegarán pronto',
                      style: TextStyle(
                          color: Colors.white60,
                          fontSize: 16,
                          fontWeight: FontWeight.w600)),
                  const SizedBox(height: 6),
                  const Text('Vuelve pronto',
                      style: TextStyle(color: Colors.white30, fontSize: 13)),
                ],
              ),
            );
          }
          return TabBarView(
            controller: _tabController,
            children: _tabs.map((tab) {
              final List<Recurso> filtered;
              if (tab == 'Todos') {
                filtered = todos;
              } else if (tab == 'Equipos') {
                filtered = todos
                    .where((r) => r.audiencia == 'equipos')
                    .toList();
              } else {
                filtered = todos
                    .where((r) =>
                        r.tipo.toLowerCase() == tab.toLowerCase())
                    .toList();
              }
              if (filtered.isEmpty) {
                return Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(_iconForTipo(tab.toLowerCase()),
                          color: Colors.white24, size: 48),
                      const SizedBox(height: 12),
                      Text(
                          tab == 'Equipos'
                              ? 'Sin recursos para equipos'
                              : 'Sin recursos de tipo $tab',
                          style: const TextStyle(
                              color: Colors.white38, fontSize: 14)),
                    ],
                  ),
                );
              }
              // Para el tab Equipos cargamos el mapa id→nombre
              if (tab == 'Equipos') {
                return StreamBuilder<List<Equipo>>(
                  stream: SupabaseService.instance.equiposStream(),
                  builder: (context, eqSnap) {
                    final equipoMap = <String, String>{
                      for (final e in eqSnap.data ?? []) e.id: e.nombre
                    };
                    return _buildList(filtered, equipoMap);
                  },
                );
              }
              return _buildList(filtered, {});
            }).toList(),
          );
        },
      ),
    );
  }

  Widget _buildList(List<Recurso> items, Map<String, String> equipoMap) {
    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
      itemCount: items.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (context, i) {
        final r = items[i];
        final color = _colorForTipo(r.tipo);
        final equipoNombre = r.equipoId != null ? equipoMap[r.equipoId] : null;
        return Material(
          color: Colors.transparent,
          borderRadius: BorderRadius.circular(14),
          child: InkWell(
            onTap: () => launchURL(r.url),
            borderRadius: BorderRadius.circular(14),
            splashColor: color.withOpacity(0.1),
            child: Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: _surface,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: color.withOpacity(0.25)),
              ),
              child: Row(
                children: [
                  Container(
                    width: 50, height: 50,
                    decoration: BoxDecoration(
                      color: color.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    alignment: Alignment.center,
                    child: Icon(_iconForTipo(r.tipo), color: color, size: 24),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(r.titulo,
                            style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w700,
                                fontSize: 14)),
                        if (r.descripcion.isNotEmpty) ...[
                          const SizedBox(height: 4),
                          Text(r.descripcion,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                  color: Color(0xFF8FA3BF),
                                  fontSize: 12,
                                  height: 1.4)),
                        ],
                        const SizedBox(height: 6),
                        Wrap(
                          spacing: 6,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: color.withOpacity(0.12),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                r.tipo.toUpperCase(),
                                style: TextStyle(
                                    color: color,
                                    fontSize: 10,
                                    fontWeight: FontWeight.w700,
                                    letterSpacing: 0.8),
                              ),
                            ),
                            if (equipoNombre != null)
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF26A69A).withOpacity(0.12),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    const Icon(Icons.groups_rounded,
                                        color: Color(0xFF26A69A), size: 11),
                                    const SizedBox(width: 4),
                                    Text(
                                      equipoNombre,
                                      style: const TextStyle(
                                          color: Color(0xFF26A69A),
                                          fontSize: 10,
                                          fontWeight: FontWeight.w700,
                                          letterSpacing: 0.5),
                                    ),
                                  ],
                                ),
                              ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: color.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(Icons.open_in_new_rounded,
                        color: color, size: 16),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
