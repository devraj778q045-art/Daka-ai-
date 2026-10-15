package com.deka.ai.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
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
fun VoiceScreen(
    isListening: Boolean,
    currentTranscript: String,
    lastAiSpeech: String,
    orbState: OrbState,
    onToggleMic: () -> Unit,
    onBack: () -> Unit,
    selectedLanguage: String
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("DEKA Voice Assistant", color = DekaTextPrimary, fontSize = 18.sp, fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = DekaTextPrimary)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = DekaNavy)
            )
        },
        containerColor = DekaBackground
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // Wake Word & Mode Indicator
            Surface(
                color = DekaNavy,
                shape = RoundedCornerShape(14.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, DekaElectricCyan.copy(alpha = 0.3f))
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(8.dp)
                            .clip(CircleShape)
                            .background(if (isListening) DekaElectricCyan else DekaTextMuted)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = if (isListening) "Listening for \"Hey Deka\" / Speech..." else "Tap Mic or Say \"Hey Deka\"",
                        color = if (isListening) DekaElectricCyan else DekaTextSecondary,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium
                    )
                }
            }

            // Central Glowing Orb
            Box(
                modifier = Modifier
                    .size(260.dp)
                    .clickable { onToggleMic() },
                contentAlignment = Alignment.Center
            ) {
                DekaOrb(
                    state = orbState,
                    size = 250.dp
                )
            }

            // Transcript / AI Speech Bubble
            Column(
                modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                if (currentTranscript.isNotBlank()) {
                    Surface(
                        color = DekaSurface,
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Text(
                                text = "You said:",
                                color = DekaTextSecondary,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "\"$currentTranscript\"",
                                color = DekaElectricCyan,
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Medium
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(10.dp))
                }

                if (lastAiSpeech.isNotBlank()) {
                    Surface(
                        color = DekaNavy,
                        shape = RoundedCornerShape(16.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, DekaElectricCyan.copy(alpha = 0.2f)),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Text(
                                text = "DEKA AI:",
                                color = DekaElectricCyan,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = lastAiSpeech,
                                color = DekaTextPrimary,
                                fontSize = 14.sp
                            )
                        }
                    }
                }
            }

            // Bottom Mic Button & Privacy Notice
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.fillMaxWidth()
            ) {
                IconButton(
                    onClick = onToggleMic,
                    modifier = Modifier
                        .size(64.dp)
                        .clip(CircleShape)
                        .background(if (isListening) DekaElectricCyan else DekaNavy)
                ) {
                    Icon(
                        imageVector = if (isListening) Icons.Default.GraphicEq else Icons.Default.Mic,
                        contentDescription = "Microphone",
                        tint = if (isListening) DekaBackground else DekaElectricCyan,
                        modifier = Modifier.size(32.dp)
                    )
                }

                Spacer(modifier = Modifier.height(14.dp))

                Text(
                    text = "🔒 Privacy: Audio is processed in real time and never retained.",
                    color = DekaTextMuted,
                    fontSize = 11.sp,
                    textAlign = TextAlign.Center
                )
            }
        }
    }
}
