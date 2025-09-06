'use client';

import { useState, useCallback } from 'react';
import { MicButton } from './MicButton';
import { VoiceRecorder } from '@/lib/voice-recorder';
import { OpenAIService } from '@/lib/openai';
import { SupabaseService } from '@/lib/supabase';
import { VoiceRecordingState, AIParseResult } from '@/lib/types';
import { CheckCircle, AlertCircle, Calendar, CheckSquare } from 'lucide-react';

interface VoiceInterfaceProps {
  userId: string;
  onTaskCreated?: () => void;
  onEventCreated?: () => void;
}

export function VoiceInterface({ userId, onTaskCreated, onEventCreated }: VoiceInterfaceProps) {
  const [recordingState, setRecordingState] = useState<VoiceRecordingState>({
    isRecording: false,
    isProcessing: false,
    transcript: '',
    error: null,
  });

  const [lastResult, setLastResult] = useState<AIParseResult | null>(null);
  const [voiceRecorder] = useState(() => new VoiceRecorder());

  const handleStartRecording = useCallback(async () => {
    try {
      setRecordingState(prev => ({ ...prev, error: null }));
      await voiceRecorder.startRecording();
      setRecordingState(prev => ({ ...prev, isRecording: true }));
    } catch (error) {
      setRecordingState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to start recording'
      }));
    }
  }, [voiceRecorder]);

  const handleStopRecording = useCallback(async () => {
    try {
      setRecordingState(prev => ({ ...prev, isRecording: false, isProcessing: true }));
      
      const audioBlob = await voiceRecorder.stopRecording();
      
      // Transcribe audio
      const transcript = await OpenAIService.transcribeAudio(audioBlob);
      setRecordingState(prev => ({ ...prev, transcript }));
      
      // Parse the transcript
      const parseResult = await OpenAIService.parseVoiceCommand(transcript);
      setLastResult(parseResult);
      
      // Create task or event based on parse result
      if (parseResult.type === 'task' && parseResult.description) {
        await SupabaseService.createTask({
          userId,
          description: parseResult.description,
          isCompleted: false,
          dueDate: parseResult.dueDate,
        });
        onTaskCreated?.();
      } else if (parseResult.type === 'event' && parseResult.title) {
        await SupabaseService.createEvent({
          userId,
          title: parseResult.title,
          startTime: parseResult.startTime || new Date().toISOString(),
          endTime: parseResult.endTime || new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          reminderTime: parseResult.reminderTime || new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        });
        onEventCreated?.();
      }
      
      setRecordingState(prev => ({ ...prev, isProcessing: false }));
    } catch (error) {
      setRecordingState(prev => ({
        ...prev,
        isProcessing: false,
        error: error instanceof Error ? error.message : 'Failed to process recording'
      }));
    }
  }, [voiceRecorder, userId, onTaskCreated, onEventCreated]);

  return (
    <div className="text-center space-y-8">
      {/* Main Voice Interface */}
      <div className="relative">
        <MicButton
          isRecording={recordingState.isRecording}
          isProcessing={recordingState.isProcessing}
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
        />
        
        {/* Recording Visualization */}
        {recordingState.isRecording && (
          <div className="absolute -inset-4 rounded-full border-2 border-purple-400 animate-ping"></div>
        )}
      </div>

      {/* Status Messages */}
      {recordingState.error && (
        <div className="glass-card p-4 max-w-md mx-auto">
          <div className="flex items-center space-x-2 text-red-300">
            <AlertCircle size={20} />
            <span className="text-sm">{recordingState.error}</span>
          </div>
        </div>
      )}

      {recordingState.transcript && (
        <div className="glass-card p-4 max-w-md mx-auto">
          <h3 className="text-white font-medium mb-2">You said:</h3>
          <p className="text-purple-200 text-sm italic">"{recordingState.transcript}"</p>
        </div>
      )}

      {lastResult && (
        <div className="glass-card p-4 max-w-md mx-auto">
          <div className="flex items-center space-x-2 text-green-300 mb-2">
            <CheckCircle size={20} />
            <span className="font-medium">
              {lastResult.type === 'task' ? 'Task Created!' : 'Event Scheduled!'}
            </span>
          </div>
          
          <div className="flex items-start space-x-2 text-sm">
            {lastResult.type === 'task' ? (
              <CheckSquare size={16} className="text-purple-300 mt-0.5 flex-shrink-0" />
            ) : (
              <Calendar size={16} className="text-purple-300 mt-0.5 flex-shrink-0" />
            )}
            <span className="text-purple-200">
              {lastResult.description || lastResult.title}
            </span>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="glass-card p-6 max-w-lg mx-auto">
        <h3 className="text-white font-medium mb-3">Voice Commands</h3>
        <div className="space-y-2 text-sm text-purple-200">
          <p>• "Remind me to buy milk tomorrow at 5 PM"</p>
          <p>• "Schedule meeting with John for Tuesday at 10 AM"</p>
          <p>• "Call mom this evening"</p>
          <p>• "Doctor appointment next Friday at 2 PM"</p>
        </div>
      </div>
    </div>
  );
}
