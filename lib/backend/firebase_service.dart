import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

// ─── Modelos adicionales ──────────────────────────────────────────────────────

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

  factory LiveConfig.fromFirestore(Map<String, dynamic> data) => LiveConfig(
        videoId: data['videoId'] as String? ?? '',
        titulo: data['titulo'] as String? ?? '',
        descripcion: data['descripcion'] as String? ?? '',
        activo: data['activo'] as bool? ?? false,
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

  factory Sermon.fromFirestore(DocumentSnapshot doc) {
    final d = doc.data() as Map<String, dynamic>;
    return Sermon(
      id: doc.id,
      titulo: d['titulo'] as String? ?? '',
      descripcion: d['descripcion'] as String? ?? '',
      videoId: d['videoId'] as String? ?? '',
      fecha: (d['fecha'] as Timestamp?)?.toDate() ?? DateTime.now(),
      predicador: d['predicador'] as String? ?? '',
      activo: d['activo'] as bool? ?? true,
    );
  }
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

  factory Devocional.fromFirestore(DocumentSnapshot doc) {
    final d = doc.data() as Map<String, dynamic>;
    return Devocional(
      id: doc.id,
      titulo: d['titulo'] as String? ?? '',
      versiculo: d['versiculo'] as String? ?? '',
      referencia: d['referencia'] as String? ?? '',
      reflexion: d['reflexion'] as String? ?? '',
      fecha: (d['fecha'] as Timestamp?)?.toDate() ?? DateTime.now(),
    );
  }
}

class Oracion {
  final String id;
  final String nombre;
  final String peticion;
  final bool anonima;
  final DateTime fecha;
  final String estado; // 'pendiente' | 'aprobada' | 'rechazada'
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

  factory Oracion.fromFirestore(DocumentSnapshot doc) {
    final d = doc.data() as Map<String, dynamic>;
    return Oracion(
      id: doc.id,
      nombre: d['anonima'] == true ? 'Anónimo' : (d['nombre'] as String? ?? ''),
      peticion: d['peticion'] as String? ?? '',
      anonima: d['anonima'] as bool? ?? false,
      fecha: (d['fecha'] as Timestamp?)?.toDate() ?? DateTime.now(),
      estado: d['estado'] as String? ?? 'pendiente',
      orantes: (d['orantes'] as num?)?.toInt() ?? 0,
      orantesUids: List<String>.from(d['orantesUids'] as List? ?? []),
      autorUid: d['autorUid'] as String? ?? '',
    );
  }
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

  factory FotoGaleria.fromFirestore(DocumentSnapshot doc) {
    final d = doc.data() as Map<String, dynamic>;
    return FotoGaleria(
      id: doc.id,
      imageUrl: d['imageUrl'] as String? ?? '',
      titulo: d['titulo'] as String? ?? '',
      descripcion: d['descripcion'] as String? ?? '',
      fecha: (d['fecha'] as Timestamp?)?.toDate() ?? DateTime.now(),
      categoria: d['categoria'] as String? ?? 'general',
    );
  }
}

class Recurso {
  final String id;
  final String titulo;
  final String descripcion;
  final String url;
  final String tipo; // 'pdf' | 'audio' | 'video'
  final DateTime fecha;

  const Recurso({
    required this.id,
    required this.titulo,
    required this.descripcion,
    required this.url,
    required this.tipo,
    required this.fecha,
  });

  factory Recurso.fromFirestore(DocumentSnapshot doc) {
    final d = doc.data() as Map<String, dynamic>;
    return Recurso(
      id: doc.id,
      titulo: d['titulo'] as String? ?? '',
      descripcion: d['descripcion'] as String? ?? '',
      url: d['url'] as String? ?? '',
      tipo: d['tipo'] as String? ?? 'pdf',
      fecha: (d['fecha'] as Timestamp?)?.toDate() ?? DateTime.now(),
    );
  }
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

  factory Pastor.fromFirestore(DocumentSnapshot doc) {
    final d = doc.data() as Map<String, dynamic>;
    return Pastor(
      id: doc.id,
      nombre: d['nombre'] as String? ?? '',
      cargo: d['cargo'] as String? ?? '',
      bio: d['bio'] as String? ?? '',
      fotoUrl: d['fotoUrl'] as String?,
      orden: d['orden'] as int? ?? 0,
    );
  }
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

