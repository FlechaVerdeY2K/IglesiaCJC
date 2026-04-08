import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '/backend/supabase_service.dart';
import '/flutter_flow/flutter_flow_util.dart';

class AdminRecursosPageWidget extends StatelessWidget {
  const AdminRecursosPageWidget({super.key});

  static String routeName = 'AdminRecursosPage';
  static String routePath = '/adminRecursos';

  static const Color _bg      = Color(0xFF080E1E);
  static const Color _surface = Color(0xFF0F1C30);
  static const Color _accent  = Color(0xFFBF1E2E);
  static const Color _muted   = Color(0xFFB5B5B5);

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
        title: const Text('Recursos',
            style: TextStyle(
                color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700)),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle_outline_rounded, color: _accent),
            tooltip: 'Nuevo recurso',
            onPressed: () => _showForm(context),
          ),
        ],
      ),
      body: StreamBuilder<List<Recurso>>(
        stream: SupabaseService.instance.recursosStream(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(
                child: CircularProgressIndicator(color: _accent));
          }
          final items = snapshot.data ?? [];
          if (items.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.library_books_rounded,
                      color: Colors.white24, size: 56),
                  const SizedBox(height: 12),
                  const Text('No hay recursos aún.',
                      style: TextStyle(color: Colors.white38)),
                  const SizedBox(height: 16),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                        backgroundColor: _accent,
                        foregroundColor: Colors.white),
                    icon: const Icon(Icons.add_rounded),
                    label: const Text('Agregar primer recurso'),
                    onPressed: () => _showForm(context),
                  ),
                ],
              ),
            );
          }
          // Group by tipo
          final tipos = ['pdf', 'audio', 'video'];
          final grouped = <String, List<Recurso>>{};
          for (final t in tipos) {
            final list = items.where((r) => r.tipo.toLowerCase() == t).toList();
            if (list.isNotEmpty) grouped[t] = list;
          }
          final otros = items
              .where((r) => !tipos.contains(r.tipo.toLowerCase()))
              .toList();
          if (otros.isNotEmpty) grouped['otro'] = otros;

          return ListView(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
            children: [
              // Stats bar
              _StatsBar(items: items),
              const SizedBox(height: 16),
              ...grouped.entries.map((entry) => _TipoSection(
                    tipo: entry.key,
                    recursos: entry.value,
                    onEdit: (r) => _showForm(context, item: r),
                    onDelete: (id) => _confirmDelete(context, id),
                  )),
            ],
          );
        },
      ),
    );
  }

  void _showForm(BuildContext context, {Recurso? item}) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF111D2E),
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => _RecursoForm(item: item),
    );
  }

  void _confirmDelete(BuildContext context, String id) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E2E4A),
        title: const Text('Eliminar recurso',
            style: TextStyle(color: Colors.white)),
        content: const Text(
            'Se elimina solo el registro. El archivo en el servidor externo no se borra.\n\n¿Continuar?',
            style: TextStyle(color: _muted)),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cancelar',
                  style: TextStyle(color: Colors.white54))),
          TextButton(
            onPressed: () async {
              Navigator.pop(ctx);
              await SupabaseService.instance.eliminarRecurso(id);
            },
            child: const Text('Eliminar',
                style: TextStyle(color: Colors.redAccent)),
          ),
        ],
      ),
    );
  }
}

// ── Stats bar ──────────────────────────────────────────────────────────────────

class _StatsBar extends StatelessWidget {
  final List<Recurso> items;
  const _StatsBar({required this.items});

  @override
  Widget build(BuildContext context) {
    final pdfs   = items.where((r) => r.tipo == 'pdf').length;
    final audios = items.where((r) => r.tipo == 'audio').length;
    final videos = items.where((r) => r.tipo == 'video').length;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: const Color(0xFF0F1C30),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFF1E2E4A)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _StatChip(count: items.length, label: 'Total',  color: const Color(0xFFBF1E2E)),
          _StatChip(count: pdfs,         label: 'PDF',    color: Colors.redAccent),
          _StatChip(count: audios,       label: 'Audio',  color: Colors.tealAccent),
          _StatChip(count: videos,       label: 'Video',  color: Colors.orangeAccent),
        ],
      ),
    );
  }
}

