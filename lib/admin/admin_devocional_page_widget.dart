import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '/backend/supabase_service.dart';
import '/flutter_flow/flutter_flow_util.dart';

class AdminDevocionalPageWidget extends StatelessWidget {
  const AdminDevocionalPageWidget({super.key});

  static String routeName = 'AdminDevocionalPage';
  static String routePath = '/adminDevocional';

  static const Color _bg = Color(0xFF080E1E);
  static const Color _surface = Color(0xFF0F1C30);
  static const Color _accent = Color(0xFFBF1E2E);
  static const Color _muted = Color(0xFFB5B5B5);

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
        title: const Text('Devocionales',
            style: TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.w700)),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.add_rounded, color: _accent),
            tooltip: 'Nuevo devocional',
            onPressed: () => _showForm(context, null),
          ),
        ],
      ),
      body: StreamBuilder<List<Devocional>>(
        stream: SupabaseService.instance.devoccionalesStream(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(
                child: CircularProgressIndicator(color: _accent));
          }
          final devs = snapshot.data ?? [];
          if (devs.isEmpty) {
            return const Center(
              child: Padding(
                padding: EdgeInsets.all(32),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.menu_book_rounded,
                        color: Colors.white24, size: 56),
                    SizedBox(height: 16),
                    Text('No hay devocionales aún',
                        style: TextStyle(color: Colors.white54, fontSize: 15)),
                  ],
                ),
              ),
            );
          }
          return ListView.separated(
            padding: const EdgeInsets.fromLTRB(16, 20, 16, 32),
            itemCount: devs.length,
            separatorBuilder: (_, __) => const SizedBox(height: 10),
            itemBuilder: (_, i) => _DevCard(
              dev: devs[i],
              isToday: _isToday(devs[i].fecha),
              onEdit: () => _showForm(context, devs[i]),
              onDelete: () => _confirmDelete(context, devs[i]),
            ),
          );
        },
      ),
    );
  }

  void _showForm(BuildContext context, Devocional? dev) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _DevocionalForm(dev: dev),
    );
  }

  bool _isToday(DateTime fecha) {
    final now = DateTime.now();
    return fecha.year == now.year && fecha.month == now.month && fecha.day == now.day;
  }

  void _confirmDelete(BuildContext context, Devocional dev) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: const Color(0xFF111D2E),
        title: const Text('Eliminar devocional',
            style: TextStyle(color: Colors.white)),
        content: Text(
          '¿Eliminar "${dev.titulo.isNotEmpty ? dev.titulo : dev.referencia}"?',
          style: const TextStyle(color: Color(0xFFB5B5B5)),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancelar',
                style: TextStyle(color: Colors.white54)),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(context);
              await SupabaseService.instance.eliminarDevocional(dev.id);
            },
            child: const Text('Eliminar',
                style: TextStyle(color: Colors.redAccent)),
          ),
        ],
      ),
    );
  }
}

class _DevCard extends StatelessWidget {
  final Devocional dev;
  final bool isToday;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  const _DevCard({
    required this.dev,
    required this.onEdit,
    required this.onDelete,
    this.isToday = false,
  });

  static const Color _surface = Color(0xFF0F1C30);
  static const Color _accent = Color(0xFFBF1E2E);
  static const Color _muted = Color(0xFFB5B5B5);
  static const Color _gold = Color(0xFFD4A017);

