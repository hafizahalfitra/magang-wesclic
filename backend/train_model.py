import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, r2_score
import joblib

DATA_PATH = "clean_data.csv"
MODEL_PATH = "salary_model.pkl"

def main():
    df = pd.read_csv(DATA_PATH)

    # Fitur sesuai clean_data.csv
    X = df[["Pendidikan_Encoded", "Jabatan_Encoded"]]
    y = df["Gaji"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = LinearRegression()
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    r2 = r2_score(y_test, preds)

    print(f"MAE: {mae:,.0f}")
    print(f"R2 : {r2:.4f}")

    joblib.dump(model, MODEL_PATH)
    print(f"Saved model -> {MODEL_PATH}")

if __name__ == "__main__":
    main()