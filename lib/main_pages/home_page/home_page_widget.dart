import '/backend/firebase_service.dart';
import '/backend/auth_service.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/index.dart';
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

class _HomePageWidgetState extends State<HomePageWidget> {
  static const Color _pageBackground = Color(0xFF050505);
  static const Color _surfaceColor = Color(0xFF171717);
  static const Color _dividerColor = Color(0xFF2B2B2B);
  static const Color _mutedTextColor = Color(0xFFB5B5B5);

  static const String _wazeUrl = 'https://waze.com/ul/hd1u0x7u3j';
  static const String _youtubeUrl = 'https://youtube.com/@iglesiacjc217';
  static const String _instagramUrl = 'https://www.instagram.com/iglesiacjc';
  static const String _facebookUrl = 'https://www.facebook.com/share/1D6LhUGwoz/';
  static const String _phoneUrl = 'tel:+50670939483';

  late HomePageModel _model;
  int _lastSeenOrantes = 0;

  final scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => HomePageModel());
    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
    _loadLastSeenOrantes();
  }

  Future<void> _loadLastSeenOrantes() async {
    final uid = AuthService.instance.currentUser?.uid;
    if (uid == null) return;
    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getInt('lastSeenOrantes_$uid') ?? 0;
    if (mounted) setState(() => _lastSeenOrantes = saved);
  }

  Future<void> _markOrantesAsSeen(int total) async {
    final uid = AuthService.instance.currentUser?.uid;
    if (uid == null) return;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt('lastSeenOrantes_$uid', total);
    if (mounted) setState(() => _lastSeenOrantes = total);
  }


  @override
  void dispose() {
    _model.dispose();
    super.dispose();
  }

  Future<void> _openExternalLink(
    BuildContext context,
    String url,
    String label,
  ) async {
    if (url.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Configura el enlace de $label en HomePageWidget.'),
          backgroundColor: const Color(0xFF202020),
        ),
      );
      return;
    }

    await launchURL(url);
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        FocusScope.of(context).unfocus();
        FocusManager.instance.primaryFocus?.unfocus();
      },
      child: Scaffold(
        key: scaffoldKey,
        backgroundColor: _pageBackground,
        drawer: _buildDrawer(context),
        appBar: AppBar(
          backgroundColor: const Color(0xFF1A1A1A),
          automaticallyImplyLeading: false,
          elevation: 0.0,
          titleSpacing: 16.0,
          title: Row(
            children: [
              InkWell(
                onTap: () => scaffoldKey.currentState?.openDrawer(),
                borderRadius: BorderRadius.circular(24.0),
                child: CircleAvatar(
                  radius: 20.0,
                  backgroundColor: const Color(0xFF5A5A5A),
                  child: Text(
                    'CJC',
                    style: FlutterFlowTheme.of(context).labelMedium.override(
                          fontFamily:
                              FlutterFlowTheme.of(context).labelMediumFamily,
                          color: Colors.white,
                          fontSize: 11.0,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 0.4,
                          useGoogleFonts:
                              !FlutterFlowTheme.of(context).labelMediumIsCustom,
                        ),
                  ),
                ),
              ),
              Expanded(
                child: Text(
                  'Casa CJC',
                  textAlign: TextAlign.center,
                  style: FlutterFlowTheme.of(context).titleLarge.override(
                        fontFamily:
                            FlutterFlowTheme.of(context).titleLargeFamily,
                        color: Colors.white,
                        fontSize: 18.0,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0.0,
                        useGoogleFonts:
                            !FlutterFlowTheme.of(context).titleLargeIsCustom,
                      ),
                ),
              ),
              IconButton(
                onPressed: () {
                  Share.share(
                      '¡Descarga la app de Iglesia CJC! https://iglesiacjc.app');
                },
                icon: const Icon(
                  Icons.share_rounded,
                  color: Colors.white,
                  size: 26.0,
                ),
                tooltip: 'Compartir app',
              ),
              _buildNotificationBell(context),
            ],
          ),
        ),
        body: SafeArea(
          top: false,
          child: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(24.0, 18.0, 24.0, 32.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                _buildLiveBanner(context),
                _buildHeroCard(context),
                _buildDivider(),
                _buildWelcomeCopy(context),
                _buildDivider(),
                _buildServicesHeroCard(context),
                _buildDivider(),
                _buildMinistryGroups(context),
                _buildDivider(),
                _buildContactRow(
                  context,
                  icon: Icons.phone_rounded,
                  label: 'Phone',
                  onTap: () =>
                      _openExternalLink(context, _phoneUrl, 'telefono'),
                ),
                _buildDivider(),
                _buildGradientButton(
                  context,
                  label: 'Ubicacion Waze',
                  onPressed: () => _openExternalLink(context, _wazeUrl, 'Waze'),
                ),
                _buildDivider(),
                _buildSocialRow(context),
                _buildDivider(),
                _buildDonationCard(context),
                _buildDivider(),
                _buildGradientButton(
                  context,
                  label: 'Unirme a un GPS',
                  onPressed: () {
                    context.pushNamed(RegistroGpsPageWidget.routeName);
                  },
                ),
                _buildDivider(),
                _buildGradientButton(
                  context,
                  label: 'Iniciar un GPS',
                  onPressed: () {
                    context.pushNamed(CreacionGpsPageWidget.routeName);
                  },
                ),
                _buildDivider(),
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 16.0),
                  child: Center(
                    child: Image.asset(
                      'assets/images/LOGO_CJC_BLANCO_(1).png',
                      width: 92.0,
                      fit: BoxFit.contain,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildDrawer(BuildContext context) {
    final user = AuthService.instance.currentUser;
    return Drawer(
      backgroundColor: const Color(0xFF111111),
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // ── Header perfil ────────────────────────────────────────────────
            Container(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
              decoration: const BoxDecoration(
                border: Border(
                    bottom: BorderSide(color: Color(0xFF2B2B2B))),
              ),
              child: user != null
                  ? Row(children: [
                      CircleAvatar(
                        radius: 22,
                        backgroundColor: const Color(0xFF2B2B2B),
                        backgroundImage: (user.photoURL != null &&
                                user.photoURL!.isNotEmpty)
                            ? NetworkImage(user.photoURL!)
                            : null,
                        child: (user.photoURL == null ||
                                user.photoURL!.isEmpty)
                            ? const Icon(Icons.person_rounded,
                                color: Colors.white54, size: 22)
                            : null,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              user.displayName ?? 'Miembro CJC',
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
                      IconButton(
                        icon: const Icon(Icons.logout_rounded,
                            color: Colors.white38, size: 20),
                        tooltip: 'Cerrar sesión',
                        onPressed: () async {
                          Navigator.pop(context);
                          await AuthService.instance.signOut();
                          if (mounted) context.go(UserLoginPageWidget.routePath);
                        },
                      ),
                    ])
                  : InkWell(
                      onTap: () {
                        Navigator.pop(context);
                        context
                            .pushNamed(UserLoginPageWidget.routeName);
                      },
                      borderRadius: BorderRadius.circular(10),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            vertical: 10, horizontal: 12),
                        decoration: BoxDecoration(
                          color: const Color(0xFF1A1A1A),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                              color: const Color(0xFF2B2B2B)),
                        ),
                        child: const Row(children: [
                          Icon(Icons.login_rounded,
                              color: Color(0xFFE8D5B0), size: 20),
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
                        Navigator.pop(context);
                        context.pushNamed(AnunciosPageWidget.routeName);
                      }),
                  _buildDrawerItem(context,
                      icon: Icons.access_time_rounded,
                      label: 'Horarios',
                      onTap: () {
                        Navigator.pop(context);
                        context.pushNamed(HorariosPageWidget.routeName);
                      }),
                  _buildDrawerItem(context,
                      icon: Icons.location_on_rounded,
                      label: 'Ubicación',
                      onTap: () {
                        Navigator.pop(context);
                        context.pushNamed(UbicacionPageWidget.routeName);
                      }),
                  _buildDrawerItem(context,
                      icon: Icons.phone_rounded,
                      label: 'Contacto',
                      onTap: () {
                        Navigator.pop(context);
                        context.pushNamed(ContactoPageWidget.routeName);
                      }),
                  _buildDrawerItem(context,
                      icon: Icons.volunteer_activism_rounded,
                      label: 'Ofrendas',
                      onTap: () {
                        Navigator.pop(context);
                        context.pushNamed(OfrendasPageWidget.routeName);
                      }),

                  // ── Comunidad ────────────────────────────────────────────
                  _buildDrawerSection('Comunidad'),
                  _buildDrawerItem(context,
                      icon: Icons.people_rounded,
                      label: 'Pastores',
                      onTap: () {
                        Navigator.pop(context);
                        context.pushNamed(PastoresPageWidget.routeName);
                      }),
                  _buildDrawerItem(context,
                      icon: Icons.groups_rounded,
                      label: 'Equipos',
                      onTap: () {
                        Navigator.pop(context);
                        context.pushNamed(EquiposPageWidget.routeName);
                      }),
                  _buildDrawerItem(context,
                      icon: Icons.favorite_rounded,
                      label: 'Pedidos de Oración',
                      onTap: () {
                        Navigator.pop(context);
                        context.pushNamed(OracionPageWidget.routeName);
                      }),

                  // ── Crecimiento ──────────────────────────────────────────
                  _buildDrawerSection('Crecimiento'),
                  _buildDrawerItem(context,
                      icon: Icons.book_rounded,
                      label: 'Devocional',
                      onTap: () {
                        Navigator.pop(context);
                        context.pushNamed(DevocionalPageWidget.routeName);
                      }),
                  _buildDrawerItem(context,
                      icon: Icons.library_books_rounded,
                      label: 'Recursos',
                      onTap: () {
                        Navigator.pop(context);
                        context.pushNamed(RecursosPageWidget.routeName);
                      }),
                  _buildDrawerItem(context,
                      icon: Icons.music_note_rounded,
                      label: 'Playlist',
                      onTap: () {
                        Navigator.pop(context);
                        context.pushNamed(PlaylistPageWidget.routeName);
                      }),

                  // ── GPS ──────────────────────────────────────────────────
                  _buildDrawerSection('GPS'),
                  _buildDrawerItem(context,
                      icon: Icons.group_add_rounded,
                      label: 'Unirme a un GPS',
                      onTap: () {
                        Navigator.pop(context);
                        context.pushNamed(RegistroGpsPageWidget.routeName);
                      }),
                  _buildDrawerItem(context,
                      icon: Icons.add_location_alt_rounded,
                      label: 'Iniciar un GPS',
                      onTap: () {
                        Navigator.pop(context);
                        context.pushNamed(CreacionGpsPageWidget.routeName);
                      }),

                  // ── Multimedia ───────────────────────────────────────────
                  _buildDrawerSection('Multimedia'),
                  _buildDrawerItem(context,
                      icon: Icons.photo_library_rounded,
                      label: 'Galería',
                      onTap: () {
                        Navigator.pop(context);
                        context.pushNamed(GaleriaPageWidget.routeName);
                      }),

                  // ── App ──────────────────────────────────────────────────
                  _buildDrawerSection('App'),
                  _buildDrawerItem(context,
                      icon: Icons.share_rounded,
                      label: 'Compartir App',
                      onTap: () {
                        Navigator.pop(context);
                        Share.share(
                            '¡Descarga la app de Iglesia CJC! https://iglesiacjc.app');
                      }),

                  // ── Admin ─────────────────────────────────────────────────
                  _buildDrawerSection('Administración'),
                  _buildDrawerItem(context,
                      icon: Icons.admin_panel_settings_rounded,
                      label: 'Panel de Admin',
                      onTap: () {
                        Navigator.pop(context);
                        final user = FirebaseService.instance.currentUser;
                        if (user != null) {
                          context.pushNamed(AdminPanelPageWidget.routeName);
                        } else {
                          context.pushNamed(LoginPageWidget.routeName);
                        }
                      }),
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
          color: Color(0xFFE8D5B0),
          fontSize: 11,
          fontWeight: FontWeight.w700,
          letterSpacing: 1.2,
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
      leading: Icon(icon, color: Colors.white70, size: 22),
      title: Text(
        label,
        style: FlutterFlowTheme.of(context).titleSmall.override(
              fontFamily: FlutterFlowTheme.of(context).titleSmallFamily,
              color: Colors.white,
              letterSpacing: 0.0,
              useGoogleFonts: !FlutterFlowTheme.of(context).titleSmallIsCustom,
            ),
      ),
      trailing: const Icon(
        Icons.chevron_right_rounded,
        color: Colors.white70,
      ),
      dense: true,
      minLeadingWidth: 28,
    );
  }

  Widget _buildHeroCard(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(6.0),
      child: Container(
        height: 300.0,
        decoration: const BoxDecoration(
          color: _surfaceColor,
        ),
        child: Stack(
          fit: StackFit.expand,
          children: [
            Image.asset(
              'assets/images/WhatsApp_Image_2025-08-23_at_10.40.17.jpeg',
              fit: BoxFit.cover,
            ),
            Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Color(0x22000000),
                    Color(0xAA000000),
                  ],
                ),
              ),
            ),
            Center(
              child: Text(
                'BIENVENIDOS A CJC',
                textAlign: TextAlign.center,
                style: FlutterFlowTheme.of(context).headlineSmall.override(
                      fontFamily:
                          FlutterFlowTheme.of(context).headlineSmallFamily,
                      color: Colors.white,
                      fontSize: 28.0,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.5,
                      useGoogleFonts:
                          !FlutterFlowTheme.of(context).headlineSmallIsCustom,
                    ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildWelcomeCopy(BuildContext context) {
    return Column(
      children: [
        Text(
          'Bienvenidos a Iglesia CJC',
          textAlign: TextAlign.center,
          style: FlutterFlowTheme.of(context).headlineSmall.override(
                fontFamily: FlutterFlowTheme.of(context).headlineSmallFamily,
                color: Colors.white,
                fontSize: 22.0,
                fontWeight: FontWeight.w700,
                letterSpacing: 0.0,
                useGoogleFonts:
                    !FlutterFlowTheme.of(context).headlineSmallIsCustom,
              ),
        ),
        const SizedBox(height: 18.0),
        Text(
          'Somos una iglesia que cree que todo comienza en Dios y que la vida se vive mejor en familia. Somos una comunidad que camina junta, creciendo en fe, amor y propósito, poniendo a Cristo en el centro de todo lo que somos y hacemos.\n\nEn CJC no creemos en una fe aislada, sino en una fe que se vive y se camina. Caminamos juntos en procesos reales, con personas reales, aprendiendo cada día a seguir a Jesús con honestidad, gracia y compromiso.\n\nSomos una iglesia que adora con el corazón, sirve con alegría y vive su fe cada día. Aquí celebramos la vida, fortalecemos la familia y nos comprometemos a impactar nuestra comunidad con el amor de Dios.\n\nCJC no es solo un lugar al que asistes; es una familia a la que perteneces.\n\nSomos CJC. Somos familia. Una familia que camina en adoración y servicio a Dios.',
          textAlign: TextAlign.center,
          style: FlutterFlowTheme.of(context).bodyLarge.override(
                fontFamily: FlutterFlowTheme.of(context).bodyLargeFamily,
                color: Colors.white,
                fontSize: 16.0,
                lineHeight: 1.55,
                letterSpacing: 0.0,
                useGoogleFonts: !FlutterFlowTheme.of(context).bodyLargeIsCustom,
              ),
        ),
      ],
    );
  }

  Widget _buildServicesHeroCard(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(6.0),
      child: Container(
        height: 300.0,
        decoration: const BoxDecoration(
          color: _surfaceColor,
        ),
        child: Stack(
          fit: StackFit.expand,
          children: [
            Image.asset(
              'assets/images/WhatsApp_Image_2025-08-23_at_10.39.52.jpeg',
              fit: BoxFit.cover,
            ),
            Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Color(0x22000000),
                    Color(0xAA4A1B00),
                  ],
                ),
              ),
            ),
            Center(
              child: Text(
                'NUESTROS SERVICIOS',
                textAlign: TextAlign.center,
                style: FlutterFlowTheme.of(context).headlineSmall.override(
                      fontFamily:
                          FlutterFlowTheme.of(context).headlineSmallFamily,
                      color: Colors.white,
                      fontSize: 28.0,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.5,
                      useGoogleFonts:
                          !FlutterFlowTheme.of(context).headlineSmallIsCustom,
                    ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMinistryGroups(BuildContext context) {
    return Column(
      children: [
        Text(
          'Servicios',
          textAlign: TextAlign.center,
          style: FlutterFlowTheme.of(context).headlineSmall.override(
                fontFamily: FlutterFlowTheme.of(context).headlineSmallFamily,
                color: Colors.white,
                fontSize: 22.0,
                fontWeight: FontWeight.w700,
                letterSpacing: 0.0,
                useGoogleFonts:
                    !FlutterFlowTheme.of(context).headlineSmallIsCustom,
              ),
        ),
        const SizedBox(height: 18.0),
        Text(
          'Domingos 10 am\nServicio online Youtube\nPastoral infantil en simultaneo\n\nEventos personalizados para\nJovenes\nMujeres\nMatrimonios',
          textAlign: TextAlign.center,
          style: FlutterFlowTheme.of(context).titleLarge.override(
                fontFamily: FlutterFlowTheme.of(context).titleLargeFamily,
                color: Colors.white,
                fontSize: 16.0,
                fontWeight: FontWeight.w500,
                lineHeight: 1.45,
                letterSpacing: 0.0,
                useGoogleFonts:
                    !FlutterFlowTheme.of(context).titleLargeIsCustom,
              ),
        ),
      ],
    );
  }

  Widget _buildContactRow(
    BuildContext context, {
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(18.0),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8.0),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              color: _mutedTextColor,
              size: 22.0,
            ),
            const SizedBox(width: 12.0),
            Text(
              label,
              style: FlutterFlowTheme.of(context).bodyLarge.override(
                    fontFamily: FlutterFlowTheme.of(context).bodyLargeFamily,
                    color: _mutedTextColor,
                    letterSpacing: 0.0,
                    useGoogleFonts:
                        !FlutterFlowTheme.of(context).bodyLargeIsCustom,
                  ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSocialRow(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        _buildSocialButton(
          context,
          icon: FontAwesomeIcons.youtube,
          label: 'YouTube',
          onTap: () => _openExternalLink(context, _youtubeUrl, 'YouTube'),
        ),
        const SizedBox(width: 26.0),
        _buildSocialButton(
          context,
          icon: FontAwesomeIcons.instagram,
          label: 'Instagram',
          onTap: () => _openExternalLink(context, _instagramUrl, 'Instagram'),
        ),
        const SizedBox(width: 26.0),
        _buildSocialButton(
          context,
          icon: FontAwesomeIcons.facebook,
          label: 'Facebook',
          onTap: () => _openExternalLink(context, _facebookUrl, 'Facebook'),
        ),
      ],
    );
  }

  Widget _buildSocialButton(
    BuildContext context, {
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return Semantics(
      label: label,
      button: true,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(26.0),
        child: Padding(
          padding: const EdgeInsets.all(8.0),
          child: FaIcon(
            icon,
            color: const Color(0xFF5E5E5E),
            size: 34.0,
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

  Widget _buildGradientButton(
    BuildContext context, {
    required String label,
    required VoidCallback onPressed,
  }) {
    return Align(
      child: DecoratedBox(
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [
              Color(0xFF0C8BFF),
              Color(0xFF6EE85B),
            ],
          ),
          borderRadius: BorderRadius.circular(999.0),
          boxShadow: const [
            BoxShadow(
              color: Color(0x3300A8FF),
              blurRadius: 18.0,
              offset: Offset(0.0, 10.0),
            ),
          ],
        ),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: onPressed,
            borderRadius: BorderRadius.circular(999.0),
            child: Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: 26.0,
                vertical: 14.0,
              ),
              child: Text(
                label,
                style: FlutterFlowTheme.of(context).titleMedium.override(
                      fontFamily:
                          FlutterFlowTheme.of(context).titleMediumFamily,
                      color: Colors.white,
                      fontSize: 17.0,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.0,
                      useGoogleFonts:
                          !FlutterFlowTheme.of(context).titleMediumIsCustom,
                    ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNotificationBell(BuildContext context) {
    final uid = AuthService.instance.currentUser?.uid;
    if (uid == null) {
      return IconButton(
        onPressed: () => context.pushNamed(AnunciosPageWidget.routeName),
        icon: const Icon(Icons.notifications_rounded,
            color: Colors.white, size: 28.0),
      );
    }
    return StreamBuilder<List<Oracion>>(
      stream: FirebaseService.instance.misOracionesStream(uid),
      builder: (context, snapshot) {
        final oraciones = snapshot.data ?? [];
        final totalOrantes =
            oraciones.fold<int>(0, (sum, o) => sum + o.orantes);
        final hasNew = totalOrantes > _lastSeenOrantes;
        return Stack(
          clipBehavior: Clip.none,
          children: [
            IconButton(
              onPressed: () async {
                await _markOrantesAsSeen(totalOrantes);
                if (context.mounted) {
                  context.pushNamed(MisOracionesPageWidget.routeName);
                }
              },
              icon: const Icon(Icons.notifications_rounded,
                  color: Colors.white, size: 28.0),
            ),
            if (hasNew)
              Positioned(
                right: 6,
                top: 6,
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
    return const Padding(
      padding: EdgeInsets.symmetric(vertical: 22.0),
      child: Divider(
        height: 1.0,
        thickness: 1.0,
        color: _dividerColor,
      ),
    );
  }

  Widget _buildLiveBanner(BuildContext context) {
    return StreamBuilder<LiveConfig?>(
      stream: FirebaseService.instance.liveConfigStream(),
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
