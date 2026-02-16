from google import genai
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize client
client = genai.Client(api_key=os.getenv('GEMINI_API_KEY'))

# Test models
models_to_test = [
    'gemini-2.0-flash-exp',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
]

for model in models_to_test:
    try:
        response = client.models.generate_content(
            model=model,
            contents="Say hello in one word"
        )
        print(f"✅ {model} works! Response: {response.text}")
    except Exception as e:
        print(f"❌ {model} failed: {e}")