import os
import json
from PIL import Image
from dotenv import load_dotenv
from google import genai
from google.genai import types
from schema import Level1Output

load_dotenv()

API_KEY = os.getenv("API_KEY")
MODEL_NAME = os.getenv("MODEL_NAME", "gemini-3.5-flash-lite")

client = genai.Client(api_key=API_KEY)

LEVEL1_SYSTEM_INSTRUCTION = """
You are an expert utility bill parser for Pakistani electricity bills (K-Electric / KE, LESCO, IESCO).
Your task is to extract non-identifying billing details into a strict JSON schema.

CRITICAL RULES:
1. provider must be exactly one of: "KE", "LESCO", "IESCO". For K-Electric bills, return "KE".
2. Numbers must be numbers (float/int), NOT quoted strings. Remove currency labels and commas (e.g., 'Rs. 3,430' -> 3430).
3. Credits, subsidies, and relief deductions MUST be negative numbers (e.g., 38209CR -> -38209, -0.53 -> -0.53).
4. Dates format:
   - bill_month: YYYY-MM
   - reading_date, issue_date, due_date: YYYY-MM-DD
5. Put charge lines into 'charges' and tax/duty lines into 'taxes' based on their printed section.
   - If only a combined tax amount is printed with no breakdown, return [] in taxes and the amount in total_taxes.
6. For payable_after_due_date, if multiple late-payment dates/amounts are shown, return the HIGHEST amount.
7. Use null for missing, blurred, covered, or unprinted values. Do NOT guess.
8. NEVER extract personal identifiers (names, addresses, CNIC, account/meter/consumer numbers).
"""

def extract_bill_level1(image_path: str) -> str:
    """Extracts Level 1 details and returns a single-line compact JSON string."""
    image = Image.open(image_path)
    
    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=[
            image,
            "Extract all Level 1 fields from this bill image accurately according to the provided schema."
        ],
        config=types.GenerateContentConfig(
            system_instruction=LEVEL1_SYSTEM_INSTRUCTION,
            response_mime_type="application/json",
            response_schema=Level1Output,
            temperature=0.0
        )
    )
    
    data = json.loads(response.text)
    return json.dumps(data)

if __name__ == "__main__":
    sample_path = os.path.join("data", "train", "bills", "KESC_0008.png")
    if os.path.exists(sample_path):
        print(f"Testing on {sample_path}...")
        extracted_json = extract_bill_level1(sample_path)
        print("\nExtracted Result:")
        print(json.dumps(json.loads(extracted_json), indent=2))
    else:
        print(f"Bill not found at: {sample_path}")
        print("Please place the downloaded training images inside 'data/train/bills/'.")