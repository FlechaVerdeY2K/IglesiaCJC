import '/flutter_flow/flutter_flow_util.dart';
import 'user_register_page_widget.dart' show UserRegisterPageWidget;
import 'package:flutter/material.dart';

class UserRegisterPageModel extends FlutterFlowModel<UserRegisterPageWidget> {
  final nameController = TextEditingController();
  final emailController = TextEditingController();
  final passwordController = TextEditingController();
  final nameFocus = FocusNode();
  final emailFocus = FocusNode();
  final passwordFocus = FocusNode();
  bool passwordVisible = false;
  bool isLoading = false;

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {
    nameController.dispose();
    emailController.dispose();
    passwordController.dispose();
    nameFocus.dispose();
    emailFocus.dispose();
    passwordFocus.dispose();
  }
}
