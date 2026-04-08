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
  static const Color _bg      = Color(0xFF080E1E);
  static const Color _surface = Color(0xFF0F1C30);
  static const Color _border  = Color(0xFF1E2E4A);
  static const Color _muted   = Color(0xFFB5B5B5);

  static const String _whatsappUrl = 'https://wa.me/50670939483';
  static const String _phoneUrl    = 'tel:+50670939483';
  static const String _instagramUrl = 'https://www.instagram.com/iglesiacjc';
  static const String _facebookUrl  = 'https://www.facebook.com/share/1D6LhUGwoz/';
  static const String _youtubeUrl   = 'https://youtube.com/@iglesiacjc217';

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
        backgroundColor: const Color(0xFF0D1628),
        elevation: 0,
        toolbarHeight: 56,
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
                useGoogleFonts: !FlutterFlowTheme.of(context).titleLargeIsCustom,
              ),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 28, 20, 48),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 900),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [

                // ── Header ───────────────────────────────────────────────────
                const Text(
                  'Estamos para\nservirte',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 26,
                    fontWeight: FontWeight.w800,
                    height: 1.2,
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Contactanos por cualquiera de estos medios.',
                  style: TextStyle(color: Color(0xFF7A9ABF), fontSize: 14),
                ),
                const SizedBox(height: 28),

                // ── Contacto directo ─────────────────────────────────────────
                _sectionLabel('CONTACTO DIRECTO'),
                const SizedBox(height: 12),

                // WhatsApp — CTA principal
                _buildPrimaryBtn(
                  icon: const FaIcon(FontAwesomeIcons.whatsapp,
                      color: Color(0xFF25D366), size: 24),
                  label: 'WhatsApp',
                  sublabel: 'Respondemos en minutos',
                  accentColor: const Color(0xFF25D366),
                  bgColor: const Color(0xFF0A1F12),
                  borderColor: const Color(0xFF1A4A25),
                  onTap: () => launchURL(_whatsappUrl),
                ),
                const SizedBox(height: 10),

                // Llamar
                _buildContactRow(
                  icon: const Icon(Icons.phone_rounded,
                      color: Color(0xFF7EB8F7), size: 22),
                  label: 'Llamar',
                  sublabel: '+506 7093-9483',
                  trailing: GestureDetector(
                    onTap: () {
                      Clipboard.setData(
                          const ClipboardData(text: '+50670939483'));
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: const Text('Número copiado'),
                          backgroundColor: _surface,
                          behavior: SnackBarBehavior.floating,
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10)),
                        ),
                      );
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1A2B42),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Text('Copiar',
                          style: TextStyle(
                              color: Color(0xFF7EB8F7),
                              fontSize: 12,
                              fontWeight: FontWeight.w600)),
                    ),
                  ),
                  onTap: () => launchURL(_phoneUrl),
                ),

                const SizedBox(height: 28),

                // ── Redes sociales ───────────────────────────────────────────
                _sectionLabel('REDES SOCIALES'),
                const SizedBox(height: 12),

                _buildSocialCard(
                  icon: const FaIcon(FontAwesomeIcons.instagram,
                      color: Color(0xFFE1306C), size: 22),
                  label: 'Instagram',
                  handle: '@iglesiacjc',
                  bgColor: const Color(0xFF1A0A14),
                  borderColor: const Color(0xFF3A1525),
                  onTap: () => launchURL(_instagramUrl),
                ),
                const SizedBox(height: 10),
                _buildSocialCard(
                  icon: const FaIcon(FontAwesomeIcons.facebook,
                      color: Color(0xFF1877F2), size: 22),
                  label: 'Facebook',
                  handle: 'Iglesia CJC',
                  bgColor: const Color(0xFF0A0F1A),
                  borderColor: const Color(0xFF152035),
                  onTap: () => launchURL(_facebookUrl),
                ),
                const SizedBox(height: 10),
                _buildSocialCard(
                  icon: const FaIcon(FontAwesomeIcons.youtube,
                      color: Color(0xFFFF0000), size: 22),
                  label: 'YouTube',
                  handle: '@iglesiacjc217',
                  bgColor: const Color(0xFF1A0A0A),
                  borderColor: const Color(0xFF3A1515),
                  onTap: () => launchURL(_youtubeUrl),
                ),

                const SizedBox(height: 32),

                // ── Horario de atención ───────────────────────────────────────
                Container(
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
                          color: const Color(0xFF1A2A1A),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(Icons.access_time_rounded,
                            color: Color(0xFF4CAF50), size: 20),
                      ),
                      const SizedBox(width: 14),
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Horario de atención',
                                style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 14,
                                    fontWeight: FontWeight.w700)),
                            SizedBox(height: 3),
                            Text('Lun–Vie · 9:00 AM – 6:00 PM',
                                style: TextStyle(
                                    color: Color(0xFF7A9ABF), fontSize: 12)),
                          ],
                        ),
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

  // ── CTA principal (WhatsApp) ──────────────────────────────────────────────
  Widget _buildPrimaryBtn({
    required Widget icon,
    required String label,
    required String sublabel,
    required Color accentColor,
    required Color bgColor,
    required Color borderColor,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: borderColor),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: accentColor.withOpacity(0.12),
                borderRadius: BorderRadius.circular(10),
              ),
              child: icon,
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label,
                      style: const TextStyle(
                          color: Colors.white,
                          fontSize: 15,
                          fontWeight: FontWeight.w700)),
                  Text(sublabel,
                      style: TextStyle(
                          color: accentColor.withOpacity(0.7), fontSize: 12)),
                ],
              ),
            ),
            Icon(Icons.arrow_forward_ios_rounded,
                color: accentColor.withOpacity(0.5), size: 14),
          ],
        ),
      ),
    );
  }

  // ── Fila de contacto (teléfono) ──────────────────────────────────────────
  Widget _buildContactRow({
    required Widget icon,
    required String label,
    required String sublabel,
    required Widget trailing,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
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
                color: const Color(0xFF7EB8F7).withOpacity(0.10),
                borderRadius: BorderRadius.circular(10),
              ),
              child: icon,
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label,
                      style: const TextStyle(
                          color: Colors.white,
                          fontSize: 15,
                          fontWeight: FontWeight.w700)),
                  Text(sublabel,
                      style: const TextStyle(color: _muted, fontSize: 12)),
                ],
              ),
            ),
            trailing,
          ],
        ),
      ),
    );
  }

  // ── Card de red social ───────────────────────────────────────────────────
  Widget _buildSocialCard({
    required Widget icon,
    required String label,
    required String handle,
    required Color bgColor,
    required Color borderColor,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: borderColor),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.05),
                borderRadius: BorderRadius.circular(10),
              ),
              child: icon,
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
                  Text(handle,
                      style: const TextStyle(color: _muted, fontSize: 12)),
                ],
              ),
            ),
            const Icon(Icons.arrow_forward_ios_rounded,
                color: Colors.white24, size: 14),
          ],
        ),
      ),
    );
  }

  Widget _sectionLabel(String label) {
    return Text(
      label,
      style: const TextStyle(
        color: Color(0xFF4A6A8A),
        fontSize: 11,
        fontWeight: FontWeight.w700,
        letterSpacing: 1.2,
      ),
    );
  }
}
