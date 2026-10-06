import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../helpers/responsive.dart';

class TwColors {
  // Remapped to premium light theme
  static const ink          = Color(0xFFF3EDDF); // Background
  static const ink2         = Color(0xFFFCF6F0); // Surface
  static const paper        = Colors.black87;    // Primary Text
  static const creamDim     = Colors.black54;    // Secondary Text
  static const mute         = Colors.black38;    // Muted Text
  static const terracotta   = Color(0xFFB05130); // Accent
  static const terracottaSoft = Color(0xFFD9805F);
  static const line         = Colors.black12;    // Borders
  static const trustGreen   = Color(0xFF7A9A63);
  static const cream        = Colors.white;      // Pure white where needed
}

class TwTheme {
  static ThemeData get theme => ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    scaffoldBackgroundColor: TwColors.ink,
    colorScheme: const ColorScheme.light(
      background: TwColors.ink,
      surface: TwColors.ink2,
      primary: TwColors.terracotta,
      secondary: TwColors.terracottaSoft,
      onBackground: TwColors.paper,
      onSurface: TwColors.paper,
    ),
    textTheme: GoogleFonts.interTightTextTheme(
      const TextTheme(
        bodyLarge:   TextStyle(color: TwColors.paper,    fontSize: 16),
        bodyMedium:  TextStyle(color: TwColors.creamDim, fontSize: 14),
        bodySmall:   TextStyle(color: TwColors.mute,     fontSize: 12),
        labelSmall:  TextStyle(color: TwColors.mute,     fontSize: 10,
                               letterSpacing: 1.8),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: const Color(0x0A000000), // light dark overlay for input
      hintStyle: const TextStyle(color: TwColors.mute),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: TwColors.line),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: TwColors.line),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: TwColors.terracotta, width: 1.5),
      ),
      contentPadding: EdgeInsets.symmetric(horizontal: Responsive.wp(16), vertical: Responsive.wp(14)),
    ),
    appBarTheme: AppBarTheme(
      backgroundColor: TwColors.ink,
      elevation: 0,
      titleTextStyle: TextStyle(
        color: TwColors.paper,
        fontSize: Responsive.sp(16),
        fontWeight: FontWeight.w500,
      ),
      iconTheme: const IconThemeData(color: TwColors.paper),
    ),
    dividerColor: TwColors.line,
  );
}

// Fraunces serif style helper
TextStyle fraunces({
  double size = 16,
  FontWeight weight = FontWeight.w300,
  Color color = TwColors.paper,
  bool italic = false,
  double letterSpacing = 0,
  double? height,
}) => GoogleFonts.fraunces(
  fontSize: Responsive.sp(size),
  fontWeight: weight,
  color: color,
  fontStyle: italic ? FontStyle.italic : FontStyle.normal,
  letterSpacing: letterSpacing,
  height: height,
);

// Inter Tight style helper
TextStyle interTight({
  double size = 14,
  FontWeight weight = FontWeight.w400,
  Color color = TwColors.paper,
  double letterSpacing = 0,
  double? height,
  FontStyle fontStyle = FontStyle.normal,
}) => GoogleFonts.interTight(
  fontSize: Responsive.sp(size),
  fontWeight: weight,
  color: color,
  letterSpacing: letterSpacing,
  height: height,
  fontStyle: fontStyle,
);
