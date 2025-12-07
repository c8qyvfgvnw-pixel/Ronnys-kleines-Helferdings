# Ronny‘s kleines Helferdings 🤖

Dieser Bot läuft 100% automatisch auf **Render** und nutzt:
- Telegram
- OpenAI GPT‑4o Mini
- OpenAI Transcribe (gpt‑4o‑transcribe)

## 🚀 Start auf Render

1. Repository auf GitHub hochladen  
2. Render → New Web Service  
3. Einstellungen:
   - **Runtime:** Node  
   - **Build Command:** `npm install`  
   - **Start Command:** `npm start`  
4. Environment Variables:
   - `TELEGRAM_TOKEN=xxxx`
   - `OPENAI_API_KEY=xxxx`

Fertig! 🎉  
Der Bot läuft 24/7 und hört auf Sprachnachrichten.
