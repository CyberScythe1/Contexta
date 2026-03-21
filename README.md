# RAG Document Chat App

This application is ready to run in "mock mode" locally even without API keys.
However, for full production functionality, you must configure the following APIs.

## Required Environment Variables / APIs

Create a `.env` file inside the `backend/` directory with the following variables:

```env
PORT=5000
DATABASE_URL=
OPENAI_API_KEY=
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

#### Option A: Google Gemini (Recommended Free Tier)
1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Create a free API Key.
3. Paste it as `GEMINI_API_KEY` in your `.env`.
4. The app will use `text-embedding-004` and `gemini-1.5-flash`.

#### Option B: Hugging Face (Open Source)
1. Go to [Hugging Face Settings](https://huggingface.co/settings/tokens).
2. Create a "Read" token.
3. Paste it as `HUGGINGFACE_API_KEY` in your `.env`.
4. The app will use `BAAI/bge-small-en-v1.5` for embeddings and `mistralai/Mistral-7B-Instruct-v0.3` for chat.

#### Option C: OpenAI (Paid)
1. Go to [OpenAI API Platform](https://platform.openai.com/api-keys).
2. Create a secret key.
3. Paste it as `OPENAI_API_KEY` in your `.env`.
4. The app will use `text-embedding-3-small` and `gpt-4o-mini`.

### 3. Google OAuth (`GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`)
**Why it's needed:** Ensures users can only log in with their Google accounts securely.
**How to get it for free:**
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new Project.
3. Navigate to **APIs & Services > Credentials**.
4. Configure the OAuth Consent Screen (Internal or External).
5. Click **Create Credentials > OAuth client ID**.
6. Select **Web application**. Add `http://localhost:5173` locally.
7. Copy the `Client ID` and `Client Secret` into the `.env` file.

### 4. JWT Secret (`JWT_SECRET`)
**Why it's needed:** Secures your user sessions.
**How to get it:**
1. You can write any long randomized string. Example: `my_super_secret_key_123456789`.

## How to Run Locally

**1. Install Dependencies**
Open two terminal windows:

Terminal 1 (Backend):
```bash
cd backend
npm install
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm install
npm run dev
```

**2. Access the Application**
Go to `http://localhost:5173`. 
If you haven't supplied the APIs yet, the app will run in a safe "mock state" allowing you to view and interact with the UI.
