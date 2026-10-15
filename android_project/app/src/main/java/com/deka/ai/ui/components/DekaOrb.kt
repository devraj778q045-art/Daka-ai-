package com.deka.ai.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.deka.ai.ui.theme.DekaElectricCyan
import com.deka.ai.ui.theme.DekaBlueAccent
import com.deka.ai.ui.theme.DekaPurpleGlow
import kotlin.math.cos
import kotlin.math.sin

enum class OrbState {
    IDLE,
    LISTENING,
    THINKING,
    SPEAKING
}

@Composable
fun DekaOrb(
    state: OrbState = OrbState.IDLE,
    size: Dp = 220.dp,
    modifier: Modifier = Modifier
) {
    val infiniteTransition = rememberInfiniteTransition(label = "OrbAnimation")

    // Pulse animation
    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 0.95f,
        targetValue = if (state == OrbState.LISTENING) 1.25f else 1.08f,
        animationSpec = infiniteRepeatable(
            animation = tween(
                durationMillis = if (state == OrbState.LISTENING) 900 else 2200,
                easing = FastOutSlowInEasing
            ),
            repeatMode = RepeatMode.Reverse
        ),
        label = "PulseScale"
    )

    // Outer glow pulse
    val glowAlpha by infiniteTransition.animateFloat(
        initialValue = 0.35f,
        targetValue = if (state == OrbState.SPEAKING) 0.85f else 0.55f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 1800, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "GlowAlpha"
    )

    // Rotation for orbiting particles
    val rotation by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(
                durationMillis = if (state == OrbState.THINKING) 3000 else 9000,
                easing = LinearEasing
            ),
            repeatMode = RepeatMode.Restart
        ),
        label = "OrbitRotation"
    )

    Box(
        modifier = modifier.size(size),
        contentAlignment = Alignment.Center
    ) {
        Canvas(modifier = Modifier.size(size)) {
            val center = Offset(size.toPx() / 2, size.toPx() / 2)
            val baseRadius = (size.toPx() / 2) * 0.65f

            // 1. Ambient outer haze
            drawCircle(
                brush = Brush.radialGradient(
                    colors = listOf(
                        DekaElectricCyan.copy(alpha = 0.35f * glowAlpha),
                        DekaBlueAccent.copy(alpha = 0.15f * glowAlpha),
                        Color.Transparent
                    ),
                    center = center,
                    radius = baseRadius * 1.6f * pulseScale
                ),
                radius = baseRadius * 1.6f * pulseScale,
                center = center
            )

            // 2. Outer electric ring
            drawCircle(
                color = DekaElectricCyan.copy(alpha = 0.4f * glowAlpha),
                radius = baseRadius * 1.15f * pulseScale,
                center = center,
                style = Stroke(width = 3.dp.toPx())
            )

            // 3. Rotating energy nodes
            val numParticles = 6
            val angleStep = (2 * Math.PI / numParticles).toFloat()
            val radRotation = Math.toRadians(rotation.toDouble()).toFloat()

            for (i in 0 until numParticles) {
                val angle = radRotation + (i * angleStep)
                val orbitRadius = baseRadius * 1.15f * pulseScale
                val px = center.x + (orbitRadius * cos(angle))
                val py = center.y + (orbitRadius * sin(angle))
                drawCircle(
                    color = if (i % 2 == 0) DekaElectricCyan else DekaPurpleGlow,
                    radius = 4.dp.toPx(),
                    center = Offset(px, py)
                )
            }

            // 4. Core glowing orb body
            drawCircle(
                brush = Brush.radialGradient(
                    colors = listOf(
                        Color.White,
                        DekaElectricCyan,
                        DekaBlueAccent,
                        Color(0xFF071228)
                    ),
                    center = Offset(center.x - 15f, center.y - 15f),
                    radius = baseRadius * pulseScale
                ),
                radius = baseRadius * pulseScale,
                center = center
            )

            // 5. Specular highlight
            drawCircle(
                brush = Brush.radialGradient(
                    colors = listOf(
                        Color.White.copy(alpha = 0.75f),
                        Color.Transparent
                    ),
                    center = Offset(center.x - baseRadius * 0.3f, center.y - baseRadius * 0.35f),
                    radius = baseRadius * 0.35f
                ),
                radius = baseRadius * 0.35f,
                center = Offset(center.x - baseRadius * 0.3f, center.y - baseRadius * 0.35f)
            )
        }
    }
}
