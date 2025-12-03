// REPO/server/server.ts

import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';

// --- Static Test Credentials ---
const VALID_USERNAME = "testuser";
const VALID_PASSWORD = "password123";

// --- JWT Secret Key ---
const SECRET_KEY = "MY_SUPER_SECRET_KEY_123";


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
// --- POST /auth/login ---
app.post('/auth/login', (req: Request, res: Response) => {
    const { username, password } = req.body;

    // Negative Test Case
    if (username !== VALID_USERNAME || password !== VALID_PASSWORD) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    // Positive Test Case
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });

    return res.json({
        message: "Login successful",
        token,
    });
});

// --- GET /auth/check ---
app.get('/auth/check', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(403).json({ message: "Missing token" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Invalid token format" });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ message: "Invalid token" });
        return res.json({ message: "Token valid", user: decoded });
    });
});

app.listen(PORT, () => {
    console.log(`✅ TypeScript Backend Server is running at http://localhost:${PORT}`);
});