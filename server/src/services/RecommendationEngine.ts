import { DatabaseHandler } from './DatabaseHandler.js';
import { UserDataHandler } from './UserDataHandler.js'

export class RecommendationEngine {
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


}

