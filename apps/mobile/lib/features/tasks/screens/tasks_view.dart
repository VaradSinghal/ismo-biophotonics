import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/core/network/dio_client.dart';
import 'package:mobile/core/network/offline_helper.dart';
import 'package:mobile/theme/tw_theme.dart';
import 'package:mobile/helpers/responsive.dart';
import 'package:mobile/features/dashboard/screens/dashboard_view.dart';

class TaskSearchNotifier extends Notifier<String> {
  @override
  String build() => '';
  set state(String val) => super.state = val;
}
final taskSearchProvider = NotifierProvider<TaskSearchNotifier, String>(() => TaskSearchNotifier());

class TaskStatusNotifier extends Notifier<String?> {
  @override
  String? build() => null;
  set state(String? val) => super.state = val;
}
final taskStatusProvider = NotifierProvider<TaskStatusNotifier, String?>(() => TaskStatusNotifier());

class TaskPriorityNotifier extends Notifier<String?> {
  @override
  String? build() => null;
  set state(String? val) => super.state = val;
}
final taskPriorityProvider = NotifierProvider<TaskPriorityNotifier, String?>(() => TaskPriorityNotifier());

final tasksProvider = FutureProvider.autoDispose((ref) async {
  final dio = ref.watch(dioProvider);
  final search = ref.watch(taskSearchProvider);
  final status = ref.watch(taskStatusProvider);
  final priority = ref.watch(taskPriorityProvider);
  
  final queryParams = <String, String>{};
  if (search.isNotEmpty) queryParams['search'] = search;
  if (status != null && status.isNotEmpty) queryParams['status'] = status;
  if (priority != null && priority.isNotEmpty) queryParams['priority'] = priority;

  final cacheKey = 'tasks_${search}_${status}_$priority';
  return fetchWithOfflineCache(ref, () => dio.get('/tasks', queryParameters: queryParams), cacheKey);
});

class TaskMutator {
  final Ref ref;
  TaskMutator(this.ref);

  Future<void> createTask(Map<String, dynamic> data) async {
    await ref.read(dioProvider).post('/tasks', data: data);
    ref.invalidate(tasksProvider);
    ref.invalidate(dashboardProvider);
  }
  Future<void> updateTask(String id, Map<String, dynamic> data) async {
    await ref.read(dioProvider).put('/tasks/$id', data: data);
    ref.invalidate(tasksProvider);
    ref.invalidate(dashboardProvider);
  }
  Future<void> deleteTask(String id) async {
    await ref.read(dioProvider).delete('/tasks/$id');
    ref.invalidate(tasksProvider);
    ref.invalidate(dashboardProvider);
  }
}
final taskMutatorProvider = Provider((ref) => TaskMutator(ref));

