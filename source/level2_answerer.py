from PIL import Image

from llm import generate_structured
from schema import BillQuestionBatch

NOT_ON_BILL = "The bill does not show enough information to answer this question."

PROMPT = """Answer the customer questions below using only this electricity bill image.

Rules:
- Get the numbers right: work out every calculation step by step and put it in reasoning_step. Averages, differences, counts and percentages are checked against the bill.
- Use only what the bill shows. No outside tariff or rate information. If a needed value is not on the bill, say so instead of guessing.
- If you estimate, say it is an estimate and explain how you calculated it.
- If a question can mean more than one thing, state the meaning you used or answer both.
- Never include names, addresses, CNIC, account, consumer, reference or meter numbers.
- Write every answer in plain English, even if parts of the bill are in Urdu. Be specific and cite the bill's own figures.
- Return one answer per question_id, using exactly the ids given.

Reference values already extracted from this bill (verify against the image, the image wins on conflict):
{ref}

Questions:
{questions}
"""


def _ask(client, model, img, ref_json, questions):
    qtext = "\n".join(f"[{qid}] {q}" for qid, q in questions)
    batch = generate_structured(client, model, [img, PROMPT.format(ref=ref_json, questions=qtext)], BillQuestionBatch)
    return {a.question_id: a.answer for a in batch.answers if a.answer.strip()}


def answer_bill(image_path, questions, ref_json, client, model):
    with Image.open(image_path) as img:
        img.load()
        answers = _ask(client, model, img, ref_json, questions)
        missing = [(qid, q) for qid, q in questions if qid not in answers]
        for item in missing:
            try:
                answers.update(_ask(client, model, img, ref_json, [item]))
            except Exception:
                pass
    return {qid: answers.get(qid, NOT_ON_BILL) for qid, _ in questions}