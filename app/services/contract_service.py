from sqlalchemy.orm import Session

from app.models.contract import Contract
from app.schemas.contract import ContractCreate


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
