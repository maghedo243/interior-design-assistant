import {MongoClient} from 'mongodb'
import bcrypt from 'bcryptjs';
import jwt, {type JwtPayload} from "jsonwebtoken";
import { DatabaseHandler } from './DatabaseHandler.js';

//Payload interface to verify jwt token
interface UserPayload extends JwtPayload {
    id: string,
    role: 'admin' | 'user'
}

// Class to handle authentication with the correct token
export class AuthenticationHandler {
    private static generateToken(payload: UserPayload) {
        //Ensure secret is in env
        const secret = process.env.JWT_SECRET || null;
        if(!secret) return null

        return jwt.sign(payload, secret, { expiresIn: '12h' });
    }

    private static verifyToken<PayloadType extends jwt.JwtPayload>(token: string){
        try {
            const secret = process.env.JWT_SECRET as string;
            return jwt.verify(token, secret) as PayloadType;
        } catch (error) { //token is invalid
            return null;
        }
    }

    public static async init() {}

    public static async login(username: string, password: string){
        const qPipeline = [
            { $match: { username: username } },
            { $limit: 1 }
        ];

        //Check user existence
        const foundUser = await DatabaseHandler.queryOne("appdata","users",qPipeline)
        if (foundUser === undefined) return { message: "user" };

        //Verify password and create token
        if (await bcrypt.compare(password, foundUser.password))
        {
            const payload: UserPayload = {
                id: foundUser._id.toHexString(),
                role: "user"
            };

            const token = this.generateToken(payload);
            if(!token) return { message: "FatalError" }

            return { message: "Login Successful" , token: token , userid: foundUser._id.toHexString() }
        }
        //Invalid password
        else return { message: "password" }
    }

    public static async signup(username: string, password: string) {
        const qPipeline = [
            { $match: { username: username } },
            { $limit: 1 }
        ];

        //Check user existence
        const foundUser = await DatabaseHandler.queryOne("appdata","users",qPipeline)

        //Check if user already exists
        if (foundUser !== undefined) return { message: "exists" }

        //Encrypt password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        const result = await DatabaseHandler.insertOne("appdata","users",{username: username, password: hash});

        //Generate token
        const payload: UserPayload = {
            id: result.insertedId.toHexString(),
            role: "user"
        };

        const token = this.generateToken(payload);
        if(!token) return { message: "FatalError" }

        return { message: "Login Successful" , token: token , userid: result.insertedId.toHexString() }
    }

    public static verifyUserToken(token: string) : boolean{
        const verify = this.verifyToken<UserPayload>(token)
        return !!verify //double negative to ensure it exists
    }
}