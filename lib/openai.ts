import OpenAI from 'openai';
import { AIParseResult } from './types';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
  baseURL: "https://openrouter.ai/api/v1",
  dangerouslyAllowBrowser: true,
});

export class OpenAIService {
  static async transcribeAudio(audioBlob: Blob): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-1');

      const response = await openai.audio.transcriptions.create({
        file: audioBlob,
        model: 'whisper-1',
      });

      return response.text;
    } catch (error) {
      console.error('Error transcribing audio:', error);
      throw new Error('Failed to transcribe audio');
    }
  }

  static async parseVoiceCommand(transcript: string): Promise<AIParseResult> {
    try {
      const prompt = `
        Parse the following voice command and determine if it's a task or calendar event.
        Extract relevant details and return a JSON object.

        Voice command: "${transcript}"

        Return JSON in this format:
        {
          "type": "task" | "event",
          "description": "task description (for tasks)",
          "title": "event title (for events)",
          "dueDate": "ISO date string (optional)",
          "startTime": "ISO date string (for events)",
          "endTime": "ISO date string (for events)",
          "reminderTime": "ISO date string (optional)"
        }

        Examples:
        - "Remind me to buy milk tomorrow at 5 PM" → task with dueDate
        - "Schedule meeting with John for Tuesday at 10 AM" → event
        - "Call mom" → simple task without date
        - "Doctor appointment next Friday at 2 PM" → event

        Current date/time: ${new Date().toISOString()}
      `;

      const response = await openai.chat.completions.create({
        model: 'google/gemini-2.0-flash-001',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that parses voice commands into structured task or event data. Always return valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI');
      }

      return JSON.parse(content) as AIParseResult;
    } catch (error) {
      console.error('Error parsing voice command:', error);
      // Fallback: treat as simple task
      return {
        type: 'task',
        description: transcript,
      };
    }
  }
}
