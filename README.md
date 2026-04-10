# Contexta 🚀

Turn Your Documents into Intelligent Conversations. Contexta is an advanced, flexible RAG (Retrieval-Augmented Generation) application built on the PERN stack (PostgreSQL, Express, React, Node.js). It enables users to upload PDFs and Text files, organize them into focused Knowledge Bases, and interactively chat with their specific information silos using state-of-the-art LLMs.

![Contexta Hero](https://via.placeholder.com/1200x600.png?text=Contexta+Dashboard) *(Replace with actual screenshot)*

## 🌟 Key Features

*   **🗄️ Infinite Knowledge Bases:** Organize your context logically. Create multiple distinct knowledge silos to isolate your workspaces efficiently.
*   **📄 File-Specific Granularity:** Don't want to chat with everything? Select the exact files you want Contexta to analyze for highly accurate RAG generation.
*   **🤖 Pluggable AI Models:** Choose your preferred AI backend. Natively supports Google Gemini, Hugging Face, and OpenAI for both Embeddings and Chat.
*   **🔐 Secure Authentication:** Seamless Google OAuth integration to keep your data and chats private and secure. 
*   **💻 Local & Cloud Ready:** Runs fully locally for testing with a mocked UI state, or connect it to your robust APIs for a full production deployment.

## 🛠️ Technology Stack

*   **Frontend:** React (Vite), Zustand, Framer Motion, React Router DOM, Tailwind/Vanilla CSS
*   **Backend:** Node.js, Express, Multer, PDF-Parse, JSONWebToken
*   **Database:** PostgreSQL with `pgvector` extension for storing fast vector embeddings
*   **AI Integration:** Google Generative AI, Hugging Face Inference, OpenAI

---

## 🚀 Getting Started

This application is ready to run in "mock mode" locally even without API keys. However, for full production functionality, you must configure the following APIs.

### Prerequisites

Create a `.env` file inside the `backend/` directory with the following variables:

```env
PORT=5000
DATABASE_URL=
OPENAI_API_KEY=
GEMINI_API_KEY=
HUGGINGFACE_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
JWT_SECRET=super_secret_jwt_key
```

### 1. PostgreSQL with pgvector (`DATABASE_URL`)
**Why it's needed:** Stores users, documents, chats, and vector embeddings.
**How to get it for free:**
1. Go to [Neon.tech](https://neon.tech/) and create a free account.
2. Create a new project/database. Neon supports `pgvector` out of the box.
3. Copy the "Connection String" (starts with `postgresql://...`).
4. Paste it as `DATABASE_URL` in `.env`.

### 2. AI Providers (Embeddings & LLM)
**Why it's needed:** Used for creating embeddings and answering user queries. You can choose any of the following providers:

*   **Google Gemini (Recommended Free Tier):** Get a key from [Google AI Studio](https://aistudio.google.com/). The app defaults to `text-embedding-004` and `gemini-1.5-flash`. Add as `GEMINI_API_KEY`.
*   **Hugging Face (Open Source):** Get a token from [Hugging Face Settings](https://huggingface.co/settings/tokens). The app defaults to `BAAI/bge-small-en-v1.5` and `mistralai/Mistral-7B-Instruct-v0.3`. Add as `HUGGINGFACE_API_KEY`.
*   **OpenAI (Paid):** Get your key from [OpenAI API Platform](https://platform.openai.com/api-keys). The app defaults to `text-embedding-3-small` and `gpt-4o-mini`. Add as `OPENAI_API_KEY`.

### 3. Google OAuth (`GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`)
**Why it's needed:** Ensures users can only log in with their Google accounts securely.
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new Project. Navigate to **APIs & Services > Credentials**.
3. Click **Create Credentials > OAuth client ID** (Select Web application). 
4. Add `http://localhost:5173` to your Authorized redirect URIs.
5. Copy the Client ID and Client Secret to your `.env` file. Do the same in the **frontend** `.env` (as `VITE_GOOGLE_CLIENT_ID`) if required.

### 4. JWT Secret (`JWT_SECRET`)
Write any long randomized string to secure your user sessions (e.g., `my_super_secret_key_123456789`).

---

## 🏃 Running the Application

**1. Install Dependencies**

You will need to open two terminal windows.

**Backend Terminal:**
```bash
cd backend
npm install
npm run dev
```

**Frontend Terminal:**
```bash
cd frontend
npm install
npm run dev
```

**2. Access the Application**

Go to `http://localhost:5173`. 
*Note: If you haven't supplied the APIs yet, the app will run in a safe "mock state" allowing you to view and interact with the UI without errors.*

## 🤝 Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## 📝 License
This project is open-source and free to use.
