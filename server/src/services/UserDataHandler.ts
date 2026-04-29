import type { UserData } from "../types/DBDocuments.js";
import { DatabaseHandler } from "./DatabaseHandler.js";

class UserProfileStore {
    public updateUser(user: UserData) {
        // Push to MongoDB
    }
}

export const userStore = new UserProfileStore();