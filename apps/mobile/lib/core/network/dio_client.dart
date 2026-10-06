import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'secure_storage.dart';

final dioProvider = Provider<Dio>((ref) {
  final dio = Dio(BaseOptions(
    baseUrl: const String.fromEnvironment('API_BASE_URL', defaultValue: 'http://10.0.2.2:3000/api'),
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
    headers: {
      'X-Client': 'mobile',
      'Content-Type': 'application/json',
    },
  ));

  dio.interceptors.add(InterceptorsWrapper(
    onRequest: (options, handler) async {
      final storage = ref.read(secureStorageHelperProvider);
      final accessToken = await storage.getAccessToken();
      if (accessToken != null && !options.path.contains('/auth/login') && !options.path.contains('/auth/register')) {
        options.headers['Authorization'] = 'Bearer $accessToken';
      }
      return handler.next(options);
    },
    onError: (DioException error, handler) async {
      if (error.response?.statusCode == 401 && !error.requestOptions.path.contains('/auth/refresh') && !error.requestOptions.path.contains('/auth/login')) {
        // Attempt refresh
        final storage = ref.read(secureStorageHelperProvider);
        final refreshToken = await storage.getRefreshToken();
        
        if (refreshToken != null) {
          try {
            final refreshDio = Dio(BaseOptions(baseUrl: dio.options.baseUrl, headers: {'X-Client': 'mobile'}));
            final res = await refreshDio.post('/auth/refresh', data: {'refreshToken': refreshToken});
            if (res.statusCode == 200) {
              final newAccess = res.data['data']['accessToken'];
              final newRefresh = res.data['data']['refreshToken'];
              await storage.saveTokens(accessToken: newAccess, refreshToken: newRefresh);
              
              // Retry original request
              error.requestOptions.headers['Authorization'] = 'Bearer $newAccess';
              final retryRes = await refreshDio.request(
                error.requestOptions.path,
                options: Options(
                  method: error.requestOptions.method,
                  headers: error.requestOptions.headers,
                ),
                data: error.requestOptions.data,
                queryParameters: error.requestOptions.queryParameters,
              );
              return handler.resolve(retryRes);
            }
          } catch (e) {
            await storage.clearTokens();
            // In a real app we'd dispatch a logout event here
          }
        }
      }
      return handler.next(error);
    }
  ));

  return dio;
});
