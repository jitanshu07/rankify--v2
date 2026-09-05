package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.*
import com.example.viewmodel.NavTab

@Composable
fun RankifyBottomBar(
    currentTab: NavTab,
    onTabSelected: (NavTab) -> Unit,
    pendingTodoCount: Int = 0,
    modifier: Modifier = Modifier
) {
    val scrollState = rememberScrollState()

    Surface(
        color = MaterialTheme.colorScheme.surface,
        shape = RoundedCornerShape(topStart = 28.dp, topEnd = 28.dp),
        shadowElevation = 16.dp,
        border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
        modifier = modifier
            .fillMaxWidth()
            .navigationBarsPadding()
            .testTag("rankify_bottom_navigation")
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(scrollState)
                .padding(horizontal = 12.dp, vertical = 8.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            NavTab.values().forEach { tab ->
                val isSelected = tab == currentTab
                val icon = getTabIcon(tab)

                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = if (isSelected) MaterialTheme.colorScheme.primaryContainer else Color.Transparent,
                    modifier = Modifier
                        .clip(RoundedCornerShape(20.dp))
                        .clickable { onTabSelected(tab) }
                        .testTag("tab_${tab.name.lowercase()}")
                ) {
                    Column(
                        modifier = Modifier
                            .padding(horizontal = 10.dp, vertical = 6.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        // Pill icon container matching Bento Design
                        Box(
                            modifier = Modifier
                                .height(32.dp)
                                .widthIn(min = 48.dp)
                                .clip(CircleShape)
                                .background(
                                    if (isSelected) BentoSecondarySlate else Color.Transparent
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            BadgedBox(
                                badge = {
                                    if (tab == NavTab.TODO && pendingTodoCount > 0) {
                                        Badge(
                                            containerColor = BentoCoralAdv,
                                            contentColor = Color.Black
                                        ) {
                                            Text(
                                                "$pendingTodoCount",
                                                fontWeight = FontWeight.Bold,
                                                fontSize = 9.sp
                                            )
                                        }
                                    }
                                }
                            ) {
                                Icon(
                                    imageVector = icon,
                                    contentDescription = tab.title,
                                    tint = if (isSelected) BentoAccentBlue else MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f),
                                    modifier = Modifier.size(20.dp)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(2.dp))

                        Text(
                            text = tab.title,
                            style = MaterialTheme.typography.labelSmall.copy(
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                fontSize = 10.sp
                            ),
                            color = if (isSelected) BentoAccentBlue else MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f)
                        )
                    }
                }
            }
        }
    }
}

private fun getTabIcon(tab: NavTab): ImageVector {
    return when (tab) {
        NavTab.HOME -> Icons.Default.Home
        NavTab.TRACKER -> Icons.Default.Flag
        NavTab.SYLLABUS -> Icons.Default.MenuBook
        NavTab.FORMULAS -> Icons.Default.Functions
        NavTab.TODO -> Icons.Default.Checklist
        NavTab.TIMER -> Icons.Default.Timer
        NavTab.TOOLS -> Icons.Default.Build
        NavTab.ANALYTICS -> Icons.Default.Leaderboard
    }
}
