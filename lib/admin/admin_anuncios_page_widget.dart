import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '/backend/supabase_service.dart';
import '/flutter_flow/flutter_flow_util.dart';

class AdminAnunciosPageWidget extends StatelessWidget {
  const AdminAnunciosPageWidget({super.key});

  static String routeName = 'AdminAnunciosPage';
  static String routePath = '/adminAnuncios';

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
        title: const Text('Anuncios',
            style: TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.w700)),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle_outline_rounded, color: _accent),
            tooltip: 'Nuevo anuncio',
            onPressed: () => _showForm(context),
          ),
        ],
      ),
      body: StreamBuilder<List<Anuncio>>(
        stream: SupabaseService.instance.todosAnunciosStream(),
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
                  const Icon(Icons.campaign_outlined,
                      color: Colors.white24, size: 56),
                  const SizedBox(height: 12),
                  const Text('No hay anuncios aún.',
                      style: TextStyle(color: Colors.white38)),
                  const SizedBox(height: 16),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                        backgroundColor: _accent, foregroundColor: Colors.black),
                    icon: const Icon(Icons.add_rounded),
                    label: const Text('Crear primer anuncio'),
                    onPressed: () => _showForm(context),
                  ),
                ],
              ),
            );
          }
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: items.length,
            itemBuilder: (context, i) => _ItemCard(
              item: items[i],
              onEdit: () => _showForm(context, item: items[i]),
              onDelete: () => _confirmDelete(context, items[i].id),
            ),
          );
        },
      ),
    );
  }

  void _showForm(BuildContext context, {Anuncio? item}) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF111D2E),
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => _AnuncioForm(item: item),
    );
  }

  void _confirmDelete(BuildContext context, String id) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E2E4A),
        title: const Text('Eliminar anuncio',
            style: TextStyle(color: Colors.white)),
        content: const Text('¿Eliminar este anuncio? No se puede deshacer.',
            style: TextStyle(color: _muted)),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx),
              child:
                  const Text('Cancelar', style: TextStyle(color: Colors.white54))),
          TextButton(
            onPressed: () async {
              Navigator.pop(ctx);
              await SupabaseService.instance.eliminarAnuncio(id);
            },
            child: const Text('Eliminar',
                style: TextStyle(color: Colors.redAccent)),
          ),
        ],
      ),
    );
  }
}

class _ItemCard extends StatelessWidget {
  final Anuncio item;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  static const Color _surface = Color(0xFF0F1C30);
  static const Color _accent = Color(0xFFBF1E2E);
  static const Color _muted = Color(0xFFB5B5B5);

