from datetime import timedelta, date

from sqlalchemy.orm import Session

from app.models.contract import Contract
from app.schemas.contract import ContractCreate, ContractUpdate


def create_contract(db: Session, user_id: int, contract_data: ContractCreate) -> Contract:
    """Create and persist a new contract for a specific user."""
    new_contract = Contract(
        user_id=user_id,
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
        status=contract_data.status,
        notes=contract_data.notes,
    )

    db.add(new_contract)
    db.commit()
    db.refresh(new_contract)

    return new_contract


def get_all_contracts(db: Session, user_id: int) -> list[Contract]:
    """Return all contracts for a specific user."""
    return (
        db.query(Contract)
        .filter(Contract.user_id == user_id)
        .order_by(Contract.created_at.desc())
        .all()
    )


def get_contract_by_id(db: Session, contract_id: int, user_id: int) -> Contract | None:
    """Return a single contract by its ID for a specific user."""
    return (
        db.query(Contract)
        .filter(
            Contract.id == contract_id,
            Contract.user_id == user_id,
        )
        .first()
    )


def update_contract(
    db: Session,
    contract_id: int,
    user_id: int,
    contract_data: ContractUpdate,
) -> Contract | None:
    """Update an existing contract for a specific user."""
    contract = get_contract_by_id(db, contract_id, user_id)

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


def delete_contract(db: Session, contract_id: int, user_id: int) -> bool:
    """Delete a contract for a specific user."""
    contract = get_contract_by_id(db, contract_id, user_id)

    if not contract:
        return False

    db.delete(contract)
    db.commit()

    return True


def calculate_cancellation_deadline(contract: Contract) -> date | None:
    """Calculate the cancellation deadline from the contract end date and notice period."""
    if not contract.end_date:
        return None

    return contract.end_date - timedelta(days=contract.cancellation_notice_days)


def calculate_days_until_deadline(contract: Contract) -> int | None:
    """Return the number of days remaining until the cancellation deadline."""
    cancellation_deadline = calculate_cancellation_deadline(contract)

    if not cancellation_deadline:
        return None

    return (cancellation_deadline - date.today()).days


def get_expiring_contracts(db: Session, user_id: int, days: int = 30) -> list[Contract]:
    """Return contracts for a user whose cancellation deadline is within the next given number of days."""
    today = date.today()
    target_date = today + timedelta(days=days)

    contracts = get_all_contracts(db, user_id)
    expiring_contracts = []

    for contract in contracts:
        cancellation_deadline = calculate_cancellation_deadline(contract)

        if cancellation_deadline and today <= cancellation_deadline <= target_date:
            expiring_contracts.append(contract)

    return expiring_contracts


def calculate_urgency_status(contract: Contract) -> str:
    """Determine the urgency level of a contract based on its cancellation deadline."""
    days = calculate_days_until_deadline(contract)

    if days is None:
        return "no_deadline"

    if days < 0:
        return "overdue"
    if days <= 3:
        return "critical"
    if days <= 14:
        return "warning"
    return "safe"


def get_normalized_monthly_cost(contract: Contract) -> float:
    """Return the contract cost normalized to a monthly value."""
    if contract.billing_cycle == "weekly":
        return (contract.monthly_cost * 52) / 12
    if contract.billing_cycle == "monthly":
        return contract.monthly_cost
    if contract.billing_cycle == "quarterly":
        return contract.monthly_cost / 3
    if contract.billing_cycle == "yearly":
        return contract.monthly_cost / 12
    return contract.monthly_cost


def get_dashboard_stats(db: Session, user_id: int) -> dict:
    """Calculate dashboard statistics for a specific user's contracts."""
    contracts = get_all_contracts(db, user_id)

    total_contracts = len(contracts)
    active_contracts = len([contract for contract in contracts if contract.status == "active"])
    critical_contracts = len(
        [contract for contract in contracts if calculate_urgency_status(contract) == "critical"]
    )

    monthly_total_cost = sum(
        get_normalized_monthly_cost(contract)
        for contract in contracts
        if contract.status == "active"
    )

    return {
        "total_contracts": total_contracts,
        "active_contracts": active_contracts,
        "critical_contracts": critical_contracts,
        "monthly_total_cost": round(monthly_total_cost, 2),
    }


def get_contracts_by_urgency(db: Session, user_id: int, urgency_status: str) -> list[Contract]:
    """Return all contracts for a user matching a specific urgency status."""
    contracts = get_all_contracts(db, user_id)

    return [
        contract
        for contract in contracts
        if calculate_urgency_status(contract) == urgency_status
    ]


def get_prioritized_contracts(db: Session, user_id: int) -> list[Contract]:
    """Return a user's contracts sorted by urgency and nearest deadline."""
    contracts = get_all_contracts(db, user_id)

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
