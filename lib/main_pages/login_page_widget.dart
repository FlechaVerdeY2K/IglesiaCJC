import 'package:firebase_auth/firebase_auth.dart';

import '/backend/auth_service.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/index.dart';
import 'package:flutter/material.dart';
import 'login_page_model.dart';
export 'login_page_model.dart';

class LoginPageWidget extends StatefulWidget {
  const LoginPageWidget({super.key});

  static String routeName = 'LoginPage';
  static String routePath = '/login';

  @override
  State<LoginPageWidget> createState() => _LoginPageWidgetState();
}

class _LoginPageWidgetState extends State<LoginPageWidget> {
  static const Color _bg = Color(0xFF080E1E);
  static const Color _surface = Color(0xFF0F1C30);
  static const Color _accent = Color(0xFFBF1E2E);
  static const Color _border = Color(0xFF1E2E4A);

  late LoginPageModel _model;

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => LoginPageModel());
  }

  @override
  void dispose() {
    _model.dispose();
    super.dispose();
  }

  void _setLoading(bool v) => safeSetState(() => _model.isLoading = v);

  Future<void> _loginWithEmail() async {
    final email = _model.emailController.text.trim();
    final pass = _model.passwordController.text;
    if (email.isEmpty || pass.isEmpty) {
      _showError('Completá todos los campos.');
      return;
    }
    _setLoading(true);
    try {
      await AuthService.instance.signInWithEmail(email, pass);
      if (mounted) context.go('/homePage');
    } on FirebaseAuthException catch (e) {
      _showError(AuthService.errorMessage(e));
    } finally {
      _setLoading(false);
    }
  }

  Future<void> _loginWithGoogle() async {
    _setLoading(true);
    try {
      final result = await AuthService.instance.signInWithGoogle();
      if (result != null && mounted) context.go('/homePage');
    } catch (_) {
      _showError('No se pudo iniciar sesión con Google.');
    } finally {
      _setLoading(false);
    }
  }

  void _showError(String msg) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg),
      backgroundColor: const Color(0xFF1E2E4A),
    ));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _bg,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 40),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 20),
              // Logo
              Center(
                child: Image.asset(
                  'assets/images/LOGO_CJC_BLANCO_(1).png',
                  height: 90,
                  fit: BoxFit.contain,
                ),
              ),
              const SizedBox(height: 36),
              Text(
                'Bienvenido',
                textAlign: TextAlign.center,
                style: FlutterFlowTheme.of(context).headlineSmall.override(
                      fontFamily:
                          FlutterFlowTheme.of(context).headlineSmallFamily,
                      color: Colors.white,
                      fontSize: 26,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.0,
                      useGoogleFonts: !FlutterFlowTheme.of(context)
                          .headlineSmallIsCustom,
                    ),
              ),
              const SizedBox(height: 6),
              Text(
                'Iniciá sesión para acceder a todos los servicios',
                textAlign: TextAlign.center,
                style: FlutterFlowTheme.of(context).bodyMedium.override(
                      fontFamily:
                          FlutterFlowTheme.of(context).bodyMediumFamily,
                      color: Colors.white54,
                      fontSize: 14,
                      letterSpacing: 0.0,
                      useGoogleFonts: !FlutterFlowTheme.of(context)
                          .bodyMediumIsCustom,
                    ),
              ),
              const SizedBox(height: 36),

              // Google button
              _buildGoogleButton(),
              const SizedBox(height: 20),

              // Divider
              Row(children: [
                const Expanded(child: Divider(color: _border)),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  child: Text('o',
                      style: TextStyle(color: Colors.white38, fontSize: 13)),
                ),
                const Expanded(child: Divider(color: _border)),
              ]),
              const SizedBox(height: 20),

              // Email
              _buildTextField(
                controller: _model.emailController,
                focusNode: _model.emailFocus,
                label: 'Email',
                keyboardType: TextInputType.emailAddress,
                icon: Icons.email_outlined,
              ),
              const SizedBox(height: 14),

              // Password
              _buildTextField(
                controller: _model.passwordController,
                focusNode: _model.passwordFocus,
                label: 'Contraseña',
                obscure: !_model.passwordVisible,
                icon: Icons.lock_outline_rounded,
                suffixIcon: IconButton(
                  icon: Icon(
                    _model.passwordVisible
                        ? Icons.visibility_off_outlined
                        : Icons.visibility_outlined,
                    color: Colors.white38,
                    size: 20,
                  ),
                  onPressed: () => safeSetState(
                      () => _model.passwordVisible = !_model.passwordVisible),
                ),
              ),
              const SizedBox(height: 8),

              // Forgot password
              Align(
                alignment: Alignment.centerRight,
                child: TextButton(
                  onPressed: _showForgotPassword,
                  child: const Text('¿Olvidaste tu contraseña?',
                      style: TextStyle(color: _accent, fontSize: 13)),
                ),
              ),
              const SizedBox(height: 10),

              // Login button
              _buildPrimaryButton(
                label: 'Iniciar sesión',
                onPressed: _model.isLoading ? null : _loginWithEmail,
              ),
              const SizedBox(height: 24),

              // Register link
              Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                const Text('¿No tenés cuenta?',
                    style: TextStyle(color: Colors.white54, fontSize: 14)),
                TextButton(
                  onPressed: () =>
                      context.pushNamed(RegisterPageWidget.routeName),
                  child: const Text('Registrarse',
                      style: TextStyle(
                          color: _accent,
                          fontSize: 14,
                          fontWeight: FontWeight.w600)),
                ),
              ]),

              // Skip
              Center(
                child: TextButton(
                  onPressed: () => context.go('/homePage'),
                  child: const Text(
                    'Continuar sin cuenta',
                    style: TextStyle(color: Colors.white38, fontSize: 13),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildGoogleButton() {
    return OutlinedButton.icon(
      onPressed: _model.isLoading ? null : _loginWithGoogle,
      style: OutlinedButton.styleFrom(
        side: const BorderSide(color: _border),
        backgroundColor: _surface,
        padding: const EdgeInsets.symmetric(vertical: 14),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
      icon: Image.asset('assets/images/google_logo.png',
          height: 20, errorBuilder: (_, __, ___) => const Icon(Icons.g_mobiledata, color: Colors.white, size: 22)),
      label: const Text('Continuar con Google',
          style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w500)),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required FocusNode focusNode,
    required String label,
    required IconData icon,
    bool obscure = false,
    TextInputType? keyboardType,
    Widget? suffixIcon,
  }) {
    return TextField(
      controller: controller,
      focusNode: focusNode,
      obscureText: obscure,
      keyboardType: keyboardType,
      style: const TextStyle(color: Colors.white, fontSize: 15),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(color: Colors.white54),
        prefixIcon: Icon(icon, color: Colors.white38, size: 20),
        suffixIcon: suffixIcon,
        filled: true,
        fillColor: _surface,
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: _border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: _accent),
        ),
      ),
    );
  }

  Widget _buildPrimaryButton({
    required String label,
    required VoidCallback? onPressed,
  }) {
    return SizedBox(
      height: 50,
      child: ElevatedButton(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: _accent,
          foregroundColor: Colors.black,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
        child: _model.isLoading
            ? const SizedBox(
                height: 22,
                width: 22,
                child: CircularProgressIndicator(
                    strokeWidth: 2, color: Colors.black54),
              )
            : Text(label,
                style: const TextStyle(
                    fontSize: 15, fontWeight: FontWeight.w700)),
      ),
    );
  }

  void _showForgotPassword() {
    final ctrl = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: _surface,
        title: const Text('Recuperar contraseña',
            style: TextStyle(color: Colors.white)),
        content: TextField(
          controller: ctrl,
          keyboardType: TextInputType.emailAddress,
          style: const TextStyle(color: Colors.white),
          decoration: const InputDecoration(
            labelText: 'Tu email',
            labelStyle: TextStyle(color: Colors.white54),
            enabledBorder: UnderlineInputBorder(
                borderSide: BorderSide(color: _border)),
            focusedBorder: UnderlineInputBorder(
                borderSide: BorderSide(color: _accent)),
          ),
        ),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cancelar',
                  style: TextStyle(color: Colors.white54))),
          TextButton(
            onPressed: () async {
              Navigator.pop(ctx);
              try {
                await AuthService.instance.sendPasswordReset(ctrl.text);
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                    content: Text('Email de recuperación enviado.'),
                    backgroundColor: Color(0xFF1E2E4A),
                  ));
                }
              } catch (_) {
                _showError('No se pudo enviar el email.');
              }
            },
            child: const Text('Enviar',
                style: TextStyle(
                    color: _accent, fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );
  }
}
