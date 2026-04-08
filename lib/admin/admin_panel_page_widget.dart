import 'package:flutter/material.dart';
import '/backend/supabase_service.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/index.dart';
import 'admin_devocional_page_widget.dart';
import 'admin_pastores_page_widget.dart';
import 'admin_equipos_solicitudes_page_widget.dart';

class AdminPanelPageWidget extends StatefulWidget {
  const AdminPanelPageWidget({super.key});

  static String routeName = 'AdminPanelPage';
  static String routePath = '/adminPanel';

  @override
  State<AdminPanelPageWidget> createState() => _AdminPanelPageWidgetState();
}

class _AdminPanelPageWidgetState extends State<AdminPanelPageWidget> {
  static const Color _bg = Color(0xFF080E1E);
  static const Color _surface = Color(0xFF0F1C30);
  static const Color _accent = Color(0xFFBF1E2E);
  static const Color _muted = Color(0xFFB5B5B5);

  bool _checking = true;
  bool _isAdmin = false;

  @override
  void initState() {
    super.initState();
    _checkAdmin();
  }

  Future<void> _checkAdmin() async {
    final admin = await SupabaseService.instance.isAdmin;
    if (!mounted) return;
    if (!admin) {
      context.go('/homePage');
      return;
    }
    setState(() {
      _isAdmin = true;
      _checking = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final user = SupabaseService.instance.currentUser;

    if (_checking) {
      return const Scaffold(
        backgroundColor: Color(0xFF080E1E),
        body: Center(
          child: CircularProgressIndicator(color: Color(0xFFBF1E2E)),
        ),
      );
    }

    return Scaffold(
      backgroundColor: _bg,
      appBar: AppBar(
        backgroundColor: const Color(0xFF0D1628),
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
              await SupabaseService.instance.signOut();
              if (context.mounted) context.goNamed('HomePage');
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Header admin ───────────────────────────────────────────
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [_accent.withOpacity(0.18), _surface],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: _accent.withOpacity(0.25)),
              ),
              child: Row(
                children: [
                  Container(
                    width: 52,
                    height: 52,
                    decoration: BoxDecoration(
                      color: _accent.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: _accent.withOpacity(0.4)),
                    ),
                    child: const Icon(Icons.admin_panel_settings_rounded,
                        color: _accent, size: 26),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Administrador',
                            style: TextStyle(
                                color: Colors.white,
                                fontSize: 16,
                                fontWeight: FontWeight.w800)),
                        const SizedBox(height: 3),
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

            // ── Grid: Contenido ────────────────────────────────────────
            const _SectionTitle('Contenido'),
            const SizedBox(height: 14),
            GridView.count(
              crossAxisCount: 2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              childAspectRatio: 2.4,
              children: [
                _GridCard(
                  icon: Icons.campaign_rounded,
                  title: 'Anuncios',
                  color: const Color(0xFFBF1E2E),
                  onTap: () => context.pushNamed(AdminAnunciosPageWidget.routeName),
                ),
                _GridCard(
                  icon: Icons.event_rounded,
                  title: 'Eventos',
                  color: const Color(0xFF7EB8F7),
                  onTap: () => context.pushNamed(AdminEventosPageWidget.routeName),
                ),
                _GridCard(
                  icon: Icons.play_circle_rounded,
                  title: 'Sermones',
                  color: const Color(0xFFB07FD4),
                  onTap: () => context.pushNamed(AdminSermonesPageWidget.routeName),
                ),
                _GridCard(
                  icon: Icons.live_tv_rounded,
                  title: 'En Vivo',
                  color: const Color(0xFF40C072),
                  onTap: () => context.pushNamed(AdminLivePageWidget.routeName),
                ),
                _GridCard(
                  icon: Icons.auto_stories_rounded,
                  title: 'Devocionales',
                  color: const Color(0xFFD4A017),
                  onTap: () => context.pushNamed(AdminDevocionalPageWidget.routeName),
                ),
                _GridCard(
                  icon: Icons.library_books_rounded,
                  title: 'Recursos',
                  color: const Color(0xFF26C6DA),
                  onTap: () => context.pushNamed(AdminRecursosPageWidget.routeName),
                ),
                _GridCard(
                  icon: Icons.home_rounded,
                  title: 'Home',
                  color: const Color(0xFF4FC3F7),
                  onTap: () => context.pushNamed(AdminHomeConfigPageWidget.routeName),
                ),
              ],
            ),

            const SizedBox(height: 28),

            // ── Lista: Comunidad ───────────────────────────────────────
            const _SectionTitle('Comunidad'),
            const SizedBox(height: 14),

            _AdminCard(
              icon: Icons.favorite_rounded,
              title: 'Moderación de Oración',
              subtitle: 'Aprobar o rechazar pedidos de oración',
              iconColor: const Color(0xFFBF1E2E),
              onTap: () => context.pushNamed(AdminOracionPageWidget.routeName),
            ),
            const SizedBox(height: 10),
            _AdminCard(
              icon: Icons.people_rounded,
              title: 'Pastores',
              subtitle: 'Agregar, editar y eliminar pastores',
              iconColor: const Color(0xFF7EB8F7),
              onTap: () => context.pushNamed(AdminPastoresPageWidget.routeName),
            ),
            const SizedBox(height: 10),
            StreamBuilder<List<EquipoSolicitud>>(
              stream: SupabaseService.instance.todasSolicitudesEquipoStream(),
              builder: (context, snap) {
                final pendientes = (snap.data ?? [])
                    .where((s) => s.estado == 'pendiente')
                    .length;
                return _AdminCard(
                  icon: Icons.groups_rounded,
                  title: 'Solicitudes de Equipos',
                  subtitle: pendientes > 0
                      ? '$pendientes solicitud${pendientes == 1 ? '' : 'es'} pendiente${pendientes == 1 ? '' : 'es'}'
                      : 'Gestionar quién se une a cada equipo',
                  iconColor: const Color(0xFF40C072),
                  badge: pendientes,
                  onTap: () => context.pushNamed(
                      AdminEquiposSolicitudesPageWidget.routeName),
                );
              },
            ),
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
        color: Color(0xFFBF1E2E),
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
  final int badge;
  final Color? iconColor;

  const _AdminCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
    this.enabled = true,
    this.badge = 0,
    this.iconColor,
  });

  static const Color _surface = Color(0xFF0F1C30);
  static const Color _accent = Color(0xFFBF1E2E);
  static const Color _muted = Color(0xFFB5B5B5);

  @override
  Widget build(BuildContext context) {
    final c = iconColor ?? _accent;
    return Opacity(
      opacity: enabled ? 1.0 : 0.45,
      child: Material(
        color: _surface,
        borderRadius: BorderRadius.circular(14),
        child: InkWell(
          onTap: enabled ? onTap : null,
          borderRadius: BorderRadius.circular(14),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            child: Row(
              children: [
                Container(
                  width: 42,
                  height: 42,
                  decoration: BoxDecoration(
                    color: c.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(icon, color: c, size: 20),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(title,
                          style: const TextStyle(
                              color: Colors.white,
                              fontSize: 14,
                              fontWeight: FontWeight.w700)),
                      const SizedBox(height: 2),
                      Text(subtitle,
                          style: const TextStyle(color: _muted, fontSize: 12)),
                    ],
                  ),
                ),
                if (badge > 0)
                  Container(
                    margin: const EdgeInsets.only(right: 6),
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: _accent,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text('$badge',
                        style: const TextStyle(
                            color: Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.w700)),
                  ),
                Icon(
                  enabled ? Icons.chevron_right_rounded : Icons.lock_outline_rounded,
                  color: Colors.white24,
                  size: 20,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _GridCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final Color color;
  final VoidCallback onTap;

  const _GridCard({
    required this.icon,
    required this.title,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: const Color(0xFF0F1C30),
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: color.withOpacity(0.2)),
          ),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, color: color, size: 20),
              ),
              Text(
                title,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
