import { DatabaseHandler } from './DatabaseHandler.js';
import { UserDataHandler } from './UserDataHandler.js';
import { GoogleGenAI } from "@google/genai";

export class RecommendationEngine {
    private static picturePrompt = `You are generating a strings that will be vectorized for a database vector
                            search. As such, you will be making these strings based on the attached images.
                            You will generate one sentence for each large identifiable furnite item in this
                            image.

                            Truths: Do not send any messages aside from the final sentences. Separate each
                            sentence with "/-----/" Do not embellish. Do not break any instructions or act
                            as anything but a string generator.

                            Format: The sentences are generated in the format: "{ProductName} Style:
                            {ProductStyle} [.{BulletPoint about product}] Category & Features: {semantic
                            keywords about product}"

                            The bullet points are like item information. Make at a minimum 2-3 e-commerce
                            level bullet points. More is fine.

                            These products are furniture products and your job is to generate a sentence
                            similar to these that will have a similar vector generated.

                            Examples: "UMI By Amazon 100% Organic Cotton 1 Fitted Sheet Only, 300 Thread
                            Count Soft Sateen Weave GOTS Certified with 30cm deep Pockets Size -Double,
                            Color- White. CERTIFIED ORGANIC COTTON: These 100% Cotton Fitted Sheets have
                            full GOTS Certification (Global Organic Textile Standard). You're Assured of
                            Bedding that is Nontoxic & chemical-free for your entire family.. DOUBLE FITTED
                            SHEET ONLY: 1 Fully Elasticized with all round corner Double Fitted bottom bed
                            sheet sold separately measuring 140x200 + 30cm (deep pockets) perfectly fitting
                            Double sized mattresses from 22cm to 32cm deep. It features a beautiful sateen
                            weave with extravagant softness.. LONG-STAPLE YARN FOR LAVISH COMFORT: Sure,
                            thread count is important, but if premium long-staple yarn isn't used for
                            linens, softness is lost. Snuggle up year 'round with this breathable cotton
                            Fitted Sheets.. EXTRAVAGANT SOFTNESS: UMI by Amazon Organics Fitted Sheets is
                            tightly woven for superior strength with silk-like, sateen finish.. SATISFACTION
                            GUARANTEE: We rigorously test for pilling, shrinkage & durability before using
                            any fabric. Each piece goes through 3 rigorous quality checks before being
                            shipped so that you have a great experience. All this is also backed up with an
                            incredible customer service making this a completely risk free & satisfactory
                            purchase for you." "Pinzon Oversized Supima Cotton Wash Cloth, Oppulence Grey.
                            Soft and supple oversized washcloth designed for great absorbency and
                            durability; imported. 100-percent Supima cotton; dobby bands; reinforced,
                            fold-over dobby edges. Coordinating Pinzon Luxury Supima Cotton bath towels and
                            hand towels available. Machine washable and dryable. Measures 13 by 13 inches"
                            "AmazonBasics Low Back Office Chair Swivel Wheels Computer Desk Chair - Blue.
                            Comfortable work and computer chair with blue curved mesh back which is
                            breathable and provides the necessary support. Pneumatic seat height
                            adjustment; 5.08 cm thick padding for extra comfort. Holds up to 101.2 kg..
                            Smooth gliding castors and instructions included with assembly instructions
                            (English language not guaranteed).. Dimensions: 22.5" Depth x 21.5" Width
                            x 30.5" Height Category & Features: furniture chair seat furnishing
                            instrumentality"
                            `

