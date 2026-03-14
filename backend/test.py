import re

text = """Institute Name: Global Academy
Date: 12-05-2023
Max Marks: 50
Time: 2 hrs

All questions are compulsory.
Section A
1. What is the capital of France?
2. Explain the process of photosynthesis.
Q3. Write a short note on global warming.
Question 4: Describe the water cycle.
Q 5) What are the main features of democracy?
Part B
    6) Solve the equation 2x + 5 = 15.
   7. Calculate the area of a circle with radius 5 cm.
8 . Evaluate the function at x=3.
"""

# 1. Clean up unwanted common question paper artifacts
marks_pattern = r'\[\s*\d+\s*(?:marks?|m)?\s*\]|\(\s*\d+\s*(?:marks?|m)?\s*\)|\b\d+\s*marks?\b'
text = re.sub(marks_pattern, '', text, flags=re.IGNORECASE)

text = re.sub(r'_{3,}', '', text)

unwanted_phrases = [
    "institute name", "student name", "roll no", "date:", "time allowed",
    "maximum marks", "max marks", "total marks", "fill in the blanks",
    "state true or false", "multiple choice questions", "answer the following questions",
    "answer the following", "all questions are compulsory", "section a", "section b",
    "section c", "section d", "section e", "part a", "part b", "part c", "part d", "part e",
    "subject:", "class:", "exam:", "examination:"
]

# We should drop lines that CONTAIN these phrases if they are relatively short (headers)
text_lines = text.split('\n')
cleaned_lines = []
for line in text_lines:
    lower_line = line.lower()
    if any(phrase in lower_line for phrase in unwanted_phrases) and len(lower_line) < 80:
        continue
    cleaned_lines.append(line)
text = '\n'.join(cleaned_lines)

# Remove any remaining unwanted phrases from longer lines
for phrase in unwanted_phrases:
    text = re.sub(r'(?i)' + re.escape(phrase) + r'[.\-:]?\s*', '', text)
    
# split_pattern
# Match start of line or at least 2 spaces, then Q/Question/etc, optional dot/space, digits, optional dot/bracket/colon/space
split_pattern = r'(?:^|\n|\s{2,})(?:Q(?:uestion)?\.?\s*\d{1,3}[\.\)-:]?|\d{1,3}[\.\)-:])\s+'

raw_questions = []

parts = re.split(split_pattern, text)
print("Matched?", bool(re.search(split_pattern, text)))

for i, p in enumerate(parts):
    p = p.strip()
    p = re.sub(r'\n+', '\n', p)
    
    # If first part, might be structural leftover. If it doesn't look like a question or has no ? and short, drop it.
    if i == 0 and len(p) < 150 and '?' not in p:
        continue
        
    if len(p) > 5:
        raw_questions.append(p)

for idx, q in enumerate(raw_questions):
    print(f"--- Q{idx+1} ---")
    print(repr(q))
