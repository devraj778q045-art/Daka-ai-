package com.deka.ai

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.Crossfade
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.deka.ai.intent.AppLauncherHelper
import com.deka.ai.network.GeminiApiClient
import com.deka.ai.ui.components.OrbState
import com.deka.ai.ui.screens.*
import com.deka.ai.ui.theme.DEKAAITheme
import com.deka.ai.ui.theme.DekaBackground
import com.deka.ai.ui.theme.DekaElectricCyan
import com.deka.ai.ui.theme.DekaNavy
import com.deka.ai.ui.theme.DekaTextMuted
import com.deka.ai.voice.DekaVoiceManager
import kotlinx.coroutines.launch

sealed class Screen(val route: String, val title: String, val icon: ImageVector) {
    object Home : Screen("home", "Home", Icons.Outlined.Home)
    object Chat : Screen("chat", "Chat", Icons.Outlined.ChatBubbleOutline)
    object Voice : Screen("voice", "Voice", Icons.Outlined.Mic)
    object Apps : Screen("apps", "Apps", Icons.Outlined.Apps)
    object Settings : Screen("settings", "Settings", Icons.Outlined.Settings)
}

class MainActivity : ComponentActivity() {

    private lateinit var voiceManager: DekaVoiceManager
    private val apiClient = GeminiApiClient()

    // State holders
    private var isListeningState = mutableStateOf(false)
    private var orbState = mutableStateOf(OrbState.IDLE)
    private var voiceTranscript = mutableStateOf("")
    private var lastAiSpeech = mutableStateOf("")
    private var currentLanguage = mutableStateOf("auto")
    private var voiceEnabled = mutableStateOf(true)
    private var speechRate = mutableStateOf(1.0f)
    private var chatMessages = mutableStateListOf<ChatMessage>()
    private var isLoading = mutableStateOf(false)

    // Request Audio Permission
    private val requestAudioPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted: Boolean ->
        if (isGranted) {
            voiceManager.startListening()
        } else {
            Toast.makeText(this, "Microphone permission is needed for voice assistance", Toast.LENGTH_LONG).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        initVoiceManager()

        setContent {
            DEKAAITheme {
                var currentScreen by remember { mutableStateOf<Screen>(Screen.Home) }

                Scaffold(
                    containerColor = DekaBackground,
                    bottomBar = {
                        NavigationBar(
                            containerColor = DekaNavy,
                            tonalElevation = 8.dp
                        ) {
                            val items = listOf(Screen.Home, Screen.Chat, Screen.Voice, Screen.Apps, Screen.Settings)
                            items.forEach { screen ->
                                val selected = currentScreen == screen
                                NavigationBarItem(
                                    selected = selected,
                                    onClick = { currentScreen = screen },
                                    icon = {
                                        Icon(
                                            screen.icon,
                                            contentDescription = screen.title,
                                            tint = if (selected) DekaElectricCyan else DekaTextMuted
                                        )
                                    },
                                    label = {
                                        Text(
                                            screen.title,
                                            fontSize = 10.sp,
                                            color = if (selected) DekaElectricCyan else DekaTextMuted
                                        )
                                    },
                                    colors = NavigationBarItemDefaults.colors(
                                        indicatorColor = DekaElectricCyan.copy(alpha = 0.15f)
                                    )
                                )
                            }
                        }
                    }
                ) { innerPadding ->
                    Box(modifier = Modifier.padding(innerPadding)) {
                        Crossfade(targetState = currentScreen, label = "ScreenTransition") { screen ->
                            when (screen) {
                                Screen.Home -> HomeScreen(
                                    orbState = orbState.value,
                                    isListening = isListeningState.value,
                                    onOrbClick = { handleMicToggle() },
                                    onMicClick = { handleMicToggle() },
                                    onSendText = { text ->
                                        currentScreen = Screen.Chat
                                        handleSendChatMessage(text)
                                    },
                                    onNavigateToChat = { currentScreen = Screen.Chat },
                                    onNavigateToVoice = { currentScreen = Screen.Voice },
                                    onNavigateToApps = { currentScreen = Screen.Apps },
                                    onNavigateToDocuments = { currentScreen = Screen.Apps },
                                    onNavigateToHistory = { currentScreen = Screen.Chat },
                                    selectedLanguage = currentLanguage.value
                                )
                                Screen.Chat -> ChatScreen(
                                    messages = chatMessages,
                                    isLoading = isLoading.value,
                                    onSendMessage = { handleSendChatMessage(it) },
                                    onNewChat = { chatMessages.clear() },
                                    onRegenerate = {
                                        val lastUser = chatMessages.lastOrNull { it.role == "user" }
                                        lastUser?.let { handleSendChatMessage(it.content) }
                                    },
                                    onSpeakText = { text ->
                                        voiceManager.speak(text)
                                    },
                                    onBack = { currentScreen = Screen.Home },
                                    selectedLanguage = currentLanguage.value
                                )
                                Screen.Voice -> VoiceScreen(
                                    isListening = isListeningState.value,
                                    currentTranscript = voiceTranscript.value,
                                    lastAiSpeech = lastAiSpeech.value,
                                    orbState = orbState.value,
                                    onToggleMic = { handleMicToggle() },
                                    onBack = { currentScreen = Screen.Home },
                                    selectedLanguage = currentLanguage.value
                                )
                                Screen.Apps -> AppsScreen(
                                    onLaunchApp = { pkg ->
                                        AppLauncherHelper.launchAppByPackage(this@MainActivity, pkg)
                                    },
                                    onPickDocument = {
                                        Toast.makeText(this@MainActivity, "Android Storage Access Framework Picker Ready", Toast.LENGTH_SHORT).show()
                                    },
                                    onLaunchCamera = {
                                        AppLauncherHelper.launchCamera(this@MainActivity)
                                    },
                                    onLaunchDialer = {
                                        AppLauncherHelper.launchDialer(this@MainActivity)
                                    },
                                    onBack = { currentScreen = Screen.Home }
                                )
                                Screen.Settings -> SettingsScreen(
                                    currentLanguage = currentLanguage.value,
                                    onLanguageChange = {
                                        currentLanguage.value = it
                                        voiceManager.setLanguage(it)
                                    },
                                    voiceEnabled = voiceEnabled.value,
                                    onVoiceEnabledChange = { voiceEnabled.value = it },
                                    speechRate = speechRate.value,
                                    onSpeechRateChange = { speechRate.value = it },
                                    onClearHistory = { chatMessages.clear() },
                                    onBack = { currentScreen = Screen.Home }
                                )
                            }
                        }
                    }
                }
            }
        }
    }

