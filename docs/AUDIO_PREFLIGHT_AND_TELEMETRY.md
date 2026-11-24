# Audio Hardware Pre-Flight & Candidate Telemetry Architecture

## 1. Motivation & Context

In high-stakes technical mock interviews, technical friction caused by misconfigured microphones, low input gain, or browser permission restrictions leads to degraded Speech-to-Text transcription. 

The IntervAI Lobby (`InterviewLobbyPage.jsx`) integrates an interactive pre-flight audio hardware verification protocol to certify candidate readiness before starting a session.

---

## 2. Audio Verification Architecture

```
[Candidate Voice]
       │
       ▼
[navigator.mediaDevices.getUserMedia]
       │
       ▼
[Web Audio AudioContext]
       │
       ▼
[AnalyserNode (fftSize=256)]
       │
       ├──> requestAnimationFrame Frequency Byte Extraction
       ├──> RMS Volume Level Normalization (0-100%)
       └──> Visual Amplitude Progress Meter in UI
```

---

## 3. Acoustic Signal Processing (`MicAudioTester`)

### Frequency Sampling & RMS Normalization
- **FFT Window**: 256 frequency bins provide real-time sensitivity with minimal CPU footprint.
- **Normalized Volume Index**:
  $$\text{Level} = \min\left(100, \text{round}\left(\frac{\sum_{i=0}^{N-1} b_i}{N \cdot 128} \times 100\right)\right)$$
- **Graceful Lifecycle Management**:
  - Automatically terminates audio tracks on completion or unmount (`requestAnimationFrame` canceled, `MediaStream` tracks stopped, `AudioContext.close()`).
  - Guarantees zero background microphone hold when navigating away from the lobby.

---

## 4. Candidate Experience & Verification Matrix

| State | Visual Feedback | Threshold | Candidate Guidance |
|---|---|---|---|
| Idle | Grey icon, "Test speech detection" | — | Click "Check Mic" |
| Active Listening | Green pulsing meter, live percentage | 0–100% | Speak into your microphone |
| Verified | Emerald checkmark, "Speech ready" | Level > 10% | Verified! Ready for interview |
| Permission Denied | Amber warning icon | Error | Text fallback mode automatically active |
