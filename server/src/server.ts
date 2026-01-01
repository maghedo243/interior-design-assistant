import express from 'express';
import type { Request, Response } from 'express';
import { productCatalog } from './services/ProductCatalog.js'
import { userStore } from './services/UserDataHandler.js'
import { recommendationEngine } from './services/RecommendationEngine.js'
import cors from 'cors';
import {AuthenticationHandler} from './services/AuthenticationHandler.js';
import dotenv from 'dotenv';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

dotenv.config()
productCatalog.loadData();
await AuthenticationHandler.init()

// --- POST /api/feed ---
app.get('/api/feed', (req: Request, res: Response) => {
    const userId = req.query.userId as string;

    if (!userId) {
        res.status(400).json({ error: "Missing userId parameter" });
        return;
    }

    let personalizedFeed = recommendationEngine.getPersonalizedFeed(userId)

    res.json(personalizedFeed);
});

// --- POST /api/user-interact ---
app.post('/api/user-interact', (req: Request, res: Response) => {
    res.status(200).json({ message: 'Interaction received' });

    handleInteractionLogic(req.body).catch(err => {
        console.error("Background update failed:", err);
    });
});

// --- POST /api/auth/login ---
app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
        const { username, password, mode } = req.body;
        let result = null;

        if (mode === "signup") {
            result = await AuthenticationHandler.signup(username, password);
        } else if (mode === "login") {
            result = await AuthenticationHandler.login(username, password);
        } else { //login mode wrong or missing
            return res.status(400).json({ message: "Login mode error" })
        }

        if(result.message === "FatalError") return res.status(404).json(result) //token generation issue
        return res.status(200).json(result)
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Login error" });
    }
});

app.post('/api/auth/verify', async (req: Request, res: Response) => {
    try {
        const token = req.body.token
        if(AuthenticationHandler.verifyUserToken(token)) return res.status(200).json({ message: "Valid" })
        else return res.status(401).json({ message: "Invalid" })
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Verification error" })
    }
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