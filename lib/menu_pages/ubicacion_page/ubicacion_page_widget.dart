import 'package:cached_network_image/cached_network_image.dart';
import 'map_embed_web.dart' if (dart.library.io) 'map_embed_stub.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'ubicacion_page_model.dart';
export 'ubicacion_page_model.dart';

class UbicacionPageWidget extends StatefulWidget {
  const UbicacionPageWidget({super.key});

  static String routeName = 'ubicacionPage';
  static String routePath = '/ubicacionPage';

  @override
  State<UbicacionPageWidget> createState() => _UbicacionPageWidgetState();
}

class _UbicacionPageWidgetState extends State<UbicacionPageWidget> {
  static const Color _bg      = Color(0xFF080E1E);
  static const Color _surface = Color(0xFF0F1C30);
  static const Color _accent  = Color(0xFFBF1E2E);
  static const Color _border  = Color(0xFF1E2E4A);
  static const Color _muted   = Color(0xFFB5B5B5);

  static const double _lat = 9.952379;
  static const double _lng = -84.050348;

  static const String _wazeUrl =
      'https://www.waze.com/ul?ll=$_lat,$_lng&navigate=yes';
  static const String _googleMapsUrl =
      'https://www.google.com/maps/search/?api=1&query=Iglesia+CJC+Costa+Rica';
  static const String _appleMapsUrl =
      'https://maps.apple.com/place?place-id=I1EBA9E5BF15CD72B&address=Avenida+39%2C+San+Jose%2C+Costa+Rica&coordinate=$_lat%2C$_lng&name=Iglesia+CJC&_provider=9902';

  // Static map preview via Google Static Maps API (no key needed for low-res)
  static const String _staticMapUrl =
      'https://maps.googleapis.com/maps/api/staticmap'
      '?center=$_lat,$_lng&zoom=15&size=600x220&scale=2'
      '&markers=color:red%7C$_lat,$_lng'
      '&style=feature:all%7Celement:geometry%7Ccolor:0x0f1c30'
      '&style=feature:road%7Celement:geometry%7Ccolor:0x1e2e4a'
      '&style=feature:water%7Celement:geometry%7Ccolor:0x080e1e'
      '&key=';

