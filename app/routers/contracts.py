from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.schemas.contract import ContractCreate, ContractResponse, ContractUpdate
from app.services.contract_service import (
    create_contract,
    get_all_contracts,
    get_contract_by_id,
    update_contract,
    delete_contract,
)

router = APIRouter(prefix="/contracts", tags=["Contracts"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=ContractResponse)
def create_new_contract(contract: ContractCreate, db: Session = Depends(get_db)):
    return create_contract(db, contract)


@router.get("/", response_model=list[ContractResponse])
def get_contracts(db: Session = Depends(get_db)):
    return get_all_contracts(db)


@router.get("/{contract_id}", response_model=ContractResponse)
def get_contract(contract_id: int, db: Session = Depends(get_db)):
    contract = get_contract_by_id(db, contract_id)

    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    return contract


@router.put("/{contract_id}", response_model=ContractResponse)
def update_existing_contract(
    contract_id: int,
    contract_data: ContractUpdate,
    db: Session = Depends(get_db),
):
    updated_contract = update_contract(db, contract_id, contract_data)

    if not updated_contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    return updated_contract


@router.delete("/{contract_id}")
def delete_existing_contract(contract_id: int, db: Session = Depends(get_db)):
    deleted = delete_contract(db, contract_id)

    if not deleted:
        raise HTTPException(status_code=404, detail="Contract not found")

    return {"message": "Contract deleted successfully"}
