import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Play, Pause, Trash2, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'motion/react';

interface VoiceRecorderProps {
  onRecordingComplete: (hasRecording: boolean, audioBlob?: Blob, duration?: number) => void;
  language: string;
}

export function VoiceRecorder({ onRecordingComplete, language }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevels, setAudioLevels] = useState<number[]>(Array(20).fill(0));
  const [error, setError] = useState<string>('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recordingTimeRef = useRef<number>(0);  // Track actual recording time

  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          recordingTimeRef.current = newTime;  // Keep ref in sync
          return newTime;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Visualize audio levels during recording
  const visualizeAudio = () => {
    if (!analyserRef.current || !isRecording) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Sample the frequency data to create bar heights
    const bars = 20;
    const step = Math.floor(dataArray.length / bars);
    const newLevels = Array(bars).fill(0).map((_, i) => {
      const index = i * step;
      return (dataArray[index] / 255) * 100;
    });

    setAudioLevels(newLevels);
    animationFrameRef.current = requestAnimationFrame(visualizeAudio);
  };

  const handleStartRecording = async () => {
    try {
      setError('');

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      streamRef.current = stream;

      // Set up audio analyzer for waveform visualization
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Set up MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType
        });
        setAudioBlob(blob);
        setHasRecording(true);

        // Calculate duration in seconds using ref (avoids stale closure)
        const duration = recordingTimeRef.current / 10;
        onRecordingComplete(true, blob, duration);

        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimeRef.current = 0;  // Reset ref as well
      setHasRecording(false);

      // Start audio visualization
      visualizeAudio();

    } catch (err) {
      console.error('Error accessing microphone:', err);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Microphone access denied. Please enable it in your browser settings.');
        } else if (err.name === 'NotFoundError') {
          setError('No microphone found. Please connect a microphone.');
        } else {
          setError('Failed to access microphone. Please try again.');
        }
      }
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioLevels(Array(20).fill(0));

      // Stop animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }
  };

  const handleDeleteRecording = () => {
    setHasRecording(false);
    setRecordingTime(0);
    setIsPlaying(false);
    setAudioBlob(null);
    onRecordingComplete(false);

    // Clean up audio element
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
  };

  const handlePlayPause = () => {
    if (!audioBlob) return;

    if (!audioRef.current) {
      // Create audio element
      const audio = new Audio(URL.createObjectURL(audioBlob));
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
      };
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (centiseconds: number) => {
    const totalSeconds = Math.floor(centiseconds / 10);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const cs = centiseconds % 10;

    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, '0')}.${cs}`;
    }
    return `${seconds}.${cs}s`;
  };

  // Show error message
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800 mb-2">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setError('');
                handleStartRecording();
              }}
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (hasRecording) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              Voice Note Recorded
            </span>
          </div>
          <span className="text-xs text-green-600">
            {formatTime(recordingTime)}
          </span>
        </div>

        {/* Waveform visualization (static for recorded audio) */}
        <div className="flex items-center gap-1 h-8 mb-3">
          {Array(30).fill(0).map((_, i) => (
            <div
              key={i}
              className="bg-green-300 rounded-full flex-1"
              style={{
                height: `${Math.random() * 70 + 10}%`,
                minHeight: '2px'
              }}
            />
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePlayPause}
            className="flex-1"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 mr-1" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-1" />
                Play
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDeleteRecording}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  if (isRecording) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Mic className="w-4 h-4 text-red-600" />
            </motion.div>
            <span className="text-sm font-medium text-red-800">
              Recording...
            </span>
          </div>
          <span className="text-xs text-red-600 font-mono">
            {formatTime(recordingTime)}
          </span>
        </div>

        {/* Real-time waveform visualization */}
        <div className="flex items-center gap-1 h-8 mb-3">
          {audioLevels.map((level, i) => (
            <motion.div
              key={i}
              className="bg-red-400 rounded-full flex-1"
              style={{ height: `${level * 0.6 + 10}%`, minHeight: '2px' }}
              animate={{ height: `${level * 0.6 + 10}%` }}
              transition={{ duration: 0.1 }}
            />
          ))}
        </div>

        <Button
          variant="destructive"
          size="sm"
          onClick={handleStopRecording}
          className="w-full"
        >
          <MicOff className="w-4 h-4 mr-2" />
          Stop Recording
        </Button>
      </div>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleStartRecording}
      className="w-full"
    >
      <Mic className="w-4 h-4 mr-2" />
      Record Voice Note
    </Button>
  );
}