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
                let idf_score = productCatalog.idfScores[keyword] || 1

                if(user.weights[keyword]) tf_idf_score += idf_score * user.weights[keyword]
            }
            productRankings.push({
                id: product.id,
                score: tf_idf_score
            })
        }

        return productRankings.slice(0,40)
    }
}

export const recommendationEngine = new RecommendationEngine()

