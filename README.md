<p align="center">
  <img src="frontend/public/git_logo.png" alt="SubPilot Logo" width="600"/>
</p>

**A modern platform for managing subscriptions, renewals and cancellation workflows.**

SubPilot is a full-stack web application for managing subscriptions and recurring contracts.
It helps users track spending, monitor renewal deadlines, organize cancellation workflows, receive reminder notifications via email or Telegram, and generate AI-assisted cancellation drafts.

---

## ✨ Features

### 📊 Core Functionality
- Track subscriptions and contracts in a unified dashboard
- Monitor recurring costs and billing cycles
- Stay ahead of renewal dates and cancellation deadlines
- Visualize spending with analytics and category breakdowns

### 🧠 Smart Workflows
- Generate professional cancellation drafts with AI assistance
- Structured contract insight system for renewals, deadlines and optimization reviews
- Privacy-first architecture with backend-controlled sensitive data handling

### ⚡ Productivity
- Send-ready cancellation email workflows
- Activity tracking for all contract changes
- Structured workflow from tracking → decision → cancellation

### 🔔 Notifications & Reminders
- Automated renewal and cancellation reminders
- Email-based contract notifications
- Telegram reminder integration
- Deadline-aware contract tracking

---

## 🔐 Privacy-First Architecture

SubPilot is designed with a strong focus on data privacy:

- AI generates neutral templates without personal data
- Sensitive information is handled separately in the backend
- Users review and approve all actions before sending

---

## 🧠 Planned Features

- Inbox-based subscription detection (opt-in)
- Budget tracking and alerts
- Multi-language contract workflows

---

## 🏗️ Tech Stack

### Backend
- **Python**
- **FastAPI**
- **SQLAlchemy**
- **SQLite** (development)
- REST API architecture

### Frontend
- **React + TypeScript**
- **Vite**
- **TailwindCSS**
- **Framer Motion**

### AI Integration
- AI-assisted cancellation draft generation
- Structured prompt workflows
- Privacy-first AI architecture
- Backend-controlled handling of sensitive customer data

---

## 🏛️ Architecture Highlights

- Modular FastAPI backend architecture
- SQLAlchemy ORM-based data layer
- Contract lifecycle tracking and reminder workflows
- Persistent contract insight system
- Privacy-first AI integration design
- Structured notification system with Email & Telegram support

---

## 📸 Preview

<p align="center">
  <img src="frontend/public/screenshot_ui_1.png" width="700"/>
</p>

<p align="center">
  <img src="frontend/public/screenshot_ui_2.png" width="700"/>
</p>

<p align="center">
  <img src="frontend/public/screenshot_ui_3.png" width="700"/>
</p>

<p align="center">
  <img src="frontend/public/screenshot_ui_4.png" width="700"/>
</p>

---

## ⚙️ Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/ilyassuelen/subpilot-ai.git
cd subpilot-ai
```

### 2. Backend setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 3. Frontend setup
```bash
cd frontend
npm install
npm run dev
```

## 🌐 Project Structure
```plaintext
subpilot-ai/
│
├── app/
│   ├── core/                # Database, configuration and application setup
│   ├── models/              # SQLAlchemy database models
│   ├── routers/             # FastAPI API route handlers
│   ├── schemas/             # Pydantic request/response schemas
│   ├── services/            # Business logic and workflows
│   │   ├── ai/              # AI-assisted cancellation workflows
│   │   ├── notifications/   # Email and Telegram notification services
│   │   └── savings/         # Contract insights and optimization logic
│   └── main.py              # FastAPI application entrypoint
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/      # Reusable React UI components
│       │   ├── contracts/
│       │   ├── dashboard/
│       │   ├── landing/
│       │   ├── reminders/
│       │   └── ui/
│       ├── hooks/
│       ├── lib/
│       └── routes/
│
├── .env                     # Environment configuration
├── .gitignore
├── README.md
├── requirements.txt
└── subpilot.db              # Local SQLite development database
```

## 🎯 Vision
SubPilot aims to become a modern contract operations platform for consumers.

The goal is to help users:

- stay ahead of renewals and cancellation windows
- reduce organizational overhead around subscriptions
- centralize recurring contracts in one place
- simplify cancellation workflows
- make better contract decisions through structured insights

SubPilot combines automation, analytics and AI-assisted workflows with a strong privacy-first architecture.

## 👨‍💻 Author
Ilyas Sülen
- GitHub: https://github.com/ilyassuelen
- LinkedIn: https://www.linkedin.com/in/ilyas-suelen/

## 📄 License
This project is licensed under the MIT License.