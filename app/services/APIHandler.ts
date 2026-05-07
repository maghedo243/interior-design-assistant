import {Product} from "@/types";
import { Image } from "react-native";
import * as SecureStore from 'expo-secure-store';

//API helpers
const APIBase = "https://interior-design-assistant.onrender.com"

let getValidPhoto = async function(urlsToCheck: String[], defaultValue="https://cdn.prod.website-files.com/687e8d1b96312cc631cafec7/68c490181202aaaa3643d239_601082646d6bf4446451b0a4_6002086f72b72717ae01d954_google-doc-error-message.png"){
    for (const id of urlsToCheck) {
        const url = `https://m.media-amazon.com/images/I/${id}.jpg`;
        
        const isValid = await new Promise((resolve) => {
            Image.getSize(
                url,
                () => resolve(true),
                () => resolve(false)
            );
        });

        if (isValid) {
            return url; 
        }
    }
    
    return defaultValue;
}

//API base call
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
    const token = await SecureStore.getItemAsync('authToken');

    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(
            {
                "userId": user,
                "itemId": product._id,
                "action": action
            }
        )
    }
    return await callAPI<any>(APIBase + "/api/user-interact", options)
}

export const sendQuestionnaire = async(user: any, answers: Record<string,any>) => {
    const token = await SecureStore.getItemAsync('authToken');

    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(
            {
                "userId": user,
                "answers": answers
            }
        )
    }
    return await callAPI<any>(APIBase + "/api/new-questionnaire", options)
}

export const getFeed = async(user: any) => {
    const token = await SecureStore.getItemAsync('authToken');

    let options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        }
    }

    const response = await callAPI<any>(APIBase + `/api/feed?userId=${user.id}`, options)
    const feedResults = await response.json()

    console.log(`✅ Loaded ${feedResults.length} products`);

    if(feedResults === undefined || feedResults.length === 0) return;

    const formattedFeed: Product[] = await Promise.all(
        feedResults.map(async (item: any) => ({
            _id: item._id,
            name: item.item_name,
            image: await getValidPhoto([item.main_image_id, ...(item.other_image_id || [])]),
            description: item.product_description,
            style: item.style
        }))
    );

    return formattedFeed;
}

export const getRecommendations = async(user: any, query: string, files: (Buffer | File)[]) => {
    const token = await SecureStore.getItemAsync('authToken');

    const formData = new FormData()

    formData.append('userId', user.id)
    formData.append('query', query)

    files.forEach((file) => {
        formData.append('files', file as any);
    });

    let options = {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: formData
    }
    const response = await callAPI<any>(APIBase + `/api/recommendation`, options)
    const recommendationResults = await response.json()

    const formattedFeed: Product[] = await Promise.all(
        recommendationResults.map(async (item: any) => ({
            _id: item._id,
            name: item.item_name,
            image: await getValidPhoto([item.main_image_id, ...(item.other_image_id || [])]),
            description: item.product_description,
            style: item.style
        }))
    );

    return formattedFeed;
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