import 'package:flutter/material.dart';
import 'package:mobile/theme/tw_theme.dart';
import 'package:mobile/features/dashboard/screens/dashboard_view.dart';
import 'package:mobile/features/projects/screens/projects_view.dart';
import 'package:mobile/features/tasks/screens/tasks_view.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/auth/auth_provider.dart';

class MainScreen extends ConsumerStatefulWidget {
  const MainScreen({super.key});

  @override
  ConsumerState<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends ConsumerState<MainScreen> {
  int _currentIndex = 0;
  final List<Widget> _views = const [
    DashboardView(),
    ProjectsView(),
    TasksView(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _views,
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        selectedItemColor: TwColors.terracotta,
        unselectedItemColor: TwColors.creamDim,
        backgroundColor: TwColors.ink2,
        onTap: (index) => setState(() => _currentIndex = index),
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.dashboard_outlined), label: 'Dashboard'),
          BottomNavigationBarItem(icon: Icon(Icons.folder_outlined), label: 'Projects'),
          BottomNavigationBarItem(icon: Icon(Icons.task_alt_outlined), label: 'Tasks'),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          ref.read(authProvider.notifier).logout();
        },
        backgroundColor: TwColors.terracotta,
        child: const Icon(Icons.logout, color: TwColors.cream),
      ),
    );
  }
}
