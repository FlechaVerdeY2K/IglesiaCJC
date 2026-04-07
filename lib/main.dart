import 'package:provider/provider.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_web_plugins/url_strategy.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import 'flutter_flow/flutter_flow_util.dart';
import '/backend/firebase_service.dart';
import 'firebase_options.dart';
import 'index.dart';

/// Manejar mensajes FCM cuando la app está en background/terminada.
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  GoRouter.optionURLReflectsImperativeAPIs = true;
  usePathUrlStrategy();

  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

  // Run FCM/notifications init in the background — don't block the splash
  FirebaseService.instance.initialize();

  // Poblar Firestore con datos iniciales si las colecciones están vacías
  FirebaseService.instance.seedDatosIniciales();

  await FlutterFlowTheme.initialize();

  final appState = FFAppState();
  await appState.initializePersistedState();

  runApp(ChangeNotifierProvider(
    create: (context) => appState,
    child: MyApp(),
  ));
}

class MyApp extends StatefulWidget {
  @override
  State<MyApp> createState() => _MyAppState();

  static _MyAppState of(BuildContext context) =>
      context.findAncestorStateOfType<_MyAppState>()!;
}

class MyAppScrollBehavior extends MaterialScrollBehavior {
  @override
  Set<PointerDeviceKind> get dragDevices => {
        PointerDeviceKind.touch,
        PointerDeviceKind.mouse,
      };
}

class _MyAppState extends State<MyApp> {
  ThemeMode _themeMode = FlutterFlowTheme.themeMode;

  late AppStateNotifier _appStateNotifier;
  late GoRouter _router;

  String getRoute([RouteMatch? routeMatch]) {
    final RouteMatch lastMatch =
        routeMatch ?? _router.routerDelegate.currentConfiguration.last;
    final RouteMatchList matchList = lastMatch is ImperativeRouteMatch
        ? lastMatch.matches
        : _router.routerDelegate.currentConfiguration;
    return matchList.uri.toString();
  }

  List<String> getRouteStack() =>
      _router.routerDelegate.currentConfiguration.matches
          .map((e) => getRoute(e))
          .toList();

  @override
  void initState() {
    super.initState();

    _appStateNotifier = AppStateNotifier.instance;
    _appStateNotifier.listenToAuthChanges();
    _router = createRouter(_appStateNotifier);

    Future.delayed(Duration(milliseconds: 200),
        () => safeSetState(() => _appStateNotifier.stopShowingSplashImage()));
  }

  void setThemeMode(ThemeMode mode) => safeSetState(() {
        _themeMode = mode;
        FlutterFlowTheme.saveThemeMode(mode);
      });

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      debugShowCheckedModeBanner: false,
      title: 'Iglesia CJC',
      scrollBehavior: MyAppScrollBehavior(),
      localizationsDelegates: [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [Locale('en', '')],
      theme: ThemeData(
        brightness: Brightness.light,
        useMaterial3: false,
      ),
      darkTheme: ThemeData(
        brightness: Brightness.dark,
        useMaterial3: false,
      ),
      themeMode: _themeMode,
      routerConfig: _router,
    );
  }
}

class NavBarPage extends StatefulWidget {
  NavBarPage({
    Key? key,
    this.initialPage,
    this.page,
    this.disableResizeToAvoidBottomInset = false,
  }) : super(key: key);

  final String? initialPage;
  final Widget? page;
  final bool disableResizeToAvoidBottomInset;

  @override
  _NavBarPageState createState() => _NavBarPageState();
}

class _NavBarPageState extends State<NavBarPage> {
  String _currentPageName = HomePageWidget.routeName;
  late Widget? _currentPage;

  @override
  void initState() {
    super.initState();
    _currentPageName = widget.initialPage ?? _currentPageName;
    _currentPage = widget.page;
  }

  @override
  Widget build(BuildContext context) {
    final tabs = {
      HomePageWidget.routeName: const HomePageWidget(),
      UbicacionPageWidget.routeName: const UbicacionPageWidget(),
      EventsPageWidget.routeName: const EventsPageWidget(),
    };
    final tabKeys = tabs.keys.toList();
    final selectedIndex = tabKeys.indexOf(_currentPageName);
    final currentIndex = selectedIndex >= 0 ? selectedIndex : 0;

    return Scaffold(
      resizeToAvoidBottomInset: !widget.disableResizeToAvoidBottomInset,
      body: _currentPage ?? tabs[_currentPageName] ?? const HomePageWidget(),
      bottomNavigationBar: Visibility(
        visible: responsiveVisibility(
          context: context,
          tabletLandscape: false,
        ),
        child: BottomNavigationBar(
          currentIndex: currentIndex,
          onTap: (i) => safeSetState(() {
            _currentPage = null;
            _currentPageName = tabKeys[i];
          }),
          backgroundColor: const Color(0xFF0D1628),
          selectedItemColor: Colors.white,
          unselectedItemColor: const Color(0xFF9C9C9C),
          selectedFontSize: 12.0,
          unselectedFontSize: 12.0,
          showSelectedLabels: true,
          showUnselectedLabels: true,
          type: BottomNavigationBarType.fixed,
          items: const <BottomNavigationBarItem>[
            BottomNavigationBarItem(
              icon: Icon(Icons.home_outlined, size: 26.0),
              activeIcon: Icon(Icons.home_rounded, size: 26.0),
              label: 'Casa CJC',
              tooltip: '',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.groups_2_outlined, size: 26.0),
              activeIcon: Icon(Icons.groups_2_rounded, size: 26.0),
              label: 'GPS',
              tooltip: '',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.calendar_today_outlined, size: 24.0),
              activeIcon: Icon(Icons.calendar_month_rounded, size: 24.0),
              label: 'Calendario CJC',
              tooltip: '',
            ),
          ],
        ),
      ),
    );
  }
}
