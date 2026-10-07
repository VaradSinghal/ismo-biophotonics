import 'package:dio/dio.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final isOfflineProvider = StateProvider<bool>((ref) => false);

Future<dynamic> fetchWithOfflineCache(
  Ref ref,
  Future<Response> Function() apiCall,
  String cacheKey,
) async {
  try {
    final res = await apiCall();
    final data = res.data['data'];
    await Hive.box('offlineCache').put(cacheKey, data);
    ref.read(isOfflineProvider.notifier).state = false;
    return data;
  } on DioException catch (e) {
    if (e.type == DioExceptionType.connectionTimeout ||
        e.type == DioExceptionType.receiveTimeout ||
        e.type == DioExceptionType.connectionError ||
        e.type == DioExceptionType.unknown) {
      final cached = Hive.box('offlineCache').get(cacheKey);
      if (cached != null) {
        ref.read(isOfflineProvider.notifier).state = true;
        return cached;
      }
    }
    rethrow;
  }
}
