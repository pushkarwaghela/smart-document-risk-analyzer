from google import genai
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize client
client = genai.Client(api_key=os.getenv('GEMINI_API_KEY'))

try:
    # List all available models
    print("📋 Available models:")
    print("=" * 50)
    
    # Try different API versions
    models = client.models.list()
    
    for model in models:
        print(f"\n🔹 Model: {model.name}")
        print(f"   Display name: {getattr(model, 'display_name', 'N/A')}")
        print(f"   Description: {getattr(model, 'description', 'N/A')[:100]}")
        if hasattr(model, 'supported_generation_methods'):
            print(f"   Methods: {model.supported_generation_methods}")
    
except Exception as e:
    print(f"❌ Error: {e}")
    
    # Try alternative approach
    try:
        print("\n🔄 Trying alternative API...")
        import requests
        
        api_key = os.getenv('GEMINI_API_KEY')
        url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
        response = requests.get(url)
        
        if response.status_code == 200:
            data = response.json()
            for model in data.get('models', []):
                print(f"\n🔹 Model: {model['name']}")
                print(f"   Description: {model.get('description', 'N/A')[:100]}")
                print(f"   Methods: {model.get('supportedGenerationMethods', [])}")
        else:
            print(f"❌ API Error: {response.status_code} - {response.text}")
    except Exception as e2:
        print(f"❌ Alternative also failed: {e2}")