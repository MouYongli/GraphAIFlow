import pandas as pd
import jieba
from sklearn.feature_extraction.text import TfidfVectorizer

def extract_columns(file_path: str):
    if file_path.endswith(".xlsx"):
        df = pd.read_excel(file_path)
    elif file_path.endswith(".csv"):
        df = pd.read_csv(file_path)
    else:
        raise ValueError("仅支持 .xlsx 和 .csv 文件")

    return df.columns.tolist()

def load_stopwords(filepath: str) -> set[str]:
    with open(filepath, "r", encoding="utf-8") as f:
        return set(line.strip() for line in f if line.strip())

def extract_terms(file_path: str, column: str = None, top_k: int = 20):
    import os
    if file_path.endswith(".xlsx"):
        df = pd.read_excel(file_path)
    elif file_path.endswith(".csv"):
        df = pd.read_csv(file_path)
    else:
        raise ValueError("仅支持 .xlsx 和 .csv 文件")

    target_col = column or next((col for col in df.columns if "内容" in col), None)
    if not target_col:
        raise ValueError("未找到包含“内容”的列，也未提供列名")

    texts = df[target_col].dropna().astype(str).tolist()

    # ✅ 加载停用词（自动适配路径）
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    stopwords_path = os.path.normpath(os.path.join(BASE_DIR, "..", "resource", "stopwords.txt"))
    stopwords = load_stopwords(stopwords_path)
    # ✅ 加载要排除的实体词列表
    entity_path = os.path.normpath(os.path.join(BASE_DIR, "..", "resource", "旅游景点数据集.txt"))
    entities = load_stopwords(entity_path)  # 复用同样的读取函数


    # ✅ jieba 分词 & 去除停用词
    tokenized_texts = [
        " ".join(word for word in jieba.cut(text) if word.strip() and word not in stopwords)
        for text in texts
    ]
    tokenized_texts = [
    " ".join(
        word for word in jieba.cut(text)
        if word.strip() and word not in stopwords and word not in entities
    )
    for text in texts
]


    vectorizer = TfidfVectorizer(max_features=1000)
    X = vectorizer.fit_transform(tokenized_texts)
    tfidf_scores = X.sum(axis=0).A1
    feature_names = vectorizer.get_feature_names_out()

    scored_terms = sorted(zip(feature_names, tfidf_scores), key=lambda x: -x[1])
    top_terms = [term for term, score in scored_terms[:top_k]]
    return top_terms
