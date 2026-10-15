package com.deka.ai.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
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
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.deka.ai.ui.theme.*
import kotlinx.coroutines.launch

data class ChatMessage(
    val id: String = System.currentTimeMillis().toString(),
    val role: String, // "user" or "model"
    val content: String,
    val timestamp: Long = System.currentTimeMillis()
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChatScreen(
    messages: List<ChatMessage>,
    isLoading: Boolean,
    onSendMessage: (String) -> Unit,
    onNewChat: () -> Unit,
    onRegenerate: () -> Unit,
    onSpeakText: (String) -> Unit,
    onBack: () -> Unit,
    selectedLanguage: String
) {
    var inputText by remember { mutableStateOf("") }
    val listState = rememberLazyListState()
    val coroutineScope = rememberCoroutineScope()
    val clipboardManager = LocalClipboardManager.current

    LaunchedEffect(messages.size) {
        if (messages.isNotEmpty()) {
            listState.animateScrollToItem(messages.size - 1)
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("DEKA AI Chat", color = DekaTextPrimary, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                        Text(
                            if (selectedLanguage == "hi") "हिंदी और अंग्रेज़ी चैट" else "Bilingual Hindi & English",
                            color = DekaElectricCyan,
                            fontSize = 11.sp
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = DekaTextPrimary)
                    }
                },
                actions = {
                    IconButton(onClick = onNewChat) {
                        Icon(Icons.Outlined.AddComment, contentDescription = "New Chat", tint = DekaElectricCyan)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = DekaNavy)
            )
        },
        containerColor = DekaBackground,
        bottomBar = {
            Surface(
                color = DekaNavy,
                modifier = Modifier
                    .fillMaxWidth()
                    .imePadding()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 12.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    TextField(
                        value = inputText,
                        onValueChange = { inputText = it },
                        placeholder = {
                            Text(
                                if (selectedLanguage == "hi") "संदेश लिखें..." else "Message DEKA AI...",
                                color = DekaTextMuted,
                                fontSize = 14.sp
                            )
                        },
                        colors = TextFieldDefaults.colors(
                            focusedContainerColor = DekaSurface,
                            unfocusedContainerColor = DekaSurface,
                            focusedTextColor = DekaTextPrimary,
                            unfocusedTextColor = DekaTextPrimary,
                            focusedIndicatorColor = Color.Transparent,
                            unfocusedIndicatorColor = Color.Transparent
                        ),
                        shape = RoundedCornerShape(20.dp),
                        modifier = Modifier.weight(1f)
                    )

                    Spacer(modifier = Modifier.width(8.dp))

                    IconButton(
                        onClick = {
                            if (inputText.isNotBlank() && !isLoading) {
                                onSendMessage(inputText)
                                inputText = ""
                            }
                        },
                        enabled = inputText.isNotBlank() && !isLoading,
                        modifier = Modifier
                            .size(44.dp)
                            .clip(CircleShape)
                            .background(if (inputText.isNotBlank()) DekaElectricCyan else DekaSurface)
                    ) {
                        Icon(
                            Icons.Default.Send,
                            contentDescription = "Send",
                            tint = if (inputText.isNotBlank()) DekaBackground else DekaTextMuted
                        )
                    }
                }
            }
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            if (messages.isEmpty()) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Icon(
                        Icons.Outlined.AutoAwesome,
                        contentDescription = null,
                        tint = DekaElectricCyan,
                        modifier = Modifier.size(48.dp)
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = if (selectedLanguage == "hi") "DEKA AI से कुछ भी पूछें" else "Ask DEKA AI Anything",
                        color = DekaTextPrimary,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = if (selectedLanguage == "hi")
                            "आप हिंदी या अंग्रेज़ी में सवाल पूछ सकते हैं, कोड मांग सकते हैं, या ऐप्स खोलने का निर्देश दे सकते हैं।"
                            else "Experience next-gen AI conversation with full context, code generation, and Android integration.",
                        color = DekaTextSecondary,
                        fontSize = 13.sp,
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center
                    )
                }
            } else {
                LazyColumn(
                    state = listState,
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 14.dp, vertical = 8.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(messages) { msg ->
                        val isUser = msg.role == "user"
                        Column(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalAlignment = if (isUser) Alignment.End else Alignment.Start
                        ) {
                            Surface(
                                color = if (isUser) DekaElectricCyan.copy(alpha = 0.15f) else DekaSurface,
                                shape = RoundedCornerShape(
                                    topStart = 16.dp,
                                    topEnd = 16.dp,
                                    bottomStart = if (isUser) 16.dp else 4.dp,
                                    bottomEnd = if (isUser) 4.dp else 16.dp
                                ),
                                border = androidx.compose.foundation.BorderStroke(
                                    1.dp,
                                    if (isUser) DekaElectricCyan.copy(alpha = 0.4f) else DekaNavy
                                ),
                                modifier = Modifier.widthIn(max = 310.dp)
                            ) {
                                Column(modifier = Modifier.padding(12.dp)) {
                                    Text(
                                        text = msg.content,
                                        color = DekaTextPrimary,
                                        fontSize = 14.sp,
                                        lineHeight = 21.sp
                                    )

                                    if (!isUser) {
                                        Spacer(modifier = Modifier.height(8.dp))
                                        Row(
                                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            IconButton(
                                                onClick = { onSpeakText(msg.content) },
                                                modifier = Modifier.size(28.dp)
                                            ) {
                                                Icon(Icons.Outlined.VolumeUp, contentDescription = "Speak", tint = DekaElectricCyan, modifier = Modifier.size(16.dp))
                                            }
                                            IconButton(
                                                onClick = { clipboardManager.setText(AnnotatedString(msg.content)) },
                                                modifier = Modifier.size(28.dp)
                                            ) {
                                                Icon(Icons.Outlined.ContentCopy, contentDescription = "Copy", tint = DekaTextSecondary, modifier = Modifier.size(16.dp))
                                            }
                                            IconButton(
                                                onClick = onRegenerate,
                                                modifier = Modifier.size(28.dp)
                                            ) {
                                                Icon(Icons.Outlined.Refresh, contentDescription = "Regenerate", tint = DekaTextSecondary, modifier = Modifier.size(16.dp))
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    if (isLoading) {
                        item {
                            Row(
                                modifier = Modifier
                                    .background(DekaSurface, RoundedCornerShape(12.dp))
                                    .padding(horizontal = 14.dp, vertical = 10.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                CircularProgressIndicator(
                                    modifier = Modifier.size(16.dp),
                                    color = DekaElectricCyan,
                                    strokeWidth = 2.dp
                                )
                                Spacer(modifier = Modifier.width(10.dp))
                                Text(
                                    text = if (selectedLanguage == "hi") "DEKA सोच रहा है..." else "DEKA is thinking...",
                                    color = DekaElectricCyan,
                                    fontSize = 12.sp
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
