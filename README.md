# AI-Automatic-Subtitle-Burner

A production-ready web application that allows users to upload videos, automatically transcribe speech using AI, generate subtitle files, permanently burn subtitles into videos using FFmpeg, and store both original and processed videos in the database.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Goals](#2-goals)
3. [Functional Requirements](#3-functional-requirements)
4. [Non-Functional Requirements](#4-non-functional-requirements)
5. [System Architecture](#5-system-architecture)
6. [Technology Stack](#6-technology-stack)
7. [Application Structure](#7-application-structure)
8. [Database Design](#8-database-design)
9. [Storage Architecture](#9-storage-architecture)
10. [Processing Pipeline](#10-processing-pipeline)
11. [API Specification](#11-api-specification)
12. [Frontend Requirements](#12-frontend-requirements)
13. [Backend Requirements](#13-backend-requirements)
14. [AI Integration](#14-ai-integration)
15. [Subtitle Generation](#15-subtitle-generation)
16. [Background Worker](#16-background-worker)
17. [Error Handling](#17-error-handling)
18. [Performance Requirements](#18-performance-requirements)
19. [Security Considerations](#19-security-considerations)
20. [Environment Configuration](#20-environment-configuration)
21. [Development Milestones](#21-development-milestones)
22. [Deliverables](#22-deliverables)
23. [Future Enhancements](#23-future-enhancements)

---

## 1. Project Overview

Develop a production-ready web application that allows users to upload videos, automatically transcribe speech using the Google Gemini API, generate subtitle files, permanently burn subtitles into videos using FFmpeg, and store both original and processed videos in Supabase Storage.

The application should support asynchronous processing through a background worker and provide users with real-time processing status.

---

## 2. Goals

- Build a scalable subtitle generation service.
- Offload AI processing to Google Gemini.
- Keep server resource usage minimal.
- Support asynchronous video processing.
- Store all assets in Supabase Storage.
- Produce downloadable captioned videos.
- Design the application to support future expansion.

---

## 3. Functional Requirements

### Video Upload
- Upload MP4, MOV, AVI, and MKV videos.
- Upload directly to Supabase Storage.
- Display upload progress.
- Configurable maximum upload size (default 150MB on 1GB RAM VPS).
- Create a processing job after upload.

### Job Management
Each processing job must include:
- `id`
- `status`
- `original_video_url`
- `output_video_url`
- `transcript_json`
- `subtitle_style`
- `created_at`
- `completed_at`

Supported statuses:
- `queued`
- `processing`
- `completed`
- `failed`

### Dashboard
Display:
- Uploaded videos
- Processing status
- Upload timestamp
- Download processed video
- Delete job

### Video Playback
Completed jobs should display:
- Original video
- Processed video

### Subtitle Styles
Support multiple subtitle presets including:
- Classic
- TikTok
- Minimal
- Cinema

Store the selected style with each job.

---

## 4. Non-Functional Requirements

- Modular architecture.
- Asynchronous processing.
- Responsive user interface.
- Low memory usage.
- Easy deployment.
- Production-ready codebase.
- Maintainable project structure.
- Configurable environment variables.

---

## 5. System Architecture

```
Frontend (React/Vite)  ──►  Backend (Express)  ──►  Supabase (PostgreSQL + Storage)
                                │
                                ▼
                         Background Worker
                                │
                          ┌─────┴─────┐
                          │           │
                       FFmpeg     Gemini API
```

- **Frontend:** React (Vite), React Router, Tailwind CSS, Axios
- **Backend:** Node.js, Express, Multer, FFmpeg, Supabase SDK
- **Database:** Supabase PostgreSQL
- **Storage:** Supabase Storage
- **AI:** Google Gemini API
- **Processing:** Background Worker

---

## 6. Technology Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Frontend    | React, Vite, React Router, Tailwind CSS, Axios |
| Backend     | Express, Node.js, Multer, FFmpeg  |
| Database    | Supabase PostgreSQL               |
| Storage     | Supabase Storage                  |
| AI          | Google Gemini API                 |
| Background  | Custom polling worker             |

---

## 7. Application Structure

```
client/
    src/
        api/
        components/
        hooks/
        pages/
        utils/

server/
    app.js
    controllers/
    routes/
    services/
    workers/
    ffmpeg/
    middleware/
    utils/
    docs/
```

---

## 8. Database Design

### Jobs Table

| Column              | Type        | Description                      |
|---------------------|-------------|----------------------------------|
| `id`                | UUID        | Primary key                      |
| `status`            | string      | queued / processing / completed / failed |
| `original_video_url`| string      | Supabase URL of uploaded video   |
| `output_video_url`  | string|null | Supabase URL of processed video  |
| `transcript_json`   | JSON|null   | Gemini transcript result         |
| `subtitle_style`    | string      | Selected subtitle preset         |
| `created_at`        | timestamp   | Job creation time                |
| `completed_at`      | timestamp   | Job completion time              |

---

## 9. Storage Architecture

Supabase Storage buckets:

- **`uploads/`** — Original uploaded videos
- **`processed/`** — Captioned/output videos

---

## 10. Processing Pipeline

1. User uploads video.
2. Store original video in Supabase Storage.
3. Create processing job (`status: queued`).
4. Worker retrieves queued job.
5. Download video locally.
6. Extract audio using FFmpeg.
7. Send audio to Gemini.
8. Receive timestamped transcript.
9. Generate ASS subtitle file.
10. Burn subtitles into video using FFmpeg.
11. Upload completed video to Supabase Storage.
12. Update database (`status: completed`).
13. Delete temporary files.

---

## 11. API Specification

| Method   | Endpoint                    | Description                          |
|----------|-----------------------------|--------------------------------------|
| `GET`    | `/api/health`               | Health check                        |
| `GET`    | `/api-docs`                 | Swagger UI                          |
| `POST`   | `/api/jobs/upload`          | Upload video + create job           |
| `GET`    | `/api/jobs`                 | List jobs (supports pagination)     |
| `GET`    | `/api/jobs/:id`             | Get job details                     |
| `POST`   | `/api/jobs/:id/process`     | Trigger processing                  |
| `DELETE` | `/api/jobs/:id`             | Delete job + cleanup storage files  |

---

## 12. Frontend Requirements

### Pages
- Dashboard
- Upload
- Job Details

### Components
- Upload component
- Progress indicator
- Video player
- Job table
- Status badge
- Download button
- Delete confirmation

### Features
- Drag-and-drop uploads
- Upload progress
- Polling for job status
- Error notifications
- Loading states

---

## 13. Backend Requirements

### Responsibilities
- File uploads
- Job creation
- Supabase integration
- Worker execution
- FFmpeg integration
- Gemini integration
- Subtitle generation
- File cleanup
- Error handling

---

## 14. AI Integration

Google Gemini will be used exclusively for speech transcription.

**Requirements:**
- Send extracted audio only.
- Request timestamped JSON.
- No summaries.
- No additional commentary.
- Split captions into readable segments.

**Expected response:**

```json
[
  {
    "start": 0.0,
    "end": 1.2,
    "text": "Hello everyone"
  }
]
```

---

## 15. Subtitle Generation

- Convert transcript JSON into ASS subtitle format.
- Support: font, font size, text color, outline, shadow, bottom alignment.
- Render subtitles using FFmpeg.

---

## 16. Background Worker

### Responsibilities
- Poll queued jobs.
- Process one job at a time.
- Retry failed jobs.
- Update processing status.
- Clean temporary files.
- Upload processed output.

---

## 17. Error Handling

Handle:
- Invalid file types
- Upload failures
- Download failures
- FFmpeg errors
- Gemini API errors
- Storage failures
- Database failures

Retry processing up to three times before marking a job as `failed`.

---

## 18. Performance Requirements

- Process one job at a time.
- Avoid loading large files into memory.
- Stream files where possible.
- Delete temporary files immediately after processing.
- Keep CPU and memory usage low.
- Support deployment on low-resource VPS environments (1GB RAM supports videos up to ~150MB at 1080p).

---

## 19. Security Considerations

- Validate uploaded file types.
- Restrict upload size.
- Protect API keys using environment variables.
- Sanitize user input.
- Prevent unauthorized file access.
- Never expose service role credentials to the frontend.

---

## 20. Environment Configuration

Required environment variables:

```
PORT=3001

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

GEMINI_API_KEY=

MAX_FILE_SIZE_MB=150
WORKER_ENABLED=false
FFMPEG_PATH=ffmpeg
GEMINI_MODEL=gemini-2.0-flash
```

---

## 21. Development Milestones

### Phase 1
- Project setup
- React frontend
- Express backend
- Supabase integration

### Phase 2
- Video uploads
- Job creation
- Dashboard

### Phase 3
- Worker implementation
- FFmpeg integration
- Audio extraction

### Phase 4
- Gemini transcription
- Subtitle generation
- ASS renderer

### Phase 5
- Burn subtitles
- Upload processed videos
- Job completion

### Phase 6
- Testing
- Optimization
- Documentation
- Deployment

---

## 22. Deliverables

- React frontend
- Express backend
- Supabase database schema
- Supabase storage integration
- Background worker
- Gemini transcription service
- ASS subtitle generator
- FFmpeg processing service
- REST API
- Dockerfile
- docker-compose.yml
- README
- Environment configuration
- Deployment documentation

---

## 23. Future Enhancements

- Subtitle editor
- Custom subtitle themes
- Translation
- Multiple output resolutions
- Batch processing
- Authentication
- User accounts
- Webhooks
- Email notifications
- Processing queue dashboard
- Analytics
- Video trimming
- Thumbnail generation
- Subtitle download (SRT/ASS)
