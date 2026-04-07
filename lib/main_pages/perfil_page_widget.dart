import 'package:flutter/material.dart';
import '/backend/auth_service.dart';
import '/backend/supabase_service.dart';
import '/backend/cloudinary_service.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/main_pages/user_login_page_widget.dart';

class PerfilPageWidget extends StatefulWidget {
  const PerfilPageWidget({super.key});

  static const String routeName = 'perfilPage';
  static const String routePath = '/perfilPage';

  @override
  State<PerfilPageWidget> createState() => _PerfilPageWidgetState();
}

class _PerfilPageWidgetState extends State<PerfilPageWidget> {
  static const _bg       = Color(0xFF080E1E);
  static const _surface  = Color(0xFF0F1C30);
  static const _border   = Color(0xFF1E2E4A);
  static const _accent   = Color(0xFFBF1E2E);
  static const _accentDk = Color(0xFF8B1520);

  final _nameController = TextEditingController();
  bool _editingName  = false;
  bool _savingName   = false;
  bool _uploadingPhoto = false;
  String? _localPhotoUrl;
  String? _localName;
  String? _localGenero; // 'M' | 'F' | null

  @override
  void initState() {
    super.initState();
    final user = AuthService.instance.currentUser;
    _nameController.text = _userName(user);
    _loadProfileFromDb();
  }

  Future<void> _loadProfileFromDb() async {
    final uid = AuthService.instance.currentUser?.id;
    if (uid == null) return;
    final profile = await SupabaseService.instance.getUserProfile(uid);
    if (!mounted) return;
    setState(() {
      if (profile['foto_url'] != null && profile['foto_url']!.isNotEmpty) {
        _localPhotoUrl = profile['foto_url'];
      }
      if (profile['nombre'] != null && profile['nombre']!.isNotEmpty) {
        _localName = profile['nombre'];
        _nameController.text = profile['nombre']!;
      }
      if (profile['genero'] != null && profile['genero']!.isNotEmpty) {
        _localGenero = profile['genero'];
      }
    });
  }

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  String _userName(dynamic user) =>
      (user?.userMetadata?['full_name'] as String?) ??
      (user?.userMetadata?['nombre']   as String?) ??
      (user?.email?.split('@').first   as String?) ?? '';

  String? _userPhoto(dynamic user) {
    final url = user?.userMetadata?['avatar_url'] as String?;
    return (url != null && url.isNotEmpty) ? url : null;
  }

  Future<void> _uploadPhoto() async {
    setState(() => _uploadingPhoto = true);
    try {
      final uid = AuthService.instance.currentUser?.id;
      if (uid == null) return;
      final url = await CloudinaryService.instance.pickAndUpload(folder: 'perfiles');
      if (url != null) {
        await SupabaseService.instance.updateUserPhoto(uid, url);
        if (mounted) setState(() => _localPhotoUrl = url);
      }
    } finally {
      if (mounted) setState(() => _uploadingPhoto = false);
    }
  }

