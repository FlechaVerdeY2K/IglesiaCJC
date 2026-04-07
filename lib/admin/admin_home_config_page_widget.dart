import 'package:flutter/material.dart';
import '/backend/firebase_service.dart';
import '/flutter_flow/flutter_flow_util.dart';

class AdminHomeConfigPageWidget extends StatefulWidget {
  const AdminHomeConfigPageWidget({super.key});

  static String routeName = 'AdminHomeConfigPage';
  static String routePath = '/adminHomeConfig';

  @override
  State<AdminHomeConfigPageWidget> createState() =>
      _AdminHomeConfigPageWidgetState();
}

class _AdminHomeConfigPageWidgetState
    extends State<AdminHomeConfigPageWidget> {
  static const Color _bg = Color(0xFF080E1E);
  static const Color _accent = Color(0xFFBF1E2E);

  // Bienvenida
  final _tituloCtrl = TextEditingController();
  final _textoCtrl = TextEditingController();
  // Servicios
  final _serviciosCtrl = TextEditingController();
  // Contacto
  final _telefonoCtrl = TextEditingController();
  final _wazeCtrl = TextEditingController();
  // Redes
  final _youtubeCtrl = TextEditingController();
  final _instagramCtrl = TextEditingController();
  final _facebookCtrl = TextEditingController();

  bool _loading = true;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _loadConfig();
  }

  Future<void> _loadConfig() async {
    final config = await FirebaseService.instance.getHomeConfig();
    _tituloCtrl.text = config.bienvenidaTitulo;
    _textoCtrl.text = config.bienvenidaTexto;
    _serviciosCtrl.text = config.serviciosTexto;
    _telefonoCtrl.text = config.telefono;
    _wazeCtrl.text = config.wazeUrl;
    _youtubeCtrl.text = config.youtubeUrl;
    _instagramCtrl.text = config.instagramUrl;
    _facebookCtrl.text = config.facebookUrl;
    if (mounted) setState(() => _loading = false);
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    try {
      await FirebaseService.instance.saveHomeConfig(HomeConfig(
        bienvenidaTitulo: _tituloCtrl.text.trim(),
        bienvenidaTexto: _textoCtrl.text.trim(),
        serviciosTexto: _serviciosCtrl.text.trim(),
        telefono: _telefonoCtrl.text.trim(),
        wazeUrl: _wazeCtrl.text.trim(),
        youtubeUrl: _youtubeCtrl.text.trim(),
        instagramUrl: _instagramCtrl.text.trim(),
        facebookUrl: _facebookCtrl.text.trim(),
      ));
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Home actualizado'),
            backgroundColor: Color(0xFF1E3A1E),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  void dispose() {
    _tituloCtrl.dispose();
    _textoCtrl.dispose();
    _serviciosCtrl.dispose();
    _telefonoCtrl.dispose();
    _wazeCtrl.dispose();
    _youtubeCtrl.dispose();
    _instagramCtrl.dispose();
    _facebookCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _bg,
      appBar: AppBar(
        backgroundColor: const Color(0xFF0D1628),
        elevation: 0,
        leading: IconButton(
          icon:
              const Icon(Icons.arrow_back_ios_rounded, color: Colors.white),
          onPressed: () => context.safePop(),
        ),
        title: const Text('Editar Home',
            style: TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.w700)),
        centerTitle: true,
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 8),
            child: TextButton(
              onPressed: _saving ? null : _save,
              child: _saving
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: _accent))
                  : const Text('Guardar',
                      style: TextStyle(
                          color: _accent,
                          fontWeight: FontWeight.w700,
                          fontSize: 15)),
            ),
          ),
        ],
      ),
      body: _loading
          ? const Center(
              child: CircularProgressIndicator(color: _accent))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _sectionLabel('BIENVENIDA'),
                  const SizedBox(height: 12),
                  _Field(
                      controller: _tituloCtrl,
                      label: 'Título',
                      maxLines: 1),
                  const SizedBox(height: 12),
                  _Field(
                      controller: _textoCtrl,
                      label: 'Texto de bienvenida',
                      maxLines: 10),
                  const SizedBox(height: 24),
                  _sectionLabel('SERVICIOS'),
                  const SizedBox(height: 8),
                  const Text(
                    'Usá saltos de línea para separar cada ítem',
                    style:
                        TextStyle(color: Colors.white38, fontSize: 12),
                  ),
                  const SizedBox(height: 12),
                  _Field(
                      controller: _serviciosCtrl,
                      label: 'Horarios y servicios',
                      maxLines: 8),
                  const SizedBox(height: 24),
                  _sectionLabel('CONTACTO'),
                  const SizedBox(height: 12),
                  _Field(
                      controller: _telefonoCtrl,
                      label: 'Teléfono (ej: tel:+50670939483)',
                      maxLines: 1),
                  const SizedBox(height: 12),
                  _Field(
                      controller: _wazeCtrl,
                      label: 'URL Google Maps',
                      maxLines: 1),
                  const SizedBox(height: 24),
                  _sectionLabel('REDES SOCIALES'),
                  const SizedBox(height: 12),
                  _Field(
                      controller: _youtubeCtrl,
                      label: 'URL YouTube',
                      maxLines: 1),
                  const SizedBox(height: 12),
                  _Field(
                      controller: _instagramCtrl,
                      label: 'URL Instagram',
                      maxLines: 1),
                  const SizedBox(height: 12),
                  _Field(
                      controller: _facebookCtrl,
                      label: 'URL Facebook',
                      maxLines: 1),
                  const SizedBox(height: 32),
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton(
                      onPressed: _saving ? null : _save,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: _accent,
                        foregroundColor: Colors.black,
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12)),
                      ),
                      child: _saving
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: Colors.black))
                          : const Text('Guardar cambios',
                              style: TextStyle(
                                  fontWeight: FontWeight.w700,
                                  fontSize: 15)),
                    ),
                  ),
                  const SizedBox(height: 20),
                ],
              ),
            ),
    );
  }

  Widget _sectionLabel(String text) => Text(
        text,
        style: const TextStyle(
          color: Color(0xFFBF1E2E),
          fontSize: 11,
          fontWeight: FontWeight.w700,
          letterSpacing: 1.2,
        ),
      );
}

class _Field extends StatelessWidget {
  final TextEditingController controller;
  final String label;
  final int maxLines;

  const _Field(
      {required this.controller,
      required this.label,
      required this.maxLines});

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      maxLines: maxLines,
      style: const TextStyle(color: Colors.white, fontSize: 14),
      decoration: InputDecoration(
        labelText: label,
        labelStyle:
            const TextStyle(color: Color(0xFFB5B5B5), fontSize: 13),
        filled: true,
        fillColor: const Color(0xFF111D2E),
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
          borderSide:
              const BorderSide(color: Color(0xFFBF1E2E), width: 1.5),
        ),
      ),
    );
  }
}
