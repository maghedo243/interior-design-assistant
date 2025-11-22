const APIBase = "https://interior-design-assistant.onrender.com"

const callAPI = async <T>(requestLocation: RequestInfo, options: RequestInit = {}) => {
    try {
        const response = await fetch(requestLocation,options);
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`HTTP error! Status: ${response.status} - ${errorBody}`);
        }

        const data = await response.json()
        return data as T
    }  catch (error) {
        console.error("API Error:", error);
        throw error
    }
}

export const sendInteraction = async(user: any,action: 'like' | 'dislike') => {
    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(
            {
                "userId": "TESTID",
                "itemId": "TESTITEM",
                "action": action
            }
        )
    }
    try {
        return await callAPI<any>(APIBase + "/api/user-interact", options)
    } catch (error) {
        console.error("API Error:", error);
    }
}