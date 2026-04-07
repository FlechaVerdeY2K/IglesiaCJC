import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:google_sign_in/google_sign_in.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

export 'package:supabase_flutter/supabase_flutter.dart'
    show User, AuthException, AuthState, Session;

class AuthService {
  AuthService._();
  static final AuthService instance = AuthService._();

  SupabaseClient get _client => Supabase.instance.client;
  // Lazy: solo se crea cuando se necesita (evita crash en web sin clientId)
  GoogleSignIn? __googleSignIn;
  GoogleSignIn get _googleSignIn => __googleSignIn ??= GoogleSignIn();

  // ── Estado actual ──────────────────────────────────────────────────────────

  User? get currentUser => _client.auth.currentUser;
  bool get isLoggedIn => currentUser != null;
  Stream<AuthState> get authStateStream => _client.auth.onAuthStateChange;

  // ── Google Sign-In ─────────────────────────────────────────────────────────

  /// En Web usa popup OAuth via Supabase (no necesita google_sign_in).
  /// En móvil usa google_sign_in + signInWithIdToken.
  Future<AuthResponse?> signInWithGoogle() async {
    if (kIsWeb) {
      await _client.auth.signInWithOAuth(
        OAuthProvider.google,
        redirectTo: '${Uri.base.origin}/userLogin',
        authScreenLaunchMode: LaunchMode.platformDefault,
      );
      return null; // El resultado llega via onAuthStateChange tras el redirect
    }
    final googleUser = await _googleSignIn.signIn();
    if (googleUser == null) return null;

    final googleAuth = await googleUser.authentication;
    final idToken = googleAuth.idToken;
    if (idToken == null) return null;

    final response = await _client.auth.signInWithIdToken(
      provider: OAuthProvider.google,
      idToken: idToken,
      accessToken: googleAuth.accessToken,
    );
    await _saveUserProfile(
      response.user,
      displayName: googleUser.displayName,
      photoUrl: googleUser.photoUrl,
    );
    return response;
  }

  // ── Email/Contraseña ───────────────────────────────────────────────────────

  Future<AuthResponse> signInWithEmail(String email, String password) async {
    final response = await _client.auth.signInWithPassword(
      email: email.trim(),
      password: password,
    );
    await _saveUserProfile(response.user);
    return response;
  }

  Future<AuthResponse> registerWithEmail({
    required String name,
    required String email,
    required String password,
  }) async {
    final response = await _client.auth.signUp(
      email: email.trim(),
      password: password,
      data: {'nombre': name, 'full_name': name},
    );
    await _saveUserProfile(response.user, displayName: name);
    return response;
  }

  Future<void> sendPasswordReset(String email) async {
    await _client.auth.resetPasswordForEmail(email.trim());
  }

  // ── Cerrar sesión ──────────────────────────────────────────────────────────

  Future<void> signOut() async {
    try {
      await _googleSignIn.signOut();
    } catch (_) {}
    await _client.auth.signOut();
  }

  // ── Perfil en Supabase DB ──────────────────────────────────────────────────

  Future<void> _saveUserProfile(
    User? user, {
    String? displayName,
    String? photoUrl,
  }) async {
    if (user == null) return;
    final existing = await _client
        .from('usuarios')
        .select('rol')
        .eq('id', user.id)
        .maybeSingle();
    final existingRol = existing?['rol'] as String?;
    await _client.from('usuarios').upsert({
      'id': user.id,
      'nombre': displayName ??
          user.userMetadata?['full_name'] as String? ??
          user.userMetadata?['nombre'] as String? ??
          user.email?.split('@').first ??
          '',
      'email': user.email ?? '',
      'foto_url': photoUrl ??
          user.userMetadata?['avatar_url'] as String? ??
          '',
      'creado_en': DateTime.now().toIso8601String(),
      if (existingRol == null) 'rol': 'miembro',
    });
  }

  // ── Mensajes de error legibles ─────────────────────────────────────────────

  static String errorMessage(AuthException e) {
    final msg = e.message.toLowerCase();
    if (msg.contains('invalid login') || msg.contains('invalid credentials') ||
        msg.contains('invalid email or password')) {
      return 'Email o contraseña incorrectos.';
    }
    if (msg.contains('email not confirmed')) {
      return 'Confirmá tu email antes de iniciar sesión.';
    }
    if (msg.contains('user already registered') ||
        msg.contains('already been registered')) {
      return 'Ese email ya está registrado.';
    }
    if (msg.contains('password should be at least') ||
        msg.contains('weak password')) {
      return 'La contraseña debe tener al menos 6 caracteres.';
    }
    if (msg.contains('invalid email')) {
      return 'El email no es válido.';
    }
    if (msg.contains('too many requests') || msg.contains('rate limit')) {
      return 'Demasiados intentos. Intentá más tarde.';
    }
    return 'Ocurrió un error. Intentá de nuevo.';
  }
}
