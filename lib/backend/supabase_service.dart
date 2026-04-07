import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'web_notif_web.dart' if (dart.library.io) 'web_notif_stub.dart';

// ─── Extensión de compatibilidad con Firebase User API ──────────────────────
// Agrega `uid`, `displayName` y `photoURL` al objeto User de Supabase
// para que los widgets existentes no necesiten cambiar sus accesos.
extension SupabaseUserExt on User {
  String get uid => id;
  String? get displayName =>
      userMetadata?['full_name'] as String? ??
      userMetadata?['nombre'] as String?;
  String? get photoURL => userMetadata?['avatar_url'] as String?;
}

// ─── Modelos ──────────────────────────────────────────────────────────────────

class HomeConfig {
  final String bienvenidaTitulo;
  final String bienvenidaTexto;
  final String serviciosTexto;
  final String telefono;
  final String wazeUrl;
  final String youtubeUrl;
  final String instagramUrl;
  final String facebookUrl;
  final String heroImageUrl;
  final String serviciosImageUrl;

  const HomeConfig({
    required this.bienvenidaTitulo,
    required this.bienvenidaTexto,
    required this.serviciosTexto,
    required this.telefono,
    required this.wazeUrl,
    required this.youtubeUrl,
    required this.instagramUrl,
    required this.facebookUrl,
    this.heroImageUrl = '',
    this.serviciosImageUrl = '',
  });

  static HomeConfig get defaults => const HomeConfig(
        bienvenidaTitulo: 'Bienvenidos a Iglesia CJC',
        bienvenidaTexto:
            'Somos una iglesia que cree que todo comienza en Dios y que la vida se vive mejor en familia. Somos una comunidad que camina junta, creciendo en fe, amor y propósito, poniendo a Cristo en el centro de todo lo que somos y hacemos.\n\nEn CJC no creemos en una fe aislada, sino en una fe que se vive y se camina. Caminamos juntos en procesos reales, con personas reales, aprendiendo cada día a seguir a Jesús con honestidad, gracia y compromiso.\n\nSomos una iglesia que adora con el corazón, sirve con alegría y vive su fe cada día. Aquí celebramos la vida, fortalecemos la familia y nos comprometemos a impactar nuestra comunidad con el amor de Dios.\n\nCJC no es solo un lugar al que asistes; es una familia a la que perteneces.\n\nSomos CJC. Somos familia. Una familia que camina en adoración y servicio a Dios.',
        serviciosTexto:
            'Domingos 10 am\nServicio online Youtube\nPastoral infantil en simultaneo\n\nEventos personalizados para\nJovenes\nMujeres\nMatrimonios',
        telefono: 'tel:+50670939483',
        wazeUrl: '',
        youtubeUrl: 'https://youtube.com/@iglesiacjc217',
        instagramUrl: 'https://www.instagram.com/iglesiacjc',
        facebookUrl: 'https://www.facebook.com/share/1D6LhUGwoz/',
      );

  factory HomeConfig.fromMap(Map<String, dynamic> d) => HomeConfig(
        bienvenidaTitulo: d['bienvenida_titulo'] as String? ??
            HomeConfig.defaults.bienvenidaTitulo,
        bienvenidaTexto:
            d['bienvenida_texto'] as String? ?? HomeConfig.defaults.bienvenidaTexto,
        serviciosTexto:
            d['servicios_texto'] as String? ?? HomeConfig.defaults.serviciosTexto,
        telefono: d['telefono'] as String? ?? HomeConfig.defaults.telefono,
        wazeUrl: d['waze_url'] as String? ?? HomeConfig.defaults.wazeUrl,
        youtubeUrl: d['youtube_url'] as String? ?? HomeConfig.defaults.youtubeUrl,
        instagramUrl:
            d['instagram_url'] as String? ?? HomeConfig.defaults.instagramUrl,
        facebookUrl:
            d['facebook_url'] as String? ?? HomeConfig.defaults.facebookUrl,
        heroImageUrl: d['hero_image_url'] as String? ?? '',
        serviciosImageUrl: d['servicios_image_url'] as String? ?? '',
      );
}

class LiveConfig {
  final String videoId;
  final String titulo;
  final String descripcion;
  final bool activo;

  const LiveConfig({
    required this.videoId,
    required this.titulo,
    required this.descripcion,
    required this.activo,
  });

