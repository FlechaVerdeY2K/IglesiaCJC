import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '/backend/supabase_service.dart';
import '/flutter_flow/flutter_flow_util.dart';

class AdminEventosPageWidget extends StatelessWidget {
  const AdminEventosPageWidget({super.key});

  static String routeName = 'AdminEventosPage';
  static String routePath = '/adminEventos';

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
        title: const Text('Eventos',
            style: TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.w700)),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle_outline_rounded, color: _accent),
            tooltip: 'Nuevo evento',
            onPressed: () => _showForm(context),
          ),
        ],
      ),
      body: StreamBuilder<List<Evento>>(
        stream: SupabaseService.instance.todosEventosStream(),
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
                  const Icon(Icons.event_outlined,
                      color: Colors.white24, size: 56),
                  const SizedBox(height: 12),
                  const Text('No hay eventos aún.',
                      style: TextStyle(color: Colors.white38)),
                  const SizedBox(height: 16),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                        backgroundColor: _accent,
                        foregroundColor: Colors.black),
                    icon: const Icon(Icons.add_rounded),
                    label: const Text('Crear primer evento'),
                    onPressed: () => _showForm(context),
                  ),
                ],
              ),
            );
          }
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: items.length,
            itemBuilder: (context, i) => _EventoCard(
              item: items[i],
              onEdit: () => _showForm(context, item: items[i]),
              onDelete: () => _confirmDelete(context, items[i].id),
            ),
          );
        },
      ),
    );
  }

  void _showForm(BuildContext context, {Evento? item}) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF111D2E),
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => _EventoForm(item: item),
    );
  }

  void _confirmDelete(BuildContext context, String id) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E2E4A),
        title: const Text('Eliminar evento',
            style: TextStyle(color: Colors.white)),
        content: const Text('¿Eliminar este evento? No se puede deshacer.',
            style: TextStyle(color: _muted)),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cancelar',
                  style: TextStyle(color: Colors.white54))),
          TextButton(
            onPressed: () async {
              Navigator.pop(ctx);
              await SupabaseService.instance.eliminarEvento(id);
            },
            child: const Text('Eliminar',
                style: TextStyle(color: Colors.redAccent)),
          ),
        ],
      ),
    );
  }
}

class _EventoCard extends StatelessWidget {
  final Evento item;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  static const Color _surface = Color(0xFF0F1C30);
  static const Color _accent = Color(0xFFBF1E2E);
  static const Color _muted = Color(0xFFB5B5B5);

  const _EventoCard(
      {required this.item, required this.onEdit, required this.onDelete});

  @override
  Widget build(BuildContext context) {
    final isPast = item.fecha.isBefore(DateTime.now());
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
          // Fecha box
          Container(
            width: 44,
            padding: const EdgeInsets.symmetric(vertical: 8),
            decoration: BoxDecoration(
              color: isPast
                  ? const Color(0xFF1E2E4A)
                  : _accent.withAlpha(30),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Column(
              children: [
                Text(
                  DateFormat('MMM', 'es').format(item.fecha).toUpperCase(),
                  style: TextStyle(
                      color: isPast ? Colors.white38 : _accent,
                      fontSize: 10,
                      fontWeight: FontWeight.w700),
                ),
                Text(
                  DateFormat('d').format(item.fecha),
                  style: TextStyle(
                      color: isPast ? Colors.white38 : Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.w800),
                ),
              ],
            ),
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
                      color:
                          item.activo ? Colors.greenAccent : Colors.redAccent,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(item.titulo,
                        style: const TextStyle(
                            color: Colors.white,
                            fontSize: 15,
                            fontWeight: FontWeight.w700)),
                  ),
                ]),
                const SizedBox(height: 3),
                Text(item.descripcion,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(color: _muted, fontSize: 13)),
                if (item.lugar != null && item.lugar!.isNotEmpty) ...[
                  const SizedBox(height: 4),
                  Row(children: [
                    const Icon(Icons.place_outlined,
                        color: _accent, size: 12),
                    const SizedBox(width: 4),
                    Text(item.lugar!,
                        style:
                            const TextStyle(color: _accent, fontSize: 12)),
                  ]),
                ],
                const SizedBox(height: 4),
                Text(DateFormat('d MMM yyyy, h:mm a', 'es').format(item.fecha),
                    style:
                        const TextStyle(color: Colors.white38, fontSize: 11)),
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

class _EventoForm extends StatefulWidget {
  final Evento? item;
  const _EventoForm({this.item});

  @override
  State<_EventoForm> createState() => _EventoFormState();
}

class _EventoFormState extends State<_EventoForm> {
  static const Color _accent = Color(0xFFBF1E2E);
  static const Color _muted = Color(0xFFB5B5B5);

