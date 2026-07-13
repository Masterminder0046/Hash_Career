"""
Placement Prediction Model Training
Uses Random Forest Classifier to predict student placement probability
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix
import joblib
import os

np.random.seed(42)

df = None

try:
    import pymongo
    print("Connecting to MongoDB to load historical placement data...")
    client = pymongo.MongoClient("mongodb://localhost:27017/", serverSelectionTimeoutMS=2000)
    db = client["placement-platform"]
    collection = db["historicaldatas"]
    
    count = collection.count_documents({})
    if count >= 10:
        print(f"Found {count} historical placement records in MongoDB. Training on real data...")
        cursor = collection.find({})
        records = list(cursor)
        
        data = []
        for r in records:
            data.append({
                'cgpa': r['cgpa'],
                'skills_count': r['skillsCount'],
                'projects_count': r['projectsCount'],
                'internships_count': r['internshipsCount'],
                'resume_score': r['resumeScore'],
                'coding_score': r['codingScore'],
                'communication_score': r['communicationScore'],
                'attendance': r['attendance'],
                'certifications_count': r['certificationsCount'],
                'placed': 1 if r['placed'] else 0
            })
        df = pd.DataFrame(data)
    else:
        raise ValueError("Not enough records in MongoDB")
except Exception as e:
    print(f"MongoDB connection failed or insufficient data ({e}). Generating synthetic placement dataset...")
    n_samples = 10000
    synthetic_data = {
        'cgpa': np.round(np.random.uniform(5.0, 10.0, n_samples), 2),
        'skills_count': np.random.randint(0, 15, n_samples),
        'projects_count': np.random.randint(0, 8, n_samples),
        'internships_count': np.random.randint(0, 5, n_samples),
        'resume_score': np.random.randint(0, 101, n_samples),
        'coding_score': np.random.randint(0, 101, n_samples),
        'communication_score': np.random.randint(0, 101, n_samples),
        'attendance': np.random.randint(50, 101, n_samples),
        'certifications_count': np.random.randint(0, 8, n_samples),
    }
    df = pd.DataFrame(synthetic_data)
    
    def calculate_placement_probability(row):
        score = 0
        score += (row['cgpa'] / 10.0) * 25
        score += min(row['skills_count'] * 2.5, 20)
        score += min(row['projects_count'] * 3, 15)
        score += min(row['internships_count'] * 3, 10)
        score += (row['resume_score'] / 100.0) * 10
        score += (row['coding_score'] / 100.0) * 8
        score += (row['communication_score'] / 100.0) * 7
        score += (row['attendance'] / 100.0) * 3
        score += min(row['certifications_count'] * 1.5, 5)
        return score
        
    df['placement_score'] = df.apply(calculate_placement_probability, axis=1)
    df['placed'] = (df['placement_score'] >= 50 + np.random.normal(0, 5, n_samples)).astype(int)

print(f"Dataset shape: {df.shape}")
print(f"Placement rate: {df['placed'].mean() * 100:.2f}%")
print(f"\nFeature statistics:")
print(df.describe())

features = ['cgpa', 'skills_count', 'projects_count', 'internships_count',
            'resume_score', 'coding_score', 'communication_score',
            'attendance', 'certifications_count']

X = df[features]
y = df['placed']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

print("\nTraining Random Forest Classifier...")
rf_model = RandomForestClassifier(
    n_estimators=200,
    max_depth=15,
    min_samples_split=10,
    min_samples_leaf=5,
    random_state=42,
    n_jobs=-1
)

rf_model.fit(X_train_scaled, y_train)

y_pred = rf_model.predict(X_test_scaled)
y_pred_proba = rf_model.predict_proba(X_test_scaled)[:, 1]

accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred)
recall = recall_score(y_test, y_pred)
f1 = f1_score(y_test, y_pred)
roc_auc = roc_auc_score(y_test, y_pred_proba)

print("\n" + "=" * 50)
print("MODEL PERFORMANCE METRICS")
print("=" * 50)
print(f"Accuracy:  {accuracy:.4f}")
print(f"Precision: {precision:.4f}")
print(f"Recall:    {recall:.4f}")
print(f"F1-Score:  {f1:.4f}")
print(f"ROC-AUC:   {roc_auc:.4f}")

cv_scores = cross_val_score(rf_model, X_train_scaled, y_train, cv=5)
print(f"\nCross-validation scores: {cv_scores}")
print(f"Mean CV score: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")

conf_matrix = confusion_matrix(y_test, y_pred)
print(f"\nConfusion Matrix:")
print(f"TN: {conf_matrix[0][0]}  FP: {conf_matrix[0][1]}")
print(f"FN: {conf_matrix[1][0]}  TP: {conf_matrix[1][1]}")

feature_importance = pd.DataFrame({
    'feature': features,
    'importance': rf_model.feature_importances_
}).sort_values('importance', ascending=False)

print("\n" + "=" * 50)
print("FEATURE IMPORTANCE")
print("=" * 50)
print(feature_importance.to_string(index=False))

os.makedirs('models', exist_ok=True)

joblib.dump(rf_model, 'models/placement_model.pkl')
joblib.dump(scaler, 'models/scaler.pkl')

print("\n" + "=" * 50)
print("MODEL SAVED SUCCESSFULLY")
print("=" * 50)
print("Model:  models/placement_model.pkl")
print("Scaler: models/scaler.pkl")
print("\nTraining complete!")
