
from sqlalchemy import (
    Column, Integer, String, ForeignKey, UniqueConstraint
)
from sqlalchemy.orm import relationship
from .database import Base


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(String(500), nullable=False, default="")
    department = Column(String(100), nullable=False)
    duration = Column(String(50), nullable=False)

    enrollments = relationship(
        "Enrollment",
        back_populates="course",
        cascade="all, delete-orphan",
    )


class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(
        Integer, ForeignKey("courses.id"), nullable=False
    )
    student_id = Column(Integer, nullable=False)

    __table_args__ = (
        UniqueConstraint(
            "course_id", "student_id",
            name="uq_course_student"
        ),
    )

    course = relationship("Course", back_populates="enrollments")
