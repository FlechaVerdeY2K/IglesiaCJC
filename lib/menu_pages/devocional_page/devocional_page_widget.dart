import 'package:intl/intl.dart';
import 'package:share_plus/share_plus.dart';
import '/backend/firebase_service.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:flutter/material.dart';
import 'devocional_page_model.dart';
export 'devocional_page_model.dart';

class DevocionalPageWidget extends StatefulWidget {
  const DevocionalPageWidget({super.key});

  static String routeName = 'devocionalPage';
  static String routePath = '/devocionalPage';

  @override
  State<DevocionalPageWidget> createState() => _DevocionalPageWidgetState();
}

class _DevocionalPageWidgetState extends State<DevocionalPageWidget> {
  static const Color _bg = Color(0xFF080E1E);
  static const Color _surface = Color(0xFF0F1C30);
  static const Color _accent = Color(0xFFBF1E2E);

  late DevocionalPageModel _model;
  final scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => DevocionalPageModel());
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
          'Devocional del día',
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
      body: FutureBuilder<Devocional?>(
        future: FirebaseService.instance.getDevocionalHoy(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(
                child: CircularProgressIndicator(color: _accent));
          }
          final dev = snapshot.data;
          if (dev == null) {
            return _buildEmpty();
          }
          return _buildDevocional(dev, context);
        },
      ),
    );
  }

  Widget _buildDevocional(Devocional dev, BuildContext context) {
    final fecha = DateFormat('EEEE d \'de\' MMMM, yyyy', 'es').format(dev.fecha);
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 40),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // fecha
          Text(
            fecha.substring(0, 1).toUpperCase() + fecha.substring(1),
            style: const TextStyle(
                color: Color(0xFF7A7A7A), fontSize: 13, letterSpacing: 0.3),
          ),
          const SizedBox(height: 16),
          // Versículo
          Container(
            padding: const EdgeInsets.all(22),
            decoration: BoxDecoration(
              color: _accent.withOpacity(0.08),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: _accent.withOpacity(0.25)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(Icons.format_quote_rounded, color: _accent, size: 32),
                const SizedBox(height: 8),
                Text(
                  '"${dev.versiculo}"',
                  style: const TextStyle(
                      color: Colors.white,
                      fontSize: 17,
                      fontStyle: FontStyle.italic,
                      height: 1.65),
                ),
                const SizedBox(height: 12),
                Align(
                  alignment: Alignment.centerRight,
                  child: Text(
                    '— ${dev.referencia}',
                    style: const TextStyle(
                        color: _accent,
                        fontSize: 14,
                        fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          // Botón compartir
          OutlinedButton.icon(
            onPressed: () {
              final texto = '"${dev.versiculo}"\n— ${dev.referencia}'
                  '${dev.titulo.isNotEmpty ? '\n\n${dev.titulo}' : ''}'
                  '\n\nDevocional del día · Iglesia CJC';
              Share.share(texto);
            },
            icon: const Icon(Icons.share_rounded, size: 18),
            label: const Text('Compartir versículo'),
            style: OutlinedButton.styleFrom(
              foregroundColor: _accent,
              side: BorderSide(color: _accent.withOpacity(0.4)),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10)),
              padding:
                  const EdgeInsets.symmetric(vertical: 12),
            ),
          ),
          const SizedBox(height: 24),
          if (dev.titulo.isNotEmpty) ...[
            Text(
              dev.titulo,
              style: const TextStyle(
                  color: Colors.white,
                  fontSize: 20,
                  fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 16),
          ],
          if (dev.reflexion.isNotEmpty)
            Text(
              dev.reflexion,
              style: const TextStyle(
                  color: Color(0xFFCCCCCC), fontSize: 15, height: 1.7),
            ),
        ],
      ),
    );
  }

  Widget _buildEmpty() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: const [
            Icon(Icons.menu_book_rounded, color: Colors.white24, size: 72),
            SizedBox(height: 16),
            Text(
              'El devocional de hoy\nestar\u00e1 disponible pronto',
              textAlign: TextAlign.center,
              style: TextStyle(
                  color: Color(0xFFB5B5B5), fontSize: 16, height: 1.5),
            ),
          ],
        ),
      ),
    );
  }
}
