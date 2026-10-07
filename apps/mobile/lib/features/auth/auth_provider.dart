import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/core/storage/secure_storage.dart';
import 'package:mobile/core/network/dio_client.dart';
import 'dart:async';

class AuthNotifier extends AsyncNotifier<bool> {
  @override
  FutureOr<bool> build() async {
    final storage = ref.watch(secureStorageHelperProvider);
    final token = await storage.getAccessToken();
    return token != null;
  }

  Future<void> login(String email, String password) async {
    state = const AsyncValue.loading();
    try {
      final dio = ref.read(dioProvider);
      final res = await dio.post('/auth/login', data: {'email': email, 'password': password});
      final access = res.data['data']['accessToken'];
      final refresh = res.data['data']['refreshToken'];
      await ref.read(secureStorageHelperProvider).saveTokens(accessToken: access, refreshToken: refresh);
      state = const AsyncValue.data(true);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> register(String fullName, String email, String password) async {
    state = const AsyncValue.loading();
    try {
      final dio = ref.read(dioProvider);
      final res = await dio.post('/auth/register', data: {'fullName': fullName, 'email': email, 'password': password});
      final access = res.data['data']['accessToken'];
      final refresh = res.data['data']['refreshToken'];
      await ref.read(secureStorageHelperProvider).saveTokens(accessToken: access, refreshToken: refresh);
      state = const AsyncValue.data(true);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> logout() async {
    try {
      await ref.read(dioProvider).post('/auth/logout');
    } catch (_) {}
    await ref.read(secureStorageHelperProvider).clearTokens();
    state = const AsyncValue.data(false);
  }
}

final authProvider = AsyncNotifierProvider<AuthNotifier, bool>(() {
  return AuthNotifier();
});
