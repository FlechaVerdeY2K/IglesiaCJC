import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../backend/supabase_service.dart';
import '../flutter_flow/flutter_flow_util.dart';

class AdminOracionPageWidget extends StatelessWidget {
  static const String routeName = 'AdminOracionPage';
  static const String routePath = '/adminOracion';

  const AdminOracionPageWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 3,
      child: Scaffold(
        backgroundColor: const Color(0xFF080E1E),
        appBar: AppBar(
          backgroundColor: const Color(0xFF0D1628),
          elevation: 0,
          toolbarHeight: 56,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios_rounded, color: Colors.white),
            onPressed: () => context.safePop(),
          ),
          title: const Text('Moderación de Oración',
              style: TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.w700)),
          centerTitle: true,
          bottom: PreferredSize(
            preferredSize: const Size.fromHeight(44),
            child: Container(
              decoration: const BoxDecoration(
                border: Border(
                    bottom: BorderSide(color: Color(0xFF1E2E4A), width: 1)),
              ),
              child: TabBar(
                labelColor: Colors.white,
                unselectedLabelColor: const Color(0xFF4A6A8A),
                indicatorColor: const Color(0xFFBF1E2E),
                indicatorWeight: 2,
                labelStyle: const TextStyle(
                    fontSize: 12, fontWeight: FontWeight.w700),
                unselectedLabelStyle:
                    const TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
                tabs: const [
                  Tab(
                    child: Row(mainAxisSize: MainAxisSize.min, children: [
                      Icon(Icons.pending_actions_rounded, size: 15),
                      SizedBox(width: 5),
                      Text('Pendientes'),
                    ]),
                  ),
                  Tab(
                    child: Row(mainAxisSize: MainAxisSize.min, children: [
                      Icon(Icons.check_circle_outline_rounded, size: 15),
                      SizedBox(width: 5),
                      Text('Aprobadas'),
                    ]),
                  ),
                  Tab(
                    child: Row(mainAxisSize: MainAxisSize.min, children: [
                      Icon(Icons.cancel_outlined, size: 15),
                      SizedBox(width: 5),
                      Text('Rechazadas'),
                    ]),
                  ),
                ],
              ),
            ),
          ),
        ),
        body: const TabBarView(
          children: [
            _PedidosTab(estado: 'pendiente'),
            _PedidosTab(estado: 'aprobada'),
            _PedidosTab(estado: 'rechazada'),
          ],
        ),
      ),
    );
  }
}

// ── Tab ───────────────────────────────────────────────────────────────────────
class _PedidosTab extends StatelessWidget {
  final String estado;
  const _PedidosTab({required this.estado});

  Stream<List<Oracion>> get _stream {
    switch (estado) {
      case 'pendiente':
        return SupabaseService.instance.oracionesPendientesStream();
      case 'rechazada':
        return SupabaseService.instance.oracionesRechazadasStream();
      default:
        return SupabaseService.instance.oracionesPublicasStream();
    }
  }

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<List<Oracion>>(
      stream: _stream,
      builder: (context, snap) {
        if (snap.connectionState == ConnectionState.waiting) {
          return const Center(
              child: CircularProgressIndicator(
                  color: Color(0xFFBF1E2E), strokeWidth: 2));
        }
        final pedidos = snap.data ?? [];
        if (pedidos.isEmpty) {
          final (icon, msg) = switch (estado) {
            'pendiente'  => (Icons.inbox_rounded, 'No hay pedidos pendientes'),
            'rechazada'  => (Icons.cancel_outlined, 'No hay pedidos rechazados'),
            _            => (Icons.favorite_outline_rounded, 'No hay pedidos aprobados'),
          };
          return Center(
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              Icon(icon, color: Colors.white24, size: 48),
              const SizedBox(height: 12),
              Text(msg,
                  style: const TextStyle(
                      color: Colors.white38, fontSize: 14)),
            ]),
          );
        }
        return ListView.separated(
          padding: const EdgeInsets.fromLTRB(16, 20, 16, 40),
          itemCount: pedidos.length,
          separatorBuilder: (_, __) => const SizedBox(height: 10),
          itemBuilder: (context, i) =>
              _PedidoCard(oracion: pedidos[i], estado: estado),
        );
      },
    );
  }
}

// ── Card ──────────────────────────────────────────────────────────────────────
class _PedidoCard extends StatelessWidget {
  final Oracion oracion;
  final String estado;

  static const Color _surface = Color(0xFF0F1C30);
  static const Color _border  = Color(0xFF1E2E4A);
  static const Color _muted   = Color(0xFFB5B5B5);
  static const Color _accent  = Color(0xFFBF1E2E);

  const _PedidoCard({required this.oracion, required this.estado});

