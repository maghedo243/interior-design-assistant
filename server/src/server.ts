import express from 'express';
import type { Request, Response } from 'express';
import { productCatalog } from './services/ProductCatalog.js'
import { userStore } from './services/UserDataHandler.js'
import { recommendationEngine } from './services/RecommendationEngine.js'
import cors from 'cors';
import {AuthenticationHandler} from './services/AuthenticationHandler.js';
import dotenv from 'dotenv';
import { DatabaseHandler } from './services/DatabaseHandler.js';
import { ObjectId } from 'mongodb';

//Express server setu
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

//Initializing helper files and config
dotenv.config()
productCatalog.loadData();
await AuthenticationHandler.init()
await DatabaseHandler.init()

// --- GET /api/feed ---
app.get('/api/feed', (req: Request, res: Response) => {
    // Verify given token
    if(!verifyToken(req)) {
        return res.status(401).json({ message: 'Unauthorized API Call' });
    }

    const userId = req.query.userId as string;

    // Missing user from feed request
    if (!userId) {
        res.status(400).json({ error: "Missing userId parameter" });
        return;
    }

    let personalizedFeed = recommendationEngine.getPersonalizedFeed(userId)

    res.json(personalizedFeed);
});

// --- POST /api/user-interact ---
app.post('/api/user-interact', (req: Request, res: Response) => {
    // Verify given token
    if(!verifyToken(req)) {
        return res.status(401).json({ message: 'Unauthorized API Call' });
    }

    res.status(200).json({ message: 'Interaction received' });

    handleInteractionLogic(req.body).catch(err => {
        console.error("Background update failed:", err);
    });
});

// --- POST /api/new_questionnaire ---
app.post('/api/new-questionnaire', async (req: Request, res: Response) => {
    // Verify given token
    if(!verifyToken(req)) {
        return res.status(401).json({ message: 'Unauthorized API Call' });
    }

    const { userId, answers } = req.body

    try {
        const userObjectID = new ObjectId(userId)

        await DatabaseHandler.insertOne("appdata", "userData",{ 
            _id: userObjectID,
            questionnaireAnswers: answers
        })

        res.status(200).json({ message: 'Success' });
    } catch (e) {
        console.error(e)
        res.status(400).json({ message: 'Invalid ID format' });
    }
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

// --- POST /api/auth/verify ---
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

    // Adds keywords to user with respective weights
    userStore.updateUser(userId,product?.keywords || [],(action === "like") ? 1 : (action === "dislike") ? -5 : 0.5)
}

// Helper Function to verify API token
function verifyToken(req: Request) {
    const authHeader = req.headers.authorization;
    let verify = false;

    if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        if (token) verify = AuthenticationHandler.verifyUserToken(token);
    }

    return verify;
}