import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../auth_provider.dart';
import 'package:mobile/theme/tw_theme.dart';
import 'package:mobile/helpers/responsive.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _fullName = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();

  @override
  void dispose() {
    _fullName.dispose();
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
          child: SingleChildScrollView(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                SizedBox(height: Responsive.hp(48)),
                Icon(Icons.dashboard_rounded, size: Responsive.wp(64), color: TwColors.terracotta),
                SizedBox(height: Responsive.hp(24)),
                Text('ProjectFlow', textAlign: TextAlign.center, style: fraunces(size: 32, weight: FontWeight.w600)),
                SizedBox(height: Responsive.hp(8)),
                Text('Create a new account', textAlign: TextAlign.center, style: interTight(size: 16, color: TwColors.creamDim)),
                SizedBox(height: Responsive.hp(48)),
                TextField(
                  controller: _fullName,
                  decoration: const InputDecoration(hintText: 'Full Name'),
                ),
                SizedBox(height: Responsive.hp(16)),
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
                          ref.read(authProvider.notifier).register(_fullName.text, _email.text, _password.text);
                        },
                  child: authState.isLoading 
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: TwColors.cream, strokeWidth: 2))
                      : Text('Sign Up', style: interTight(size: 16, weight: FontWeight.w600, color: TwColors.cream)),
                ),
                if (authState.hasError) ...[
                  SizedBox(height: Responsive.hp(16)),
                  Text('Registration failed. Please check your inputs.', textAlign: TextAlign.center, style: interTight(size: 14, color: Colors.red)),
                ],
                SizedBox(height: Responsive.hp(16)),
                TextButton(
                  onPressed: () => context.push('/login'),
                  child: Text("Already have an account? Sign In", style: interTight(size: 14, color: TwColors.terracotta)),
                ),
                SizedBox(height: Responsive.hp(48)),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