class _StatChip extends StatelessWidget {
  final int count;
  final String label;
  final Color color;
  const _StatChip(
      {required this.count, required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text('$count',
            style: TextStyle(
                color: color, fontSize: 22, fontWeight: FontWeight.w800)),
        const SizedBox(height: 2),
        Text(label,
            style:
                const TextStyle(color: Colors.white54, fontSize: 11)),
      ],
    );
  }
}

// ── Tipo section ──────────────────────────────────────────────────────────────

class _TipoSection extends StatelessWidget {
  final String tipo;
  final List<Recurso> recursos;
  final void Function(Recurso) onEdit;
  final void Function(String) onDelete;

  const _TipoSection({
    required this.tipo,
    required this.recursos,
    required this.onEdit,
    required this.onDelete,
  });

  static IconData _icon(String t) {
    switch (t) {
      case 'pdf':   return Icons.picture_as_pdf_rounded;
      case 'audio': return Icons.headphones_rounded;
      case 'video': return Icons.play_circle_rounded;
      default:      return Icons.insert_drive_file_rounded;
    }
  }

  static Color _color(String t) {
    switch (t) {
      case 'pdf':   return Colors.redAccent;
      case 'audio': return Colors.tealAccent;
      case 'video': return Colors.orangeAccent;
      default:      return const Color(0xFFBF1E2E);
    }
  }

  @override
  Widget build(BuildContext context) {
    final color = _color(tipo);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(4, 8, 4, 8),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(_icon(tipo), color: color, size: 16),
              ),
              const SizedBox(width: 8),
              Text(tipo.toUpperCase(),
                  style: TextStyle(
                      color: color,
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 1.3)),
              const SizedBox(width: 8),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text('${recursos.length}',
                    style: TextStyle(
                        color: color,
                        fontSize: 10,
                        fontWeight: FontWeight.w800)),
              ),
            ],
          ),
        ),
        ...recursos.map((r) => _RecursoCard(
              recurso: r,
              onEdit: () => onEdit(r),
              onDelete: () => onDelete(r.id),
            )),
        const SizedBox(height: 8),
      ],
    );
  }
}

// ── Recurso card ──────────────────────────────────────────────────────────────

class _RecursoCard extends StatelessWidget {
  final Recurso recurso;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  static const Color _muted = Color(0xFFB5B5B5);

  const _RecursoCard(
      {required this.recurso, required this.onEdit, required this.onDelete});

