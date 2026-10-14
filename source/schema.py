from typing import List, Literal, Optional
from pydantic import BaseModel, Field

class ChargeItem(BaseModel):
    type: Literal[
        "energy", "fixed", "fpa", "quarterly_adjustment",
        "surcharge", "meter_rent", "subsidy", "other"
    ]
    amount: float

class TaxItem(BaseModel):
    type: Literal[
        "gst", "electricity_duty", "income_tax",
        "municipal_tax", "other_tax"
    ]
    amount: float

class Level1Output(BaseModel):
    provider: Literal["KE", "LESCO", "IESCO"]
    tariff: Optional[str] = None
    sanctioned_load_kw: Optional[float] = None
    bill_month: Optional[str] = Field(None, description="Format YYYY-MM")
    reading_date: Optional[str] = Field(None, description="Format YYYY-MM-DD")
    issue_date: Optional[str] = Field(None, description="Format YYYY-MM-DD")
    due_date: Optional[str] = Field(None, description="Format YYYY-MM-DD")
    previous_reading: Optional[float] = None
    current_reading: Optional[float] = None
    units_consumed: Optional[float] = None
    charges: List[ChargeItem] = []
    total_charges: Optional[float] = None
    taxes: List[TaxItem] = []
    total_taxes: Optional[float] = None
    current_bill: Optional[float] = None
    arrears: Optional[float] = None
    payable_within_due_date: Optional[float] = None
    payable_after_due_date: Optional[float] = None