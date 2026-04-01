import 'dart:async';

import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '/main.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';

import '/index.dart';

export 'package:go_router/go_router.dart';
export 'serialization_util.dart';

const kTransitionInfoKey = '__transition_info__';

GlobalKey<NavigatorState> appNavigatorKey = GlobalKey<NavigatorState>();

class AppStateNotifier extends ChangeNotifier {
  AppStateNotifier._();

  static AppStateNotifier? _instance;
  static AppStateNotifier get instance => _instance ??= AppStateNotifier._();

  bool showSplashImage = true;
  bool _isLoggedIn = FirebaseAuth.instance.currentUser != null;
  bool get isLoggedIn => _isLoggedIn;

  StreamSubscription<User?>? _authSubscription;

  void listenToAuthChanges() {
    _authSubscription ??= FirebaseAuth.instance.authStateChanges().listen((user) {
      _isLoggedIn = user != null;
      notifyListeners();
    });
  }

  void stopShowingSplashImage() {
    showSplashImage = false;
    notifyListeners();
  }

  @override
  void dispose() {
    _authSubscription?.cancel();
    super.dispose();
  }
}

GoRouter createRouter(AppStateNotifier appStateNotifier) => GoRouter(
      initialLocation: '/',
      debugLogDiagnostics: true,
      refreshListenable: appStateNotifier,
      navigatorKey: appNavigatorKey,
      errorBuilder: (context, state) => appStateNotifier.showSplashImage
          ? Builder(
              builder: (context) => Container(
                color: FlutterFlowTheme.of(context).primary,
                child: Center(
                  child: Image.asset(
                    'assets/images/LOGO_CJC_BLANCO_(1).png',
                    width: MediaQuery.sizeOf(context).width * 1.0,
                    height: MediaQuery.sizeOf(context).height * 0.5,
                    fit: BoxFit.contain,
                  ),
                ),
              ),
            )
          : NavBarPage(),
      routes: [
        FFRoute(
          name: '_initialize',
          path: '/',
          builder: (context, _) => appStateNotifier.showSplashImage
              ? Builder(
                  builder: (context) => Container(
                    color: FlutterFlowTheme.of(context).primary,
                    child: Center(
                      child: Image.asset(
                        'assets/images/LOGO_CJC_BLANCO_(1).png',
                        width: MediaQuery.sizeOf(context).width * 1.0,
                        height: MediaQuery.sizeOf(context).height * 0.5,
                        fit: BoxFit.contain,
                      ),
                    ),
                  ),
                )
              : NavBarPage(),
        ),
        FFRoute(
          name: HomePageWidget.routeName,
          path: HomePageWidget.routePath,
          builder: (context, params) => params.isEmpty
              ? NavBarPage(initialPage: 'HomePage')
              : HomePageWidget(),
        ),
        FFRoute(
          name: LivePageWidget.routeName,
          path: LivePageWidget.routePath,
          builder: (context, params) => LivePageWidget(),
        ),
        FFRoute(
          name: SermonPageWidget.routeName,
          path: SermonPageWidget.routePath,
          builder: (context, params) => SermonPageWidget(),
        ),
        FFRoute(
          name: EventsPageWidget.routeName,
          path: EventsPageWidget.routePath,
          builder: (context, params) => params.isEmpty
              ? NavBarPage(initialPage: EventsPageWidget.routeName)
              : EventsPageWidget(),
        ),
        FFRoute(
          name: PastoresPageWidget.routeName,
          path: PastoresPageWidget.routePath,
          builder: (context, params) => PastoresPageWidget(),
        ),
        FFRoute(
          name: EquiposPageWidget.routeName,
          path: EquiposPageWidget.routePath,
          builder: (context, params) => EquiposPageWidget(),
        ),
        FFRoute(
          name: HorariosPageWidget.routeName,
          path: HorariosPageWidget.routePath,
          builder: (context, params) => HorariosPageWidget(),
        ),
        FFRoute(
          name: ContactoPageWidget.routeName,
          path: ContactoPageWidget.routePath,
          builder: (context, params) => ContactoPageWidget(),
        ),
        FFRoute(
          name: OfrendasPageWidget.routeName,
          path: OfrendasPageWidget.routePath,
          builder: (context, params) => OfrendasPageWidget(),
        ),
        FFRoute(
          name: UbicacionPageWidget.routeName,
          path: UbicacionPageWidget.routePath,
          builder: (context, params) => params.isEmpty
              ? NavBarPage(initialPage: UbicacionPageWidget.routeName)
              : UbicacionPageWidget(),
        ),
        FFRoute(
          name: AnunciosPageWidget.routeName,
          path: AnunciosPageWidget.routePath,
          builder: (context, params) => AnunciosPageWidget(),
        ),
        FFRoute(
          name: DevocionalPageWidget.routeName,
          path: DevocionalPageWidget.routePath,
          builder: (context, params) => DevocionalPageWidget(),
        ),
        FFRoute(
          name: OracionPageWidget.routeName,
          path: OracionPageWidget.routePath,
          requireAuth: true,
          builder: (context, params) => OracionPageWidget(),
        ),
        FFRoute(
          name: GaleriaPageWidget.routeName,
          path: GaleriaPageWidget.routePath,
          builder: (context, params) => GaleriaPageWidget(),
        ),
        FFRoute(
          name: RecursosPageWidget.routeName,
          path: RecursosPageWidget.routePath,
          builder: (context, params) => RecursosPageWidget(),
        ),
        FFRoute(
          name: RegistroGpsPageWidget.routeName,
          path: RegistroGpsPageWidget.routePath,
          requireAuth: true,
          builder: (context, params) => RegistroGpsPageWidget(),
        ),
        FFRoute(
          name: CreacionGpsPageWidget.routeName,
          path: CreacionGpsPageWidget.routePath,
          requireAuth: true,
          builder: (context, params) => CreacionGpsPageWidget(),
        ),
        FFRoute(
          name: PlaylistPageWidget.routeName,
          path: PlaylistPageWidget.routePath,
          builder: (context, params) => PlaylistPageWidget(),
        ),
        FFRoute(
          name: LoginPageWidget.routeName,
          path: LoginPageWidget.routePath,
          builder: (context, params) => const LoginPageWidget(),
        ),
        FFRoute(
          name: AdminPanelPageWidget.routeName,
          path: AdminPanelPageWidget.routePath,
          builder: (context, params) => const AdminPanelPageWidget(),
        ),
        FFRoute(
          name: AdminAnunciosPageWidget.routeName,
          path: AdminAnunciosPageWidget.routePath,
          builder: (context, params) => const AdminAnunciosPageWidget(),
        ),
        FFRoute(
          name: AdminEventosPageWidget.routeName,
          path: AdminEventosPageWidget.routePath,
          builder: (context, params) => const AdminEventosPageWidget(),
        ),
        FFRoute(
          name: AdminSermonesPageWidget.routeName,
          path: AdminSermonesPageWidget.routePath,
          builder: (context, params) => const AdminSermonesPageWidget(),
        ),
        FFRoute(
          name: AdminOracionPageWidget.routeName,
          path: AdminOracionPageWidget.routePath,
          builder: (context, params) => const AdminOracionPageWidget(),
        ),
        FFRoute(
          name: AdminLivePageWidget.routeName,
          path: AdminLivePageWidget.routePath,
          builder: (context, params) => const AdminLivePageWidget(),
        ),
        FFRoute(
          name: UserLoginPageWidget.routeName,
          path: UserLoginPageWidget.routePath,
          builder: (context, params) => UserLoginPageWidget(
            next: params.getParam('next', ParamType.String),
          ),
        ),
        FFRoute(
          name: UserRegisterPageWidget.routeName,
          path: UserRegisterPageWidget.routePath,
          builder: (context, params) => const UserRegisterPageWidget(),
        ),
      ].map((r) => r.toRoute(appStateNotifier)).toList(),
    );

