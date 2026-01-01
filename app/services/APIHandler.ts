import {Product} from "@/types";

const APIBase = "http://10.0.2.2:5000"

const callAPI = async <T>(requestLocation: RequestInfo, options: RequestInit = {}) => {
    try {
        const response = await fetch(requestLocation,options);
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`HTTP error! Status: ${response.status} - ${errorBody}`);
        }
        return response
    }  catch (error) {
        console.error("API Error:", error);
        throw error
    }
}

export const sendInteraction = async(user: any, product: Product, action: 'like' | 'dislike' | 'maybe') => {
    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(
            {
                "userId": user,
                "itemId": product.id,
                "action": action
            }
        )
    }
    return await callAPI<any>(APIBase + "/api/user-interact", options)
}

export const getFeed = async(user: any) => {
    let options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    }
    return await callAPI<any>(APIBase + `/api/feed?userId=${user}`, options)
}

export const userLogin = async(username: string, password: string) => {
    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(
            {
                "username": username,
                "password": password,
                "mode": "login"
            }
        )
    }
    return await callAPI<any>(APIBase + `/api/auth/login`, options)
}

export const userSignup = async(username: string, password: string) => {
    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(
            {
                "username": username,
                "password": password,
                "mode": "signup"
            }
        )
    }
    return await callAPI<any>(APIBase + `/api/auth/login`, options)
}

export const verifyUserToken = async(token: string) => {
    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(
            {
                "token": token
            }
        )
    }
    return await callAPI<any>(APIBase + `/api/auth/verify`, options)
}