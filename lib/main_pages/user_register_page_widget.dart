import 'package:firebase_auth/firebase_auth.dart';

import '/backend/auth_service.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:flutter/material.dart';
import 'user_register_page_model.dart';
export 'user_register_page_model.dart';

class UserRegisterPageWidget extends StatefulWidget {
  const UserRegisterPageWidget({super.key});

  static String routeName = 'UserRegisterPage';
  static String routePath = '/userRegister';

  @override
  State<UserRegisterPageWidget> createState() =>
      _UserRegisterPageWidgetState();
}

class _UserRegisterPageWidgetState extends State<UserRegisterPageWidget> {
  static const Color _bg = Color(0xFF050505);
  static const Color _surface = Color(0xFF171717);
  static const Color _accent = Color(0xFFE8D5B0);
  static const Color _border = Color(0xFF2B2B2B);

  late UserRegisterPageModel _model;

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => UserRegisterPageModel());
  }

  @override
  void dispose() {
    _model.dispose();
    super.dispose();
  }

  void _setLoading(bool v) => safeSetState(() => _model.isLoading = v);

  Future<void> _register() async {
    final name = _model.nameController.text.trim();
    final email = _model.emailController.text.trim();
    final pass = _model.passwordController.text;

    if (name.isEmpty || email.isEmpty || pass.isEmpty) {
      _showError('Completá todos los campos.');
      return;
    }
    if (pass.length < 6) {
      _showError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    _setLoading(true);
    try {
      await AuthService.instance.registerWithEmail(
        name: name,
        email: email,
        password: pass,
      );
      if (mounted) context.go('/homePage');
    } on FirebaseAuthException catch (e) {
      _showError(AuthService.errorMessage(e));
    } finally {
      _setLoading(false);
    }
  }

  void _showError(String msg) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg),
      backgroundColor: const Color(0xFF2B2B2B),
    ));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _bg,
      appBar: AppBar(
        backgroundColor: _bg,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_rounded, color: Colors.white),
          onPressed: () => context.safePop(),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Center(
                child: Image.asset(
                  'assets/images/LOGO_CJC_BLANCO_(1).png',
                  height: 70,
                  fit: BoxFit.contain,
                ),
              ),
              const SizedBox(height: 28),
              Text(
                'Crear cuenta',
                textAlign: TextAlign.center,
                style: FlutterFlowTheme.of(context).headlineSmall.override(
                      fontFamily:
                          FlutterFlowTheme.of(context).headlineSmallFamily,
                      color: Colors.white,
                      fontSize: 24,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.0,
                      useGoogleFonts: !FlutterFlowTheme.of(context)
                          .headlineSmallIsCustom,
                    ),
              ),
              const SizedBox(height: 6),
              Text(
                'Únite a la familia CJC',
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
              const SizedBox(height: 32),
              _buildTextField(
                controller: _model.nameController,
                focusNode: _model.nameFocus,
                label: 'Nombre completo',
                icon: Icons.person_outline_rounded,
              ),
              const SizedBox(height: 14),
              _buildTextField(
                controller: _model.emailController,
                focusNode: _model.emailFocus,
                label: 'Email',
                icon: Icons.email_outlined,
                keyboardType: TextInputType.emailAddress,
              ),
              const SizedBox(height: 14),
              _buildTextField(
                controller: _model.passwordController,
                focusNode: _model.passwordFocus,
                label: 'Contraseña',
                icon: Icons.lock_outline_rounded,
                obscure: !_model.passwordVisible,
                suffixIcon: IconButton(
                  icon: Icon(
                    _model.passwordVisible
                        ? Icons.visibility_off_outlined
                        : Icons.visibility_outlined,
                    color: Colors.white38,
                    size: 20,
                  ),
                  onPressed: () => safeSetState(() =>
                      _model.passwordVisible = !_model.passwordVisible),
                ),
              ),
              const SizedBox(height: 28),
              SizedBox(
                height: 50,
                child: ElevatedButton(
                  onPressed: _model.isLoading ? null : _register,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _accent,
                    foregroundColor: Colors.black,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10)),
                  ),
                  child: _model.isLoading
                      ? const SizedBox(
                          height: 22,
                          width: 22,
                          child: CircularProgressIndicator(
                              strokeWidth: 2, color: Colors.black54))
                      : const Text('Registrarse',
                          style: TextStyle(
                              fontSize: 15, fontWeight: FontWeight.w700)),
                ),
              ),
              const SizedBox(height: 20),
              Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                const Text('¿Ya tenés cuenta?',
                    style: TextStyle(color: Colors.white54, fontSize: 14)),
                TextButton(
                  onPressed: () => context.safePop(),
                  child: const Text('Iniciar sesión',
                      style: TextStyle(
                          color: _accent,
                          fontSize: 14,
                          fontWeight: FontWeight.w600)),
                ),
              ]),
            ],
          ),
        ),
      ),
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
}
