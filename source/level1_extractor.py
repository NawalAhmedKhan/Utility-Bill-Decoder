# import os
# import json
# from PIL import Image
# from dotenv import load_dotenv
# from google import genai
# from google.genai import types
# from schema import Level1Output

# load_dotenv()

# API_KEY = os.getenv("API_KEY")
# MODEL_NAME = os.getenv("MODEL_NAME", "gemini-3.5-flash-lite")

# client = genai.Client(api_key=API_KEY)

# LEVEL1_SYSTEM_INSTRUCTION = """
# You are an expert utility bill parser for Pakistani electricity bills (K-Electric / KE, LESCO, IESCO).
# Your task is to extract non-identifying billing details into a strict JSON schema.

# CRITICAL RULES:
# 1. provider must be exactly one of: "KE", "LESCO", "IESCO". For K-Electric bills, return "KE".
# 2. Numbers must be numbers (float/int), NOT quoted strings. Remove currency labels and commas (e.g., 'Rs. 3,430' -> 3430).
# 3. Credits, subsidies, and relief deductions MUST be negative numbers (e.g., 38209CR -> -38209, -0.53 -> -0.53).
# 4. Dates format:
#    - bill_month: YYYY-MM
#    - reading_date, issue_date, due_date: YYYY-MM-DD
# 5. Put charge lines into 'charges' and tax/duty lines into 'taxes' based on their printed section.
#    - If only a combined tax amount is printed with no breakdown, return [] in taxes and the amount in total_taxes.
# 6. For payable_after_due_date, if multiple late-payment dates/amounts are shown, return the HIGHEST amount.
# 7. Use null for missing, blurred, covered, or unprinted values. Do NOT guess.
# 8. NEVER extract personal identifiers (names, addresses, CNIC, account/meter/consumer numbers).
# """

# def extract_bill_level1(image_path: str) -> str:
#     """Extracts Level 1 details and returns a single-line compact JSON string."""
#     image = Image.open(image_path)
    
#     response = client.models.generate_content(
#         model=MODEL_NAME,
#         contents=[
#             image,
#             "Extract all Level 1 fields from this bill image accurately according to the provided schema."
#         ],
#         config=types.GenerateContentConfig(
#             system_instruction=LEVEL1_SYSTEM_INSTRUCTION,
#             response_mime_type="application/json",
#             response_schema=Level1Output,
#             temperature=0.0
#         )
#     )
    
#     data = json.loads(response.text)
#     return json.dumps(data)

# if __name__ == "__main__":
#     sample_path = os.path.join("data", "train", "bills", "KESC_0008.png")
#     if os.path.exists(sample_path):
#         print(f"Testing on {sample_path}...")
#         extracted_json = extract_bill_level1(sample_path)
#         print("\nExtracted Result:")
#         print(json.dumps(json.loads(extracted_json), indent=2))
#     else:
#         print(f"Bill not found at: {sample_path}")
#         print("Please place the downloaded training images inside 'data/train/bills/'.")
from PIL import Image

from llm import generate_structured
from schema import BillExtraction

PROMPT = """You read Pakistani electricity bills (K-Electric = KE, LESCO, IESCO). Extract the bill into the schema.
Layouts differ, some bills are tilted or partly in Urdu, and personal details are hidden by grey boxes.

Rules:
- Copy values as printed. Do not recalculate, round or correct anything.
- Amounts are plain numbers in PKR (no Rs., no commas). Credits and subsidies are negative (38209CR -> -38209).
- Dates are YYYY-MM-DD, bill_month is YYYY-MM.
- Anything missing, blank, covered by a grey box or unreadable is null. Never guess. Empty lists are [].
- Never output names, addresses, CNIC, account, reference, consumer or meter numbers.
- tariff: code exactly as printed. sanctioned_load_kw: labelled Sanc Load, S.Load or San Load.
- units_consumed: units billed for the current month.
- charges: one entry per line of the charges section. Skip blank or 0 lines. Keep repeated types as separate entries.
  Types: energy (cost of units, variable upto N units, energy charges), fixed, fpa (both FPA and FCA),
  quarterly_adjustment (QTA, uniform quarterly adjustment), surcharge (e.g. additional surcharge PHL, F.C surcharge),
  meter_rent (meter or service rent), subsidy (negative), other.
- taxes: one entry per line of the tax or government section; classify by section, not by name.
  Types: gst (including GST on FPA), electricity_duty, income_tax, municipal_tax (e.g. KE MUCT/KMC), other_tax (e.g. TV fee).
  If only a combined tax amount is printed, taxes is [] and total_taxes holds it.
- total_charges / total_taxes: the printed subtotals, else null.
- current_bill: printed amount for this month. arrears: previous dues with the printed sign, null if blank.
- payable_within_due_date: amount payable by the due date.
- payable_after_due_date: amount after the due date; if several late amounts are shown, use the highest.
"""


def extract_bill(image_path: str, client, model: str) -> BillExtraction:
    with Image.open(image_path) as img:
        img.load()
        return generate_structured(client, model, [img, PROMPT], BillExtraction)