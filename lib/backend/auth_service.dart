import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';

class AuthService {
  AuthService._();
  static final AuthService instance = AuthService._();

  final _auth = FirebaseAuth.instance;
  final _db = FirebaseFirestore.instance;
  final _googleSignIn = GoogleSignIn();

  // ── Estado actual ──────────────────────────────────────────────────────────

  User? get currentUser => _auth.currentUser;
  bool get isLoggedIn => currentUser != null;
  Stream<User?> get authStateStream => _auth.authStateChanges();

  // ── Google Sign-In ─────────────────────────────────────────────────────────

  Future<UserCredential?> signInWithGoogle() async {
    final googleUser = await _googleSignIn.signIn();
    if (googleUser == null) return null; // usuario canceló

    final googleAuth = await googleUser.authentication;
    final credential = GoogleAuthProvider.credential(
      accessToken: googleAuth.accessToken,
      idToken: googleAuth.idToken,
    );

    final result = await _auth.signInWithCredential(credential);
    await _saveUserProfile(result.user);
    return result;
  }

  // ── Email/Contraseña ───────────────────────────────────────────────────────

  Future<UserCredential> signInWithEmail(String email, String password) async {
    final result = await _auth.signInWithEmailAndPassword(
      email: email.trim(),
      password: password,
    );
    return result;
  }

  Future<UserCredential> registerWithEmail({
    required String name,
    required String email,
    required String password,
  }) async {
    final result = await _auth.createUserWithEmailAndPassword(
      email: email.trim(),
      password: password,
    );
    await result.user?.updateDisplayName(name);
    await _saveUserProfile(result.user, displayName: name);
    return result;
  }

  Future<void> sendPasswordReset(String email) async {
    await _auth.sendPasswordResetEmail(email: email.trim());
  }

  // ── Cerrar sesión ──────────────────────────────────────────────────────────

  Future<void> signOut() async {
    await _googleSignIn.signOut();
    await _auth.signOut();
  }

  // ── Perfil en Firestore ────────────────────────────────────────────────────

  Future<void> _saveUserProfile(User? user, {String? displayName}) async {
    if (user == null) return;
    final ref = _db.collection('usuarios').doc(user.uid);
    await ref.set({
      'uid': user.uid,
      'nombre': displayName ?? user.displayName ?? '',
      'email': user.email ?? '',
      'fotoUrl': user.photoURL ?? '',
      'creadoEn': FieldValue.serverTimestamp(),
    }, SetOptions(merge: true));
  }

  // ── Mensajes de error legibles ─────────────────────────────────────────────

  static String errorMessage(FirebaseAuthException e) {
    switch (e.code) {
      case 'user-not-found':
        return 'No existe una cuenta con ese email.';
      case 'wrong-password':
        return 'Contraseña incorrecta.';
      case 'email-already-in-use':
        return 'Ese email ya está registrado.';
      case 'weak-password':
        return 'La contraseña debe tener al menos 6 caracteres.';
      case 'invalid-email':
        return 'El email no es válido.';
      case 'too-many-requests':
        return 'Demasiados intentos. Intentá más tarde.';
      default:
        return 'Ocurrió un error. Intentá de nuevo.';
    }
  }
}
