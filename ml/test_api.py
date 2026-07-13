import requests
import json

url = 'http://localhost:5001/predict'

test_cases = [
    {
        'features': {
            'cgpa': 8.5, 'skills_count': 8, 'projects_count': 3,
            'internships_count': 2, 'resume_score': 75, 'coding_score': 80,
            'communication_score': 70, 'attendance': 85, 'certifications_count': 3
        }
    },
    {
        'features': {
            'cgpa': 6.2, 'skills_count': 3, 'projects_count': 1,
            'internships_count': 0, 'resume_score': 40, 'coding_score': 35,
            'communication_score': 50, 'attendance': 60, 'certifications_count': 0
        }
    },
    {
        'features': [7.8, 6, 2, 1, 65, 70, 75, 80, 2]
    },
]

for i, test in enumerate(test_cases):
    print(f"\nTest {i + 1}:")
    print(f"Input: {json.dumps(test, indent=2)}")
    try:
        response = requests.post(url, json=test)
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Error: {e}")

print("\nTesting health endpoint...")
try:
    health = requests.get('http://localhost:5001/health')
    print(f"Health: {json.dumps(health.json(), indent=2)}")
except Exception as e:
    print(f"Error: {e}")
