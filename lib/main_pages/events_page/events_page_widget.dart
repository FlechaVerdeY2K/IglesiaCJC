import 'package:cached_network_image/cached_network_image.dart';
import 'package:intl/intl.dart';
import '/backend/auth_service.dart';
import '/backend/supabase_service.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:flutter/material.dart';
import 'events_page_model.dart';
export 'events_page_model.dart';

class EventsPageWidget extends StatefulWidget {
  const EventsPageWidget({super.key});

  static String routeName = 'eventsPage';
  static String routePath = '/eventsPage';

  @override
  State<EventsPageWidget> createState() => _EventsPageWidgetState();
}

class _EventsPageWidgetState extends State<EventsPageWidget> {
  static const Color _bg      = Color(0xFF080E1E);
  static const Color _surface = Color(0xFF0F1C30);
  static const Color _accent  = Color(0xFFBF1E2E);
  static const Color _border  = Color(0xFF1E2E4A);

  late EventsPageModel _model;
  final scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => EventsPageModel());
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
        automaticallyImplyLeading: false,
        elevation: 0,
        centerTitle: true,
        toolbarHeight: 56,
        title: Text(
          'Calendario CJC',
          style: FlutterFlowTheme.of(context).titleLarge.override(
                fontFamily: FlutterFlowTheme.of(context).titleLargeFamily,
                color: Colors.white,
                fontSize: 18.0,
                fontWeight: FontWeight.w700,
                letterSpacing: 0.0,
                useGoogleFonts: !FlutterFlowTheme.of(context).titleLargeIsCustom,
              ),
        ),
      ),
      body: StreamBuilder<List<Evento>>(
        stream: SupabaseService.instance.eventosStream(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator(color: _accent));
          }
          final eventos = (snapshot.data ?? []).where((e) => e.activo).toList();
          if (eventos.isEmpty) {
            return _buildEmpty();
          }
          return ListView.builder(
            padding: const EdgeInsets.fromLTRB(20, 24, 20, 40),
            itemCount: eventos.length,
            itemBuilder: (context, i) => _EventoCard(
              evento: eventos[i],
              onRegistrar: () => _showRegistroDialog(context, eventos[i]),
            ),
          );
        },
      ),
    );
  }

  Widget _buildEmpty() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: const [
            Icon(Icons.event_busy_rounded, color: Colors.white24, size: 72),
            SizedBox(height: 16),
            Text(
              'No hay eventos\npróximos por ahora',
              textAlign: TextAlign.center,
              style: TextStyle(
                  color: Color(0xFFB5B5B5), fontSize: 16, height: 1.5),
            ),
            SizedBox(height: 8),
            Text(
              'Volvé a revisar pronto',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.white38, fontSize: 13),
            ),
          ],
        ),
      ),
    );
  }

  void _showRegistroDialog(BuildContext context, Evento evento) {
    final user = AuthService.instance.currentUser;
    if (user == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Iniciá sesión para registrarte'),
          backgroundColor: _surface,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
      );
      return;
    }

    final nombreCtrl = TextEditingController(
      text: user.userMetadata?['full_name'] as String? ?? '',
    );
    final telefonoCtrl = TextEditingController();
    bool saving = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF111D2E),
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(ctx).viewInsets.bottom,
            left: 20, right: 20, top: 24,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Registrarme: ${evento.titulo}',
                style: const TextStyle(
                    color: Colors.white,
                    fontSize: 17,
                    fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 4),
              Text(
                DateFormat('EEEE d \'de\' MMMM, h:mm a', 'es').format(evento.fecha),
                style: const TextStyle(color: Color(0xFFB5B5B5), fontSize: 13),
              ),
              const SizedBox(height: 20),
              _formField(ctx, 'Nombre completo *', nombreCtrl),
              const SizedBox(height: 12),
              _formField(ctx, 'Teléfono (opcional)', telefonoCtrl,
                  keyboardType: TextInputType.phone),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _accent,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10)),
                  ),
                  onPressed: saving
                      ? null
                      : () async {
                          if (nombreCtrl.text.trim().isEmpty) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                  content: Text('El nombre es requerido'),
                                  backgroundColor: Colors.redAccent),
                            );
                            return;
                          }
                          setModalState(() => saving = true);
                          try {
                            await SupabaseService.instance.registrarEvento({
                              'evento_id': evento.id,
                              'evento_titulo': evento.titulo,
                              'user_id': user.id,
                              'nombre': nombreCtrl.text.trim(),
                              'email': user.email ?? '',
                              'telefono': telefonoCtrl.text.trim(),
                            });
                            if (ctx.mounted) {
                              Navigator.pop(ctx);
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: const Text('¡Registro exitoso!'),
                                  backgroundColor: const Color(0xFF1A4731),
                                  behavior: SnackBarBehavior.floating,
                                  shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(10)),
                                ),
                              );
                            }
                          } catch (e) {
                            setModalState(() => saving = false);
                            if (ctx.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                    content: Text('Error: $e'),
                                    backgroundColor: Colors.redAccent),
                              );
                            }
                          }
                        },
                  child: saving
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                              strokeWidth: 2, color: Colors.white))
                      : const Text('Confirmar registro',
                          style: TextStyle(fontWeight: FontWeight.w700)),
                ),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _formField(
    BuildContext context,
    String label,
    TextEditingController ctrl, {
    TextInputType keyboardType = TextInputType.text,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label,
            style: const TextStyle(color: Color(0xFFB5B5B5), fontSize: 12)),
        const SizedBox(height: 6),
        TextField(
          controller: ctrl,
          keyboardType: keyboardType,
          style: const TextStyle(color: Colors.white),
          decoration: InputDecoration(
            filled: true,
            fillColor: _border,
            border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: BorderSide.none),
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          ),
        ),
      ],
    );
  }
}