  Color get _color {
    switch (recurso.tipo) {
      case 'pdf':   return Colors.redAccent;
      case 'audio': return Colors.tealAccent;
      case 'video': return Colors.orangeAccent;
      default:      return const Color(0xFFBF1E2E);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.fromLTRB(14, 12, 8, 12),
      decoration: BoxDecoration(
        color: const Color(0xFF0F1C30),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: _color.withOpacity(0.2)),
      ),
      child: Row(
        children: [
          // Left accent
          Container(
            width: 3,
            height: 42,
            decoration: BoxDecoration(
              color: _color,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(recurso.titulo,
                    style: const TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.w700),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis),
                if (recurso.descripcion.isNotEmpty) ...[
                  const SizedBox(height: 2),
                  Text(recurso.descripcion,
                      style: const TextStyle(color: _muted, fontSize: 12),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis),
                ],
                const SizedBox(height: 4),
                Row(
                  children: [
                    Icon(Icons.link_rounded, color: _color, size: 12),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        recurso.url,
                        style: TextStyle(
                            color: _color.withOpacity(0.8), fontSize: 11),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(width: 4),
          PopupMenuButton<String>(
            color: const Color(0xFF1E2E4A),
            icon: const Icon(Icons.more_vert_rounded, color: Colors.white38),
            onSelected: (v) {
              if (v == 'edit') onEdit();
              if (v == 'delete') onDelete();
            },
            itemBuilder: (_) => [
              const PopupMenuItem(
                  value: 'edit',
                  child:
                      Text('Editar', style: TextStyle(color: Colors.white))),
              const PopupMenuItem(
                  value: 'delete',
                  child: Text('Eliminar',
                      style: TextStyle(color: Colors.redAccent))),
            ],
          ),
        ],
      ),
    );
  }
}

// ── Form ──────────────────────────────────────────────────────────────────────

class _RecursoForm extends StatefulWidget {
  final Recurso? item;
  const _RecursoForm({this.item});

  @override
  State<_RecursoForm> createState() => _RecursoFormState();
}

class _RecursoFormState extends State<_RecursoForm> {
  static const Color _accent  = Color(0xFFBF1E2E);
  static const Color _muted   = Color(0xFFB5B5B5);

  late final TextEditingController _tituloCtrl;
  late final TextEditingController _descCtrl;
  late final TextEditingController _urlCtrl;
  late String _tipo;
  late String _audiencia;
  late DateTime _fecha;
  bool _saving = false;

  final _tipos = ['pdf', 'audio', 'video'];
  final _audiencias = ['general', 'equipos'];

  static const _tipoColors = {
    'pdf':   Colors.redAccent,
    'audio': Colors.tealAccent,
    'video': Colors.orangeAccent,
  };

  static const _tipoIcons = {
    'pdf':   Icons.picture_as_pdf_rounded,
    'audio': Icons.headphones_rounded,
    'video': Icons.play_circle_rounded,
  };

  @override
  void initState() {
    super.initState();
    _tituloCtrl = TextEditingController(text: widget.item?.titulo ?? '');
    _descCtrl   = TextEditingController(text: widget.item?.descripcion ?? '');
    _urlCtrl    = TextEditingController(text: widget.item?.url ?? '');
    _tipo       = widget.item?.tipo ?? 'pdf';
    _audiencia  = widget.item?.audiencia ?? 'general';
    _fecha      = widget.item?.fecha ?? DateTime.now();
  }

  @override
  void dispose() {
    _tituloCtrl.dispose();
    _descCtrl.dispose();
    _urlCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (_tituloCtrl.text.trim().isEmpty || _urlCtrl.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('Título y URL son obligatorios')));
      return;
    }
    setState(() => _saving = true);
    try {
      if (widget.item == null) {
        await SupabaseService.instance.crearRecurso(
          titulo: _tituloCtrl.text,
          descripcion: _descCtrl.text,
          url: _urlCtrl.text,
          tipo: _tipo,
          audiencia: _audiencia,
          fecha: _fecha,
        );
      } else {
        await SupabaseService.instance.actualizarRecurso(
          widget.item!.id,
          titulo: _tituloCtrl.text,
          descripcion: _descCtrl.text,
          url: _urlCtrl.text,
          tipo: _tipo,
          audiencia: _audiencia,
          fecha: _fecha,
        );
      }
      if (mounted) Navigator.pop(context);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Error: $e')));
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final color = _tipoColors[_tipo] ?? _accent;

    return Padding(
      padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
          left: 20,
          right: 20,
          top: 24),
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            // Header
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(_tipoIcons[_tipo] ?? Icons.insert_drive_file_rounded,
                      color: color, size: 20),
                ),
                const SizedBox(width: 12),
                Text(
                  widget.item == null ? 'Nuevo Recurso' : 'Editar Recurso',
                  style: const TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.w700),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Tipo selector
            const _FormLabel('TIPO'),
            const SizedBox(height: 6),
            Row(
              children: _tipos.map((t) {
                final sel = t == _tipo;
                final c = _tipoColors[t] ?? _accent;
                return Expanded(
                  child: Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: GestureDetector(
                      onTap: () => setState(() => _tipo = t),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 180),
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          color: sel ? c.withOpacity(0.15) : const Color(0xFF0F1C30),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                              color: sel ? c : const Color(0xFF1E2E4A)),
                        ),
                        child: Column(
                          children: [
                            Icon(_tipoIcons[t]!, color: sel ? c : Colors.white38, size: 20),
                            const SizedBox(height: 4),
                            Text(t.toUpperCase(),
                                style: TextStyle(
                                    color: sel ? c : Colors.white38,
                                    fontSize: 10,
                                    fontWeight: FontWeight.w700)),
                          ],
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 16),

            // Audiencia selector
            const _FormLabel('AUDIENCIA'),
            const SizedBox(height: 6),
            Row(
              children: _audiencias.map((a) {
                final sel = a == _audiencia;
                const miembrosColor = Color(0xFF5C6BC0);
                const equiposColor  = Color(0xFF26A69A);
                final c = a == 'equipos' ? equiposColor : miembrosColor;
                final icon = a == 'equipos'
                    ? Icons.groups_rounded
                    : Icons.person_rounded;
                final label = a == 'equipos' ? 'Equipos' : 'Miembros';
                return Expanded(
                  child: Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: GestureDetector(
                      onTap: () => setState(() => _audiencia = a),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 180),
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          color: sel ? c.withOpacity(0.15) : const Color(0xFF0F1C30),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                              color: sel ? c : const Color(0xFF1E2E4A)),
                        ),
                        child: Column(
                          children: [
                            Icon(icon, color: sel ? c : Colors.white38, size: 20),
                            const SizedBox(height: 4),
                            Text(label.toUpperCase(),
                                style: TextStyle(
                                    color: sel ? c : Colors.white38,
                                    fontSize: 10,
                                    fontWeight: FontWeight.w700)),
                          ],
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 16),

            // Título
            const _FormLabel('TÍTULO'),
            const SizedBox(height: 6),
            _Field(controller: _tituloCtrl, hint: 'Ej: Sermón "La Fe"'),
            const SizedBox(height: 14),

            // Descripción
            const _FormLabel('DESCRIPCIÓN  (opcional)'),
            const SizedBox(height: 6),
            _Field(
                controller: _descCtrl,
                hint: 'Breve descripción del recurso',
                maxLines: 2),
            const SizedBox(height: 14),

            // URL
            const _FormLabel('URL DEL ARCHIVO'),
            const SizedBox(height: 4),
            Container(
              padding: const EdgeInsets.all(10),
              margin: const EdgeInsets.only(bottom: 6),
              decoration: BoxDecoration(
                color: color.withOpacity(0.07),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: color.withOpacity(0.3)),
              ),
              child: Row(
                children: [
                  Icon(Icons.info_outline_rounded, color: color, size: 14),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      _tipo == 'pdf'
                          ? 'Pega el enlace de Google Drive, Cloudinary o cualquier hosting de PDF'
                          : _tipo == 'audio'
                              ? 'Pega el enlace de SoundCloud, Google Drive o similar'
                              : 'Pega el enlace de YouTube, Vimeo o similar',
                      style: TextStyle(color: color, fontSize: 11, height: 1.4),
                    ),
                  ),
                ],
              ),
            ),
            _Field(
                controller: _urlCtrl,
                hint: 'https://...',
                keyboardType: TextInputType.url),
            const SizedBox(height: 14),

            // Fecha
            const _FormLabel('FECHA'),
            const SizedBox(height: 6),
            InkWell(
              onTap: () async {
                final picked = await showDatePicker(
                  context: context,
                  initialDate: _fecha,
                  firstDate: DateTime(2020),
                  lastDate: DateTime(2030),
                  builder: (ctx, child) => Theme(
                    data: ThemeData.dark().copyWith(
                      colorScheme: const ColorScheme.dark(
                          primary: Color(0xFFBF1E2E)),
                    ),
                    child: child!,
                  ),
                );
                if (picked != null) setState(() => _fecha = picked);
              },
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F1C30),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFF1E2E4A)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.calendar_today_rounded,
                        color: Color(0xFFBF1E2E), size: 16),
                    const SizedBox(width: 10),
                    Text(
                      DateFormat('d MMMM yyyy', 'es').format(_fecha),
                      style: const TextStyle(color: Colors.white, fontSize: 14),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 24),

