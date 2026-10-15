package com.deka.ai.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val DarkColorScheme = darkColorScheme(
    primary = DekaElectricCyan,
    secondary = DekaBlueAccent,
    tertiary = DekaPurpleGlow,
    background = DekaBackground,
    surface = DekaSurface,
    onPrimary = DekaBackground,
    onSecondary = DekaTextPrimary,
    onBackground = DekaTextPrimary,
    onSurface = DekaTextPrimary
)

@Composable
fun DEKAAITheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        typography = Typography,
        content = content
    )
}
