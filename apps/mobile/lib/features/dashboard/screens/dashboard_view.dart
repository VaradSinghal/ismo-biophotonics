import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/core/network/dio_client.dart';
import 'package:mobile/theme/tw_theme.dart';
import 'package:mobile/helpers/responsive.dart';

final dashboardProvider = FutureProvider.autoDispose((ref) async {
  final dio = ref.watch(dioProvider);
  final res = await dio.get('/dashboard');
  return res.data['data'];
});

class DashboardView extends ConsumerWidget {
  const DashboardView({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(dashboardProvider);

    return Scaffold(
      appBar: AppBar(title: Text('Dashboard', style: fraunces(size: 24, weight: FontWeight.w600))),
      body: RefreshIndicator(
        onRefresh: () => ref.refresh(dashboardProvider.future),
        child: state.when(
          loading: () => const Center(child: CircularProgressIndicator(color: TwColors.terracotta)),
          error: (err, st) => Center(child: Text('Failed to load: $err', style: interTight())),
          data: (data) {
            return ListView(
              padding: EdgeInsets.all(Responsive.wp(16)),
              children: [
                _buildStatCard('Total Projects', data['projects'].toString(), Icons.folder),
                _buildStatCard('Total Tasks', data['tasks'].toString(), Icons.task),
                _buildStatCard('Completed Tasks', data['completedTasks'].toString(), Icons.check_circle, TwColors.trustGreen),
                _buildStatCard('Pending Tasks', data['pendingTasks'].toString(), Icons.pending_actions),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, [Color? color]) {
    return Card(
      margin: EdgeInsets.only(bottom: Responsive.hp(16)),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: TwColors.line),
      ),
      child: Padding(
        padding: EdgeInsets.all(Responsive.wp(20)),
        child: Row(
          children: [
            Icon(icon, size: Responsive.wp(32), color: color ?? TwColors.terracottaSoft),
            SizedBox(width: Responsive.wp(16)),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: interTight(size: 14, color: TwColors.creamDim)),
                  SizedBox(height: Responsive.hp(4)),
                  Text(value, style: fraunces(size: 24, weight: FontWeight.w600)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
