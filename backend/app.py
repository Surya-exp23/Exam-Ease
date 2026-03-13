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
        all_generated = []
        
        for chunk in chunks:
            # Model expects some context. Valhalla model uses "generate questions: " prompt.
            if generator == "MOCK":
                import re
                import random
                
                # First try to find explicit questions in the text chunk
                explicit_questions = re.findall(r'([^.!?\n]+\?)', chunk)
                found_explicit = False
                for eq in explicit_questions:
                    if len(eq.strip()) > 10:
                        all_generated.append(eq.strip())
                        found_explicit = True
                
                # If no explicit questions, generate smart ones from declarative sentences
                if not found_explicit:
                    sentences = [s.strip() for s in re.split(r'[.!?\n]+', chunk) if len(s.strip()) > 20]
                    for s in sentences[:3]:
                        words = [w for w in s.split() if len(w) > 4]
                        if words:
                            subject = random.choice(words)
                            formats = [
                                f"Explain the context of '{subject}' based on the text.",
                                f"What does the document say about {subject}?",
                                f"Discuss the following statement: '{s}'"
                            ]
                            all_generated.append(random.choice(formats))
            else:
                prompt = f"generate questions: {chunk}"
                results = generator(prompt, max_length=64, num_return_sequences=1)
                for res in results:
                    gen_text = res.get('generated_text', '')
                    if gen_text and len(gen_text) > 5 and '?' in gen_text:
                        all_generated.append(gen_text)
        
        formatted_questions = []
        unique_qs = list(set(all_generated))
        
        for i, q in enumerate(unique_qs):
            formatted_questions.append({
                "id": i + 1,
                "originalQuestion": q,
                "simplifiedQuestion": q,
                "type": "subjective",
                "options": [],
                "marks": 5
            })
            
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
