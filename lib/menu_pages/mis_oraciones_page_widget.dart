import 'package:intl/intl.dart';
import '/backend/auth_service.dart';
import '/backend/supabase_service.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:flutter/material.dart';

class MisOracionesPageWidget extends StatelessWidget {
  const MisOracionesPageWidget({super.key});

  static String routeName = 'MisOracionesPage';
  static String routePath = '/misOraciones';

  static const Color _bg = Color(0xFF080E1E);
  static const Color _surface = Color(0xFF0F1C30);
  static const Color _accent = Color(0xFFBF1E2E);
  static const Color _muted = Color(0xFFB5B5B5);

  @override
  Widget build(BuildContext context) {
    final uid = AuthService.instance.currentUser?.id ?? '';

    return Scaffold(
      backgroundColor: _bg,
      appBar: AppBar(
        backgroundColor: const Color(0xFF0D1628),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_rounded, color: Colors.white),
          onPressed: () => context.safePop(),
        ),
        title: const Text('Mis Peticiones',
            style: TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.w700)),
        centerTitle: true,
      ),
      body: StreamBuilder<List<Oracion>>(
        stream: SupabaseService.instance.misOracionesStream(uid),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(
                child: CircularProgressIndicator(color: _accent));
          }
          final oraciones = snapshot.data ?? [];
          if (oraciones.isEmpty) {
            return const Center(
              child: Padding(
                padding: EdgeInsets.all(32),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.volunteer_activism_rounded,
                        color: Colors.white24, size: 56),
                    SizedBox(height: 16),
                    Text(
                      'Aún no tenés peticiones aprobadas',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Colors.white54, fontSize: 15),
                    ),
                  ],
                ),
              ),
            );
          }
          return ListView.separated(
            padding: const EdgeInsets.all(20),
            itemCount: oraciones.length,
            separatorBuilder: (_, __) => const SizedBox(height: 12),
            itemBuilder: (_, i) => _buildCard(oraciones[i]),
          );
        },
      ),
    );
  }

  Widget _buildCard(Oracion oracion) {
    final fecha = DateFormat('d MMM yyyy', 'es').format(oracion.fecha);
    final orantes = oracion.orantes;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: _surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: orantes > 0
              ? const Color(0xFF4CAF50).withOpacity(0.4)
              : const Color(0xFF1E2E4A),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.volunteer_activism_rounded,
                  color: _accent, size: 18),
              const SizedBox(width: 8),
              Text(fecha,
                  style: const TextStyle(color: _muted, fontSize: 12)),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            oracion.peticion,
            style: const TextStyle(
                color: Colors.white, fontSize: 14, height: 1.5),
          ),
          const SizedBox(height: 14),
          Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            decoration: BoxDecoration(
              color: orantes > 0
                  ? const Color(0xFF1E3A1E)
                  : const Color(0xFF222222),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: orantes > 0
                    ? const Color(0xFF4CAF50)
                    : const Color(0xFF3A3A3A),
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  orantes > 0
                      ? Icons.favorite_rounded
                      : Icons.favorite_border_rounded,
                  color: orantes > 0
                      ? const Color(0xFF4CAF50)
                      : Colors.white38,
                  size: 16,
                ),
                const SizedBox(width: 6),
                Text(
                  orantes == 0
                      ? 'Nadie ha orado aún'
                      : orantes == 1
                          ? '1 persona está orando por ti'
                          : '$orantes personas están orando por ti',
                  style: TextStyle(
                    color: orantes > 0
                        ? const Color(0xFF4CAF50)
                        : Colors.white38,
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
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
