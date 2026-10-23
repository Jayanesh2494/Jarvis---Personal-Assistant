package com.stark.jarvis.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val StarkDarkColorScheme = darkColorScheme(
    primary = StarkCyan,
    onPrimary = StarkObsidian,
    primaryContainer = StarkNavy,
    onPrimaryContainer = StarkCyan,
    secondary = StarkBlue,
    onSecondary = TextPrimary,
    background = StarkObsidian,
    onBackground = TextPrimary,
    surface = StarkCard,
    onSurface = TextPrimary,
    surfaceVariant = StarkCardHover,
    onSurfaceVariant = TextDim,
    error = StarkRed,
    onError = TextPrimary
)

@Composable
fun JarvisTheme(
    darkTheme: Boolean = true, // Always enforce Stark Industries Dark HUD theme
    content: @Composable () -> Unit
) {
    val colorScheme = StarkDarkColorScheme
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.background.toArgb()
            window.navigationBarColor = colorScheme.background.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = false
            WindowCompat.getInsetsController(window, view).isAppearanceLightNavigationBars = false
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
