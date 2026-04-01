import 'package:flutter/material.dart';
import '/backend/firebase_service.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/index.dart';
import 'admin_devocional_page_widget.dart';

class AdminPanelPageWidget extends StatelessWidget {
  const AdminPanelPageWidget({super.key});

  static String routeName = 'AdminPanelPage';
  static String routePath = '/adminPanel';

  static const Color _bg = Color(0xFF050505);
  static const Color _surface = Color(0xFF171717);
  static const Color _accent = Color(0xFFE8D5B0);
  static const Color _muted = Color(0xFFB5B5B5);

  @override
  Widget build(BuildContext context) {
    final user = FirebaseService.instance.currentUser;

    return Scaffold(
      backgroundColor: _bg,
      appBar: AppBar(
        backgroundColor: const Color(0xFF1A1A1A),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_rounded, color: Colors.white),
          onPressed: () => context.safePop(),
        ),
        title: const Text(
          'Panel Admin',
          style: TextStyle(
              color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout_rounded, color: _muted),
            tooltip: 'Cerrar sesión',
            onPressed: () async {
              await FirebaseService.instance.signOut();
              if (context.mounted) context.goNamed('HomePage');
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: _surface,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: _accent.withAlpha(50)),
              ),
              child: Row(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: _accent.withAlpha(30),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.admin_panel_settings_rounded,
                        color: _accent, size: 24),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Administrador',
                            style: TextStyle(
                                color: Colors.white,
                                fontSize: 15,
                                fontWeight: FontWeight.w700)),
                        const SizedBox(height: 2),
                        Text(
                          user?.email ?? '',
                          style: const TextStyle(color: _muted, fontSize: 12),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 28),
            const _SectionTitle('Contenido'),
            const SizedBox(height: 12),

            _AdminCard(
              icon: Icons.campaign_rounded,
              title: 'Anuncios',
              subtitle: 'Crear, editar y eliminar anuncios',
              onTap: () =>
                  context.pushNamed(AdminAnunciosPageWidget.routeName),
            ),
            const SizedBox(height: 12),
            _AdminCard(
              icon: Icons.event_rounded,
              title: 'Eventos',
              subtitle: 'Gestionar el calendario de eventos',
              onTap: () =>
                  context.pushNamed(AdminEventosPageWidget.routeName),
            ),
            const SizedBox(height: 12),
            _AdminCard(
              icon: Icons.play_circle_outline_rounded,
              title: 'Sermones',
              subtitle: 'Subir y gestionar predicas de YouTube',
              onTap: () =>
                  context.pushNamed(AdminSermonesPageWidget.routeName),
            ),
            const SizedBox(height: 12),
            _AdminCard(
              icon: Icons.live_tv_rounded,
              title: 'Config. Live',
              subtitle: 'Configurar la transmisión en vivo',
              onTap: () => context.pushNamed(AdminLivePageWidget.routeName),
            ),
            const SizedBox(height: 12),
            _AdminCard(
              icon: Icons.favorite_rounded,
              title: 'Moderación de Oración',
              subtitle: 'Aprobar o rechazar pedidos de oración',
              onTap: () => context.pushNamed(AdminOracionPageWidget.routeName),
            ),

            const SizedBox(height: 12),
            _AdminCard(
              icon: Icons.auto_stories_rounded,
              title: 'Devocionales',
              subtitle: 'Publicar el devocional diario',
              onTap: () =>
                  context.pushNamed(AdminDevocionalPageWidget.routeName),
            ),

            const SizedBox(height: 28),
            const _SectionTitle('Próximamente'),
            const SizedBox(height: 12),
            const SizedBox(height: 12),
            _AdminCard(
              icon: Icons.people_rounded,
              title: 'Pastores y Equipos',
              subtitle: 'Gestionar el directorio de la iglesia',
              enabled: false,
              onTap: () {},
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String text;
  const _SectionTitle(this.text);

  @override
  Widget build(BuildContext context) {
    return Text(
      text.toUpperCase(),
      style: const TextStyle(
        color: Color(0xFFE8D5B0),
        fontSize: 11,
        fontWeight: FontWeight.w700,
        letterSpacing: 1.2,
      ),
    );
  }
}

class _AdminCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;
  final bool enabled;

  const _AdminCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
    this.enabled = true,
  });

  static const Color _surface = Color(0xFF171717);
  static const Color _accent = Color(0xFFE8D5B0);
  static const Color _muted = Color(0xFFB5B5B5);

  @override
  Widget build(BuildContext context) {
    return Opacity(
      opacity: enabled ? 1.0 : 0.45,
      child: InkWell(
        onTap: enabled ? onTap : null,
        borderRadius: BorderRadius.circular(14),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: _surface,
            borderRadius: BorderRadius.circular(14),
          ),
          child: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: _accent.withAlpha(20),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, color: _accent, size: 22),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title,
                        style: const TextStyle(
                            color: Colors.white,
                            fontSize: 15,
                            fontWeight: FontWeight.w600)),
                    const SizedBox(height: 2),
                    Text(subtitle,
                        style: const TextStyle(color: _muted, fontSize: 12)),
                  ],
                ),
              ),
              Icon(
                enabled
                    ? Icons.chevron_right_rounded
                    : Icons.lock_outline_rounded,
                color: Colors.white30,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
