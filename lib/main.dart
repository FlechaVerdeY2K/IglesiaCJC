import 'package:provider/provider.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_web_plugins/url_strategy.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import 'flutter_flow/flutter_flow_util.dart';
import '/backend/supabase_service.dart';
import '/backend/auth_service.dart';
import 'supabase_options.dart';
import 'index.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  GoRouter.optionURLReflectsImperativeAPIs = true;
  usePathUrlStrategy();

  await Supabase.initialize(
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
  );

  // Inicializar notificaciones locales via Realtime (no bloquea el arranque)
  SupabaseService.instance.initialize();

  // Poblar Supabase con datos iniciales si las tablas están vacías
  SupabaseService.instance.seedDatosIniciales().catchError((_) {});

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
      EquiposPageWidget.routeName: const EquiposPageWidget(),
      EventsPageWidget.routeName: const EventsPageWidget(),
    };
    final tabKeys = tabs.keys.toList();
    final selectedIndex = tabKeys.indexOf(_currentPageName);
    final currentIndex = selectedIndex >= 0 ? selectedIndex : 0;

    final isDesktop = MediaQuery.of(context).size.width >= 900;

    if (isDesktop) {
      final user = AuthService.instance.currentUser;
      return Scaffold(
        resizeToAvoidBottomInset: !widget.disableResizeToAvoidBottomInset,
        backgroundColor: const Color(0xFF080E1E),
        appBar: PreferredSize(
          preferredSize: const Size.fromHeight(80),
          child: Container(
            color: const Color(0xFF0D1628),
            padding: const EdgeInsets.symmetric(horizontal: 64, vertical: 16),
            child: Row(
              children: [
                Image.asset(
                  'assets/images/LOGO_CJC_BLANCO_(1).png',
                  height: 40,
                  fit: BoxFit.contain,
                ),
                const SizedBox(width: 14),
                const Text(
                  'Iglesia CJC',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const Spacer(),
                if (user == null)
                  ElevatedButton(
                    onPressed: () => context.pushNamed('UserLoginPage'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFE53935),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    child: const Text('Iniciar sesión', style: TextStyle(fontSize: 14)),
                  )
                else
                  Text(
                    user.email ?? '',
                    style: const TextStyle(color: Color(0xFF9C9C9C), fontSize: 13),
                  ),
              ],
            ),
          ),
        ),
        body: _currentPage ?? tabs[_currentPageName] ?? const HomePageWidget(),
      );
    }

    return Scaffold(
      resizeToAvoidBottomInset: !widget.disableResizeToAvoidBottomInset,
      body: _currentPage ?? tabs[_currentPageName] ?? const HomePageWidget(),
      bottomNavigationBar: Visibility(
        visible: responsiveVisibility(
          context: context,
          tabletLandscape: false,
          desktop: false,
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
              label: 'Calendario',
              tooltip: '',
            ),
          ],
        ),
      ),
    );
  }

  Widget _desktopNavItem(
    BuildContext context,
    String label,
    int index,
    int currentIndex,
    List<String> tabKeys,
    Map<String, Widget> tabs,
  ) {
    final isSelected = index == currentIndex;
    return InkWell(
      onTap: () => safeSetState(() {
        _currentPage = null;
        _currentPageName = tabKeys[index];
      }),
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
        decoration: isSelected
            ? const BoxDecoration(
                border: Border(
                  bottom: BorderSide(color: Color(0xFFE53935), width: 2),
                ),
              )
            : null,
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : const Color(0xFF9C9C9C),
            fontSize: 14,
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
          ),
        ),
      ),
    );
  }
}
