from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any
import random

from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
import joblib

model = joblib.load("models/best_model.pkl")

print(model)