class _EventoCard extends StatelessWidget {
  final Evento evento;
  final VoidCallback onRegistrar;

  static const Color _surface = Color(0xFF0F1C30);
  static const Color _accent  = Color(0xFFBF1E2E);
  static const Color _border  = Color(0xFF1E2E4A);

  const _EventoCard({required this.evento, required this.onRegistrar});

  @override
  Widget build(BuildContext context) {
    final mesLabel = DateFormat('MMM', 'es').format(evento.fecha).toUpperCase();
    final diaLabel = DateFormat('d').format(evento.fecha);
    final horaLabel = DateFormat('h:mm a', 'es').format(evento.fecha);

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: _surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: _border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Imagen si existe
          if (evento.imageUrl != null && evento.imageUrl!.isNotEmpty)
            ClipRRect(
              borderRadius:
                  const BorderRadius.vertical(top: Radius.circular(16)),
              child: CachedNetworkImage(
                imageUrl: evento.imageUrl!,
                height: 160,
                fit: BoxFit.cover,
                errorWidget: (_, __, ___) => const SizedBox.shrink(),
              ),
            ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Badge fecha
                Container(
                  width: 52,
                  padding: const EdgeInsets.symmetric(vertical: 10),
                  decoration: BoxDecoration(
                    color: _accent.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: _accent.withOpacity(0.3)),
                  ),
                  child: Column(
                    children: [
                      Text(mesLabel,
                          style: const TextStyle(
                              color: _accent,
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 0.5)),
                      Text(diaLabel,
                          style: const TextStyle(
                              color: Colors.white,
                              fontSize: 22,
                              fontWeight: FontWeight.w800)),
                    ],
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(evento.titulo,
                          style: const TextStyle(
                              color: Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.w700)),
                      const SizedBox(height: 4),
                      Text(evento.descripcion,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                              color: Color(0xFFB5B5B5), fontSize: 13, height: 1.4)),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          const Icon(Icons.access_time_rounded,
                              color: Color(0xFF7A8FA8), size: 13),
                          const SizedBox(width: 4),
                          Text(horaLabel,
                              style: const TextStyle(
                                  color: Color(0xFF7A8FA8), fontSize: 12)),
                          if (evento.lugar != null && evento.lugar!.isNotEmpty) ...[
                            const SizedBox(width: 12),
                            const Icon(Icons.place_rounded,
                                color: _accent, size: 13),
                            const SizedBox(width: 3),
                            Expanded(
                              child: Text(evento.lugar!,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(
                                      color: _accent, fontSize: 12)),
                            ),
                          ],
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          // Botón registro
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            child: FilledButton.icon(
              onPressed: onRegistrar,
              icon: const Icon(Icons.how_to_reg_rounded, size: 18),
              label: const Text('Registrarme',
                  style: TextStyle(fontWeight: FontWeight.w600)),
              style: FilledButton.styleFrom(
                backgroundColor: _accent,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 12),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10)),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
