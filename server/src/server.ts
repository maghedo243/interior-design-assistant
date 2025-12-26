import express from 'express';
import type { Request, Response } from 'express';
import { productCatalog } from './services/ProductCatalog.js'
import { userStore } from './services/UserDataHandler.js'
import { recommendationEngine } from './services/RecommendationEngine.js'
import cors from 'cors';
import jwt from "jsonwebtoken";


// --- Static Test Credentials ---
const VALID_USERNAME = "testuser";
const VALID_PASSWORD = "password123";

// --- JWT Secret Key ---
const SECRET_KEY = "MY_SUPER_SECRET_KEY_123";

const app = express();
const PORT = 5000;


app.use(cors());
app.use(express.json());

productCatalog.loadData();

app.get('/api/feed', (req: Request, res: Response) => {
    const userId = req.query.userId as string;

    if (!userId) {
        res.status(400).json({ error: "Missing userId parameter" });
        return;
    }

    let personalizedFeed = recommendationEngine.getPersonalizedFeed(userId)

    res.json(personalizedFeed);
});

app.post('/api/user-interact', (req: Request, res: Response) => {
    res.status(200).json({ message: 'Interaction received' });

    handleInteractionLogic(req.body).catch(err => {
        console.error("Background update failed:", err);
    });
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
    const isProduction = process.env.NODE_ENV === 'production';

    const baseUrl = isProduction
        ? (process.env.RENDER_EXTERNAL_URL || 'https://interior-design-assistant.onrender.com')
        : `http://localhost:${PORT}`;

    console.log(`✅ TypeScript Backend Server is running at ${baseUrl}`);
});

async function handleInteractionLogic(data: any){
    // let data vars
    let userId = data.userId;
    let itemId = data.itemId;
    let action = data.action;

    // server log
    console.log(`Processing ${action} interaction for user: ${userId} on item: ${itemId}`);

    let product = productCatalog.getProductById(itemId)

    userStore.updateUser(userId,product?.keywords || [],(action === "like") ? 1 : (action === "dislike") ? -5 : 0.5)

    // console.log(userStore.getProfile(userId).weights)
}