  Future<void> _saveName() async {
    final name = _nameController.text.trim();
    if (name.isEmpty) return;
    setState(() => _savingName = true);
    try {
      final uid = AuthService.instance.currentUser?.id;
      if (uid == null) return;
      await SupabaseService.instance.updateUserName(uid, name);
      if (mounted) {
        setState(() {
          _editingName = false;
          _localName = name;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Nombre actualizado'),
            backgroundColor: _surface,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _savingName = false);
    }
  }

  Future<void> _signOut() async {
    await AuthService.instance.signOut();
    if (mounted) context.go(UserLoginPageWidget.routePath);
  }

  @override
  Widget build(BuildContext context) {
    final user     = AuthService.instance.currentUser;
    final name     = _localName    ?? _userName(user);
    final photoUrl = _localPhotoUrl ?? _userPhoto(user);
    final initials = name.trim().isEmpty
        ? '?'
        : name.trim().split(' ').take(2).map((w) => w[0].toUpperCase()).join();

    return Scaffold(
      backgroundColor: _bg,
      body: CustomScrollView(
        slivers: [
          // ── AppBar con banner degradado ──────────────────────────────────
          SliverAppBar(
            expandedHeight: 200,
            pinned: true,
            backgroundColor: _bg,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_ios_rounded, color: Colors.white),
              onPressed: () => context.canPop() ? context.pop() : context.go('/homePage'),
            ),
            title: const Text('Mi perfil',
                style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
            centerTitle: true,
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  // Fondo degradado sutil
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          _accentDk.withOpacity(0.45),
                          _bg,
                        ],
                        stops: const [0.0, 0.75],
                      ),
                    ),
                  ),
                  // Avatar centrado en el banner
                  Positioned(
                    bottom: 0,
                    left: 0,
                    right: 0,
                    child: Center(
                      child: Stack(
                        clipBehavior: Clip.none,
                        children: [
                          GestureDetector(
                            onTap: photoUrl != null
                                ? () => _showFullPhoto(context, photoUrl)
                                : null,
                            child: Container(
                              width: 100,
                              height: 100,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                border: Border.all(color: _bg, width: 4),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withOpacity(0.4),
                                    blurRadius: 12,
                                    offset: const Offset(0, 4),
                                  ),
                                ],
                              ),
                              child: ClipOval(
                                child: photoUrl != null
                                    ? Image.network(
                                        photoUrl,
                                        width: 100,
                                        height: 100,
                                        fit: BoxFit.cover,
                                        errorBuilder: (_, __, ___) =>
                                            _initialsWidget(initials, 100),
                                      )
                                    : _initialsWidget(initials, 100),
                              ),
                            ),
                          ),
                          if (_uploadingPhoto)
                            Positioned.fill(
                              child: ClipOval(
                                child: Container(
                                  color: Colors.black54,
                                  child: const Center(
                                    child: CircularProgressIndicator(
                                        color: Colors.white, strokeWidth: 2),
                                  ),
                                ),
                              ),
                            )
                          else
                            Positioned(
                              right: -2,
                              bottom: 0,
                              child: GestureDetector(
                                onTap: _uploadPhoto,
                                child: Container(
                                  padding: const EdgeInsets.all(7),
                                  decoration: BoxDecoration(
                                    color: _accent,
                                    shape: BoxShape.circle,
                                    border: Border.all(color: _bg, width: 2),
                                  ),
                                  child: const Icon(Icons.camera_alt_rounded,
                                      color: Colors.white, size: 14),
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // ── Cuerpo ───────────────────────────────────────────────────────
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(24, 20, 24, 40),
              child: Column(
                children: [
                  // Nombre y email bajo el avatar
                  Text(
                    name.isEmpty ? 'Miembro CJC' : name,
                    style: const TextStyle(
                        color: Colors.white,
                        fontSize: 22,
                        fontWeight: FontWeight.w700),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    user?.email ?? '',
                    style: const TextStyle(color: Colors.white54, fontSize: 13),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 32),

                  // ── Sección de datos ──────────────────────────────────────
                  Container(
                    decoration: BoxDecoration(
                      color: _surface,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: _border),
                    ),
                    child: Column(
                      children: [
                        // Campo nombre
                        _buildRow(
                          icon: Icons.person_outline_rounded,
                          label: 'Nombre',
                          child: _editingName
                              ? Row(
                                  children: [
                                    Expanded(
                                      child: TextField(
                                        controller: _nameController,
                                        autofocus: true,
                                        style: const TextStyle(
                                            color: Colors.white, fontSize: 15),
                                        decoration: const InputDecoration(
                                          isDense: true,
                                          border: InputBorder.none,
                                          hintText: 'Tu nombre',
                                          hintStyle:
                                              TextStyle(color: Colors.white38),
                                        ),
                                      ),
                                    ),
                                    if (_savingName)
                                      const SizedBox(
                                          width: 18,
                                          height: 18,
                                          child: CircularProgressIndicator(
                                              strokeWidth: 2, color: _accent))
                                    else ...[
                                      _iconBtn(Icons.check_rounded,
                                          const Color(0xFF40C072), _saveName),
                                      _iconBtn(
                                          Icons.close_rounded,
                                          Colors.white38,
                                          () => setState(
                                              () => _editingName = false)),
                                    ],
                                  ],
                                )
                              : Row(
                                  children: [
                                    Expanded(
                                      child: Text(
                                        name.isEmpty ? 'Sin nombre' : name,
                                        style: const TextStyle(
                                            color: Colors.white, fontSize: 15),
                                      ),
                                    ),
                                    _iconBtn(
                                        Icons.edit_rounded,
                                        Colors.white38,
                                        () => setState(
                                            () => _editingName = true)),
                                  ],
                                ),
                        ),
                        Divider(height: 1, color: _border),
                        // Campo género
                        _buildRow(
                          icon: Icons.wc_rounded,
                          label: 'Género',
                          child: Row(
                            children: [
                              _genderChip('M', 'Hermano'),
                              const SizedBox(width: 8),
                              _genderChip('F', 'Hermana'),
                            ],
                          ),
                        ),
                        Divider(height: 1, color: _border),
                        // Campo email (solo lectura)
                        _buildRow(
                          icon: Icons.mail_outline_rounded,
                          label: 'Correo electrónico',
                          child: Text(
                            user?.email ?? '',
                            style: const TextStyle(
                                color: Colors.white70, fontSize: 15),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 32),

                  // ── Cerrar sesión ─────────────────────────────────────────
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: _signOut,
                      icon: const Icon(Icons.logout_rounded, color: _accent),
                      label: const Text('Cerrar sesión',
                          style: TextStyle(
                              color: _accent,
                              fontWeight: FontWeight.w600,
                              fontSize: 15)),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 15),
                        side: const BorderSide(color: _accent),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14)),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showFullPhoto(BuildContext context, String url) {
    showDialog(
      context: context,
      barrierColor: Colors.black87,
      builder: (_) => Dialog(
        backgroundColor: Colors.transparent,
        insetPadding: const EdgeInsets.all(24),
        child: Stack(
          alignment: Alignment.center,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: Image.network(
                url,
                fit: BoxFit.contain,
                errorBuilder: (_, __, ___) => const Icon(
                    Icons.broken_image_rounded,
                    color: Colors.white54,
                    size: 64),
              ),
            ),
            Positioned(
              top: 0,
              right: 0,
              child: GestureDetector(
                onTap: () => Navigator.pop(context),
                child: Container(
                  padding: const EdgeInsets.all(6),
                  decoration: const BoxDecoration(
                    color: Colors.black54,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.close_rounded,
                      color: Colors.white, size: 20),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _iconBtn(IconData icon, Color color, VoidCallback onTap) =>
      IconButton(
        icon: Icon(icon, color: color, size: 20),
        onPressed: onTap,
        visualDensity: VisualDensity.compact,
      );

  Widget _genderChip(String value, String label) {
    final selected = _localGenero == value;
    return GestureDetector(
      onTap: () async {
        final uid = AuthService.instance.currentUser?.id;
        if (uid == null) return;
        setState(() => _localGenero = value);
        await SupabaseService.instance.updateUserGender(uid, value);
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
        decoration: BoxDecoration(
          color: selected ? _accent : _surface,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: selected ? _accent : _border,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: selected ? Colors.white : Colors.white54,
            fontSize: 13,
            fontWeight: selected ? FontWeight.w600 : FontWeight.w400,
          ),
        ),
      ),
    );
  }

  Widget _buildRow({
    required IconData icon,
    required String label,
    required Widget child,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Icon(icon, color: _accent, size: 20),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label,
                    style: const TextStyle(
                        color: Colors.white38,
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        letterSpacing: 0.8)),
                const SizedBox(height: 3),
                child,
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _initialsWidget(String initials, double size) {
    return Container(
      width: size,
      height: size,
      color: _surface,
      child: Center(
        child: Text(
          initials,
          style: TextStyle(
            color: Colors.white,
            fontSize: size * 0.33,
            fontWeight: FontWeight.w700,
            letterSpacing: 1,
          ),
        ),
      ),
    );
  }
}
