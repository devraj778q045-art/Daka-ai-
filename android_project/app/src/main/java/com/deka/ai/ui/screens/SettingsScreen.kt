package com.deka.ai.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.text.font.FontWeight
import com.deka.ai.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    currentLanguage: String,
    onLanguageChange: (String) -> Unit,
    voiceEnabled: Boolean,
    onVoiceEnabledChange: (Boolean) -> Unit,
    speechRate: Float,
    onSpeechRateChange: (Float) -> Unit,
    onClearHistory: () -> Unit,
    onBack: () -> Unit
) {
    var showClearConfirm by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Settings & Preferences", color = DekaTextPrimary, fontSize = 18.sp, fontWeight = FontWeight.Bold) },
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
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Language Preference
            item {
                Text("Language / भाषा", color = DekaElectricCyan, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                Spacer(modifier = Modifier.height(8.dp))
                Surface(
                    color = DekaSurface,
                    shape = RoundedCornerShape(14.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { onLanguageChange("auto") },
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Automatic (Hindi + English)", color = DekaTextPrimary, fontSize = 14.sp)
                            RadioButton(selected = currentLanguage == "auto", onClick = { onLanguageChange("auto") })
                        }
                        Divider(color = DekaNavy, modifier = Modifier.padding(vertical = 8.dp))
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { onLanguageChange("hi") },
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("हिंदी (Hindi Primary)", color = DekaTextPrimary, fontSize = 14.sp)
                            RadioButton(selected = currentLanguage == "hi", onClick = { onLanguageChange("hi") })
                        }
                        Divider(color = DekaNavy, modifier = Modifier.padding(vertical = 8.dp))
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { onLanguageChange("en") },
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("English (Primary)", color = DekaTextPrimary, fontSize = 14.sp)
                            RadioButton(selected = currentLanguage == "en", onClick = { onLanguageChange("en") })
                        }
                    }
                }
            }

            // Voice & Speech Settings
            item {
                Text("Voice & Speech Output", color = DekaElectricCyan, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                Spacer(modifier = Modifier.height(8.dp))
                Surface(
                    color = DekaSurface,
                    shape = RoundedCornerShape(14.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                Text("Spoken Responses (TTS)", color = DekaTextPrimary, fontSize = 14.sp)
                                Text("Speak out AI answers automatically", color = DekaTextSecondary, fontSize = 11.sp)
                            }
                            Switch(checked = voiceEnabled, onCheckedChange = onVoiceEnabledChange)
                        }

                        Spacer(modifier = Modifier.height(14.dp))
                        Text("Speech Speed: ${"%.1f".format(speechRate)}x", color = DekaTextSecondary, fontSize = 12.sp)
                        Slider(
                            value = speechRate,
                            onValueChange = onSpeechRateChange,
                            valueRange = 0.5f..2.0f,
                            colors = SliderDefaults.colors(thumbColor = DekaElectricCyan, activeTrackColor = DekaElectricCyan)
                        )
                    }
                }
            }

            // Privacy & Permissions
            item {
                Text("Privacy & Device Permissions", color = DekaElectricCyan, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                Spacer(modifier = Modifier.height(8.dp))
                Surface(
                    color = DekaSurface,
                    shape = RoundedCornerShape(14.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Text("Microphone Permission: Granted", color = DekaSuccess, fontSize = 13.sp)
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            "DEKA AI accesses the microphone solely when active or listening for the wake phrase \"Hey Deka\". Audio is never stored remotely or sold.",
                            color = DekaTextSecondary,
                            fontSize = 11.sp,
                            lineHeight = 16.sp
                        )
                        Spacer(modifier = Modifier.height(10.dp))
                        Text("Battery Optimization Note", color = DekaTextPrimary, fontSize = 13.sp, fontWeight = FontWeight.Medium)
                        Text(
                            "Continuous wake-word listening requires battery optimization exemption on Android 12+. You can toggle background listening in Android App Settings.",
                            color = DekaTextSecondary,
                            fontSize = 11.sp,
                            lineHeight = 16.sp
                        )
                    }
                }
            }

            // Data Management
            item {
                Text("History & Storage", color = DekaElectricCyan, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                Spacer(modifier = Modifier.height(8.dp))
                Button(
                    onClick = { showClearConfirm = true },
                    colors = ButtonDefaults.buttonColors(containerColor = DekaError.copy(alpha = 0.2f), contentColor = DekaError),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Icon(Icons.Outlined.DeleteForever, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Clear All Chat History")
                }
            }
        }

        if (showClearConfirm) {
            AlertDialog(
                onDismissRequest = { showClearConfirm = false },
                title = { Text("Clear Chat History?", color = DekaTextPrimary) },
                text = { Text("This will permanently delete all stored chats from your device.", color = DekaTextSecondary) },
                confirmButton = {
                    TextButton(onClick = {
                        onClearHistory()
                        showClearConfirm = false
                    }) {
                        Text("Delete", color = DekaError)
                    }
                },
                dismissButton = {
                    TextButton(onClick = { showClearConfirm = false }) {
                        Text("Cancel", color = DekaTextMuted)
                    }
                },
                containerColor = DekaNavy
            )
        }
    }
}
