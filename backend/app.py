import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import pdfplumber

try:
    from transformers import pipeline
    print("Loading model... this might take a minute on the first run.")
    generator = pipeline("text2text-generation", model="valhalla/t5-base-qg-hl")
    print("Model loaded successfully!")
except ImportError:
    print("Transformers or Torch not found, using Mock AI Generator.")
    generator = "MOCK"
except Exception as e:
    print(f"Error loading model: {e}")
    generator = "MOCK"

app = Flask(__name__)
CORS(app)

@app.route('/api/generate', methods=['POST'])
def generate_questions():
    if not generator:
        return jsonify({"error": "Model failed to load"}), 500

    text = ""
    
    # Handle PDF file upload
    if 'pdf' in request.files:
        file = request.files['pdf']
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400
        try:
            with pdfplumber.open(file) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
        except Exception as e:
            return jsonify({"error": f"Error parsing PDF: {str(e)}"}), 500

    # Handle direct text input
    elif 'text' in request.form:
        text = request.form['text']
    elif request.json and 'text' in request.json:
        text = request.json['text']
        
    if not text.strip():
        return jsonify({"error": "No text could be extracted or provided"}), 400

    try:
        # Simple chunking
        chunks = [text[i:i+400] for i in range(0, len(text), 400)][:5]
        raw_questions = []
        
        for chunk in chunks:
            if generator == "MOCK":
                import re
                import random
                
                # Extract words to use as multiple-choice distractors
                words = [w.strip('.,!?"\'') for w in chunk.split() if len(w.strip('.,!?"\'')) > 4]
                distractor_pool = list(set([w for w in words if len(w) > 5]))
                if len(distractor_pool) < 3:
                    distractor_pool += ["None of the above", "All of the above", "Not applicable", "Unknown"]
                
                # 1. Try to find explicit questions in the text
                explicit_questions = re.findall(r'([^.!?\n]+\?)', chunk)
                for eq in explicit_questions:
                    if len(eq.strip()) > 10:
                        raw_questions.append({
                            "originalQuestion": eq.strip(),
                            "simplifiedQuestion": eq.strip(),
                            "type": "subjective",
                            "options": [],
                            "marks": 5,
                            "correctAnswer": "Subjective answer - requires teacher review."
                        })
                
                # 2. Generate smart MCQs and subjective questions from declarative sentences
                sentences = [s.strip() for s in re.split(r'[.!?\n]+', chunk) if len(s.strip()) > 40 and '?' not in s]
                
                for s in sentences[:2]:  # Pick best sentences
                    parts = [w.strip('.,!?"\'') for w in s.split()]
                    potential_blanks = [w for w in parts if len(w) >= 6]
                    
                    if potential_blanks:
                        # Create Fill In The Blank MCQ
                        correct_answer = random.choice(potential_blanks)
                        question_text = s.replace(correct_answer, "________")
                        
                        distractors = random.sample([n for n in distractor_pool if n != correct_answer], min(3, len(distractor_pool)))
                        options = [correct_answer] + distractors
                        while len(options) < 4:
                            options.append(f"Option {len(options)+1}")
                        random.shuffle(options)
                        
                        raw_questions.append({
                            "originalQuestion": s,
                            "simplifiedQuestion": f"Fill in the blank: {question_text}",
                            "type": "mcq",
                            "options": options,
                            "marks": 2,
                            "correctAnswer": correct_answer
                        })
                    
                    # Randomly decide to create True/False or a Subjective "Explain" question
                    choice = random.random()
                    if choice > 0.6:
                        is_true = random.random() > 0.5
                        q_text = s if is_true else s.replace(random.choice(parts), "something else")
                        raw_questions.append({
                            "originalQuestion": s,
                            "simplifiedQuestion": f"Is the following statement True or False?\n\"{q_text}\"",
                            "type": "mcq",
                            "options": ["True", "False"],
                            "marks": 1,
                            "correctAnswer": "True" if is_true else "False"
                        })
                    elif choice > 0.3:
                        # Create Subjective Question
                        subject = random.choice(potential_blanks) if potential_blanks else "this topic"
                        raw_questions.append({
                            "originalQuestion": s,
                            "simplifiedQuestion": f"Explain the context and significance of '{subject}' based on the text.",
                            "type": "subjective",
                            "options": [],
                            "marks": 5,
                            "correctAnswer": f"The answer should discuss: {s}"
                        })
            else:
                prompt = f"generate questions: {chunk}"
                results = generator(prompt, max_length=64, num_return_sequences=1)
                for res in results:
                    gen_text = res.get('generated_text', '')
                    if gen_text and len(gen_text) > 5 and '?' in gen_text:
                        raw_questions.append({
                            "originalQuestion": gen_text,
                            "simplifiedQuestion": gen_text,
                            "type": "subjective",
                            "options": [],
                            "marks": 5,
                            "correctAnswer": "Requires manual grading."
                        })
        
        # Format the final output: SHUFFLE to guarantee randomness and mix
        import random
        random.shuffle(raw_questions)
        formatted_questions = []
        for i, q in enumerate(raw_questions[:10]):  # Limit to 10 questions max
            q["id"] = i + 1
            formatted_questions.append(q)
            
        if not formatted_questions:
            formatted_questions.append({
                "id": 1,
                "originalQuestion": "What is the main topic of the provided text?",
                "simplifiedQuestion": "What is the main topic of the provided text?",
                "type": "subjective",
                "options": [],
                "marks": 5
            })
            
        return jsonify({"questions": formatted_questions})
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Error generating questions: {str(e)}"}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "model_loaded": generator is not None})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