    private fun initVoiceManager() {
        voiceManager = DekaVoiceManager(
            context = this,
            onSpeechResult = { text ->
                voiceTranscript.value = text
                handleSendChatMessage(text)
            },
            onWakeWordDetected = {
                runOnUiThread {
                    Toast.makeText(this, "Wake word detected: Hey Deka!", Toast.LENGTH_SHORT).show()
                }
            },
            onListeningStateChanged = { listening ->
                isListeningState.value = listening
                orbState.value = if (listening) OrbState.LISTENING else OrbState.IDLE
            },
            onError = { error ->
                runOnUiThread {
                    Toast.makeText(this, error, Toast.LENGTH_SHORT).show()
                }
            }
        )
    }

    private fun handleMicToggle() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) {
            if (isListeningState.value) {
                voiceManager.stopListening()
            } else {
                voiceManager.startListening()
            }
        } else {
            requestAudioPermissionLauncher.launch(Manifest.permission.RECORD_AUDIO)
        }
    }

    private fun handleSendChatMessage(text: String) {
        if (text.isBlank()) return

        chatMessages.add(ChatMessage(role = "user", content = text))
        isLoading.value = true
        orbState.value = OrbState.THINKING

        lifecycleScope.launch {
            val netMessages = chatMessages.map { GeminiApiClient.Message(it.role, it.content) }
            val result = apiClient.sendChatMessage(netMessages, currentLanguage.value)

            isLoading.value = false
            orbState.value = OrbState.IDLE

            result.onSuccess { response ->
                chatMessages.add(ChatMessage(role = "model", content = response.reply))
                lastAiSpeech.value = response.reply

                if (voiceEnabled.value) {
                    orbState.value = OrbState.SPEAKING
                    voiceManager.speak(response.reply) {
                        orbState.value = OrbState.IDLE
                    }
                }
            }.onFailure { error ->
                chatMessages.add(
                    ChatMessage(
                        role = "model",
                        content = "Connection error: ${error.message ?: "Could not reach DEKA neural backend"}"
                    )
                )
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        voiceManager.destroy()
    }
}
