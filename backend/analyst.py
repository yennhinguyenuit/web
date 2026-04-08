import pandas as pd
df = pd.read_csv("oi.csv")
summary = pd.DataFrame({
    "Chi tieu": [
        "So dong giao dich item-level",
        "So don hang",
        "So san pham",
        "So bien the",
        "So cot"
    ],
    "Gia tri": [
        len(df),
        df["orderId"].nunique(),
        df["itemId"].nunique(),
        df["modelId"].nunique(),
        df.shape[1]
    ]
})

print(summary)
