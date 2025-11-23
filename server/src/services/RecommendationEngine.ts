import { productCatalog } from './ProductCatalog.js'
import { userStore } from './UserDataHandler.js'

export class RecommendationEngine {
    public getPersonalizedFeed(userId: string) {
        let user = userStore.getProfile(userId)
        let products = productCatalog.products

        let productRankings = []

        for (let product of products) {
            let tf_idf_score = 0
            for (let keyword of product.keywords) {
                if(keyword in user.weights){
                    tf_idf_score += (productCatalog.idfScores[keyword] || 0) * (user.weights[keyword] || 0)
                }
            }
            productRankings.push({
                id: product.id,
                score: tf_idf_score
            })
        }

        return productRankings
    }
}

export const recommendationEngine = new RecommendationEngine()

