import 'package:flutter/material.dart';
import '/backend/firebase_service.dart';
import '/flutter_flow/flutter_flow_util.dart';

class AdminLivePageWidget extends StatefulWidget {
  const AdminLivePageWidget({super.key});

  static String routeName = 'AdminLivePage';
  static String routePath = '/adminLive';

  @override
  State<AdminLivePageWidget> createState() => _AdminLivePageWidgetState();
}

class _AdminLivePageWidgetState extends State<AdminLivePageWidget> {
  static const Color _bg = Color(0xFF080E1E);
  static const Color _surface = Color(0xFF0F1C30);
  static const Color _accent = Color(0xFFBF1E2E);
  static const Color _muted = Color(0xFFB5B5B5);
  static const Color _border = Color(0xFF1E2E4A);

  final _videoIdCtrl = TextEditingController();
  final _tituloCtrl = TextEditingController();
  final _descripcionCtrl = TextEditingController();
  bool _activo = false;
  bool _loading = true;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _loadConfig();
  }

  @override
  void dispose() {
    _videoIdCtrl.dispose();
    _tituloCtrl.dispose();
    _descripcionCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadConfig() async {
    final config = await FirebaseService.instance.getLiveConfig();
    if (!mounted) return;
    if (config != null) {
      _videoIdCtrl.text = config.videoId;
      _tituloCtrl.text = config.titulo;
      _descripcionCtrl.text = config.descripcion;
      _activo = config.activo;
    }
    setState(() => _loading = false);
  }

  Future<void> _guardar() async {
    if (_videoIdCtrl.text.trim().isEmpty) {
      _showSnack('El Video ID es obligatorio.', error: true);
      return;
    }
    setState(() => _saving = true);
    try {
      await FirebaseService.instance.saveLiveConfig(
        videoId: _videoIdCtrl.text,
        titulo: _tituloCtrl.text,
        descripcion: _descripcionCtrl.text,
        activo: _activo,
      );
      if (mounted) _showSnack('Configuración guardada.');
    } catch (_) {
      if (mounted) _showSnack('Error al guardar.', error: true);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  void _showSnack(String msg, {bool error = false}) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg, style: const TextStyle(color: Colors.white)),
      backgroundColor: error ? const Color(0xFFB00020) : const Color(0xFF2E7D32),
      behavior: SnackBarBehavior.floating,
      margin: const EdgeInsets.all(16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
    ));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _bg,
      appBar: AppBar(
        backgroundColor: const Color(0xFF0D1628),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_rounded, color: Colors.white),
          onPressed: () => context.safePop(),
        ),
        title: const Text('Config. Live',
            style: TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.w700)),
        centerTitle: true,
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: _accent))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Estado actual
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: _activo
                          ? const Color(0xFF1B3A1B)
                          : const Color(0xFF0D1628),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: _activo
                            ? const Color(0xFF4CAF50)
                            : _border,
                      ),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 10,
                          height: 10,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: _activo
                                ? const Color(0xFF4CAF50)
                                : Colors.white24,
                          ),
                        ),
                        const SizedBox(width: 10),
                        Text(
                          _activo ? 'TRANSMISIÓN ACTIVA' : 'TRANSMISIÓN INACTIVA',
                          style: TextStyle(
                            color: _activo
                                ? const Color(0xFF4CAF50)
                                : Colors.white54,
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 0.8,
                          ),
                        ),
                        const Spacer(),
                        Switch(
                          value: _activo,
                          onChanged: (v) => setState(() => _activo = v),
                          activeColor: const Color(0xFF4CAF50),
                          inactiveThumbColor: Colors.white38,
                          inactiveTrackColor: Colors.white12,
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),

                  _buildField(
                    controller: _videoIdCtrl,
                    label: 'Video ID de YouTube',
                    hint: 'ej. dQw4w9WgXcQ',
                    icon: Icons.play_circle_outline_rounded,
                    helperText: 'ID del video en vivo (parte final de la URL de YouTube)',
                  ),
                  const SizedBox(height: 16),
                  _buildField(
                    controller: _tituloCtrl,
                    label: 'Título',
                    hint: 'ej. Culto Dominical',
                    icon: Icons.title_rounded,
                  ),
                  const SizedBox(height: 16),
                  _buildField(
                    controller: _descripcionCtrl,
                    label: 'Descripción',
                    hint: 'ej. Domingo 10:00 AM',
                    icon: Icons.info_outline_rounded,
                    maxLines: 3,
                  ),

                  const SizedBox(height: 32),

                  SizedBox(
                    height: 50,
                    child: ElevatedButton(
                      onPressed: _saving ? null : _guardar,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: _accent,
                        foregroundColor: Colors.black,
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12)),
                      ),
                      child: _saving
                          ? const SizedBox(
                              height: 22,
                              width: 22,
                              child: CircularProgressIndicator(
                                  strokeWidth: 2, color: Colors.black54))
                          : const Text('Guardar configuración',
                              style: TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w700)),
                    ),
                  ),

                  const SizedBox(height: 20),

                  // Ayuda
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: _surface,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: _border),
                    ),
                    child: const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Cómo obtener el Video ID',
                            style: TextStyle(
                                color: _accent,
                                fontSize: 13,
                                fontWeight: FontWeight.w600)),
                        SizedBox(height: 8),
                        Text(
                          '1. Abrí el video en YouTube\n'
                          '2. Copiá la URL: youtube.com/watch?v=XXXX\n'
                          '3. El Video ID es el código después de "v="',
                          style: TextStyle(color: _muted, fontSize: 12, height: 1.6),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildField({
    required TextEditingController controller,
    required String label,
    required String hint,
    required IconData icon,
    int maxLines = 1,
    String? helperText,
  }) {
    return TextField(
      controller: controller,
      maxLines: maxLines,
      style: const TextStyle(color: Colors.white, fontSize: 15),
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        helperText: helperText,
        labelStyle: const TextStyle(color: Colors.white54),
        hintStyle: const TextStyle(color: Colors.white24),
        helperStyle: const TextStyle(color: _muted, fontSize: 11),
        prefixIcon: Icon(icon, color: Colors.white38, size: 20),
        filled: true,
        fillColor: _surface,
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: _border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: _accent),
        ),
      ),
    );
  }
}
