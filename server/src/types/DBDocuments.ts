import type { ObjectId } from "mongodb";

export interface UserData {
    id: string;
    answers: Record<string, any>;
    vector: Array<number>;
    recentTags: Array<string>;
}