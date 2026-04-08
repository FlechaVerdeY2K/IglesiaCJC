import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '/backend/supabase_service.dart';
import '/flutter_flow/flutter_flow_util.dart';

class AdminEquiposSolicitudesPageWidget extends StatelessWidget {
  const AdminEquiposSolicitudesPageWidget({super.key});

  static String routeName = 'AdminEquiposSolicitudesPage';
  static String routePath = '/adminEquiposSolicitudes';

  static const Color _bg     = Color(0xFF080E1E);
  static const Color _accent = Color(0xFFBF1E2E);
  static const Color _muted  = Color(0xFFB5B5B5);

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 3,
      child: Scaffold(
        backgroundColor: _bg,
        appBar: AppBar(
          backgroundColor: const Color(0xFF0D1628),
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios_rounded, color: Colors.white),
            onPressed: () => context.safePop(),
          ),
          title: const Text('Solicitudes de Equipos',
              style: TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.w700)),
          centerTitle: true,
          bottom: const TabBar(
            indicatorColor: _accent,
            labelColor: Colors.white,
            unselectedLabelColor: Colors.white38,
            tabs: [
              Tab(text: 'Pendientes'),
              Tab(text: 'Aprobados'),
              Tab(text: 'Rechazados'),
            ],
          ),
        ),
        body: StreamBuilder<List<EquipoSolicitud>>(
          stream: SupabaseService.instance.todasSolicitudesEquipoStream(),
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator(color: _accent));
            }
            final all = snapshot.data ?? [];
            final pendientes  = all.where((s) => s.estado == 'pendiente').toList();
            final aprobados   = all.where((s) => s.estado == 'aprobado').toList();
            final rechazados  = all.where((s) => s.estado == 'rechazado').toList();

            return TabBarView(
              children: [
                _SolicitudList(items: pendientes, showActions: true),
                _SolicitudList(items: aprobados,  showActions: false),
                _SolicitudList(items: rechazados, showActions: false),
              ],
            );
          },
        ),
      ),
    );
  }
}

class _SolicitudList extends StatelessWidget {
  final List<EquipoSolicitud> items;
  final bool showActions;

  static const Color _muted = Color(0xFFB5B5B5);

  const _SolicitudList({required this.items, required this.showActions});

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.inbox_rounded, color: Colors.white24, size: 48),
            const SizedBox(height: 12),
            Text('Sin solicitudes', style: const TextStyle(color: Colors.white38)),
          ],
        ),
      );
    }
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: items.length,
      itemBuilder: (_, i) => _SolicitudCard(item: items[i], showActions: showActions),
    );
  }
}

class _SolicitudCard extends StatelessWidget {
  final EquipoSolicitud item;
  final bool showActions;

  static const Color _surface = Color(0xFF0F1C30);
  static const Color _border  = Color(0xFF1E2E4A);
  static const Color _accent  = Color(0xFFBF1E2E);
  static const Color _muted   = Color(0xFFB5B5B5);

  const _SolicitudCard({required this.item, required this.showActions});

  Color get _estadoColor {
    switch (item.estado) {
      case 'aprobado':  return const Color(0xFF40C072);
      case 'rechazado': return Colors.redAccent;
      default:          return const Color(0xFFD4A017);
    }
  }

  String get _estadoLabel {
    switch (item.estado) {
      case 'aprobado':  return 'Aprobado';
      case 'rechazado': return 'Rechazado';
      default:          return 'Pendiente';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: _surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: _border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header row
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.usuarioNombre.isNotEmpty ? item.usuarioNombre : item.usuarioEmail,
                      style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w700),
                    ),
                    const SizedBox(height: 2),
                    Text(item.usuarioEmail, style: const TextStyle(color: _muted, fontSize: 12)),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: _estadoColor.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: _estadoColor.withOpacity(0.4)),
                ),
                child: Text(_estadoLabel,
                    style: TextStyle(color: _estadoColor, fontSize: 11, fontWeight: FontWeight.w700)),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // Equipo + fecha
          Row(
            children: [
              const Icon(Icons.groups_rounded, color: _accent, size: 14),
              const SizedBox(width: 6),
              Text(item.equipoNombre,
                  style: const TextStyle(color: _accent, fontSize: 13, fontWeight: FontWeight.w600)),
              const Spacer(),
              Text(
                DateFormat('d MMM yyyy', 'es').format(item.creadoEn),
                style: const TextStyle(color: Colors.white38, fontSize: 11),
              ),
            ],
          ),

          // Motivo si rechazado
          if (item.estado == 'rechazado' && item.motivo != null && item.motivo!.isNotEmpty) ...[
            const SizedBox(height: 8),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              decoration: BoxDecoration(
                color: Colors.redAccent.withOpacity(0.08),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text('Motivo: ${item.motivo}',
                  style: const TextStyle(color: Colors.redAccent, fontSize: 12)),
            ),
          ],

          // Acciones (solo pendientes)
          if (showActions) ...[
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _ActionBtn(
                    label: 'Aprobar',
                    icon: Icons.check_rounded,
                    color: const Color(0xFF40C072),
                    onTap: () async {
                      await SupabaseService.instance.aprobarSolicitud(item.id);
                    },
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _ActionBtn(
                    label: 'Rechazar',
                    icon: Icons.close_rounded,
                    color: Colors.redAccent,
                    onTap: () => _showRechazarDialog(context),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  void _showRechazarDialog(BuildContext context) {
    final ctrl = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E2E4A),
        title: const Text('Rechazar solicitud', style: TextStyle(color: Colors.white)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('¿Por qué rechazas a ${item.usuarioNombre.isNotEmpty ? item.usuarioNombre : item.usuarioEmail}?',
                style: const TextStyle(color: Color(0xFFB5B5B5), fontSize: 13)),
            const SizedBox(height: 14),
            TextField(
              controller: ctrl,
              autofocus: true,
              maxLines: 3,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                hintText: 'Motivo (opcional)',
                hintStyle: const TextStyle(color: Colors.white38),
                filled: true,
                fillColor: const Color(0xFF0F1C30),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: BorderSide.none,
                ),
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancelar', style: TextStyle(color: Colors.white54)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
                backgroundColor: Colors.redAccent, foregroundColor: Colors.white),
            onPressed: () async {
              Navigator.pop(ctx);
              await SupabaseService.instance.rechazarSolicitud(
                item.id,
                motivo: ctrl.text.trim(),
              );
            },
            child: const Text('Rechazar'),
          ),
        ],
      ),
    );
  }
}

class _ActionBtn extends StatelessWidget {
  final String label;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;

  const _ActionBtn({
    required this.label,
    required this.icon,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: color.withOpacity(0.12),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: color.withOpacity(0.35)),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 16),
            const SizedBox(width: 6),
            Text(label, style: TextStyle(color: color, fontWeight: FontWeight.w600, fontSize: 13)),
          ],
        ),
      ),
    );
  }
}
