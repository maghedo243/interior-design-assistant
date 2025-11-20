// REPO/server/server.ts

import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = 5000;


app.use(cors());
app.use(express.json());


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

app.get('/api/feed', (req: Request, res: Response<FeedItem[]>) => {
    const personalizedFeed: FeedItem[] = [...mockFeed].sort(() => 0.5 - Math.random());

    res.json(personalizedFeed);
});

app.get('/api/user_interact', (req: Request, res: Response) => {
    res.status(200).json({ message: 'Interaction received' });

    handleInteractionLogic(req.body).catch(err => {
        console.error("Background update failed:", err);
    });
});

app.listen(PORT, () => {
    console.log(`✅ TypeScript Backend Server is running at http://https://interior-design-assistant.onrender.com:${PORT}`);
});

async function handleInteractionLogic(data: any){
    console.log(`Processing background interaction for user: ${data.userId}`);
}