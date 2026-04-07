import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../backend/supabase_service.dart';

class AdminOracionPageWidget extends StatelessWidget {
  static const String routeName = 'AdminOracionPage';
  static const String routePath = '/adminOracion';

  const AdminOracionPageWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        backgroundColor: const Color(0xFF1A1A2E),
        appBar: AppBar(
          backgroundColor: const Color(0xFF16213E),
          foregroundColor: Colors.white,
          title: const Text('Moderación de Oración'),
          bottom: const TabBar(
            labelColor: Color(0xFF4FC3F7),
            unselectedLabelColor: Colors.white54,
            indicatorColor: Color(0xFF4FC3F7),
            tabs: [
              Tab(icon: Icon(Icons.pending_actions), text: 'Pendientes'),
              Tab(icon: Icon(Icons.check_circle_outline), text: 'Aprobadas'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            _PedidosTab(estado: 'pendiente'),
            _PedidosTab(estado: 'aprobada'),
          ],
        ),
      ),
    );
  }
}

class _PedidosTab extends StatelessWidget {
  final String estado;
  const _PedidosTab({required this.estado});

  @override
  Widget build(BuildContext context) {
    final stream = estado == 'pendiente'
        ? SupabaseService.instance.oracionesPendientesStream()
        : SupabaseService.instance.oracionesPublicasStream();

    return StreamBuilder<List<Oracion>>(
      stream: stream,
      builder: (context, snap) {
        if (snap.connectionState == ConnectionState.waiting) {
          return const Center(
              child: CircularProgressIndicator(color: Color(0xFF4FC3F7)));
        }
        if (!snap.hasData || snap.data!.isEmpty) {
          return Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  estado == 'pendiente' ? Icons.inbox : Icons.sentiment_satisfied,
                  color: Colors.white38,
                  size: 64,
                ),
                const SizedBox(height: 12),
                Text(
                  estado == 'pendiente'
                      ? 'No hay pedidos pendientes'
                      : 'No hay pedidos aprobados',
                  style: const TextStyle(color: Colors.white54, fontSize: 16),
                ),
              ],
            ),
          );
        }

        final pedidos = snap.data!;
        return ListView.separated(
          padding: const EdgeInsets.all(16),
          itemCount: pedidos.length,
          separatorBuilder: (_, __) => const SizedBox(height: 10),
          itemBuilder: (context, i) {
            final o = pedidos[i];
            return _PedidoCard(oracion: o, esPendiente: estado == 'pendiente');
          },
        );
      },
    );
  }
}

class _PedidoCard extends StatelessWidget {
  final Oracion oracion;
  final bool esPendiente;

  const _PedidoCard({required this.oracion, required this.esPendiente});

  @override
  Widget build(BuildContext context) {
    final fmt = DateFormat('dd MMM yyyy • HH:mm', 'es');
    final fecha = fmt.format(oracion.fecha);

    return Card(
      color: const Color(0xFF16213E),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.person, color: Color(0xFF4FC3F7), size: 18),
                const SizedBox(width: 6),
                Text(
                  oracion.nombre,
                  style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 15),
                ),
                if (oracion.anonima) ...[
                  const SizedBox(width: 6),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: Colors.white12,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: const Text('Anónimo',
                        style:
                            TextStyle(color: Colors.white54, fontSize: 10)),
                  ),
                ],
                const Spacer(),
                Text(fecha,
                    style:
                        const TextStyle(color: Colors.white38, fontSize: 11)),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              oracion.peticion,
              style: const TextStyle(color: Colors.white70, fontSize: 14, height: 1.5),
            ),
            if (esPendiente) ...[
              const SizedBox(height: 14),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  OutlinedButton.icon(
                    onPressed: () => _rechazar(context, oracion.id),
                    icon: const Icon(Icons.close, size: 16),
                    label: const Text('Rechazar'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.redAccent,
                      side: const BorderSide(color: Colors.redAccent),
                    ),
                  ),
                  const SizedBox(width: 10),
                  ElevatedButton.icon(
                    onPressed: () => _aprobar(context, oracion.id),
                    icon: const Icon(Icons.check, size: 16),
                    label: const Text('Aprobar'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF4FC3F7),
                      foregroundColor: Colors.black,
                    ),
                  ),
                ],
              ),
            ] else ...[
              const SizedBox(height: 10),
              Align(
                alignment: Alignment.centerRight,
                child: OutlinedButton.icon(
                  onPressed: () => _rechazar(context, oracion.id),
                  icon: const Icon(Icons.undo, size: 16),
                  label: const Text('Quitar'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.orange,
                    side: const BorderSide(color: Colors.orange),
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Future<void> _aprobar(BuildContext context, String id) async {
    await SupabaseService.instance.aprobarOracion(id);
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('✅ Pedido aprobado y publicado'),
          backgroundColor: Colors.green,
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  Future<void> _rechazar(BuildContext context, String id) async {
    await SupabaseService.instance.rechazarOracion(id);
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Pedido rechazado'),
          backgroundColor: Color(0xFFB00020),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }
}
