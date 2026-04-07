import 'package:cached_network_image/cached_network_image.dart';

import '/backend/supabase_service.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/index.dart';
import 'package:flutter/material.dart';
import 'anuncios_page_model.dart';
export 'anuncios_page_model.dart';

class AnunciosPageWidget extends StatefulWidget {
  const AnunciosPageWidget({super.key});

  static String routeName = 'AnunciosPage';
  static String routePath = '/anunciosPage';

  @override
  State<AnunciosPageWidget> createState() => _AnunciosPageWidgetState();
}

class _AnunciosPageWidgetState extends State<AnunciosPageWidget> {
  static const Color _pageBackground = Color(0xFF080E1E);
  static const Color _surfaceColor = Color(0xFF0F1C30);
  static const Color _accentColor = Color(0xFFBF1E2E);

  late AnunciosPageModel _model;

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => AnunciosPageModel());
  }

  @override
  void dispose() {
    _model.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _pageBackground,
      appBar: AppBar(
        backgroundColor: const Color(0xFF0D1628),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_rounded, color: Colors.white),
          onPressed: () => context.safePop(),
        ),
        title: Text(
          'Anuncios',
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
      body: StreamBuilder<List<Anuncio>>(
        stream: SupabaseService.instance.anunciosStream(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(
              child: CircularProgressIndicator(color: _accentColor),
            );
          }

          if (snapshot.hasError) {
            return _buildError(context);
          }

          final anuncios = snapshot.data ?? [];

          if (anuncios.isEmpty) {
            return _buildEmpty(context);
          }

          return ListView.separated(
            padding: const EdgeInsets.fromLTRB(16, 20, 16, 32),
            itemCount: anuncios.length,
            separatorBuilder: (_, __) => const SizedBox(height: 16),
            itemBuilder: (context, index) =>
                _buildAnuncioCard(context, anuncios[index]),
          );
        },
      ),
    );
  }

  Widget _buildAnuncioCard(BuildContext context, Anuncio anuncio) {
    final fechaStr = DateFormat('d MMM yyyy', 'es').format(anuncio.fecha);

    return Container(
      decoration: BoxDecoration(
        color: _surfaceColor,
        borderRadius: BorderRadius.circular(12),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (anuncio.imagenUrl != null && anuncio.imagenUrl!.isNotEmpty)
            CachedNetworkImage(
              imageUrl: anuncio.imagenUrl!,
              height: 180,
              fit: BoxFit.cover,
              placeholder: (_, __) => Container(
                height: 180,
                color: const Color(0xFF1E2E4A),
                child: const Center(
                  child: CircularProgressIndicator(
                    color: _accentColor,
                    strokeWidth: 2,
                  ),
                ),
              ),
              errorWidget: (_, __, ___) => Container(
                height: 180,
                color: const Color(0xFF1E2E4A),
                child: const Icon(Icons.image_not_supported_outlined,
                    color: Colors.white38, size: 40),
              ),
            ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  anuncio.titulo,
                  style: FlutterFlowTheme.of(context).titleMedium.override(
                        fontFamily:
                            FlutterFlowTheme.of(context).titleMediumFamily,
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0.0,
                        useGoogleFonts: !FlutterFlowTheme.of(context)
                            .titleMediumIsCustom,
                      ),
                ),
                const SizedBox(height: 8),
                Text(
                  anuncio.descripcion,
                  style: FlutterFlowTheme.of(context).bodyMedium.override(
                        fontFamily:
                            FlutterFlowTheme.of(context).bodyMediumFamily,
                        color: const Color(0xFFB5B5B5),
                        fontSize: 14,
                        letterSpacing: 0.0,
                        lineHeight: 1.5,
                        useGoogleFonts: !FlutterFlowTheme.of(context)
                            .bodyMediumIsCustom,
                      ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    const Icon(Icons.calendar_today_outlined,
                        color: _accentColor, size: 14),
                    const SizedBox(width: 6),
                    Text(
                      fechaStr,
                      style: FlutterFlowTheme.of(context).labelSmall.override(
                            fontFamily:
                                FlutterFlowTheme.of(context).labelSmallFamily,
                            color: _accentColor,
                            fontSize: 12,
                            letterSpacing: 0.0,
                            useGoogleFonts: !FlutterFlowTheme.of(context)
                                .labelSmallIsCustom,
                          ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmpty(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.campaign_outlined, color: Colors.white24, size: 64),
          const SizedBox(height: 16),
          Text(
            'No hay anuncios por ahora',
            style: FlutterFlowTheme.of(context).bodyLarge.override(
                  fontFamily: FlutterFlowTheme.of(context).bodyLargeFamily,
                  color: Colors.white38,
                  letterSpacing: 0.0,
                  useGoogleFonts:
                      !FlutterFlowTheme.of(context).bodyLargeIsCustom,
                ),
          ),
        ],
      ),
    );
  }

  Widget _buildError(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.wifi_off_rounded, color: Colors.white24, size: 64),
            const SizedBox(height: 16),
            Text(
              'No se pudieron cargar los anuncios.\nVerificá tu conexión.',
              textAlign: TextAlign.center,
              style: FlutterFlowTheme.of(context).bodyLarge.override(
                    fontFamily: FlutterFlowTheme.of(context).bodyLargeFamily,
                    color: Colors.white38,
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
}
