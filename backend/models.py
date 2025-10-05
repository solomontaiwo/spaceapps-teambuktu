from sqlalchemy import Column, Integer, String, Float, Index
from db import Base

class Planet(Base):
    __tablename__ = "planets"

    id = Column(Integer, primary_key=True, index=True)
    # Coordinate celesti
    ra = Column(Float, index=True)  # Right Ascension (RA)
    dec = Column(Float, index=True)  # Declination (Dec)
    
    # Proprietà planetarie (dal CSV KOI_cleaned.csv)
    koi_disposition = Column(String, index=True)  # CONFIRMED, CANDIDATE, FALSE POSITIVE
    koi_period = Column(Float, index=True)  # Periodo orbitale (giorni)
    koi_prad = Column(Float, index=True)  # Raggio planetario (Earth radii)
    koi_teq = Column(Float, index=True)  # Temperatura di equilibrio (K)
    koi_duration = Column(Float)  # Durata del transito (ore)
    koi_depth = Column(Float)  # Profondità del transito (ppm)
    koi_insol = Column(Float)  # Insolazione (flusso stellare ricevuto, Earth flux)
    
    # Proprietà stellari
    koi_steff = Column(Float, index=True)  # Temperatura stellare effettiva (K)
    koi_srad = Column(Float, index=True)  # Raggio stellare (solar radii)
    koi_slogg = Column(Float)  # Gravità superficiale stellare (log10(cm/s^2))
    koi_kepmag = Column(Float)  # Magnitudine Kepler
    
    source = Column(String)  # Sorgente (es. Kepler)
    
    # Campi di compatibilità per il frontend
    @property
    def name(self):
        """Genera un nome basato su ID e coordinate"""
        return f"KOI-{self.id:05d}"
    
    @property 
    def radius(self):
        """Alias per koi_prad (compatibilità frontend)"""
        return self.koi_prad
        
    @property
    def period(self):
        """Alias per koi_period (compatibilità frontend)"""
        return self.koi_period
        
    @property
    def eq_temp(self):
        """Alias per koi_teq (compatibilità frontend)"""
        return self.koi_teq
        
    @property
    def star_temp(self):
        """Alias per koi_steff (compatibilità frontend)"""
        return self.koi_steff
        
    @property
    def star_radius(self):
        """Alias per koi_srad (compatibilità frontend)"""
        return self.koi_srad

    # Indici per performance ottimali
    __table_args__ = (
        Index('idx_planet_radius_temp', 'koi_prad', 'koi_teq'),  # Per ricerche planetarie
        Index('idx_star_properties', 'koi_srad', 'koi_steff'),  # Per proprietà stellari
        Index('idx_celestial_coords', 'ra', 'dec'),  # Per coordinate celesti
        Index('idx_disposition', 'koi_disposition'),  # Per stato conferma
    )
