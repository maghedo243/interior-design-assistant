import {type Document, MongoClient, ObjectId} from 'mongodb'
import { type UserData } from '../types/DBDocuments.js';

export class DatabaseHandler {
    private static client: MongoClient | null = null;
    
    // Retrives appropriate client from the cloud database
    private static getClient(): MongoClient {
        if (!this.client) {
            const uri = process.env.MONGODB_URI;
            if (!uri) throw new Error("MONGODB_URI is missing");
            this.client = new MongoClient(uri);
        }
        return this.client;
    }

    // Initializes and connects to the Mongo Client
    public static async init() {
        const client = this.getClient();
        await client.connect();
        console.log("Mongo connected!");
    }

    // Queries Mongo Database with a pre-made pipeline argument
    public static async query<T = any>(databaseName: string, collectionName: string, pipeline: Document[]): Promise<T[]> {
        try{
            const client = this.getClient();
            const db = client.db(databaseName);
            const collection = db.collection(collectionName);

            const results = await collection.aggregate(pipeline).toArray();

            return results as unknown as T[]; // unknown clause for typescript weirdness
        } catch (error) {
            console.error(`Query failed in ${collectionName}:`, error);
            throw error;
        }
    }

    // Queries Mongo Database with a pre-made pipeline argument and returns the first document
    public static async queryOne<T = any>(databaseName: string, collectionName: string, pipeline: Document[]): Promise<T | undefined> {
        const results = await this.query<T>(databaseName, collectionName, pipeline);
        return results.length > 0 ? results[0] : undefined;
    }

    // Inserts one document into the appropriate database
    public static async insertOne(databaseName: string, collectionName: string, doc: Document){
        const client = this.getClient();
        const db = client.db(databaseName);
        const collection = db.collection(collectionName);

        const result = await collection.insertOne(doc);
        return result
    }

    // Gets user by userID
    public static async getUserDataById(userId: string): Promise<UserData | undefined> {
        const client = this.getClient();
        const db = client.db("appdata")
        const collection = db.collection("userData")
        
        try{
            const userData = await collection.findOne({ _id: new ObjectId(userId) });

            if(!userData) return;

            const user: UserData = {
                id: userId,
                answers: userData.questionnaireAnswers,
                vector: userData.vector,
                recentTags: userData.recentTags
            }
            
            return user
        } catch (error) {
            console.error(`Query failed in ${collection.collectionName}:`, error);
            throw error;
        }
    }

    // Updates cloud user data with local values
    public static async updateUserData(userData: UserData): Promise<boolean> {
        const client = this.getClient();
        const db = client.db("appdata")
        const collection = db.collection("userData")

        try{
            await collection.updateOne(
                { _id: new ObjectId(userData.id) },
                { 
                    $set: {
                        answers: userData.answers,
                        vector: userData.vector,
                        recentTags: userData.recentTags
                    } 
                }
            );

            return true;
        } catch (error) {
            console.error(`Query failed in ${collection.collectionName}:`, error);
            return false;
        }
    }

    // Gets product from _id attribute
    public static async getProductById(itemId: string) {
        const client = this.getClient();
        const db = client.db("products")
        const collection = db.collection("productListings")
        
        try{
            const productData = await collection.findOne({ _id: new ObjectId(itemId) }) as any;

            if(!productData) return;
            
            return productData;
        } catch (error) {
            console.error(`Query failed in ${collection.collectionName}:`, error);
            throw error;
        }
    }
}