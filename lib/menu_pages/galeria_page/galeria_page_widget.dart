import 'package:cached_network_image/cached_network_image.dart';
import 'package:photo_view/photo_view.dart';
import 'package:photo_view/photo_view_gallery.dart';
import '/backend/supabase_service.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:flutter/material.dart';
import 'galeria_page_model.dart';
export 'galeria_page_model.dart';

class GaleriaPageWidget extends StatefulWidget {
  const GaleriaPageWidget({super.key});

  static String routeName = 'galeriaPage';
  static String routePath = '/galeriaPage';

  @override
  State<GaleriaPageWidget> createState() => _GaleriaPageWidgetState();
}

class _GaleriaPageWidgetState extends State<GaleriaPageWidget> {
  static const Color _bg = Color(0xFF080E1E);
  static const Color _accent = Color(0xFFBF1E2E);

  late GaleriaPageModel _model;
  final scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => GaleriaPageModel());
    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  @override
  void dispose() {
    _model.dispose();
    super.dispose();
  }

  void _openPhoto(BuildContext context, List<FotoGaleria> fotos, int index) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => _GaleriaViewer(fotos: fotos, initialIndex: index),
      ),
    );
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
          'Galería',
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
      body: StreamBuilder<List<FotoGaleria>>(
        stream: SupabaseService.instance.galeriaStream(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(
                child: CircularProgressIndicator(color: _accent));
          }
          final fotos = snapshot.data ?? [];
          if (fotos.isEmpty) {
            return const Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.photo_library_rounded,
                      color: Colors.white24, size: 72),
                  SizedBox(height: 16),
                  Text('Las fotos llegarán pronto',
                      style:
                          TextStyle(color: Color(0xFFB5B5B5), fontSize: 16)),
                ],
              ),
            );
          }
          return GridView.builder(
            padding: const EdgeInsets.all(4),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              crossAxisSpacing: 3,
              mainAxisSpacing: 3,
            ),
            itemCount: fotos.length,
            itemBuilder: (context, i) {
              final foto = fotos[i];
              return GestureDetector(
                onTap: () => _openPhoto(context, fotos, i),
                child: CachedNetworkImage(
                  imageUrl: foto.imageUrl,
                  fit: BoxFit.cover,
                  errorWidget: (_, __, ___) => Container(
                    color: const Color(0xFF0D1628),
                    child: const Icon(Icons.broken_image_rounded,
                        color: Colors.white24),
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}

class _GaleriaViewer extends StatelessWidget {
  final List<FotoGaleria> fotos;
  final int initialIndex;

  const _GaleriaViewer(
      {required this.fotos, required this.initialIndex});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: PhotoViewGallery.builder(
        itemCount: fotos.length,
        pageController: PageController(initialPage: initialIndex),
        builder: (context, index) => PhotoViewGalleryPageOptions(
          imageProvider:
              CachedNetworkImageProvider(fotos[index].imageUrl),
          minScale: PhotoViewComputedScale.contained,
          maxScale: PhotoViewComputedScale.covered * 2,
        ),
        backgroundDecoration: const BoxDecoration(color: Colors.black),
      ),
    );
  }
}