  factory Equipo.fromFirestore(DocumentSnapshot doc) {
    final d = doc.data() as Map<String, dynamic>;
    return Equipo(
      id: doc.id,
      nombre: d['nombre'] as String? ?? '',
      descripcion: d['descripcion'] as String? ?? '',
      lider: d['lider'] as String? ?? '',
      iconName: d['iconName'] as String?,
      orden: d['orden'] as int? ?? 0,
    );
  }
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

  factory Evento.fromFirestore(DocumentSnapshot doc) {
    final d = doc.data() as Map<String, dynamic>;
    return Evento(
      id: doc.id,
      titulo: d['titulo'] as String? ?? '',
      descripcion: d['descripcion'] as String? ?? '',
      fecha: (d['fecha'] as Timestamp?)?.toDate() ?? DateTime.now(),
      lugar: d['lugar'] as String?,
      imageUrl: d['imageUrl'] as String?,
      activo: d['activo'] as bool? ?? true,
    );
  }
}

// ─── Modelo Anuncio ───────────────────────────────────────────────────────────

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

  factory Anuncio.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return Anuncio(
      id: doc.id,
      titulo: data['titulo'] as String? ?? '',
      descripcion: data['descripcion'] as String? ?? '',
      imagenUrl: data['imagenUrl'] as String?,
      fecha: (data['fecha'] as Timestamp?)?.toDate() ?? DateTime.now(),
      activo: data['activo'] as bool? ?? true,
    );
  }
}

// ─── Servicio Firebase ────────────────────────────────────────────────────────

class FirebaseService {
  FirebaseService._();
  static final FirebaseService instance = FirebaseService._();

  final _db = FirebaseFirestore.instance;
  final _auth = FirebaseAuth.instance;
  final _messaging = FirebaseMessaging.instance;
  final _localNotifications = FlutterLocalNotificationsPlugin();

  static const AndroidNotificationChannel _channel = AndroidNotificationChannel(
    'cjc_anuncios',
    'Anuncios CJC',
    description: 'Notificaciones de anuncios de la iglesia.',
    importance: Importance.high,
  );

  // ── Inicialización ──────────────────────────────────────────────────────────

  Future<void> initialize() async {
    if (!kIsWeb) {
      await _initLocalNotifications();
    }
    await _initFCM();
  }

