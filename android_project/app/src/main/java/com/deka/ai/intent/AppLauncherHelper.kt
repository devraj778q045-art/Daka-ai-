package com.deka.ai.intent

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.provider.MediaStore
import android.widget.Toast

object AppLauncherHelper {

    data class AppShortcut(
        val id: String,
        val name: String,
        val packageName: String,
        val description: String,
        val defaultUrlFallback: String? = null
    )

    val supportedApps = listOf(
        AppShortcut(
            id = "whatsapp",
            name = "WhatsApp",
            packageName = "com.whatsapp",
            description = "Chat and call contacts",
            defaultUrlFallback = "https://web.whatsapp.com"
        ),
        AppShortcut(
            id = "youtube",
            name = "YouTube",
            packageName = "com.google.android.youtube",
            description = "Watch videos and tutorials",
            defaultUrlFallback = "https://youtube.com"
        ),
        AppShortcut(
            id = "gmail",
            name = "Gmail",
            packageName = "com.google.android.gm",
            description = "Check and compose emails",
            defaultUrlFallback = "https://mail.google.com"
        ),
        AppShortcut(
            id = "maps",
            name = "Google Maps",
            packageName = "com.google.android.apps.maps",
            description = "Navigation and location search",
            defaultUrlFallback = "https://maps.google.com"
        ),
        AppShortcut(
            id = "chrome",
            name = "Google Chrome",
            packageName = "com.android.chrome",
            description = "Browse the web",
            defaultUrlFallback = "https://google.com"
        ),
        AppShortcut(
            id = "spotify",
            name = "Spotify",
            packageName = "com.spotify.music",
            description = "Stream songs and podcasts",
            defaultUrlFallback = "https://open.spotify.com"
        )
    )

    fun launchAppByPackage(context: Context, packageName: String, fallbackUrl: String? = null): Boolean {
        return try {
            val launchIntent = context.packageManager.getLaunchIntentForPackage(packageName)
            if (launchIntent != null) {
                launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                context.startActivity(launchIntent)
                true
            } else if (!fallbackUrl.isNullOrEmpty()) {
                val webIntent = Intent(Intent.ACTION_VIEW, Uri.parse(fallbackUrl)).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                context.startActivity(webIntent)
                true
            } else {
                Toast.makeText(context, "App not installed on this device", Toast.LENGTH_SHORT).show()
                false
            }
        } catch (e: Exception) {
            Toast.makeText(context, "Could not open app: ${e.message}", Toast.LENGTH_SHORT).show()
            false
        }
    }

    fun launchCamera(context: Context): Boolean {
        return try {
            val intent = Intent(MediaStore.ACTION_IMAGE_CAPTURE).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
            true
        } catch (e: Exception) {
            Toast.makeText(context, "Camera intent unavailable: ${e.message}", Toast.LENGTH_SHORT).show()
            false
        }
    }

    fun launchDialer(context: Context, phoneNumber: String = ""): Boolean {
        return try {
            val intent = if (phoneNumber.isNotBlank()) {
                Intent(Intent.ACTION_DIAL, Uri.parse("tel:$phoneNumber"))
            } else {
                Intent(Intent.ACTION_DIAL)
            }.apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
            true
        } catch (e: Exception) {
            Toast.makeText(context, "Phone dialer unavailable", Toast.LENGTH_SHORT).show()
            false
        }
    }

    fun openWebSearch(context: Context, query: String): Boolean {
        return try {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://www.google.com/search?q=" + Uri.encode(query))).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
            true
        } catch (e: Exception) {
            false
        }
    }

    fun searchInsideApp(context: Context, appKey: String, query: String): Boolean {
        return try {
            val intent = when (appKey.lowercase()) {
                "youtube" -> {
                    Intent(Intent.ACTION_VIEW, Uri.parse("https://www.youtube.com/results?search_query=" + Uri.encode(query))).apply {
                        setPackage("com.google.android.youtube")
                    }
                }
                "maps" -> {
                    Intent(Intent.ACTION_VIEW, Uri.parse("geo:0,0?q=" + Uri.encode(query))).apply {
                        setPackage("com.google.android.apps.maps")
                    }
                }
                "spotify" -> {
                    Intent(Intent.ACTION_VIEW, Uri.parse("spotify:search:" + Uri.encode(query)))
                }
                "playstore" -> {
                    Intent(Intent.ACTION_VIEW, Uri.parse("market://search?q=" + Uri.encode(query)))
                }
                "whatsapp" -> {
                    Intent(Intent.ACTION_VIEW, Uri.parse("https://api.whatsapp.com/send?text=" + Uri.encode(query))).apply {
                        setPackage("com.whatsapp")
                    }
                }
                else -> {
                    Intent(Intent.ACTION_VIEW, Uri.parse("https://www.google.com/search?q=" + Uri.encode("$appKey $query")))
                }
            }
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(intent)
            true
        } catch (e: Exception) {
            openWebSearch(context, "$appKey $query")
        }
    }
}