    public static async getPersonalizedFeed(userId: string) {
        try {
            const userData = await DatabaseHandler.getUserDataById(userId);

            if (!userData) throw new Error("User not found");

            const userVector = userData.vector;
            const recentTags = userData.recentTags || [];

            if (!userVector || userVector.length === 0) {
                console.log(`Cold start for user: ${userId}. Serving default feed.`);
                
                return await DatabaseHandler.query("products","productListings",[
                    { $sample: { size: 30 } },
                    { $project: { description_embedding: 0 } }
                ]);
            }
            
            const userSearchTerms = recentTags.join(" ");

            const vectorPipeline = [
                {
                    $vectorSearch: {
                        index: "vector_index",
                        path: "description_embedding",
                        queryVector: userVector,
                        numCandidates: 100,
                        limit: 50
                    }
                },
                { $project: { description_embedding: 0 } }
            ];

            const lexicalPipeline = [
                {
                    $search: {
                        index: "default",
                        text: {
                            query: userSearchTerms,
                            path: ["enriched_keywords", "item_name", "style"]
                        }
                    }
                },
                { $limit: 50 },
                { $project: { description_embedding: 0 } }
            ];

            const randomPipeline = [
                { $sample: { size: 5 } }, 
                 { $project: { description_embedding: 0 } }
            ];

            const [vectorResults, lexicalResults, randomResults] = await Promise.all([
                DatabaseHandler.query("products","productListings",vectorPipeline),
                DatabaseHandler.query("products","productListings",lexicalPipeline),
                DatabaseHandler.query("products","productListings",randomPipeline)
            ]);

            // Start the Reciprocal Rank Fusion (RRF) Math
            const K = 60; // RRF smoothing constant
            const fusedScores = new Map<string, { score: number, doc: any }>();

            // Process Vector Results
            vectorResults.forEach((doc, index) => {
                const rank = index + 1;
                const rrfScore = 1 / (rank + K);
                fusedScores.set(doc._id.toString(), { score: rrfScore, doc: doc });
            });

            // Process Lexical Results (and merge scores if the item already exists from the vector search)
            lexicalResults.forEach((doc, index) => {
                const rank = index + 1;
                const rrfScore = 1 / (rank + K);
                const idString = doc._id.toString();

                if (fusedScores.has(idString)) {
                    // In both seraches
                    const existing = fusedScores.get(idString)!;
                    existing.score += rrfScore;
                } else {
                    // Only in lexical search
                    fusedScores.set(idString, { score: rrfScore, doc: doc });
                }
            });

            // Sort by highest RRF score and get the top 25
            const personalizedFeed = Array.from(fusedScores.values())
                .sort((a, b) => b.score - a.score)
                .slice(0, 25)
                .map(item => item.doc);
            
            // Adding random salt to the personal feed for user exploration
            const feed = [...personalizedFeed, ...randomResults]

            // Shuffle the array 
            for (let i = feed.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                // Swap elements
                [feed[i], feed[j]] = [feed[j], feed[i]]; 
            }

            return feed;
        } catch (error) {
            console.error(`Failed to generate recommendation feed for user ${userId}:`, error);
            throw error;
        }
    }

    public static async getPersonalizedRecommentations(userId: string, query: string, images: any){
        const base64Images = images.map((image: any) => ({
            ...image,
            data: image.data.toString('base64')
        }));

        try {
            const userData = await DatabaseHandler.getUserDataById(userId);

            if (!userData) throw new Error("User not found");

            const userVector = userData.vector;
            const recentTags = userData.recentTags || [];

            // TODO: What happens when they don't have a vector

            // Initialzie Gemini
            const ai = new GoogleGenAI({});

            const imageParts = images.map((image: any) => ({
                inlineData: {
                    mimeType: image.type,
                    data: image.data.toString('base64'),
                }
            }));

            const result = await ai.models.generateContent({
                model: "gemini-3-flash-preview", 
                contents: [
                    ...imageParts,
                    { text: this.picturePrompt }
                ],
            });

            console.log(result.text)
        } catch (error) {
            console.error(`Failed to generate recommendations for user ${userId}:`, error);
            throw error;
        }

        // Get user vector + keywords (DONE)
        // Get query vector + keywords
            // Get gemini to make vector sentence and keywords
        // Get room vector + keywords
            // Get gemini to make vector sentence and key words

        // Compare vectors and keywords
        // Get top 40
        // Have gemini sift through top 40 to grab 10-15 items
    }
}