  Future<void> _initLocalNotifications() async {
    const androidSettings =
        AndroidInitializationSettings('@mipmap/ic_launcher');
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

  Future<void> _initFCM() async {
    // Pedir permiso (iOS / Android 13+).
    // En web esto puede tardar si el navegador muestra un diálogo — no bloquea el arranque.
    _messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    // Mostrar notificación local cuando la app está en primer plano (solo nativo)
    if (!kIsWeb) {
      FirebaseMessaging.onMessage.listen(_showLocalNotification);
      await _messaging.subscribeToTopic('anuncios');
    }
  }

  void _showLocalNotification(RemoteMessage message) {
    final notification = message.notification;
    if (notification == null) return;

    _localNotifications.show(
      notification.hashCode,
      notification.title,
      notification.body,
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

  // ── Anuncios (Firestore) ────────────────────────────────────────────────────

  /// Stream en tiempo real de anuncios activos, ordenados por fecha desc.
  Stream<List<Anuncio>> anunciosStream() {
    return _db
        .collection('anuncios')
        .snapshots()
        .map((snap) {
      final list = snap.docs.map(Anuncio.fromFirestore).toList();
      list.removeWhere((a) => a.activo == false);
      list.sort((a, b) => b.fecha.compareTo(a.fecha));
      return list;
    });
  }

  // ── Live Config ─────────────────────────────────────────────────────────────

  Future<LiveConfig?> getLiveConfig() async {
    try {
      final doc = await _db.collection('config').doc('live').get();
      if (!doc.exists || doc.data() == null) return null;
      return LiveConfig.fromFirestore(doc.data()!);
    } catch (_) {
      return null;
    }
  }

  Stream<LiveConfig?> liveConfigStream() {
    return _db.collection('config').doc('live').snapshots().map((doc) {
      if (!doc.exists || doc.data() == null) return null;
      return LiveConfig.fromFirestore(doc.data()!);
    });
  }

  Future<void> saveLiveConfig({
    required String videoId,
    required String titulo,
    required String descripcion,
    required bool activo,
  }) async {
    await _db.collection('config').doc('live').set({
      'videoId': videoId.trim(),
      'titulo': titulo.trim(),
      'descripcion': descripcion.trim(),
      'activo': activo,
    });
  }

  // ── Sermones ────────────────────────────────────────────────────────────────

  Stream<List<Sermon>> sermonesStream() {
    return _db
        .collection('sermones')
        .snapshots()
        .map((snap) {
      final list = snap.docs.map(Sermon.fromFirestore).toList();
      list.removeWhere((s) => s.activo == false);
      list.sort((a, b) => b.fecha.compareTo(a.fecha));
      return list;
    });
  }

  // ── Devocional diario ───────────────────────────────────────────────────────

  Future<Devocional?> getDevocionalHoy() async {
    try {
      final hoy = DateTime.now();
      final inicio = DateTime(hoy.year, hoy.month, hoy.day);
      final fin = inicio.add(const Duration(days: 1));
      final snap = await _db
          .collection('devocionales')
          .where('fecha', isGreaterThanOrEqualTo: Timestamp.fromDate(inicio))
          .where('fecha', isLessThan: Timestamp.fromDate(fin))
          .limit(1)
          .get();
      if (snap.docs.isEmpty) {
        // Fallback: most recent
        final fallback = await _db
            .collection('devocionales')
            .orderBy('fecha', descending: true)
            .limit(1)
            .get();
        if (fallback.docs.isEmpty) return null;
        return Devocional.fromFirestore(fallback.docs.first);
      }
      return Devocional.fromFirestore(snap.docs.first);
    } catch (_) {
      return null;
    }
  }

  Stream<List<Devocional>> devoccionalesStream() {
    return _db
        .collection('devocionales')
        .orderBy('fecha', descending: true)
        .limit(30)
        .snapshots()
        .map((snap) => snap.docs.map(Devocional.fromFirestore).toList());
  }

  Future<void> crearDevocional({
    required String titulo,
    required String versiculo,
    required String referencia,
    required String reflexion,
    required DateTime fecha,
  }) async {
    await _db.collection('devocionales').add({
      'titulo': titulo.trim(),
      'versiculo': versiculo.trim(),
      'referencia': referencia.trim(),
      'reflexion': reflexion.trim(),
      'fecha': Timestamp.fromDate(fecha),
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
    await _db.collection('devocionales').doc(id).update({
      'titulo': titulo.trim(),
      'versiculo': versiculo.trim(),
      'referencia': referencia.trim(),
      'reflexion': reflexion.trim(),
      'fecha': Timestamp.fromDate(fecha),
    });
  }

  Future<void> eliminarDevocional(String id) async =>
      _db.collection('devocionales').doc(id).delete();

  // ── Oración ─────────────────────────────────────────────────────────────────

  /// Solo muestra oraciones aprobadas por el admin.
  Stream<List<Oracion>> oracionesPublicasStream() {
    return _db
        .collection('oraciones')
        .where('estado', isEqualTo: 'aprobada')
        .orderBy('fecha', descending: true)
        .limit(50)
        .snapshots()
        .map((snap) => snap.docs.map(Oracion.fromFirestore).toList());
  }

  /// Oraciones pendientes de moderación (solo para admin).
  Stream<List<Oracion>> oracionesPendientesStream() {
    return _db
        .collection('oraciones')
        .where('estado', isEqualTo: 'pendiente')
        .orderBy('fecha', descending: true)
        .snapshots()
        .map((snap) => snap.docs.map(Oracion.fromFirestore).toList());
  }

  Future<void> crearOracion({
    required String nombre,
    required String peticion,
    required bool anonima,
  }) async {
    await _db.collection('oraciones').add({
      'nombre': anonima ? 'Anónimo' : nombre,
      'peticion': peticion,
      'anonima': anonima,
      'fecha': FieldValue.serverTimestamp(),
      'estado': 'pendiente',
      'autorUid': currentUser?.uid ?? '',
      'orantes': 0,
      'orantesUids': [],
    });
  }

  Stream<List<Oracion>> misOracionesStream(String uid) {
    return _db
        .collection('oraciones')
        .where('autorUid', isEqualTo: uid)
        .where('estado', isEqualTo: 'aprobada')
        .snapshots()
        .map((snap) {
      final list = snap.docs.map(Oracion.fromFirestore).toList();
      list.sort((a, b) => b.fecha.compareTo(a.fecha));
      return list;
    });
  }

  Future<void> orarPor(String oracionId, String uid) async {
    await _db.collection('oraciones').doc(oracionId).update({
      'orantes': FieldValue.increment(1),
      'orantesUids': FieldValue.arrayUnion([uid]),
    });
  }

  /// Admin: aprobar una oración.
  Future<void> aprobarOracion(String id) async {
    await _db.collection('oraciones').doc(id).update({'estado': 'aprobada'});
  }

  /// Admin: rechazar/eliminar una oración.
  Future<void> rechazarOracion(String id) async {
    await _db.collection('oraciones').doc(id).update({'estado': 'rechazada'});
  }

  // ── Galería ─────────────────────────────────────────────────────────────────

  Stream<List<FotoGaleria>> galeriaStream({String? categoria}) {
    Query<Map<String, dynamic>> q = _db.collection('galeria');
    if (categoria != null && categoria != 'todos') {
      q = q.where('categoria', isEqualTo: categoria);
    }
    return q.snapshots().map((snap) {
      final list = snap.docs.map(FotoGaleria.fromFirestore).toList();
      list.sort((a, b) => b.fecha.compareTo(a.fecha));
      return list;
    });
  }

  // ── Recursos ────────────────────────────────────────────────────────────────

  Stream<List<Recurso>> recursosStream({String? tipo}) {
    Query<Map<String, dynamic>> q = _db.collection('recursos');
    if (tipo != null && tipo != 'todos') {
      q = q.where('tipo', isEqualTo: tipo);
    }
    return q.snapshots().map((snap) {
      final list = snap.docs.map(Recurso.fromFirestore).toList();
      list.sort((a, b) => b.fecha.compareTo(a.fecha));
      return list;
    });
  }

  // ── Pastores ────────────────────────────────────────────────────────────────

  Stream<List<Pastor>> pastoresStream() {
    return _db
        .collection('pastores')
        .orderBy('orden')
        .snapshots()
        .map((snap) => snap.docs.map(Pastor.fromFirestore).toList());
  }

  // ── Equipos ─────────────────────────────────────────────────────────────────

  Stream<List<Equipo>> equiposStream() {
    return _db
        .collection('equipos')
        .orderBy('orden')
        .snapshots()
        .map((snap) => snap.docs.map(Equipo.fromFirestore).toList());
  }

  // ── Eventos ─────────────────────────────────────────────────────────────────

  Stream<List<Evento>> eventosStream() {
    final ahora = DateTime.now();
    final inicioHoy = DateTime(ahora.year, ahora.month, ahora.day);
    return _db
        .collection('eventos')
        .where('activo', isEqualTo: true)
        .snapshots()
        .map((snap) {
      final list = snap.docs.map(Evento.fromFirestore).toList();
      list.removeWhere((e) => e.fecha.isBefore(inicioHoy));
      list.sort((a, b) => a.fecha.compareTo(b.fecha));
      return list;
    });
  }

  // ── GPS ──────────────────────────────────────────────────────────────────────

  Future<void> registrarGPS(Map<String, dynamic> datos) async {
    await _db.collection('gps_registros').add({
      ...datos,
      'fecha': FieldValue.serverTimestamp(),
    });
  }

  Future<void> solicitarCreacionGPS(Map<String, dynamic> datos) async {
    await _db.collection('gps_solicitudes').add({
      ...datos,
      'fecha': FieldValue.serverTimestamp(),
    });
  }

  Future<void> registrarEvento(Map<String, dynamic> datos) async {
    await _db.collection('registros_eventos').add({
      ...datos,
      'fecha': FieldValue.serverTimestamp(),
    });
  }

  // ── Seed inicial ─────────────────────────────────────────────────────────────

  /// Puebla Firestore con pastores y equipos reales si las colecciones están vacías.
  Future<void> seedDatosIniciales() async {
    await Future.wait([
      _seedPastoresIfEmpty(),
      _seedEquiposIfEmpty(),
    ]);
  }

  Future<void> _seedPastoresIfEmpty() async {
    final snap = await _db.collection('pastores').limit(1).get();
    if (snap.docs.isNotEmpty) return;

    final pastores = [
      {
        'nombre': 'Andrés Barrantes',
        'cargo': 'Pastor General',
        'bio': '',
        'fotoUrl': null,
        'orden': 1,
      },
      {
        'nombre': 'Paola Fallas',
        'cargo': 'Pastora General',
        'bio': '',
        'fotoUrl': null,
        'orden': 2,
      },
      {
        'nombre': 'Luis Barboza',
        'cargo': 'Pastor Anciano',
        'bio': '',
        'fotoUrl': null,
        'orden': 3,
      },
      {
        'nombre': 'Marta Campos',
        'cargo': 'Pastora Anciana',
        'bio': '',
        'fotoUrl': null,
        'orden': 4,
      },
      {
        'nombre': 'Daphny Gilles',
        'cargo': 'Pastora Anciana · Líder de Jóvenes CJC',
        'bio': '',
        'fotoUrl': null,
        'orden': 5,
      },
    ];

    final batch = _db.batch();
    for (final p in pastores) {
      batch.set(_db.collection('pastores').doc(), p);
    }
    await batch.commit();
  }

  Future<void> _seedEquiposIfEmpty() async {
    final snap = await _db.collection('equipos').limit(1).get();
    if (snap.docs.isNotEmpty) return;

    final equipos = [
      {
        'nombre': 'Benjamines',
        'descripcion':
            'Pastoral a cargo de los niños de nuestra casa, en edades de 0 a 12 años.',
        'lider': '',
        'iconName': 'kids',
        'orden': 1,
      },
      {
        'nombre': 'Jóvenes CJC',
        'descripcion':
            'Pastoral a cargo de los jóvenes de nuestra casa, en edades de 13 a 25 años.',
        'lider': '',
        'iconName': 'youth',
        'orden': 2,
      },
      {
        'nombre': 'Somos Hijos',
        'descripcion':
            'Equipo encargado de la parte de adoración de nuestra casa.',
        'lider': '',
        'iconName': 'music',
        'orden': 3,
      },
      {
        'nombre': 'Bethel',
        'descripcion':
            'Equipo encargado de la parte artística como obras de teatro y danzas.',
        'lider': '',
        'iconName': 'media',
        'orden': 4,
      },
      {
        'nombre': 'Construyendo Sobre la Roca',
        'descripcion':
            'Pastoral a cargo de los matrimonios de nuestra casa.',
        'lider': '',
        'iconName': 'prayer',
        'orden': 5,
      },
      {
        'nombre': 'Club de la Pelea',
        'descripcion': 'Equipo a cargo de los varones.',
        'lider': '',
        'iconName': 'missions',
        'orden': 6,
      },
      {
        'nombre': 'Guerreras del Reino',
        'descripcion': 'Equipo a cargo de las mujeres.',
        'lider': '',
        'iconName': 'welcome',
        'orden': 7,
      },
      {
        'nombre': 'Servidores',
        'descripcion':
            'Equipo encargado de asistir logísticamente en el desarrollo de nuestros servicios.',
        'lider': '',
        'iconName': 'sound',
        'orden': 8,
      },
      {
        'nombre': 'Piedras Vivas',
        'descripcion':
            'Equipo encargado de la bienvenida a las personas que se agregan a nuestra familia.',
        'lider': '',
        'iconName': 'welcome',
        'orden': 9,
      },
    ];

    final batch = _db.batch();
    for (final e in equipos) {
      batch.set(_db.collection('equipos').doc(), e);
    }
    await batch.commit();
  }

  // ── Auth ──────────────────────────────────────────────────────────────────────

  User? get currentUser => _auth.currentUser;
  Stream<User?> get authStateChanges => _auth.authStateChanges();

  Future<bool> get isAdmin async {
    final user = _auth.currentUser;
    if (user == null) return false;
    try {
      final doc = await _db.collection('usuarios').doc(user.uid).get();
      return doc.data()?['rol'] == 'admin';
    } catch (_) {
      return false;
    }
  }

  /// Devuelve null si el login es exitoso, o un mensaje de error.
  Future<String?> signIn(String email, String password) async {
    try {
      await _auth.signInWithEmailAndPassword(
          email: email.trim(), password: password);
      final adminOk = await isAdmin;
      if (!adminOk) {
        await _auth.signOut();
        return 'No tienes permisos de administrador.';
      }
      return null;
    } on FirebaseAuthException catch (e) {
      switch (e.code) {
        case 'user-not-found':
          return 'Usuario no encontrado.';
        case 'wrong-password':
          return 'Contraseña incorrecta.';
        case 'invalid-email':
          return 'Correo inválido.';
        case 'invalid-credential':
          return 'Credenciales inválidas.';
        default:
          return e.message ?? 'Error al iniciar sesión.';
      }
    }
  }

  Future<void> signOut() async => _auth.signOut();

  // ── Admin: CRUD Anuncios ──────────────────────────────────────────────────────

  Stream<List<Anuncio>> todosAnunciosStream() {
    return _db.collection('anuncios').snapshots().map((snap) {
      final list = snap.docs.map(Anuncio.fromFirestore).toList();
      list.sort((a, b) => b.fecha.compareTo(a.fecha));
      return list;
    });
  }

  Future<void> crearAnuncio({
    required String titulo,
    required String descripcion,
    required DateTime fecha,
    required bool activo,
    String? imagenUrl,
  }) async {
    await _db.collection('anuncios').add({
      'titulo': titulo,
      'descripcion': descripcion,
      'fecha': Timestamp.fromDate(fecha),
      'activo': activo,
      if (imagenUrl != null && imagenUrl.isNotEmpty) 'imagenUrl': imagenUrl,
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
    await _db.collection('anuncios').doc(id).update({
      'titulo': titulo,
      'descripcion': descripcion,
      'fecha': Timestamp.fromDate(fecha),
      'activo': activo,
      'imagenUrl': imagenUrl ?? '',
    });
  }

  Future<void> eliminarAnuncio(String id) async =>
      _db.collection('anuncios').doc(id).delete();

  // ── Admin: CRUD Eventos ───────────────────────────────────────────────────────

  Stream<List<Evento>> todosEventosStream() {
    return _db.collection('eventos').snapshots().map((snap) {
      final list = snap.docs.map(Evento.fromFirestore).toList();
      list.sort((a, b) => b.fecha.compareTo(a.fecha));
      return list;
    });
  }

  Future<void> crearEvento({
    required String titulo,
    required String descripcion,
    required DateTime fecha,
    required bool activo,
    String? lugar,
    String? imageUrl,
  }) async {
    await _db.collection('eventos').add({
      'titulo': titulo,
      'descripcion': descripcion,
      'fecha': Timestamp.fromDate(fecha),
      'activo': activo,
      if (lugar != null && lugar.isNotEmpty) 'lugar': lugar,
      if (imageUrl != null && imageUrl.isNotEmpty) 'imageUrl': imageUrl,
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
    await _db.collection('eventos').doc(id).update({
      'titulo': titulo,
      'descripcion': descripcion,
      'fecha': Timestamp.fromDate(fecha),
      'activo': activo,
      'lugar': lugar ?? '',
      'imageUrl': imageUrl ?? '',
    });
  }

  Future<void> eliminarEvento(String id) async =>
      _db.collection('eventos').doc(id).delete();

  // ── Admin: CRUD Sermones ──────────────────────────────────────────────────────

  Stream<List<Sermon>> todosSermonesStream() {
    return _db.collection('sermones').snapshots().map((snap) {
      final list = snap.docs.map(Sermon.fromFirestore).toList();
      list.sort((a, b) => b.fecha.compareTo(a.fecha));
      return list;
    });
  }

  Future<void> crearSermon({
    required String titulo,
    required String descripcion,
    required String videoId,
    required String predicador,
    required DateTime fecha,
    required bool activo,
  }) async {
    await _db.collection('sermones').add({
      'titulo': titulo,
      'descripcion': descripcion,
      'videoId': videoId,
      'predicador': predicador,
      'fecha': Timestamp.fromDate(fecha),
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
    await _db.collection('sermones').doc(id).update({
      'titulo': titulo,
      'descripcion': descripcion,
      'videoId': videoId,
      'predicador': predicador,
      'fecha': Timestamp.fromDate(fecha),
      'activo': activo,
    });
  }

  Future<void> eliminarSermon(String id) async =>
      _db.collection('sermones').doc(id).delete();
}
