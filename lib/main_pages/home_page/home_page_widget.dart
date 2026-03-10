import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/index.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:flutter/material.dart';
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
  static const String _gpsRequestUrl = '';
  static const String _youtubeUrl = 'https://youtube.com/@iglesiacjc217';
  static const String _instagramUrl = 'https://www.instagram.com/iglesiacjc';
  static const String _facebookUrl = 'https://www.facebook.com/share/1D6LhUGwoz/';
  static const String _phoneUrl = 'tel:+50670939483';

  late HomePageModel _model;

  final scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => HomePageModel());
    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
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
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Notificaciones disponibles pronto.'),
                    ),
                  );
                },
                icon: const Icon(
                  Icons.notifications_rounded,
                  color: Colors.white,
                  size: 28.0,
                ),
              ),
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
                  label: 'Solicitud Apertura GPS',
                  onPressed: () => _openExternalLink(
                    context,
                    _gpsRequestUrl,
                    'solicitud GPS',
                  ),
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
    return Drawer(
      backgroundColor: const Color(0xFF111111),
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20.0, 12.0, 20.0, 24.0),
              child: Image.asset(
                'assets/images/LOGO_CJC_BLANCO_(1).png',
                height: 72.0,
                fit: BoxFit.contain,
                alignment: Alignment.centerLeft,
              ),
            ),
            _buildDrawerItem(
              context,
              label: 'Contacto',
              onTap: () {
                Navigator.pop(context);
                context.pushNamed(ContactoPageWidget.routeName);
              },
            ),
            _buildDrawerItem(
              context,
              label: 'Ofrendas',
              onTap: () {
                Navigator.pop(context);
                context.pushNamed(OfrendasPageWidget.routeName);
              },
            ),
            _buildDrawerItem(
              context,
              label: 'Ubicacion',
              onTap: () {
                Navigator.pop(context);
                context.pushNamed(UbicacionPageWidget.routeName);
              },
            ),
            _buildDrawerItem(
              context,
              label: 'Horarios',
              onTap: () {
                Navigator.pop(context);
                context.pushNamed(HorariosPageWidget.routeName);
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDrawerItem(
    BuildContext context, {
    required String label,
    required VoidCallback onTap,
  }) {
    return ListTile(
      onTap: onTap,
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
}