  late final TextEditingController _tituloCtrl;
  late final TextEditingController _descCtrl;
  late final TextEditingController _lugarCtrl;
  late final TextEditingController _urlCtrl;
  late DateTime _fecha;
  late bool _activo;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _tituloCtrl = TextEditingController(text: widget.item?.titulo ?? '');
    _descCtrl = TextEditingController(text: widget.item?.descripcion ?? '');
    _lugarCtrl = TextEditingController(text: widget.item?.lugar ?? '');
    _urlCtrl = TextEditingController(text: widget.item?.imageUrl ?? '');
    _fecha = widget.item?.fecha ?? DateTime.now();
    _activo = widget.item?.activo ?? true;
  }

  @override
  void dispose() {
    _tituloCtrl.dispose();
    _descCtrl.dispose();
    _lugarCtrl.dispose();
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
              widget.item == null ? 'Nuevo Evento' : 'Editar Evento',
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
            _formField('Lugar (opcional)', _lugarCtrl),
            const SizedBox(height: 12),
            _formField('URL de imagen (opcional)', _urlCtrl),
            const SizedBox(height: 12),
            // Fecha
            const Text('Fecha y hora',
                style: TextStyle(color: _muted, fontSize: 12)),
            const SizedBox(height: 6),
            Row(
              children: [
                Expanded(
                  child: InkWell(
                    onTap: () async {
                      final d = await showDatePicker(
                        context: context,
                        initialDate: _fecha,
                        firstDate: DateTime(2020),
                        lastDate: DateTime(2030),
                        builder: (c, child) => Theme(
                          data: ThemeData.dark().copyWith(
                              colorScheme: const ColorScheme.dark(
                                  primary: _accent)),
                          child: child!,
                        ),
                      );
                      if (d != null) {
                        setState(() => _fecha = DateTime(d.year, d.month,
                            d.day, _fecha.hour, _fecha.minute));
                      }
                    },
                    borderRadius: BorderRadius.circular(8),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 14),
                      decoration: BoxDecoration(
                          color: const Color(0xFF1E2E4A),
                          borderRadius: BorderRadius.circular(8)),
                      child: Row(children: [
                        const Icon(Icons.calendar_today_outlined,
                            color: _accent, size: 16),
                        const SizedBox(width: 8),
                        Text(DateFormat('d MMM yyyy', 'es').format(_fecha),
                            style: const TextStyle(
                                color: Colors.white, fontSize: 13)),
                      ]),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: InkWell(
                    onTap: () async {
                      final t = await showTimePicker(
                        context: context,
                        initialTime: TimeOfDay.fromDateTime(_fecha),
                        builder: (c, child) => Theme(
                          data: ThemeData.dark().copyWith(
                              colorScheme: const ColorScheme.dark(
                                  primary: _accent)),
                          child: child!,
                        ),
                      );
                      if (t != null) {
                        setState(() => _fecha = DateTime(_fecha.year,
                            _fecha.month, _fecha.day, t.hour, t.minute));
                      }
                    },
                    borderRadius: BorderRadius.circular(8),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 14),
                      decoration: BoxDecoration(
                          color: const Color(0xFF1E2E4A),
                          borderRadius: BorderRadius.circular(8)),
                      child: Row(children: [
                        const Icon(Icons.access_time_rounded,
                            color: _accent, size: 16),
                        const SizedBox(width: 8),
                        Text(DateFormat('h:mm a').format(_fecha),
                            style: const TextStyle(
                                color: Colors.white, fontSize: 13)),
                      ]),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
              decoration: BoxDecoration(
                  color: const Color(0xFF1E2E4A),
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
                            ? 'Crear Evento'
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
    if (_tituloCtrl.text.trim().isEmpty || _descCtrl.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('Título y descripción son requeridos'),
          backgroundColor: Colors.redAccent));
      return;
    }
    setState(() => _saving = true);
    try {
      final lugar =
          _lugarCtrl.text.trim().isEmpty ? null : _lugarCtrl.text.trim();
      final url =
          _urlCtrl.text.trim().isEmpty ? null : _urlCtrl.text.trim();
      if (widget.item == null) {
        await SupabaseService.instance.crearEvento(
          titulo: _tituloCtrl.text.trim(),
          descripcion: _descCtrl.text.trim(),
          fecha: _fecha,
          activo: _activo,
          lugar: lugar,
          imageUrl: url,
        );
      } else {
        await SupabaseService.instance.actualizarEvento(
          widget.item!.id,
          titulo: _tituloCtrl.text.trim(),
          descripcion: _descCtrl.text.trim(),
          fecha: _fecha,
          activo: _activo,
          lugar: lugar,
          imageUrl: url,
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
      {int maxLines = 1}) {
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
