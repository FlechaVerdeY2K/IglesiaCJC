import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'ofrendas_page_model.dart';
export 'ofrendas_page_model.dart';

class OfrendasPageWidget extends StatefulWidget {
  const OfrendasPageWidget({super.key});

  static String routeName = 'ofrendasPage';
  static String routePath = '/ofrendasPage';

  @override
  State<OfrendasPageWidget> createState() => _OfrendasPageWidgetState();
}

class _OfrendasPageWidgetState extends State<OfrendasPageWidget> {
  static const Color _bg = Color(0xFF050505);
  static const Color _surface = Color(0xFF171717);
  static const Color _accent = Color(0xFFE8D5B0);

  // ── Actualiza estos datos con los reales de la iglesia ──
  static const String _sinpeNumero = '7093-9483';
  static const String _sinpeNombre = 'Iglesia CJC';
  static const String _cuentaBancaria = 'CR00 0000 0000 0000 0000 00';
  static const String _bancoNombre = 'Banco Nacional';
  static const String _cedulaJuridica = '3-008-000000';
  static const String _onlineUrl = '';

  late OfrendasPageModel _model;
  final scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => OfrendasPageModel());
    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  @override
  void dispose() {
    _model.dispose();
    super.dispose();
  }

  void _copy(String text, String label) {
    Clipboard.setData(ClipboardData(text: text));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('$label copiado'),
        behavior: SnackBarBehavior.floating,
        backgroundColor: const Color(0xFF2A2A2A),
      ),
    );
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
          'Ofrendas',
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
            // ── Intro ────────────────────────────────────────────────────────
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: _accent.withOpacity(0.08),
                borderRadius: BorderRadius.circular(14),
                border:
                    Border.all(color: _accent.withOpacity(0.2)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.volunteer_activism_rounded,
                      color: Color(0xFFE8D5B0), size: 28),
                  SizedBox(width: 14),
                  Expanded(
                    child: Text(
                      '"Cada uno dé como propuso en su corazón, no con tristeza ni por necesidad." — 2 Cor 9:7',
                      style: TextStyle(
                          color: Color(0xFFE8D5B0),
                          fontSize: 13,
                          fontStyle: FontStyle.italic,
                          height: 1.5),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 28),
            // ── SINPE ────────────────────────────────────────────────────────
            _buildSectionTitle('SINPE Móvil'),
            const SizedBox(height: 10),
            _buildDataTile(
              label: 'Número SINPE',
              value: _sinpeNumero,
              onCopy: () => _copy(_sinpeNumero, 'Número SINPE'),
            ),
            const SizedBox(height: 8),
            _buildDataTile(
              label: 'A nombre de',
              value: _sinpeNombre,
              onCopy: () => _copy(_sinpeNombre, 'Nombre'),
            ),
            const SizedBox(height: 24),
            // ── Cuenta bancaria ──────────────────────────────────────────────
            _buildSectionTitle('Transferencia Bancaria'),
            const SizedBox(height: 10),
            _buildDataTile(
              label: 'IBAN',
              value: _cuentaBancaria,
              onCopy: () => _copy(_cuentaBancaria, 'IBAN'),
            ),
            const SizedBox(height: 8),
            _buildDataTile(
              label: 'Banco',
              value: _bancoNombre,
            ),
            const SizedBox(height: 8),
            _buildDataTile(
              label: 'Cédula Jurídica',
              value: _cedulaJuridica,
              onCopy: () => _copy(_cedulaJuridica, 'Cédula jurídica'),
            ),
            if (_onlineUrl.isNotEmpty) ...[
              const SizedBox(height: 24),
              _buildSectionTitle('Ofrenda en línea'),
              const SizedBox(height: 10),
              FilledButton.icon(
                onPressed: () => launchURL(_onlineUrl),
                icon: const Icon(Icons.open_in_new_rounded),
                label: const Text('Dar en línea'),
                style: FilledButton.styleFrom(
                  backgroundColor: _accent,
                  foregroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(
          color: Colors.white, fontSize: 16, fontWeight: FontWeight.w700),
    );
  }

  Widget _buildDataTile({
    required String label,
    required String value,
    VoidCallback? onCopy,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: _surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF2B2B2B)),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label,
                    style: const TextStyle(
                        color: Color(0xFF7A7A7A), fontSize: 11)),
                const SizedBox(height: 2),
                Text(value,
                    style: const TextStyle(
                        color: Colors.white,
                        fontSize: 15,
                        fontWeight: FontWeight.w600)),
              ],
            ),
          ),
          if (onCopy != null)
            IconButton(
              onPressed: onCopy,
              icon: const Icon(Icons.copy_rounded,
                  color: Colors.white38, size: 18),
            ),
        ],
      ),
    );
  }
}
