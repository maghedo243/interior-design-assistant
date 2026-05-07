import { DatabaseHandler } from './DatabaseHandler.js';
import { UserDataHandler } from './UserDataHandler.js';
import { EmbeddingHandler } from './EmbeddingHandler.js';
import { GoogleGenAI } from "@google/genai";


export class RecommendationEngine {
    private static picturePrompt = `You are an expert Interior Design Aesthetic Extractor generating a string for a vector database. Your job is to analyze the attached image of a room and extract its core design language, formatted EXACTLY like an e-commerce product listing.

                                    Truths: 
                                    - Do not describe specific pieces of furniture in the room (e.g., do not say "there is a bed" or "a desk").
                                    - Focus entirely on the overarching style, colors, materials, and lighting.
                                    - Do not output anything except the final formatted string.

                                    Format: 
                                    You MUST strictly follow this exact template: 
                                    "Interior Design Canvas Style: {Style Name}. {2-3 descriptive e-commerce style bullet points about the room's colors, materials, and vibe}. Category & Features: {semantic keywords about the room's aesthetic}"

                                    Example Output:
                                    "Interior Design Canvas Style: Industrial Loft. Features exposed red brick walls and rich dark wood flooring that provides a warm, rustic foundation. Accented with matte black metal fixtures and architectural details for a modern, moody atmosphere. Flooded with natural light to balance the dark, earthy tones. Category & Features: industrial modern rustic dark wood black metal moody minimalist architecture"`

    private static queryPrompt = `You are an expert Interior Design Translator generating a string for a vector
                                    database. Your job is to read the user's redecorating request and translate
                                    their desired outcome into a hypothetical e-commerce product listing.

                                    Truths:

                                    - Do not send any messages aside from the final formatted string.
                                    - Focus strictly on the user's DESIRED aesthetic, colors, and materials.
                                    - If the user asks for a specific item (e.g., "a rug", "a lamp"), use that
                                        item as the Product Name.
                                    - If the user only asks for a vibe change (e.g., "make it moodier", "more
                                        coastal"), use "Curated Decor Element" as the Product Name.

                                    Format: You MUST strictly follow this exact template: "{Product Name} Style:
                                    {Style Name}. {2-3 descriptive e-commerce style bullet points emphasizing the
                                    requested colors, textures, and aesthetic changes. Bullet points separated by
                                    .}. Category & Features: {semantic keywords about the target aesthetic and
                                    requested item}"
                                    `

