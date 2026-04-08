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
  static const Color _bg      = Color(0xFF080E1E);
  static const Color _surface = Color(0xFF0F1C30);
  static const Color _border  = Color(0xFF1E2E4A);
  static const Color _accent  = Color(0xFFBF1E2E);
  static const Color _muted   = Color(0xFFB5B5B5);

  static const String _sinpeNumero    = '7093-9483';
  static const String _sinpeNombre    = 'Iglesia CJC';
  static const String _cuentaBancaria = 'CR00 0000 0000 0000 0000 00';
  static const String _bancoNombre    = 'Banco Nacional';
  static const String _cedulaJuridica = '3-008-000000';

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
        backgroundColor: _surface,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
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
          'Ofrendas',
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
        padding: const EdgeInsets.fromLTRB(20, 28, 20, 48),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 900),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [

                // ── Versículo ─────────────────────────────────────────────────
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [
                        _accent.withOpacity(0.10),
                        _accent.withOpacity(0.03),
                      ],
                    ),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: _accent.withOpacity(0.2)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(Icons.format_quote_rounded,
                          color: _accent, size: 28),
                      const SizedBox(height: 8),
                      const Text(
                        'Cada uno dé como propuso en su corazón, no con tristeza ni por necesidad.',
                        style: TextStyle(
                            color: Colors.white,
                            fontSize: 15,
                            fontStyle: FontStyle.italic,
                            height: 1.6),
                      ),
                      const SizedBox(height: 8),
                      Align(
                        alignment: Alignment.centerRight,
                        child: Text(
                          '— 2 Corintios 9:7',
                          style: TextStyle(
                              color: _accent.withOpacity(0.8),
                              fontSize: 13,
                              fontWeight: FontWeight.w600),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 28),

                // ── SINPE Móvil ───────────────────────────────────────────────
                _sectionLabel('SINPE MÓVIL'),
                const SizedBox(height: 12),
                Container(
                  decoration: BoxDecoration(
                    color: _surface,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: _border),
                  ),
                  child: Column(
                    children: [
                      // Header SINPE
                      Padding(
                        padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: const Color(0xFF1A3A1A),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: const Icon(Icons.phone_android_rounded,
                                  color: Color(0xFF4CAF50), size: 22),
                            ),
                            const SizedBox(width: 12),
                            const Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('SINPE Móvil',
                                    style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 15,
                                        fontWeight: FontWeight.w700)),
                                Text('Transferencia inmediata',
                                    style: TextStyle(
                                        color: Color(0xFF4CAF50), fontSize: 12)),
                              ],
                            ),
                            const Spacer(),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: const Color(0xFF1A3A1A),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(
                                    color: const Color(0xFF2D6A2D)),
                              ),
                              child: const Text('Recomendado',
                                  style: TextStyle(
                                      color: Color(0xFF4CAF50),
                                      fontSize: 10,
                                      fontWeight: FontWeight.w700)),
                            ),
                          ],
                        ),
                      ),
                      Divider(height: 1, color: _border),
                      _dataRow(
                        label: 'Número',
                        value: _sinpeNumero,
                        onCopy: () => _copy(_sinpeNumero, 'Número SINPE'),
                        isFirst: true,
                      ),
                      Divider(height: 1, color: _border),
                      _dataRow(
                        label: 'A nombre de',
                        value: _sinpeNombre,
                        isLast: true,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 10),

                // Pasos rápidos SINPE
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0A1628),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: _border),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.info_outline_rounded,
                          color: Color(0xFF4A6A8A), size: 16),
                      const SizedBox(width: 10),
                      Expanded(
                        child: RichText(
                          text: const TextSpan(
                            style: TextStyle(
                                color: Color(0xFF7A9ABF),
                                fontSize: 12,
                                height: 1.5),
                            children: [
                              TextSpan(text: 'Abrí tu app bancaria → SINPE Móvil → ingresá el número '),
                              TextSpan(
                                text: '7093-9483',
                                style: TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.w700),
                              ),
                              TextSpan(text: ' y confirmá que el nombre sea '),
                              TextSpan(
                                text: 'Iglesia CJC',
                                style: TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.w700),
                              ),
                              TextSpan(text: ' antes de enviar.'),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 28),

                // ── Transferencia bancaria ─────────────────────────────────────
                _sectionLabel('TRANSFERENCIA BANCARIA'),
                const SizedBox(height: 12),
                Container(
                  decoration: BoxDecoration(
                    color: _surface,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: _border),
                  ),
                  child: Column(
                    children: [
                      Padding(
                        padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: const Color(0xFF1A2A3A),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: const Icon(Icons.account_balance_rounded,
                                  color: Color(0xFF7EB8F7), size: 22),
                            ),
                            const SizedBox(width: 12),
                            const Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Transferencia Bancaria',
                                    style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 15,
                                        fontWeight: FontWeight.w700)),
                                Text('Banco Nacional de Costa Rica',
                                    style: TextStyle(
                                        color: Color(0xFF7EB8F7), fontSize: 12)),
                              ],
                            ),
                          ],
                        ),
                      ),
                      Divider(height: 1, color: _border),
                      _dataRow(
                        label: 'IBAN',
                        value: _cuentaBancaria,
                        onCopy: () => _copy(_cuentaBancaria, 'IBAN'),
                        isFirst: true,
                        monospace: true,
                      ),
                      Divider(height: 1, color: _border),
                      _dataRow(
                        label: 'Banco',
                        value: _bancoNombre,
                      ),
                      Divider(height: 1, color: _border),
                      _dataRow(
                        label: 'Cédula Jurídica',
                        value: _cedulaJuridica,
                        onCopy: () => _copy(_cedulaJuridica, 'Cédula jurídica'),
                        isLast: true,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _dataRow({
    required String label,
    required String value,
    VoidCallback? onCopy,
    bool isFirst = false,
    bool isLast = false,
    bool monospace = false,
  }) {
    return Padding(
      padding: EdgeInsets.fromLTRB(
          16, isFirst ? 14 : 12, 16, isLast ? 14 : 12),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label,
                    style: const TextStyle(
                        color: Color(0xFF4A6A8A),
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        letterSpacing: 0.5)),
                const SizedBox(height: 3),
                Text(
                  value,
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    fontFamily: monospace ? 'monospace' : null,
                    letterSpacing: monospace ? 1.0 : 0,
                  ),
                ),
              ],
            ),
          ),
          if (onCopy != null)
            InkWell(
              onTap: onCopy,
              borderRadius: BorderRadius.circular(8),
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: const Color(0xFF1A2B42),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.copy_rounded,
                        color: Color(0xFF7EB8F7), size: 13),
                    SizedBox(width: 4),
                    Text('Copiar',
                        style: TextStyle(
                            color: Color(0xFF7EB8F7),
                            fontSize: 12,
                            fontWeight: FontWeight.w600)),
                  ],
                ),
              ),
            ),
        ],
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
