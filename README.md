# 🕌 Noor AI — Intelligent Islamic Knowledge & Spiritual Companion

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/React%2018-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 18" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white" alt="Google Gemini" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Python%203.11-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python 3.11" />
</p>

<p align="center">
  A state-of-the-art, authenticated Islamic AI Assistant built with <b>FastAPI</b>, <b>React 18</b>, and <b>Google Gemini</b>. Combines authoritative classical Islamic scholarship with modern conversational reasoning, audio recitations, voice synthesis, analytics, and an elegant emerald-midnight interface.
</p>

---

## ✨ Key Features

### 📖 Authoritative Islamic Knowledge
- **Authentic Hadith & Quran Citations**: Direct citations from Sahih Bukhari, Sahih Muslim, Sunan Abi Dawud, and verified Tafsir traditions.
- **Cross-Madhab Respect**: Built-in awareness and balanced representation across the major schools of jurisprudence (Hanafi, Shafi'i, Maliki, Hanbali).
- **RAG-Ready Islamic Knowledge Base**: Local dataset integration (`Backend/app/data/islamic_qa.json`) blended seamlessly with Gemini reasoning.

### 🎙️ Audio, Voice & Quran Recitations
- **Surah Recitation Player**: Integrated verse audio playback with scrubbing, duration formatting, and mute/unmute controls.
- **Text-to-Speech (TTS)**: Instant voice narration of AI responses using gTTS audio generation.
- **Speech-to-Text Input**: Interactive microphone speech input for seamless hands-free queries.

### 🎨 Modern UI & Emerald Aesthetic
- **Emerald & Midnight Design System**: Deep dark mode (`#070a0d`), radiant emerald glows, and frosted glassmorphism (`backdrop-blur-xl`).
- **Arabic Typography**: Native Arabic font styling (`Amiri`) alongside ultra-clean modern typography (`Plus Jakarta Sans`).
- **Fluid Micro-Animations**: Smooth entry transitions, hover lifts, copy-to-clipboard badges, and real-time streaming indicators.
- **Light & Dark Theme Engine**: Instant theme toggle with full persistent state across sessions.

### 🔐 Authentication & Security
- **JWT & Password Security**: Secure account creation with PBKDF2 / SHA-256 password hashing and JWT access tokens.
- **Google OAuth 2.0 Integration**: One-click sign-in with Google profile synchronization.
- **Session Protection**: Route guards, authenticated user state, and protected endpoints.

### 📊 Analytics & Personal Dashboard
- **Activity Tracker**: Real-time tracking of total queries, active streaks, and average response times.
- **Topic Breakdown**: Interactive progress metrics for Fiqh, Quranic Tafsir, Hadith, Duas, and History.
- **Prayer Times Widget**: Live dynamic prayer time indicators directly on the dashboard.
- **Conversation Management**: Multi-session management with inline renaming, auto-titling, and deletion.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, React Router v6, Tailwind CSS, Lucide Icons, Axios, gTTS Web Audio |
| **Backend** | Python 3.11, FastAPI, Uvicorn, Pydantic, HTTPX, PyJWT, Passlib |
| **AI / LLM** | Google Gemini Generative AI SDK (`gemini-2.0-flash` / `gemini-1.5-flash`) |
| **Storage** | Local structured JSON storage (`users.json`, `sessions/`, `islamic_qa.json`) |
| **DevOps** | Docker, Docker Compose, Nginx (Production reverse proxy) |

---

## 📁 Project Structure

```text
islamic-agent/
├── Backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/            # API endpoints (Auth, Chat, Audio, User, Stats)
│   │   ├── core/              # Security, JWT tokens, configuration & settings
│   │   ├── services/          # Gemini AI agent, Islamic QA engine, Voice/TTS
│   │   ├── data/              # Curated Hadith, Quran and Fiqh references
│   │   └── main.py            # FastAPI entry point & CORS configuration
│   ├── Dockerfile             # Production backend container definition
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── public/                # Static assets, favicon, index.html
│   ├── src/
│   │   ├── components/        # Profile modal, UserMenu, Audio player
│   │   ├── pages/             # LandingPage, Login, Dashboard, AuthCallback
│   │   ├── api.js             # Centralized Axios client & API hooks
│   │   ├── App.jsx            # Main app shell & route orchestration
│   │   ├── Chat.jsx           # Main conversation interface & message renderer
│   │   ├── Sidebar.jsx        # History manager, quick prompts & theme toggle
│   │   └── styles.css         # Custom animations, glassmorphism & typography
│   ├── tailwind.config.js     # Extended color palette & custom keyframes
│   ├── Dockerfile             # Multi-stage production Nginx container
│   └── package.json           # Dependencies and scripts
├── docker-compose.yml         # Container orchestration
└── README.md                  # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18.x or newer) and **npm**
- **Python** (v3.10 or newer)
- **Google Gemini API Key** ([Get one here](https://aistudio.google.com/app/apikey))
- *(Optional)* **Docker & Docker Compose**

---

### Method 1: Local Development

#### 1. Clone the repository
```bash
git clone https://github.com/mahadir04/islamic-agent.git
cd islamic-agent
```

#### 2. Setup the Backend
```bash
cd Backend

# Create and activate a virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
# Create a .env file inside Backend/:
cat <<EOT >> .env
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_CLIENT_ID=your_google_client_id (optional)
GOOGLE_CLIENT_SECRET=your_google_client_secret (optional)
SECRET_KEY=your_jwt_secret_key
EOT

# Start the Backend server
python -m app.main
```
> The API will be available at **`http://localhost:8000`** (Interactive Docs: **`http://localhost:8000/docs`**).

#### 3. Setup the Frontend
In a new terminal window:
```bash
cd frontend

# Install packages
npm install

# Start React development server
npm start
```
> The web interface will open automatically at **`http://localhost:3000`**.

---

### Method 2: Docker Compose (Recommended for Production)

1. Set your environment variables in the root `.env` file:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   SECRET_KEY=your_super_secret_jwt_key
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

2. Build and launch all services:
   ```bash
   docker-compose up --build -d
   ```

3. Access the application:
   - **Frontend App**: `http://localhost:3000`
   - **Backend API**: `http://localhost:8000`
   - **API Documentation**: `http://localhost:8000/docs`

---

## 🔒 Environment Variables

| Variable | Description | Required | Default |
| :--- | :--- | :---: | :--- |
| `GEMINI_API_KEY` | Google AI Studio Gemini API Key | **Yes** | — |
| `SECRET_KEY` | Secret used for cryptographic JWT signing | **Yes** | Auto-generated in dev |
| `GOOGLE_CLIENT_ID` | OAuth 2.0 Client ID for Google login | Optional | — |
| `GOOGLE_CLIENT_SECRET` | OAuth 2.0 Client Secret for Google login | Optional | — |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Lifetime of authentication JWT tokens | No | `1440` (24h) |

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/signup` | Register a new user account |
| `POST` | `/api/v1/auth/login` | Authenticate with credentials and receive a JWT token |
| `GET` | `/api/v1/auth/google` | Initiate Google OAuth 2.0 flow |
| `POST` | `/api/v1/chat` | Send a query to the Islamic AI Agent |
| `GET` | `/api/v1/chat/history` | Retrieve user chat sessions and message history |
| `POST` | `/api/v1/audio/tts` | Convert text response into playable speech (MP3) |
| `GET` | `/api/v1/user/profile` | Get current user details and preferences |
| `PUT` | `/api/v1/user/profile` | Update preferred language, madhab, and settings |
| `GET` | `/api/v1/user/stats` | Retrieve learning streaks, queries, and analytics |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to open an issue or submit a pull request on the repository.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="center">
  <i>"May this effort serve as a benefit to learners and seekers of knowledge."</i><br>
  <b>الحمد لله رب العالمين</b>
</p>
