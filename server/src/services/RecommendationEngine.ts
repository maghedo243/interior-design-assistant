import { productCatalog } from './ProductCatalog.js'
import { userStore } from './UserDataHandler.js'

export class RecommendationEngine {
    public getPersonalizedFeed(userId: string) {
        let user = userStore.getProfile(userId)
        let products = productCatalog.products

        let productRankings = [];

        for (let product of products) {
            let tf_idf_score = 0
            for (let keyword of product.keywords) {
                if(user.weights[keyword]) {
                    let idf_score = productCatalog.idfScores[keyword] || 1
                    tf_idf_score += idf_score * user.weights[keyword]
                }
            }
            console.log(tf_idf_score)
            productRankings.push({
                product: product,
                score: tf_idf_score
            })
        }

        productRankings.sort((a, b) => b.score - a.score)
        productRankings.slice(0,40)

        // only returns certain properties
        return productRankings.map((item) => {
                return {
                    id: item.product.id,
                    name: item.product.name,
                    price: item.product.price,
                    image_url: item.product.image_url
                }
            }
        );
    }
}

export const recommendationEngine = new RecommendationEngine()

