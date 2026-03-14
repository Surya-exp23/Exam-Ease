import re

with open(r"c:\ExamEase Project\Exam-Ease\backend\app.py", "r", encoding="utf-8") as f:
    lines = f.readlines()

# The target block to replace is lines 51 to 211 (0-indexed 50 to 211).
# Let's cleanly replace the `generate_questions` fallback block.

replacement = """    try:
        import re
        
        # 1. Clean up unwanted common question paper artifacts
        marks_pattern = r'\\[\\s*\\d+\\s*(?:marks?|m)?\\s*\\]|\\(\\s*\\d+\\s*(?:marks?|m)?\\s*\\)|\\b\\d+\\s*marks?\\b'
        text = re.sub(marks_pattern, '', text, flags=re.IGNORECASE)
        
        # Remove empty blanks like "________"
        text = re.sub(r'_{3,}', '', text)
        
        unwanted_phrases = [
            "institute name", "student name", "roll no", "date:", "time allowed",
            "maximum marks", "max marks", "total marks", "fill in the blanks",
            "state true or false", "multiple choice questions", "answer the following questions",
            "answer the following", "all questions are compulsory", "section a", "section b",
            "section c", "section d", "section e", "part a", "part b", "part c", "part d", "part e"
        ]
        text_lines = text.split('\\n')
        cleaned_lines = []
        for line in text_lines:
            lower_line = line.lower()
            if any(phrase in lower_line for phrase in unwanted_phrases) and len(lower_line) < 100:
                continue
            cleaned_lines.append(line)
        text = '\\n'.join(cleaned_lines)

        for phrase in unwanted_phrases:
            text = re.sub(r'(?i)' + re.escape(phrase) + r'[.\\-:]?\\s*', '', text)
            
        # 2. Match question numbers -> creating individual questions
        split_pattern = r'(?:^|\\n)\\s*(?:Q\\.?\\s*\\d+|Question\\s*\\d+|\\(?\\d+\\)?|\\([a-zA-Z]\\)|[a-zA-Z]\\)|\\([ivxIVX]+\\)|[ivxIVX]+\\))\\s*[.\\):-]?\\s+'
        
        matches = list(re.finditer(split_pattern, text))
        raw_questions = []
        
        if len(matches) > 0:
            for i in range(len(matches)):
                start_idx = matches[i].end()
                end_idx = matches[i+1].start() if i + 1 < len(matches) else len(text)
                
                # The text of the question (the number is automatically skipped because start_idx is after the match)
                q_text = text[start_idx:end_idx].strip()
                
                # Clean up multiple newlines or arbitrary spaces
                q_text = re.sub(r'\\n+', '\\n', q_text)
                
                # Further ensure no lingering numbering at the start of the extracted text
                q_text = re.sub(r'^\\s*(?:Q\\.?\\s*\\d+|Question\\s*\\d+|\\(?\\d+\\)?|\\([a-zA-Z]\\)|[a-zA-Z]\\)|\\([ivxIVX]+\\)|[ivxIVX]+\\))\\s*[.\\):-]?\\s*', '', q_text)
                
                if len(q_text) > 2:
                    raw_questions.append({
                        "originalQuestion": q_text,
                        "simplifiedQuestion": q_text,
                        "type": "subjective",
                        "options": [],
                        "marks": 1,
                        "correctAnswer": "Subjective answer - requires teacher review."
                    })
        else:
            # Fallback for when no explicit numbers are found, extract based on sentences ending in ?
            # This ensures we purely copy from document without generating AI questions.
            sentences = re.split(r'(?<=\\?)\\s+', text)
            for s in sentences:
                s_clean = s.strip()
                if len(s_clean) > 5 and '?' in s_clean:
                    s_clean = re.sub(r'^\\s*(?:Q\\.?\\s*\\d+|Question\\s*\\d+|\\(?\\d+\\)?|\\([a-zA-Z]\\)|[a-zA-Z]\\)|\\([ivxIVX]+\\)|[ivxIVX]+\\))\\s*[.\\):-]?\\s*', '', s_clean)
                    raw_questions.append({
                        "originalQuestion": s_clean,
                        "simplifiedQuestion": s_clean,
                        "type": "subjective",
                        "options": [],
                        "marks": 1,
                        "correctAnswer": "Subjective answer - requires teacher review."
                    })

        formatted_questions = []
        for i, q in enumerate(raw_questions):
            q["id"] = i + 1
            formatted_questions.append(q)
            
        if not formatted_questions:
            formatted_questions.append({
                "id": 1,
                "originalQuestion": "No explicit questions could be extracted. Please ensure the document contains numbered questions or question marks.",
                "simplifiedQuestion": "No explicit questions could be extracted.",
                "type": "subjective",
                "options": [],
                "marks": 1
            })
            
        return jsonify({"questions": formatted_questions})
        
    except Exception as e:
"""

# Find start and end indices
start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if "    try:" in line and "import re" in lines[i+1]:
        start_idx = i
        break

for i in range(start_idx+1, len(lines)):
    if "    except Exception as e:" in lines[i]:
        end_idx = i
        break

if start_idx != -1 and end_idx != -1:
    new_lines = lines[:start_idx] + [replacement] + lines[end_idx+1:]
    with open(r"c:\ExamEase Project\Exam-Ease\backend\app.py", "w", encoding="utf-8") as f:
        f.writelines(new_lines)
    print("Success replacing block.")
else:
    print("Failed to find block.")
