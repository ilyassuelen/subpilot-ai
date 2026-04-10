from datetime import timedelta, date

from sqlalchemy.orm import Session

from app.models.contract import Contract
from app.schemas.contract import ContractCreate, ContractUpdate


def create_contract(db: Session, contract_data: ContractCreate) -> Contract:
    new_contract = Contract(
        title=contract_data.title,
        provider_name=contract_data.provider_name,
        provider_email=contract_data.provider_email,
        category=contract_data.category,
        contract_type=contract_data.contract_type,
        monthly_cost=contract_data.monthly_cost,
        billing_cycle=contract_data.billing_cycle,
        currency=contract_data.currency,
        start_date=contract_data.start_date,
        end_date=contract_data.end_date,
        auto_renewal=contract_data.auto_renewal,
        cancellation_notice_days=contract_data.cancellation_notice_days,
        notes=contract_data.notes,
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
    contract.provider_email = contract_data.provider_email
    contract.category = contract_data.category
    contract.contract_type = contract_data.contract_type
    contract.monthly_cost = contract_data.monthly_cost
    contract.billing_cycle = contract_data.billing_cycle
    contract.currency = contract_data.currency
    contract.start_date = contract_data.start_date
    contract.end_date = contract_data.end_date
    contract.auto_renewal = contract_data.auto_renewal
    contract.cancellation_notice_days = contract_data.cancellation_notice_days
    contract.status = contract_data.status
    contract.notes = contract_data.notes

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


def calculate_days_until_deadline(contract: Contract) -> int | None:
    cancellation_deadline = calculate_cancellation_deadline(contract)

    if not cancellation_deadline:
        return None

    return (cancellation_deadline - date.today()).days


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


def calculate_urgency_status(contract: Contract) -> str:
    days = calculate_days_until_deadline(contract)

    if days is None:
        return "no_deadline"

    if days < 0:
        return "overdue"
    elif days <= 3:
        return "critical"
    elif days <= 14:
        return "warning"
    else:
        return "safe"


def get_dashboard_stats(db: Session) -> dict:
    contracts = get_all_contracts(db)

    total_contracts = len(contracts)
    active_contracts = len([contract for contract in contracts if contract.status == "active"])
    critical_contracts = len(
        [contract for contract in contracts if calculate_urgency_status(contract) == "critical"]
    )
    monthly_total_cost = sum(contract.monthly_cost for contract in contracts if contract.status == "active")

    return {
        "total_contracts": total_contracts,
        "active_contracts": active_contracts,
        "critical_contracts": critical_contracts,
        "monthly_total_cost": round(monthly_total_cost, 2),
    }


def get_contracts_by_urgency(db: Session, urgency_status: str) -> list[Contract]:
    contracts = get_all_contracts(db)

    return [
        contract
        for contract in contracts
        if calculate_urgency_status(contract) == urgency_status
    ]


def get_prioritized_contracts(db: Session) -> list[Contract]:
    contracts = get_all_contracts(db)

    priority_order = {
        "overdue": 0,
        "critical": 1,
        "warning": 2,
        "safe": 3,
        "no_deadline": 4,
    }

    return sorted(
        contracts,
        key=lambda contract: (
            priority_order[calculate_urgency_status(contract)],
            calculate_days_until_deadline(contract)
            if calculate_days_until_deadline(contract) is not None
            else 999999,
        ),
    )
