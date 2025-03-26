# backend/app/utils/terminology_extractor.py

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer

def extract_columns(file_path: str):
    if file_path.endswith(".xlsx"):
        df = pd.read_excel(file_path)
    elif file_path.endswith(".csv"):
        df = pd.read_csv(file_path)
    else:
        raise ValueError("仅支持 .xlsx 和 .csv 文件")

    return df.columns.tolist()

def extract_terms(file_path: str, column: str = None, top_k: int = 20):
    if file_path.endswith(".xlsx"):
        df = pd.read_excel(file_path)
    elif file_path.endswith(".csv"):
        df = pd.read_csv(file_path)
    else:
        raise ValueError("仅支持 .xlsx 和 .csv 文件")

    # 自动查找列名包含“内容”的列
    target_col = column or next((col for col in df.columns if "内容" in col), None)
    if not target_col:
        raise ValueError("未找到包含“内容”的列，也未提供列名")

    texts = df[target_col].dropna().astype(str).tolist()

    vectorizer = TfidfVectorizer(max_features=1000, stop_words="english")
    X = vectorizer.fit_transform(texts)
    tfidf_scores = X.sum(axis=0).A1
    feature_names = vectorizer.get_feature_names_out()

    scored_terms = sorted(zip(feature_names, tfidf_scores), key=lambda x: -x[1])
    top_terms = [term for term, score in scored_terms[:top_k]]
    return top_terms
