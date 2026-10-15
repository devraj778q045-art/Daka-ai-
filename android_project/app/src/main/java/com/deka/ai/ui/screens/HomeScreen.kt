package com.deka.ai.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.deka.ai.ui.components.DekaOrb
import com.deka.ai.ui.components.OrbState
import com.deka.ai.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    orbState: OrbState,
    isListening: Boolean,
    onOrbClick: () -> Unit,
    onMicClick: () -> Unit,
    onSendText: (String) -> Unit,
    onNavigateToChat: () -> Unit,
    onNavigateToVoice: () -> Unit,
    onNavigateToApps: () -> Unit,
    onNavigateToDocuments: () -> Unit,
    onNavigateToHistory: () -> Unit,
    selectedLanguage: String
) {
    var inputText by remember { mutableStateOf("") }
    val scrollState = rememberScrollState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(DekaBackground)
            .verticalScroll(scrollState)
            .padding(horizontal = 20.dp, vertical = 16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Top Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 8.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(CircleShape)
                        .background(
                            Brush.linearGradient(listOf(DekaElectricCyan, DekaBlueAccent))
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Text("Δ", color = DekaBackground, fontWeight = FontWeight.Black, fontSize = 20.sp)
                }
                Spacer(modifier = Modifier.width(10.dp))
                Column {
                    Text(
                        text = "DEKA AI",
                        color = DekaTextPrimary,
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 20.sp,
                        letterSpacing = 1.2.sp
                    )
                    Text(
                        text = "Android Neural System",
                        color = DekaElectricCyan,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Medium
                    )
                }
            }

            // Language Tag Pill
            Surface(
                color = DekaNavy,
                shape = RoundedCornerShape(12.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, DekaElectricCyan.copy(alpha = 0.3f))
            ) {
                Text(
                    text = if (selectedLanguage == "hi") "हिंदी • Active" else "EN • Active",
                    color = DekaElectricCyan,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(28.dp))

        // Center Animated Orb
        Box(
            modifier = Modifier
                .size(230.dp)
                .clickable { onOrbClick() },
            contentAlignment = Alignment.Center
        ) {
            DekaOrb(
                state = orbState,
                size = 220.dp
            )
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Orb Status Text
        Text(
            text = when (orbState) {
                OrbState.LISTENING -> if (selectedLanguage == "hi") "सुन रहा हूँ... बोलिए" else "Listening... Say something"
                OrbState.THINKING -> if (selectedLanguage == "hi") "सोच रहा हूँ..." else "Thinking..."
                OrbState.SPEAKING -> if (selectedLanguage == "hi") "बोल रहा हूँ..." else "Speaking..."
                else -> if (selectedLanguage == "hi") "नमस्ते! टैप करें या 'Hey Deka' बोलें" else "Ready • Tap or say \"Hey Deka\""
            },
            color = if (isListening) DekaElectricCyan else DekaTextSecondary,
            fontSize = 14.sp,
            fontWeight = FontWeight.Medium
        )

        Spacer(modifier = Modifier.height(24.dp))

        // Quick Actions Grid
        Text(
            text = if (selectedLanguage == "hi") "त्वरित क्रियाएं (Quick Actions)" else "Quick Actions",
            color = DekaTextSecondary,
            fontSize = 12.sp,
            fontWeight = FontWeight.SemiBold,
            modifier = Modifier.fillMaxWidth(),
            textAlign = TextAlign.Start
        )

        Spacer(modifier = Modifier.height(10.dp))

        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            QuickActionCard(
                title = if (selectedLanguage == "hi") "AI से पूछें" else "Ask AI",
                icon = Icons.Outlined.AutoAwesome,
                modifier = Modifier.weight(1f),
                onClick = onNavigateToChat
            )
            QuickActionCard(
                title = if (selectedLanguage == "hi") "वॉइस असिस्टेंट" else "Voice AI",
                icon = Icons.Outlined.Mic,
                modifier = Modifier.weight(1f),
                onClick = onNavigateToVoice
            )
            QuickActionCard(
                title = if (selectedLanguage == "hi") "ऐप्स खोलें" else "Open Apps",
                icon = Icons.Outlined.Apps,
                modifier = Modifier.weight(1f),
                onClick = onNavigateToApps
            )
        }

        Spacer(modifier = Modifier.height(10.dp))

        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            QuickActionCard(
                title = if (selectedLanguage == "hi") "दस्तावेज़" else "Documents",
                icon = Icons.Outlined.Description,
                modifier = Modifier.weight(1f),
                onClick = onNavigateToDocuments
            )
            QuickActionCard(
                title = if (selectedLanguage == "hi") "बातचीत का इतिहास" else "Chat History",
                icon = Icons.Outlined.History,
                modifier = Modifier.weight(1f),
                onClick = onNavigateToHistory
            )
        }

        Spacer(modifier = Modifier.height(28.dp))

        // Bottom Voice & Text Input Bar
        Surface(
            color = DekaSurface,
            shape = RoundedCornerShape(24.dp),
            border = androidx.compose.foundation.BorderStroke(1.dp, DekaElectricCyan.copy(alpha = 0.25f)),
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 12.dp, vertical = 6.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Mic Button
                IconButton(
                    onClick = onMicClick,
                    modifier = Modifier
                        .size(44.dp)
                        .clip(CircleShape)
                        .background(if (isListening) DekaElectricCyan else DekaNavy)
                ) {
                    Icon(
                        imageVector = if (isListening) Icons.Default.GraphicEq else Icons.Default.Mic,
                        contentDescription = "Voice Input",
                        tint = if (isListening) DekaBackground else DekaElectricCyan
                    )
                }

                Spacer(modifier = Modifier.width(8.dp))

                TextField(
                    value = inputText,
                    onValueChange = { inputText = it },
                    placeholder = {
                        Text(
                            text = if (selectedLanguage == "hi") "DEKA AI से कुछ भी पूछें..." else "Ask DEKA AI anything...",
                            color = DekaTextMuted,
                            fontSize = 14.sp
                        )
                    },
                    colors = TextFieldDefaults.colors(
                        focusedContainerColor = Color.Transparent,
                        unfocusedContainerColor = Color.Transparent,
                        focusedTextColor = DekaTextPrimary,
                        unfocusedTextColor = DekaTextPrimary,
                        focusedIndicatorColor = Color.Transparent,
                        unfocusedIndicatorColor = Color.Transparent
                    ),
                    modifier = Modifier.weight(1f)
                )

                // Send Button
                IconButton(
                    onClick = {
                        if (inputText.isNotBlank()) {
                            onSendText(inputText)
                            inputText = ""
                        }
                    },
                    enabled = inputText.isNotBlank(),
                    modifier = Modifier
                        .size(40.dp)
                        .clip(CircleShape)
                        .background(if (inputText.isNotBlank()) DekaElectricCyan else DekaNavy.copy(alpha = 0.5f))
                ) {
                    Icon(
                        imageVector = Icons.Default.Send,
                        contentDescription = "Send",
                        tint = if (inputText.isNotBlank()) DekaBackground else DekaTextMuted,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))
    }
}

@Composable
fun QuickActionCard(
    title: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Surface(
        color = DekaNavy,
        shape = RoundedCornerShape(16.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, DekaElectricCyan.copy(alpha = 0.15f)),
        modifier = modifier
            .height(84.dp)
            .clickable { onClick() }
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(12.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = icon,
                contentDescription = title,
                tint = DekaElectricCyan,
                modifier = Modifier.size(24.dp)
            )
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = title,
                color = DekaTextPrimary,
                fontSize = 11.sp,
                fontWeight = FontWeight.Medium,
                textAlign = TextAlign.Center,
                maxLines = 1
            )
        }
    }
}
