# import os
# import json
# import csv
# import time
# import pandas as pd
# from PIL import Image
# from dotenv import load_dotenv
# from google import genai
# from google.genai import types
# from schema import Level1Output

# load_dotenv()

# API_KEY = os.getenv("API_KEY")
# MODEL_NAME = os.getenv("MODEL_NAME", "gemini-3.5-flash-lite")
# client = genai.Client(api_key=API_KEY)

# LEVEL1_SYSTEM = """
# You are an expert utility bill parser for Pakistani electricity bills (KE, LESCO, IESCO).
# Extract all non-identifying billing details strictly according to the schema.
# - provider must be: 'KE', 'LESCO', or 'IESCO'
# - All amounts must be pure numbers (float/int), no symbols or strings.
# - Credits, subsidies, relief deductions must be negative.
# - Dates: bill_month (YYYY-MM), reading_date/issue_date/due_date (YYYY-MM-DD).
# - Classify lines based on their printed section (charges vs taxes).
# - For payable_after_due_date, take the highest amount if multiple exist.
# - Use null for unprinted/missing values. Do NOT include personal identifiers.
# """

# def extract_l1(img_path: str) -> str:
#     img = Image.open(img_path)
#     for attempt in range(5):
#         try:
#             resp = client.models.generate_content(
#                 model=MODEL_NAME,
#                 contents=[img, "Extract all Level 1 fields into the JSON schema."],
#                 config=types.GenerateContentConfig(
#                     system_instruction=LEVEL1_SYSTEM,
#                     response_mime_type="application/json",
#                     response_schema=Level1Output,
#                     temperature=0.0
#                 )
#             )
#             return json.dumps(json.loads(resp.text))
#         except Exception as e:
#             if "429" in str(e):
#                 print(f"[Rate limit hit in L1] Waiting 30s before retry {attempt+1}/5...")
#                 time.sleep(30)
#             else:
#                 raise e
#     raise RuntimeError(f"Failed L1 extraction for {img_path}")

# def answer_l2_batch(img_path: str, l1_json: str, questions_dict: dict) -> dict:
#     img = Image.open(img_path)
#     q_listing = "\n".join([f"- {qid}: {qtext}" for qid, qtext in questions_dict.items()])
#     prompt = f"""
# You are answering customer questions about this electricity bill in plain English.
# Extracted bill data:
# {l1_json}

# Questions to answer:
# {q_listing}

# Rules:
# - Answer every question accurately based strictly on this bill.
# - Perform exact calculations. Label estimates clearly.
# - If information is unprinted or missing, say so clearly instead of guessing.
# - Do NOT include personal identifiers (no names, addresses, CNIC, account/meter numbers).
# - Return a valid JSON object where keys are the question IDs (e.g. "Q1", "Q2") and values are your plain English answers.
# """
#     for attempt in range(5):
#         try:
#             resp = client.models.generate_content(
#                 model=MODEL_NAME,
#                 contents=[img, prompt],
#                 config=types.GenerateContentConfig(
#                     response_mime_type="application/json",
#                     temperature=0.1
#                 )
#             )
#             return json.loads(resp.text)
#         except Exception as e:
#             if "429" in str(e):
#                 print(f"[Rate limit hit in L2] Waiting 35s before retry {attempt+1}/5...")
#                 time.sleep(35)
#             else:
#                 print(f"Error on batch: {e}. Retrying in 5s...")
#                 time.sleep(5)
#     return {qid: "Information not available on bill." for qid in questions_dict}

# def run_pipeline(test_dir: str, output_dir: str):
#     bills_dir = os.path.join(test_dir, "bills")
#     csv_dir = os.path.join(test_dir, "csv")
#     os.makedirs(output_dir, exist_ok=True)

#     out_l1 = os.path.join(output_dir, "level1.csv")
#     out_l2 = os.path.join(output_dir, "level2.csv")

#     if os.path.exists(out_l1):
#         print(f"Found existing {out_l1}. Reusing Level 1 to preserve API quota...")
#         l1_df = pd.read_csv(out_l1, dtype=str)
#     else:
#         l1_df = pd.read_csv(os.path.join(csv_dir, "level1.csv"), dtype=str)
#         l1_df['json'] = l1_df['json'].astype(object)
#         print("\n--- Processing Level 1 (10 Bills) ---")
#         for idx, row in l1_df.iterrows():
#             b_id = str(row['bill_id']).strip()
#             img = os.path.join(bills_dir, f"{b_id}.png")
#             if not os.path.exists(img):
#                 img = os.path.join(bills_dir, f"{b_id}.jpg")
#             print(f"Extracting L1: {b_id}")
#             j_str = extract_l1(img)
#             l1_df.loc[idx, 'json'] = j_str
#             time.sleep(4.5)
#         l1_df.to_csv(out_l1, index=False, quoting=csv.QUOTE_MINIMAL)
#         print(f"\n[SUCCESS] Saved Level 1 to {out_l1}")

