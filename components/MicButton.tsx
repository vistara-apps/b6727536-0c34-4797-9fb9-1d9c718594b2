'use client';

import { Mic, MicOff, Loader2 } from 'lucide-react';

interface MicButtonProps {
  isRecording: boolean;
  isProcessing: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  disabled?: boolean;
}

export function MicButton({
  isRecording,
  isProcessing,
  onStartRecording,
  onStopRecording,
  disabled = false
}: MicButtonProps) {
  const handleClick = () => {
    if (disabled || isProcessing) return;
    
    if (isRecording) {
      onStopRecording();
    } else {
      onStartRecording();
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <button
        onClick={handleClick}
        disabled={disabled || isProcessing}
        className={`
          mic-button
          ${isRecording ? 'recording' : ''}
          ${disabled || isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {isProcessing ? (
          <Loader2 size={32} className="text-white animate-spin" />
        ) : isRecording ? (
          <MicOff size={32} className="text-white" />
        ) : (
          <Mic size={32} className="text-white" />
        )}
      </button>

      <div className="text-center">
        {isProcessing ? (
          <p className="text-purple-200 text-sm">Processing your voice...</p>
        ) : isRecording ? (
          <p className="text-white font-medium">Recording... Tap to stop</p>
        ) : (
          <p className="text-purple-200 text-sm">Tap to start recording</p>
        )}
      </div>
    </div>
  );
}
