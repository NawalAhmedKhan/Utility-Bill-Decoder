# Utility Bill Decoder - WTQ Build Track

## Runtime
- Python 3.11 or later

## Setup & Dependencies
Install the required packages using pip:
\\\ash
pip install google-genai pandas pydantic pillow python-dotenv
\\\

## How to Run
1. Ensure your environment variables are configured in \.env\ as shown in \.env.example\.
2. Place test bills in \data/test/bills/\ and templates in \data/test/csv/\.
3. Run the end-to-end pipeline:
\\\ash
python source/main.py
\\\

The script reads the bill images, extracts Level 1 billing details, and answers all 12 customer questions per bill.
Completed files will be saved directly to:
- \output/level1.csv\
- \output/level2.csv\

## AI Usage
- **Allowed Models & APIs**: Google Gemini 3.5 Flash-Lite (\gemini-3.5-flash-lite\) via Google GenAI SDK.
- **AI Coding Assistants**: AI Chatbot used for architecture design, schema validation debugging, and batching logic.
- **Prohibited Extraction Services**: None used (no Azure prebuilt-invoice, AWS Textract, Mindee, or third-party OCR invoice extractors).
