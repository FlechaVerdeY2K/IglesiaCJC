import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

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
    await _initLocalNotifications();
    await _initFCM();
  }

  Future<void> _initLocalNotifications() async {
    const androidSettings =
        AndroidInitializationSettings('@mipmap/launcher_icon');
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
    // Pedir permiso (iOS / Android 13+)
    await _messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    // Mostrar notificación local cuando la app está en primer plano
    FirebaseMessaging.onMessage.listen(_showLocalNotification);

    // Todos los dispositivos se suscriben al topic general de anuncios
    await _messaging.subscribeToTopic('anuncios');
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
        .where('activo', isEqualTo: true)
        .orderBy('fecha', descending: true)
        .snapshots()
        .map((snap) => snap.docs.map(Anuncio.fromFirestore).toList());
  }
}
