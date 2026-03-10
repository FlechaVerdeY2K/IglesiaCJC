import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:flutter/material.dart';
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
  static const String _wazeUrl = '';
  static const String _gpsRequestUrl = '';

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

  Future<void> _openLink(BuildContext context, String url, String label) async {
    if (url.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
            content:
                Text('Configura el enlace de $label en UbicacionPageWidget.')),
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
        backgroundColor: const Color(0xFF050505),
        appBar: AppBar(
          backgroundColor: const Color(0xFF1A1A1A),
          automaticallyImplyLeading: false,
          elevation: 0.0,
          centerTitle: true,
          title: Text(
            'GPS',
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
        ),
        body: SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Container(
                  padding: const EdgeInsets.all(20.0),
                  decoration: BoxDecoration(
                    color: const Color(0xFF121212),
                    borderRadius: BorderRadius.circular(18.0),
                    border: Border.all(color: const Color(0xFF2B2B2B)),
                  ),
                  child: Column(
                    children: [
                      const FaIcon(
                        FontAwesomeIcons.locationArrow,
                        color: Colors.white,
                        size: 30.0,
                      ),
                      const SizedBox(height: 16.0),
                      Text(
                        'Ubicacion y acceso GPS',
                        textAlign: TextAlign.center,
                        style:
                            FlutterFlowTheme.of(context).headlineSmall.override(
                                  fontFamily: FlutterFlowTheme.of(context)
                                      .headlineSmallFamily,
                                  color: Colors.white,
                                  fontSize: 22.0,
                                  fontWeight: FontWeight.w700,
                                  letterSpacing: 0.0,
                                  useGoogleFonts: !FlutterFlowTheme.of(context)
                                      .headlineSmallIsCustom,
                                ),
                      ),
                      const SizedBox(height: 12.0),
                      Text(
                        'Desde aqui puedes conectar la ubicacion de Waze o compartir el formulario para apertura de GPS.',
                        textAlign: TextAlign.center,
                        style: FlutterFlowTheme.of(context).bodyLarge.override(
                              fontFamily:
                                  FlutterFlowTheme.of(context).bodyLargeFamily,
                              color: const Color(0xFFC8C8C8),
                              lineHeight: 1.5,
                              letterSpacing: 0.0,
                              useGoogleFonts: !FlutterFlowTheme.of(context)
                                  .bodyLargeIsCustom,
                            ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24.0),
                _buildGradientButton(
                  context,
                  'Ubicacion Waze',
                  () => _openLink(context, _wazeUrl, 'Waze'),
                ),
                const SizedBox(height: 16.0),
                _buildGradientButton(
                  context,
                  'Solicitud Apertura GPS',
                  () => _openLink(context, _gpsRequestUrl, 'solicitud GPS'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildGradientButton(
    BuildContext context,
    String label,
    VoidCallback onTap,
  ) {
    return DecoratedBox(
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [
            Color(0xFF0C8BFF),
            Color(0xFF6EE85B),
          ],
        ),
        borderRadius: BorderRadius.circular(999.0),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(999.0),
          child: Padding(
            padding:
                const EdgeInsets.symmetric(vertical: 16.0, horizontal: 22.0),
            child: Text(
              label,
              textAlign: TextAlign.center,
              style: FlutterFlowTheme.of(context).titleMedium.override(
                    fontFamily: FlutterFlowTheme.of(context).titleMediumFamily,
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.0,
                    useGoogleFonts:
                        !FlutterFlowTheme.of(context).titleMediumIsCustom,
                  ),
            ),
          ),
        ),
      ),
    );
  }
}