extension NavParamExtensions on Map<String, String?> {
  Map<String, String> get withoutNulls => Map.fromEntries(
        entries
            .where((e) => e.value != null)
            .map((e) => MapEntry(e.key, e.value!)),
      );
}

extension NavigationExtensions on BuildContext {
  void safePop() {
    // If there is only one route on the stack, navigate to the initial
    // page instead of popping.
    if (canPop()) {
      pop();
    } else {
      go('/');
    }
  }
}

extension _GoRouterStateExtensions on GoRouterState {
  Map<String, dynamic> get extraMap =>
      extra != null ? extra as Map<String, dynamic> : {};
  Map<String, dynamic> get allParams => <String, dynamic>{}
    ..addAll(pathParameters)
    ..addAll(uri.queryParameters)
    ..addAll(extraMap);
  TransitionInfo get transitionInfo => extraMap.containsKey(kTransitionInfoKey)
      ? extraMap[kTransitionInfoKey] as TransitionInfo
      : TransitionInfo.appDefault();
}

class FFParameters {
  FFParameters(this.state, [this.asyncParams = const {}]);

  final GoRouterState state;
  final Map<String, Future<dynamic> Function(String)> asyncParams;

  Map<String, dynamic> futureParamValues = {};

  // Parameters are empty if the params map is empty or if the only parameter
  // present is the special extra parameter reserved for the transition info.
  bool get isEmpty =>
      state.allParams.isEmpty ||
      (state.allParams.length == 1 &&
          state.extraMap.containsKey(kTransitionInfoKey));
  bool isAsyncParam(MapEntry<String, dynamic> param) =>
      asyncParams.containsKey(param.key) && param.value is String;
  bool get hasFutures => state.allParams.entries.any(isAsyncParam);
  Future<bool> completeFutures() => Future.wait(
        state.allParams.entries.where(isAsyncParam).map(
          (param) async {
            final doc = await asyncParams[param.key]!(param.value)
                .onError((_, __) => null);
            if (doc != null) {
              futureParamValues[param.key] = doc;
              return true;
            }
            return false;
          },
        ),
      ).onError((_, __) => [false]).then((v) => v.every((e) => e));

