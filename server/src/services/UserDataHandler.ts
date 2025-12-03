
// weights: { 'blue': -5, 'red': 2, 'yellow': -3, 'green': 11 }
export interface UserData {
    id: string;
    weights: Record<string, number>;
    total_interactions: number;
}

class UserProfileStore {
    private profiles: Record<string, UserData> = {};

    constructor() {
        // local test
        if (process.env.NODE_ENV !== 'production') {
            this.seedTestUsers();
        }
    }

    private seedTestUsers() {
        console.log("🧪 Seeding Test Personas...");

        // Persona A: Loves Blue
        this.profiles["User_Blue"] = {
            id: "User_Blue",
            weights: { "blue": 50, "navy": 30, "cyan": 20 },
            total_interactions: 100
        };

        // Persona B: Loves Modern/Minimal
        this.profiles["User_Modern"] = {
            id: "User_Modern",
            weights: { "modern": 50, "minimalist": 40, "sleek": 30 },
            total_interactions: 120
        };

        // Persona C: Hates Chairs (Negative Weights)
        this.profiles["User_Hater"] = {
            id: "User_Hater",
            weights: { "chair": -100, "seating": -50 },
            total_interactions: 50
        };
    }

    public getProfile(userId: string): UserData {
        if (!this.profiles[userId]) {
            this.profiles[userId] = {
                id: userId,
                weights: {},
                total_interactions: 0
            };
        }
        return this.profiles[userId];
    }

    public updateUser(userId: string, keywords: string[], weightToAdd: number) {
        const profile = this.getProfile(userId);

        keywords.forEach(word => {
            if (!profile.weights[word]) {
                profile.weights[word] = 0;
            }
            profile.weights[word] += weightToAdd;
        });

        profile.total_interactions += 1;
    }
}

export const userStore = new UserProfileStore();