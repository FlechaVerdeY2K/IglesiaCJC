import 'package:intl/intl.dart';
import '/backend/auth_service.dart';
import '/backend/supabase_service.dart';
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
  static const Color _bg      = Color(0xFF080E1E);
  static const Color _surface = Color(0xFF0F1C30);
  static const Color _accent  = Color(0xFFBF1E2E);
  static const Color _border  = Color(0xFF1E2E4A);
  static const Color _muted   = Color(0xFFB5B5B5);

  late OracionPageModel _model;
  final scaffoldKey = GlobalKey<ScaffoldState>();
  final _formKey    = GlobalKey<FormState>();
  final _nombreCtrl  = TextEditingController();
  final _peticionCtrl = TextEditingController();
  bool _anonima  = false;
  bool _enviando = false;

  // ── Filtros comunidad ─────────────────────────────────────────────────────
  final _searchCtrl = TextEditingController();
  String _searchQuery = '';
  String _filtro = 'todas'; // 'todas' | 'mias'
  int _limite = 15;

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => OracionPageModel());
    WidgetsBinding.instance.addPostFrameCallback((_) {
      safeSetState(() {});
      _prefillNombre();
    });
  }

  Future<void> _prefillNombre() async {
    final uid = AuthService.instance.currentUser?.id;
    if (uid == null) return;
    try {
      final profile = await SupabaseService.instance.getUserProfile(uid);
      final nombre = profile?['nombre'] as String?;
      if (nombre != null && nombre.isNotEmpty && mounted) {
        setState(() => _nombreCtrl.text = nombre);
      }
    } catch (_) {}
  }

  @override
  void dispose() {
    _model.dispose();
    _nombreCtrl.dispose();
    _peticionCtrl.dispose();
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _enviar() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _enviando = true);
    try {
      await SupabaseService.instance.crearOracion(
        nombre: _anonima ? 'Anónimo' : _nombreCtrl.text.trim(),
        peticion: _peticionCtrl.text.trim(),
        anonima: _anonima,
      );
      _nombreCtrl.clear();
      _peticionCtrl.clear();
      setState(() => _anonima = false);
      if (!mounted) return;
      _showSnack(context, '¡Petición enviada! La iglesia ora por ti.', success: true);
    } catch (_) {
      if (!mounted) return;
      _showSnack(context, 'Error al enviar. Intenta de nuevo.');
    } finally {
      if (mounted) setState(() => _enviando = false);
    }
  }

  void _showSnack(BuildContext ctx, String msg, {bool success = false}) {
    final width = MediaQuery.of(ctx).size.width;
    ScaffoldMessenger.of(ctx)
      ..clearSnackBars()
      ..showSnackBar(
        SnackBar(
          content: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                success
                    ? Icons.check_circle_rounded
                    : Icons.error_outline_rounded,
                color: Colors.white,
                size: 15,
              ),
              const SizedBox(width: 8),
              Flexible(
                  child: Text(msg,
                      style: const TextStyle(
                          fontSize: 13, color: Colors.white))),
            ],
          ),
          backgroundColor:
              success ? const Color(0xFF1A3A2A) : const Color(0xFF3A1A1A),
          behavior: SnackBarBehavior.floating,
          width: width > 480 ? 360.0 : width - 40,
          padding:
              const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12)),
          duration: const Duration(seconds: 3),
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
        padding: const EdgeInsets.fromLTRB(20, 24, 20, 48),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 900),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [

                // ── Header ────────────────────────────────────────────────────
                const Text(
                  'Intercede por\ntu comunidad',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 26,
                    fontWeight: FontWeight.w800,
                    height: 1.2,
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Comparte tu petición y ora junto a otros hermanos.',
                  style: TextStyle(color: Color(0xFF7A9ABF), fontSize: 14),
                ),
                const SizedBox(height: 24),

                // ── Formulario ────────────────────────────────────────────────
                Container(
                  decoration: BoxDecoration(
                    color: _surface,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: _border),
                  ),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // Header del form
                        Padding(
                          padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
                          child: Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: _accent.withOpacity(0.12),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: const Icon(
                                    Icons.volunteer_activism_rounded,
                                    color: _accent, size: 20),
                              ),
                              const SizedBox(width: 12),
                              const Text('Tu petición',
                                  style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 15,
                                      fontWeight: FontWeight.w700)),
                            ],
                          ),
                        ),
                        const SizedBox(height: 14),
                        Divider(height: 1, color: _border),
                        const SizedBox(height: 14),

                        // Nombre
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          child: AnimatedSize(
                            duration: const Duration(milliseconds: 200),
                            child: _anonima
                                ? const SizedBox.shrink()
                                : Column(
                                    children: [
                                      _buildField(
                                        controller: _nombreCtrl,
                                        hint: 'Tu nombre',
                                        icon: Icons.person_outline_rounded,
                                        validator: (v) =>
                                            v == null || v.trim().isEmpty
                                                ? 'Escribe tu nombre'
                                                : null,
                                      ),
                                      const SizedBox(height: 12),
                                    ],
                                  ),
                          ),
                        ),

                        // Petición
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          child: _buildField(
                            controller: _peticionCtrl,
                            hint: 'Cuéntanos tu petición...',
                            icon: Icons.edit_note_rounded,
                            maxLines: 4,
                            validator: (v) =>
                                v == null || v.trim().isEmpty
                                    ? 'Escribe tu petición'
                                    : null,
                          ),
                        ),
                        const SizedBox(height: 12),

                        // Toggle anónima
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          child: InkWell(
                            onTap: () => setState(() => _anonima = !_anonima),
                            borderRadius: BorderRadius.circular(10),
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 12, vertical: 10),
                              decoration: BoxDecoration(
                                color: _anonima
                                    ? const Color(0xFF1A0F20)
                                    : const Color(0xFF0A1628),
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(
                                  color: _anonima
                                      ? const Color(0xFF4A2060)
                                      : _border,
                                ),
                              ),
                              child: Row(
                                children: [
                                  Icon(
                                    _anonima
                                        ? Icons.visibility_off_rounded
                                        : Icons.visibility_rounded,
                                    color: _anonima
                                        ? const Color(0xFFB07FD4)
                                        : Colors.white38,
                                    size: 18,
                                  ),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: Text(
                                      'Enviar de forma anónima',
                                      style: TextStyle(
                                        color: _anonima
                                            ? const Color(0xFFB07FD4)
                                            : _muted,
                                        fontSize: 13,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                  ),
                                  Switch(
                                    value: _anonima,
                                    onChanged: (v) =>
                                        setState(() => _anonima = v),
                                    activeColor: const Color(0xFFB07FD4),
                                    materialTapTargetSize:
                                        MaterialTapTargetSize.shrinkWrap,
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 14),
                        Divider(height: 1, color: _border),

                        // Botón enviar
                        Padding(
                          padding: const EdgeInsets.all(16),
                          child: FilledButton(
                            onPressed: _enviando ? null : _enviar,
                            style: FilledButton.styleFrom(
                              backgroundColor: _accent,
                              foregroundColor: Colors.white,
                              padding:
                                  const EdgeInsets.symmetric(vertical: 14),
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12)),
                            ),
                            child: _enviando
                                ? const SizedBox(
                                    width: 20,
                                    height: 20,
                                    child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                        color: Colors.white))
                                : const Text('Enviar petición',
                                    style: TextStyle(
                                        fontSize: 15,
                                        fontWeight: FontWeight.w700)),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 32),

                // ── Peticiones de la comunidad ────────────────────────────────
                const Text(
                  'PETICIONES DE LA COMUNIDAD',
                  style: TextStyle(
                    color: Color(0xFF4A6A8A),
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 1.2,
                  ),
                ),
                const SizedBox(height: 12),

                // Búsqueda
                TextField(
                  controller: _searchCtrl,
                  style: const TextStyle(color: Colors.white, fontSize: 13),
                  onChanged: (v) => setState(() {
                    _searchQuery = v.toLowerCase();
                    _limite = 15;
                  }),
                  decoration: InputDecoration(
                    hintText: 'Buscar por nombre o petición...',
                    hintStyle: const TextStyle(
                        color: Colors.white38, fontSize: 13),
                    prefixIcon: const Icon(Icons.search_rounded,
                        color: Colors.white38, size: 18),
                    suffixIcon: _searchQuery.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.close_rounded,
                                color: Colors.white38, size: 16),
                            onPressed: () => setState(() {
                              _searchCtrl.clear();
                              _searchQuery = '';
                            }),
                          )
                        : null,
                    filled: true,
                    fillColor: _surface,
                    contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 10),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: const BorderSide(color: _border),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: const BorderSide(color: _border),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide:
                          const BorderSide(color: Color(0xFF2A4A6A)),
                    ),
                  ),
                ),
                const SizedBox(height: 10),

                // Filtros
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _filterChip('Todas', 'todas'),
                      const SizedBox(width: 8),
                      _filterChip('Mis peticiones', 'mias'),
                    ],
                  ),
                ),
                const SizedBox(height: 12),

                StreamBuilder<List<Oracion>>(
                  stream:
                      SupabaseService.instance.oracionesPublicasStream(),
                  builder: (context, snapshot) {
                    if (snapshot.connectionState ==
                        ConnectionState.waiting) {
                      return const Center(
                        child: Padding(
                          padding: EdgeInsets.symmetric(vertical: 32),
                          child: CircularProgressIndicator(
                              color: _accent, strokeWidth: 2),
                        ),
                      );
                    }
                    final uid = AuthService.instance.currentUser?.id;
                    var oraciones = snapshot.data ?? [];

                    // Filtro
                    if (_filtro == 'mias' && uid != null) {
                      oraciones = oraciones
                          .where((o) => o.autorUid == uid)
                          .toList();
                    }

                    // Búsqueda
                    if (_searchQuery.isNotEmpty) {
                      oraciones = oraciones.where((o) {
                        return o.nombre
                                .toLowerCase()
                                .contains(_searchQuery) ||
                            o.peticion
                                .toLowerCase()
                                .contains(_searchQuery);
                      }).toList();
                    }

                    if (oraciones.isEmpty) {
                      return Container(
                        padding: const EdgeInsets.all(32),
                        decoration: BoxDecoration(
                          color: _surface,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: _border),
                        ),
                        child: Column(
                          children: [
                            const Icon(Icons.favorite_outline_rounded,
                                color: Colors.white24, size: 40),
                            const SizedBox(height: 10),
                            Text(
                              _searchQuery.isNotEmpty || _filtro != 'todas'
                                  ? 'No se encontraron peticiones.'
                                  : 'Sé el primero en compartir\nuna petición.',
                              textAlign: TextAlign.center,
                                style: TextStyle(
                                    color: Colors.white38,
                                    fontSize: 14,
                                    height: 1.5)),
                          ],
                        ),
                      );
                    }
                    final total = oraciones.length;
                    final visibles = oraciones.take(_limite).toList();

                    return Column(
                      children: [
                        ...visibles.map(_buildOracionCard),
                        if (total > _limite)
                          Padding(
                            padding: const EdgeInsets.only(top: 4),
                            child: TextButton.icon(
                              onPressed: () =>
                                  setState(() => _limite += 15),
                              icon: const Icon(
                                  Icons.expand_more_rounded,
                                  size: 18,
                                  color: Color(0xFF4A6A8A)),
                              label: Text(
                                'Ver más (${total - _limite} restantes)',
                                style: const TextStyle(
                                    color: Color(0xFF4A6A8A),
                                    fontSize: 13),
                              ),
                            ),
                          ),
                        if (total <= _limite && total > 15)
                          Padding(
                            padding: const EdgeInsets.only(top: 4),
                            child: TextButton.icon(
                              onPressed: () =>
                                  setState(() => _limite = 15),
                              icon: const Icon(
                                  Icons.expand_less_rounded,
                                  size: 18,
                                  color: Color(0xFF4A6A8A)),
                              label: const Text('Ver menos',
                                  style: TextStyle(
                                      color: Color(0xFF4A6A8A),
                                      fontSize: 13)),
                            ),
                          ),
                      ],
                    );
                  },
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildField({
    required TextEditingController controller,
    required String hint,
    required IconData icon,
    int maxLines = 1,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      maxLines: maxLines,
      validator: validator,
      style: const TextStyle(color: Colors.white, fontSize: 14),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(color: Colors.white38, fontSize: 14),
        prefixIcon: Padding(
          padding: const EdgeInsets.only(top: 2),
          child: Icon(icon, color: Colors.white38, size: 18),
        ),
        prefixIconConstraints:
            const BoxConstraints(minWidth: 44, minHeight: 44),
        filled: true,
        fillColor: const Color(0xFF080E1E),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: Color(0xFF1E2E4A)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: Color(0xFF1E2E4A)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: _accent),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: _accent),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: _accent),
        ),
      ),
    );
  }

  Widget _filterChip(String label, String value) {
    final active = _filtro == value;
    return GestureDetector(
      onTap: () => setState(() {
        _filtro = value;
        _limite = 15;
      }),
      child: Container(
        padding:
            const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: active ? const Color(0xFF1A2B42) : _surface,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: active
                ? const Color(0xFF2A4A6A)
                : _border,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: active ? Colors.white : const Color(0xFF4A6A8A),
            fontSize: 12,
            fontWeight:
                active ? FontWeight.w700 : FontWeight.w500,
          ),
        ),
      ),
    );
  }

  Widget _buildOracionCard(Oracion oracion) {
    final fecha = DateFormat('d MMM', 'es').format(oracion.fecha);
    final uid   = AuthService.instance.currentUser?.id;
    final yaOro = uid != null && oracion.orantesUids.contains(uid);

    final initials = oracion.nombre.isNotEmpty
        ? oracion.nombre.trim().split(' ').take(2).map((w) => w[0]).join()
        : '?';

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: _surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: _border),
      ),
      child: Padding(
        padding: const EdgeInsets.fromLTRB(12, 12, 12, 10),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header compacto
            Row(
              children: [
                Container(
                  width: 30,
                  height: 30,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: _accent.withOpacity(0.08),
                    border: Border.all(
                        color: _accent.withOpacity(0.2), width: 1.2),
                  ),
                  alignment: Alignment.center,
                  child: oracion.anonima
                      ? const Icon(Icons.person_outline_rounded,
                          color: Color(0xFF7A4A5A), size: 14)
                      : Text(
                          initials.toUpperCase(),
                          style: const TextStyle(
                              color: Color(0xFFCC6677),
                              fontSize: 11,
                              fontWeight: FontWeight.w700),
                        ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    oracion.nombre,
                    style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                        fontSize: 13),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Text(fecha,
                    style: const TextStyle(
                        color: Color(0xFF4A6A8A), fontSize: 11)),
              ],
            ),
            const SizedBox(height: 8),

            // Texto (máx 3 líneas)
            Text(
              oracion.peticion,
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                  color: _muted, fontSize: 13, height: 1.5),
            ),
            const SizedBox(height: 10),

            // Botón "Orar por"
            GestureDetector(
              onTap: () async {
                if (uid == null) {
                  context.pushNamed(UserLoginPageWidget.routeName);
                  return;
                }
                if (yaOro) return;
                await SupabaseService.instance.orarPor(oracion.id, uid);
              },
              child: Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: yaOro
                      ? const Color(0xFF0F2A1A)
                      : const Color(0xFF0A1628),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: yaOro
                        ? const Color(0xFF2D6A3A)
                        : _border,
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
                          : const Color(0xFF4A6A8A),
                      size: 13,
                    ),
                    const SizedBox(width: 5),
                    Text(
                      yaOro
                          ? 'Orando · ${oracion.orantes}'
                          : 'Orar por · ${oracion.orantes}',
                      style: TextStyle(
                        color: yaOro
                            ? const Color(0xFF4CAF50)
                            : const Color(0xFF4A6A8A),
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