  dynamic getParam<T>(
    String paramName,
    ParamType type, {
    bool isList = false,
  }) {
    if (futureParamValues.containsKey(paramName)) {
      return futureParamValues[paramName];
    }
    if (!state.allParams.containsKey(paramName)) {
      return null;
    }
    final param = state.allParams[paramName];
    // Got parameter from `extras`, so just directly return it.
    if (param is! String) {
      return param;
    }
    // Return serialized value.
    return deserializeParam<T>(
      param,
      type,
      isList,
    );
  }
}

class FFRoute {
  const FFRoute({
    required this.name,
    required this.path,
    required this.builder,
    this.requireAuth = false,
    this.asyncParams = const {},
    this.routes = const [],
  });

  final String name;
  final String path;
  final bool requireAuth;
  final Map<String, Future<dynamic> Function(String)> asyncParams;
  final Widget Function(BuildContext, FFParameters) builder;
  final List<GoRoute> routes;

  GoRoute toRoute(AppStateNotifier appStateNotifier) => GoRoute(
        name: name,
        path: path,
        redirect: requireAuth
            ? (context, state) {
                if (!appStateNotifier.isLoggedIn) {
                  return '${UserLoginPageWidget.routePath}?next=${Uri.encodeComponent(state.uri.toString())}';
                }
                return null;
              }
            : null,
        pageBuilder: (context, state) {
          fixStatusBarOniOS16AndBelow(context);
          final ffParams = FFParameters(state, asyncParams);
          final page = ffParams.hasFutures
              ? FutureBuilder(
                  future: ffParams.completeFutures(),
                  builder: (context, _) => builder(context, ffParams),
                )
              : builder(context, ffParams);
          final child = page;

          final transitionInfo = state.transitionInfo;
          return transitionInfo.hasTransition
              ? CustomTransitionPage(
                  key: state.pageKey,
                  name: state.name,
                  child: child,
                  transitionDuration: transitionInfo.duration,
                  transitionsBuilder:
                      (context, animation, secondaryAnimation, child) =>
                          PageTransition(
                    type: transitionInfo.transitionType,
                    duration: transitionInfo.duration,
                    reverseDuration: transitionInfo.duration,
                    alignment: transitionInfo.alignment,
                    child: child,
                  ).buildTransitions(
                    context,
                    animation,
                    secondaryAnimation,
                    child,
                  ),
                )
              : MaterialPage(
                  key: state.pageKey, name: state.name, child: child);
        },
        routes: routes,
      );
}

class TransitionInfo {
  const TransitionInfo({
    required this.hasTransition,
    this.transitionType = PageTransitionType.fade,
    this.duration = const Duration(milliseconds: 300),
    this.alignment,
  });

  final bool hasTransition;
  final PageTransitionType transitionType;
  final Duration duration;
  final Alignment? alignment;

  static TransitionInfo appDefault() => TransitionInfo(hasTransition: false);
}

class RootPageContext {
  const RootPageContext(this.isRootPage, [this.errorRoute]);
  final bool isRootPage;
  final String? errorRoute;

  static bool isInactiveRootPage(BuildContext context) {
    final rootPageContext = context.read<RootPageContext?>();
    final isRootPage = rootPageContext?.isRootPage ?? false;
    final location = GoRouterState.of(context).uri.toString();
    return isRootPage &&
        location != '/' &&
        location != rootPageContext?.errorRoute;
  }

  static Widget wrap(Widget child, {String? errorRoute}) => Provider.value(
        value: RootPageContext(true, errorRoute),
        child: child,
      );
}

extension GoRouterLocationExtension on GoRouter {
  String getCurrentLocation() {
    final RouteMatch lastMatch = routerDelegate.currentConfiguration.last;
    final RouteMatchList matchList = lastMatch is ImperativeRouteMatch
        ? lastMatch.matches
        : routerDelegate.currentConfiguration;
    return matchList.uri.toString();
  }
}
