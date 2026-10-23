package com.stark.jarvis.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.stark.jarvis.ui.theme.StarkBlue
import com.stark.jarvis.ui.theme.StarkCyan
import com.stark.jarvis.ui.theme.StarkGold

@Composable
fun ArcReactor(
    size: Dp = 100.dp,
    modifier: Modifier = Modifier
) {
    val infiniteTransition = rememberInfiniteTransition(label = "ArcReactorTransition")

    // Clockwise Outer Ring Rotation
    val outerRotation by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 8000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "outerRingRotation"
    )

    // Counter-Clockwise Inner Ring Rotation
    val innerRotation by infiniteTransition.animateFloat(
        initialValue = 360f,
        targetValue = 0f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 5000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "innerRingRotation"
    )

    // Pulsing Core Aura
    val corePulse by infiniteTransition.animateFloat(
        initialValue = 0.85f,
        targetValue = 1.15f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 1800, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "corePulse"
    )

    Box(
        contentAlignment = Alignment.Center,
        modifier = modifier.size(size)
    ) {
        Canvas(modifier = Modifier.size(size)) {
            val center = Offset(size.toPx() / 2f, size.toPx() / 2f)
            val maxRadius = size.toPx() / 2f - 4.dp.toPx()

            // 1. Rotating Outer Dashed Ring
            rotate(outerRotation, pivot = center) {
                drawCircle(
                    color = StarkCyan.copy(alpha = 0.6f),
                    radius = maxRadius,
                    center = center,
                    style = Stroke(
                        width = 2.dp.toPx(),
                        pathEffect = PathEffect.dashPathEffect(floatArrayOf(20f, 15f), 0f)
                    )
                )
            }

            // 2. Rotating Inner Ring with Multi-segment accent
            rotate(innerRotation, pivot = center) {
                drawCircle(
                    color = StarkBlue.copy(alpha = 0.5f),
                    radius = maxRadius * 0.72f,
                    center = center,
                    style = Stroke(
                        width = 2.dp.toPx(),
                        pathEffect = PathEffect.dashPathEffect(floatArrayOf(30f, 10f), 0f)
                    )
                )
            }

            // 3. Middle Glow Ring
            drawCircle(
                color = StarkGold.copy(alpha = 0.35f),
                radius = maxRadius * 0.48f,
                center = center,
                style = Stroke(width = 1.5.dp.toPx())
            )

            // 4. Pulsing High-Energy Arc Reactor Core
            val coreRadius = maxRadius * 0.32f * corePulse
            drawCircle(
                color = StarkCyan.copy(alpha = 0.25f),
                radius = coreRadius * 1.5f,
                center = center
            )
            drawCircle(
                color = StarkCyan,
                radius = coreRadius,
                center = center
            )
            drawCircle(
                color = Color.White,
                radius = coreRadius * 0.45f,
                center = center
            )
        }
    }
}