class TasksView extends ConsumerWidget {
  const TasksView({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(tasksProvider);
    final isOffline = ref.watch(isOfflineProvider);

    return Scaffold(
      appBar: AppBar(title: Text('Tasks', style: fraunces(size: 24, weight: FontWeight.w600))),
      floatingActionButton: isOffline ? null : FloatingActionButton(
        onPressed: () => _showTaskDialog(context, ref, null),
        backgroundColor: TwColors.terracotta,
        child: const Icon(Icons.add, color: TwColors.cream),
      ),
      body: Column(
        children: [
          Padding(
            padding: EdgeInsets.all(Responsive.wp(16)),
            child: Column(
              children: [
                TextField(
                  onChanged: (val) => ref.read(taskSearchProvider.notifier).state = val,
                  decoration: const InputDecoration(
                    hintText: 'Search tasks...',
                    prefixIcon: Icon(Icons.search),
                  ),
                ),
                SizedBox(height: Responsive.hp(8)),
                Row(
                  children: [
                    Expanded(
                      child: DropdownButtonFormField<String?>(
                        value: ref.watch(taskStatusProvider),
                        decoration: const InputDecoration(hintText: 'Status'),
                        items: const [
                          DropdownMenuItem(value: null, child: Text('All')),
                          DropdownMenuItem(value: 'PENDING', child: Text('Pending')),
                          DropdownMenuItem(value: 'IN_PROGRESS', child: Text('In Progress')),
                          DropdownMenuItem(value: 'COMPLETED', child: Text('Completed')),
                        ],
                        onChanged: (val) => ref.read(taskStatusProvider.notifier).state = val,
                      ),
                    ),
                    SizedBox(width: Responsive.wp(8)),
                    Expanded(
                      child: DropdownButtonFormField<String?>(
                        value: ref.watch(taskPriorityProvider),
                        decoration: const InputDecoration(hintText: 'Priority'),
                        items: const [
                          DropdownMenuItem(value: null, child: Text('All')),
                          DropdownMenuItem(value: 'LOW', child: Text('Low')),
                          DropdownMenuItem(value: 'MEDIUM', child: Text('Medium')),
                          DropdownMenuItem(value: 'HIGH', child: Text('High')),
                        ],
                        onChanged: (val) => ref.read(taskPriorityProvider.notifier).state = val,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          Expanded(
            child: RefreshIndicator(
              onRefresh: () => ref.refresh(tasksProvider.future),
              child: state.when(
                loading: () => const Center(child: CircularProgressIndicator(color: TwColors.terracotta)),
                error: (err, st) => ListView(children: [Center(child: Text('Error: $err'))]),
                data: (data) {
                  final List tasks = data as List;
                  if (tasks.isEmpty) return const Center(child: Text('No tasks found.'));
                  return ListView.builder(
                    padding: EdgeInsets.all(Responsive.wp(16)),
                    itemCount: tasks.length,
                    itemBuilder: (context, i) {
                      final t = tasks[i];
                      return Card(
                        margin: EdgeInsets.only(bottom: Responsive.hp(12)),
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                          side: const BorderSide(color: TwColors.line),
                        ),
                        child: ListTile(
                          contentPadding: EdgeInsets.all(Responsive.wp(16)),
                          title: Text(t['name'], style: interTight(size: 16, weight: FontWeight.w600)),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              SizedBox(height: Responsive.hp(4)),
                              Text(t['description'] ?? '', style: interTight(size: 14, color: TwColors.creamDim)),
                              SizedBox(height: Responsive.hp(8)),
                              Row(
                                children: [
                                  Chip(
                                    label: Text(t['status'], style: const TextStyle(fontSize: 10)),
                                    backgroundColor: TwColors.ink2,
                                    side: BorderSide.none,
                                  ),
                                  const SizedBox(width: 8),
                                  Chip(
                                    label: Text(t['priority'], style: const TextStyle(fontSize: 10)),
                                    backgroundColor: TwColors.ink2,
                                    side: BorderSide.none,
                                  ),
                                ],
                              )
                            ],
                          ),
                          trailing: isOffline ? null : IconButton(
                            icon: const Icon(Icons.edit, size: 20, color: TwColors.mute),
                            onPressed: () => _showTaskDialog(context, ref, t),
                          ),
                        ),
                      );
                    },
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showTaskDialog(BuildContext context, WidgetRef ref, Map<String, dynamic>? task) {
    showDialog(
      context: context,
      builder: (ctx) => _TaskDialog(task: task, ref: ref),
    );
  }
}

class _TaskDialog extends StatefulWidget {
  final Map<String, dynamic>? task;
  final WidgetRef ref;
  const _TaskDialog({this.task, required this.ref});

  @override
  _TaskDialogState createState() => _TaskDialogState();
}

class _TaskDialogState extends State<_TaskDialog> {
  final _name = TextEditingController();
  final _desc = TextEditingController();
  String _status = 'PENDING';
  String _priority = 'MEDIUM';
  String? _projectId;
  List<dynamic> _projects = [];

  @override
  void initState() {
    super.initState();
    if (widget.task != null) {
      _name.text = widget.task!['name'];
      _desc.text = widget.task!['description'] ?? '';
      _status = widget.task!['status'];
      _priority = widget.task!['priority'];
      _projectId = widget.task!['projectId'];
    }
    _loadProjects();
  }

  Future<void> _loadProjects() async {
    try {
      final dio = widget.ref.read(dioProvider);
      final res = await dio.get('/projects');
      if (!mounted) return;
      setState(() {
        _projects = res.data['data'];
        if (_projectId == null && _projects.isNotEmpty) {
          _projectId = _projects.first['id'];
        }
      });
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(widget.task == null ? 'New Task' : 'Edit Task'),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: _name, decoration: const InputDecoration(labelText: 'Name')),
            const SizedBox(height: 8),
            TextField(controller: _desc, decoration: const InputDecoration(labelText: 'Description')),
            const SizedBox(height: 8),
            if (widget.task == null && _projects.isNotEmpty)
              DropdownButtonFormField<String>(
                value: _projectId,
                items: _projects.map((p) => DropdownMenuItem<String>(value: p['id'], child: Text(p['name']))).toList(),
                onChanged: (v) => setState(() => _projectId = v),
                decoration: const InputDecoration(labelText: 'Project'),
              ),
            const SizedBox(height: 8),
            DropdownButtonFormField<String>(
              value: _status,
              items: ['PENDING', 'IN_PROGRESS', 'COMPLETED'].map((s) => DropdownMenuItem(value: s, child: Text(s))).toList(),
              onChanged: (v) => setState(() => _status = v!),
              decoration: const InputDecoration(labelText: 'Status'),
            ),
            const SizedBox(height: 8),
            DropdownButtonFormField<String>(
              value: _priority,
              items: ['LOW', 'MEDIUM', 'HIGH'].map((s) => DropdownMenuItem(value: s, child: Text(s))).toList(),
              onChanged: (v) => setState(() => _priority = v!),
              decoration: const InputDecoration(labelText: 'Priority'),
            ),
          ],
        ),
      ),
      actions: [
        if (widget.task != null)
          TextButton(
            onPressed: () async {
              await widget.ref.read(taskMutatorProvider).deleteTask(widget.task!['id']);
              if (!context.mounted) return;
              Navigator.pop(context);
            },
            child: const Text('Delete', style: TextStyle(color: Colors.red)),
          ),
        TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
        ElevatedButton(
          style: ElevatedButton.styleFrom(backgroundColor: TwColors.terracotta, foregroundColor: Colors.white),
          onPressed: () async {
            final Map<String, dynamic> data = {
              'name': _name.text,
              'description': _desc.text,
              'status': _status,
              'priority': _priority,
            };
            if (widget.task == null) {
              if (_projectId != null) data['projectId'] = _projectId!;
              await widget.ref.read(taskMutatorProvider).createTask(data);
            } else {
              await widget.ref.read(taskMutatorProvider).updateTask(widget.task!['id'], data);
            }
            if (!context.mounted) return;
            Navigator.pop(context);
          },
          child: const Text('Save'),
        )
      ],
    );
  }
}
