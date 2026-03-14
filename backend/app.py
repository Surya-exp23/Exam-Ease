import os
import json
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
import pdfplumber
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

try:
    from groq import Groq
    GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
    if GROQ_API_KEY:
        client = Groq(api_key=GROQ_API_KEY)
        print("Groq client initialized successfully!")
    else:
        client = None
        print("Warning: GROQ_API_KEY not found in environment. Groq API will not work.")
except ImportError:
    print("Groq library not found. Please install groq.")
    client = None
except Exception as e:
    print(f"Error loading Groq client: {e}")
    client = None

app = Flask(__name__)
CORS(app)

@app.route('/api/generate', methods=['POST'])
def generate_questions():
    if not client:
        return jsonify({"error": "Groq client is not initialized. Please ensure GROQ_API_KEY is set in .env"}), 500

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
        sys_prompt = """You are an expert question extractor. Your task is to extract only the actual examination or test questions from the provided text.
Ignore instructions, maximum marks, university names, and other boilerplate text.
Do not modify the meaning of the questions.
Return the questions exactly as they appear in the text in formatting, but strip away any prefix numbers (e.g. '1.', 'Q2)', etc.).
You must output ONLY valid JSON format with a single key "questions" containing a list of objects.
Each object should represent one question and must exactly follow this schema:
{
  "originalQuestion": "The exact question text extracted without numbering.",
  "simplifiedQuestion": "The exact question text extracted without numbering.",
  "type": "subjective",
  "options": [],
  "marks": 1,
  "correctAnswer": "Subjective answer - requires teacher review."
}
Do not include markdown blocks, explanations, or any text other than the JSON object."""
        
        user_prompt = f"Extract the questions from the following text and return as JSON:\n\n{text}"
        
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": sys_prompt},
                {"role": "user", "content": user_prompt}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.1,
            response_format={"type": "json_object"}
        )
        
        response_content = response.choices[0].message.content
        
        try:
            parsed_data = json.loads(response_content)
            questions = parsed_data.get("questions", [])
            
            # Format questions with IDs
            formatted_questions = []
            for i, q in enumerate(questions):
                # Ensure all required fields exist
                formatted_questions.append({
                    "id": i + 1,
                    "originalQuestion": q.get("originalQuestion", ""),
                    "simplifiedQuestion": q.get("simplifiedQuestion", q.get("originalQuestion", "")),
                    "type": q.get("type", "subjective"),
                    "options": q.get("options", []),
                    "marks": q.get("marks", 1),
                    "correctAnswer": q.get("correctAnswer", "Subjective answer - requires teacher review.")
                })
                
            if not formatted_questions:
                formatted_questions.append({
                    "id": 1,
                    "originalQuestion": "No explicit questions could be extracted. Please check the document.",
                    "simplifiedQuestion": "No explicit questions could be extracted.",
                    "type": "subjective",
                    "options": [],
                    "marks": 1
                })
                
            return jsonify({"questions": formatted_questions})
            
        except json.JSONDecodeError:
            print(f"Failed to parse JSON from response: {response_content}")
            return jsonify({"error": "Failed to extract structured questions from the LLM response"}), 500
            
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Error generating questions via Groq API: {str(e)}"}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "api_ready": client is not None})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
