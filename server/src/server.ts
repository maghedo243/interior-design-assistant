import express from 'express';
import type { Request, Response } from 'express';
import { productCatalog } from './services/productCatalog.js'
import { userStore } from './services/UserDataHandler.js'
import cors from 'cors';

const app = express();
const PORT = 5000;


app.use(cors());
app.use(express.json());

productCatalog.loadData();

console.log(productCatalog.getProductById("605.106.40")?.keywords[0])

// app.get('/api/feed', (req: Request, res: Response<FeedItem[]>) => {
//     const personalizedFeed: FeedItem[] = [...mockFeed].sort(() => 0.5 - Math.random());
//
//     res.json(personalizedFeed);
// });

app.post('/api/user-interact', (req: Request, res: Response) => {
    res.status(200).json({ message: 'Interaction received' });

    handleInteractionLogic(req.body).catch(err => {
        console.error("Background update failed:", err);
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

    console.log(`Processing background interaction for user: ${userId}`);
    console.log(`Item ID: ${itemId}`)
    console.log(`${action} was the received action`)

    let product = productCatalog.getProductById(itemId)

    userStore.updateUser(userId,product?.keywords || [],(action === "like") ? 1 : (action === "dislike") ? -5 : 0.5)

    console.log(userStore.getProfile(userId).weights)
}