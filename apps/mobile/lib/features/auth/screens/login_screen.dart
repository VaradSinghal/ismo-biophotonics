import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../auth_provider.dart';
import 'package:mobile/theme/tw_theme.dart';
import 'package:mobile/helpers/responsive.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _email = TextEditingController();
  final _password = TextEditingController();

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: Responsive.wp(24)),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Icon(Icons.dashboard_rounded, size: Responsive.wp(64), color: TwColors.terracotta),
              SizedBox(height: Responsive.hp(24)),
              Text('ProjectFlow', textAlign: TextAlign.center, style: fraunces(size: 32, weight: FontWeight.w600)),
              SizedBox(height: Responsive.hp(8)),
              Text('Sign in to your account', textAlign: TextAlign.center, style: interTight(size: 16, color: TwColors.creamDim)),
              SizedBox(height: Responsive.hp(48)),
              TextField(
                controller: _email,
                keyboardType: TextInputType.emailAddress,
                decoration: const InputDecoration(hintText: 'Email Address'),
              ),
              SizedBox(height: Responsive.hp(16)),
              TextField(
                controller: _password,
                obscureText: true,
                decoration: const InputDecoration(hintText: 'Password'),
              ),
              SizedBox(height: Responsive.hp(32)),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: TwColors.terracotta,
                  foregroundColor: TwColors.cream,
                  padding: EdgeInsets.symmetric(vertical: Responsive.hp(16)),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                onPressed: authState.isLoading
                    ? null
                    : () {
                        ref.read(authProvider.notifier).login(_email.text, _password.text);
                      },
                child: authState.isLoading 
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: TwColors.cream, strokeWidth: 2))
                    : Text('Sign In', style: interTight(size: 16, weight: FontWeight.w600, color: TwColors.cream)),
              ),
              if (authState.hasError) ...[
                SizedBox(height: Responsive.hp(16)),
                Text('Authentication failed. Please check your credentials.', textAlign: TextAlign.center, style: interTight(size: 14, color: Colors.red)),
              ],
              SizedBox(height: Responsive.hp(16)),
              TextButton(
                onPressed: () => context.push('/register'),
                child: Text("Don't have an account? Sign up", style: interTight(size: 14, color: TwColors.terracotta)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
