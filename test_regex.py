import re

text = """Institute of Technology
Midterm Exam
Max Marks: 100

1. What is Python? (5 marks)
It is a language.
2) Explain duck typing. [10]
a) what is it?
b) why use it?

Q3. What is a decorator? 5 marks
"""

# Remove marks
marks_pattern = r'\[\s*\d+\s*(?:marks?|m)?\s*\]|\(\s*\d+\s*(?:marks?|m)?\s*\)|\b\d+\s*marks?\b'
text_no_marks = re.sub(marks_pattern, '', text, flags=re.IGNORECASE)
print("--- NO MARKS ---")
print(text_no_marks)

# Split pattern
split_pattern = r'^\s*(?:Q\.?\s*\d+|Question\s*\d+|\d+)\s*[.\):-]\s*'

parts = re.split(split_pattern, text_no_marks, flags=re.MULTILINE)
print("--- PARTS ---")
for i, p in enumerate(parts):
    print(f"[{i}] {repr(p)}")
