package com.example.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val BentoDarkColorScheme = darkColorScheme(
    primary = BentoAccentBlue,
    onPrimary = BentoOnAccentBlue,
    primaryContainer = BentoSecondarySlate,
    onPrimaryContainer = BentoAccentBlue,
    secondary = BentoCoralAdv,
    onSecondary = Color(0xFF561E1A),
    secondaryContainer = BentoSurfaceSubtleDark,
    onSecondaryContainer = BentoCoralAdv,
    tertiary = BentoGoldIITian,
    onTertiary = Color.Black,
    tertiaryContainer = Color(0xFF3E3005),
    onTertiaryContainer = BentoGoldIITian,
    background = BentoBackgroundDark,
    onBackground = BentoTextPrimaryDark,
    surface = BentoSurfaceDark,
    onSurface = BentoTextPrimaryDark,
    surfaceVariant = BentoSurfaceSubtleDark,
    onSurfaceVariant = BentoTextSecondaryDark,
    outline = BentoBorderDark,
    error = BentoCoralAdv,
    onError = Color.Black
)

val BentoLightColorScheme = lightColorScheme(
    primary = BentoAccentBlueLight,
    onPrimary = BentoOnAccentBlueLight,
    primaryContainer = BentoSecondarySlateLight,
    onPrimaryContainer = BentoAccentBlueLight,
    secondary = Color(0xFFBA1A1A),
    onSecondary = Color.White,
    secondaryContainer = Color(0xFFFFDAD6),
    onSecondaryContainer = Color(0xFF410002),
    tertiary = RichGold,
    onTertiary = Color.White,
    tertiaryContainer = Color(0xFFFFE082),
    onTertiaryContainer = Color(0xFF241A00),
    background = BentoBackgroundLight,
    onBackground = BentoTextPrimaryLight,
    surface = BentoSurfaceLight,
    onSurface = BentoTextPrimaryLight,
    surfaceVariant = BentoSurfaceSubtleLight,
    onSurfaceVariant = BentoTextSecondaryLight,
    outline = BentoBorderLight,
    error = Color(0xFFBA1A1A),
    onError = Color.White
)

@Composable
fun RankifyTheme(
    darkTheme: Boolean = true,
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) BentoDarkColorScheme else BentoLightColorScheme
    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
