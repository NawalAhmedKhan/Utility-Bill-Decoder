
import io
import os

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from google import genai

from level1_extractor import extract_bill
from level2_answerer import answer_bill

load_dotenv()
MODEL = os.getenv("MODEL_NAME", "gemini-3.5-flash-lite")
client = genai.Client(api_key=os.environ["API_KEY"])

app = FastAPI(title="Bill Decoder API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/extract")
def extract(file: UploadFile = File(...)):
    """Level 1 for one uploaded bill image. Returns the extracted JSON."""
    try:
        return extract_bill(io.BytesIO(file.file.read()), client, MODEL).model_dump()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/ask")
def ask(file: UploadFile = File(...), question: str = Form(...), ref: str = Form("{}")):
    """Answer one custom question about a bill image."""
    try:
        answers = answer_bill(io.BytesIO(file.file.read()), [("C1", question)], ref, client, MODEL)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    return {"answer": answers["C1"]}