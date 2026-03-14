import re

text = """Time: 2 hrs

1. What is the capital of France?
2. Explain the process of photosynthesis.
Q3. Write a short note on global warming.
Question 4: Describe the water cycle.
Q 5) What are the main features of democracy?
    6) Solve the equation 2x + 5 = 15.
   7. Calculate the area of a circle with radius 5 cm.
8 . Evaluate the function at x=3.
"""

num_pattern = r'(?:Q(?:uestion)?\.?\s*\d{1,3}(?:[\.\)\-:]\s*)?|\d{1,3}\s*[\.\)\-:])'
split_pattern = r'(?i)(?:^|\n)\s*' + num_pattern + r'\s*'
clean_pattern = r'(?i)^\s*' + num_pattern + r'\s*'

matches = list(re.finditer(split_pattern, text))
print(f"Number of matches: {len(matches)}")
for m in matches:
    print(repr(m.group(0)))

raw_questions = []
if len(matches) > 0:
    for i in range(len(matches)):
        start_idx = matches[i].end()
        end_idx = matches[i+1].start() if i + 1 < len(matches) else len(text)
        
        q_text = text[start_idx:end_idx].strip()
        q_text = re.sub(r'\n+', '\n', q_text)
        q_text = re.sub(clean_pattern, '', q_text)
        
        if len(q_text) > 2:
            raw_questions.append(q_text)

for i, q in enumerate(raw_questions):
    print(f"[{i+1}] {repr(q)}")
