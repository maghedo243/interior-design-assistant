import express from 'express';
import fileUpload, { type UploadedFile } from 'express-fileupload';
import type { Request, Response } from 'express';
import { UserDataHandler } from './services/UserDataHandler.js'
import { RecommendationEngine } from './services/RecommendationEngine.js'
import cors from 'cors';
import {AuthenticationHandler} from './services/AuthenticationHandler.js';
import dotenv from 'dotenv';
import { DatabaseHandler } from './services/DatabaseHandler.js';
import { EmbeddingHandler } from './services/EmbeddingHandler.js';
import { ObjectId } from 'mongodb';

//Express server setupp
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

//Initializing helper files and config
dotenv.config()
await DatabaseHandler.init()
await EmbeddingHandler.init()

app.use(fileUpload({
    limits: { fileSize: 30 * 1024 * 1024 }, // Limit to 5MB
    abortOnLimit: true, 
    responseOnLimit: "File upload is too large. Max limit is 30MB.",
}));

// --- GET /api/feed ---
app.get('/api/feed', async (req: Request, res: Response) => {
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

    try {
        let personalizedFeed = await RecommendationEngine.getPersonalizedFeed(userId);

        res.status(200).json(personalizedFeed);
    } catch (error){
        res.status(400).json({ error: "Failed to generate recommendation feed for user" });
        return;
    }
});

// --- POST /api/recommendation ---
app.post('/api/recommendation', async (req: Request, res: Response) => {
    // Verify given token
    if(!verifyToken(req)) {
        return res.status(401).json({ message: 'Unauthorized API Call' });
    }

    // Verifies that files are present
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ error: 'No files were provided.' });
    }

    const userId = req.body.userId
    const query = req.body.query
    const filesInput = req.files.files

    // Missing user from feed request
    if (!userId) return res.status(400).json({ error: "Missing userId parameter" });
    else if (!query) return res.status(400).json({ error: "Missing query parameter" });
    else if (!filesInput) return res.status(400).json({ error: "Missing files parameter" });

    const imageArray: UploadedFile[] = Array.isArray(filesInput) ? filesInput : [filesInput];

    // Check if all files are actually images
    const invalidFiles = imageArray.filter(file => !file.mimetype.startsWith('image/'));
    if (invalidFiles.length > 0) {
        return res.status(400).json({ error: 'Some files are not images.', invalidCount: invalidFiles.length });
    }

    const processedData = imageArray.map((image) => {
        console.log(`Processing ${image.name} (${image.size} bytes)`);
        
        return {
            name: image.name,
            type: image.mimetype,
            size: image.size,
            data: image.data
        };
    });

    try {
        const recommendedFeed = await RecommendationEngine.getPersonalizedRecommentations(userId, query, processedData)

        return res.status(200).json(recommendedFeed);
    } catch (error){
        return res.status(400).json({ error: "Failed to generate recommendation feed for user" });
    }
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
    const userId = data.userId;
    const itemId = data.itemId;
    const action = data.action;

    // server log
    console.log(`Processing ${action} interaction for user: ${userId} on item: ${itemId}`);

    let userData = await DatabaseHandler.getUserDataById(userId)
    let product = await DatabaseHandler.getProductById(itemId)

    if (userData === undefined){
        console.log(`Issue processing ${action} interaction for user: ${userId} on item: ${itemId}`)
        return;
    }

    let userVector = userData?.vector
    let recentTags = userData?.recentTags || []
    const itemTags = product.enriched_keywords || [];

    if (action === "like") {
        userVector = UserDataHandler.updateProfileVector(userVector, product.description_embedding, 0.15)
        recentTags = [...itemTags, ...itemTags, ...recentTags]
    } else if (action === "maybe") {
        userVector = UserDataHandler.updateProfileVector(userVector, product.description_embedding, 0.05)
        recentTags = [...itemTags, ...recentTags]
    } else { // dislike
        recentTags = recentTags.filter(tag => !itemTags.includes(tag));
    }

    // keep tags from infinitely growing
    recentTags = recentTags.slice(0, 30);

    userData.vector = userVector
    userData.recentTags = recentTags

    DatabaseHandler.updateUserData(userData)
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
