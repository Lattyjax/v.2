import requests
import json

# Test the content generation API
url = "http://localhost:3000/api/admin/ai/generate-content"
headers = {
    "Content-Type": "application/json"
}
data = {
    "topic": "Life insurance for remote workers",
    "platform": "twitter",
    "count": 3
}

try:
    response = requests.post(url, headers=headers, data=json.dumps(data))
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print("Generated Posts:")
        for i, post in enumerate(result.get('posts', [])):
            print(f"\nPost {i+1}:")
            print(f"Title: {post.get('title', 'N/A')}")
            print(f"Content: {post.get('draft', 'N/A')}")
            print(f"Platform: {post.get('platform', 'N/A')}")
            if post.get('hashtags'):
                print(f"Hashtags: {', '.join(post['hashtags'])}")
    else:
        print(f"Error: {response.text}")
except Exception as e:
    print(f"Request failed: {e}")