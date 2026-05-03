import type { UserData } from "../types/DBDocuments.js";
import { DatabaseHandler } from "./DatabaseHandler.js";

export class UserDataHandler {
    public static updateProfileVector(userVector: number[] | undefined, itemVector: number[], weight: number = 0.15): number[] {
        // The Cold Start
        if (!userVector || userVector.length === 0) {
            return itemVector;
        }

        // Ensure dimensions match
        if (userVector.length !== itemVector.length) {
            throw new Error("Vector dimensions do not match.");
        }

        const historyWeight = 1.0 - weight;

        // .map() iterates through the array and returns the new array directly
        return userVector.map((userValue, i) => {
            return (itemVector[i]! * weight) + (userValue * historyWeight);
        });
    }
}