    private static vibePrompt = ``

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
                            path: ["enriched_keywords", "item_name.value", "style.value"]
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
        try {
            const userData = await DatabaseHandler.getUserDataById(userId);

            if (!userData) throw new Error("User not found");

            const userVector = userData.vector || [];
            const recentTags = userData.recentTags || [];

            // Initialzie Gemini
            const ai = new GoogleGenAI({});

            const imageParts = images.map((image: any) => ({
                inlineData: {
                    mimeType: image.type,
                    data: image.data.toString('base64'),
                }
            }));

            // Ask Gemini for picture and query vector strings
            const [pictureResult, queryResult] = await Promise.all([
                ai.models.generateContent({
                    model: "gemini-3-flash-preview", 
                    contents: [...imageParts, { text: this.picturePrompt }]
                }),
                ai.models.generateContent({
                    model: "gemini-3-flash-preview", 
                    contents: [{ text: this.queryPrompt + "Redecoration Request: \"" + query + "\"" }]
                })
            ]);

            if(!pictureResult.text) throw "Room Context not generated: gemini failure"
            if(!queryResult.text) throw "Query Context not generated: gemini failure"

            const roomVectorString = pictureResult.text.trim()
            let roomKeywords = roomVectorString.split("Category & Features:")[1]

            const queryVectorString = queryResult.text.trim()
            let queryKeywords = queryVectorString.split("Category & Features:")[1]

            if(!roomKeywords) throw "Room Keywords not generated: gemini failure"
            if(!queryKeywords) throw "Query Keywords not generated: gemini failure"

            roomKeywords = roomKeywords.trim()
            queryKeywords = queryKeywords.trim()
            
            // Generate vectors
            const roomVector = await EmbeddingHandler.generate(roomVectorString);
            const queryVector = await EmbeddingHandler.generate(queryVectorString);

            // Set up search pipelines
            const queryVectorPipeline = [
                    { $vectorSearch: { index: "vector_index", path: "description_embedding", queryVector: queryVector, numCandidates: 100, limit: 50 } },
                    { $project: { description_embedding: 0 } }
                ]

            const roomVectorPipeline = [
                    { $vectorSearch: { index: "vector_index", path: "description_embedding", queryVector: roomVector, numCandidates: 100, limit: 50 } },
                    { $project: { description_embedding: 0 } }
                ]

            const userVectorPipeline = [
                    { $vectorSearch: { index: "vector_index", path: "description_embedding", queryVector: userVector, numCandidates: 100, limit: 50 } },
                    { $project: { description_embedding: 0 } }
                ]

            const lexicalPipeline = [
                    {
                        $search: {
                            index: "default",
                            compound: {
                                should: [
                                    // Query weight at 5.0
                                    {
                                        text: {
                                            query: queryKeywords, 
                                            path: ["item_name.value", "enriched_keywords"],
                                            score: { boost: { value: 5.0 } }
                                        }
                                    },
                                    // Room weight at 2.0
                                    {
                                        text: {
                                            query: roomKeywords,
                                            path: ["style.value", "enriched_keywords"],
                                            score: { boost: { value: 2.0 } }
                                        }
                                    },
                                    // User weight at 0.5
                                    {
                                        text: {
                                            query: recentTags,
                                            path: ["style.value", "enriched_keywords"],
                                            score: { boost: { value: 0.5 } } 
                                        }
                                    }
                                ]
                            }
                        }
                    },
                    { $limit: 50 },
                    { $project: { description_embedding: 0 } }
                ];

            const pipelines = [
                DatabaseHandler.query("products","productListings",queryVectorPipeline),
                DatabaseHandler.query("products","productListings",roomVectorPipeline),
                DatabaseHandler.query("products","productListings",lexicalPipeline)
            ]

            if (userVector) {
                pipelines.push(DatabaseHandler.query("products","productListings",userVectorPipeline))
            }
            
            // Query database with pipelines
            const [queryResults, roomResults, lexicalResults, userResults] = await Promise.all(pipelines);

            // Setup for RRF math
            const K = 60; // Smoothing constant
            const fusedScores = new Map<string, { score: number; doc: any }>();

            // Weighing Function
            const applyRRF = (results: any[], weight: number) => {
                results.forEach((doc, index) => {
                    const rank = index + 1; // Ranks are 1-based
                    const rrfScore = weight / (K + rank);
                    const id = doc._id.toString();

                    if (fusedScores.has(id)) {
                        // Add the new weighted score to the existing one
                        const entry = fusedScores.get(id)!;
                        entry.score += rrfScore;
                        
                        // Safety: If the existing doc was "hollow" (only had _id),
                        // and this new doc has more fields, update it.
                        if (Object.keys(doc).length > Object.keys(entry.doc).length) {
                            entry.doc = doc;
                        }
                    } else {
                        fusedScores.set(id, { score: rrfScore, doc: doc });
                    }
                });
            };

            // 3. Apply the math to your result sets
            applyRRF(queryResults ?? [], 2.0);
            applyRRF(roomResults ?? [], 1.2);
            applyRRF(lexicalResults ?? [], 1.0);

            // Only apply the user profile if user had vector
            if (userResults) {
                applyRRF(userResults, 0.6); 
            }

            // 4. Sort and Slice
            const finalFeed = Array.from(fusedScores.values())
                .sort((a, b) => b.score - a.score)
                .slice(0, 30)
                .map(item => item.doc);

            console.log(finalFeed)

            return finalFeed
            
        } catch (error) {
            console.error(`Failed to generate recommendations for user ${userId}:`, error);
            throw error;
        }

        // Get user vector + keywords (DONE)
        // Get query vector + keywords (DONE)
            // Get gemini to make vector sentence and keywords (DONE)
        // Get room vector + keywords (DONE)
            // Get gemini to make vector sentence and key words (DONE)

        // Compare vectors and keywords
        // Get top 40
        // Have gemini sift through top 40 to grab 10-15 items
    }
}

