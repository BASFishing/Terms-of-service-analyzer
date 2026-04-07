# Privacy Rights Analyzer

A self-hosted web app that reads a Terms of Service or Privacy Policy document and tells you, in plain English, what it means for your privacy rights — mapped against GDPR (EU) or CCPA (California) law.

---

## What It Does

Upload or paste any Terms of Service or Privacy Policy. The app will:

1. **Extract the text** from your document (PDF, Word, Markdown, or plain text)
2. **Identify relevant clauses** — finding every section that relates to your privacy rights
3. **Explain each right in plain language** — what the company says, what's missing, and how confident the analysis is
4. **Flag gaps** — rights that the document doesn't address at all

Each right gets a **confidence badge**:
- 🟢 **Full** — clearly and directly addressed
- 🟡 **Partial** — mentioned but vague or incomplete
- 🔴 **Low** — not addressed, or only tangentially

Supported jurisdictions:
- **GDPR** — EU General Data Protection Regulation (11 rights, all chapters)
- **CCPA** — California Consumer Privacy Act as amended by CPRA 2023 (11 rights)

---

## How It Works

The analysis runs in two stages using the OpenAI GPT-4o model:

**Stage 1 — Clause Mapping**
The app reads your document and finds every sentence or paragraph that relates to each privacy right. It knows which GDPR articles to look for (Articles 5–7, 12–23, 24–30, 44–50) and which CCPA sections apply.

**Stage 2 — Plain Language Enrichment**
For each right, the app compares what the document says against the actual law, writes a plain-language explanation, identifies gaps, and assigns a confidence score.

A disclaimer is always shown on results: this tool provides general information only and is not legal advice.

---

## Deploying Your Own Copy

You do not need any technical background to deploy this app. Follow the steps below.

### What You'll Need

- A free account on [Vercel](https://vercel.com) (the hosting platform)
- A free account on [GitHub](https://github.com) (where the code lives)
- An OpenAI API key (you pay OpenAI directly for usage — a typical analysis costs a few cents)

---

### Step 1 — Get an OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com) and sign in or create an account
2. Click your profile icon → **API keys**
3. Click **Create new secret key**, give it a name (e.g. "Privacy Analyzer"), and copy the key
4. **Save this key somewhere safe** — you will only see it once

---

### Step 2 — Fork the Repository

1. Go to the GitHub repository for this project
2. Click the **Fork** button in the top right
3. This creates your own copy of the code under your GitHub account

---

### Step 3 — Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with your GitHub account
2. Click **Add New → Project**
3. Find your forked repository and click **Import**
4. Under **Root Directory**, type `privacy-translator` and click **Continue**
5. Click **Deploy** — Vercel will build the app (takes about 1–2 minutes)

---

### Step 4 — Add Your API Key

This is the most important step. Without it, the app will not run.

1. In Vercel, open your project and go to **Settings → Environment Variables**
2. Click **Add New**
3. Set the name to exactly:
   ```
   OPENAI_API_KEY
   ```
4. Paste your OpenAI API key as the value
5. Make sure **Production**, **Preview**, and **Development** are all checked
6. Click **Save**

**To update your API key in the future:** go back to the same place — Vercel → Settings → Environment Variables — find `OPENAI_API_KEY`, click the three dots next to it, and choose **Edit**.

---

### Step 5 — Redeploy

After saving the environment variable:

1. Go to the **Deployments** tab in Vercel
2. Click the three dots on the most recent deployment
3. Click **Redeploy**

Your app is now live. Vercel will show you the URL (e.g. `your-project.vercel.app`).

---

## Running Locally (Optional)

If you want to run the app on your own computer before deploying:

1. Install [Node.js](https://nodejs.org) (LTS version)
2. Open a terminal and navigate to the `privacy-translator` folder
3. Run:
   ```bash
   npm install
   ```
4. Create a file called `.env.local` in the `privacy-translator` folder with:
   ```
   OPENAI_API_KEY=your_key_here
   ```
5. Run:
   ```bash
   npm run dev
   ```
6. Open [http://localhost:3000](http://localhost:3000) in your browser

---

## Usage Limits

The app is set to allow **10 analyses per hour** to protect against unexpected API costs. If you hit the limit, wait an hour and try again.

To change the limit, open `privacy-translator/lib/rateLimiter.ts` and update the number on this line:

```ts
const MAX_REQUESTS_PER_HOUR = 10;
```

---

## File Formats Supported

| Format | Extension |
|--------|-----------|
| PDF | `.pdf` |
| Word Document | `.docx` |
| Markdown | `.md` |
| Plain Text | `.txt` |
| Paste directly | — |

---

## Disclaimer

This tool provides general information only and does not constitute legal advice. The analysis is AI-generated and may not be complete or accurate. Consult a qualified attorney for advice specific to your situation. Rights and protections vary by jurisdiction and individual circumstances.
