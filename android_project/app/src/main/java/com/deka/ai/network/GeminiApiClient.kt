package com.deka.ai.network

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.util.concurrent.TimeUnit

class GeminiApiClient(
    private val backendBaseUrl: String = "https://deka-ai-api.yourserver.com"
) {
    private val client = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)
        .build()

    data class Message(val role: String, val content: String)
    data class ChatResponse(val reply: String, val detectedIntent: String?, val actionPayload: String?)

    suspend fun sendChatMessage(
        messages: List<Message>,
        language: String = "auto"
    ): Result<ChatResponse> = withContext(Dispatchers.IO) {
        try {
            val jsonArray = JSONArray()
            for (msg in messages) {
                val obj = JSONObject()
                obj.put("role", msg.role)
                obj.put("content", msg.content)
                jsonArray.put(obj)
            }

            val bodyJson = JSONObject().apply {
                put("messages", jsonArray)
                put("language", language)
            }

            val requestBody = bodyJson.toString().toRequestBody("application/json".toMediaType())
            val request = Request.Builder()
                .url("$backendBaseUrl/api/chat")
                .post(requestBody)
                .build()

            val response = client.newCall(request).execute()
            if (!response.isSuccessful) {
                return@withContext Result.failure(Exception("Server returned status: ${response.code}"))
            }

            val responseBody = response.body?.string() ?: ""
            val json = JSONObject(responseBody)
            val reply = json.optString("reply", "No response received.")
            val detectedIntent = if (json.has("intent")) json.optString("intent") else null
            val actionPayload = if (json.has("actionPayload")) json.optString("actionPayload") else null

            Result.success(ChatResponse(reply, detectedIntent, actionPayload))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