#     l1_cache = {str(row['bill_id']).strip(): str(row['json']) for _, row in l1_df.iterrows()}

#     l2_df = pd.read_csv(os.path.join(csv_dir, "level2.csv"), dtype=str)
#     l2_df['answer'] = l2_df['answer'].astype(object)
#     unique_bills = l2_df['bill_id'].unique()
#     print(f"\n--- Processing Level 2 in 10 Batches ({len(unique_bills)} bills) ---")

#     for b_id in unique_bills:
#         b_id_str = str(b_id).strip()
#         img = os.path.join(bills_dir, f"{b_id_str}.png")
#         if not os.path.exists(img):
#             img = os.path.join(bills_dir, f"{b_id_str}.jpg")

#         sub_df = l2_df[l2_df['bill_id'] == b_id]
#         questions_dict = {row['question_id']: row['question'] for _, row in sub_df.iterrows()}

#         print(f"Generating answers for bill {b_id_str} (all {len(questions_dict)} questions)...")
#         answers = answer_l2_batch(img, l1_cache.get(b_id_str, "{}"), questions_dict)

#         for idx, row in sub_df.iterrows():
#             qid = row['question_id']
#             ans_text = answers.get(qid, "Information not available on bill.")
#             l2_df.loc[idx, 'answer'] = str(ans_text).strip()

#         l2_df.to_csv(out_l2, index=False, quoting=csv.QUOTE_MINIMAL)
#         print(f"Saved answers for {b_id_str}. Waiting 4.5s...")
#         time.sleep(4.5)

#     print(f"\n[SUCCESS] Saved all Level 2 answers to {out_l2}")
#     print("=== PIPELINE COMPLETE ===")

# if __name__ == "__main__":
#     run_pipeline("data/test", "output")
import argparse
import os
import time
from pathlib import Path

import pandas as pd
from dotenv import load_dotenv
from google import genai

from level1_extractor import extract_bill
from level2_answerer import NOT_ON_BILL, answer_bill
from schema import BillExtraction

EXTS = (".png", ".jpg", ".jpeg")


def find_image(bills_dir: Path, bill_id: str):
    for ext in EXTS:
        p = bills_dir / f"{bill_id}{ext}"
        if p.exists():
            return p
    return None


def main():
    load_dotenv()
    ap = argparse.ArgumentParser(description="Generate level1.csv and level2.csv for a folder of bills.")
    ap.add_argument("--bills", default="data/test/bills")
    ap.add_argument("--csv", default="data/test/csv", help="folder with the level1.csv and level2.csv templates")
    ap.add_argument("--out", default="output")
    args = ap.parse_args()

    provider = os.getenv("MODEL_PROVIDER", "google")
    model = os.getenv("MODEL_NAME", "gemini-3.5-flash-lite")
    delay = float(os.getenv("REQUEST_DELAY_SECONDS", "0"))
    if provider != "google":
        raise SystemExit("This project only implements MODEL_PROVIDER=google")
    client = genai.Client(api_key=os.environ["API_KEY"])

    bills_dir, out_dir = Path(args.bills), Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)
    l1 = pd.read_csv(Path(args.csv) / "level1.csv", dtype=str, keep_default_na=False)
    l2 = pd.read_csv(Path(args.csv) / "level2.csv", dtype=str, keep_default_na=False)

    # Level 1
    ref = {}
    for i, bill_id in enumerate(l1["bill_id"]):
        img = find_image(bills_dir, bill_id)
        try:
            if img is None:
                raise FileNotFoundError(f"no image for {bill_id}")
            data = extract_bill(str(img), client, model)
        except Exception as exc:
            print(f"[L1] {bill_id} failed: {exc}")
            data = BillExtraction()
        ref[bill_id] = data.model_dump_json()
        l1.at[i, "json"] = ref[bill_id]
        print(f"[L1] {bill_id} done")
        time.sleep(delay)
    l1.to_csv(out_dir / "level1.csv", index=False)

    # Level 2
    for bill_id in dict.fromkeys(l2["bill_id"]):
        rows = l2.index[l2["bill_id"] == bill_id]
        questions = [(l2.at[r, "question_id"], l2.at[r, "question"]) for r in rows]
        img = find_image(bills_dir, bill_id)
        try:
            if img is None:
                raise FileNotFoundError(f"no image for {bill_id}")
            answers = answer_bill(str(img), questions, ref.get(bill_id, "{}"), client, model)
        except Exception as exc:
            print(f"[L2] {bill_id} failed: {exc}")
            answers = {qid: NOT_ON_BILL for qid, _ in questions}
        for r in rows:
            l2.at[r, "answer"] = answers[l2.at[r, "question_id"]]
        print(f"[L2] {bill_id} done")
        time.sleep(delay)
    l2.to_csv(out_dir / "level2.csv", index=False)
    print(f"Wrote {out_dir / 'level1.csv'} and {out_dir / 'level2.csv'}")


if __name__ == "__main__":
    main()