  factory LiveConfig.fromMap(Map<String, dynamic> d) => LiveConfig(
        videoId: d['video_id'] as String? ?? '',
        titulo: d['titulo'] as String? ?? '',
        descripcion: d['descripcion'] as String? ?? '',
        activo: d['activo'] as bool? ?? false,
      );
}

class Sermon {
  final String id;
  final String titulo;
  final String descripcion;
  final String videoId;
  final DateTime fecha;
  final String predicador;
  final bool activo;

  const Sermon({
    required this.id,
    required this.titulo,
    required this.descripcion,
    required this.videoId,
    required this.fecha,
    required this.predicador,
    required this.activo,
  });

  factory Sermon.fromMap(Map<String, dynamic> d) => Sermon(
        id: d['id'] as String? ?? '',
        titulo: d['titulo'] as String? ?? '',
        descripcion: d['descripcion'] as String? ?? '',
        videoId: d['video_id'] as String? ?? '',
        fecha: d['fecha'] != null
            ? DateTime.parse(d['fecha'] as String)
            : DateTime.now(),
        predicador: d['predicador'] as String? ?? '',
        activo: d['activo'] as bool? ?? true,
      );
}

class Devocional {
  final String id;
  final String titulo;
  final String versiculo;
  final String referencia;
  final String reflexion;
  final DateTime fecha;

  const Devocional({
    required this.id,
    required this.titulo,
    required this.versiculo,
    required this.referencia,
    required this.reflexion,
    required this.fecha,
  });

  factory Devocional.fromMap(Map<String, dynamic> d) => Devocional(
        id: d['id'] as String? ?? '',
        titulo: d['titulo'] as String? ?? '',
        versiculo: d['versiculo'] as String? ?? '',
        referencia: d['referencia'] as String? ?? '',
        reflexion: d['reflexion'] as String? ?? '',
        fecha: d['fecha'] != null
            ? DateTime.parse(d['fecha'] as String)
            : DateTime.now(),
      );
}

class Oracion {
  final String id;
  final String nombre;
  final String peticion;
  final bool anonima;
  final DateTime fecha;
  final String estado;
  final int orantes;
  final List<String> orantesUids;
  final String autorUid;

  const Oracion({
    required this.id,
    required this.nombre,
    required this.peticion,
    required this.anonima,
    required this.fecha,
    this.estado = 'pendiente',
    this.orantes = 0,
    this.orantesUids = const [],
    this.autorUid = '',
  });

  factory Oracion.fromMap(Map<String, dynamic> d) => Oracion(
        id: d['id'] as String? ?? '',
        nombre: d['anonima'] == true ? 'Anónimo' : (d['nombre'] as String? ?? ''),
        peticion: d['peticion'] as String? ?? '',
        anonima: d['anonima'] as bool? ?? false,
        fecha: d['fecha'] != null
            ? DateTime.parse(d['fecha'] as String)
            : DateTime.now(),
        estado: d['estado'] as String? ?? 'pendiente',
        orantes: (d['orantes'] as num?)?.toInt() ?? 0,
        orantesUids: List<String>.from(d['orantes_uids'] as List? ?? []),
        autorUid: d['autor_uid'] as String? ?? '',
      );
}

class FotoGaleria {
  final String id;
  final String imageUrl;
  final String titulo;
  final String descripcion;
  final DateTime fecha;
  final String categoria;

  const FotoGaleria({
    required this.id,
    required this.imageUrl,
    required this.titulo,
    required this.descripcion,
    required this.fecha,
    required this.categoria,
  });

  factory FotoGaleria.fromMap(Map<String, dynamic> d) => FotoGaleria(
        id: d['id'] as String? ?? '',
        imageUrl: d['image_url'] as String? ?? '',
        titulo: d['titulo'] as String? ?? '',
        descripcion: d['descripcion'] as String? ?? '',
        fecha: d['fecha'] != null
            ? DateTime.parse(d['fecha'] as String)
            : DateTime.now(),
        categoria: d['categoria'] as String? ?? 'general',
      );
}

class Recurso {
  final String id;
  final String titulo;
  final String descripcion;
  final String url;
  final String tipo;
  final DateTime fecha;

  const Recurso({
    required this.id,
    required this.titulo,
    required this.descripcion,
    required this.url,
    required this.tipo,
    required this.fecha,
  });

  factory Recurso.fromMap(Map<String, dynamic> d) => Recurso(
        id: d['id'] as String? ?? '',
        titulo: d['titulo'] as String? ?? '',
        descripcion: d['descripcion'] as String? ?? '',
        url: d['url'] as String? ?? '',
        tipo: d['tipo'] as String? ?? 'pdf',
        fecha: d['fecha'] != null
            ? DateTime.parse(d['fecha'] as String)
            : DateTime.now(),
      );
}

