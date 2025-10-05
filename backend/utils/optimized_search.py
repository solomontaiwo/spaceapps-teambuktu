"""
Utilità per ricerche binarie ottimizzate sui pianeti.
Sfrutta gli indici del database per implementare algoritmi di ricerca efficienti.
"""

from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from models import Planet
from typing import List, Optional, Tuple

class PlanetSearchOptimized:
    """Classe per ricerche ottimizzate sui pianeti utilizzando gli indici del database."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def binary_search_by_radius(self, min_radius: float, max_radius: float) -> List[Planet]:
        """
        Ricerca binaria ottimizzata per raggio planetario.
        Utilizza l'indice idx_planets_radius per performance migliori.
        """
        return (self.db.query(Planet)
                .filter(and_(Planet.radius >= min_radius, Planet.radius <= max_radius))
                .order_by(Planet.radius)
                .all())
    
    def binary_search_by_temperature(self, min_temp: float, max_temp: float) -> List[Planet]:
        """
        Ricerca binaria ottimizzata per temperatura di equilibrio.
        Utilizza l'indice idx_planets_eq_temp per performance migliori.
        """
        return (self.db.query(Planet)
                .filter(and_(Planet.eq_temp >= min_temp, Planet.eq_temp <= max_temp))
                .order_by(Planet.eq_temp)
                .all())
    
    def binary_search_by_period(self, min_period: float, max_period: float) -> List[Planet]:
        """
        Ricerca binaria ottimizzata per periodo orbitale.
        Utilizza l'indice idx_planets_period per performance migliori.
        """
        return (self.db.query(Planet)
                .filter(and_(Planet.period >= min_period, Planet.period <= max_period))
                .order_by(Planet.period)
                .all())
    
    def search_earth_like_planets(self, 
                                 radius_tolerance: float = 0.5,
                                 temp_tolerance: float = 50.0) -> List[Planet]:
        """
        Ricerca ottimizzata per pianeti simili alla Terra.
        Utilizza l'indice composito idx_planet_radius_temp.
        
        Args:
            radius_tolerance: Tolleranza per il raggio (in raggi terrestri)
            temp_tolerance: Tolleranza per la temperatura (in Kelvin)
        """
        earth_radius = 1.0  # Raggio terrestre di riferimento
        earth_temp = 288.0  # Temperatura terrestre di riferimento (K)
        
        return (self.db.query(Planet)
                .filter(and_(
                    Planet.radius >= earth_radius - radius_tolerance,
                    Planet.radius <= earth_radius + radius_tolerance,
                    Planet.eq_temp >= earth_temp - temp_tolerance,
                    Planet.eq_temp <= earth_temp + temp_tolerance
                ))
                .order_by(Planet.radius, Planet.eq_temp)
                .all())
    
    def search_by_star_properties(self, 
                                 min_star_radius: float,
                                 max_star_radius: float,
                                 min_star_temp: float,
                                 max_star_temp: float) -> List[Planet]:
        """
        Ricerca ottimizzata basata sulle proprietà stellari.
        Utilizza l'indice composito idx_star_properties.
        """
        return (self.db.query(Planet)
                .filter(and_(
                    Planet.star_radius >= min_star_radius,
                    Planet.star_radius <= max_star_radius,
                    Planet.star_temp >= min_star_temp,
                    Planet.star_temp <= max_star_temp
                ))
                .order_by(Planet.star_radius, Planet.star_temp)
                .all())
    
    def search_habitable_zone_planets(self,
                                    min_radius: float = 0.5,
                                    max_radius: float = 2.0,
                                    min_temp: float = 200.0,
                                    max_temp: float = 350.0,
                                    min_period: float = 0.1,
                                    max_period: float = 500.0) -> List[Planet]:
        """
        Ricerca ottimizzata per pianeti nella zona abitabile.
        Utilizza l'indice composito idx_planet_habitability.
        """
        return (self.db.query(Planet)
                .filter(and_(
                    Planet.radius >= min_radius,
                    Planet.radius <= max_radius,
                    Planet.eq_temp >= min_temp,
                    Planet.eq_temp <= max_temp,
                    Planet.period >= min_period,
                    Planet.period <= max_period
                ))
                .order_by(Planet.radius, Planet.eq_temp, Planet.period)
                .all())
    
    def fast_name_search(self, name_pattern: str, exact_match: bool = False) -> List[Planet]:
        """
        Ricerca ottimizzata per nome utilizzando l'indice idx_planets_name.
        
        Args:
            name_pattern: Pattern di ricerca
            exact_match: Se True, cerca corrispondenza esatta
        """
        if exact_match:
            return (self.db.query(Planet)
                   .filter(Planet.name == name_pattern)
                   .all())
        else:
            return (self.db.query(Planet)
                   .filter(Planet.name.ilike(f"%{name_pattern}%"))
                   .order_by(Planet.name)
                   .all())
    
    def get_sorted_planets_by_field(self, field: str, limit: int = 100, ascending: bool = True) -> List[Planet]:
        """
        Restituisce pianeti ordinati per un campo specifico.
        Sfrutta gli indici per ordinamento veloce.
        
        Args:
            field: Campo per ordinamento ('radius', 'period', 'eq_temp', 'star_temp', 'star_radius')
            limit: Numero massimo di risultati
            ascending: Ordinamento crescente se True, decrescente se False
        """
        field_map = {
            'radius': Planet.radius,
            'period': Planet.period,
            'eq_temp': Planet.eq_temp,
            'star_temp': Planet.star_temp,
            'star_radius': Planet.star_radius,
            'name': Planet.name
        }
        
        if field not in field_map:
            raise ValueError(f"Campo non valido: {field}. Campi disponibili: {list(field_map.keys())}")
        
        order_column = field_map[field]
        if not ascending:
            order_column = order_column.desc()
            
        return (self.db.query(Planet)
               .order_by(order_column)
               .limit(limit)
               .all())

def get_planet_search(db: Session) -> PlanetSearchOptimized:
    """Factory function per creare un'istanza di PlanetSearchOptimized."""
    return PlanetSearchOptimized(db)