  @override
  Widget build(BuildContext context) {
    final fecha = DateFormat('d MMM yyyy', 'es').format(dev.fecha);
    final color = isToday ? _gold : _accent;

    return Container(
      decoration: BoxDecoration(
        color: _surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: isToday ? _gold.withOpacity(0.4) : const Color(0xFF1E2E4A),
        ),
      ),
      child: IntrinsicHeight(
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Barra lateral de color
            Container(
              width: 4,
              decoration: BoxDecoration(
                color: color,
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(14),
                  bottomLeft: Radius.circular(14),
                ),
              ),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(14, 12, 12, 12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.auto_stories_rounded, color: color, size: 14),
                        const SizedBox(width: 6),
                        Text(
                          isToday ? 'HOY · $fecha' : fecha,
                          style: TextStyle(
                            color: isToday ? _gold : _muted,
                            fontSize: 11,
                            fontWeight: isToday ? FontWeight.w700 : FontWeight.w400,
                            letterSpacing: isToday ? 0.5 : 0,
                          ),
                        ),
                        const Spacer(),
                        GestureDetector(
                          onTap: onEdit,
                          child: const Icon(Icons.edit_rounded,
                              color: Colors.white38, size: 18),
                        ),
                        const SizedBox(width: 14),
                        GestureDetector(
                          onTap: onDelete,
                          child: const Icon(Icons.delete_outline_rounded,
                              color: Colors.redAccent, size: 18),
                        ),
                      ],
                    ),
                    if (dev.titulo.isNotEmpty) ...[  
                      const SizedBox(height: 7),
                      Text(
                        dev.titulo,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                    const SizedBox(height: 6),
                    Text(
                      '"${dev.versiculo}"',
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 13,
                        fontStyle: FontStyle.italic,
                        height: 1.4,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '— ${dev.referencia}',
                      style: TextStyle(
                        color: color,
                        fontSize: 12,
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

class _DevocionalForm extends StatefulWidget {
  final Devocional? dev;
  const _DevocionalForm({this.dev});

  @override
  State<_DevocionalForm> createState() => _DevocionalFormState();
}

class _DevocionalFormState extends State<_DevocionalForm> {
  static const Color _bg = Color(0xFF080E1E);
  static const Color _accent = Color(0xFFBF1E2E);
  static const Color _muted = Color(0xFFB5B5B5);

  final _tituloCtrl = TextEditingController();
  final _versiculoCtrl = TextEditingController();
  final _referenciaCtrl = TextEditingController();
  final _reflexionCtrl = TextEditingController();
  DateTime _fecha = DateTime.now();
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    if (widget.dev != null) {
      _tituloCtrl.text = widget.dev!.titulo;
      _versiculoCtrl.text = widget.dev!.versiculo;
      _referenciaCtrl.text = widget.dev!.referencia;
      _reflexionCtrl.text = widget.dev!.reflexion;
      _fecha = widget.dev!.fecha;
    }
  }

  @override
  void dispose() {
    _tituloCtrl.dispose();
    _versiculoCtrl.dispose();
    _referenciaCtrl.dispose();
    _reflexionCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _fecha,
      firstDate: DateTime(2020),
      lastDate: DateTime(2030),
      builder: (context, child) => Theme(
        data: ThemeData.dark(),
        child: child!,
      ),
    );
    if (picked != null) setState(() => _fecha = picked);
  }

  Future<void> _save() async {
    if (_versiculoCtrl.text.trim().isEmpty ||
        _referenciaCtrl.text.trim().isEmpty) return;
    setState(() => _loading = true);
    try {
      if (widget.dev == null) {
        await SupabaseService.instance.crearDevocional(
          titulo: _tituloCtrl.text,
          versiculo: _versiculoCtrl.text,
          referencia: _referenciaCtrl.text,
          reflexion: _reflexionCtrl.text,
          fecha: _fecha,
        );
      } else {
        await SupabaseService.instance.actualizarDevocional(
          widget.dev!.id,
          titulo: _tituloCtrl.text,
          versiculo: _versiculoCtrl.text,
          referencia: _referenciaCtrl.text,
          reflexion: _reflexionCtrl.text,
          fecha: _fecha,
        );
      }
      if (mounted) Navigator.pop(context);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isEdit = widget.dev != null;
    final fechaStr = DateFormat('d MMM yyyy', 'es').format(_fecha);

    return Padding(
      padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom),
      child: Container(
        decoration: const BoxDecoration(
          color: Color(0xFF080E1E),
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Handle
              Center(
                child: Container(
                  width: 36, height: 4,
                  decoration: BoxDecoration(
                    color: Colors.white24,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Título del form
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: const Color(0xFFD4A017).withOpacity(0.15),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.auto_stories_rounded,
                        color: Color(0xFFD4A017), size: 20),
                  ),
                  const SizedBox(width: 12),
                  Text(
                    isEdit ? 'Editar devocional' : 'Nuevo devocional',
                    style: const TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.w800),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Fecha
              _FormLabel('FECHA'),
              const SizedBox(height: 8),
              GestureDetector(
                onTap: _pickDate,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                  decoration: BoxDecoration(
                    color: const Color(0xFF111D2E),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFF1E2E4A)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.calendar_today_rounded,
                          color: Color(0xFFD4A017), size: 16),
                      const SizedBox(width: 10),
                      Text(fechaStr,
                          style: const TextStyle(
                              color: Colors.white, fontSize: 14)),
                      const Spacer(),
                      const Icon(Icons.edit_calendar_rounded,
                          color: Colors.white24, size: 16),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 18),

              _FormLabel('TÍTULO (OPCIONAL)'),
              const SizedBox(height: 8),
              _Field(controller: _tituloCtrl, label: 'Título del devocional', maxLines: 1),
              const SizedBox(height: 18),

              _FormLabel('VERSÍCULO *'),
              const SizedBox(height: 8),
              _Field(controller: _versiculoCtrl, label: 'Escribe el versículo...', maxLines: 4),
              const SizedBox(height: 18),

              _FormLabel('REFERENCIA *'),
              const SizedBox(height: 8),
              _Field(controller: _referenciaCtrl, label: 'Ej: Juan 3:16', maxLines: 1),
              const SizedBox(height: 18),

              _FormLabel('REFLEXIÓN'),
              const SizedBox(height: 8),
              _Field(controller: _reflexionCtrl, label: 'Reflexión o comentario...', maxLines: 6),
              const SizedBox(height: 28),

              SizedBox(
                height: 52,
                child: ElevatedButton(
                  onPressed: _loading ? null : _save,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFBF1E2E),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                    elevation: 0,
                  ),
                  child: _loading
                      ? const SizedBox(
                          width: 20, height: 20,
                          child: CircularProgressIndicator(
                              strokeWidth: 2, color: Colors.white))
                      : Text(
                          isEdit ? 'Guardar cambios' : 'Publicar devocional',
                          style: const TextStyle(
                              fontWeight: FontWeight.w700, fontSize: 15),
                        ),
                ),
              ),
            ],
          ),
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
        labelStyle: const TextStyle(color: Color(0xFFB5B5B5), fontSize: 13),
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

class _FormLabel extends StatelessWidget {
  final String text;
  const _FormLabel(this.text);

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: const TextStyle(
        color: Color(0xFFB5B5B5),
        fontSize: 10,
        fontWeight: FontWeight.w700,
        letterSpacing: 1.2,
      ),
    );
  }
}
