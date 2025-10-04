from sqlalchemy import Column, Integer, String, Float
from db import Base

class Planet(Base):
    __tablename__ = "planets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    period = Column(Float)
    radius = Column(Float)
    star_radius = Column(Float)
    star_temp = Column(Float)
    eq_temp = Column(Float)
