"""
Kokoro TTS Server — OpenAI-compatible /v1/audio/speech endpoint.

Uses kokoro-onnx (pure Python, no Docker needed).

Install once:
    pip install kokoro-onnx soundfile fastapi uvicorn

Run:
    python kokoro_server.py

Then set in backend/.env:
    KOKORO_URL=http://localhost:8880
    KOKORO_VOICE=af_bella
"""

import io
import os
import sys
import logging

# ── Check dependencies ───────────────────────────────────────────────────────
try:
    import numpy as np
    import soundfile as sf
    from kokoro_onnx import Kokoro
    from fastapi import FastAPI, HTTPException
    from fastapi.responses import StreamingResponse, JSONResponse
    from pydantic import BaseModel
    import uvicorn
except ImportError as e:
    print(f"\n[ERROR] Missing dependency: {e}")
    print("\nInstall with:")
    print("  pip install kokoro-onnx soundfile fastapi uvicorn numpy\n")
    sys.exit(1)

logging.basicConfig(level=logging.INFO, format="%(asctime)s  %(levelname)s  %(message)s")
log = logging.getLogger("kokoro-server")

# ── Load model ───────────────────────────────────────────────────────────────
PORT = int(os.environ.get("KOKORO_PORT", 8880))

log.info("Loading Kokoro model… (first run downloads ~300 MB)")
try:
    kokoro = Kokoro.from_pretrained("hexgrad/Kokoro-82M")
    log.info("Kokoro model loaded OK  —  default voice: af_heart")
except Exception as e:
    log.error(f"Failed to load Kokoro model: {e}")
    sys.exit(1)

# All available voices (Kokoro 82M v1.0)
VOICES = [
    # American English female
    {"id": "af_bella",   "name": "Bella (US Female)"},
    {"id": "af_sarah",   "name": "Sarah (US Female)"},
    {"id": "af_heart",   "name": "Heart (US Female)"},
    {"id": "af_nicole",  "name": "Nicole (US Female)"},
    {"id": "af_sky",     "name": "Sky (US Female)"},
    # American English male
    {"id": "am_adam",    "name": "Adam (US Male)"},
    {"id": "am_michael", "name": "Michael (US Male)"},
    # British English female
    {"id": "bf_emma",    "name": "Emma (UK Female)"},
    {"id": "bf_isabella","name": "Isabella (UK Female)"},
    # British English male
    {"id": "bm_george",  "name": "George (UK Male)"},
    {"id": "bm_lewis",   "name": "Lewis (UK Male)"},
]

VOICE_IDS = {v["id"] for v in VOICES}

# ── FastAPI app ──────────────────────────────────────────────────────────────
app = FastAPI(title="Kokoro TTS Server", version="1.0.0")


class SpeechRequest(BaseModel):
    model: str = "kokoro"
    input: str
    voice: str = "af_bella"
    speed: float = 1.0
    response_format: str = "mp3"   # mp3 | wav | flac | opus


@app.get("/v1/voices")
def list_voices():
    """Return available voices — matches OpenAI voices endpoint shape."""
    return VOICES


@app.get("/health")
def health():
    return {"status": "ok", "model": "kokoro-82m", "voices": len(VOICES)}


@app.post("/v1/audio/speech")
def synthesise(req: SpeechRequest):
    """
    OpenAI-compatible TTS endpoint.
    Returns audio bytes in the requested format.
    """
    text = req.input.strip()
    if not text:
        raise HTTPException(status_code=400, detail="input text is required")
    if len(text) > 2000:
        raise HTTPException(status_code=400, detail="input must be ≤ 2000 characters")

    voice = req.voice if req.voice in VOICE_IDS else "af_heart"
    speed = max(0.5, min(2.0, req.speed))
    fmt   = req.response_format if req.response_format in ("mp3", "wav", "flac", "opus") else "mp3"

    log.info(f"TTS  voice={voice}  speed={speed}  format={fmt}  len={len(text)}")

    try:
        # Generate audio — returns (samples: np.ndarray, sample_rate: int)
        samples, sample_rate = kokoro.create(text, voice=voice, speed=speed, lang="en-us")
    except Exception as e:
        log.error(f"Kokoro synthesis error: {e}")
        raise HTTPException(status_code=500, detail=f"Synthesis failed: {e}")

    # ── Encode to requested format ───────────────────────────────────────
    buf = io.BytesIO()

    fmt_map = {
        "mp3":  "mp3",
        "wav":  "wav",
        "flac": "flac",
        "opus": "ogg",   # soundfile uses 'ogg' for opus
    }
    mime_map = {
        "mp3":  "audio/mpeg",
        "wav":  "audio/wav",
        "flac": "audio/flac",
        "opus": "audio/ogg",
    }

    sf_format = fmt_map[fmt]
    try:
        sf.write(buf, samples, sample_rate, format=sf_format)
    except Exception:
        # mp3 needs extra codec — fall back to wav silently
        buf = io.BytesIO()
        sf.write(buf, samples, sample_rate, format="wav")
        mime_map[fmt] = "audio/wav"

    buf.seek(0)
    return StreamingResponse(
        buf,
        media_type=mime_map[fmt],
        headers={"Cache-Control": "no-cache"},
    )


# ── Entry point ──────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print(f"\n{'='*50}")
    print(f"  Kokoro TTS Server — http://localhost:{PORT}")
    print(f"  Default voice : af_heart (Soft US Female)")
    print(f"  Voices        : {len(VOICES)} available")
    print(f"  Endpoint      : POST /v1/audio/speech")
    print(f"{'='*50}\n")
    uvicorn.run(app, host="0.0.0.0", port=PORT, log_level="warning")
