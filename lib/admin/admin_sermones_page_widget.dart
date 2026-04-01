import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '/backend/firebase_service.dart';
import '/flutter_flow/flutter_flow_util.dart';

class AdminSermonesPageWidget extends StatelessWidget {
  const AdminSermonesPageWidget({super.key});

  static String routeName = 'AdminSermonesPage';
  static String routePath = '/adminSermones';

  static const Color _bg = Color(0xFF050505);
  static const Color _surface = Color(0xFF171717);
  static const Color _accent = Color(0xFFE8D5B0);
  static const Color _muted = Color(0xFFB5B5B5);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _bg,
      appBar: AppBar(
        backgroundColor: const Color(0xFF1A1A1A),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_rounded, color: Colors.white),
          onPressed: () => context.safePop(),
        ),
        title: const Text('Sermones',
            style: TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.w700)),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle_outline_rounded, color: _accent),
            tooltip: 'Nuevo sermón',
            onPressed: () => _showForm(context),
          ),
        ],
      ),
      body: StreamBuilder<List<Sermon>>(
        stream: FirebaseService.instance.todosSermonesStream(),
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
                  const Icon(Icons.play_circle_outline_rounded,
                      color: Colors.white24, size: 56),
                  const SizedBox(height: 12),
                  const Text('No hay sermones aún.',
                      style: TextStyle(color: Colors.white38)),
                  const SizedBox(height: 16),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                        backgroundColor: _accent,
                        foregroundColor: Colors.black),
                    icon: const Icon(Icons.add_rounded),
                    label: const Text('Agregar primer sermón'),
                    onPressed: () => _showForm(context),
                  ),
                ],
              ),
            );
          }
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: items.length,
            itemBuilder: (context, i) => _SermonCard(
              item: items[i],
              onEdit: () => _showForm(context, item: items[i]),
              onDelete: () => _confirmDelete(context, items[i].id),
            ),
          );
        },
      ),
    );
  }

  void _showForm(BuildContext context, {Sermon? item}) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF1E1E1E),
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => _SermonForm(item: item),
    );
  }

  void _confirmDelete(BuildContext context, String id) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF2B2B2B),
        title: const Text('Eliminar sermón',
            style: TextStyle(color: Colors.white)),
        content: const Text('¿Eliminar este sermón? No se puede deshacer.',
            style: TextStyle(color: _muted)),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cancelar',
                  style: TextStyle(color: Colors.white54))),
          TextButton(
            onPressed: () async {
              Navigator.pop(ctx);
              await FirebaseService.instance.eliminarSermon(id);
            },
            child: const Text('Eliminar',
                style: TextStyle(color: Colors.redAccent)),
          ),
        ],
      ),
    );
  }
}

class _SermonCard extends StatelessWidget {
  final Sermon item;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  static const Color _surface = Color(0xFF171717);
  static const Color _accent = Color(0xFFE8D5B0);
  static const Color _muted = Color(0xFFB5B5B5);

