import { useCallback, useEffect, useRef, useState } from 'react';

// Real, working browser-native proctoring signals:
//  - camera/mic permission + live stream (MediaDevices.getUserMedia)
//  - tab switch detection (Page Visibility API)
//  - fullscreen exit detection (Fullscreen API)
//  - audio anomaly detection (Web Audio API analyser, sustained loudness)
//
// Face-presence/multiple-face detection is intentionally left as an
// explicit extension point (see README "Proctoring limitations"): robust
// face detection needs a model (e.g. MediaPipe Face Landmarker) whose
// binary assets this scaffold does not vendor. Where the experimental
// browser-native FaceDetector (Shape Detection API) is available, we use
// it for a best-effort signal; otherwise the hook reports that face
// detection is unavailable rather than fabricating events.
export default function useProctoring({ onEvent, audioConfig }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const rafRef = useRef(null);
  const faceDetectorRef = useRef(null);
  const lastAudioEventRef = useRef(0);
  const loudSinceRef = useRef(null);

  const [cameraGranted, setCameraGranted] = useState(false);
  const [micGranted, setMicGranted] = useState(false);
  const [faceDetectionSupported, setFaceDetectionSupported] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const requestPermissions = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    streamRef.current = stream;
    setCameraGranted(stream.getVideoTracks().length > 0);
    setMicGranted(stream.getAudioTracks().length > 0);
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      await videoRef.current.play().catch(() => {});
    }

    // Audio analysis
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      const ctx = new AudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
    }

    // Best-effort native face detector (experimental; not supported in most browsers)
    if ('FaceDetector' in window) {
      try {
        faceDetectorRef.current = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 5 });
        setFaceDetectionSupported(true);
      } catch {
        setFaceDetectionSupported(false);
      }
    } else {
      setFaceDetectionSupported(false);
    }

    return stream;
  }, []);

  const stopAll = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
  }, []);

  // Audio anomaly loop
  useEffect(() => {
    const cfg = audioConfig || { thresholdDb: -20, minDurationMs: 1500, cooldownMs: 5000 };

    function tick() {
      const analyser = analyserRef.current;
      if (analyser) {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((s, v) => s + v, 0) / data.length; // 0-255
        const approxDb = 20 * Math.log10(avg / 255 || 0.0001);

        const now = Date.now();
        if (approxDb > cfg.thresholdDb) {
          if (!loudSinceRef.current) loudSinceRef.current = now;
          const sustained = now - loudSinceRef.current;
          if (sustained >= cfg.minDurationMs && now - lastAudioEventRef.current > cfg.cooldownMs) {
            lastAudioEventRef.current = now;
            onEvent?.('AUDIO_ANOMALY', { approxDb: Math.round(approxDb) });
          }
        } else {
          loudSinceRef.current = null;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onEvent]);

  // Face detection loop (only runs if the native API is available)
  useEffect(() => {
    if (!faceDetectionSupported) return;
    let cancelled = false;
    let wasVisible = true;

    async function detectLoop() {
      if (cancelled || !videoRef.current || !faceDetectorRef.current) return;
      try {
        const faces = await faceDetectorRef.current.detect(videoRef.current);
        if (faces.length === 0) {
          onEvent?.('FACE_NOT_DETECTED', {});
          wasVisible = false;
        } else if (faces.length > 1) {
          onEvent?.('MULTIPLE_FACES', { count: faces.length });
        } else if (!wasVisible) {
          onEvent?.('FACE_RETURNED', {});
          wasVisible = true;
        }
      } catch {
        // detector not ready / frame not decodable yet - ignore this tick
      }
      setTimeout(detectLoop, 4000); // gentle polling interval
    }
    detectLoop();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [faceDetectionSupported]);

  // Tab switch detection (Page Visibility API)
  useEffect(() => {
    const handler = () => {
      if (document.hidden) onEvent?.('TAB_SWITCH', {});
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onEvent]);

  // Fullscreen monitoring (Fullscreen API)
  const enterFullscreen = useCallback(async (el) => {
    const target = el || document.documentElement;
    if (target.requestFullscreen) await target.requestFullscreen();
    setIsFullscreen(true);
  }, []);

  useEffect(() => {
    const handler = () => {
      const nowFullscreen = !!document.fullscreenElement;
      setIsFullscreen(nowFullscreen);
      if (!nowFullscreen) onEvent?.('FULLSCREEN_EXIT', {});
    };
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onEvent]);

  useEffect(() => () => stopAll(), [stopAll]);

  return {
    videoRef,
    requestPermissions,
    enterFullscreen,
    stopAll,
    cameraGranted,
    micGranted,
    faceDetectionSupported,
    isFullscreen,
  };
}