  late UbicacionPageModel _model;
  final scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => UbicacionPageModel());
    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  @override
  void dispose() {
    _model.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: scaffoldKey,
      backgroundColor: _bg,
      appBar: AppBar(
        backgroundColor: const Color(0xFF0D1628),
        elevation: 0,
        toolbarHeight: 56,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_rounded, color: Colors.white),
          onPressed: () => context.safePop(),
        ),
        title: Text(
          'Ubicación',
          style: FlutterFlowTheme.of(context).titleLarge.override(
                fontFamily: FlutterFlowTheme.of(context).titleLargeFamily,
                color: Colors.white,
                fontSize: 18.0,
                fontWeight: FontWeight.w700,
                letterSpacing: 0.0,
                useGoogleFonts: !FlutterFlowTheme.of(context).titleLargeIsCustom,
              ),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 900),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [

                // ── Preview estático del mapa ────────────────────────────────
                _buildMapPreview(context),

                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 20, 20, 40),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [

                      // ── Dirección card ───────────────────────────────────────
                      _buildAddressCard(context),
                      const SizedBox(height: 20),

                      // ── Cómo llegar ──────────────────────────────────────────
                      _buildReferencesCard(),
                      const SizedBox(height: 24),

                      // ── Abrir con ────────────────────────────────────────────
                      const Text(
                        'ABRIR CON',
                        style: TextStyle(
                          color: Color(0xFF4A6A8A),
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 1.2,
                        ),
                      ),
                      const SizedBox(height: 12),
                      _buildNavBtn(
                        logoUrl: 'https://www.gstatic.com/images/branding/product/2x/maps_96dp.png',
                        label: 'Google Maps',
                        sublabel: 'Ver ruta en Google Maps',
                        accentColor: const Color(0xFF4285F4),
                        onTap: () => launchURL(_googleMapsUrl),
                      ),
                      const SizedBox(height: 10),
                      _buildNavBtn(
                        logoUrl: 'https://www.gstatic.com/images/branding/product/2x/waze_96dp.png',
                        label: 'Waze',
                        sublabel: 'Navegación con tráfico en tiempo real',
                        accentColor: const Color(0xFF33CCFF),
                        onTap: () => launchURL(_wazeUrl),
                      ),
                      const SizedBox(height: 10),
                      _buildNavBtn(
                        logoUrl: 'https://cdn.jim-nielsen.com/ios/512/maps-2023-03-27.png',
                        label: 'Apple Maps',
                        sublabel: 'Ver en Apple Maps',
                        accentColor: const Color(0xFF34C759),
                        onTap: () => launchURL(_appleMapsUrl),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // ── Preview del mapa via iframe OpenStreetMap ────────────────────────────
  Widget _buildMapPreview(BuildContext context) {
    return Stack(
      children: [
        SizedBox(
          height: 220,
          child: buildMapEmbed(),
        ),
        // Gradient overlay bottom para transición suave al fondo
        Positioned(
          bottom: 0, left: 0, right: 0,
          child: Container(
            height: 48,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [Colors.transparent, _bg],
              ),
            ),
          ),
        ),
      ],
    );
  }

  // ── Dirección card ────────────────────────────────────────────────────────
  Widget _buildAddressCard(BuildContext context) {
    const direccion = 'Avenida 39, San José, Costa Rica';
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: _surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: _border),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: _accent.withOpacity(0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.location_on_rounded, color: _accent, size: 22),
          ),
          const SizedBox(width: 14),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Iglesia CJC',
                    style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w700,
                        fontSize: 15)),
                SizedBox(height: 3),
                Text(direccion,
                    style: TextStyle(color: _muted, fontSize: 13, height: 1.4)),
              ],
            ),
          ),
          const SizedBox(width: 8),
          GestureDetector(
            onTap: () {
              Clipboard.setData(const ClipboardData(text: direccion));
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: const Text('Dirección copiada'),
                  backgroundColor: _surface,
                  behavior: SnackBarBehavior.floating,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10)),
                ),
              );
            },
            child: const Icon(Icons.copy_rounded, color: Colors.white38, size: 18),
          ),
        ],
      ),
    );
  }

  // ── Referencias para llegar ───────────────────────────────────────────────
  Widget _buildReferencesCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: _surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: _border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.info_outline_rounded, color: Color(0xFF7EB8F7), size: 18),
              SizedBox(width: 8),
              Text('Cómo llegar',
                  style: TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.w700)),
            ],
          ),
          const SizedBox(height: 12),
          _referenceItem(Icons.directions_bus_rounded,
              'Servicio los domingos a las 10:00 AM y miércoles 7:30 PM'),
          const SizedBox(height: 8),
          _referenceItem(Icons.local_parking_rounded,
              'Estacionamiento disponible en el lugar'),
          const SizedBox(height: 8),
          _referenceItem(Icons.accessible_rounded,
              'Acceso para personas con movilidad reducida'),
        ],
      ),
    );
  }

  Widget _referenceItem(IconData icon, String text) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, color: const Color(0xFF4A6A8A), size: 16),
        const SizedBox(width: 10),
        Expanded(
          child: Text(text,
              style: const TextStyle(color: _muted, fontSize: 13, height: 1.5)),
        ),
      ],
    );
  }

  // ── Botón de navegación ───────────────────────────────────────────────────
  Widget _buildNavBtn({
    required String logoUrl,
    required String label,
    required String sublabel,
    required Color accentColor,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: _surface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: _border),
        ),
        child: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: CachedNetworkImage(
                imageUrl: logoUrl,
                width: 40,
                height: 40,
                fit: BoxFit.cover,
                errorWidget: (_, __, ___) => Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: accentColor.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(Icons.map_rounded, color: accentColor, size: 22),
                ),
              ),
            ),
            const SizedBox(width: 14),
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
                      style: const TextStyle(color: _muted, fontSize: 12)),
                ],
              ),
            ),
            Icon(Icons.arrow_forward_ios_rounded,
                color: accentColor.withOpacity(0.6), size: 14),
          ],
        ),
      ),
    );
  }
}
