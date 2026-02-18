# 🌐 Polyglot Risk Scanner

A specialized **Game Localization Risk Scanner & Toolset** designed for game developers and LQA teams. It streamlines the localization process by analyzing game text files for critical risks—such as UI text expansion, missing variable placeholders (e.g., `{0}`, `%s`), and CJK font compatibility issues. Supports **Simultaneous Multi-Language Translation** via AI providers like **OpenAI**, **Google Translate**, **DeepL**, and local LLMs via **LM Studio**.

## ✨ Features

- **📂 Game Text Parsing**: Upload and parse custom text-based localization files (supports common game formats).
- **🔍 LQA Risk Detection**: Automatically scans for potential localization issues:
  - Text expansion/contraction risks
  - Missing placeholders
  - CJK font compatibility issues
  - RTL (Right-to-Left) text direction checks
- **🤖 Multi-Provider AI Translation**:
  - **OpenAI** (GPT-4/3.5)
  - **Google Translate**
  - **DeepL**
  - **LM Studio** (Run local LLMs like Llama 3, Mistral, etc.)
  - **Mock Provider** (For testing without API costs)
- **⚡ Batch & Custom Translation**:
  - **Single Mode**: Translate to one specific language.
  - **Batch Mode**: Automatically translate to all 18+ supported languages at once.
  - **Custom Mode**: Select specific languages to translate simultaneously.
- **� Export Reports**:
  - Download valid localization files (`.txt`).
  - Bulk download as `.zip` archive.
  - Export detailed risk reports as `.csv`.

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, Vite, TypeScript, TailwindCSS |
| **Backend** | Node.js, Express, TypeScript |
| **AI Integration** | OpenAI SDK, REST (LM Studio, Google, DeepL) |
| **Containerization** | Docker, Docker Compose |

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- npm or yarn

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/polyglot-risk-scanner.git
cd polyglot-risk-scanner
```

### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```
The frontend will be available at `http://localhost:5173`.

### 3. Backend Setup

The backend handles the API requests to translation providers.

```bash
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

**Configure your `.env` file:**
```env
PORT=3001

# AI / Translation Providers (Add keys as needed)
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=...
DEEPL_API_KEY=...

# Local LLM (Optional)
LM_STUDIO_URL=http://localhost:1234/v1
```

```bash
# Run backend development server
npm run dev
```
The backend will run on `http://localhost:3001`.

## 🐳 Docker Setup

You can run the entire stack (Frontend + Backend) using Docker Compose.

```bash
# Build and start services
docker-compose up --build
```
- App: `http://localhost:3001` (Served via Express static files in production mode)

## 📖 Usage Guide

1. **Select Source**: Paste your localization text or upload a file.
2. **Configure Translation**:
   - Choose a **Translation Service** (e.g., OpenAI, LM Studio).
   - Select **Target Language(s)**:
     - *Single*: One language.
     - *Custom*: Check multiple languages.
     - *All*: Full batch translation.
3. **Process**: Click "Process Localization".
4. **Review Risks**: Check the results table for warnings (red/yellow indicators).
5. **Export**: Download the translated files or the risk report.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT
