import { DatabaseHandler } from './DatabaseHandler.js';
import { UserDataHandler } from './UserDataHandler.js'

export class RecommendationEngine {
    // public getPersonalizedFeed(userId: string) {
    //     let user = userStore.getProfile(userId)
    //     let products = productCatalog.products

    //     let productRankings = [];

    //     for (let product of products) {
    //         let tf_idf_score = 0
    //         for (let keyword of product.keywords) {
    //             if(user.weights[keyword]) {
    //                 let idf_score = productCatalog.idfScores[keyword] || 1
    //                 tf_idf_score += idf_score * user.weights[keyword]
    //             }
    //         }
    //         productRankings.push({
    //             product: product,
    //             score: tf_idf_score
    //         })
    //     }

    //     productRankings.sort((a, b) => b.score - a.score)


    //     // only returns certain properties
    //     return productRankings.slice(0,40).map((item) => {
    //             return {
    //                 id: item.product.id,
    //                 name: item.product.name,
    //                 price: item.product.price,
    //                 image_url: item.product.image_url
    //             }
    //         }
    //     );
    // }

    public static async getPersonalizedFeed(userId: string) {
        

        try {
            const userData = await DatabaseHandler.getUserDataById(userId);

            if (!userData) throw new Error("User not found");

            const userVector = userData.vector;
            const recentTags = userData.recentTags || [];

            if (!userVector || userVector.length === 0) {
                console.log(`Cold start for user: ${userId}. Serving default feed.`);
                
                return await DatabaseHandler.query("products","productListings",[{ $sample: { size: 30 } }]);
            }
            
            const userSearchTerms = recentTags.join(" ");

            // Product Search Pipeline
            const pipeline = [
                {
                    $rankFusion: {
                        input: {
                            pipelines: {
                                // Vector Search
                                vectorSearchLeg: [
                                    {
                                        $vectorSearch: {
                                            index: "vector_index", 
                                            path: "description_embedding",
                                            queryVector: userVector,
                                            numCandidates: 100,
                                            limit: 50
                                        }
                                    }
                                ],
                                // Keyword Search
                                keywordSearchLeg: [
                                    {
                                        $search: {
                                            index: "default",
                                            text: {
                                                query: userSearchTerms,
                                                path: ["enriched_keywords", "item_name", "style"]
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                },
                // Cap the final feed at 30
                { $limit: 30 },
                
                // Clean the payload for the frontend
                {
                    $project: {
                        description_embedding: 0, 
                        
                        // You can optionally project the internal RRF score to see the math in your console
                        scoreDetails: { $meta: "searchScore" }
                    }
                }
            ];

            const feed = await DatabaseHandler.query("products","productListings",pipeline)
            return feed;
        } catch (error) {
            console.error(`Failed to generate recommendation feed for user ${userId}:`, error);
            throw error;
        }
    }


}