class Pastor {
  final String id;
  final String nombre;
  final String cargo;
  final String bio;
  final String? fotoUrl;
  final int orden;

  const Pastor({
    required this.id,
    required this.nombre,
    required this.cargo,
    required this.bio,
    this.fotoUrl,
    required this.orden,
  });

  factory Pastor.fromMap(Map<String, dynamic> d) => Pastor(
        id: d['id'] as String? ?? '',
        nombre: d['nombre'] as String? ?? '',
        cargo: d['cargo'] as String? ?? '',
        bio: d['bio'] as String? ?? '',
        fotoUrl: d['foto_url'] as String?,
        orden: (d['orden'] as num?)?.toInt() ?? 0,
      );
}

class Equipo {
  final String id;
  final String nombre;
  final String descripcion;
  final String lider;
  final String? iconName;
  final int orden;

  const Equipo({
    required this.id,
    required this.nombre,
    required this.descripcion,
    required this.lider,
    this.iconName,
    required this.orden,
  });

  factory Equipo.fromMap(Map<String, dynamic> d) => Equipo(
        id: d['id'] as String? ?? '',
        nombre: d['nombre'] as String? ?? '',
        descripcion: d['descripcion'] as String? ?? '',
        lider: d['lider'] as String? ?? '',
        iconName: d['icon_name'] as String?,
        orden: (d['orden'] as num?)?.toInt() ?? 0,
      );
}

class Evento {
  final String id;
  final String titulo;
  final String descripcion;
  final DateTime fecha;
  final String? lugar;
  final String? imageUrl;
  final bool activo;

  const Evento({
    required this.id,
    required this.titulo,
    required this.descripcion,
    required this.fecha,
    this.lugar,
    this.imageUrl,
    required this.activo,
  });

  factory Evento.fromMap(Map<String, dynamic> d) => Evento(
        id: d['id'] as String? ?? '',
        titulo: d['titulo'] as String? ?? '',
        descripcion: d['descripcion'] as String? ?? '',
        fecha: d['fecha'] != null
            ? DateTime.parse(d['fecha'] as String)
            : DateTime.now(),
        lugar: d['lugar'] as String?,
        imageUrl: d['image_url'] as String?,
        activo: d['activo'] as bool? ?? true,
      );
}

class Anuncio {
  final String id;
  final String titulo;
  final String descripcion;
  final String? imagenUrl;
  final DateTime fecha;
  final bool activo;

  const Anuncio({
    required this.id,
    required this.titulo,
    required this.descripcion,
    this.imagenUrl,
    required this.fecha,
    required this.activo,
  });

  factory Anuncio.fromMap(Map<String, dynamic> d) => Anuncio(
        id: d['id'] as String? ?? '',
        titulo: d['titulo'] as String? ?? '',
        descripcion: d['descripcion'] as String? ?? '',
        imagenUrl: d['imagen_url'] as String?,
        fecha: d['fecha'] != null
            ? DateTime.parse(d['fecha'] as String)
            : DateTime.now(),
        activo: d['activo'] as bool? ?? true,
      );
}

// ─── Servicio Supabase ────────────────────────────────────────────────────────

class SupabaseService {
  SupabaseService._();
  static final SupabaseService instance = SupabaseService._();

  SupabaseClient get _db => Supabase.instance.client;

  final _localNotifications = FlutterLocalNotificationsPlugin();

  static const AndroidNotificationChannel _channel = AndroidNotificationChannel(
    'cjc_anuncios',
    'Anuncios CJC',
    description: 'Notificaciones de anuncios de la iglesia.',
    importance: Importance.high,
  );

  // ── Inicialización ──────────────────────────────────────────────────────────

  Future<void> initialize() async {
    if (kIsWeb) {
      await requestWebNotifPermission();
    } else {
      await _initLocalNotifications();
    }
    _initRealtimeNotifications();
  }

