from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.contract import Contract
from app.schemas.contract import ContractCreate, ContractResponse

router = APIRouter(prefix="/contracts", tags=["Contracts"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=ContractResponse)
def create_contract(contract: ContractCreate, db: Session = Depends(get_db)):
    new_contract = Contract(
        title = contract.title,
        provider_name = contract.provider_name,
        category = contract.category,
        monthly_cost = contract.monthly_cost,
        start_date = contract.start_date,
        end_date = contract.end_date,
        cancellation_notice_days = contract.cancellation_notice_days,
    )

    db.add(new_contract)
    db.commit()
    db.refresh(new_contract)

    return new_contract


@router.get("/", response_model=list[ContractResponse])
def get_contracts(db: Session = Depends(get_db)):
    contracts = db.query(Contract).all()
    return contracts


@router.get("/{contract_id}", response_model=ContractResponse)
def get_contract(contract_id: int, db: Session = Depends(get_db)):
    contract = db.query(Contract).filter(Contract.id == contract_id).first()

    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    return contract