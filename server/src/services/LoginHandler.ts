import { MongoClient } from 'mongodb'
import bcrypt from 'bcryptjs';

export class LoginHandler {
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

    public static async login(username: string, password: string){
        //Set Up Client
        const client = this.getClient();
        const db = client.db("appdata");
        const users = db.collection("users");

        //Check user existence
        const foundUser = await users.findOne({username: username});
        if (foundUser === null) return null;

        //Verify password
        if (await bcrypt.compare(password, foundUser.password)) return foundUser._id
        else return false
    }

    public static async signup(username: string, password: string) {
        //Set Up Client
        const client = this.getClient();
        const db = client.db("appdata");
        const users = db.collection("users");

        //Check if user already exists
        if (await users.findOne({username: username}) !== null) return null

        //Encrypt password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        const result = await users.insertOne({username: username, password: hash});

        return result.insertedId
    }
}