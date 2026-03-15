# 🌐 Polyglot Risk Scanner

> **AI-Powered Game Localization Platform** — Translate your game into 18+ languages simultaneously, then automatically audit every output for LQA risks before it ships.

---

## 🗺️ What Is This?

Modern game localization has two distinct pain points:

| Problem | What this tool does |
| :--- | :--- |
| **Translation is slow & expensive** | Batch-translate to all target languages in a single click using AI providers |
| **Translated text breaks the UI** | Automatically scan every output for expansion, placeholder, font & RTL risks |

This tool is purpose-built for **game localization engineers and LQA teams** who need both speed *and* safety.

---

## ✨ Part 1 — Localization Engine

The core of the tool is a **multi-provider, multi-language translation pipeline**.

### Supported AI Providers

| Provider | Type | Notes |
| :--- | :--- | :--- |
| **OpenAI** (GPT-4o, GPT-4, …) | Cloud | Best quality for nuanced game text |
| **Google Gemini** | Cloud | Fast & cost-effective |
| **DeepL** | Cloud | Excellent for European languages |
| **LM Studio** | Local | Run Llama 3, Mistral, etc. — zero API cost |
| **LongGil Studio** | Custom | Internal/on-premise endpoint |
| **Mock Provider** | Test | No API calls — great for UI development |

### Translation Modes

- **Single** — Translate the source into one specific language.
- **Batch** — Automatically translate to all 18+ supported languages at once.
- **Custom** — Pick any combination of languages and run them simultaneously.

### Supported Languages (18+)

`vi` `en` `ja` `ko` `zh-CN` `zh-TW` `fr` `de` `es` `pt-BR` `it` `ru` `ar` `th` `id` `pl` `tr` `nl`

### Input Formats

Upload or paste any **text-based localization file** — common game formats (key=value, flat JSON, custom delimiters) are all supported.

---

## 🔍 Part 2 — Risk Scanner (LQA)

After translation, every output is automatically audited for four categories of localization risk:

| Risk Category | What is checked |
| :--- | :--- |
| **Text Expansion / Contraction** | Translated text is significantly longer or shorter than the source (breaks UI layout) |
| **Missing Placeholders** | Variables like `{0}`, `%s`, `{player_name}` are absent or corrupted in the translation |
| **CJK Font Compatibility** | Chinese / Japanese / Korean characters that may not render in the game's font |
| **RTL Direction** | Arabic / Hebrew text requiring right-to-left layout support |

Risks are surfaced inline in the results table with **color-coded severity indicators** (🔴 critical / 🟡 warning) so QA can triage immediately.

---

## 📤 Export & Reporting

- **Download translated file** (`.txt`) — ready to drop into your game's localization directory.
- **Bulk archive** (`.zip`) — all languages in a single download.
- **Risk report** (`.csv`) — full audit log for QA sign-off, filterable by risk type and language.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, Vite, TypeScript, TailwindCSS |
| **Backend** | Node.js, Express, TypeScript |
| **AI Integration** | OpenAI SDK, REST (LM Studio, Google, DeepL) |
| **Containerization** | Docker, Docker Compose |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- npm or yarn
- *(Optional)* LM Studio running with a local model loaded → **Local Server** tab

### 1. Clone the repository

```bash
git clone https://github.com/LongGil/polyglot-risk-scanner.git
cd polyglot-risk-scanner
```

### 2. Frontend Setup

```bash
npm install
npm run dev
```

Frontend → `http://localhost:5173`

### 3. Backend Setup

```bash
cd server
npm install
cp .env.example .env
```

**Configure `.env`:**

```env
PORT=3001

# Cloud Translation Providers
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=...
DEEPL_API_KEY=...

# Local LLM (optional)
LM_STUDIO_URL=http://localhost:1234/v1

# Custom / On-premise (optional)
LONGGILSTUDIO_URL=...
LOCALIZATION_SECRET=...
```

```bash
npm run dev
```

Backend → `http://localhost:3001`

---

## 🐳 Docker (Full Stack)

```bash
docker-compose up --build
```

App served at `http://localhost:3001` (Express static + API in one container).

---

## 📖 Usage Guide

1. **Paste or upload** your localization source file.
2. **Choose a Translation Provider** (OpenAI, LM Studio, DeepL, …).
3. **Select Translation Mode**:
   - *Single* → one language
   - *Batch* → all 18+ languages
   - *Custom* → pick specific languages
4. **Click "Process Localization"** — translation runs in parallel.
5. **Review the Risk Scanner results** — warnings appear inline per language.
6. **Export** — download translated files or the CSV risk report.

---

## 🤝 Contributing

Pull requests are welcome. For large changes, please open an issue first to discuss what you'd like to change.

## 📄 License

MIT
