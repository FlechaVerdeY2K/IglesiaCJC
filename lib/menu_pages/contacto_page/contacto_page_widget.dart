import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'contacto_page_model.dart';
export 'contacto_page_model.dart';

class ContactoPageWidget extends StatefulWidget {
  const ContactoPageWidget({super.key});

  static String routeName = 'contactoPage';
  static String routePath = '/contactoPage';

  @override
  State<ContactoPageWidget> createState() => _ContactoPageWidgetState();
}

class _ContactoPageWidgetState extends State<ContactoPageWidget> {
  static const Color _bg = Color(0xFF050505);
  static const Color _surface = Color(0xFF171717);
  static const Color _accent = Color(0xFFE8D5B0);
  static const Color _muted = Color(0xFFB5B5B5);

  static const String _whatsappUrl = 'https://wa.me/50670939483';
  static const String _phoneUrl = 'tel:+50670939483';
  static const String _instagramUrl = 'https://www.instagram.com/iglesiacjc';
  static const String _facebookUrl =
      'https://www.facebook.com/share/1D6LhUGwoz/';
  static const String _youtubeUrl = 'https://youtube.com/@iglesiacjc217';

  late ContactoPageModel _model;
  final scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => ContactoPageModel());
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
        backgroundColor: const Color(0xFF1A1A1A),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_rounded, color: Colors.white),
          onPressed: () => context.safePop(),
        ),
        title: Text(
          'Contacto',
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
            // ── WhatsApp ─────────────────────────────────────────────────────
            _buildActionTile(
              icon: const FaIcon(FontAwesomeIcons.whatsapp,
                  color: Color(0xFF25D366), size: 26),
              label: 'WhatsApp',
              sublabel: '+506 7093-9483',
              onTap: () => launchURL(_whatsappUrl),
              highlight: true,
            ),
            const SizedBox(height: 10),
            // ── Teléfono ─────────────────────────────────────────────────────
            _buildActionTile(
              icon: const Icon(Icons.phone_rounded,
                  color: Colors.white, size: 24),
              label: 'Llamar',
              sublabel: '+506 7093-9483',
              onTap: () => launchURL(_phoneUrl),
              trailing: IconButton(
                onPressed: () {
                  Clipboard.setData(
                      const ClipboardData(text: '+50670939483'));
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                        content: Text('Número copiado'),
                        behavior: SnackBarBehavior.floating),
                  );
                },
                icon: const Icon(Icons.copy_rounded,
                    color: Colors.white54, size: 18),
              ),
            ),
            const SizedBox(height: 24),
            const Padding(
              padding: EdgeInsets.only(bottom: 12),
              child: Text('Redes sociales',
                  style: TextStyle(
                      color: Colors.white54,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 0.8)),
            ),
            // ── Instagram ────────────────────────────────────────────────────
            _buildActionTile(
              icon: const FaIcon(FontAwesomeIcons.instagram,
                  color: Color(0xFFE1306C), size: 24),
              label: 'Instagram',
              sublabel: '@iglesiacjc',
              onTap: () => launchURL(_instagramUrl),
            ),
            const SizedBox(height: 10),
            // ── Facebook ─────────────────────────────────────────────────────
            _buildActionTile(
              icon: const FaIcon(FontAwesomeIcons.facebook,
                  color: Color(0xFF1877F2), size: 24),
              label: 'Facebook',
              sublabel: 'Iglesia CJC',
              onTap: () => launchURL(_facebookUrl),
            ),
            const SizedBox(height: 10),
            // ── YouTube ──────────────────────────────────────────────────────
            _buildActionTile(
              icon: const FaIcon(FontAwesomeIcons.youtube,
                  color: Color(0xFFFF0000), size: 24),
              label: 'YouTube',
              sublabel: '@iglesiacjc217',
              onTap: () => launchURL(_youtubeUrl),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionTile({
    required Widget icon,
    required String label,
    required String sublabel,
    required VoidCallback onTap,
    bool highlight = false,
    Widget? trailing,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: highlight ? const Color(0xFF0D2218) : _surface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color:
                highlight ? const Color(0xFF25D366) : const Color(0xFF2B2B2B),
          ),
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
                      style: const TextStyle(color: _muted, fontSize: 13)),
                ],
              ),
            ),
            trailing ??
                const Icon(Icons.arrow_forward_ios_rounded,
                    color: Colors.white24, size: 16),
          ],
        ),
      ),
    );
  }
}
