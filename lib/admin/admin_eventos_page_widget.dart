import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart' as ll;
import 'package:http/http.dart' as http;
import 'dart:convert';
import '/backend/supabase_service.dart';
import '/backend/cloudinary_service.dart';
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
  late final TextEditingController _rolCtrl;
  late DateTime _fecha;
  late bool _activo;
  late String _visibilidad; // 'todos' | 'miembros' | 'rol'
  String? _imageUrl;
  double? _lat;
  double? _lng;
  bool _saving = false;
  bool _uploadingImage = false;

  @override
  void initState() {
    super.initState();
    _tituloCtrl = TextEditingController(text: widget.item?.titulo ?? '');
    _descCtrl   = TextEditingController(text: widget.item?.descripcion ?? '');
    _lugarCtrl  = TextEditingController(text: widget.item?.lugar ?? '');
    _rolCtrl    = TextEditingController(text: widget.item?.rolRequerido ?? '');
    _fecha      = widget.item?.fecha ?? DateTime.now();
    _activo     = widget.item?.activo ?? true;
    _visibilidad = widget.item?.visibilidad ?? 'todos';
    _imageUrl   = widget.item?.imageUrl;
    _lat        = widget.item?.lat;
    _lng        = widget.item?.lng;
  }

  @override
  void dispose() {
    _tituloCtrl.dispose();
    _descCtrl.dispose();
    _lugarCtrl.dispose();
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
            Text(
              widget.item == null ? 'Nuevo Evento' : 'Editar Evento',
              style: const TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 20),

            // ── Título ─────────────────────────────────────────────────────
            _formField('Título *', _tituloCtrl),
            const SizedBox(height: 12),

            // ── Descripción ────────────────────────────────────────────────
            _formField('Descripción *', _descCtrl, maxLines: 3),
            const SizedBox(height: 16),

            // ── Imagen ─────────────────────────────────────────────────────
            const Text('Imagen del evento',
                style: TextStyle(color: _muted, fontSize: 12)),
            const SizedBox(height: 8),
            if (_imageUrl != null && _imageUrl!.isNotEmpty) ...[
              ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: Image.network(
                  _imageUrl!,
                  height: 140,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Container(
                    height: 140,
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
                label: _uploadingImage ? 'Subiendo…' : 'Subir imagen desde dispositivo',
                onTap: _pickImage,
                loading: _uploadingImage,
                fullWidth: true,
              ),
            const SizedBox(height: 16),

            // ── Ubicación ──────────────────────────────────────────────────
            const Text('Ubicación',
                style: TextStyle(color: _muted, fontSize: 12)),
            const SizedBox(height: 8),
            TextField(
              controller: _lugarCtrl,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                hintText: 'Nombre o dirección del lugar',
                hintStyle: const TextStyle(color: Colors.white38),
                filled: true,
                fillColor: const Color(0xFF1E2E4A),
                border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: BorderSide.none),
                contentPadding:
                    const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                suffixIcon: IconButton(
                  icon: const Icon(Icons.pin_drop_rounded, color: _accent),
                  tooltip: 'Seleccionar en mapa',
                  onPressed: _openMapPicker,
                ),
              ),
            ),
            if (_lat != null && _lng != null) ...[
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E2E4A),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(children: [
                  const Icon(Icons.location_on_rounded, color: _accent, size: 14),
                  const SizedBox(width: 6),
                  Text(
                    '${_lat!.toStringAsFixed(6)}, ${_lng!.toStringAsFixed(6)}',
                    style: const TextStyle(color: Colors.white54, fontSize: 12),
                  ),
                  const Spacer(),
                  GestureDetector(
                    onTap: () => setState(() { _lat = null; _lng = null; }),
                    child: const Icon(Icons.close_rounded, color: Colors.white38, size: 16),
                  ),
                ]),
              ),
            ],
            const SizedBox(height: 16),

            // ── Fecha y hora ───────────────────────────────────────────────
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
            const SizedBox(height: 16),

            // ── Visibilidad ────────────────────────────────────────────────
            const Text('Visibilidad',
                style: TextStyle(color: _muted, fontSize: 12)),
            const SizedBox(height: 8),
            Row(children: [
              _visChip('todos',    Icons.public_rounded,          'Todos'),
              const SizedBox(width: 8),
              _visChip('miembros', Icons.people_rounded,          'Miembros'),
              const SizedBox(width: 8),
              _visChip('rol',      Icons.admin_panel_settings_rounded, 'Por rol'),
            ]),
            if (_visibilidad == 'rol') ...[
              const SizedBox(height: 10),
              _formField('Rol requerido (ej: líder, pastor)', _rolCtrl),
            ],
            const SizedBox(height: 12),
            // Estado activo
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
              decoration: BoxDecoration(
                  color: const Color(0xFF1E2E4A),
                  borderRadius: BorderRadius.circular(8)),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Publicado',
                      style: TextStyle(color: Colors.white, fontSize: 14)),
                  Switch(
                    value: _activo,
                    onChanged: (v) => setState(() => _activo = v),
                    activeColor: _accent,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // ── Guardar ────────────────────────────────────────────────────
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
                        widget.item == null ? 'Crear Evento' : 'Guardar Cambios',
                        style: const TextStyle(fontWeight: FontWeight.w700)),
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  // ── Chip de visibilidad ──────────────────────────────────────────────────────
  Widget _visChip(String value, IconData icon, String label) {
    final selected = _visibilidad == value;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _visibilidad = value),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: selected
                ? _accent.withOpacity(0.2)
                : const Color(0xFF1E2E4A),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
                color: selected ? _accent : Colors.transparent, width: 1.5),
          ),
          child: Column(
            children: [
              Icon(icon,
                  color: selected ? _accent : Colors.white38, size: 20),
              const SizedBox(height: 4),
              Text(label,
                  style: TextStyle(
                      color: selected ? _accent : Colors.white54,
                      fontSize: 11,
                      fontWeight: selected
                          ? FontWeight.w700
                          : FontWeight.w400)),
            ],
          ),
        ),
      ),
    );
  }

  // ── Botón con borde ──────────────────────────────────────────────────────────
  Widget _outlineBtn({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
    Color color = _accent,
    bool loading = false,
    bool fullWidth = false,
  }) {
    final btn = InkWell(
      onTap: loading ? null : onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
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
    return fullWidth ? btn : btn;
  }

  Future<void> _openMapPicker() async {
    final result = await showModalBottomSheet<_LocationResult>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _LocationPickerSheet(
        initialLat: _lat ?? 9.9524,
        initialLng: _lng ?? -84.0504,
      ),
    );
    if (result != null && mounted) {
      setState(() {
        _lat = result.lat;
        _lng = result.lng;
        if (result.address.isNotEmpty) {
          _lugarCtrl.text = result.address;
        }
      });
    }
  }

  Future<void> _pickImage() async {
    setState(() => _uploadingImage = true);
    try {
      final url = await CloudinaryService.instance
          .pickAndUpload(folder: 'eventos');
      if (url != null && mounted) setState(() => _imageUrl = url);
    } finally {
      if (mounted) setState(() => _uploadingImage = false);
    }
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
      final lugar = _lugarCtrl.text.trim().isEmpty ? null : _lugarCtrl.text.trim();
      final rol = _visibilidad == 'rol' && _rolCtrl.text.trim().isNotEmpty
          ? _rolCtrl.text.trim()
          : null;
      if (widget.item == null) {
        await SupabaseService.instance.crearEvento(
          titulo: _tituloCtrl.text.trim(),
          descripcion: _descCtrl.text.trim(),
          fecha: _fecha,
          activo: _activo,
          lugar: lugar,
          lat: _lat,
          lng: _lng,
          imageUrl: _imageUrl,
          visibilidad: _visibilidad,
          rolRequerido: rol,
        );
      } else {
        await SupabaseService.instance.actualizarEvento(
          widget.item!.id,
          titulo: _tituloCtrl.text.trim(),
          descripcion: _descCtrl.text.trim(),
          fecha: _fecha,
          activo: _activo,
          lugar: lugar,
          lat: _lat,
          lng: _lng,
          imageUrl: _imageUrl,
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

// ─── Resultado del selector de mapa ────────────────────────────────────────────
class _LocationResult {
  final double lat;
  final double lng;
  final String address;
  const _LocationResult({required this.lat, required this.lng, required this.address});
}

// ─── Selector de ubicación con mapa ────────────────────────────────────────────
class _LocationPickerSheet extends StatefulWidget {
  final double initialLat;
  final double initialLng;
  const _LocationPickerSheet({required this.initialLat, required this.initialLng});

  @override
  State<_LocationPickerSheet> createState() => _LocationPickerSheetState();
}

class _LocationPickerSheetState extends State<_LocationPickerSheet> {
  static const Color _accent = Color(0xFFBF1E2E);

  late ll.LatLng _selected;
  String _address = '';
  bool _geocoding = false;
  late final MapController _mapCtrl;

  @override
  void initState() {
    super.initState();
    _selected = ll.LatLng(widget.initialLat, widget.initialLng);
    _mapCtrl = MapController();
    // Si ya hay coordenadas previas, obtener la dirección
    if (widget.initialLat != 9.9524 || widget.initialLng != -84.0504) {
      _reverseGeocode(_selected);
    }
  }

  Future<void> _reverseGeocode(ll.LatLng pos) async {
    setState(() => _geocoding = true);
    try {
      final uri = Uri.parse(
          'https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.latitude}&lon=${pos.longitude}&accept-language=es');
      final res = await http.get(uri, headers: {'User-Agent': 'IglesiaCJCApp/1.0'});
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body) as Map<String, dynamic>;
        final display = data['display_name'] as String? ?? '';
        // Acortar: tomar las primeras 2 partes separadas por coma
        final parts = display.split(',').map((s) => s.trim()).toList();
        final short = parts.take(3).join(', ');
        if (mounted) setState(() => _address = short);
      }
    } catch (_) {}
    if (mounted) setState(() => _geocoding = false);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.82,
      decoration: const BoxDecoration(
        color: Color(0xFF0F1C30),
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        children: [
          // Handle
          Container(
            margin: const EdgeInsets.only(top: 12, bottom: 8),
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.white24,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 6),
            child: Row(
              children: [
                const Icon(Icons.pin_drop_rounded, color: _accent, size: 18),
                const SizedBox(width: 8),
                const Expanded(
                  child: Text(
                    'Toca el mapa para seleccionar la ubicación',
                    style: TextStyle(color: Colors.white70, fontSize: 13),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close_rounded, color: Colors.white38),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),
          // Mapa
          Expanded(
            child: ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                child: FlutterMap(
                  mapController: _mapCtrl,
                  options: MapOptions(
                    initialCenter: _selected,
                    initialZoom: 14,
                    onTap: (_, pos) {
                      setState(() => _selected = pos);
                      _reverseGeocode(pos);
                    },
                  ),
                  children: [
                    TileLayer(
                      urlTemplate:
                          'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                      userAgentPackageName: 'com.iglesiacjc.app',
                    ),
                    MarkerLayer(
                      markers: [
                        Marker(
                          point: _selected,
                          width: 40,
                          height: 40,
                          child: const Icon(
                            Icons.location_pin,
                            color: _accent,
                            size: 40,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
          // Dirección detectada + botón confirmar
          Container(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (_geocoding)
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 6),
                    child: Row(children: [
                      SizedBox(
                          width: 14,
                          height: 14,
                          child: CircularProgressIndicator(
                              strokeWidth: 2, color: _accent)),
                      SizedBox(width: 8),
                      Text('Obteniendo dirección…',
                          style:
                              TextStyle(color: Colors.white38, fontSize: 12)),
                    ]),
                  )
                else if (_address.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(Icons.place_outlined,
                            color: _accent, size: 14),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            _address,
                            style: const TextStyle(
                                color: Colors.white60, fontSize: 12, height: 1.4),
                          ),
                        ),
                      ],
                    ),
                  ),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: _accent,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 13),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10)),
                    ),
                    icon: const Icon(Icons.check_rounded, size: 18),
                    label: const Text('Confirmar ubicación',
                        style: TextStyle(fontWeight: FontWeight.w700)),
                    onPressed: () => Navigator.pop(
                      context,
                      _LocationResult(
                        lat: _selected.latitude,
                        lng: _selected.longitude,
                        address: _address,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
