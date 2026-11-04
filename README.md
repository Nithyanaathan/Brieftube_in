# 🎬 BriefTube

Turn long YouTube video transcripts into clear bullet-point summaries with key concepts, an action checklist, and clickable timestamps. Powered by Google Gemini.

## Features
- 4 styles: Study Notes, ELI5, Actionable Checklist, Executive Brief
- Adjustable detail level
- Ask follow-up questions about any segment
- Copy or download summaries as Markdown

## Tech Stack
React · TypeScript · Vite · Tailwind CSS · Express · Gemini API

## Run Locally
```bash
git clone https://github.com/<Nithya Nathan>/Brieftube_in.git
cd Brieftube_in
npm install
cp .env.example .env   # add your GEMINI_API_KEY
npm run dev
```
Open http://localhost:3000

## Usage
Pick a preset video or add your own YouTube link and transcript, choose a style, then click **Generate**.



