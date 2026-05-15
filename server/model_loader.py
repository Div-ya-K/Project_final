import os, pickle, math, random
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

DISHES = [
    'Masala Dosa', 'Poha', 'Medu Vada', 'Uttappa', 'Dhokla', 'Sabudana Vada',
    'Dal Khichdi', 'Matar Paneer', 'Bhindi Masala', 'Veg Biryani', 'Misal Pav', 'Pav Bhaji',
    'Samosa', 'Samosa Chaat', 'Vada Pav', 'Sandwich', 'Schezwan Rice', 'Hakka Noodles', 'Fried Rice',
]

# Encode dish names to integers (0-based index)
DISH_ENCODER = {d: i for i, d in enumerate(DISHES)}


def load_model(path=None):
    import os, pickle

    models = {}
    model_dir = "models"

    if not os.path.exists(model_dir):
        return {}, False

    for file in os.listdir(model_dir):
        if file.endswith(".pkl"):
            dish = file.replace(".pkl", "").replace("model_", "")
            with open(os.path.join(model_dir, file), "rb") as f:
                models[dish] = pickle.load(f)

    print(f"✅ Loaded {len(models)} models")
    return models, True if models else False


def predict_demand(model, model_loaded, slot_index, weekday):
    """
    Returns list of { dish, predicted_orders, confidence, trend }
    sorted by predicted_orders descending.
    """
    if model_loaded:
        return predict_with_real_model(model, slot_index, weekday)
    return mock_predictions(slot_index, weekday)


def predict_with_real_model(models, slot_index, weekday):
    results = []

    # Convert slot_index → actual datetime
    base_time = datetime.now().replace(hour=8, minute=0, second=0, microsecond=0)
    prediction_time = base_time + timedelta(minutes=30 * slot_index)

    for dish, model in models.items():
        try:
            # Prophet expects 'ds'
            future = pd.DataFrame({
                "ds": [prediction_time]
            })

            forecast = model.predict(future)

            predicted_orders = int(max(0, forecast["yhat"].iloc[0]))

        except Exception as e:
            print(f"Error for {dish}: {e}")
            predicted_orders = 0

        results.append({
            "dish": dish,
            "predicted_orders": predicted_orders,
            "confidence": 90,
            "trend": "up" if predicted_orders > 10 else "stable"
        })

    return sorted(results, key=lambda x: x['predicted_orders'], reverse=True)

def mock_predictions(slot_index, weekday):
    """
    Realistic demo data shaped like a typical campus lunch rush.
    Used when model.pkl isn't present yet.
    """
    # Demand peaks at slots 8-11 (12:00–13:30), lower on weekends
    peak = math.exp(-0.04 * (slot_index - 9) ** 2)
    weekend_factor = 0.6 if weekday >= 5 else 1.0

    base_demand = {
        'Masala Dosa': 28, 'Misal Pav': 26, 'Vada Pav': 24, 'Pav Bhaji': 22,
        'Veg Biryani': 20, 'Samosa': 19, 'Samosa Chaat': 17, 'Dal Khichdi': 16,
        'Schezwan Rice': 15, 'Hakka Noodles': 14, 'Matar Paneer': 13, 'Poha': 12,
        'Medu Vada': 11, 'Fried Rice': 10, 'Sandwich': 9, 'Uttappa': 8,
        'Bhindi Masala': 7, 'Dhokla': 6, 'Sabudana Vada': 5,
    }

    results = []
    for dish in DISHES:
        base = base_demand.get(dish, 10)
        noise = random.uniform(0.85, 1.15)
        orders = max(1, int(round(base * peak * weekend_factor * noise)))
        confidence = int(min(95, 65 + peak * 25 + random.uniform(-5, 5)))
        results.append({
            "dish": dish,
            "predicted_orders": orders,
            "confidence": confidence,
            "trend": "up" if peak > 0.6 else "stable",
        })

    return sorted(results, key=lambda x: x['predicted_orders'], reverse=True)
