import { pipeline, FeatureExtractionPipeline, env } from '@xenova/transformers';

// Optional: Tell Transformers.js exactly where to cache the downloaded model
env.cacheDir = './.cache'; 

export class EmbeddingHandler {
    private static extractor: FeatureExtractionPipeline | null = null;

    public static async init() {
        if (!this.extractor) {
            console.log("Loading all-MiniLM-L6-v2 into memory...");
            
            this.extractor = await pipeline(
                'feature-extraction', 
                'Xenova/all-MiniLM-L6-v2',
            ) as FeatureExtractionPipeline;
            
            console.log("✅ Vector Engine Ready!");
        }
    }

    // Converts a string into a 384-dimension vector array.
    public static async generate(text: string): Promise<number[]> {
        if (!this.extractor) {
            throw new Error("EmbeddingService was not initialized before use!");
        }

        const output = await this.extractor(text, {
            pooling: 'mean',
            normalize: true,
        });

        return Array.from(output.data);
    }
}