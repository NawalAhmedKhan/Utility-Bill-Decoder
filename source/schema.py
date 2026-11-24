# from typing import List, Literal, Optional
# from pydantic import BaseModel, Field

# class ChargeItem(BaseModel):
#     type: Literal[
#         "energy", "fixed", "fpa", "quarterly_adjustment",
#         "surcharge", "meter_rent", "subsidy", "other"
#     ]
#     amount: float

# class TaxItem(BaseModel):
#     type: Literal[
#         "gst", "electricity_duty", "income_tax",
#         "municipal_tax", "other_tax"
#     ]
#     amount: float

# class Level1Output(BaseModel):
#     provider: Literal["KE", "LESCO", "IESCO"]
#     tariff: Optional[str] = None
#     sanctioned_load_kw: Optional[float] = None
#     bill_month: Optional[str] = Field(None, description="Format YYYY-MM")
#     reading_date: Optional[str] = Field(None, description="Format YYYY-MM-DD")
#     issue_date: Optional[str] = Field(None, description="Format YYYY-MM-DD")
#     due_date: Optional[str] = Field(None, description="Format YYYY-MM-DD")
#     previous_reading: Optional[float] = None
#     current_reading: Optional[float] = None
#     units_consumed: Optional[float] = None
#     charges: List[ChargeItem] = []
#     total_charges: Optional[float] = None
#     taxes: List[TaxItem] = []
#     total_taxes: Optional[float] = None
#     current_bill: Optional[float] = None
#     arrears: Optional[float] = None
#     payable_within_due_date: Optional[float] = None
#     payable_after_due_date: Optional[float] = None
import re
from typing import List, Literal, Optional

from pydantic import BaseModel, Field, field_validator

ChargeType = Literal["energy", "fixed", "fpa", "quarterly_adjustment", "surcharge", "meter_rent", "subsidy", "other"]
TaxType = Literal["gst", "electricity_duty", "income_tax", "municipal_tax", "other_tax"]

DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
MONTH_RE = re.compile(r"^\d{4}-\d{2}$")


class ChargeItem(BaseModel):
    type: ChargeType
    amount: float = Field(description="PKR amount as printed. Credits and subsidies are negative.")


class TaxItem(BaseModel):
    type: TaxType
    amount: float


class BillExtraction(BaseModel):
    provider: Optional[Literal["KE", "LESCO", "IESCO"]] = None
    tariff: Optional[str] = Field(None, description="Tariff code exactly as printed, e.g. A1-R")
    sanctioned_load_kw: Optional[float] = None
    bill_month: Optional[str] = Field(None, description="YYYY-MM")
    reading_date: Optional[str] = Field(None, description="YYYY-MM-DD")
    issue_date: Optional[str] = Field(None, description="YYYY-MM-DD")
    due_date: Optional[str] = Field(None, description="YYYY-MM-DD")
    previous_reading: Optional[float] = None
    current_reading: Optional[float] = None
    units_consumed: Optional[float] = None
    charges: List[ChargeItem] = Field(default_factory=list)
    total_charges: Optional[float] = None
    taxes: List[TaxItem] = Field(default_factory=list)
    total_taxes: Optional[float] = None
    current_bill: Optional[float] = None
    arrears: Optional[float] = None
    payable_within_due_date: Optional[float] = None
    payable_after_due_date: Optional[float] = None

    @field_validator("reading_date", "issue_date", "due_date")
    @classmethod
    def _date(cls, v):
        return v if v and DATE_RE.match(v) else None

    @field_validator("bill_month")
    @classmethod
    def _month(cls, v):
        return v if v and MONTH_RE.match(v) else None


class SingleAnswer(BaseModel):
    question_id: str
    reasoning_step: Optional[str] = Field(None, description="Short calculation or evidence from the bill")
    answer: str = Field(description="Final plain-English answer")


class BillQuestionBatch(BaseModel):
    answers: List[SingleAnswer]