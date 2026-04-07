import '/backend/supabase_service.dart';
import '/backend/auth_service.dart';
import '/backend/cloudinary_service.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/index.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:flutter/material.dart';
import 'package:share_plus/share_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'home_page_model.dart';
export 'home_page_model.dart';

class HomePageWidget extends StatefulWidget {
  const HomePageWidget({super.key});

  static String routeName = 'HomePage';
  static String routePath = '/homePage';

  @override
  State<HomePageWidget> createState() => _HomePageWidgetState();
}

class _HomePageWidgetState extends State<HomePageWidget>
    with SingleTickerProviderStateMixin {
  static const Color _pageBackground = Color(0xFF080E1E);
  static const Color _surfaceColor = Color(0xFF0F1C30);
  static const Color _dividerColor = Color(0xFF1E2E4A);
  static const Color _mutedTextColor = Color(0xFFB5B5B5);

  HomeConfig _homeConfig = HomeConfig.defaults;

  late HomePageModel _model;
  int _lastSeenOrantes = 0;
  bool _isAdmin = false;
  bool _uploadingPhoto = false;
  String? _dbPhotoUrl;
  String? _dbName;
  String? _dbGenero; // 'M' | 'F' | null

  final scaffoldKey = GlobalKey<ScaffoldState>();

  late AnimationController _drawerCtrl;
  late Animation<double> _drawerAnim;

  void _openDrawer()  => _drawerCtrl.forward();
  void _closeDrawer() => _drawerCtrl.reverse();

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => HomePageModel());
    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
    _loadLastSeenOrantes();
    _listenHomeConfig();
    _checkAdmin();
    _loadUserProfile();

    _drawerCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 320),
    );
    _drawerAnim = CurvedAnimation(
      parent: _drawerCtrl,
      curve: Curves.easeOutCubic,
      reverseCurve: Curves.easeInCubic,
    );
  }

  Future<void> _uploadProfilePhoto() async {
    final uid = AuthService.instance.currentUser?.id;
    if (uid == null) return;
    setState(() => _uploadingPhoto = true);
    try {
      final url = await CloudinaryService.instance.pickAndUpload(
        folder: 'perfiles',
      );
      if (url != null) {
        await SupabaseService.instance.updateUserPhoto(uid, url);
        if (mounted) setState(() => _dbPhotoUrl = url);
      }
    } finally {
      if (mounted) setState(() => _uploadingPhoto = false);
    }
  }

  Future<void> _loadUserProfile() async {
    final uid = AuthService.instance.currentUser?.id;
    if (uid == null) return;
    final profile = await SupabaseService.instance.getUserProfile(uid);
    if (!mounted) return;
    setState(() {
      if (profile['foto_url'] != null && profile['foto_url']!.isNotEmpty) {
        _dbPhotoUrl = profile['foto_url'];
      }
      if (profile['nombre'] != null && profile['nombre']!.isNotEmpty) {
        _dbName = profile['nombre'];
      }
      if (profile['genero'] != null && profile['genero']!.isNotEmpty) {
        _dbGenero = profile['genero'];
      }
    });
  }

  Future<void> _checkAdmin() async {
    final admin = await SupabaseService.instance.isAdmin;
    if (mounted) setState(() => _isAdmin = admin);
  }

  void _listenHomeConfig() {
    // Carga inmediata via REST (no depende de WebSocket/Realtime)
    SupabaseService.instance.getHomeConfig().then((config) {
      if (mounted) setState(() => _homeConfig = config);
    });
    // Realtime para actualizaciones en vivo (opcional, falla silenciosamente)
    SupabaseService.instance.homeConfigStream().listen(
      (config) {
        if (mounted) setState(() => _homeConfig = config);
      },
      onError: (_) {}, // ya cargó por REST arriba
    );
  }

  Future<void> _loadLastSeenOrantes() async {
    final uid = AuthService.instance.currentUser?.id;
    if (uid == null) return;
    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getInt('lastSeenOrantes_$uid') ?? 0;
    if (mounted) setState(() => _lastSeenOrantes = saved);
  }

  Future<void> _markOrantesAsSeen(int total) async {
    final uid = AuthService.instance.currentUser?.id;
    if (uid == null) return;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt('lastSeenOrantes_$uid', total);
    if (mounted) setState(() => _lastSeenOrantes = total);
  }


  @override
  void dispose() {
    _drawerCtrl.dispose();
    _model.dispose();
    super.dispose();
  }

  Future<void> _openExternalLink(
    BuildContext context,
    String url,
    String label,
  ) async {
    final trimmed = url.trim();
    final uri = Uri.tryParse(trimmed);
    if (trimmed.isEmpty || uri == null || !uri.hasScheme) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Enlace de $label no configurado aún.'),
            backgroundColor: const Color(0xFF1E2E4A),
          ),
        );
      }
      return;
    }

    await launchURL(trimmed);
  }

  @override
  Widget build(BuildContext context) {
    const drawerWidth = 304.0;

    return GestureDetector(
      onTap: () {
        FocusScope.of(context).unfocus();
        FocusManager.instance.primaryFocus?.unfocus();
      },
      child: Stack(
        children: [
          Scaffold(
            key: scaffoldKey,
            backgroundColor: _pageBackground,
        appBar: AppBar(
          backgroundColor: const Color(0xFF0D1628),
          automaticallyImplyLeading: false,
          elevation: 0.0,
          toolbarHeight: 56,
          titleSpacing: 16.0,
          title: Row(
            children: [
              InkWell(
                onTap: _openDrawer,
                borderRadius: BorderRadius.circular(24.0),
                child: _buildUserAvatar(
                    AuthService.instance.currentUser, 20),
              ),
              Expanded(
                child: _buildAppBarTitle(context),
              ),
              _smallIconBtn(
                icon: Icons.share_rounded,
                tooltip: 'Compartir app',
                onPressed: () {
                  Share.share(
                      '¡Descarga la app de Iglesia CJC! https://iglesiacjc.app');
                },
              ),
              _buildNotificationBell(context),
            ],
          ),
        ),
        body: SafeArea(
          top: false,
          child: SingleChildScrollView(
            padding: EdgeInsets.zero,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Live Banner
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
                  child: _buildLiveBanner(context),
                ),
                // Hero sin padding lateral
                _buildHeroCard(context),
                const SizedBox(height: 32),
                // Bienvenida
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: _buildWelcomeCopy(context),
                ),
                const SizedBox(height: 32),
                // Servicios hero
                _buildServicesHeroCard(context),
                const SizedBox(height: 24),
                // Horarios cards
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: _buildScheduleCards(context),
                ),
                const SizedBox(height: 16),
                // WhatsApp + Ubicación
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: _buildQuickActionsRow(context),
                ),
                const SizedBox(height: 32),
                // Redes sociales
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: _buildSocialRow(context),
                ),
                const SizedBox(height: 32),
                // Ofrendas
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: _buildDonationCard(context),
                ),
                const SizedBox(height: 32),
                // GPS
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: _buildSectionLabel('Grupos de Proceso Semanal'),
                ),
                const SizedBox(height: 14),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Row(
                    children: [
                      Expanded(
                        child: _buildGpsCard(
                          context,
                          icon: Icons.group_add_rounded,
                          title: 'Unirme a un GPS',
                          subtitle: 'Sé parte de un grupo',
                          color: const Color(0xFF1B4332),
                          accentColor: const Color(0xFF40C072),
                          onTap: () => context.pushNamed(RegistroGpsPageWidget.routeName),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _buildGpsCard(
                          context,
                          icon: Icons.add_home_work_rounded,
                          title: 'Iniciar un GPS',
                          subtitle: 'Abrí tu propio grupo',
                          color: const Color(0xFF1A237E),
                          accentColor: const Color(0xFF7986CB),
                          onTap: () => context.pushNamed(CreacionGpsPageWidget.routeName),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 40),
                // Logo footer
                Center(
                  child: Image.asset(
                    'assets/images/LOGO_CJC_BLANCO_(1).png',
                    width: 80.0,
                    fit: BoxFit.contain,
                    color: Colors.white24,
                  ),
                ),
                const SizedBox(height: 32),
              ],
            ),
          ),
        ),
          ),
          // ── Scrim ──────────────────────────────────────────────────────────
          AnimatedBuilder(
            animation: _drawerAnim,
            builder: (context, _) {
              if (_drawerAnim.value == 0) return const SizedBox.shrink();
              return GestureDetector(
                onTap: _closeDrawer,
                child: Container(
                  color: Colors.black.withOpacity(0.55 * _drawerAnim.value),
                ),
              );
            },
          ),
          // ── Drawer panel ───────────────────────────────────────────────────
          AnimatedBuilder(
            animation: _drawerAnim,
            builder: (context, child) => Transform.translate(
              offset: Offset(drawerWidth * (_drawerAnim.value - 1), 0),
              child: child,
            ),
            child: SizedBox(
              width: drawerWidth,
              child: _buildDrawer(context),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDrawer(BuildContext context) {
    final user = AuthService.instance.currentUser;
    return Material(
      color: const Color(0xFF080E1E),
      elevation: 16,
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // ── Header perfil ────────────────────────────────────────────────
            Container(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
              decoration: const BoxDecoration(
                border: Border(
                    bottom: BorderSide(color: Color(0xFF1E2E4A))),
              ),
              child: user != null
                  ? Row(children: [
                      Tooltip(
                        message: 'Ver perfil',
                        child: InkWell(
                          onTap: () {
                            _closeDrawer();
                            context.pushNamed(PerfilPageWidget.routeName).then((_) => _loadUserProfile());
                          },
                          borderRadius: BorderRadius.circular(24),
                          child: _buildUserAvatar(user, 24),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _dbName ??
                                  (user.userMetadata?['full_name'] as String?) ??
                                  (user.userMetadata?['nombre'] as String?) ??
                                  (user.email as String?)?.split('@').first ??
                                  'Miembro CJC',
                              style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            Text(
                              user.email ?? '',
                              style: const TextStyle(
                                  color: Colors.white38, fontSize: 12),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                      _smallIconBtn(
                        icon: Icons.person_rounded,
                        tooltip: 'Ver perfil',
                        onPressed: () {
                          _closeDrawer();
                          context.pushNamed(PerfilPageWidget.routeName);
                        },
                      ),
                      _smallIconBtn(
                        icon: Icons.logout_rounded,
                        tooltip: 'Cerrar sesión',
                        onPressed: () async {
                          _closeDrawer();
                          await AuthService.instance.signOut();
                          if (mounted) context.go(UserLoginPageWidget.routePath);
                        },
                      ),
                    ])
                  : InkWell(
                      onTap: () {
                        _closeDrawer();
                        context
                            .pushNamed(UserLoginPageWidget.routeName);
                      },
                      borderRadius: BorderRadius.circular(10),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            vertical: 10, horizontal: 12),
                        decoration: BoxDecoration(
                          color: const Color(0xFF0D1628),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                              color: const Color(0xFF1E2E4A)),
                        ),
                        child: const Row(children: [
                          Icon(Icons.login_rounded,
                              color: Color(0xFFBF1E2E), size: 20),
                          SizedBox(width: 10),
                          Text('Iniciar sesión / Registrarse',
                              style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 14,
                                  fontWeight: FontWeight.w500)),
                        ]),
                      ),
                    ),
            ),
            Expanded(
              child: ListView(
                padding: EdgeInsets.zero,
                children: [
                  // ── Información ─────────────────────────────────────────
                  _buildDrawerSection('Información'),
                  _buildDrawerItem(context,
                      icon: Icons.campaign_rounded,
                      label: 'Anuncios',
                      onTap: () {
                        _closeDrawer();
                        context.pushNamed(AnunciosPageWidget.routeName);
                      }),
                  _buildDrawerItem(context,
                      icon: Icons.access_time_rounded,
                      label: 'Horarios',
                      onTap: () {
                        _closeDrawer();
                        context.pushNamed(HorariosPageWidget.routeName);
                      }),
                  _buildDrawerItem(context,
                      icon: Icons.location_on_rounded,
                      label: 'Ubicación',
                      onTap: () {
                        _closeDrawer();
                        context.pushNamed(UbicacionPageWidget.routeName);
                      }),
                  _buildDrawerItem(context,
                      icon: Icons.phone_rounded,
                      label: 'Contacto',
                      onTap: () {
                        _closeDrawer();
                        context.pushNamed(ContactoPageWidget.routeName);
                      }),
                  _buildDrawerItem(context,
                      icon: Icons.volunteer_activism_rounded,
                      label: 'Ofrendas',
                      onTap: () {
                        _closeDrawer();
                        context.pushNamed(OfrendasPageWidget.routeName);
                      }),

                  // ── Comunidad ────────────────────────────────────────────
                  _buildDrawerSection('Comunidad'),
                  _buildDrawerItem(context,
                      icon: Icons.people_rounded,
                      label: 'Pastores',
                      onTap: () {
                        _closeDrawer();
                        context.pushNamed(PastoresPageWidget.routeName);
                      }),
                  _buildDrawerItem(context,
                      icon: Icons.groups_rounded,
                      label: 'Equipos',
                      onTap: () {
                        _closeDrawer();
                        context.pushNamed(EquiposPageWidget.routeName);
                      }),
                  _buildDrawerItem(context,
                      icon: Icons.favorite_rounded,
                      label: 'Pedidos de Oración',
                      onTap: () {
                        _closeDrawer();
                        context.pushNamed(OracionPageWidget.routeName);
                      }),

                  // ── Crecimiento ──────────────────────────────────────────
                  _buildDrawerSection('Crecimiento'),
                  _buildDrawerItem(context,
                      icon: Icons.book_rounded,
                      label: 'Devocional',
                      onTap: () {
                        _closeDrawer();
                        context.pushNamed(DevocionalPageWidget.routeName);
                      }),
                  _buildDrawerItem(context,
                      icon: Icons.library_books_rounded,
                      label: 'Recursos',
                      onTap: () {
                        _closeDrawer();
                        context.pushNamed(RecursosPageWidget.routeName);
                      }),
                  _buildDrawerItem(context,
                      icon: Icons.music_note_rounded,
                      label: 'Playlist',
                      onTap: () {
                        _closeDrawer();
                        context.pushNamed(PlaylistPageWidget.routeName);
                      }),

                  // ── GPS ──────────────────────────────────────────────────
                  _buildDrawerSection('GPS'),
                  _buildDrawerItem(context,
                      icon: Icons.group_add_rounded,
                      label: 'Unirme a un GPS',
                      onTap: () {
                        _closeDrawer();
                        context.pushNamed(RegistroGpsPageWidget.routeName);
                      }),
                  _buildDrawerItem(context,
                      icon: Icons.add_location_alt_rounded,
                      label: 'Iniciar un GPS',
                      onTap: () {
                        _closeDrawer();
                        context.pushNamed(CreacionGpsPageWidget.routeName);
                      }),

                  // ── Multimedia ───────────────────────────────────────────
                  _buildDrawerSection('Multimedia'),
                  _buildDrawerItem(context,
                      icon: Icons.photo_library_rounded,
                      label: 'Galería',
                      onTap: () {
                        _closeDrawer();
                        context.pushNamed(GaleriaPageWidget.routeName);
                      }),

                  // ── App ──────────────────────────────────────────────────
                  _buildDrawerSection('App'),
                  _buildDrawerItem(context,
                      icon: Icons.share_rounded,
                      label: 'Compartir App',
                      onTap: () {
                        _closeDrawer();
                        Share.share(
                            '¡Descarga la app de Iglesia CJC! https://iglesiacjc.app');
                      }),

                  // ── Admin (solo visible para admins) ──────────────────────
                  if (_isAdmin) ...[
                    _buildDrawerSection('Administración'),
                    _buildDrawerItem(context,
                        icon: Icons.admin_panel_settings_rounded,
                        label: 'Panel de Admin',
                        onTap: () {
                          _closeDrawer();
                          context.pushNamed(AdminPanelPageWidget.routeName);
                        }),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDrawerSection(String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 18, 20, 4),
      child: Text(
        title.toUpperCase(),
        style: const TextStyle(
          color: Color(0xFFBF1E2E),
          fontSize: 11,
          fontWeight: FontWeight.w700,
          letterSpacing: 1.2,
        ),
      ),
    );
  }

  Widget _buildAppBarTitle(BuildContext context) {
    final user = AuthService.instance.currentUser;
    if (user == null) {
      return Text(
        'Casa CJC',
        textAlign: TextAlign.center,
        style: FlutterFlowTheme.of(context).titleLarge.override(
              fontFamily: FlutterFlowTheme.of(context).titleLargeFamily,
              color: Colors.white,
              fontSize: 18.0,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.0,
              useGoogleFonts: !FlutterFlowTheme.of(context).titleLargeIsCustom,
            ),
      );
    }
    final rawName = _dbName ??
        (user.userMetadata?['full_name'] as String?) ??
        (user.userMetadata?['nombre'] as String?) ??
        '';
    final firstName = rawName.trim().split(' ').first;
    final tratamiento = _dbGenero == 'F' ? 'hermana' : _dbGenero == 'M' ? 'hermano' : null;
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          'Bienvenido a CJC',
          textAlign: TextAlign.center,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 14,
            fontWeight: FontWeight.w700,
            letterSpacing: 0.2,
          ),
        ),
        if (firstName.isNotEmpty)
          Text(
            tratamiento != null ? '$tratamiento $firstName' : firstName,
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: Color(0xFFB0B8C8),
              fontSize: 12,
              fontWeight: FontWeight.w400,
            ),
          ),
      ],
    );
  }

  Widget _smallIconBtn({
    required IconData icon,
    required String tooltip,
    required VoidCallback onPressed,
  }) {
    return Tooltip(
      message: tooltip,
      child: InkWell(
        onTap: onPressed,
        borderRadius: BorderRadius.circular(8),
        child: Padding(
          padding: const EdgeInsets.all(6),
          child: Icon(icon, color: Colors.white38, size: 20),
        ),
      ),
    );
  }

  Widget _buildDrawerItem(
    BuildContext context, {
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return ListTile(
      onTap: onTap,
      leading: Icon(icon, color: Colors.white70, size: 20),
      title: Text(
        label,
        style: FlutterFlowTheme.of(context).titleSmall.override(
              fontFamily: FlutterFlowTheme.of(context).titleSmallFamily,
              color: Colors.white,
              fontSize: 14,
              letterSpacing: 0.0,
              useGoogleFonts: !FlutterFlowTheme.of(context).titleSmallIsCustom,
            ),
      ),
      trailing: const Icon(
        Icons.chevron_right_rounded,
        color: Colors.white70,
        size: 18,
      ),
      dense: true,
      visualDensity: const VisualDensity(horizontal: 0, vertical: -2),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 0),
      minLeadingWidth: 24,
    );
  }

  Widget _buildHeroCard(BuildContext context) {
    final heroUrl = _homeConfig.heroImageUrl;
    return SizedBox(
      height: 360.0,
      child: Stack(
        fit: StackFit.expand,
        children: [
          heroUrl.isNotEmpty
              ? Image.network(heroUrl, fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Image.asset(
                    'assets/images/WhatsApp_Image_2025-08-23_at_10.40.17.jpeg',
                    fit: BoxFit.cover))
              : Image.asset(
                  'assets/images/WhatsApp_Image_2025-08-23_at_10.40.17.jpeg',
                  fit: BoxFit.cover,
                ),
          // Gradiente: transparente arriba → negro sólido abajo (zona del texto)
          const DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                stops: [0.0, 0.35, 0.65, 1.0],
                colors: [
                  Color(0x00000000),
                  Color(0x33000000),
                  Color(0xCC000000),
                  Color(0xFF080E1E),
                ],
              ),
            ),
          ),
          // Contenido centrado
          Positioned(
            bottom: 32,
            left: 24,
            right: 24,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFBF1E2E),
                    borderRadius: BorderRadius.circular(4),
                    boxShadow: [
                      BoxShadow(color: Colors.black.withOpacity(0.5), blurRadius: 8),
                    ],
                  ),
                  child: const Text(
                    'IGLESIA CJC',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 2.5,
                    ),
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  'Bienvenidos a\nCasa CJC',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 34,
                    fontWeight: FontWeight.w800,
                    height: 1.15,
                    letterSpacing: -0.5,
                    shadows: [
                      Shadow(color: Colors.black.withOpacity(0.9), blurRadius: 20, offset: const Offset(0, 2)),
                      Shadow(color: Colors.black.withOpacity(0.7), blurRadius: 40, offset: Offset.zero),
                    ],
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  'Una familia que camina en adoración y servicio a Dios',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Colors.white70,
                    fontSize: 13,
                    fontWeight: FontWeight.w400,
                    height: 1.4,
                    shadows: [
                      Shadow(color: Colors.black.withOpacity(0.9), blurRadius: 16, offset: const Offset(0, 1)),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWelcomeCopy(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        _buildSectionLabel('QUIÉNES SOMOS'),
        const SizedBox(height: 12),
        Text(
          _homeConfig.bienvenidaTitulo,
          textAlign: TextAlign.center,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 26,
            fontWeight: FontWeight.w800,
            height: 1.2,
            letterSpacing: -0.3,
          ),
        ),
        const SizedBox(height: 6),
        // Línea decorativa
        Container(
          width: 48,
          height: 3,
          decoration: BoxDecoration(
            color: const Color(0xFFBF1E2E),
            borderRadius: BorderRadius.circular(2),
          ),
        ),
        const SizedBox(height: 20),
        Text(
          _homeConfig.bienvenidaTexto,
          textAlign: TextAlign.center,
          style: const TextStyle(
            color: Color(0xFFD0D8E8),
            fontSize: 15,
            height: 1.65,
            letterSpacing: 0.1,
          ),
        ),
      ],
    );
  }

  Widget _buildServicesHeroCard(BuildContext context) {
    final svcUrl = _homeConfig.serviciosImageUrl;
    return SizedBox(
      height: 220,
      child: Stack(
        fit: StackFit.expand,
        children: [
          svcUrl.isNotEmpty
              ? Image.network(svcUrl, fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Image.asset(
                    'assets/images/WhatsApp_Image_2025-08-23_at_10.39.52.jpeg',
                    fit: BoxFit.cover))
              : Image.asset(
                  'assets/images/WhatsApp_Image_2025-08-23_at_10.39.52.jpeg',
                  fit: BoxFit.cover,
                ),
          const DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Color(0xAA000714),
                  Color(0x884A1B00),
                ],
              ),
            ),
          ),
          Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(4),
                    border: Border.all(color: Colors.white30),
                    boxShadow: [
                      BoxShadow(color: Colors.black.withOpacity(0.4), blurRadius: 8),
                    ],
                  ),
                  child: const Text(
                    'CADA SEMANA',
                    style: TextStyle(
                      color: Colors.white70,
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 2.5,
                    ),
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  'Nuestros Servicios',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 30,
                    fontWeight: FontWeight.w800,
                    letterSpacing: -0.3,
                    shadows: [
                      Shadow(color: Colors.black.withOpacity(0.9), blurRadius: 20, offset: const Offset(0, 2)),
                      Shadow(color: Colors.black.withOpacity(0.7), blurRadius: 40, offset: Offset.zero),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildScheduleCards(BuildContext context) {
    final lines = _homeConfig.serviciosTexto
        .split('\n')
        .map((l) => l.trim())
        .where((l) => l.isNotEmpty)
        .toList();
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF0F1C30),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF1E2E4A)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: const Color(0x22BF1E2E),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(Icons.calendar_today_rounded,
                    color: Color(0xFFBF1E2E), size: 18),
              ),
              const SizedBox(width: 12),
              const Text(
                'Horarios y Ministerios',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          ...lines.map((line) => Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      margin: const EdgeInsets.only(top: 6),
                      width: 5,
                      height: 5,
                      decoration: const BoxDecoration(
                        color: Color(0xFFBF1E2E),
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        line,
                        style: const TextStyle(
                          color: Color(0xFFD0D8E8),
                          fontSize: 14,
                          height: 1.45,
                        ),
                      ),
                    ),
                  ],
                ),
              )),
        ],
      ),
    );
  }

  static const String _googleMapsUrl =
      'https://www.google.com/maps/search/?api=1&query=Iglesia+CJC+Costa+Rica';
  static const String _appleMapsUrl =
      'https://maps.apple.com/place?place-id=I1EBA9E5BF15CD72B&address=Avenida+39%2C+San+Jose%2C+Costa+Rica&coordinate=9.952379%2C-84.050348&name=Iglesia+CJC&_provider=9902';
  static const String _wazeMapUrl =
      'https://www.waze.com/ul?ll=9.952379,-84.050348&navigate=yes';

  Widget _buildQuickActionsRow(BuildContext context) {
    return Row(
      children: [
        // WhatsApp
        Expanded(
          child: _quickActionBtn(
            icon: const FaIcon(FontAwesomeIcons.whatsapp, color: Color(0xFF25D366), size: 22),
            label: 'WhatsApp',
            sublabel: 'Consultas',
            bgColor: const Color(0x2225D366),
            borderColor: const Color(0xFF1E3A2A),
            onTap: () => launchURL('https://wa.me/50670939483'),
          ),
        ),
        const SizedBox(width: 10),
        // Ubicación
        Expanded(
          child: _quickActionBtn(
            icon: const Icon(Icons.location_on_rounded, color: Color(0xFF4285F4), size: 22),
            label: 'Ubicación',
            sublabel: 'Cómo llegar',
            bgColor: const Color(0x224285F4),
            borderColor: const Color(0xFF1E2E4A),
            onTap: () => _showMapsSheet(context),
          ),
        ),
      ],
    );
  }

  Widget _quickActionBtn({
    required Widget icon,
    required String label,
    required String sublabel,
    required Color bgColor,
    required Color borderColor,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        decoration: BoxDecoration(
          color: const Color(0xFF0F1C30),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: borderColor),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(9),
              decoration: BoxDecoration(
                color: bgColor,
                borderRadius: BorderRadius.circular(10),
              ),
              child: icon,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label,
                      style: const TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                          fontWeight: FontWeight.w700)),
                  Text(sublabel,
                      style: const TextStyle(
                          color: Colors.white54, fontSize: 11)),
                ],
              ),
            ),
            const Icon(Icons.chevron_right_rounded, color: Colors.white24, size: 18),
          ],
        ),
      ),
    );
  }

  void _showMapsSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF111D2E),
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => Padding(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('¿Cómo querés llegar?',
                style: TextStyle(
                    color: Colors.white,
                    fontSize: 17,
                    fontWeight: FontWeight.w700)),
            const SizedBox(height: 4),
            const Text('Iglesia CJC · Avenida 39, San José',
                style: TextStyle(color: Colors.white54, fontSize: 13)),
            const SizedBox(height: 20),
            _mapsOption(
              logoUrl: 'https://www.gstatic.com/images/branding/product/2x/maps_96dp.png',
              fallbackIcon: const FaIcon(FontAwesomeIcons.google, color: Colors.white, size: 18),
              label: 'Google Maps',
              bgColor: const Color(0xFF1A73E8),
              onTap: () { Navigator.pop(context); launchURL(_googleMapsUrl); },
            ),
            const SizedBox(height: 10),
            _mapsOption(
              logoUrl: 'https://www.gstatic.com/images/branding/product/2x/waze_96dp.png',
              fallbackIcon: const FaIcon(FontAwesomeIcons.waze, color: Colors.white, size: 18),
              label: 'Waze',
              bgColor: const Color(0xFF33CCFF),
              onTap: () { Navigator.pop(context); launchURL(_wazeMapUrl); },
            ),
            const SizedBox(height: 10),
            _mapsOption(
              logoUrl: 'https://cdn.jim-nielsen.com/ios/512/maps-2023-03-27.png',
              fallbackIcon: _appleMapsIcon(),
              label: 'Apple Maps',
              bgColor: const Color(0xFF1C1C1E),
              onTap: () { Navigator.pop(context); launchURL(_appleMapsUrl); },
            ),
          ],
        ),
      ),
    );
  }

  Widget _appleMapsIcon() {
    return ClipRRect(
      borderRadius: BorderRadius.circular(6),
      child: Container(
        width: 32,
        height: 32,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF5AC8FA), Color(0xFF34C759), Color(0xFFFFCC00)],
          ),
        ),
        child: const Icon(Icons.navigation_rounded, color: Colors.white, size: 18),
      ),
    );
  }

  Widget _mapsOption({
    required String? logoUrl,
    required Widget fallbackIcon,
    required String label,
    required Color bgColor,
    required VoidCallback onTap,
  }) {
    Widget logoWidget;
    if (logoUrl != null) {
      logoWidget = ClipRRect(
        borderRadius: BorderRadius.circular(10),
        child: CachedNetworkImage(
          imageUrl: logoUrl,
          width: 40,
          height: 40,
          fit: BoxFit.cover,
          errorWidget: (_, __, ___) => Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(color: bgColor, borderRadius: BorderRadius.circular(10)),
            child: Center(child: fallbackIcon),
          ),
        ),
      );
    } else {
      logoWidget = SizedBox(width: 40, height: 40, child: Center(child: fallbackIcon));
    }

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: bgColor.withOpacity(0.12),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: bgColor.withOpacity(0.3)),
        ),
        child: Row(
          children: [
            logoWidget,
            const SizedBox(width: 14),
            Text(label,
                style: const TextStyle(
                    color: Colors.white,
                    fontSize: 15,
                    fontWeight: FontWeight.w600)),
            const Spacer(),
            const Icon(Icons.arrow_forward_ios_rounded, color: Colors.white38, size: 14),
          ],
        ),
      ),
    );
  }

  Widget _buildContactCard(BuildContext context) {
    return InkWell(
      onTap: () => _openExternalLink(context, _homeConfig.telefono, 'telefono'),
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        decoration: BoxDecoration(
          color: const Color(0xFF0F1C30),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: const Color(0xFF1E2E4A)),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0x2240C072),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.phone_rounded,
                  color: Color(0xFF40C072), size: 22),
            ),
            const SizedBox(width: 14),
            const Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Contáctanos',
                      style: TextStyle(
                          color: Colors.white,
                          fontSize: 15,
                          fontWeight: FontWeight.w700)),
                  SizedBox(height: 2),
                  Text('Llamar por teléfono',
                      style: TextStyle(
                          color: Colors.white54, fontSize: 12)),
                ],
              ),
            ),
            const Icon(Icons.chevron_right_rounded,
                color: Colors.white38, size: 22),
          ],
        ),
      ),
    );
  }

  Widget _buildIconButton(
    BuildContext context, {
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onPressed,
  }) {
    return InkWell(
      onTap: onPressed,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        decoration: BoxDecoration(
          color: const Color(0xFF0F1C30),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: const Color(0xFF1E2E4A)),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: color.withOpacity(0.18),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: color, size: 22),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Text(label,
                  style: const TextStyle(
                      color: Colors.white,
                      fontSize: 15,
                      fontWeight: FontWeight.w600)),
            ),
            const Icon(Icons.chevron_right_rounded,
                color: Colors.white38, size: 22),
          ],
        ),
      ),
    );
  }

  Widget _buildSocialRow(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        _buildSectionLabel('SÍGUENOS'),
        const SizedBox(height: 16),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _buildSocialButton(
              context,
              icon: FontAwesomeIcons.youtube,
              label: 'YouTube',
              color: const Color(0xFFFF0000),
              bg: const Color(0x22FF0000),
              onTap: () => _openExternalLink(context, _homeConfig.youtubeUrl, 'YouTube'),
            ),
            const SizedBox(width: 16),
            _buildSocialButton(
              context,
              icon: FontAwesomeIcons.instagram,
              label: 'Instagram',
              color: const Color(0xFFE1306C),
              bg: const Color(0x22E1306C),
              onTap: () => _openExternalLink(context, _homeConfig.instagramUrl, 'Instagram'),
            ),
            const SizedBox(width: 16),
            _buildSocialButton(
              context,
              icon: FontAwesomeIcons.facebook,
              label: 'Facebook',
              color: const Color(0xFF1877F2),
              bg: const Color(0x221877F2),
              onTap: () => _openExternalLink(context, _homeConfig.facebookUrl, 'Facebook'),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildSocialButton(
    BuildContext context, {
    required IconData icon,
    required String label,
    required VoidCallback onTap,
    required Color color,
    required Color bg,
  }) {
    return Semantics(
      label: label,
      button: true,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          decoration: BoxDecoration(
            color: bg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: color.withOpacity(0.25)),
          ),
          child: Column(
            children: [
              FaIcon(icon, color: color, size: 26),
              const SizedBox(height: 6),
              Text(
                label,
                style: TextStyle(
                  color: color,
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.3,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDonationCard(BuildContext context) {
    return InkWell(
      onTap: () => context.pushNamed(OfrendasPageWidget.routeName),
      borderRadius: BorderRadius.circular(8.0),
      child: Container(
        height: 188.0,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(8.0),
          image: const DecorationImage(
            image: AssetImage(
              'assets/images/WhatsApp_Image_2025-08-25_at_06.58.19.jpeg',
            ),
            fit: BoxFit.cover,
          ),
        ),
        child: Container(
          padding: const EdgeInsets.all(18.0),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(8.0),
            gradient: const LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                Color(0xCC00174A),
                Color(0xB3000714),
              ],
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Image.asset(
                    'assets/images/LOGO_CJC_BLANCO_(1).png',
                    width: 42.0,
                    fit: BoxFit.contain,
                  ),
                  const SizedBox(width: 10.0),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Ofrendas',
                        style: FlutterFlowTheme.of(context).titleLarge.override(
                              fontFamily:
                                  FlutterFlowTheme.of(context).titleLargeFamily,
                              color: Colors.white,
                              fontSize: 18.0,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 0.0,
                              useGoogleFonts: !FlutterFlowTheme.of(context)
                                  .titleLargeIsCustom,
                            ),
                      ),
                      Text(
                        'Iglesia CJC',
                        style: FlutterFlowTheme.of(context).bodyMedium.override(
                              fontFamily:
                                  FlutterFlowTheme.of(context).bodyMediumFamily,
                              color: Colors.white70,
                              letterSpacing: 0.0,
                              useGoogleFonts: !FlutterFlowTheme.of(context)
                                  .bodyMediumIsCustom,
                            ),
                      ),
                    ],
                  ),
                ],
              ),
              const Spacer(),
              Text(
                'TU DONACION TAMBIEN ES ADORACION',
                style: FlutterFlowTheme.of(context).headlineSmall.override(
                      fontFamily:
                          FlutterFlowTheme.of(context).headlineSmallFamily,
                      color: Colors.white,
                      fontSize: 18.0,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.4,
                      useGoogleFonts:
                          !FlutterFlowTheme.of(context).headlineSmallIsCustom,
                    ),
              ),
              const SizedBox(height: 14.0),
              Align(
                alignment: Alignment.centerRight,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 18.0,
                    vertical: 10.0,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha: 0.45),
                    borderRadius: BorderRadius.circular(999.0),
                  ),
                  child: Text(
                    'Ver ofrendas',
                    style: FlutterFlowTheme.of(context).bodyMedium.override(
                          fontFamily:
                              FlutterFlowTheme.of(context).bodyMediumFamily,
                          color: Colors.white,
                          fontWeight: FontWeight.w600,
                          letterSpacing: 0.0,
                          useGoogleFonts:
                              !FlutterFlowTheme.of(context).bodyMediumIsCustom,
                        ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // Muestra foto de perfil o iniciales del nombre
  Widget _buildUserAvatar(dynamic user, double radius) {
    final meta = user?.userMetadata as Map?;
    final rawPhoto = _dbPhotoUrl ?? (meta?['avatar_url'] as String?);
    final photoUrl = (rawPhoto != null && rawPhoto.isNotEmpty) ? rawPhoto : null;
    final name = _dbName ??
        (meta?['full_name'] as String?) ??
        (meta?['nombre'] as String?) ??
        ((user?.email as String?)?.split('@').first ?? '');
    final initials = name.trim().isEmpty
        ? 'CJC'
        : name.trim().split(' ').take(2).map((w) => w[0].toUpperCase()).join();

    if (photoUrl != null && photoUrl.isNotEmpty) {
      return CircleAvatar(
        radius: radius,
        backgroundColor: const Color(0xFF1E2E4A),
        child: ClipOval(
          child: Image.network(
            photoUrl,
            width: radius * 2,
            height: radius * 2,
            fit: BoxFit.cover,
            errorBuilder: (_, __, ___) => _initialsAvatar(initials, radius),
          ),
        ),
      );
    }
    return _initialsAvatar(initials, radius);
  }

  Widget _initialsAvatar(String initials, double radius) {
    return CircleAvatar(
      radius: radius,
      backgroundColor: const Color(0xFF1E2E4A),
      child: Text(
        initials,
        style: TextStyle(
          color: Colors.white,
          fontSize: radius * 0.55,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.5,
        ),
      ),
    );
  }

  Widget _buildNotificationBell(BuildContext context) {
    final uid = AuthService.instance.currentUser?.id;
    if (uid == null) {
      return _smallIconBtn(
        icon: Icons.notifications_rounded,
        tooltip: 'Anuncios',
        onPressed: () => context.pushNamed(AnunciosPageWidget.routeName),
      );
    }
    return StreamBuilder<List<Oracion>>(
      stream: SupabaseService.instance.misOracionesStream(uid),
      builder: (context, snapshot) {
        final oraciones = snapshot.data ?? [];
        final totalOrantes =
            oraciones.fold<int>(0, (sum, o) => sum + o.orantes);
        final hasNew = totalOrantes > _lastSeenOrantes;
        return Stack(
          clipBehavior: Clip.none,
          children: [
            _smallIconBtn(
              icon: Icons.notifications_rounded,
              tooltip: 'Mis oraciones',
              onPressed: () async {
                await _markOrantesAsSeen(totalOrantes);
                if (context.mounted) {
                  context.pushNamed(MisOracionesPageWidget.routeName);
                }
              },
            ),
            if (hasNew)
              Positioned(
                right: 0,
                top: 0,
                child: Container(
                  padding: const EdgeInsets.all(3),
                  decoration: const BoxDecoration(
                    color: Color(0xFF4CAF50),
                    shape: BoxShape.circle,
                  ),
                  constraints:
                      const BoxConstraints(minWidth: 16, minHeight: 16),
                  child: Text(
                    (totalOrantes - _lastSeenOrantes) > 99
                        ? '99+'
                        : '${totalOrantes - _lastSeenOrantes}',
                    style: const TextStyle(
                        color: Colors.white,
                        fontSize: 9,
                        fontWeight: FontWeight.w800),
                    textAlign: TextAlign.center,
                  ),
                ),
              ),
          ],
        );
      },
    );
  }


  Widget _buildDivider() {
    return const SizedBox(height: 24);
  }

  Widget _buildSectionLabel(String text) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Container(
          width: 20,
          height: 2,
          decoration: BoxDecoration(
            color: const Color(0xFFBF1E2E),
            borderRadius: BorderRadius.circular(1),
          ),
        ),
        const SizedBox(width: 8),
        Text(
          text,
          style: const TextStyle(
            color: Color(0xFFBF1E2E),
            fontSize: 11,
            fontWeight: FontWeight.w800,
            letterSpacing: 2.0,
          ),
        ),
        const SizedBox(width: 8),
        Container(
          width: 20,
          height: 2,
          decoration: BoxDecoration(
            color: const Color(0xFFBF1E2E),
            borderRadius: BorderRadius.circular(1),
          ),
        ),
      ],
    );
  }

  Widget _buildGpsCard(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required Color color,
    required Color accentColor,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: color.withOpacity(0.35),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: accentColor.withOpacity(0.3)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: accentColor.withOpacity(0.2),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: accentColor, size: 22),
            ),
            const SizedBox(height: 14),
            Text(
              title,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 14,
                fontWeight: FontWeight.w700,
                height: 1.2,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              subtitle,
              style: TextStyle(
                color: accentColor.withOpacity(0.8),
                fontSize: 12,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLiveBanner(BuildContext context) {
    return StreamBuilder<LiveConfig?>(
      stream: SupabaseService.instance.liveConfigStream(),
      builder: (context, snapshot) {
        final live = snapshot.data;
        if (live == null || !live.activo || live.videoId.isEmpty) {
          return const SizedBox.shrink();
        }
        return Padding(
          padding: const EdgeInsets.only(bottom: 18.0),
          child: GestureDetector(
            onTap: () => context.pushNamed(LivePageWidget.routeName),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFFB71C1C), Color(0xFFE53935)],
                ),
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: Colors.red.withOpacity(0.35),
                    blurRadius: 14,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Row(
                children: [
                  const _PulsingDot(),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'EN VIVO AHORA',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 1.0,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          live.titulo.isNotEmpty ? live.titulo : 'Ingresá y visualizá',
                          style: const TextStyle(
                            color: Colors.white70,
                            fontSize: 13,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  const Icon(Icons.play_circle_filled_rounded,
                      color: Colors.white, size: 32),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

class _PulsingDot extends StatefulWidget {
  const _PulsingDot();
  @override
  State<_PulsingDot> createState() => _PulsingDotState();
}

class _PulsingDotState extends State<_PulsingDot>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _anim;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    )..repeat(reverse: true);
    _anim = Tween<double>(begin: 0.4, end: 1.0).animate(
      CurvedAnimation(parent: _ctrl, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _anim,
      child: Container(
        width: 10,
        height: 10,
        decoration: const BoxDecoration(
          color: Colors.white,
          shape: BoxShape.circle,
        ),
      ),
    );
  }
}
