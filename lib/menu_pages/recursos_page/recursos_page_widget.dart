import '/backend/firebase_service.dart';
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

  final List<String> _tabs = ['Todos', 'PDF', 'Audio', 'Video'];
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
        stream: FirebaseService.instance.recursosStream(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(
                child: CircularProgressIndicator(color: _accent));
          }
          final todos = snapshot.data ?? [];
          if (todos.isEmpty) {
            return const Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.library_books_rounded,
                      color: Colors.white24, size: 72),
                  SizedBox(height: 16),
                  Text('Los recursos llegarán pronto',
                      style: TextStyle(color: _muted, fontSize: 16)),
                ],
              ),
            );
          }
          return TabBarView(
            controller: _tabController,
            children: _tabs.map((tab) {
              final filtered = tab == 'Todos'
                  ? todos
                  : todos
                      .where((r) =>
                          r.tipo.toLowerCase() == tab.toLowerCase())
                      .toList();
              if (filtered.isEmpty) {
                return const Center(
                  child: Text('Sin recursos en esta categoría',
                      style: TextStyle(color: _muted)),
                );
              }
              return ListView.separated(
                padding: const EdgeInsets.all(16),
                itemCount: filtered.length,
                separatorBuilder: (_, __) => const SizedBox(height: 12),
                itemBuilder: (context, i) {
                  final r = filtered[i];
                  return Container(
                    decoration: BoxDecoration(
                      color: _surface,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                          color: _colorForTipo(r.tipo).withOpacity(0.3)),
                    ),
                    child: ListTile(
                      contentPadding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 8),
                      leading: Container(
                        width: 48,
                        height: 48,
                        decoration: BoxDecoration(
                          color: _colorForTipo(r.tipo).withOpacity(0.15),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Icon(_iconForTipo(r.tipo),
                            color: _colorForTipo(r.tipo), size: 26),
                      ),
                      title: Text(
                        r.titulo,
                        style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w600,
                            fontSize: 15),
                      ),
                      subtitle: r.descripcion.isNotEmpty
                          ? Padding(
                              padding: const EdgeInsets.only(top: 4),
                              child: Text(
                                r.descripcion,
                                style: const TextStyle(
                                    color: _muted, fontSize: 13),
                              ),
                            )
                          : null,
                      trailing: IconButton(
                        icon: const Icon(Icons.open_in_new_rounded,
                            color: _accent),
                        onPressed: () => launchURL(r.url),
                        tooltip: 'Abrir',
                      ),
                    ),
                  );
                },
              );
            }).toList(),
          );
        },
      ),
    );
  }
}