  const _ItemCard(
      {required this.item, required this.onEdit, required this.onDelete});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: _surface,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(children: [
                  Container(
                    width: 8,
                    height: 8,
                    decoration: BoxDecoration(
                      color: item.activo ? Colors.greenAccent : Colors.redAccent,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(item.titulo,
                        style: const TextStyle(
                            color: Colors.white,
                            fontSize: 15,
                            fontWeight: FontWeight.w700)),
                  ),
                ]),
                const SizedBox(height: 4),
                Text(item.descripcion,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(color: _muted, fontSize: 13)),
                const SizedBox(height: 6),
                Text(DateFormat('d MMM yyyy', 'es').format(item.fecha),
                    style: const TextStyle(color: _accent, fontSize: 12)),
              ],
            ),
          ),
          PopupMenuButton<String>(
            color: const Color(0xFF1E2E4A),
            icon: const Icon(Icons.more_vert_rounded, color: Colors.white54),
            onSelected: (v) {
              if (v == 'edit') onEdit();
              if (v == 'delete') onDelete();
            },
            itemBuilder: (_) => [
              const PopupMenuItem(
                  value: 'edit',
                  child: Text('Editar', style: TextStyle(color: Colors.white))),
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

class _AnuncioForm extends StatefulWidget {
  final Anuncio? item;
  const _AnuncioForm({this.item});

  @override
  State<_AnuncioForm> createState() => _AnuncioFormState();
}

class _AnuncioFormState extends State<_AnuncioForm> {
  static const Color _accent = Color(0xFFBF1E2E);
  static const Color _muted = Color(0xFFB5B5B5);

  late final TextEditingController _tituloCtrl;
  late final TextEditingController _descCtrl;
  late final TextEditingController _urlCtrl;
  late DateTime _fecha;
  late bool _activo;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _tituloCtrl = TextEditingController(text: widget.item?.titulo ?? '');
    _descCtrl = TextEditingController(text: widget.item?.descripcion ?? '');
    _urlCtrl = TextEditingController(text: widget.item?.imagenUrl ?? '');
    _fecha = widget.item?.fecha ?? DateTime.now();
    _activo = widget.item?.activo ?? true;
  }

  @override
  void dispose() {
    _tituloCtrl.dispose();
    _descCtrl.dispose();
    _urlCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
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
            Text(
              widget.item == null ? 'Nuevo Anuncio' : 'Editar Anuncio',
              style: const TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 20),
            _Field(label: 'Título *', controller: _tituloCtrl),
            const SizedBox(height: 12),
            _Field(
                label: 'Descripción *',
                controller: _descCtrl,
                maxLines: 3),
            const SizedBox(height: 12),
            _Field(
                label: 'URL de imagen (opcional)',
                controller: _urlCtrl),
            const SizedBox(height: 12),
            _DateRow(
              fecha: _fecha,
              onTap: () async {
                final d = await showDatePicker(
                  context: context,
                  initialDate: _fecha,
                  firstDate: DateTime(2020),
                  lastDate: DateTime(2030),
                  builder: (c, child) => Theme(
                    data: ThemeData.dark().copyWith(
                        colorScheme:
                            const ColorScheme.dark(primary: _accent)),
                    child: child!,
                  ),
                );
                if (d != null) setState(() => _fecha = d);
              },
            ),
            const SizedBox(height: 12),
            _SwitchRow(
              label: 'Visible para todos',
              value: _activo,
              onChanged: (v) => setState(() => _activo = v),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: _accent,
                  foregroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10)),
                ),
                onPressed: _saving ? null : _save,
                child: _saving
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                            strokeWidth: 2, color: Colors.black))
                    : Text(
                        widget.item == null
                            ? 'Publicar Anuncio'
                            : 'Guardar Cambios',
                        style: const TextStyle(fontWeight: FontWeight.w700)),
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Future<void> _save() async {
    if (_tituloCtrl.text.trim().isEmpty || _descCtrl.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('Título y descripción son requeridos'),
          backgroundColor: Colors.redAccent));
      return;
    }
    setState(() => _saving = true);
    try {
      final url =
          _urlCtrl.text.trim().isEmpty ? null : _urlCtrl.text.trim();
      if (widget.item == null) {
        await SupabaseService.instance.crearAnuncio(
          titulo: _tituloCtrl.text.trim(),
          descripcion: _descCtrl.text.trim(),
          fecha: _fecha,
          activo: _activo,
          imagenUrl: url,
        );
      } else {
        await SupabaseService.instance.actualizarAnuncio(
          widget.item!.id,
          titulo: _tituloCtrl.text.trim(),
          descripcion: _descCtrl.text.trim(),
          fecha: _fecha,
          activo: _activo,
          imagenUrl: url,
        );
      }
      if (mounted) Navigator.pop(context);
    } catch (e) {
      setState(() => _saving = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text('Error: $e'),
            backgroundColor: Colors.redAccent));
      }
    }
  }
}

// ── Widgets reutilizables del formulario ──────────────────────────────────────

class _Field extends StatelessWidget {
  final String label;
  final TextEditingController controller;
  final int maxLines;
  static const Color _muted = Color(0xFFB5B5B5);

  const _Field(
      {required this.label, required this.controller, this.maxLines = 1});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: _muted, fontSize: 12)),
        const SizedBox(height: 6),
        TextField(
          controller: controller,
          maxLines: maxLines,
          style: const TextStyle(color: Colors.white),
          decoration: InputDecoration(
            filled: true,
            fillColor: const Color(0xFF1E2E4A),
            border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: BorderSide.none),
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          ),
        ),
      ],
    );
  }
}

class _DateRow extends StatelessWidget {
  final DateTime fecha;
  final VoidCallback onTap;
  static const Color _accent = Color(0xFFBF1E2E);

  const _DateRow({required this.fecha, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        decoration: BoxDecoration(
            color: const Color(0xFF1E2E4A),
            borderRadius: BorderRadius.circular(8)),
        child: Row(
          children: [
            const Icon(Icons.calendar_today_outlined,
                color: _accent, size: 18),
            const SizedBox(width: 10),
            Text(DateFormat('d MMM yyyy', 'es').format(fecha),
                style: const TextStyle(color: Colors.white)),
          ],
        ),
      ),
    );
  }
}

class _SwitchRow extends StatelessWidget {
  final String label;
  final bool value;
  final ValueChanged<bool> onChanged;
  static const Color _accent = Color(0xFFBF1E2E);

  const _SwitchRow(
      {required this.label, required this.value, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
      decoration: BoxDecoration(
          color: const Color(0xFF1E2E4A),
          borderRadius: BorderRadius.circular(8)),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.white, fontSize: 14)),
          Switch(value: value, onChanged: onChanged, activeColor: _accent),
        ],
      ),
    );
  }
}
