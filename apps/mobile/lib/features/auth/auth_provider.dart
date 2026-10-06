import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/core/storage/secure_storage.dart';
import 'package:mobile/core/network/dio_client.dart';

class AuthNotifier extends StateNotifier<AsyncValue<bool>> {
  final Ref _ref;

  AuthNotifier(this._ref) : super(const AsyncValue.loading()) {
    _init();
  }

  Future<void> _init() async {
    final storage = _ref.read(secureStorageHelperProvider);
    final token = await storage.getAccessToken();
    if (token != null) {
      state = const AsyncValue.data(true);
    } else {
      state = const AsyncValue.data(false);
    }
  }

  Future<void> login(String email, String password) async {
    state = const AsyncValue.loading();
    try {
      final dio = _ref.read(dioProvider);
      final res = await dio.post('/auth/login', data: {'email': email, 'password': password});
      final access = res.data['data']['accessToken'];
      final refresh = res.data['data']['refreshToken'];
      await _ref.read(secureStorageHelperProvider).saveTokens(accessToken: access, refreshToken: refresh);
      state = const AsyncValue.data(true);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> logout() async {
    try {
      await _ref.read(dioProvider).post('/auth/logout');
    } catch (_) {}
    await _ref.read(secureStorageHelperProvider).clearTokens();
    state = const AsyncValue.data(false);
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AsyncValue<bool>>((ref) {
  return AuthNotifier(ref);
});
