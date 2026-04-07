import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:flutter/foundation.dart';
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
  static const Color _bg = Color(0xFF080E1E);
  static const Color _surface = Color(0xFF0F1C30);
  static const Color _accent = Color(0xFFBF1E2E);

  static const String _wazeUrl =
      'https://www.waze.com/ul?ll=9.952379,-84.050348&navigate=yes';
  static const String _googleMapsUrl =
      'https://www.google.com/maps/search/?api=1&query=Iglesia+CJC+Costa+Rica';
  static const String _appleMapsUrl =
      'https://maps.apple.com/place?place-id=I1EBA9E5BF15CD72B&address=Avenida+39%2C+San+Jose%2C+Costa+Rica&coordinate=9.952379%2C-84.050348&name=Iglesia+CJC&_provider=9902';
  static const String _direccion =
      'Avenida 39, San José, Costa Rica';

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

  Future<void> _openLink(String url, String label) async {
    if (url.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Configura el enlace de $label')),
      );
      return;
    }
    await launchURL(url);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: scaffoldKey,
      backgroundColor: _bg,
      appBar: AppBar(
        backgroundColor: const Color(0xFF0D1628),
        elevation: 0,
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
                useGoogleFonts:
                    !FlutterFlowTheme.of(context).titleLargeIsCustom,
              ),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 24, 20, 40),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // ── Dirección ────────────────────────────────────────────────────
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: _surface,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFF1E2E4A)),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.location_on_rounded,
                      color: Color(0xFFBF1E2E), size: 26),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Iglesia CJC',
                            style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w700,
                                fontSize: 16)),
                        const SizedBox(height: 4),
                        Text(_direccion,
                            style: const TextStyle(
                                color: Color(0xFFB5B5B5),
                                fontSize: 14,
                                height: 1.4)),
                      ],
                    ),
                  ),
                  IconButton(
                    onPressed: () {
                      Clipboard.setData(
                          const ClipboardData(text: _direccion));
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                            content: Text('Dirección copiada'),
                            behavior: SnackBarBehavior.floating),
                      );
                    },
                    icon: const Icon(Icons.copy_rounded,
                        color: Colors.white38, size: 18),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            const Text('Abrir con...',
                style: TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.w700)),
            const SizedBox(height: 14),
            // ── Waze ─────────────────────────────────────────────────────────
            _buildMapButton(
              label: 'Waze',
              sublabel: 'Navegación en tiempo real',
              icon: const FaIcon(FontAwesomeIcons.locationArrow,
                  color: Color(0xFF33CCFF), size: 22),
              color: const Color(0xFF0D2533),
              borderColor: const Color(0xFF33CCFF),
              onTap: () => _openLink(_wazeUrl, 'Waze'),
            ),
            const SizedBox(height: 10),
            // ── Google Maps ──────────────────────────────────────────────────
            _buildMapButton(
              label: 'Google Maps',
              sublabel: 'Ver en Google Maps',
              icon: const Icon(Icons.map_rounded,
                  color: Color(0xFF4285F4), size: 26),
              color: const Color(0xFF0D1833),
              borderColor: const Color(0xFF4285F4),
              onTap: () => _openLink(_googleMapsUrl, 'Google Maps'),
            ),
            if (!kIsWeb &&
                defaultTargetPlatform == TargetPlatform.iOS) ...[
              const SizedBox(height: 10),
              // ── Apple Maps ─────────────────────────────────────────────────
              _buildMapButton(
                label: 'Apple Maps',
                sublabel: 'Ver en Apple Maps',
                icon: const Icon(Icons.apple_rounded,
                    color: Colors.white, size: 26),
                color: const Color(0xFF0D1628),
                borderColor: const Color(0xFF3A3A3A),
                onTap: () => _openLink(_appleMapsUrl, 'Apple Maps'),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildMapButton({
    required String label,
    required String sublabel,
    required Widget icon,
    required Color color,
    required Color borderColor,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: color,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: borderColor.withOpacity(0.5)),
        ),
        child: Row(
          children: [
            SizedBox(width: 32, height: 32, child: Center(child: icon)),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label,
                      style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w600,
                          fontSize: 15)),
                  Text(sublabel,
                      style: const TextStyle(
                          color: Color(0xFFB5B5B5), fontSize: 12)),
                ],
              ),
            ),
            const Icon(Icons.arrow_forward_ios_rounded,
                color: Colors.white24, size: 16),
          ],
        ),
      ),
    );
  }
}