            // Save button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: _accent,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: _saving ? null : _save,
                child: _saving
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                            color: Colors.white, strokeWidth: 2))
                    : Text(
                        widget.item == null ? 'Publicar recurso' : 'Guardar cambios',
                        style: const TextStyle(
                            fontWeight: FontWeight.w700, fontSize: 15)),
              ),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }
}

class _FormLabel extends StatelessWidget {
  final String text;
  const _FormLabel(this.text);

  @override
  Widget build(BuildContext context) => Text(
        text,
        style: const TextStyle(
            color: Color(0xFF8FA3BF),
            fontSize: 10,
            fontWeight: FontWeight.w700,
            letterSpacing: 1.2),
      );
}

class _Field extends StatelessWidget {
  final TextEditingController controller;
  final String hint;
  final int maxLines;
  final TextInputType? keyboardType;

  const _Field({
    required this.controller,
    required this.hint,
    this.maxLines = 1,
    this.keyboardType,
  });

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      maxLines: maxLines,
      keyboardType: keyboardType,
      style: const TextStyle(color: Colors.white, fontSize: 14),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(color: Colors.white30),
        filled: true,
        fillColor: const Color(0xFF0F1C30),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
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
          borderSide: const BorderSide(color: Color(0xFFBF1E2E)),
        ),
      ),
    );
  }
}
