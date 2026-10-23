# On-Device Local AI Setup — MediaPipe GenAI & Gemma 2B

## 1. Local AI Architecture

JARVIS implements a **hybrid edge architecture**:
1. **Primary Layer**: Autonomous Deterministic Intent Classifier & Regex Parser running with 0ms latency on CPU, requiring 0MB additional model weights.
2. **Advanced Generative Layer**: On-device Large Language Model (LLM) powered by **Google MediaPipe Tasks GenAI** using **Gemma 2B int4**.

```
User Query (Spoken or Typed)
          │
          ▼
┌─────────────────────────────────┐
│ Intent Classifier (On-Device)   │ ──[Match: Reminder/Task/Shortcut]──► Deterministic Action
└─────────────────────────────────┘
          │ (Unmatched / Creative / Explanatory)
          ▼
┌─────────────────────────────────┐
│ Device RAM & Hardware Check     │ ──[RAM < 3.5GB or No Model File]──► Safe Rule Fallback
└─────────────────────────────────┘
          │ (Hardware OK & Model Present)
          ▼
┌─────────────────────────────────┐
│ MediaPipe Tasks GenAI (Gemma 2B)│ ──► On-Device Synthesized Intelligence
└─────────────────────────────────┘
```

---

## 2. Hardware Requirements for On-Device LLM

- **Target Phone RAM**: Minimum 6GB physical RAM (4GB dedicated to OS + 1.8GB available for model execution).
- **Storage**: ~1.4GB free internal storage for the quantized `.bin` model file.
- **GPU Acceleration**: Snapdragon 8 Gen 1/2/3, Dimensity 9000+, or Google Tensor G2/G3 with Vulkan / OpenCL support.

---

## 3. Provisioning the Model File

1. Obtain the authorized quantized model weights:
   - Model: **Gemma-2b-it-gpu-int4.bin**
   - Source: Kaggle Models or Hugging Face under the Gemma Terms of Use.
2. Push the model to the app's internal files directory using ADB:
   ```bash
   adb shell mkdir -p /data/data/com.stark.jarvis/files/models
   adb push gemma-2b-it-gpu-int4.bin /data/data/com.stark.jarvis/files/models/
   ```
3. Restart JARVIS. The `LocalAiEngine` will automatically verify the file and transition from `FallbackRuleBased` to `Ready`.
