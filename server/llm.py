import os
from dotenv import load_dotenv
from google import genai
from PIL import Image

# 1. Load your API key
load_dotenv()
api_key = os.getenv("GEMNI_API_KEY")
print(f"Key found: {api_key is not None}")

# 2. Initialize the Gemini Client
client = genai.Client(api_key="AIzaSyCOFYiQZZ74-aoxb-TRLR4X0kfjwARwyYM")


def analyze_room_for_ida(image_path, user_query):
    # Load the image (e.g., a room scan from your React Native app)
    img = Image.open(image_path)

    # 3. Call Gemini 2.0 Flash (Best for speed/multimodal)
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=[
            f"IDA Project Mode: {user_query}", 
            img
        ]
    )
    
    return response.text

# # Quick Test Example
# if __name__ == "__main__":
#     result = analyze_room_for_ida("icon.png", "Find accessibility hazards in this room.")
#     print(result)