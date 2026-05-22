# 🕌 Islamic AI Assistant

[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Gemini](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)](https://ai.google.dev/)

A premium, minimalistic Islamic AI Assistant designed to provide accurate guidance using a combination of local Islamic knowledge and advanced LLM reasoning via Google Gemini.

---

## ✨ Features

### 🔐 Secure Authentication
- **Google OAuth 2.0 Integration**: Seamless sign-in with your Google account.
- **Session Persistence**: Stay logged in securely across devices.

### 🤖 Intelligent Assistant
- **Hybrid Knowledge Engine**: Combines local pre-loaded Islamic data with the power of **Gemini 3 Flash**.
- **Contextual Conversations**: The AI remembers previous exchanges within a session for natural dialogue.
- **Minimalist Chat UI**: High-end glassmorphism design with smooth animations and responsive "floating" interface.

### 📊 Personal Dashboard
- **Usage Statistics**: Track your total conversations and message count.
- **Recent Activity**: Quickly resume your 4 most recent chat sessions.
- **Topic Analysis**: Visual summaries of the Islamic topics you've explored.

### 🌓 Premium UX
- **Dynamic Theme Engine**: Sophisticated Dark and Light modes with tailored color palettes.
- **Responsive Design**: Fully optimized for Desktop, Tablet, and Mobile.
- **Glassmorphism Aesthetics**: Modern UI with backdrop blurs, soft shadows, and clean typography.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Tailwind CSS, Axios, React Router.
- **Backend**: FastAPI (Python), Gunicorn/Uvicorn.
- **AI Engine**: Google Gemini API.
- **Deployment**: Docker, Docker Compose, Nginx.

---

## 🚀 Quick Start (with Docker)

The easiest way to get started is using Docker Compose.

1. **Clone the repository**:
   ```bash
   git clone https://github.com/mahadir04/islamic-agent.git
   cd islamic-agent
   ```

2. **Configure Environment Variables**:
   Create a `.env` file in the root directory (or update `Backend/.env`):
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

3. **Launch the Stack**:
   ```bash
   docker-compose up --build -d
   ```

The app will be available at [http://localhost:3000](http://localhost:3000).

---

## 👨‍💻 Local Development

### Backend
```bash
cd Backend
pip install -r requirements.txt
python -m app.main
```

### Frontend
```bash
cd frontend
npm install
npm start
```

---

## 📂 Project Structure

```text
islamic-agent/
├── Backend/               # FastAPI application
│   ├── app/               # Core logic (AI, Auth, Sessions)
│   ├── Dockerfile         # Production backend image
│   └── requirements.txt   # Python dependencies
├── frontend/              # React application
│   ├── src/               # UI components and pages
│   ├── Dockerfile         # Multi-stage production image
│   └── nginx.conf         # Frontend server configuration
├── docker-compose.yml     # Master orchestration
└── README.md              # You are here
```

---

## 🛡️ Security & Privacy
This application uses zero-knowledge principles where possible. Your conversation data is stored locally in the environment and authenticated via secure Google OAuth tokens.

---

## 📉 Problem — What a Network Outage Costs Per Minute
*(Note: Placeholder for network analysis. Network outages can severely impact user accessibility and result in significant downtime costs.)*

---

## 🏗️ System Architecture
*(Placeholder for Docker Compose Diagram showing Nginx, FastAPI, React, and any integrated monitoring tools like Prometheus/Grafana).*

---

## 📡 KPI Definitions
* **RSSI**: Received Signal Strength Indicator (measures connection quality).
* **Packet Loss**: The percentage of data packets that fail to reach their destination.
* **Jitter**: The variation in the time delay between when a signal is transmitted and when it is received.

---

## ⚙️ Alert Rule Engine
Alerts are managed via a configurable rule engine. Thresholds can be defined in YAML formats to trigger notifications based on the KPIs defined above.

---

## 🖼️ Dashboard Screenshots
*(Placeholder: Insert your Grafana panels and dashboard screenshots here)*

---

## 🚀 Load Test Results
*(Placeholder: Insert throughput metrics, events/sec, and load testing analysis here)*

---

## 📜 License
Privately owned and maintained for educational and community support purposes.
