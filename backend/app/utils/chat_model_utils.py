# utils/chat_model_utils.py

def build_prompt_for_terminology_suggestion(terms: list[str], ontology_structure: str) -> str:
    term_list = "\n".join([f"{i+1}. {term}" for i, term in enumerate(terms)])

    prompt = f"""
你是一个知识图谱构建助手，任务是从术语中筛选出具有建模价值的概念，判断它们是否可以扩充现有本体，使其覆盖范围更加全面。
我会给你一组术语，请你逐一分析每个术语是否具有本体建模的价值。判断它是否应作为类、实例、关系或无建模意义，并说明理由。

仅输出每个术语的分析。格式如下：
1. [术语]：[分析内容]
2. ...

【本体结构】
以下是现有的本体类结构（类与子类缩进表示）：
{ontology_structure}

【术语列表】
{term_list}

【任务要求】
请根据术语和本体结构判断：
- 判断术语候选词是否可以新增入现有本体（类、子类、关系），对现有本体进行扩充；
- 哪些术语仅是修饰性描述（如“门票”、“推荐”）或非本体概念，应排除，说明理由。

【输出格式】
直接从这样开始：接下来，我逐一分析术语列表：1. [术语]：[分析内容]，并逐一列出每个术语的分析结果。请注意：
默认输出中文，如果我在ontology里面写了输出英文，请输出英文

【输出限制】
- 如果术语仅为文本修饰、情绪表达或无建模意义，请将 type 设置为 "Unknown"；
- 所有 reasoning 需简明扼要；
- 严格输出合法 JSON，仅返回数组本体。
"""
    return prompt.strip()
