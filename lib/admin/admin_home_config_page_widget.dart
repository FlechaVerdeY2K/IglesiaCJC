import 'package:flutter/material.dart';
import '/backend/supabase_service.dart';
import '/backend/cloudinary_service.dart';
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

  String _heroImageUrl = '';
  String _serviciosImageUrl = '';
  bool _uploadingHero = false;
  bool _uploadingSvc = false;
  bool _loading = true;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _loadConfig();
  }

  Future<void> _loadConfig() async {
    final config = await SupabaseService.instance.getHomeConfig();
    _tituloCtrl.text = config.bienvenidaTitulo;
    _textoCtrl.text = config.bienvenidaTexto;
    _serviciosCtrl.text = config.serviciosTexto;
    _telefonoCtrl.text = config.telefono;
    _wazeCtrl.text = config.wazeUrl;
    _youtubeCtrl.text = config.youtubeUrl;
    _instagramCtrl.text = config.instagramUrl;
    _facebookCtrl.text = config.facebookUrl;
    if (mounted) setState(() {
      _heroImageUrl = config.heroImageUrl;
      _serviciosImageUrl = config.serviciosImageUrl;
      _loading = false;
    });
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    try {
      await SupabaseService.instance.saveHomeConfig(HomeConfig(
        bienvenidaTitulo: _tituloCtrl.text.trim(),
        bienvenidaTexto: _textoCtrl.text.trim(),
        serviciosTexto: _serviciosCtrl.text.trim(),
        telefono: _telefonoCtrl.text.trim(),
        wazeUrl: _wazeCtrl.text.trim(),
        youtubeUrl: _youtubeCtrl.text.trim(),
        instagramUrl: _instagramCtrl.text.trim(),
        facebookUrl: _facebookCtrl.text.trim(),
        heroImageUrl: _heroImageUrl,
        serviciosImageUrl: _serviciosImageUrl,
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
                  _sectionLabel('IMÁGENES'),
                  const SizedBox(height: 12),
                  _ImagePicker(
                    label: 'Foto principal (Hero)',
                    imageUrl: _heroImageUrl,
                    uploading: _uploadingHero,
                    onTap: () async {
                      setState(() => _uploadingHero = true);
                      try {
                        final url = await CloudinaryService.instance
                            .pickAndUpload(folder: 'home');
                        if (url != null && mounted) setState(() => _heroImageUrl = url);
                      } finally {
                        if (mounted) setState(() => _uploadingHero = false);
                      }
                    },
                    onRemove: () => setState(() => _heroImageUrl = ''),
                  ),
                  const SizedBox(height: 12),
                  _ImagePicker(
                    label: 'Foto Servicios',
                    imageUrl: _serviciosImageUrl,
                    uploading: _uploadingSvc,
                    onTap: () async {
                      setState(() => _uploadingSvc = true);
                      try {
                        final url = await CloudinaryService.instance
                            .pickAndUpload(folder: 'home');
                        if (url != null && mounted) setState(() => _serviciosImageUrl = url);
                      } finally {
                        if (mounted) setState(() => _uploadingSvc = false);
                      }
                    },
                    onRemove: () => setState(() => _serviciosImageUrl = ''),
                  ),
                  const SizedBox(height: 24),
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

class _ImagePicker extends StatelessWidget {
  final String label;
  final String imageUrl;
  final bool uploading;
  final VoidCallback onTap;
  final VoidCallback onRemove;

  const _ImagePicker({
    required this.label,
    required this.imageUrl,
    required this.uploading,
    required this.onTap,
    required this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    const accent = Color(0xFFBF1E2E);
    const surface = Color(0xFF111D2E);
    const border = Color(0xFF1E2E4A);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label,
            style: const TextStyle(
                color: Colors.white60, fontSize: 12, fontWeight: FontWeight.w600)),
        const SizedBox(height: 8),
        ClipRRect(
          borderRadius: BorderRadius.circular(10),
          child: Stack(
            children: [
              // Preview o placeholder
              Container(
                height: 150,
                width: double.infinity,
                color: surface,
                child: imageUrl.isNotEmpty
                    ? Image.network(imageUrl, fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => const Center(
                            child: Icon(Icons.broken_image_rounded,
                                color: Colors.white24, size: 40)))
                    : const Center(
                        child: Icon(Icons.image_outlined,
                            color: Colors.white24, size: 40)),
              ),
              // Overlay con botones
              Positioned.fill(
                child: Container(
                  decoration: BoxDecoration(
                    border: Border.all(color: border),
                    borderRadius: BorderRadius.circular(10),
                    color: Colors.black.withOpacity(imageUrl.isNotEmpty ? 0.35 : 0),
                  ),
                  child: uploading
                      ? const Center(
                          child: CircularProgressIndicator(
                              color: Colors.white, strokeWidth: 2))
                      : Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            _btn(
                              icon: imageUrl.isNotEmpty
                                  ? Icons.swap_horiz_rounded
                                  : Icons.upload_rounded,
                              label: imageUrl.isNotEmpty ? 'Cambiar' : 'Subir foto',
                              color: accent,
                              onTap: onTap,
                            ),
                            if (imageUrl.isNotEmpty) ...[
                              const SizedBox(width: 12),
                              _btn(
                                icon: Icons.delete_outline_rounded,
                                label: 'Quitar',
                                color: Colors.white54,
                                onTap: onRemove,
                              ),
                            ],
                          ],
                        ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _btn({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: Colors.black54,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: color.withOpacity(0.6)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: color, size: 16),
            const SizedBox(width: 6),
            Text(label,
                style: TextStyle(
                    color: color, fontSize: 13, fontWeight: FontWeight.w600)),
          ],
        ),
      ),
    );
  }
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
