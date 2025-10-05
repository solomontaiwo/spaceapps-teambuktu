from sqlalchemy import Column, Integer, String, Float, Index
from db import Base

class Planet(Base):
    __tablename__ = "planets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)  # Indice per ricerche per nome
    period = Column(Float, index=True)  # Indice per ordinamento e ricerca binaria
    radius = Column(Float, index=True)  # Indice per ricerca binaria su raggio
    star_radius = Column(Float, index=True)  # Indice per ricerca binaria su raggio stellare
    star_temp = Column(Float, index=True)  # Indice per ricerca binaria su temperatura stellare
    eq_temp = Column(Float, index=True)  # Indice per ricerca binaria su temperatura di equilibrio

    # Indici compositi per query più complesse
    __table_args__ = (
        Index('idx_planet_radius_temp', 'radius', 'eq_temp'),  # Per ricerche di pianeti simili alla Terra
        Index('idx_star_properties', 'star_radius', 'star_temp'),  # Per ricerche basate su proprietà stellari
        Index('idx_planet_habitability', 'radius', 'eq_temp', 'period'),  # Per valutazione abitabilità
    )
