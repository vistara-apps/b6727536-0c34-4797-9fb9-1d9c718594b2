import { NextRequest, NextResponse } from 'next/server';
import { OpenAIService } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transcript } = body;

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      );
    }

    const parseResult = await OpenAIService.parseVoiceCommand(transcript);

    return NextResponse.json({ parseResult });
  } catch (error) {
    console.error('Error parsing voice command:', error);
    return NextResponse.json(
      { error: 'Failed to parse voice command' },
      { status: 500 }
    );
  }
}