  const _SermonCard(
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
          // Thumbnail YouTube
          Container(
            width: 60,
            height: 44,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(8),
              image: item.videoId.isNotEmpty
                  ? DecorationImage(
                      image: NetworkImage(
                          'https://img.youtube.com/vi/${item.videoId}/mqdefault.jpg'),
                      fit: BoxFit.cover,
                    )
                  : null,
              color: const Color(0xFF2B2B2B),
            ),
            child: item.videoId.isEmpty
                ? const Icon(Icons.play_circle_outline,
                    color: Colors.white38, size: 28)
                : null,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(children: [
                  Container(
                    width: 8,
                    height: 8,
                    decoration: BoxDecoration(
                      color: item.activo
                          ? Colors.greenAccent
                          : Colors.redAccent,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(item.titulo,
                        style: const TextStyle(
                            color: Colors.white,
                            fontSize: 14,
                            fontWeight: FontWeight.w700)),
                  ),
                ]),
                const SizedBox(height: 3),
                Text(item.predicador,
                    style: const TextStyle(color: _accent, fontSize: 12)),
                const SizedBox(height: 2),
                Text(DateFormat('d MMM yyyy', 'es').format(item.fecha),
                    style: const TextStyle(color: _muted, fontSize: 11)),
              ],
            ),
          ),
          PopupMenuButton<String>(
            color: const Color(0xFF2B2B2B),
            icon: const Icon(Icons.more_vert_rounded, color: Colors.white54),
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

class _SermonForm extends StatefulWidget {
  final Sermon? item;
  const _SermonForm({this.item});

  @override
  State<_SermonForm> createState() => _SermonFormState();
}

class _SermonFormState extends State<_SermonForm> {
  static const Color _accent = Color(0xFFE8D5B0);
  static const Color _muted = Color(0xFFB5B5B5);

  late final TextEditingController _tituloCtrl;
  late final TextEditingController _descCtrl;
  late final TextEditingController _videoCtrl;
  late final TextEditingController _predicadorCtrl;
  late DateTime _fecha;
  late bool _activo;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _tituloCtrl = TextEditingController(text: widget.item?.titulo ?? '');
    _descCtrl = TextEditingController(text: widget.item?.descripcion ?? '');
    _videoCtrl = TextEditingController(text: widget.item?.videoId ?? '');
    _predicadorCtrl =
        TextEditingController(text: widget.item?.predicador ?? '');
    _fecha = widget.item?.fecha ?? DateTime.now();
    _activo = widget.item?.activo ?? true;
  }

  @override
  void dispose() {
    _tituloCtrl.dispose();
    _descCtrl.dispose();
    _videoCtrl.dispose();
    _predicadorCtrl.dispose();
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
              widget.item == null ? 'Nuevo Sermón' : 'Editar Sermón',
              style: const TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 20),
            _formField('Título *', _tituloCtrl),
            const SizedBox(height: 12),
            _formField('Descripción *', _descCtrl, maxLines: 3),
            const SizedBox(height: 12),
            _formField('ID de YouTube *', _videoCtrl,
                hint: 'ej: dQw4w9WgXcQ (solo el ID, no la URL completa)'),
            const SizedBox(height: 12),
            _formField('Predicador *', _predicadorCtrl),
            const SizedBox(height: 12),
            const Text('Fecha', style: TextStyle(color: _muted, fontSize: 12)),
            const SizedBox(height: 6),
            InkWell(
              onTap: () async {
                final d = await showDatePicker(
                  context: context,
                  initialDate: _fecha,
                  firstDate: DateTime(2010),
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
              borderRadius: BorderRadius.circular(8),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(
                    horizontal: 14, vertical: 14),
                decoration: BoxDecoration(
                    color: const Color(0xFF2B2B2B),
                    borderRadius: BorderRadius.circular(8)),
                child: Row(
                  children: [
                    const Icon(Icons.calendar_today_outlined,
                        color: _accent, size: 18),
                    const SizedBox(width: 10),
                    Text(DateFormat('d MMM yyyy', 'es').format(_fecha),
                        style: const TextStyle(color: Colors.white)),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),
            Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
              decoration: BoxDecoration(
                  color: const Color(0xFF2B2B2B),
                  borderRadius: BorderRadius.circular(8)),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Visible para todos',
                      style:
                          TextStyle(color: Colors.white, fontSize: 14)),
                  Switch(
                    value: _activo,
                    onChanged: (v) => setState(() => _activo = v),
                    activeColor: _accent,
                  ),
                ],
              ),
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
                            ? 'Publicar Sermón'
                            : 'Guardar Cambios',
                        style: const TextStyle(
                            fontWeight: FontWeight.w700)),
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Future<void> _save() async {
    if (_tituloCtrl.text.trim().isEmpty ||
        _descCtrl.text.trim().isEmpty ||
        _videoCtrl.text.trim().isEmpty ||
        _predicadorCtrl.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content:
              Text('Título, descripción, ID de YouTube y predicador son requeridos'),
          backgroundColor: Colors.redAccent));
      return;
    }
    setState(() => _saving = true);
    try {
      if (widget.item == null) {
        await FirebaseService.instance.crearSermon(
          titulo: _tituloCtrl.text.trim(),
          descripcion: _descCtrl.text.trim(),
          videoId: _videoCtrl.text.trim(),
          predicador: _predicadorCtrl.text.trim(),
          fecha: _fecha,
          activo: _activo,
        );
      } else {
        await FirebaseService.instance.actualizarSermon(
          widget.item!.id,
          titulo: _tituloCtrl.text.trim(),
          descripcion: _descCtrl.text.trim(),
          videoId: _videoCtrl.text.trim(),
          predicador: _predicadorCtrl.text.trim(),
          fecha: _fecha,
          activo: _activo,
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

  Widget _formField(String label, TextEditingController ctrl,
      {int maxLines = 1, String? hint}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: _muted, fontSize: 12)),
        const SizedBox(height: 6),
        TextField(
          controller: ctrl,
          maxLines: maxLines,
          style: const TextStyle(color: Colors.white),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: const TextStyle(color: Colors.white24, fontSize: 12),
            filled: true,
            fillColor: const Color(0xFF2B2B2B),
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
