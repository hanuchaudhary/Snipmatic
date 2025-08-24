# Snipmatic

An AI-powered platform that converts YouTube videos into viral short clips using intelligent content analysis.

## Live Demo

Visit [Snipmatic](https://snipmatic.vercel.app) to see the application in action.

## Overview

Snipmatic is an innovative AI-powered video processing platform that automatically identifies and extracts the most engaging moments from YouTube videos to create viral short clips. Using advanced machine learning algorithms, Snipmatic analyzes video content, identifies viral moments, and generates perfectly formatted short-form content for social media platforms.

## Tech Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Backend**: FastAPI (Python), Celery, Redis
- **Video Processing**: FFmpeg, yt-dlp
- **AI/ML**: Custom viral moment detection algorithms
- **Database**: PostgreSQL, Prisma ORM
- **Storage**: AWS S3, CloudFront CDN
- **Email Service**: Go-based email microservice
- **Containerization**: Docker
- **Queue Management**: Redis + Celery workers

## Features

### AI-Powered Clip Generation
- **Intelligent Moment Detection**: AI analyzes video content to identify viral-worthy segments
- **Multiple Clip Generation**: Create multiple short clips from a single video
- **Confidence Scoring**: Each moment is scored based on viral potential

### Video Processing
- **YouTube Integration**: Simply paste any YouTube URL to get started
- **Multiple Aspect Ratios**: Support for vertical (9:16), square (1:1), and original formats
- **High-Quality Output**: Maintains video quality while optimizing for social platforms

### Smart Workflow
- **Manual & AI Modes**: Choose between AI-generated clips or manually specify timestamps
- **Real-time Progress**: Live dashboard showing processing status and progress
- **Batch Processing**: Queue multiple videos for processing
- **Auto-generated Subtitles**: Optional subtitle burning for better engagement

### User Experience
- **Credit System**: Transparent credit-based pricing model
- **Progress Tracking**: Real-time updates on clip generation status
- **Download Management**: Easy download of individual clips or batch ZIP files
- **Responsive Design**: Works seamlessly across desktop and mobile devices

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- Python (v3.9 or higher)
- Go (v1.19 or higher)
- Redis server
- PostgreSQL database
- FFmpeg installed on system

### Installation

1. Clone the repository:
```bash
git clone https://github.com/hanuchaudhary/Snipmatic.git
cd Snipmatic
```

2. Set up the client (Next.js frontend):
```bash
cd client
npm install
cp .env.example .env.local
# Configure your environment variables
npm run dev
```

3. Set up the main server (FastAPI + Celery):
```bash
cd main-server
pip install -r requirements.txt
# Start Redis server
redis-server
# Start API Gateway
cd api-gateway && python app.py
# Start workers in separate terminals:
cd download-worker && python tasks.py
cd clip-worker && python tasks.py
cd transcribe-worker && python tasks.py
```

4. Set up the email server (Go):
```bash
cd email-server
go mod tidy
go run server/main.go
```

### Environment Variables

Create `.env.local` in the client directory:
```env
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://user:password@localhost:5432/clipper
REDIS_URL=redis://localhost:6379
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
S3_BUCKET_NAME=your-s3-bucket
MAIN_SERVER_URL=http://localhost:8000
```

## Docker Deployment

Deploy the entire stack with Docker Compose:

```bash
# Clone the repository
git clone https://github.com/hanuchaudhary/Snipmatic.git
cd Snipmatic

# Start all services
cd main-server
docker-compose up -d

# Start the client
cd ../client
npm install
npm run build
npm start
```

This will start:
- Redis for queue management
- PostgreSQL database
- API Gateway (FastAPI)
- All Celery workers (download, clip, transcribe)
- Email service (Go)

## Architecture

Snipmatic uses a microservices architecture with queue-based processing:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Next.js UI    │───▶│   API Gateway    │───▶│   Celery Queue  │
│                 │    │   (FastAPI)      │    │   (Redis)       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                         │
                       ┌─────────────────────────────────┼─────────────────────────────────┐
                       │                                 │                                 │
                ┌──────▼──────┐              ┌───────▼───────┐              ┌──────▼──────┐
                │  Download   │              │     Clip      │              │ Transcribe  │
                │   Worker    │              │    Worker     │              │   Worker    │
                │  (yt-dlp)   │              │  (FFmpeg AI)  │              │ (Whisper)   │
                └─────────────┘              └───────────────┘              └─────────────┘
```

### Key Components:

1. **Client (Next.js)**: User interface for video submission and progress tracking
2. **API Gateway**: Central FastAPI server handling requests and task distribution
3. **Download Worker**: Downloads videos from YouTube using yt-dlp
4. **Clip Worker**: AI-powered video analysis and clip generation using FFmpeg
5. **Transcribe Worker**: Subtitle generation using Whisper AI
6. **Email Service**: Go-based service for sending completion notifications

## Project Structure

```
Snipmatic/
├── client/                 # Next.js frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── app/           # Next.js app router
│   │   ├── lib/           # Utilities and stores
│   │   └── types/         # TypeScript type definitions
│   ├── prisma/            # Database schema and migrations
│   └── public/            # Static assets
├── main-server/           # Python backend services
│   ├── api-gateway/       # FastAPI main server
│   ├── download-worker/   # YouTube video download service
│   ├── clip-worker/       # AI clip generation service
│   ├── transcribe-worker/ # Subtitle generation service
│   ├── shared/            # Shared utilities and models
│   └── storage/           # Local file storage
├── email-server/          # Go-based email notification service
│   ├── internal/          # Internal packages
│   └── server/            # Main server file
└── backend/               # Legacy Python scripts
```

## AI Viral Moment Detection

Snipmatic's AI analyzes videos using several factors to identify viral moments:

### Detection Criteria:
- **Audio Analysis**: Identifies peaks in energy, laughter, and excitement
- **Visual Analysis**: Detects scene changes, movement, and visual interest
- **Engagement Patterns**: Analyzes typical viral content characteristics
- **Duration Optimization**: Ensures clips are perfect length for social platforms

### Viral Scoring:
Each detected moment receives a confidence score (0-100) based on:
- Audio energy levels and patterns
- Visual composition and movement
- Content type recognition
- Optimal clip duration (15-60 seconds)

### Output Formats:
- **Vertical (9:16)**: Perfect for TikTok, Instagram Reels, YouTube Shorts
- **Square (1:1)**: Ideal for Instagram posts and stories
- **Original**: Maintains source video aspect ratio

## Contributing

We welcome contributions to make Snipmatic even better! Here's how you can help:

### Development Setup

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Set up your development environment following the Quick Start guide
4. Make your changes and test thoroughly
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Areas for Contribution

- **AI Improvements**: Enhance viral moment detection algorithms
- **Video Processing**: Optimize FFmpeg operations and add new formats
- **Platform Integration**: Add support for more video platforms
- **UI/UX**: Improve user interface and experience
- **Performance**: Optimize processing speed and resource usage
- **Documentation**: Improve guides and API documentation

### Code Style

- Follow TypeScript/ESLint rules for frontend
- Use Black formatter for Python code
- Follow Go standard formatting
- Write meaningful commit messages
- Add tests for new features

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Authors

- **Hanu Chaudhary** - [@hanuchaudhary](https://github.com/hanuchaudhary)
- **Kushagra** - [@kushagra21-afk](https://github.com/kushagra21-afk)

## Acknowledgments

- Thanks to all contributors who have helped shape Snipmatic
- FFmpeg community for the powerful video processing capabilities
- OpenAI Whisper for transcription technology
- yt-dlp developers for reliable YouTube video extraction
- The machine learning community for AI/ML insights
- Built with ❤️ for content creators, by developers

### Upcoming Features
- **Advanced AI Models**: More sophisticated viral moment detection
- **Multi-language Support**: Content processing in multiple languages
- **Analytics Dashboard**: Detailed insights on clip performance
- **Social Media Integration**: Direct posting to social platforms
- **Custom Branding**: Add watermarks and custom styling
- **Team Collaboration**: Multi-user workspaces and sharing

---