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
    calculate_cancellation_deadline,
    calculate_days_until_deadline,
    get_expiring_contracts,
    calculate_urgency_status,
    get_contracts_by_urgency,
    get_prioritized_contracts,
)

router = APIRouter(prefix="/contracts", tags=["Contracts"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def build_contract_response(contract):
    contract_dict = {
        "id": contract.id,
        "title": contract.title,
        "provider_name": contract.provider_name,
        "category": contract.category,
        "monthly_cost": contract.monthly_cost,
        "start_date": contract.start_date,
        "end_date": contract.end_date,
        "cancellation_notice_days": contract.cancellation_notice_days,
        "cancellation_deadline": calculate_cancellation_deadline(contract),
        "days_until_deadline": calculate_days_until_deadline(contract),
        "urgency_status": calculate_urgency_status(contract),
        "status": contract.status,
        "created_at": contract.created_at,
    }

    return ContractResponse.model_validate(contract_dict)


@router.post("/", response_model=ContractResponse)
def create_new_contract(contract: ContractCreate, db: Session = Depends(get_db)):
    new_contract = create_contract(db, contract)
    return build_contract_response(new_contract)


@router.get("/", response_model=list[ContractResponse])
def get_contracts(db: Session = Depends(get_db)):
    contracts = get_all_contracts(db)

    return [build_contract_response(contract) for contract in contracts]


@router.get("/expiring-soon", response_model=list[ContractResponse])
def get_expiring_soon_contracts(days: int = 30, db: Session = Depends(get_db)):
    contracts = get_expiring_contracts(db, days)

    return [build_contract_response(contract) for contract in contracts]


@router.get("/critical", response_model=list[ContractResponse])
def get_critical_contracts(db: Session = Depends(get_db)):
    contracts = get_contracts_by_urgency(db, "critical")
    return [build_contract_response(contract) for contract in contracts]


@router.get("/overdue", response_model=list[ContractResponse])
def get_overdue_contracts(db: Session = Depends(get_db)):
    contracts = get_contracts_by_urgency(db, "overdue")
    return [build_contract_response(contract) for contract in contracts]


@router.get("/prioritized", response_model=list[ContractResponse])
def get_prioritized_contracts_route(db: Session = Depends(get_db)):
    contracts = get_prioritized_contracts(db)
    return [build_contract_response(contract) for contract in contracts]


@router.get("/{contract_id}", response_model=ContractResponse)
def get_contract(contract_id: int, db: Session = Depends(get_db)):
    contract = get_contract_by_id(db, contract_id)

    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    return build_contract_response(contract)


@router.put("/{contract_id}", response_model=ContractResponse)
def update_existing_contract(
    contract_id: int,
    contract_data: ContractUpdate,
    db: Session = Depends(get_db),
):
    updated_contract = update_contract(db, contract_id, contract_data)

    if not updated_contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    return build_contract_response(updated_contract)


@router.delete("/{contract_id}")
def delete_existing_contract(contract_id: int, db: Session = Depends(get_db)):
    deleted = delete_contract(db, contract_id)

    if not deleted:
        raise HTTPException(status_code=404, detail="Contract not found")

    return {"message": "Contract deleted successfully"}
