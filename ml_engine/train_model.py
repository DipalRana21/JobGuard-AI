import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report

DATA_PATH = "dataset/fake_job_postings.csv"
MODEL_PATH = "models/jobguard_pipeline.pkl"

def train():
    print("--- STEP 1: Loading Data ---")

    try:
        df = pd.read_csv(DATA_PATH)
        print(f"Data Loaded Successfully! Total Records: {len(df)}")
    except FileNotFoundError:
        print("ERROR: File not found. ")
        return

    # STEP 2: Preprocessing
    print("--- STEP 2: Cleaning Data ---")

    df['text'] = df['title'] + " " + df['description'] + " " + df['requirements']
    df['text'] = df['text'].fillna('')

    # X is input (Text), y is output (0 = Real, 1 = Fake)
    X = df['text']
    y = df['fraudulent']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # STEP 3: Building the AI Pipeline
    print("--- STEP 3: Training Model (This may take 1-2 minutes) ---")

    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(stop_words='english', max_features=5000)),
        # TfidfVectorizer converts words like "Urgent" into numbers like 0.82

        ('clf', RandomForestClassifier(n_estimators=100, n_jobs=-1, random_state=42))
    ])

    pipeline.fit(X_train, y_train)
    print("Training Complete!")

    # STEP 4: Evaluation
    print("--- STEP 4: Evaluating Accuracy ---")
    accuracy = pipeline.score(X_test, y_test)
    print(f"Model Accuracy: {accuracy * 100:.2f}%")

    predictions = pipeline.predict(X_test)
    print("\nDetailed Report:\n", classification_report(y_test, predictions))

    # STEP 5: Save the Brain
    print("--- STEP 5: Saving Model ---")
    joblib.dump(pipeline, MODEL_PATH)

    print(f"Model saved to {MODEL_PATH}")
    print("SUCCESS: The Brain is ready.")

if __name__ == "__main__":
    train()