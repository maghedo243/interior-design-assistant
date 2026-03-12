import {type Document, MongoClient} from 'mongodb'

export class DatabaseHandler {
    private static client: MongoClient | null = null;
    
    private static getClient(): MongoClient {
        if (!this.client) {
            const uri = process.env.MONGODB_URI;
            if (!uri) throw new Error("MONGODB_URI is missing");
            this.client = new MongoClient(uri);
        }
        return this.client;
    }

    public static async init() {
        const client = this.getClient();
        await client.connect();
        console.log("Mongo connected!");
    }

    public static async query<T = any>(databaseName: string, collectionName: string, pipeline: Document[]): Promise<T[]> {
        if (!Array.isArray(pipeline)) {
            throw new Error("Query must be an array of aggregation stages.");
        }

        try{
            const client = this.getClient();
            const db = client.db(databaseName);
            const collection = db.collection(collectionName);

            const results = await collection.aggregate(pipeline).toArray();

            return results as unknown as T[];
        } catch (error) {
            console.error(`Query failed in ${collectionName}:`, error);
            throw error;
        }
    }

    public static async queryOne<T = any>(databaseName: string, collectionName: string, pipeline: Document[]): Promise<T | undefined> {
        const results = await this.query<T>(databaseName, collectionName, pipeline);
        return results.length > 0 ? results[0] : undefined;
    }
}