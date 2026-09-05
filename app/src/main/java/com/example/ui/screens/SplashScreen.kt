package com.example.ui.screens

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.ElectricCyan
import com.example.ui.theme.ElectricIndigo
import com.example.ui.theme.GoldenAmber
import kotlinx.coroutines.delay

@Composable
fun SplashScreen(
    onFinish: () -> Unit,
    modifier: Modifier = Modifier
) {
    // Animation progress drives the transformation sequence
    val transitionState = remember { Animatable(0f) }

    LaunchedEffect(Unit) {
        // Animate from 0 to 1 over 2.6 seconds
        transitionState.animateTo(
            targetValue = 1f,
            animationSpec = tween(durationMillis = 2600, easing = FastOutSlowInEasing)
        )
        // Hold for brief moment and proceed to dashboard
        delay(600L)
        onFinish()
    }

    val progress = transitionState.value

    // Animation phases
    // Phase 1 (0 to 0.45): Textbook and Calculator zoom in toward center
    // Phase 2 (0.45 to 0.75): Merge into Atom with orbital rotation
    // Phase 3 (0.75 to 1.0): App name and motivation quote fade in
    val itemsAlpha = if (progress < 0.5f) (progress / 0.4f).coerceIn(0f, 1f) else ((0.65f - progress) / 0.15f).coerceIn(0f, 1f)
    val itemsOffset = (1f - (progress / 0.5f).coerceIn(0f, 1f)) * 90f // pixels to offset

    val atomAlpha = if (progress > 0.45f) ((progress - 0.45f) / 0.2f).coerceIn(0f, 1f) else 0f
    val atomScale = if (progress > 0.45f) 0.6f + ((progress - 0.45f) / 0.3f).coerceIn(0f, 1f) * 0.5f else 0.2f

    val textAlpha = if (progress > 0.65f) ((progress - 0.65f) / 0.3f).coerceIn(0f, 1f) else 0f

    // Continuous subtle rotation for atom
    val infiniteTransition = rememberInfiniteTransition(label = "atom_spin")
    val spinAngle by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(4000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "spin"
    )

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(
                        Color(0xFF070B14),
                        Color(0xFF0F172A),
                        Color(0xFF131C38)
                    )
                )
            )
            .clickable { onFinish() } // quick tap to enter
            .testTag("splash_screen"),
        contentAlignment = Alignment.Center
    ) {
        // Skip button on top right
        Box(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
                .padding(16.dp),
            contentAlignment = Alignment.TopEnd
        ) {
            TextButton(
                onClick = onFinish,
                shape = RoundedCornerShape(20.dp),
                colors = ButtonDefaults.textButtonColors(
                    contentColor = ElectricCyan.copy(alpha = 0.8f)
                )
            ) {
                Text("Skip", fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                Spacer(modifier = Modifier.width(4.dp))
                Icon(Icons.Default.ArrowForward, contentDescription = "Skip", modifier = Modifier.size(16.dp))
            }
        }

        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
            modifier = Modifier.padding(horizontal = 24.dp)
        ) {
            // Animated Icon Container
            Box(
                modifier = Modifier
                    .size(140.dp),
                contentAlignment = Alignment.Center
            ) {
                // Background glow
                Box(
                    modifier = Modifier
                        .size(120.dp)
                        .scale(if (progress > 0.5f) 1.2f else 0.8f)
                        .clip(CircleShape)
                        .background(
                            Brush.radialGradient(
                                colors = listOf(
                                    ElectricCyan.copy(alpha = 0.25f),
                                    Color.Transparent
                                )
                            )
                        )
                )

                // 1. Textbook & Calculator (Zooming in and merging)
                if (progress < 0.65f) {
                    Row(
                        modifier = Modifier
                            .alpha(itemsAlpha)
                            .fillMaxSize(),
                        horizontalArrangement = Arrangement.Center,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Textbook
                        Surface(
                            shape = CircleShape,
                            color = ElectricCyan.copy(alpha = 0.2f),
                            border = androidx.compose.foundation.BorderStroke(1.5.dp, ElectricCyan),
                            modifier = Modifier
                                .offset(x = (-itemsOffset).dp)
                                .size(56.dp)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Icon(
                                    imageVector = Icons.Default.MenuBook,
                                    contentDescription = "Textbook",
                                    tint = ElectricCyan,
                                    modifier = Modifier.size(28.dp)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.width(12.dp))

                        // Calculator
                        Surface(
                            shape = CircleShape,
                            color = GoldenAmber.copy(alpha = 0.2f),
                            border = androidx.compose.foundation.BorderStroke(1.5.dp, GoldenAmber),
                            modifier = Modifier
                                .offset(x = itemsOffset.dp)
                                .size(56.dp)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Icon(
                                    imageVector = Icons.Default.Calculate,
                                    contentDescription = "Calculator",
                                    tint = GoldenAmber,
                                    modifier = Modifier.size(28.dp)
                                )
                            }
                        }
                    }
                }

                // 2. Atom / Molecular Icon (Merged Result)
                if (progress > 0.45f) {
                    Box(
                        modifier = Modifier
                            .alpha(atomAlpha)
                            .scale(atomScale),
                        contentAlignment = Alignment.Center
                    ) {
                        // Outer rotating orbital 1
                        Box(
                            modifier = Modifier
                                .size(90.dp)
                                .rotate(spinAngle)
                                .clip(RoundedCornerShape(45.dp))
                                .background(Color.Transparent)
                        ) {
                            Surface(
                                shape = CircleShape,
                                color = Color.Transparent,
                                border = androidx.compose.foundation.BorderStroke(2.5.dp, ElectricCyan),
                                modifier = Modifier.fillMaxSize()
                            ) {}
                        }

                        // Outer rotating orbital 2 (opposed)
                        Box(
                            modifier = Modifier
                                .size(90.dp)
                                .rotate(-spinAngle + 45f)
                                .scale(scaleX = 1f, scaleY = 0.5f)
                        ) {
                            Surface(
                                shape = CircleShape,
                                color = Color.Transparent,
                                border = androidx.compose.foundation.BorderStroke(2.dp, ElectricIndigo),
                                modifier = Modifier.fillMaxSize()
                            ) {}
                        }

                        // Central nucleus & achievement star
                        Surface(
                            shape = CircleShape,
                            color = GoldenAmber,
                            shadowElevation = 8.dp,
                            modifier = Modifier.size(34.dp)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Icon(
                                    imageVector = Icons.Default.Science,
                                    contentDescription = "Atom",
                                    tint = Color.Black,
                                    modifier = Modifier.size(20.dp)
                                )
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(28.dp))

            // App Name & Hard Motivation Quote
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.alpha(textAlpha)
            ) {
                Text(
                    text = "Rankify",
                    style = MaterialTheme.typography.headlineLarge.copy(
                        fontWeight = FontWeight.ExtraBold,
                        letterSpacing = 2.sp,
                        fontSize = 38.sp
                    ),
                    color = Color.White
                )

                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = ElectricCyan.copy(alpha = 0.15f),
                    modifier = Modifier.padding(top = 6.dp, bottom = 18.dp)
                ) {
                    Text(
                        text = "JEE MAIN & ADVANCED COMPANION",
                        style = MaterialTheme.typography.labelMedium.copy(
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 1.sp,
                            fontSize = 11.sp
                        ),
                        color = ElectricCyan,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                    )
                }

                // Required hard motivation quote
                Surface(
                    shape = RoundedCornerShape(14.dp),
                    color = Color(0xFF1E293B).copy(alpha = 0.7f),
                    border = androidx.compose.foundation.BorderStroke(1.dp, GoldenAmber.copy(alpha = 0.4f)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.FormatQuote,
                            contentDescription = "Quote",
                            tint = GoldenAmber,
                            modifier = Modifier.size(26.dp)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = "\"Sleepless nights today, IIT Bombay tomorrow.\"",
                            style = MaterialTheme.typography.bodyMedium.copy(
                                fontWeight = FontWeight.SemiBold,
                                fontSize = 14.sp,
                                lineHeight = 20.sp
                            ),
                            color = Color(0xFFF1F5F9),
                            textAlign = TextAlign.Start
                        )
                    }
                }
            }
        }
    }
}
