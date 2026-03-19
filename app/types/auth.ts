//Interfaces for auth-related tasks
export interface User {
    id: number;
    username: string;
    role: 'admin' | 'user';
}

export interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    newUser: boolean;
    loading: boolean;
    homePage: boolean;
    login: (username: string, password: string, mode: string) => Promise<any>;
    logout: () => Promise<void>;
    setNewUser: (newUser: boolean) => void;
    setHomePage: (newUser: boolean) => void;
}