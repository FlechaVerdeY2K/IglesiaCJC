import 'package:flutter/material.dart';
import '/backend/supabase_service.dart';
import '/flutter_flow/flutter_flow_util.dart';

class AdminPastoresPageWidget extends StatelessWidget {
  const AdminPastoresPageWidget({super.key});

  static String routeName = 'AdminPastoresPage';
  static String routePath = '/adminPastores';

  static const Color _bg      = Color(0xFF080E1E);
  static const Color _surface = Color(0xFF0F1C30);
  static const Color _accent  = Color(0xFFBF1E2E);
  static const Color _border  = Color(0xFF1E2E4A);
  static const Color _muted   = Color(0xFFB5B5B5);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _bg,
      appBar: AppBar(
        backgroundColor: const Color(0xFF0D1628),
        elevation: 0,
        toolbarHeight: 56,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_rounded, color: Colors.white),
          onPressed: () => context.safePop(),
        ),
        title: const Text('Pastores',
            style: TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.w700)),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle_outline_rounded, color: _accent),
            tooltip: 'Nuevo pastor',
            onPressed: () => _showForm(context),
          ),
        ],
      ),
      body: StreamBuilder<List<Pastor>>(
        stream: SupabaseService.instance.pastoresStream(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(
                child: CircularProgressIndicator(
                    color: _accent, strokeWidth: 2));
          }
          final items = snapshot.data ?? [];
          if (items.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.people_outline_rounded,
                      color: Colors.white24, size: 56),
                  const SizedBox(height: 12),
                  const Text('No hay pastores aún.',
                      style: TextStyle(color: Colors.white38)),
                  const SizedBox(height: 16),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                        backgroundColor: _accent,
                        foregroundColor: Colors.white),
                    icon: const Icon(Icons.add_rounded),
                    label: const Text('Agregar pastor'),
                    onPressed: () => _showForm(context),
                  ),
                ],
              ),
            );
          }
          return ListView.separated(
            padding: const EdgeInsets.fromLTRB(16, 20, 16, 40),
            itemCount: items.length,
            separatorBuilder: (_, __) => const SizedBox(height: 10),
            itemBuilder: (context, i) => _PastorCard(
              pastor: items[i],
              onEdit: () => _showForm(context, pastor: items[i]),
              onDelete: () => _confirmDelete(context, items[i]),
            ),
          );
        },
      ),
    );
  }

  void _showForm(BuildContext context, {Pastor? pastor}) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _PastorForm(pastor: pastor),
    );
  }

  void _confirmDelete(BuildContext context, Pastor pastor) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: const Color(0xFF0F1C30),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        title: const Text('Eliminar pastor',
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
        content: Text(
          '¿Eliminar a ${pastor.nombre}? Esta acción no se puede deshacer.',
          style: const TextStyle(color: _muted),
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
              await SupabaseService.instance.deletePastor(pastor.id);
            },
            child: const Text('Eliminar',
                style: TextStyle(
                    color: _accent, fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }
}

// ── Card ──────────────────────────────────────────────────────────────────────
class _PastorCard extends StatelessWidget {
  final Pastor pastor;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  static const Color _surface = Color(0xFF0F1C30);
  static const Color _border  = Color(0xFF1E2E4A);
  static const Color _muted   = Color(0xFFB5B5B5);
  static const Color _accent  = Color(0xFFBF1E2E);

  const _PastorCard({
    required this.pastor,
    required this.onEdit,
    required this.onDelete,
  });

  bool get _isAnciano => pastor.cargo.toLowerCase().contains('ancian');

  Color get _roleColor =>
      _isAnciano ? const Color(0xFFD4A017) : const Color(0xFF7EB8F7);

  @override
  Widget build(BuildContext context) {
    final initials = pastor.nombre.isNotEmpty
        ? pastor.nombre.trim().split(' ').take(2).map((w) => w[0]).join()
        : '?';

    return Container(
      decoration: BoxDecoration(
        color: _surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: _border),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Row(
          children: [
            // Avatar initials
            Container(
              width: 52,
              height: 52,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: _roleColor.withOpacity(0.1),
                border: Border.all(
                    color: _roleColor.withOpacity(0.3), width: 1.5),
              ),
              alignment: Alignment.center,
              child: Text(
                initials.toUpperCase(),
                style: TextStyle(
                    color: _roleColor,
                    fontSize: 16,
                    fontWeight: FontWeight.w700),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(pastor.nombre,
                      style: const TextStyle(
                          color: Colors.white,
                          fontSize: 15,
                          fontWeight: FontWeight.w700)),
                  const SizedBox(height: 4),
                  Text(pastor.cargo,
                      style: TextStyle(
                          color: _roleColor, fontSize: 12)),
                  if (pastor.bio.isNotEmpty) ...[
                    const SizedBox(height: 3),
                    Text(
                      pastor.bio,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(color: _muted, fontSize: 11),
                    ),
                  ],
                ],
              ),
            ),
            // Order badge
            Container(
              margin: const EdgeInsets.only(right: 8),
              padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
              decoration: BoxDecoration(
                color: const Color(0xFF1A2B42),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text('#${pastor.orden}',
                  style: const TextStyle(
                      color: Colors.white38, fontSize: 11)),
            ),
            // Actions
            IconButton(
              icon: const Icon(Icons.edit_outlined,
                  color: Colors.white54, size: 20),
              onPressed: onEdit,
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(),
            ),
            const SizedBox(width: 8),
            IconButton(
              icon: const Icon(Icons.delete_outline_rounded,
                  color: _accent, size: 20),
              onPressed: onDelete,
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Form (bottom sheet) ───────────────────────────────────────────────────────
class _PastorForm extends StatefulWidget {
  final Pastor? pastor;
  const _PastorForm({this.pastor});

  @override
  State<_PastorForm> createState() => _PastorFormState();
}

class _PastorFormState extends State<_PastorForm> {
  static const Color _bg      = Color(0xFF0D1628);
  static const Color _surface = Color(0xFF0F1C30);
  static const Color _accent  = Color(0xFFBF1E2E);
  static const Color _border  = Color(0xFF1E2E4A);

  final _nombreCtrl = TextEditingController();
  final _cargoCtrl  = TextEditingController();
  final _bioCtrl    = TextEditingController();
  final _ordenCtrl  = TextEditingController();
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    if (widget.pastor != null) {
      _nombreCtrl.text = widget.pastor!.nombre;
      _cargoCtrl.text  = widget.pastor!.cargo;
      _bioCtrl.text    = widget.pastor!.bio;
      _ordenCtrl.text  = widget.pastor!.orden.toString();
    }
  }

  @override
  void dispose() {
    _nombreCtrl.dispose();
    _cargoCtrl.dispose();
    _bioCtrl.dispose();
    _ordenCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    final nombre = _nombreCtrl.text.trim();
    final cargo  = _cargoCtrl.text.trim();
    if (nombre.isEmpty || cargo.isEmpty) return;

    setState(() => _saving = true);
    try {
      final data = <String, dynamic>{
        'nombre':   nombre,
        'cargo':    cargo,
        'bio':      _bioCtrl.text.trim(),
        'orden':    int.tryParse(_ordenCtrl.text.trim()) ?? 99,
      };
      if (widget.pastor != null) data['id'] = widget.pastor!.id;

      await SupabaseService.instance.upsertPastor(data);
      if (mounted) Navigator.pop(context);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isEdit = widget.pastor != null;
    final bottom = MediaQuery.of(context).viewInsets.bottom;

    return Container(
      decoration: BoxDecoration(
        color: _bg,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
      ),
      padding: EdgeInsets.fromLTRB(20, 20, 20, 20 + bottom),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Handle
          Center(
            child: Container(
              width: 36,
              height: 4,
              margin: const EdgeInsets.only(bottom: 16),
              decoration: BoxDecoration(
                color: Colors.white24,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          Text(
            isEdit ? 'Editar pastor' : 'Nuevo pastor',
            style: const TextStyle(
                color: Colors.white,
                fontSize: 17,
                fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 20),

          _field(_nombreCtrl, 'Nombre completo', Icons.person_outline_rounded),
          const SizedBox(height: 12),
          _field(_cargoCtrl, 'Cargo  (usa · para separar roles)',
              Icons.badge_outlined),
          const SizedBox(height: 12),
          _field(_bioCtrl, 'Biografía (opcional)',
              Icons.notes_rounded, maxLines: 3),
          const SizedBox(height: 12),
          _field(_ordenCtrl, 'Orden de aparición',
              Icons.sort_rounded,
              keyboardType: TextInputType.number),
          const SizedBox(height: 24),

          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: _accent,
                foregroundColor: Colors.white,
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
                  : Text(isEdit ? 'Guardar cambios' : 'Agregar pastor',
                      style: const TextStyle(
                          fontSize: 15, fontWeight: FontWeight.w700)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _field(
    TextEditingController ctrl,
    String hint,
    IconData icon, {
    int maxLines = 1,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return TextField(
      controller: ctrl,
      maxLines: maxLines,
      keyboardType: keyboardType,
      style: const TextStyle(color: Colors.white, fontSize: 14),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(color: Colors.white38, fontSize: 14),
        prefixIcon: Icon(icon, color: Colors.white38, size: 18),
        filled: true,
        fillColor: const Color(0xFF0F1C30),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
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
