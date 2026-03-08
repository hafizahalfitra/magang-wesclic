from sqlalchemy.orm import Session
from models import Employee
from schemas import EmployeeCreate, EmployeeUpdate

def create_employee(db: Session, payload: EmployeeCreate) -> Employee:
    emp = Employee(**payload.model_dump())
    db.add(emp)
    db.commit()
    db.refresh(emp)
    return emp

def get_employee(db: Session, employee_id: int) -> Employee | None:
    return db.query(Employee).filter(Employee.id == employee_id).first()

def list_employees(db: Session, skip: int = 0, limit: int = 50) -> list[Employee]:
    return db.query(Employee).offset(skip).limit(limit).all()

def update_employee(db: Session, employee_id: int, payload: EmployeeUpdate) -> Employee | None:
    emp = get_employee(db, employee_id)
    if not emp:
        return None
    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(emp, k, v)
    db.commit()
    db.refresh(emp)
    return emp

def delete_employee(db: Session, employee_id: int) -> bool:
    emp = get_employee(db, employee_id)
    if not emp:
        return False
    db.delete(emp)
    db.commit()
    return True