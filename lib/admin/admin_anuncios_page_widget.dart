import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '/backend/supabase_service.dart';
import '/backend/cloudinary_service.dart';
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
  static const Color _surface = Color(0xFF0F1C30);

  late final TextEditingController _tituloCtrl;
  late final TextEditingController _descCtrl;
  late final TextEditingController _rolCtrl;
  late DateTime _fecha;
  late bool _activo;
  late String _visibilidad;
  String? _imageUrl;
  bool _saving = false;
  bool _uploadingImage = false;
  bool _showPreview = false;

  @override
  void initState() {
    super.initState();
    _tituloCtrl = TextEditingController(text: widget.item?.titulo ?? '');
    _descCtrl   = TextEditingController(text: widget.item?.descripcion ?? '');
    _rolCtrl    = TextEditingController(text: widget.item?.rolRequerido ?? '');
    _fecha       = widget.item?.fecha ?? DateTime.now();
    _activo      = widget.item?.activo ?? true;
    _visibilidad = widget.item?.visibilidad ?? 'todos';
    _imageUrl    = widget.item?.imagenUrl;
  }

  @override
  void dispose() {
    _tituloCtrl.dispose();
    _descCtrl.dispose();
    _rolCtrl.dispose();
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
            // ── Encabezado ───────────────────────────────────────────────
            Row(
              children: [
                Expanded(
                  child: Text(
                    widget.item == null ? 'Nuevo Anuncio' : 'Editar Anuncio',
                    style: const TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.w700),
                  ),
                ),
                TextButton.icon(
                  onPressed: () => setState(() => _showPreview = !_showPreview),
                  icon: Icon(
                    _showPreview ? Icons.edit_rounded : Icons.preview_rounded,
                    size: 16,
                    color: _accent,
                  ),
                  label: Text(
                    _showPreview ? 'Editar' : 'Preview',
                    style: const TextStyle(color: _accent, fontSize: 13),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            if (_showPreview) ...[  
              // ── PREVIEW del anuncio ──────────────────────────────────
              const Text('Vista previa',
                  style: TextStyle(color: _muted, fontSize: 12)),
              const SizedBox(height: 8),
              _AnuncioPreview(
                titulo: _tituloCtrl.text,
                descripcion: _descCtrl.text,
                fecha: _fecha,
                imageUrl: _imageUrl,
              ),
            ] else ...[  
              // ── FORMULARIO ───────────────────────────────────────────
              _Field(label: 'Título *', controller: _tituloCtrl,
                  onChanged: (_) => setState(() {})),
              const SizedBox(height: 12),
              _Field(
                  label: 'Descripción *',
                  controller: _descCtrl,
                  maxLines: 3,
                  onChanged: (_) => setState(() {})),
              const SizedBox(height: 16),

              // ── Imagen ───────────────────────────────────────────────
              const Text('Imagen del anuncio',
                  style: TextStyle(color: _muted, fontSize: 12)),
              const SizedBox(height: 8),
              if (_imageUrl != null && _imageUrl!.isNotEmpty) ...[  
                ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: Image.network(
                    _imageUrl!,
                    height: 160,
                    width: double.infinity,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Container(
                      height: 160,
                      color: const Color(0xFF1E2E4A),
                      child: const Icon(Icons.broken_image_outlined,
                          color: Colors.white24, size: 40),
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                Row(children: [
                  Expanded(
                    child: _outlineBtn(
                      icon: Icons.edit_rounded,
                      label: 'Cambiar imagen',
                      onTap: _pickImage,
                      loading: _uploadingImage,
                    ),
                  ),
                  const SizedBox(width: 8),
                  _outlineBtn(
                    icon: Icons.delete_outline_rounded,
                    label: 'Quitar',
                    color: Colors.redAccent,
                    onTap: () => setState(() => _imageUrl = null),
                  ),
                ]),
              ] else
                _outlineBtn(
                  icon: Icons.add_photo_alternate_outlined,
                  label: _uploadingImage
                      ? 'Subiendo…'
                      : 'Subir imagen desde dispositivo',
                  onTap: _pickImage,
                  loading: _uploadingImage,
                  fullWidth: true,
                ),
              const SizedBox(height: 16),

              // ── Fecha ────────────────────────────────────────────────
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
              // ── Visibilidad ──────────────────────────────────────────
              const Text('Visibilidad',
                  style: TextStyle(color: _muted, fontSize: 12)),
              const SizedBox(height: 8),
              Row(
                children: [
                  _VisChip(label: 'Todos',    value: 'todos',    group: _visibilidad, onTap: (v) => setState(() => _visibilidad = v)),
                  const SizedBox(width: 8),
                  _VisChip(label: 'Miembros', value: 'miembros', group: _visibilidad, onTap: (v) => setState(() => _visibilidad = v)),
                  const SizedBox(width: 8),
                  _VisChip(label: 'Por rol',  value: 'rol',      group: _visibilidad, onTap: (v) => setState(() => _visibilidad = v)),
                ],
              ),
              if (_visibilidad == 'rol') ...[  
                const SizedBox(height: 10),
                _Field(label: 'Rol requerido', controller: _rolCtrl),
              ],
              const SizedBox(height: 12),
              _SwitchRow(
                label: 'Activo',
                value: _activo,
                onChanged: (v) => setState(() => _activo = v),
              ),
            ],

            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: _accent,
                  foregroundColor: Colors.white,
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
                            strokeWidth: 2, color: Colors.white))
                    : Text(
                        widget.item == null ? 'Publicar Anuncio' : 'Guardar Cambios',
                        style: const TextStyle(fontWeight: FontWeight.w700)),
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Future<void> _pickImage() async {
    setState(() => _uploadingImage = true);
    try {
      final url =
          await CloudinaryService.instance.pickAndUpload(folder: 'anuncios');
      if (url != null && mounted) setState(() => _imageUrl = url);
    } finally {
      if (mounted) setState(() => _uploadingImage = false);
    }
  }

  Widget _outlineBtn({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
    Color color = _accent,
    bool loading = false,
    bool fullWidth = false,
  }) {
    return InkWell(
      onTap: loading ? null : onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        width: fullWidth ? double.infinity : null,
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          border: Border.all(color: color.withOpacity(0.5)),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          mainAxisSize: fullWidth ? MainAxisSize.max : MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (loading)
              SizedBox(
                  width: 14,
                  height: 14,
                  child: CircularProgressIndicator(
                      strokeWidth: 2, color: color))
            else
              Icon(icon, color: color, size: 16),
            const SizedBox(width: 8),
            Text(label,
                style: TextStyle(
                    color: color,
                    fontSize: 13,
                    fontWeight: FontWeight.w500)),
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
      final rol = _visibilidad == 'rol' ? _rolCtrl.text.trim() : null;
      if (widget.item == null) {
        await SupabaseService.instance.crearAnuncio(
          titulo: _tituloCtrl.text.trim(),
          descripcion: _descCtrl.text.trim(),
          fecha: _fecha,
          activo: _activo,
          imagenUrl: _imageUrl,
          visibilidad: _visibilidad,
          rolRequerido: rol,
        );
      } else {
        await SupabaseService.instance.actualizarAnuncio(
          widget.item!.id,
          titulo: _tituloCtrl.text.trim(),
          descripcion: _descCtrl.text.trim(),
          fecha: _fecha,
          activo: _activo,
          imagenUrl: _imageUrl,
          visibilidad: _visibilidad,
          rolRequerido: rol,
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

// ── Preview fiel al card real ──────────────────────────────────────────────────
class _AnuncioPreview extends StatelessWidget {
  final String titulo;
  final String descripcion;
  final DateTime fecha;
  final String? imageUrl;

  static const Color _accentColor = Color(0xFFBF1E2E);
  static const Color _surfaceColor = Color(0xFF0F1C30);

  const _AnuncioPreview({
    required this.titulo,
    required this.descripcion,
    required this.fecha,
    this.imageUrl,
  });

  @override
  Widget build(BuildContext context) {
    final fechaStr = DateFormat('d MMM yyyy', 'es').format(fecha);
    return Container(
      decoration: BoxDecoration(
        color: _surfaceColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF1E2E4A)),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (imageUrl != null && imageUrl!.isNotEmpty)
            Image.network(
              imageUrl!,
              height: 180,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => Container(
                height: 180,
                color: const Color(0xFF1E2E4A),
                child: const Icon(Icons.image_not_supported_outlined,
                    color: Colors.white38, size: 40),
              ),
            )
          else
            Container(
              height: 120,
              color: const Color(0xFF1E2E4A),
              child: const Center(
                child: Column(mainAxisSize: MainAxisSize.min, children: [
                  Icon(Icons.image_outlined, color: Colors.white24, size: 36),
                  SizedBox(height: 6),
                  Text('Sin imagen', style: TextStyle(color: Colors.white24, fontSize: 12)),
                ]),
              ),
            ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  titulo.isEmpty ? 'Título del anuncio' : titulo,
                  style: const TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 8),
                Text(
                  descripcion.isEmpty ? 'Descripción del anuncio…' : descripcion,
                  style: const TextStyle(
                      color: Color(0xFFB5B5B5), fontSize: 14, height: 1.5),
                ),
                const SizedBox(height: 12),
                Row(children: [
                  const Icon(Icons.calendar_today_outlined,
                      color: _accentColor, size: 14),
                  const SizedBox(width: 6),
                  Text(fechaStr,
                      style: const TextStyle(
                          color: _accentColor, fontSize: 12)),
                ]),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ── Widgets reutilizables del formulario ──────────────────────────────────────

class _Field extends StatelessWidget {
  final String label;
  final TextEditingController controller;
  final int maxLines;
  final ValueChanged<String>? onChanged;
  static const Color _muted = Color(0xFFB5B5B5);

  const _Field(
      {required this.label, required this.controller, this.maxLines = 1, this.onChanged});

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
          onChanged: onChanged,
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

class _VisChip extends StatelessWidget {
  final String label;
  final String value;
  final String group;
  final ValueChanged<String> onTap;
  static const Color _accent = Color(0xFFBF1E2E);

  const _VisChip({
    required this.label,
    required this.value,
    required this.group,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final selected = value == group;
    return GestureDetector(
      onTap: () => onTap(value),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: selected ? _accent : const Color(0xFF1E2E4A),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: selected ? _accent : Colors.white24,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: selected ? Colors.white : Colors.white60,
            fontSize: 13,
            fontWeight: selected ? FontWeight.w600 : FontWeight.normal,
          ),
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
