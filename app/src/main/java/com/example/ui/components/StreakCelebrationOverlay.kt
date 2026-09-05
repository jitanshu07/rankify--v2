package com.example.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.*
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.scaleIn
import androidx.compose.animation.scaleOut
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.WorkspacePremium
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.ui.theme.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlin.math.abs
import kotlin.math.cos
import kotlin.math.sin
import kotlin.random.Random

private data class ConfettiPiece(
    var x: Float,
    var y: Float,
    var vx: Float,
    var vy: Float,
    var rotation: Float,
    var rotSpeed: Float,
    var flip: Float,
    var flipSpeed: Float,
    val width: Float,
    val height: Float,
    val color: Color,
    val isCircle: Boolean
)

private data class FireEmber(
    var x: Float,
    var y: Float,
    var vx: Float,
    var vy: Float,
    var radius: Float,
    var maxLife: Float,
    var life: Float,
    val color: Color
)

@Composable
fun StreakCelebrationOverlay(
    streakCount: Int,
    bestStreak: Int,
    milestoneTitle: String? = null,
    motivationalQuote: String = "",
    onDismiss: () -> Unit
) {
    // Auto-dismiss after 7 seconds if user doesn't tap
    LaunchedEffect(Unit) {
        delay(7000L)
        onDismiss()
    }

    // Animation state for continuous particle loop
    var timeElapsed by remember { mutableFloatStateOf(0f) }

    // Particle state holders
    val confettiList = remember {
        val colors = listOf(
            BentoGoldIITian,
            BentoAccentBlue,
            BentoCoralAdv,
            Color(0xFFFFD700),
            Color(0xFFFF6D00),
            Color(0xFF00E5FF),
            Color(0xFF10B981),
            Color(0xFFFF3366),
            Color(0xFFA855F7)
        )
        List(90) {
            ConfettiPiece(
                x = Random.nextFloat() * 1000f,
                y = -Random.nextFloat() * 400f,
                vx = (Random.nextFloat() - 0.5f) * 260f,
                vy = Random.nextFloat() * 320f + 160f,
                rotation = Random.nextFloat() * 360f,
                rotSpeed = (Random.nextFloat() - 0.5f) * 360f,
                flip = Random.nextFloat() * 360f,
                flipSpeed = (Random.nextFloat() - 0.5f) * 540f,
                width = Random.nextFloat() * 14f + 8f,
                height = Random.nextFloat() * 20f + 12f,
                color = colors[Random.nextInt(colors.size)],
                isCircle = Random.nextFloat() < 0.25f
            )
        }
    }

    val embersList = remember {
        val fireColors = listOf(
            Color(0xFFFFF9C4), // Bright core heat
            Color(0xFFFFD54F), // Radiant gold
            Color(0xFFFF9800), // Fiery amber
            Color(0xFFFF5722), // Blaze orange
            Color(0xFFDD2C00)  // Deep ember
        )
        List(60) {
            val maxL = Random.nextFloat() * 1.8f + 0.8f
            FireEmber(
                x = Random.nextFloat() * 1000f,
                y = 1600f + Random.nextFloat() * 400f,
                vx = (Random.nextFloat() - 0.5f) * 90f,
                vy = -(Random.nextFloat() * 280f + 140f),
                radius = Random.nextFloat() * 7f + 3f,
                maxLife = maxL,
                life = Random.nextFloat() * maxL,
                color = fireColors[Random.nextInt(fireColors.size)]
            )
        }
    }

    // Animation frame clock for smooth physics
    LaunchedEffect(Unit) {
        var lastNanos = 0L
        while (isActive) {
            withFrameNanos { nanos ->
                if (lastNanos != 0L) {
                    val dt = ((nanos - lastNanos) / 1_000_000_000f).coerceIn(0f, 0.05f)
                    timeElapsed += dt

                    // Update Confetti
                    confettiList.forEach { p ->
                        p.x += p.vx * dt
                        p.y += p.vy * dt
                        p.rotation += p.rotSpeed * dt
                        p.flip += p.flipSpeed * dt

                        // Flutter sway
                        p.vx += sin(p.y * 0.015f + p.rotation * 0.05f) * 15f * dt

                        // Reset when off bottom
                        if (p.y > 2200f) {
                            p.y = -50f - Random.nextFloat() * 100f
                            p.x = Random.nextFloat() * 1000f
                            p.vy = Random.nextFloat() * 320f + 160f
                        }
                    }

                    // Update Embers
                    embersList.forEach { e ->
                        e.life -= dt
                        e.y += e.vy * dt
                        e.x += (e.vx + sin(e.y * 0.02f) * 35f) * dt

                        if (e.life <= 0f || e.y < -50f) {
                            e.life = e.maxLife
                            e.y = 1700f + Random.nextFloat() * 300f
                            e.x = Random.nextFloat() * 1000f
                            e.vy = -(Random.nextFloat() * 280f + 140f)
                        }
                    }
                }
                lastNanos = nanos
            }
        }
    }

    // Pulsing flame effect
    val infiniteTransition = rememberInfiniteTransition(label = "flame_pulse")
    val flamePulseScale by infiniteTransition.animateFloat(
        initialValue = 0.92f,
        targetValue = 1.08f,
        animationSpec = infiniteRepeatable(
            animation = tween(650, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "flame_scale"
    )

    val haloAlpha by infiniteTransition.animateFloat(
        initialValue = 0.35f,
        targetValue = 0.75f,
        animationSpec = infiniteRepeatable(
            animation = tween(800, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "halo_alpha"
    )

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(
            usePlatformDefaultWidth = false,
            dismissOnBackPress = true,
            dismissOnClickOutside = true
        )
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Black.copy(alpha = 0.72f))
                .clickable(
                    interactionSource = remember { MutableInteractionSource() },
                    indication = null
                ) { onDismiss() }
                .testTag("streak_celebration_overlay"),
            contentAlignment = Alignment.Center
        ) {
            // Fullscreen Particle Canvas: Confetti & Fire Embers
            Canvas(modifier = Modifier.fillMaxSize()) {
                val canvasWidth = size.width
                val canvasHeight = size.height

                // 1. Draw Fiery Bottom Campfire Heat Glow
                drawCircle(
                    brush = Brush.radialGradient(
                        colors = listOf(
                            Color(0xFFFF5722).copy(alpha = 0.45f * haloAlpha),
                            Color(0xFFFF9800).copy(alpha = 0.20f * haloAlpha),
                            Color.Transparent
                        ),
                        center = Offset(canvasWidth / 2f, canvasHeight * 0.95f),
                        radius = canvasWidth * 0.85f
                    )
                )

                // 2. Draw Fire Embers rising upward
                embersList.forEach { ember ->
                    val normX = (ember.x / 1000f) * canvasWidth
                    val normY = (ember.y / 2000f) * canvasHeight
                    val lifeRatio = (ember.life / ember.maxLife).coerceIn(0f, 1f)
                    val alpha = lifeRatio * 0.9f
                    val currentRadius = ember.radius * (0.4f + 0.6f * lifeRatio)

                    drawCircle(
                        color = ember.color.copy(alpha = alpha),
                        radius = currentRadius,
                        center = Offset(normX, normY)
                    )
                }

                // 3. Draw Confetti Ribbons & Shapes
                confettiList.forEach { p ->
                    val normX = (p.x / 1000f) * canvasWidth
                    val normY = (p.y / 2000f) * canvasHeight
                    val flipScale = abs(cos(Math.toRadians(p.flip.toDouble()))).toFloat().coerceIn(0.1f, 1f)

                    rotate(degrees = p.rotation, pivot = Offset(normX, normY)) {
                        if (p.isCircle) {
                            drawCircle(
                                color = p.color,
                                radius = (p.width / 2f) * flipScale,
                                center = Offset(normX, normY)
                            )
                        } else {
                            drawRect(
                                color = p.color,
                                topLeft = Offset(normX - (p.width / 2f) * flipScale, normY - p.height / 2f),
                                size = Size(p.width * flipScale, p.height)
                            )
                        }
                    }
                }
            }

            // Central Celebration Bento Card
            Surface(
                shape = RoundedCornerShape(28.dp),
                color = BentoSurfaceDark,
                border = androidx.compose.foundation.BorderStroke(
                    2.dp,
                    Brush.linearGradient(
                        colors = listOf(
                            Color(0xFFFF6D00),
                            Color(0xFFFFD54F),
                            Color(0xFFFF3D00),
                            Color(0xFFFFAB00)
                        )
                    )
                ),
                shadowElevation = 24.dp,
                modifier = Modifier
                    .fillMaxWidth(0.92f)
                    .widthIn(max = 420.dp)
                    .clickable(
                        interactionSource = remember { MutableInteractionSource() },
                        indication = null
                    ) { /* Catch clicks to card so only button or background dismisses */ }
                    .testTag("streak_celebration_card")
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier
                        .padding(horizontal = 24.dp, vertical = 28.dp)
                        .fillMaxWidth()
                ) {
                    // Flame Icon with Animated Heat Halo
                    Box(
                        modifier = Modifier.size(110.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        // Glowing Shockwave Aura
                        Box(
                            modifier = Modifier
                                .size((96 * flamePulseScale).dp)
                                .clip(CircleShape)
                                .background(
                                    Brush.radialGradient(
                                        colors = listOf(
                                            Color(0xFFFF6D00).copy(alpha = haloAlpha),
                                            Color(0xFFFF3D00).copy(alpha = haloAlpha * 0.5f),
                                            Color.Transparent
                                        )
                                    )
                                )
                        )

                        // Outer fiery badge ring
                        Box(
                            modifier = Modifier
                                .scale(flamePulseScale)
                                .size(80.dp)
                                .clip(CircleShape)
                                .background(
                                    Brush.radialGradient(
                                        colors = listOf(
                                            Color(0xFFFFD54F),
                                            Color(0xFFFF6D00),
                                            Color(0xFFDD2C00)
                                        )
                                    )
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.LocalFireDepartment,
                                contentDescription = "Fire Streak",
                                tint = Color.White,
                                modifier = Modifier.size(52.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    // Milestone Chip
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = Color(0xFFFF6D00).copy(alpha = 0.18f),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFFF6D00).copy(alpha = 0.5f)),
                        modifier = Modifier.padding(bottom = 8.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp),
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 5.dp)
                        ) {
                            Text(text = "🔥", fontSize = 13.sp)
                            Text(
                                text = if (milestoneTitle != null) "UNLOCKED: $milestoneTitle" else "STUDY GOAL COMPLETED",
                                style = MaterialTheme.typography.labelSmall.copy(
                                    fontWeight = FontWeight.ExtraBold,
                                    letterSpacing = 1.2.sp,
                                    fontSize = 11.sp
                                ),
                                color = Color(0xFFFFAB00)
                            )
                        }
                    }

                    Text(
                        text = "STREAK ADVANCED!",
                        style = MaterialTheme.typography.titleLarge.copy(
                            fontWeight = FontWeight.Black,
                            letterSpacing = 0.5.sp,
                            fontSize = 22.sp
                        ),
                        color = MaterialTheme.colorScheme.onSurface,
                        textAlign = TextAlign.Center
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    // Large Streak Counter Display
                    Surface(
                        shape = RoundedCornerShape(20.dp),
                        color = BentoSurfaceSubtleDark,
                        border = androidx.compose.foundation.BorderStroke(1.dp, BentoBorderDark),
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 6.dp)
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            modifier = Modifier.padding(vertical = 14.dp, horizontal = 16.dp)
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.Center
                            ) {
                                Text(
                                    text = "$streakCount",
                                    style = MaterialTheme.typography.displayMedium.copy(
                                        fontWeight = FontWeight.Black,
                                        fontSize = 46.sp
                                    ),
                                    color = Color(0xFFFF9800)
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Column {
                                    Text(
                                        text = "DAY",
                                        style = MaterialTheme.typography.titleMedium.copy(
                                            fontWeight = FontWeight.Black,
                                            letterSpacing = 1.sp,
                                            fontSize = 15.sp
                                        ),
                                        color = BentoGoldIITian
                                    )
                                    Text(
                                        text = "STREAK",
                                        style = MaterialTheme.typography.titleMedium.copy(
                                            fontWeight = FontWeight.Black,
                                            letterSpacing = 1.sp,
                                            fontSize = 15.sp
                                        ),
                                        color = Color(0xFFFF5722)
                                    )
                                }
                            }

                            if (bestStreak > 0) {
                                Text(
                                    text = if (streakCount >= bestStreak) "🏆 Personal Best Record Reached!" else "Personal Best: $bestStreak days",
                                    style = MaterialTheme.typography.labelSmall.copy(
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 11.sp
                                    ),
                                    color = if (streakCount >= bestStreak) BentoGoldIITian else MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Text(
                        text = if (motivationalQuote.isNotBlank()) "\"$motivationalQuote\"" else "Daily consistency is what differentiates top IITians. Your momentum is officially locked in for today!",
                        style = MaterialTheme.typography.bodySmall.copy(
                            lineHeight = 18.sp,
                            fontSize = 12.sp,
                            fontStyle = if (motivationalQuote.isNotBlank()) androidx.compose.ui.text.font.FontStyle.Italic else androidx.compose.ui.text.font.FontStyle.Normal
                        ),
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(horizontal = 8.dp)
                    )

                    Spacer(modifier = Modifier.height(20.dp))

                    // Engaging Keep Fire Burning Action Button
                    Button(
                        onClick = onDismiss,
                        shape = RoundedCornerShape(16.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFFFF6D00),
                            contentColor = Color.White
                        ),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp)
                            .testTag("streak_celebration_dismiss")
                    ) {
                        Text(
                            text = "KEEP THE FIRE BURNING 🔥",
                            style = MaterialTheme.typography.titleSmall.copy(
                                fontWeight = FontWeight.ExtraBold,
                                letterSpacing = 1.sp,
                                fontSize = 14.sp
                            )
                        )
                    }
                }
            }
        }
    }
}
