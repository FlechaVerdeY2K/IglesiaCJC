import '/backend/firebase_service.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'package:flutter/material.dart';
import 'creacion_gps_page_model.dart';
export 'creacion_gps_page_model.dart';

class CreacionGpsPageWidget extends StatefulWidget {
  const CreacionGpsPageWidget({super.key});

  static String routeName = 'creacionGpsPage';
  static String routePath = '/creacionGpsPage';

  @override
  State<CreacionGpsPageWidget> createState() => _CreacionGpsPageWidgetState();
}

class _CreacionGpsPageWidgetState extends State<CreacionGpsPageWidget> {
  static const Color _bg = Color(0xFF050505);
  static const Color _surface = Color(0xFF171717);
  static const Color _accent = Color(0xFFE8D5B0);
  static const Color _muted = Color(0xFFB5B5B5);
  static const Color _divider = Color(0xFF2B2B2B);

  late CreacionGpsPageModel _model;
  final scaffoldKey = GlobalKey<ScaffoldState>();

  final _nombreLiderCtrl = TextEditingController();
  final _telefonoCtrl = TextEditingController();
  final _barrioCtrl = TextEditingController();
  final _personasCtrl = TextEditingController();
  final Set<String> _diasSeleccionados = {};
  bool _submitting = false;
  bool _submitted = false;

  final _dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => CreacionGpsPageModel());
    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  @override
  void dispose() {
    _nombreLiderCtrl.dispose();
    _telefonoCtrl.dispose();
    _barrioCtrl.dispose();
    _personasCtrl.dispose();
    _model.dispose();
    super.dispose();
  }

  Future<void> _enviar() async {
    if (_nombreLiderCtrl.text.trim().isEmpty ||
        _telefonoCtrl.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('Por favor completa nombre y teléfono')),
      );
      return;
    }
    setState(() => _submitting = true);
    try {
      await FirebaseService.instance.solicitarCreacionGPS({
        'nombreLider': _nombreLiderCtrl.text.trim(),
        'telefono': _telefonoCtrl.text.trim(),
        'barrio': _barrioCtrl.text.trim(),
        'diasDisponibles': _diasSeleccionados.toList(),
        'personasEstimadas': _personasCtrl.text.trim(),
      });
      setState(() => _submitted = true);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error al enviar: $e')),
      );
    } finally {
      setState(() => _submitting = false);
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
          'Crear GPS',
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
      body: _submitted ? _buildSuccess() : _buildForm(),
    );
  }

  Widget _buildSuccess() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: _accent.withOpacity(0.15),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.check_rounded, color: _accent, size: 48),
            ),
            const SizedBox(height: 24),
            const Text('¡Solicitud enviada!',
                style: TextStyle(
                    color: Colors.white,
                    fontSize: 22,
                    fontWeight: FontWeight.w700)),
            const SizedBox(height: 12),
            const Text(
              'Tu solicitud para iniciar un grupo GPS fue recibida. El equipo pastoral te contactará pronto.',
              textAlign: TextAlign.center,
              style: TextStyle(color: _muted, fontSize: 15, height: 1.5),
            ),
            const SizedBox(height: 32),
            FFButtonWidget(
              onPressed: () => context.safePop(),
              text: 'Volver al inicio',
              options: FFButtonOptions(
                width: 200,
                height: 48,
                color: _accent,
                textStyle: const TextStyle(
                    color: Colors.black,
                    fontWeight: FontWeight.w700,
                    fontSize: 15),
                borderRadius: BorderRadius.circular(24),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildForm() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: _accent.withOpacity(0.08),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: _accent.withOpacity(0.2)),
            ),
            child: Row(
              children: [
                const Icon(Icons.add_circle_outline_rounded,
                    color: _accent, size: 28),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text('¿Quieres iniciar un GPS?',
                          style: TextStyle(
                              color: _accent,
                              fontWeight: FontWeight.w700,
                              fontSize: 15)),
                      SizedBox(height: 4),
                      Text(
                        'Cuéntanos sobre ti y tu disponibilidad. El equipo pastoral te acompañará en este proceso.',
                        style:
                            TextStyle(color: _muted, fontSize: 13, height: 1.4),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 28),
          _buildLabel('Nombre del líder *'),
          _buildTextField(_nombreLiderCtrl, 'Tu nombre completo',
              TextInputType.name),
          const SizedBox(height: 16),
          _buildLabel('Teléfono *'),
          _buildTextField(
              _telefonoCtrl, 'Ej: 8888-8888', TextInputType.phone),
          const SizedBox(height: 16),
          _buildLabel('Barrio / Zona donde se realizaría el GPS'),
          _buildTextField(_barrioCtrl, 'Ej: Heredia, San José...',
              TextInputType.streetAddress),
          const SizedBox(height: 16),
          _buildLabel('Personas estimadas para el grupo'),
          _buildTextField(
              _personasCtrl, 'Ej: 8', TextInputType.number),
          const SizedBox(height: 16),
          _buildLabel('Días disponibles'),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _dias.map((dia) {
              final selected = _diasSeleccionados.contains(dia);
              return FilterChip(
                label: Text(dia),
                selected: selected,
                onSelected: (val) {
                  setState(() {
                    if (val) {
                      _diasSeleccionados.add(dia);
                    } else {
                      _diasSeleccionados.remove(dia);
                    }
                  });
                },
                selectedColor: _accent,
                backgroundColor: _surface,
                checkmarkColor: Colors.black,
                labelStyle: TextStyle(
                  color: selected ? Colors.black : _muted,
                  fontWeight:
                      selected ? FontWeight.w700 : FontWeight.w400,
                ),
                side: BorderSide(
                    color: selected ? _accent : _divider),
              );
            }).toList(),
          ),
          const SizedBox(height: 32),
          SizedBox(
            width: double.infinity,
            child: FFButtonWidget(
              onPressed: _submitting ? null : _enviar,
              text: _submitting ? 'Enviando...' : 'Enviar solicitud',
              options: FFButtonOptions(
                height: 52,
                color: _accent,
                textStyle: const TextStyle(
                    color: Colors.black,
                    fontWeight: FontWeight.w700,
                    fontSize: 16),
                borderRadius: BorderRadius.circular(26),
                disabledColor: _accent.withOpacity(0.5),
                disabledTextColor: Colors.black54,
              ),
            ),
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }

  Widget _buildLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(text,
          style: const TextStyle(color: _muted, fontSize: 13)),
    );
  }

  Widget _buildTextField(TextEditingController ctrl, String hint,
      TextInputType keyboardType) {
    return TextFormField(
      controller: ctrl,
      keyboardType: keyboardType,
      style: const TextStyle(color: Colors.white),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(color: Colors.white38, fontSize: 14),
        filled: true,
        fillColor: _surface,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: _divider),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: _divider),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: _accent),
        ),
      ),
    );
  }
}
