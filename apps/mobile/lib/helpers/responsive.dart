import 'dart:ui';

class Responsive {
  static double get screenWidth {
    final view = PlatformDispatcher.instance.views.first;
    return view.physicalSize.width / view.devicePixelRatio;
  }

  static double get screenHeight {
    final view = PlatformDispatcher.instance.views.first;
    return view.physicalSize.height / view.devicePixelRatio;
  }

  static double wp(double pixels) => (pixels / 375.0) * screenWidth;
  static double hp(double pixels) => (pixels / 812.0) * screenHeight;
  static double sp(double pixels) => (pixels / 375.0) * screenWidth;
}
