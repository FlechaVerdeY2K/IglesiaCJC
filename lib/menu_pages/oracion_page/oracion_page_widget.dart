import 'package:intl/intl.dart';
import '/backend/auth_service.dart';
import '/backend/firebase_service.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/index.dart';
import 'package:flutter/material.dart';
import 'oracion_page_model.dart';
export 'oracion_page_model.dart';

class OracionPageWidget extends StatefulWidget {
  const OracionPageWidget({super.key});

  static String routeName = 'oracionPage';
  static String routePath = '/oracionPage';

  @override
  State<OracionPageWidget> createState() => _OracionPageWidgetState();
}

class _OracionPageWidgetState extends State<OracionPageWidget> {
  static const Color _bg = Color(0xFF050505);
  static const Color _surface = Color(0xFF171717);
  static const Color _accent = Color(0xFFE8D5B0);

  late OracionPageModel _model;
  final scaffoldKey = GlobalKey<ScaffoldState>();
  final _formKey = GlobalKey<FormState>();
  final _nombreCtrl = TextEditingController();
  final _peticionCtrl = TextEditingController();
  bool _anonima = false;
  bool _enviando = false;

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => OracionPageModel());
    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  @override
  void dispose() {
    _model.dispose();
    _nombreCtrl.dispose();
    _peticionCtrl.dispose();
    super.dispose();
  }

  Future<void> _enviar() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _enviando = true);
    try {
      await FirebaseService.instance.crearOracion(
        nombre: _nombreCtrl.text.trim(),
        peticion: _peticionCtrl.text.trim(),
        anonima: _anonima,
      );
      _nombreCtrl.clear();
      _peticionCtrl.clear();
      setState(() => _anonima = false);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Petición enviada. La iglesia ora por ti 🙏'),
          behavior: SnackBarBehavior.floating,
          backgroundColor: Color(0xFF1E3A1E),
        ),
      );
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Error al enviar. Intenta de nuevo.'),
          behavior: SnackBarBehavior.floating,
        ),
      );
    } finally {
      if (mounted) setState(() => _enviando = false);
    }
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
          'Pedidos de Oración',
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
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 40),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // ── Formulario ───────────────────────────────────────────────────
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: _surface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF2B2B2B)),
              ),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Text('Comparte tu petición',
                        style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w700,
                            fontSize: 16)),
                    const SizedBox(height: 16),
                    if (!_anonima)
                      _buildTextField(
                        controller: _nombreCtrl,
                        label: 'Tu nombre',
                        validator: (v) => v == null || v.trim().isEmpty
                            ? 'Escribe tu nombre o marca como anónimo'
                            : null,
                      ),
                    if (!_anonima) const SizedBox(height: 12),
                    _buildTextField(
                      controller: _peticionCtrl,
                      label: 'Cuéntanos tu petición',
                      maxLines: 4,
                      validator: (v) => v == null || v.trim().isEmpty
                          ? 'Escribe tu petición'
                          : null,
                    ),
                    const SizedBox(height: 12),
                    // Anónima switch
                    Row(
                      children: [
                        Switch(
                          value: _anonima,
                          onChanged: (v) => setState(() => _anonima = v),
                          activeColor: _accent,
                        ),
                        const SizedBox(width: 8),
                        const Text('Enviar de forma anónima',
                            style: TextStyle(
                                color: Color(0xFFB5B5B5), fontSize: 14)),
                      ],
                    ),
                    const SizedBox(height: 16),
                    FilledButton(
                      onPressed: _enviando ? null : _enviar,
                      style: FilledButton.styleFrom(
                        backgroundColor: _accent,
                        foregroundColor: Colors.black,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12)),
                      ),
                      child: _enviando
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                  strokeWidth: 2, color: Colors.black))
                          : const Text('Enviar petición',
                              style: TextStyle(fontWeight: FontWeight.w700)),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 28),
            const Text('Peticiones de la comunidad',
                style: TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.w700)),
            const SizedBox(height: 12),
            // ── Lista ────────────────────────────────────────────────────────
            StreamBuilder<List<Oracion>>(
              stream: FirebaseService.instance.oracionesPublicasStream(),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(
                      child:
                          CircularProgressIndicator(color: _accent));
                }
                final oraciones = snapshot.data ?? [];
                if (oraciones.isEmpty) {
                  return const Padding(
                    padding: EdgeInsets.symmetric(vertical: 24),
                    child: Center(
                      child: Text('Sé el primero en compartir una petición.',
                          style: TextStyle(
                              color: Color(0xFF7A7A7A), fontSize: 14)),
                    ),
                  );
                }
                return Column(
                  children: oraciones
                      .map((o) => _buildOracionCard(o))
                      .toList(),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    int maxLines = 1,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      maxLines: maxLines,
      validator: validator,
      style: const TextStyle(color: Colors.white),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(color: Color(0xFF7A7A7A)),
        filled: true,
        fillColor: const Color(0xFF111111),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: Color(0xFF2B2B2B)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: Color(0xFF2B2B2B)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: _accent),
        ),
      ),
    );
  }

  Widget _buildOracionCard(Oracion oracion) {
    final fecha = DateFormat('d MMM', 'es').format(oracion.fecha);
    final uid = AuthService.instance.currentUser?.uid;
    final yaOro = uid != null && oracion.orantesUids.contains(uid);

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: _surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF2B2B2B)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: const Color(0xFF272727),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Icon(Icons.volunteer_activism_rounded,
                    color: _accent, size: 18),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  oracion.nombre,
                  style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                      fontSize: 14),
                ),
              ),
              Text(fecha,
                  style: const TextStyle(
                      color: Color(0xFF7A7A7A), fontSize: 12)),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            oracion.peticion,
            style: const TextStyle(
                color: Color(0xFFCCCCCC), fontSize: 14, height: 1.5),
          ),
          const SizedBox(height: 12),
          GestureDetector(
            onTap: () async {
              if (uid == null) {
                context.pushNamed(UserLoginPageWidget.routeName);
                return;
              }
              if (yaOro) return;
              await FirebaseService.instance.orarPor(oracion.id, uid);
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: yaOro
                    ? const Color(0xFF1E3A1E)
                    : const Color(0xFF272727),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: yaOro
                      ? const Color(0xFF4CAF50)
                      : const Color(0xFF3A3A3A),
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    yaOro
                        ? Icons.favorite_rounded
                        : Icons.favorite_border_rounded,
                    color: yaOro
                        ? const Color(0xFF4CAF50)
                        : const Color(0xFF7A7A7A),
                    size: 16,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    yaOro
                        ? 'Orando · ${oracion.orantes}'
                        : 'Orar · ${oracion.orantes}',
                    style: TextStyle(
                      color: yaOro
                          ? const Color(0xFF4CAF50)
                          : const Color(0xFF7A7A7A),
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
