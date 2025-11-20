// REPO/server/server.ts

import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = 5000;

//Test comment for background CI check

// ... (Rest of your middleware setup remains the same)
app.use(cors());
app.use(express.json());

// --- Define an Interface for Strong Typing ---
interface FeedItem {
    id: number;
    type: 'video' | 'image' | 'text' | 'ad'; // Strict types for content type
    title: string;
    creator: string;
    likes: number;
}

const mockFeed: FeedItem[] = [
    { id: 1, type: 'video', title: 'JS Async/Await Deep Dive', creator: '@CoderGuru', likes: 1500 },
    // ... more mock data
];

// --- API Endpoint with Typed Request and Response ---
app.get('/api/feed', (req: Request, res: Response<FeedItem[]>) => {
    // TypeScript ensures 'res.json' only accepts an array of FeedItem objects
    const personalizedFeed: FeedItem[] = [...mockFeed].sort(() => 0.5 - Math.random());

    res.json(personalizedFeed);
});

app.listen(PORT, () => {
    console.log(`✅ TypeScript Backend Server is running at http://localhost:${PORT}`);
});