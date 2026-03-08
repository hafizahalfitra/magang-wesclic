from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from database import Base

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)

    # sesuai clean_data.csv:
    Nama = Column(String(120), nullable=False)
    Pendidikan_Encoded = Column(Integer, nullable=False)  # 0..2
    Jabatan_Encoded = Column(Integer, nullable=False)     # 0..3
    Gaji = Column(Float, nullable=True)  # boleh null kalau belum punya gaji asli

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())