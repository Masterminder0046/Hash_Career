"""
ML Model Serving API
Flask API serving the placement prediction model
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd
import os

app = Flask(__name__)
CORS(app)

model_path = 'models/placement_model.pkl'
scaler_path = 'models/scaler.pkl'

model = None
scaler = None

def load_model():
    global model, scaler
    try:
        if os.path.exists(model_path) and os.path.exists(scaler_path):
            model = joblib.load(model_path)
            scaler = joblib.load(scaler_path)
            return True
        return False
    except Exception as e:
        print(f"Error loading model: {e}")
        return False

features = ['cgpa', 'skills_count', 'projects_count', 'internships_count',
            'resume_score', 'coding_score', 'communication_score',
            'attendance', 'certifications_count']

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'message': 'ML prediction service is running'
    })

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()

        if 'features' not in data:
            return jsonify({'error': 'Missing features in request body'}), 400

        input_features = data['features']

        if isinstance(input_features, dict):
            feature_vector = [input_features.get(f, 0) for f in features]
        else:
            feature_vector = list(input_features)

        if len(feature_vector) != len(features):
            return jsonify({
                'error': f'Expected {len(features)} features, got {len(feature_vector)}',
                'expected_features': features
            }), 400

        X = np.array(feature_vector).reshape(1, -1)

        if model is not None and scaler is not None:
            X_scaled = scaler.transform(X)
            probability = float(model.predict_proba(X_scaled)[0, 1]) * 100
            prediction = int(model.predict(X_scaled)[0])

            feature_importance = {
                features[i]: float(model.feature_importances_[i])
                for i in range(len(features))
            }
        else:
            cgpa = feature_vector[0]
            skills = feature_vector[1]
            projects = feature_vector[2]
            internships = feature_vector[3]
            resume = feature_vector[4]
            coding = feature_vector[5]
            communication = feature_vector[6]
            attendance = feature_vector[7]
            certs = feature_vector[8]

            raw_score = (
                (cgpa / 10.0) * 25 +
                min(skills * 2.5, 20) +
                min(projects * 3, 15) +
                min(internships * 3, 10) +
                (resume / 100.0) * 10 +
                (coding / 100.0) * 8 +
                (communication / 100.0) * 7 +
                (attendance / 100.0) * 3 +
                min(certs * 1.5, 5)
            )

            probability = min(raw_score, 100)
            prediction = 1 if probability >= 50 else 0

            feature_importance = {
                'cgpa': 0.25, 'skills_count': 0.15, 'projects_count': 0.10,
                'internships_count': 0.10, 'resume_score': 0.10,
                'coding_score': 0.10, 'communication_score': 0.08,
                'attendance': 0.07, 'certifications_count': 0.05
            }

        confidence = 'high' if probability >= 75 else ('medium' if probability >= 50 else 'low')

        response = {
            'probability': round(probability, 2),
            'prediction': bool(prediction),
            'confidence': confidence,
            'feature_importance': [{'feature': k, 'importance': round(v, 4)} for k, v in
                                   sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)],
            'input_features': {features[i]: float(feature_vector[i]) for i in range(len(features))}
        }

        return jsonify(response)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/predict/batch', methods=['POST'])
def predict_batch():
    try:
        data = request.get_json()
        if 'features' not in data or not isinstance(data['features'], list):
            return jsonify({'error': 'Missing features array in request body'}), 400

        results = []
        for feature_set in data['features']:
            if isinstance(feature_set, dict):
                vec = [feature_set.get(f, 0) for f in features]
            else:
                vec = list(feature_set)

            X = np.array(vec).reshape(1, -1)

            if model is not None and scaler is not None:
                X_scaled = scaler.transform(X)
                prob = float(model.predict_proba(X_scaled)[0, 1]) * 100
            else:
                prob = min(
                    (vec[0] / 10.0) * 25 + min(vec[1] * 2.5, 20) + min(vec[2] * 3, 15) +
                    min(vec[3] * 3, 10) + (vec[4] / 100.0) * 10 + (vec[5] / 100.0) * 8 +
                    (vec[6] / 100.0) * 7 + (vec[7] / 100.0) * 3 + min(vec[8] * 1.5, 5),
                    100
                )

            results.append({
                'probability': round(prob, 2),
                'prediction': prob >= 50,
                'confidence': 'high' if prob >= 75 else ('medium' if prob >= 50 else 'low')
            })

        return jsonify({'predictions': results, 'count': len(results)})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/features', methods=['GET'])
def get_features():
    return jsonify({
        'features': features,
        'descriptions': [
            'Cumulative Grade Point Average (0-10)',
            'Number of technical skills',
            'Number of projects completed',
            'Number of internships completed',
            'Resume score (0-100)',
            'Coding assessment score (0-100)',
            'Communication score (0-100)',
            'Attendance percentage (0-100)',
            'Number of certifications'
        ]
    })

@app.route('/train', methods=['POST'])
def train_model_endpoint():
    try:
        global model, scaler
        data = request.get_json()
        if not data or 'records' not in data:
            return jsonify({'error': 'Missing records in request body'}), 400
        
        records = data['records']
        if len(records) < 10:
            return jsonify({'error': 'At least 10 records are required to train the model'}), 400
        
        df_new = pd.DataFrame(records)
        
        required_cols = ['cgpa', 'skills_count', 'projects_count', 'internships_count',
                         'resume_score', 'coding_score', 'communication_score',
                         'attendance', 'certifications_count', 'placed']
        
        for col in required_cols:
            if col not in df_new.columns:
                return jsonify({'error': f'Missing column: {col}'}), 400
        
        from sklearn.preprocessing import StandardScaler
        from sklearn.ensemble import RandomForestClassifier
        
        X = df_new[features]
        y = df_new['placed'].astype(int)
        
        new_scaler = StandardScaler()
        X_scaled = new_scaler.fit_transform(X)
        
        new_model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            n_jobs=-1
        )
        new_model.fit(X_scaled, y)
        
        os.makedirs('models', exist_ok=True)
        joblib.dump(new_model, model_path)
        joblib.dump(new_scaler, scaler_path)
        
        model = new_model
        scaler = new_scaler
        
        y_pred = model.predict(X_scaled)
        from sklearn.metrics import accuracy_score
        acc = accuracy_score(y, y_pred)
        
        return jsonify({
            'success': True,
            'message': 'Model trained successfully on new data!',
            'accuracy': float(acc),
            'records_trained': len(records)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    loaded = load_model()
    if loaded:
        print("Model loaded successfully")
    else:
        print("Model not found. Running in fallback mode.")
        print("Train the model first: python train_model.py")

    port = int(os.environ.get('PORT', 5001))
    print(f"Starting ML API server on port {port}")
    app.run(host='0.0.0.0', port=port, debug=True)
