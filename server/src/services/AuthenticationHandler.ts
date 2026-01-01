import {MongoClient} from 'mongodb'
import bcrypt from 'bcryptjs';
import jwt, {type JwtPayload} from "jsonwebtoken";

//Payload interface to verify jwt token
interface UserPayload extends JwtPayload {
    id: string,
    role: 'admin' | 'user'
}

export class AuthenticationHandler {
    private static client: MongoClient | null = null;

    private static getClient(): MongoClient {
        if (!this.client) {
            const uri = process.env.MONGODB_URI;
            if (!uri) throw new Error("MONGODB_URI is missing");
            this.client = new MongoClient(uri);
        }
        return this.client;
    }

    private static generateToken(payload: UserPayload) {
        //Ensure secret is in env
        const secret = process.env.JWT_SECRET || null;
        if(!secret) return null

        return jwt.sign(payload, secret, { expiresIn: '1h' });
    }

    private static verifyToken<PayloadType extends jwt.JwtPayload>(token: string){
        try {
            const secret = process.env.JWT_SECRET as string;
            return jwt.verify(token, secret) as PayloadType;
        } catch (error) { //token is invalid
            return null;
        }
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
        if (foundUser === null) return { message: "user" };

        //Verify password and create token
        if (await bcrypt.compare(password, foundUser.password))
        {
            const payload: UserPayload = {
                id: foundUser._id.toHexString(),
                role: "user"
            };

            const token = this.generateToken(payload);
            if(!token) return { message: "FatalError" }

            return { message: "Login Successful" , token: token }
        }
        //Invalid password
        else return { message: "password" }
    }

    public static async signup(username: string, password: string) {
        //Set Up Client
        const client = this.getClient();
        const db = client.db("appdata");
        const users = db.collection("users");

        //Check if user already exists
        if (await users.findOne({username: username}) !== null) return { message: "exists" }

        //Encrypt password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        const result = await users.insertOne({username: username, password: hash});

        //Generate token
        const payload: UserPayload = {
            id: result.insertedId.toHexString(),
            role: "user"
        };

        const token = this.generateToken(payload);
        if(!token) return { message: "FatalError" }

        return { message: "Login Successful" , token: token }
    }

    public static verifyUserToken(token: string){
        const verify = this.verifyToken<UserPayload>(token)
        return !!verify
    }
}