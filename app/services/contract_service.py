from datetime import timedelta, date

from sqlalchemy.orm import Session

from app.models.contract import Contract
from app.schemas.contract import ContractCreate, ContractUpdate


def create_contract(db: Session, contract_data: ContractCreate) -> Contract:
    new_contract = Contract(
        title=contract_data.title,
        provider_name=contract_data.provider_name,
        category=contract_data.category,
        monthly_cost=contract_data.monthly_cost,
        start_date=contract_data.start_date,
        end_date=contract_data.end_date,
        cancellation_notice_days=contract_data.cancellation_notice_days,
    )

    db.add(new_contract)
    db.commit()
    db.refresh(new_contract)

    return new_contract


def get_all_contracts(db: Session) -> list[Contract]:
    return db.query(Contract).all()


def get_contract_by_id(db: Session, contract_id: int) -> Contract | None:
    return db.query(Contract).filter(Contract.id == contract_id).first()


def update_contract(db: Session, contract_id: int, contract_data: ContractUpdate) -> Contract | None:
    contract = get_contract_by_id(db, contract_id)

    if not contract:
        return None

    contract.title = contract_data.title
    contract.provider_name = contract_data.provider_name
    contract.category = contract_data.category
    contract.monthly_cost = contract_data.monthly_cost
    contract.start_date = contract_data.start_date
    contract.end_date = contract_data.end_date
    contract.cancellation_notice_days = contract_data.cancellation_notice_days
    contract.status = contract_data.status

    db.commit()
    db.refresh(contract)

    return contract


def delete_contract(db: Session, contract_id: int) -> bool:
    contract = get_contract_by_id(db, contract_id)

    if not contract:
        return False

    db.delete(contract)
    db.commit()

    return True


def calculate_cancellation_deadline(contract: Contract) -> date | None:
    if not contract.end_date:
        return None

    return contract.end_date - timedelta(days=contract.cancellation_notice_days)


def get_expiring_contracts(db: Session, days: int = 30) -> list[Contract]:
    today = date.today()
    target_date = today + timedelta(days=days)

    contracts = get_all_contracts(db)
    expiring_contracts = []

    for contract in contracts:
        cancellation_deadline = calculate_cancellation_deadline(contract)

        if cancellation_deadline and today <= cancellation_deadline <= target_date:
            expiring_contracts.append(contract)

    return expiring_contracts
