# VoiceFlow AI - Base Mini App

**Speak your tasks, master your day.**

A production-ready Next.js Base mini-app that transforms spoken thoughts into actionable to-do lists and scheduled calendar events with smart reminders. Built with Next.js 15, TypeScript, and integrated with Base blockchain.

## Features

- **Voice-to-Structured Tasks**: Convert spoken requests into clear, actionable to-do items
- **Voice-to-Calendar Events**: Transform spoken appointments into calendar entries with reminders
- **Smart Task Management**: Complete, track, and organize your tasks
- **Calendar Integration**: Schedule and manage events with intelligent parsing
- **Base Integration**: Built on Base blockchain with wallet connectivity

## Tech Stack

- **Frontend**: Next.js 15 with App Router, TypeScript, Tailwind CSS
- **Blockchain**: Base (via OnchainKit and MiniKit)
- **AI**: OpenAI API for speech-to-text and natural language processing
- **Database**: Supabase for task and event storage
- **Voice**: Web Audio API for recording

## Getting Started

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd voiceflow-ai
   npm install
   ```

2. **Environment Setup**
   Copy `.env.example` to `.env.local` and fill in your API keys:
   ```bash
   cp .env.example .env.local
   ```

   Required API keys:
   - `NEXT_PUBLIC_OPENAI_API_KEY`: OpenAI API key for speech processing
   - `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
   - `NEXT_PUBLIC_ONCHAINKIT_API_KEY`: OnchainKit API key

3. **Database Setup**
   Create these tables in your Supabase database:

   ```sql
   -- Users table
   CREATE TABLE users (
     userId TEXT PRIMARY KEY,
     createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Tasks table
   CREATE TABLE tasks (
     taskId TEXT PRIMARY KEY,
     userId TEXT REFERENCES users(userId),
     description TEXT NOT NULL,
     isCompleted BOOLEAN DEFAULT FALSE,
     createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     dueDate TIMESTAMP WITH TIME ZONE
   );

   -- Events table
   CREATE TABLE events (
     eventId TEXT PRIMARY KEY,
     userId TEXT REFERENCES users(userId),
     title TEXT NOT NULL,
     startTime TIMESTAMP WITH TIME ZONE NOT NULL,
     endTime TIMESTAMP WITH TIME ZONE NOT NULL,
     reminderTime TIMESTAMP WITH TIME ZONE,
     createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## Usage

### Voice Commands

The app understands natural language voice commands:

**For Tasks:**
- "Remind me to buy milk tomorrow at 5 PM"
- "Call mom this evening"
- "Finish the project report"

**For Events:**
- "Schedule meeting with John for Tuesday at 10 AM"
- "Doctor appointment next Friday at 2 PM"
- "Lunch with Sarah tomorrow at noon"

### Navigation

- **Voice Tab**: Record voice commands and see real-time processing
- **Tasks Tab**: View, complete, and manage your to-do items
- **Calendar Tab**: See scheduled events and upcoming appointments

## Architecture

### Components

- `AppShell`: Main layout with navigation and background effects
- `VoiceInterface`: Voice recording and processing interface
- `MicButton`: Animated microphone button with recording states
- `TaskList`: Task management with completion tracking
- `EventList`: Calendar events with time formatting

### Services

- `OpenAIService`: Speech-to-text and natural language processing
- `SupabaseService`: Database operations for tasks and events
- `VoiceRecorder`: Web Audio API wrapper for voice recording

### Data Flow

1. User records voice command
2. Audio is transcribed using OpenAI Whisper
3. Transcript is parsed to extract task/event details
4. Structured data is saved to Supabase
5. UI updates with new task or event

## Deployment

The app is optimized for deployment on Vercel or similar platforms:

```bash
npm run build
npm start
```

Make sure to set environment variables in your deployment platform.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
