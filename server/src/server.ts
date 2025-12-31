import express from 'express';
import type { Request, Response } from 'express';
import { productCatalog } from './services/ProductCatalog.js'
import { userStore } from './services/UserDataHandler.js'
import { recommendationEngine } from './services/RecommendationEngine.js'
import cors from 'cors';
import jwt from 'jsonwebtoken';
import {LoginHandler} from './services/LoginHandler.js';
import dotenv from 'dotenv';
import {ObjectId} from "mongodb";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

dotenv.config()
productCatalog.loadData();
await LoginHandler.init()

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
        const result = await handleLoginLogic(req.body);

        //login mode wrong or missing
        if (result === false) {
            return res.status(400).json({ message: "Login mode error" })
        //invalid login data
        } else if (result === "exists" ||  result === "password" || result === "user") {
            return res.status(200).json({ message: result })
        //valid login data
        } else {
            const payload = {
                id: result.toHexString(),
                role: "user"
            };

            const secret = process.env.JWT_SECRET || null

            if(!secret){
                return res.status(404).json({ message: "FatalError" })
            }

            const token = jwt.sign(payload, secret, {
                expiresIn: '1h'
            });

            return res.status(200).json({ message: "Login Successful" , token: token })
        }
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Login failed" });
    }
});

app.listen(PORT, () => {
    const isProduction = process.env.NODE_ENV === 'production';

    const baseUrl = isProduction
        ? (process.env.RENDER_EXTERNAL_URL || 'https://interior-design-assistant.onrender.com')
        : `http://localhost:${PORT}`;

    console.log(`✅ TypeScript Backend Server is running at ${baseUrl}`);
});

async function handleLoginLogic(data: any){
    const { username, password, mode } = data;

    if (mode === "signup") {
        const result = await LoginHandler.signup(username, password);
        if (result) return result
        else return "exists"
    } else if (mode === "login") {
        const result = await LoginHandler.login(username, password);
        if (result === false) return "password"
        else if (result === null) return "user"
        else return result
    } else {
        return false
    }
}

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