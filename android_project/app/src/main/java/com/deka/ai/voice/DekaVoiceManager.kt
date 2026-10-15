package com.deka.ai.voice

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.util.Log
import java.util.Locale

class DekaVoiceManager(
    private val context: Context,
    private val onSpeechResult: (String) -> Unit,
    private val onWakeWordDetected: () -> Unit,
    private val onListeningStateChanged: (Boolean) -> Unit,
    private val onError: (String) -> Unit
) : RecognitionListener, TextToSpeech.OnInitListener {

    private var speechRecognizer: SpeechRecognizer? = null
    private var textToSpeech: TextToSpeech? = null
    private var isTtsReady = false
    private var currentLanguageLocale: Locale = Locale.forLanguageTag("hi-IN") // default Hindi/English auto
    private var isContinuousListening = false

    init {
        textToSpeech = TextToSpeech(context, this)
        initSpeechRecognizer()
    }

    private fun initSpeechRecognizer() {
        if (SpeechRecognizer.isRecognitionAvailable(context)) {
            speechRecognizer = SpeechRecognizer.createSpeechRecognizer(context).apply {
                setRecognitionListener(this@DekaVoiceManager)
            }
        } else {
            onError("Speech recognition service not available on this device")
        }
    }

    fun setLanguage(languageCode: String) {
        currentLanguageLocale = when (languageCode.lowercase()) {
            "hi", "hindi" -> Locale("hi", "IN")
            "en", "english" -> Locale.US
            else -> Locale.getDefault()
        }
        if (isTtsReady) {
            textToSpeech?.language = currentLanguageLocale
        }
    }

    fun startListening(continuous: Boolean = false) {
        isContinuousListening = continuous
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, currentLanguageLocale.toLanguageTag())
            putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
            putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 3)
            // Support both Hindi and English prompts
            putExtra("android.speech.extra.EXTRA_ADDITIONAL_LANGUAGES", arrayOf("hi-IN", "en-US", "en-IN"))
        }

        try {
            speechRecognizer?.startListening(intent)
            onListeningStateChanged(true)
        } catch (e: Exception) {
            onError("Failed to start voice recognition: ${e.message}")
            onListeningStateChanged(false)
        }
    }

    fun stopListening() {
        isContinuousListening = false
        speechRecognizer?.stopListening()
        onListeningStateChanged(false)
    }

    fun speak(text: String, onDone: (() -> Unit)? = null) {
        if (!isTtsReady) {
            Log.w("DekaVoice", "TTS not initialized yet")
            return
        }

        val utteranceId = "DekaTTS_${System.currentTimeMillis()}"
        textToSpeech?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
            override fun onStart(utteranceId: String?) {}
            override fun onDone(id: String?) {
                if (id == utteranceId) onDone?.invoke()
            }
            override fun onError(id: String?) {}
        })

        textToSpeech?.speak(text, TextToSpeech.QUEUE_FLUSH, null, utteranceId)
    }

    fun stopSpeaking() {
        textToSpeech?.stop()
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            isTtsReady = true
            textToSpeech?.language = currentLanguageLocale
        } else {
            Log.e("DekaVoice", "TTS Initialization failed")
        }
    }

    override fun onResults(results: Bundle?) {
        val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
        val text = matches?.firstOrNull() ?: ""

        if (text.isNotBlank()) {
            val lower = text.lowercase()
            if (lower.contains("hey deka") || lower.contains("हे डेका") || lower.contains("deka")) {
                onWakeWordDetected()
            }
            onSpeechResult(text)
        }

        onListeningStateChanged(false)

        if (isContinuousListening) {
            startListening(true)
        }
    }

    override fun onPartialResults(partialResults: Bundle?) {}
    override fun onReadyForSpeech(params: Bundle?) {}
    override fun onBeginningOfSpeech() {}
    override fun onRmsChanged(rmsdB: Float) {}
    override fun onBufferReceived(buffer: ByteArray?) {}
    override fun onEndOfSpeech() {
        onListeningStateChanged(false)
    }
    override fun onError(error: Int) {
        onListeningStateChanged(false)
        if (isContinuousListening) {
            startListening(true)
        }
    }
    override fun onEvent(eventType: Int, params: Bundle?) {}

    fun destroy() {
        speechRecognizer?.destroy()
        textToSpeech?.stop()
        textToSpeech?.shutdown()
    }
}
