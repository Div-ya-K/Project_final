from flask import Flask, jsonify
from flask_cors import CORS
from datetime import datetime
from model_loader import load_model, predict_demand

app = Flask(__name__)
CORS(app)

model, model_loaded = load_model("model.pkl")
print("✅ Model loaded" if model_loaded else "⚠️  Demo mode — drop model.pkl here to go live")


def current_slot():
    now = datetime.now()
    idx = max(0, min(25, (now.hour - 8) * 2 + (1 if now.minute >= 30 else 0)))
    label = f"{now.hour:02d}:{'30' if now.minute >= 30 else '00'}"
    return idx, label, now.weekday()


@app.route("/api/health")
def health():
    return jsonify({ "status": "ok", "model_loaded": model_loaded,
                     "mode": "live" if model_loaded else "demo" })


@app.route("/api/predict/current")
def predict_current():
    idx, label, weekday = current_slot()
    return jsonify({ "slot": label, "slot_index": idx, "weekday": weekday,
                     "mode": "live" if model_loaded else "demo",
                     "predictions": predict_demand(model, model_loaded, idx, weekday) })


@app.route("/api/predict/next")
def predict_next():
    idx, _, weekday = current_slot()
    nxt = min(idx + 1, 25)
    h = 8 + nxt // 2
    label = f"{h:02d}:{'30' if nxt % 2 else '00'}"
    return jsonify({ "slot": label, "slot_index": nxt, "weekday": weekday,
                     "mode": "live" if model_loaded else "demo",
                     "predictions": predict_demand(model, model_loaded, nxt, weekday) })


@app.route("/api/predict/day")
def predict_day():
    _, _, weekday = current_slot()
    slots = []
    for i in range(26):
        h = 8 + i // 2
        label = f"{h:02d}:{'30' if i % 2 else '00'}"
        slots.append({ "slot": label, "slot_index": i,
                        "predictions": predict_demand(model, model_loaded, i, weekday) })
    return jsonify({ "weekday": weekday, "mode": "live" if model_loaded else "demo", "slots": slots })


if __name__ == "__main__":
    print("\n🍽️  QLess Prediction API running at http://localhost:5001\n")
    app.run(port=5001, debug=True)
