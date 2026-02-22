import { useState, useRef, useCallback } from "react";

export function useRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const recorderRef = useRef<any>(null);
  const startTimeRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    const RecordRTC = (await import("recordrtc")).default;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new RecordRTC(stream, {
      type: "audio",
      mimeType: "audio/wav",
      recorderType: RecordRTC.StereoAudioRecorder,
      numberOfAudioChannels: 1,
      desiredSampRate: 44100,
    });
    recorder.startRecording();
    recorderRef.current = recorder;
    startTimeRef.current = Date.now();
    setIsRecording(true);
    setDuration(0);
    intervalRef.current = setInterval(() => {
      setDuration((Date.now() - startTimeRef.current) / 1000);
    }, 100);
  }, []);

  const stopRecording = useCallback((): Promise<Blob> => {
    return new Promise((resolve) => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      recorderRef.current?.stopRecording(() => {
        const blob = recorderRef.current.getBlob();
        setAudioBlob(blob);
        setIsRecording(false);
        recorderRef.current.stream?.getTracks().forEach((t: MediaStreamTrack) => t.stop());
        resolve(blob);
      });
    });
  }, []);

  const resetRecording = useCallback(() => {
    setAudioBlob(null);
    setDuration(0);
  }, []);

  return { isRecording, audioBlob, duration, startRecording, stopRecording, resetRecording };
}
