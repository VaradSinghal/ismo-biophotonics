import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';
import 'theme/tw_theme.dart';
import 'router.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  
  await Hive.initFlutter();
  await Hive.openBox('offlineCache');

  runApp(
    const ProviderScope(
      child: MyApp(),
    ),
  );
}

final scaffoldMessengerKey = GlobalKey<ScaffoldMessengerState>();

class MyApp extends ConsumerWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);
    return MaterialApp.router(
      scaffoldMessengerKey: scaffoldMessengerKey,
      title: 'ProjectFlow',
      theme: TwTheme.theme,
      routerConfig: router,
      debugShowCheckedModeBanner: false,
    );
  }
}
