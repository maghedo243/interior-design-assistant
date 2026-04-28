import { DatabaseHandler } from "./DatabaseHandler.js";

export interface UserData {
    id: string;
    answers: Record<string, any>;
    vector: Array<number>;
    recentTags: Array<string>;
}

class UserProfileStore {
    public updateUser(user: UserData) {
        // Push to MongoDB
    }
}

export const userStore = new UserProfileStore();