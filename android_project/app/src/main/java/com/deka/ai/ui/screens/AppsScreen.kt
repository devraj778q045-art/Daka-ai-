package com.deka.ai.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.deka.ai.intent.AppLauncherHelper
import com.deka.ai.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppsScreen(
    onLaunchApp: (String) -> Unit,
    onPickDocument: () -> Unit,
    onLaunchCamera: () -> Unit,
    onLaunchDialer: () -> Unit,
    onBack: () -> Unit
) {
    var showConfirmDialog by remember { mutableStateOf<String?>(null) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Android Integrations", color = DekaTextPrimary, fontSize = 18.sp, fontWeight = FontWeight.Bold) },
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
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // System Shortcuts Card
            item {
                Text(
                    text = "System Actions",
                    color = DekaTextSecondary,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold
                )
            }

            item {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    Surface(
                        color = DekaNavy,
                        shape = RoundedCornerShape(14.dp),
                        modifier = Modifier
                            .weight(1f)
                            .clickable { onPickDocument() }
                    ) {
                        Row(modifier = Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Outlined.FolderOpen, contentDescription = null, tint = DekaElectricCyan)
                            Spacer(modifier = Modifier.width(10.dp))
                            Text("Open Document", color = DekaTextPrimary, fontSize = 13.sp, fontWeight = FontWeight.Medium)
                        }
                    }

                    Surface(
                        color = DekaNavy,
                        shape = RoundedCornerShape(14.dp),
                        modifier = Modifier
                            .weight(1f)
                            .clickable { onLaunchCamera() }
                    ) {
                        Row(modifier = Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Outlined.CameraAlt, contentDescription = null, tint = DekaElectricCyan)
                            Spacer(modifier = Modifier.width(10.dp))
                            Text("Camera", color = DekaTextPrimary, fontSize = 13.sp, fontWeight = FontWeight.Medium)
                        }
                    }
                }
            }

            item {
                Spacer(modifier = Modifier.height(10.dp))
                Text(
                    text = "Installed Apps & Intents",
                    color = DekaTextSecondary,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold
                )
            }

            items(AppLauncherHelper.supportedApps) { app ->
                Surface(
                    color = DekaSurface,
                    shape = RoundedCornerShape(14.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, DekaNavy),
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable {
                            showConfirmDialog = app.packageName
                        }
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(40.dp)
                                    .clip(CircleShape)
                                    .background(DekaNavy),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    Icons.Outlined.Launch,
                                    contentDescription = app.name,
                                    tint = DekaElectricCyan,
                                    modifier = Modifier.size(20.dp)
                                )
                            }
                            Spacer(modifier = Modifier.width(12.dp))
                            Column {
                                Text(app.name, color = DekaTextPrimary, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                                Text(app.description, color = DekaTextSecondary, fontSize = 11.sp)
                            }
                        }

                        Icon(Icons.Default.ChevronRight, contentDescription = null, tint = DekaTextMuted)
                    }
                }
            }
        }

        // Confirmation Dialog
        showConfirmDialog?.let { pkg ->
            AlertDialog(
                onDismissRequest = { showConfirmDialog = null },
                title = { Text("Launch Application", color = DekaTextPrimary) },
                text = { Text("DEKA AI will open this app using Android standard intents. Proceed?", color = DekaTextSecondary) },
                confirmButton = {
                    TextButton(onClick = {
                        onLaunchApp(pkg)
                        showConfirmDialog = null
                    }) {
                        Text("Open", color = DekaElectricCyan)
                    }
                },
                dismissButton = {
                    TextButton(onClick = { showConfirmDialog = null }) {
                        Text("Cancel", color = DekaTextMuted)
                    }
                },
                containerColor = DekaNavy
            )
        }
    }
}
