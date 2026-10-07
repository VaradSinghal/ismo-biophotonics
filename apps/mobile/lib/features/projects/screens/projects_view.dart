import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/core/network/dio_client.dart';
import 'package:mobile/core/network/offline_helper.dart';
import 'package:mobile/theme/tw_theme.dart';
import 'package:mobile/helpers/responsive.dart';

final projectsProvider = FutureProvider.autoDispose((ref) async {
  final dio = ref.watch(dioProvider);
  return fetchWithOfflineCache(ref, () => dio.get('/projects'), 'projects');
});

class ProjectsView extends ConsumerWidget {
  const ProjectsView({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(projectsProvider);

    return Scaffold(
      appBar: AppBar(title: Text('Projects', style: fraunces(size: 24, weight: FontWeight.w600))),
      body: RefreshIndicator(
        onRefresh: () => ref.refresh(projectsProvider.future),
        child: state.when(
          loading: () => const Center(child: CircularProgressIndicator(color: TwColors.terracotta)),
          error: (err, st) => ListView(children: [Center(child: Text('Error: $err'))]),
          data: (data) {
            final List projects = data as List;
            if (projects.isEmpty) return const Center(child: Text('No projects found.'));
            return ListView.builder(
              padding: EdgeInsets.all(Responsive.wp(16)),
              itemCount: projects.length,
              itemBuilder: (context, i) {
                final p = projects[i];
                return Card(
                  margin: EdgeInsets.only(bottom: Responsive.hp(12)),
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                    side: const BorderSide(color: TwColors.line),
                  ),
                  child: ListTile(
                    contentPadding: EdgeInsets.all(Responsive.wp(16)),
                    title: Text(p['name'], style: interTight(size: 16, weight: FontWeight.w600)),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        SizedBox(height: Responsive.hp(8)),
                        Text(p['description'] ?? '', style: interTight(size: 14, color: TwColors.creamDim)),
                        SizedBox(height: Responsive.hp(8)),
                        Row(
                          children: [
                            const Icon(Icons.check_circle, size: 16, color: TwColors.trustGreen),
                            const SizedBox(width: 4),
                            Text('${p['completedTaskCount'] ?? 0} Completed', style: interTight(size: 12)),
                          ],
                        )
                      ],
                    ),
                    trailing: Chip(
                      label: Text(p['status'].toString().replaceAll('_', ' '), style: const TextStyle(fontSize: 10)),
                      backgroundColor: TwColors.ink2,
                      side: BorderSide.none,
                    ),
                  ),
                );
              },
            );
          },
        ),
      ),
    );
  }
}
