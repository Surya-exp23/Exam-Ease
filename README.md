# ExamEase 🧠⚡

**ExamEase** is a local, AI-powered smart exam assistant specifically designed to help students with dyslexia take exams fairly and confidently. It empowers teachers to create accessible tests, and allows students to instantly upload existing exam PDFs and translate them into perfectly formatted, simplified, and readable question formats. 

Built with accessibility first, ExamEase features a comprehensive suite of assistive tools including Text-to-Speech (TTS), customizable Dyslexia-friendly fonts, Focus Mode, translations, and theme toggles.

---

## 🚀 Key Features

*   **Role-Based Access**: Specialized dashboard environments for **Teachers** (test creation/management) and **Students** (taking tests).
*   **Local AI PDF Simplification**: Upload any complex test PDF. Using a completely local, free Python ML backend, the app extracts the text and uses Hugging Face models to generate simple, understandable questions.
*   **Accessibility Toolbar**:
    *   **Text-to-Speech (TTS):** Individual read-aloud buttons for questions and every multiple-choice option.
    *   **Dyslexia Font:** Toggles a weighted font specifically designed to prevent letter flipping.
    *   **Focus Mode:** Dims the surrounding environment and highlights only the active question to prevent visual overload.
    *   **Text Zoom:** Adjustable core font sizing across the entire exam interface.
    *   **Translation:** Instant translation to native languages (Hindi, Spanish, French, etc.) via external APIs.
*   **Full-Screen Exam Lock**: Ensures students take their tests in an enforced Full Screen, distraction-free environment. 
*   **Premium Custom UI**: Built entirely without heavy framework dependencies to maintain a pristine, glassmorphic design system that features a persistent Dark/Light mode toggle.

---

## 🛠️ Technology Stack

ExamEase uses a modern decoupled architecture spanning JavaScript and Python.

### Frontend
*   **React (v18)**: Core UI framework.
*   **Vite**: Lightning-fast build tool and dev server.
*   **React Router (`react-router-dom`)**: Client-side navigation mapping for Dashboards and Exams.
*   **GSAP (GreenSock Animation Platform)**: Handles premium page entrance animations and floating background orbs on the Landing Page.
*   **Lucide React**: Clean SVG icon library.
*   **PDF.js**: Mozilla's library utilized to extract raw text seamlessly in the browser.
*   **Vanilla CSS**: Used extensively with CSS variables to ensure lightweight custom themes.

### Backend (Python AI Server)
*   **Python 3**: Runs the standalone AI server.
*   **Flask / Flask-CORS**: Lightweight API framework to expose `/api/generate` to the React app.
*   **pdfplumber**: Handles robust PDF text extraction fallbacks.
*   **Hugging Face Transformers (`pipeline`)**: Implements the `valhalla/t5-base-qg-hl` NLP model for question generation/simplification. 
*   *(Includes an intelligent Regex-driven Mock Generator for live Hackathon demos to bypass massive ML downloads!)*

---

## 📂 Project Structure

```text
examease/
├── backend/                  # Local Python AI Server
│   ├── app.py                # Main Flask application & ML Logic
│   └── requirements.txt      # Python dependencies
├── public/                   # Static assets
└── src/                      # React Frontend Source
    ├── components/           # Reusable UI Parts (ThemeToggle, QuestionCard, Toolbar)
    ├── context/              # React Context Providers (AuthContext)
    ├── pages/                # Main Application Views
    │   ├── LandingPage.jsx   # Hero entrance
    │   ├── LoginPage.jsx     # Role-based entry
    │   ├── TeacherDashboard  # Create/Manage tests
    │   ├── StudentDashboard  # PDF Upload / Start Test
    │   ├── ExamPage.jsx      # Fullscreen accessible exam view
    │   └── CompletionPage    # Congratulations screen
    ├── utils/                # Helper Functions
    │   ├── localApi.js       # Bridge to Python backend
    │   ├── pdfParser.js      # Frontend PDF handling
    │   ├── testStore.js      # LocalStorage pseudodatabase
    │   └── ttsHelper.js      # Web Speech API wrapper
    ├── App.jsx               # Application Router
    └── index.css             # Global CSS Variables & Design System Config
```

---

## 🏃 Getting Started Locally

To run this application locally, you must run both the Frontend and the Backend servers simultaneously. 

### 1. Start the Frontend (Vite)
Open a terminal in the root `examease` directory:
```bash
npm install
npm run dev
```

### 2. Start the Backend (Flask)
Open a second terminal window. Navigate to the `backend` directory and activate the python virtual environment:

**Windows:**
```cmd
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

**Mac/Linux:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

Once both servers are running, open your browser to `http://localhost:5173`. We hope you enjoy using ExamEase! 🚀
