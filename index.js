import 'dotenv/config';
import TelegramBot from 'node-telegram-bot-api';
import OpenAI from 'openai';

// Lade Umgebungsvariablen
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Bot läuft
console.log("🤖 Ronny‘s kleines Helferdings läuft…");

// Wenn Sprachnachricht kommt
bot.on('voice', async (msg) => {
    const chatId = msg.chat.id;

    try {
        const file = await bot.getFile(msg.voice.file_id);
        const fileUrl = `https://api.telegram.org/file/bot${TELEGRAM_TOKEN}/${file.file_path}`;

        // Sprachnachricht transkribieren
        const transcript = await openai.audio.transcriptions.create({
            file_url: fileUrl,
            model: "gpt-4o-transcribe"
        });

        console.log("🎙️ Nutzer sagte:", transcript.text);

        // Antwort generieren
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "Du bist Ronnys kleiner Helfer. Antworte immer freundlich und klar." },
                { role: "user", content: transcript.text }
            ]
        });

        const replyText = response.choices[0].message.content;
        console.log("🤖 Antwort:", replyText);

        // Antwort senden
        await bot.sendMessage(chatId, replyText);

    } catch (err) {
        console.error("❌ Fehler:", err);
        bot.sendMessage(chatId, "Fehler bei der Verarbeitung deiner Nachricht.");
    }
});

// Fallback Text
bot.on("message", (msg) => {
    if (!msg.voice) {
        bot.sendMessage(msg.chat.id, "Bitte sende mir eine *Sprachnachricht* 🎤");
    }
});
