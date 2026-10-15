package com.deka.ai.auth

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.tasks.await

class FirebaseAuthManager {

    private val auth: FirebaseAuth = FirebaseAuth.getInstance()
    private val firestore: FirebaseFirestore = FirebaseFirestore.getInstance()

    val currentUser: FirebaseUser?
        get() = auth.currentUser

    suspend fun signUpWithEmail(email: String, pass: String, displayName: String? = null): Result<FirebaseUser> {
        return try {
            val result = auth.createUserWithEmailAndPassword(email, pass).await()
            val user = result.user ?: throw Exception("User creation returned null")

            // Initialize user settings in Firestore
            val userProfile = hashMapOf(
                "userId" to user.uid,
                "email" to (user.email ?: email),
                "displayName" to (displayName ?: ""),
                "language" to "auto",
                "theme" to "futuristic-dark",
                "ttsEnabled" to true,
                "speechRate" to 1.0,
                "createdAt" to System.currentTimeMillis().toString(),
                "updatedAt" to System.currentTimeMillis().toString()
            )
            firestore.collection("users").document(user.uid).set(userProfile).await()

            Result.success(user)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun signInWithEmail(email: String, pass: String): Result<FirebaseUser> {
        return try {
            val result = auth.signInWithEmailAndPassword(email, pass).await()
            val user = result.user ?: throw Exception("Sign in returned null")
            Result.success(user)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun sendPasswordReset(email: String): Result<Unit> {
        return try {
            auth.sendPasswordResetEmail(email).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    fun signOut() {
        auth.signOut()
    }

    suspend fun syncChatSession(sessionId: String, title: String, messages: List<Map<String, Any>>): Result<Unit> {
        val user = currentUser ?: return Result.failure(Exception("Not authenticated"))
        return try {
            val sessionDoc = firestore.collection("users")
                .document(user.uid)
                .collection("sessions")
                .document(sessionId)

            val sessionData = hashMapOf(
                "id" to sessionId,
                "userId" to user.uid,
                "title" to title,
                "updatedAt" to System.currentTimeMillis()
            )
            sessionDoc.set(sessionData).await()

            // Save messages
            for (msg in messages) {
                val msgId = msg["id"] as? String ?: System.currentTimeMillis().toString()
                sessionDoc.collection("messages").document(msgId).set(msg).await()
            }

            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