  @override
  Widget build(BuildContext context) {
    final fecha = DateFormat('d MMM · HH:mm', 'es').format(oracion.fecha);
    final initials = oracion.nombre.isNotEmpty
        ? oracion.nombre.trim().split(' ').take(2).map((w) => w[0]).join()
        : '?';

    return Container(
      decoration: BoxDecoration(
        color: _surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: _border),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Header ─────────────────────────────────────────────────────
            Row(
              children: [
                Container(
                  width: 34,
                  height: 34,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: _accent.withOpacity(0.10),
                    border: Border.all(
                        color: _accent.withOpacity(0.25), width: 1.5),
                  ),
                  alignment: Alignment.center,
                  child: oracion.anonima
                      ? const Icon(Icons.person_outline_rounded,
                          color: Color(0xFF7A4A5A), size: 16)
                      : Text(initials.toUpperCase(),
                          style: const TextStyle(
                              color: Color(0xFFCC6677),
                              fontSize: 12,
                              fontWeight: FontWeight.w700)),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Row(
                    children: [
                      Text(oracion.nombre,
                          style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w700,
                              fontSize: 14)),
                      if (oracion.anonima) ...[
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 7, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFF1A1A2A),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                                color: const Color(0xFF2A2A3A)),
                          ),
                          child: const Text('Anónimo',
                              style: TextStyle(
                                  color: Colors.white38,
                                  fontSize: 10,
                                  fontWeight: FontWeight.w600)),
                        ),
                      ],
                    ],
                  ),
                ),
                Text(fecha,
                    style: const TextStyle(
                        color: Color(0xFF4A6A8A), fontSize: 11)),
              ],
            ),
            const SizedBox(height: 12),

            // ── Texto ───────────────────────────────────────────────────────
            Text(oracion.peticion,
                style: const TextStyle(
                    color: _muted, fontSize: 13, height: 1.6)),
            const SizedBox(height: 14),

            // ── Acciones según estado ───────────────────────────────────────
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: _buildActions(context),
            ),
          ],
        ),
      ),
    );
  }

  List<Widget> _buildActions(BuildContext context) {
    switch (estado) {
      case 'pendiente':
        return [
          _ActionBtn(
            label: 'Rechazar',
            icon: Icons.close_rounded,
            color: const Color(0xFFBF1E2E),
            bgColor: const Color(0xFF1A0808),
            borderColor: const Color(0xFF3A1515),
            onTap: () => _rechazar(context),
          ),
          const SizedBox(width: 8),
          _ActionBtn(
            label: 'Aprobar',
            icon: Icons.check_rounded,
            color: const Color(0xFF4CAF50),
            bgColor: const Color(0xFF0A1F0A),
            borderColor: const Color(0xFF1A3A1A),
            onTap: () => _aprobar(context),
          ),
        ];
      case 'aprobada':
        return [
          _ActionBtn(
            label: 'Revertir a pendiente',
            icon: Icons.undo_rounded,
            color: const Color(0xFFD4A017),
            bgColor: const Color(0xFF1A1400),
            borderColor: const Color(0xFF3A2A00),
            onTap: () => _revertir(context),
          ),
        ];
      case 'rechazada':
        return [
          _ActionBtn(
            label: 'Revertir a pendiente',
            icon: Icons.undo_rounded,
            color: const Color(0xFFD4A017),
            bgColor: const Color(0xFF1A1400),
            borderColor: const Color(0xFF3A2A00),
            onTap: () => _revertir(context),
          ),
          const SizedBox(width: 8),
          _ActionBtn(
            label: 'Aprobar',
            icon: Icons.check_rounded,
            color: const Color(0xFF4CAF50),
            bgColor: const Color(0xFF0A1F0A),
            borderColor: const Color(0xFF1A3A1A),
            onTap: () => _aprobar(context),
          ),
        ];
      default:
        return [];
    }
  }

  void _showSnack(BuildContext ctx, String msg, {bool success = false}) {
    final width = MediaQuery.of(ctx).size.width;
    ScaffoldMessenger.of(ctx)
      ..clearSnackBars()
      ..showSnackBar(SnackBar(
        content: Row(mainAxisSize: MainAxisSize.min, children: [
          Icon(
            success
                ? Icons.check_circle_rounded
                : Icons.info_outline_rounded,
            color: Colors.white,
            size: 15,
          ),
          const SizedBox(width: 8),
          Flexible(
              child: Text(msg,
                  style: const TextStyle(
                      fontSize: 13, color: Colors.white))),
        ]),
        backgroundColor:
            success ? const Color(0xFF1A3A2A) : const Color(0xFF1A2A3A),
        behavior: SnackBarBehavior.floating,
        width: width > 480 ? 360.0 : width - 40,
        padding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12)),
        duration: const Duration(seconds: 3),
      ));
  }

  Future<void> _aprobar(BuildContext context) async {
    await SupabaseService.instance.aprobarOracion(oracion.id);
    if (context.mounted) {
      _showSnack(context, 'Aprobado y publicado', success: true);
    }
  }

  Future<void> _rechazar(BuildContext context) async {
    await SupabaseService.instance.rechazarOracion(oracion.id);
    if (context.mounted) _showSnack(context, 'Pedido rechazado');
  }

  Future<void> _revertir(BuildContext context) async {
    await SupabaseService.instance.revertirOracion(oracion.id);
    if (context.mounted) _showSnack(context, 'Movido a pendientes');
  }
}

// ── Botón de acción ───────────────────────────────────────────────────────────
class _ActionBtn extends StatelessWidget {
  final String label;
  final IconData icon;
  final Color color;
  final Color bgColor;
  final Color borderColor;
  final VoidCallback onTap;

  const _ActionBtn({
    required this.label,
    required this.icon,
    required this.color,
    required this.bgColor,
    required this.borderColor,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding:
            const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: borderColor),
        ),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          Icon(icon, color: color, size: 15),
          const SizedBox(width: 6),
          Text(label,
              style: TextStyle(
                  color: color,
                  fontSize: 12,
                  fontWeight: FontWeight.w600)),
        ]),
      ),
    );
  }
}
