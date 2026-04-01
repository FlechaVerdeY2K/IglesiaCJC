import '/flutter_flow/flutter_flow_util.dart';
import 'user_login_page_widget.dart' show UserLoginPageWidget;
import 'package:flutter/material.dart';

class UserLoginPageModel extends FlutterFlowModel<UserLoginPageWidget> {
  final emailController = TextEditingController();
  final passwordController = TextEditingController();
  final emailFocus = FocusNode();
  final passwordFocus = FocusNode();
  bool passwordVisible = false;
  bool isLoading = false;

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {
    emailController.dispose();
    passwordController.dispose();
    emailFocus.dispose();
    passwordFocus.dispose();
  }
}
