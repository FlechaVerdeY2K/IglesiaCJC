import 'package:intl/intl.dart';
import 'package:share_plus/share_plus.dart';
import '/backend/supabase_service.dart';
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
        future: SupabaseService.instance.getDevocionalHoy(),
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
    final fechaLabel = fecha.substring(0, 1).toUpperCase() + fecha.substring(1);

    // Split reflexion at "Oración:" if present
    String bodyText = dev.reflexion;
    String oracionText = '';
    final orIdx = dev.reflexion.indexOf(RegExp(r'oraci[oó]n:', caseSensitive: false));
    if (orIdx != -1) {
      bodyText = dev.reflexion.substring(0, orIdx).trim();
      oracionText = dev.reflexion.substring(orIdx).trim();
    }

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // ── Hero header ──
          Stack(
            children: [
              Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Color(0xFF1A0A10), Color(0xFF0D1628)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
                padding: const EdgeInsets.fromLTRB(24, 28, 24, 56),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Date pill
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 12, vertical: 5),
                  decoration: BoxDecoration(
                    color: _accent.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: _accent.withOpacity(0.3)),
                  ),
                  child: Text(
                    fechaLabel,
                    style: const TextStyle(
                        color: _accent,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        letterSpacing: 0.3),
                  ),
                ),
                const SizedBox(height: 20),
                // Book icon + "Devocional del día"
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: _accent.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.auto_stories_rounded,
                          color: _accent, size: 22),
                    ),
                    const SizedBox(width: 14),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text('DEVOCIONAL',
                            style: TextStyle(
                                color: _accent,
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                letterSpacing: 1.5)),
                        SizedBox(height: 2),
                        Text('del día',
                            style: TextStyle(
                                color: Colors.white,
                                fontSize: 22,
                                fontWeight: FontWeight.w800)),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
              // Fade-to-background gradient at bottom
              Positioned(
                left: 0, right: 0, bottom: 0,
                height: 48,
                child: Container(
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      colors: [Colors.transparent, Color(0xFF080E1E)],
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                    ),
                  ),
                ),
              ),
            ],
          ),

          Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 40),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // ── Versículo card ──
                Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        _accent.withOpacity(0.12),
                        _accent.withOpacity(0.04),
                      ],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: _accent.withOpacity(0.3)),
                  ),
                  child: IntrinsicHeight(
                    child: Row(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Left accent bar
                      Container(
                        width: 4,
                        decoration: BoxDecoration(
                          color: _accent,
                          borderRadius: const BorderRadius.only(
                            topLeft: Radius.circular(18),
                            bottomLeft: Radius.circular(18),
                          ),
                        ),
                      ),
                      Expanded(
                        child: Padding(
                          padding: const EdgeInsets.all(20),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Icon(Icons.format_quote_rounded,
                                  color: _accent, size: 28),
                              const SizedBox(height: 10),
                              Text(
                                '"${dev.versiculo}"',
                                style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 17,
                                    fontStyle: FontStyle.italic,
                                    height: 1.7),
                              ),
                              const SizedBox(height: 14),
                              Align(
                                alignment: Alignment.centerRight,
                                child: Text(
                                  '— ${dev.referencia}',
                                  style: const TextStyle(
                                      color: _accent,
                                      fontSize: 14,
                                      fontWeight: FontWeight.w700,
                                      letterSpacing: 0.3),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                  ),
                ),
                const SizedBox(height: 16),

                // ── Share button ──
                OutlinedButton.icon(
                  onPressed: () {
                    final partes = <String>[];
                    // Versículo
                    partes.add('"${dev.versiculo}"\n— ${dev.referencia}');
                    // Título
                    if (dev.titulo.isNotEmpty) partes.add(dev.titulo);
                    // Reflexión completa
                    if (dev.reflexion.isNotEmpty) partes.add(dev.reflexion);
                    // Firma
                    partes.add('📖 Devocional del día · Iglesia CJC');
                    Share.share(partes.join('\n\n'));
                  },
                  icon: const Icon(Icons.share_rounded, size: 18),
                  label: const Text('Compartir versículo'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: _accent,
                    side: BorderSide(color: _accent.withOpacity(0.4)),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10)),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
                const SizedBox(height: 28),

                // ── Título ──
                if (dev.titulo.isNotEmpty) ...[
                  Text(
                    dev.titulo,
                    style: const TextStyle(
                        color: Colors.white,
                        fontSize: 22,
                        fontWeight: FontWeight.w800,
                        height: 1.3),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    width: 40,
                    height: 3,
                    decoration: BoxDecoration(
                      color: _accent,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                  const SizedBox(height: 20),
                ],

                // ── Reflexión body ──
                if (bodyText.isNotEmpty)
                  Text(
                    bodyText,
                    style: const TextStyle(
                        color: Color(0xFFCDD5E0),
                        fontSize: 15,
                        height: 1.8),
                  ),

                // ── Oración section ──
                if (oracionText.isNotEmpty) ...[
                  const SizedBox(height: 24),
                  Container(
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F1C30),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: const Color(0xFF1E2E4A)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: const [
                            Icon(Icons.volunteer_activism_rounded,
                                color: _accent, size: 16),
                            SizedBox(width: 8),
                            Text('ORACIÓN',
                                style: TextStyle(
                                    color: _accent,
                                    fontSize: 11,
                                    fontWeight: FontWeight.w700,
                                    letterSpacing: 1.3)),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Text(
                          // Remove "Oración:\n" prefix
                          oracionText.replaceFirst(
                              RegExp(r'oraci[oó]n:\s*',
                                  caseSensitive: false),
                              ''),
                          style: const TextStyle(
                              color: Color(0xFFCDD5E0),
                              fontSize: 15,
                              height: 1.75,
                              fontStyle: FontStyle.italic),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
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
