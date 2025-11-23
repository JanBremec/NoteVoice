from google import genai

client = genai.Client(api_key="Your_API_Key")

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Explain how AI works in 100 words",
)

print(response.text)