  Future<void> _initLocalNotifications() async {
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: false,
      requestBadgePermission: false,
      requestSoundPermission: false,
    );
    const settings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );
    await _localNotifications.initialize(settings);

    await _localNotifications
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(_channel);
  }

  /// Escucha inserciones en la tabla `anuncios` via Supabase Realtime y
  /// muestra una notificación local cuando la app está en primer plano.
  void _initRealtimeNotifications() {
    _db
        .channel('cjc-anuncios-channel')
        .onPostgresChanges(
          event: PostgresChangeEvent.insert,
          schema: 'public',
          table: 'anuncios',
          callback: (payload) {
            final titulo =
                payload.newRecord['titulo'] as String? ?? 'Nuevo anuncio';
            final descripcion =
                payload.newRecord['descripcion'] as String? ?? '';
            _showLocalNotification(titulo, descripcion);
          },
        )
        .subscribe();

    // Notificar cuando se publica un nuevo devocional
    _db
        .channel('cjc-devocionales-channel')
        .onPostgresChanges(
          event: PostgresChangeEvent.insert,
          schema: 'public',
          table: 'devocionales',
          callback: (payload) {
            final titulo = payload.newRecord['titulo'] as String? ?? 'Devocional del día';
            _showLocalNotification(
              '📖 Devocional del día',
              titulo.isNotEmpty ? titulo : 'El devocional de hoy ya está disponible',
            );
          },
        )
        .subscribe();
  }

  void _showLocalNotification(String title, String body) {
    if (kIsWeb) {
      showWebNotif(title, body);
      return;
    }
    _localNotifications.show(
      title.hashCode,
      title,
      body,
      NotificationDetails(
        android: AndroidNotificationDetails(
          _channel.id,
          _channel.name,
          channelDescription: _channel.description,
          importance: Importance.high,
          priority: Priority.high,
        ),
      ),
    );
  }

  // ── Anuncios ────────────────────────────────────────────────────────────────

  Stream<List<Anuncio>> anunciosStream() {
    return _db
        .from('anuncios')
        .stream(primaryKey: ['id'])
        .eq('activo', true)
        .order('fecha', ascending: false)
        .map((rows) => rows.map(Anuncio.fromMap).toList());
  }

  // ── Home Config ─────────────────────────────────────────────────────────────

  Future<HomeConfig> getHomeConfig() async {
    try {
      final data =
          await _db.from('config_home').select().eq('id', 1).maybeSingle();
      if (data == null) return HomeConfig.defaults;
      return HomeConfig.fromMap(data);
    } catch (_) {
      return HomeConfig.defaults;
    }
  }

  Stream<HomeConfig> homeConfigStream() {
    return _db
        .from('config_home')
        .stream(primaryKey: ['id'])
        .map((rows) => rows.isNotEmpty
            ? HomeConfig.fromMap(rows.first)
            : HomeConfig.defaults)
        .handleError((_) => HomeConfig.defaults);
  }

  Future<void> saveHomeConfig(HomeConfig config) async {
    await _db.from('config_home').upsert({
      'id': 1,
      'bienvenida_titulo': config.bienvenidaTitulo,
      'bienvenida_texto': config.bienvenidaTexto,
      'servicios_texto': config.serviciosTexto,
      'telefono': config.telefono,
      'waze_url': config.wazeUrl,
      'youtube_url': config.youtubeUrl,
      'instagram_url': config.instagramUrl,
      'facebook_url': config.facebookUrl,
    });
    // Imágenes en llamada separada — silenciosa si las columnas no existen aún
    await saveHomeImages(
      heroImageUrl: config.heroImageUrl,
      serviciosImageUrl: config.serviciosImageUrl,
    );
  }

  Future<void> saveHomeImages({
    required String heroImageUrl,
    required String serviciosImageUrl,
  }) async {
    try {
      await _db.from('config_home').update({
        'hero_image_url': heroImageUrl,
        'servicios_image_url': serviciosImageUrl,
      }).eq('id', 1);
    } catch (_) {
      // Las columnas aún no existen en la BD — ignorar hasta migración
    }
  }

  // ── Live Config ─────────────────────────────────────────────────────────────

  Future<LiveConfig?> getLiveConfig() async {
    try {
      final data =
          await _db.from('config_live').select().eq('id', 1).maybeSingle();
      if (data == null) return null;
      return LiveConfig.fromMap(data);
    } catch (_) {
      return null;
    }
  }

  Stream<LiveConfig?> liveConfigStream() {
    return _db.from('config_live').stream(primaryKey: ['id']).map(
        (rows) => rows.isNotEmpty ? LiveConfig.fromMap(rows.first) : null);
  }

  Future<void> saveLiveConfig({
    required String videoId,
    required String titulo,
    required String descripcion,
    required bool activo,
  }) async {
    await _db.from('config_live').upsert({
      'id': 1,
      'video_id': videoId.trim(),
      'titulo': titulo.trim(),
      'descripcion': descripcion.trim(),
      'activo': activo,
    });
  }

  // ── Sermones ────────────────────────────────────────────────────────────────

  Stream<List<Sermon>> sermonesStream() {
    return _db
        .from('sermones')
        .stream(primaryKey: ['id'])
        .order('fecha', ascending: false)
        .map((rows) {
      final list = rows.map(Sermon.fromMap).toList();
      list.removeWhere((s) => !s.activo);
      return list;
    });
  }

  // ── Devocional diario ───────────────────────────────────────────────────────

  Future<Devocional?> getDevocionalHoy() async {
    try {
      final hoy = DateTime.now();
      final inicio = DateTime(hoy.year, hoy.month, hoy.day).toIso8601String();
      final fin = DateTime(hoy.year, hoy.month, hoy.day + 1).toIso8601String();
      var rows = await _db
          .from('devocionales')
          .select()
          .gte('fecha', inicio)
          .lt('fecha', fin)
          .limit(1);
      if ((rows as List).isNotEmpty) return Devocional.fromMap(rows.first);
      // Fallback: más reciente
      final fallback = await _db
          .from('devocionales')
          .select()
          .order('fecha', ascending: false)
          .limit(1);
      if ((fallback as List).isEmpty) return null;
      return Devocional.fromMap(fallback.first);
    } catch (_) {
      return null;
    }
  }

  Stream<List<Devocional>> devoccionalesStream() {
    return _db
        .from('devocionales')
        .stream(primaryKey: ['id'])
        .order('fecha', ascending: false)
        .limit(30)
        .map((rows) => rows.map(Devocional.fromMap).toList());
  }

  Future<void> crearDevocional({
    required String titulo,
    required String versiculo,
    required String referencia,
    required String reflexion,
    required DateTime fecha,
  }) async {
    await _db.from('devocionales').insert({
      'titulo': titulo.trim(),
      'versiculo': versiculo.trim(),
      'referencia': referencia.trim(),
      'reflexion': reflexion.trim(),
      'fecha': fecha.toIso8601String(),
    });
  }

  Future<void> actualizarDevocional(
    String id, {
    required String titulo,
    required String versiculo,
    required String referencia,
    required String reflexion,
    required DateTime fecha,
  }) async {
    await _db.from('devocionales').update({
      'titulo': titulo.trim(),
      'versiculo': versiculo.trim(),
      'referencia': referencia.trim(),
      'reflexion': reflexion.trim(),
      'fecha': fecha.toIso8601String(),
    }).eq('id', id);
  }

  Future<void> eliminarDevocional(String id) async =>
      _db.from('devocionales').delete().eq('id', id);

  // ── Oración ─────────────────────────────────────────────────────────────────

  Stream<List<Oracion>> oracionesPublicasStream() {
    return _db
        .from('oraciones')
        .stream(primaryKey: ['id'])
        .eq('estado', 'aprobada')
        .order('fecha', ascending: false)
        .limit(50)
        .map((rows) => rows.map(Oracion.fromMap).toList());
  }

  Stream<List<Oracion>> oracionesPendientesStream() {
    return _db
        .from('oraciones')
        .stream(primaryKey: ['id'])
        .eq('estado', 'pendiente')
        .order('fecha', ascending: false)
        .map((rows) => rows.map(Oracion.fromMap).toList());
  }

  Future<void> crearOracion({
    required String nombre,
    required String peticion,
    required bool anonima,
  }) async {
    await _db.from('oraciones').insert({
      'nombre': anonima ? 'Anónimo' : nombre,
      'peticion': peticion,
      'anonima': anonima,
      'fecha': DateTime.now().toIso8601String(),
      'estado': 'pendiente',
      'autor_uid': currentUser?.id ?? '',
      'orantes': 0,
      'orantes_uids': <String>[],
    });
  }

  Stream<List<Oracion>> misOracionesStream(String uid) {
    return _db
        .from('oraciones')
        .stream(primaryKey: ['id'])
        .eq('autor_uid', uid)
        .order('fecha', ascending: false)
        .map((rows) {
      final list = rows.map(Oracion.fromMap).toList();
      list.removeWhere((o) => o.estado != 'aprobada');
      return list;
    });
  }

  Future<void> orarPor(String oracionId, String uid) async {
    final data = await _db
        .from('oraciones')
        .select('orantes, orantes_uids')
        .eq('id', oracionId)
        .single();
    final orantes = (data['orantes'] as num? ?? 0).toInt() + 1;
    final orantesUids = List<String>.from(data['orantes_uids'] as List? ?? []);
    if (!orantesUids.contains(uid)) orantesUids.add(uid);
    await _db.from('oraciones').update({
      'orantes': orantes,
      'orantes_uids': orantesUids,
    }).eq('id', oracionId);
  }

  Future<void> aprobarOracion(String id) async =>
      _db.from('oraciones').update({'estado': 'aprobada'}).eq('id', id);

  Future<void> rechazarOracion(String id) async =>
      _db.from('oraciones').update({'estado': 'rechazada'}).eq('id', id);

  // ── Galería ─────────────────────────────────────────────────────────────────

  Stream<List<FotoGaleria>> galeriaStream({String? categoria}) {
    if (categoria != null && categoria != 'todos') {
      return _db
          .from('galeria')
          .stream(primaryKey: ['id'])
          .eq('categoria', categoria)
          .order('fecha', ascending: false)
          .map((rows) => rows.map(FotoGaleria.fromMap).toList());
    }
    return _db
        .from('galeria')
        .stream(primaryKey: ['id'])
        .order('fecha', ascending: false)
        .map((rows) => rows.map(FotoGaleria.fromMap).toList());
  }

  // ── Recursos ────────────────────────────────────────────────────────────────

  Stream<List<Recurso>> recursosStream({String? tipo}) {
    if (tipo != null && tipo != 'todos') {
      return _db
          .from('recursos')
          .stream(primaryKey: ['id'])
          .eq('tipo', tipo)
          .order('fecha', ascending: false)
          .map((rows) => rows.map(Recurso.fromMap).toList());
    }
    return _db
        .from('recursos')
        .stream(primaryKey: ['id'])
        .order('fecha', ascending: false)
        .map((rows) => rows.map(Recurso.fromMap).toList());
  }

  // ── Pastores ────────────────────────────────────────────────────────────────

  Stream<List<Pastor>> pastoresStream() {
    return _db
        .from('pastores')
        .stream(primaryKey: ['id'])
        .order('orden')
        .map((rows) => rows.map(Pastor.fromMap).toList());
  }

  // ── Equipos ─────────────────────────────────────────────────────────────────

  Stream<List<Equipo>> equiposStream() {
    return _db
        .from('equipos')
        .stream(primaryKey: ['id'])
        .order('orden')
        .map((rows) => rows.map(Equipo.fromMap).toList());
  }

  // ── Eventos ─────────────────────────────────────────────────────────────────

  Stream<List<Evento>> eventosStream() {
    final ahora = DateTime.now();
    final inicioHoy = DateTime(ahora.year, ahora.month, ahora.day);
    return _db
        .from('eventos')
        .stream(primaryKey: ['id'])
        .eq('activo', true)
        .order('fecha')
        .map((rows) {
      final list = rows.map(Evento.fromMap).toList();
      list.removeWhere((e) => e.fecha.isBefore(inicioHoy));
      return list;
    });
  }

  // ── GPS ──────────────────────────────────────────────────────────────────────

  Future<void> registrarGPS(Map<String, dynamic> datos) async {
    await _db.from('gps_registros').insert({
      'datos': datos,
      'fecha': DateTime.now().toIso8601String(),
    });
  }

  Future<void> solicitarCreacionGPS(Map<String, dynamic> datos) async {
    await _db.from('gps_solicitudes').insert({
      'datos': datos,
      'fecha': DateTime.now().toIso8601String(),
    });
  }

  Future<void> registrarEvento(Map<String, dynamic> datos) async {
    await _db.from('registros_eventos').insert({
      'datos': datos,
      'fecha': DateTime.now().toIso8601String(),
    });
  }

  // ── Seed inicial ─────────────────────────────────────────────────────────────

  Future<void> seedDatosIniciales() async {
    await Future.wait([
      _seedPastoresIfEmpty(),
      _seedEquiposIfEmpty(),
    ]);
  }

  Future<void> _seedPastoresIfEmpty() async {
    final rows = await _db.from('pastores').select('id').limit(1);
    if ((rows as List).isNotEmpty) return;

    await _db.from('pastores').insert([
      {'nombre': 'Andrés Barrantes', 'cargo': 'Pastor General', 'bio': '', 'foto_url': null, 'orden': 1},
      {'nombre': 'Paola Fallas', 'cargo': 'Pastora General', 'bio': '', 'foto_url': null, 'orden': 2},
      {'nombre': 'Luis Barboza', 'cargo': 'Pastor Anciano', 'bio': '', 'foto_url': null, 'orden': 3},
      {'nombre': 'Marta Campos', 'cargo': 'Pastora Anciana', 'bio': '', 'foto_url': null, 'orden': 4},
      {'nombre': 'Daphny Gilles', 'cargo': 'Pastora Anciana · Líder de Jóvenes CJC', 'bio': '', 'foto_url': null, 'orden': 5},
    ]);
  }

  Future<void> _seedEquiposIfEmpty() async {
    final rows = await _db.from('equipos').select('id').limit(1);
    if ((rows as List).isNotEmpty) return;

    await _db.from('equipos').insert([
      {'nombre': 'Benjamines', 'descripcion': 'Pastoral a cargo de los niños de nuestra casa, en edades de 0 a 12 años.', 'lider': '', 'icon_name': 'kids', 'orden': 1},
      {'nombre': 'Jóvenes CJC', 'descripcion': 'Pastoral a cargo de los jóvenes de nuestra casa, en edades de 13 a 25 años.', 'lider': '', 'icon_name': 'youth', 'orden': 2},
      {'nombre': 'Somos Hijos', 'descripcion': 'Equipo encargado de la parte de adoración de nuestra casa.', 'lider': '', 'icon_name': 'music', 'orden': 3},
      {'nombre': 'Bethel', 'descripcion': 'Equipo encargado de la parte artística como obras de teatro y danzas.', 'lider': '', 'icon_name': 'media', 'orden': 4},
      {'nombre': 'Construyendo Sobre la Roca', 'descripcion': 'Pastoral a cargo de los matrimonios de nuestra casa.', 'lider': '', 'icon_name': 'prayer', 'orden': 5},
      {'nombre': 'Club de la Pelea', 'descripcion': 'Equipo a cargo de los varones.', 'lider': '', 'icon_name': 'missions', 'orden': 6},
      {'nombre': 'Guerreras del Reino', 'descripcion': 'Equipo a cargo de las mujeres.', 'lider': '', 'icon_name': 'welcome', 'orden': 7},
      {'nombre': 'Servidores', 'descripcion': 'Equipo encargado de asistir logísticamente en el desarrollo de nuestros servicios.', 'lider': '', 'icon_name': 'sound', 'orden': 8},
      {'nombre': 'Piedras Vivas', 'descripcion': 'Equipo encargado de la bienvenida a las personas que se agregan a nuestra familia.', 'lider': '', 'icon_name': 'welcome', 'orden': 9},
    ]);
  }

  // ── Auth ──────────────────────────────────────────────────────────────────────

  Future<void> updateUserPhoto(String uid, String photoUrl) async {
    await _db.from('usuarios').update({'foto_url': photoUrl}).eq('id', uid);
    await _db.auth.updateUser(UserAttributes(data: {'avatar_url': photoUrl}));
  }

  Future<void> updateUserName(String uid, String name) async {
    await _db.from('usuarios').update({'nombre': name}).eq('id', uid);
    await _db.auth.updateUser(UserAttributes(data: {'full_name': name, 'nombre': name}));
  }

  /// Devuelve {nombre, foto_url, genero} desde la tabla usuarios (fuente de verdad).
  Future<Map<String, String?>> getUserProfile(String uid) async {
    final row = await _db
        .from('usuarios')
        .select('nombre, foto_url, genero')
        .eq('id', uid)
        .maybeSingle();
    return {
      'nombre':   row?['nombre']   as String?,
      'foto_url': row?['foto_url'] as String?,
      'genero':   row?['genero']   as String?,
    };
  }

  Future<void> updateUserGender(String uid, String genero) async {
    await _db.from('usuarios').update({'genero': genero}).eq('id', uid);
  }

  User? get currentUser => _db.auth.currentUser;
  Stream<AuthState> get authStateChanges => _db.auth.onAuthStateChange;

  Future<bool> get isAdmin async {
    final user = _db.auth.currentUser;
    if (user == null) return false;
    try {
      final data = await _db
          .from('usuarios')
          .select('rol')
          .eq('id', user.id)
          .maybeSingle();
      return data?['rol'] == 'admin';
    } catch (_) {
      return false;
    }
  }

  /// Devuelve null si el login es exitoso, o un mensaje de error.
  Future<String?> signIn(String email, String password) async {
    try {
      await _db.auth.signInWithPassword(email: email.trim(), password: password);
      final adminOk = await isAdmin;
      if (!adminOk) {
        await _db.auth.signOut();
        return 'No tienes permisos de administrador.';
      }
      return null;
    } on AuthException catch (e) {
      final msg = e.message.toLowerCase();
      if (msg.contains('invalid') || msg.contains('credentials')) {
        return 'Credenciales inválidas.';
      }
      return e.message;
    }
  }

  Future<void> signOut() async => _db.auth.signOut();

  // ── Admin: CRUD Anuncios ──────────────────────────────────────────────────────

  Stream<List<Anuncio>> todosAnunciosStream() {
    return _db
        .from('anuncios')
        .stream(primaryKey: ['id'])
        .order('fecha', ascending: false)
        .map((rows) => rows.map(Anuncio.fromMap).toList());
  }

  Future<void> crearAnuncio({
    required String titulo,
    required String descripcion,
    required DateTime fecha,
    required bool activo,
    String? imagenUrl,
  }) async {
    await _db.from('anuncios').insert({
      'titulo': titulo,
      'descripcion': descripcion,
      'fecha': fecha.toIso8601String(),
      'activo': activo,
      if (imagenUrl != null && imagenUrl.isNotEmpty) 'imagen_url': imagenUrl,
    });
  }

  Future<void> actualizarAnuncio(
    String id, {
    required String titulo,
    required String descripcion,
    required DateTime fecha,
    required bool activo,
    String? imagenUrl,
  }) async {
    await _db.from('anuncios').update({
      'titulo': titulo,
      'descripcion': descripcion,
      'fecha': fecha.toIso8601String(),
      'activo': activo,
      'imagen_url': imagenUrl ?? '',
    }).eq('id', id);
  }

  Future<void> eliminarAnuncio(String id) async =>
      _db.from('anuncios').delete().eq('id', id);

  // ── Admin: CRUD Eventos ───────────────────────────────────────────────────────

  Stream<List<Evento>> todosEventosStream() {
    return _db
        .from('eventos')
        .stream(primaryKey: ['id'])
        .order('fecha', ascending: false)
        .map((rows) => rows.map(Evento.fromMap).toList());
  }

  Future<void> crearEvento({
    required String titulo,
    required String descripcion,
    required DateTime fecha,
    required bool activo,
    String? lugar,
    String? imageUrl,
  }) async {
    await _db.from('eventos').insert({
      'titulo': titulo,
      'descripcion': descripcion,
      'fecha': fecha.toIso8601String(),
      'activo': activo,
      if (lugar != null && lugar.isNotEmpty) 'lugar': lugar,
      if (imageUrl != null && imageUrl.isNotEmpty) 'image_url': imageUrl,
    });
  }

  Future<void> actualizarEvento(
    String id, {
    required String titulo,
    required String descripcion,
    required DateTime fecha,
    required bool activo,
    String? lugar,
    String? imageUrl,
  }) async {
    await _db.from('eventos').update({
      'titulo': titulo,
      'descripcion': descripcion,
      'fecha': fecha.toIso8601String(),
      'activo': activo,
      'lugar': lugar ?? '',
      'image_url': imageUrl ?? '',
    }).eq('id', id);
  }

  Future<void> eliminarEvento(String id) async =>
      _db.from('eventos').delete().eq('id', id);

  // ── Admin: CRUD Sermones ──────────────────────────────────────────────────────

  Stream<List<Sermon>> todosSermonesStream() {
    return _db
        .from('sermones')
        .stream(primaryKey: ['id'])
        .order('fecha', ascending: false)
        .map((rows) => rows.map(Sermon.fromMap).toList());
  }

  Future<void> crearSermon({
    required String titulo,
    required String descripcion,
    required String videoId,
    required String predicador,
    required DateTime fecha,
    required bool activo,
  }) async {
    await _db.from('sermones').insert({
      'titulo': titulo,
      'descripcion': descripcion,
      'video_id': videoId,
      'predicador': predicador,
      'fecha': fecha.toIso8601String(),
      'activo': activo,
    });
  }

  Future<void> actualizarSermon(
    String id, {
    required String titulo,
    required String descripcion,
    required String videoId,
    required String predicador,
    required DateTime fecha,
    required bool activo,
  }) async {
    await _db.from('sermones').update({
      'titulo': titulo,
      'descripcion': descripcion,
      'video_id': videoId,
      'predicador': predicador,
      'fecha': fecha.toIso8601String(),
      'activo': activo,
    }).eq('id', id);
  }

  Future<void> eliminarSermon(String id) async =>
      _db.from('sermones').delete().eq('id', id);
}
