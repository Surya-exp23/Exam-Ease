import re
import json

text = """Institute Name: Global Academy
Date: 12-05-2023
Max Marks: 50
Time: 2 hrs

All questions are compulsory.
Section A
1. What is the capital of France?
    It lies in Europe.
2. Explain the process of photosynthesis.
Q3. Write a short note on global warming.
Question 4: Describe the water cycle.
Q 5) What are the main features of democracy?
Part B
    6) Solve the equation 2x + 5 = 15.
   7. Calculate the area of a circle with radius 5 cm.
8 . Evaluate the function at x=3.
"""

split_pattern = r'(?:^|\n|\s{2,})(?:Q(?:uestion)?\.?\s*\d{1,3}[\.\)-:]?|\d{1,3}[\.\)-:])\s+'

parts = re.split(split_pattern, text)
result = []
for i, p in enumerate(parts):
    p = p.strip()
    p = re.sub(r'\n+', '\n', p)
    if i == 0 and len(p) < 150 and '?' not in p:
        continue
    if len(p) > 5:
        result.append(p)

with open('output.json', 'w') as f:
    json.dump(result, f, indent=4)
