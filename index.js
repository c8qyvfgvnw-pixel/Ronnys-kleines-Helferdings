import 'dotenv/config';
import TelegramBot from 'node-telegram-bot-api';
import OpenAI from 'openai';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

// ENV Variablen
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

console.log("🤖 Ronny‘s kleines Helferdings ist gestartet…");

// Temp-Datei für Voice
const TEMP_FILE = "./voice.ogg";

// Sprachnachrichten
bot.on("voice", async (msg) => {
    const chatId = msg.chat.id;

    try {
        const file = await bot.getFile(msg.voice.file_id);
        const fileUrl = `https://api.telegram.org/file/bot${TELEGRAM_TOKEN}/${file.file_path}`;

        // Datei herunterladen
        const response = await axios.get(fileUrl, { responseType: "arraybuffer" });
        fs.writeFileSync(TEMP_FILE, response.data);

        console.log("📥 Voice gespeichert, transkribiere…");

        // Whisper nutzen (gpt-4o-transcribe)
        const transcript = await openai.audio.transcriptions.create({
            file: fs.createReadStream(TEMP_FILE),
            model: "gpt-4o-transcribe"
        });

        console.log("🎙️ Nutzer sagte:", transcript.text);

        // GPT Antwort erzeugen
        const ai = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "Du bist Ronnys kleiner Helfer. Antworte freundlich und klar." },
                { role: "user", content: transcript.text }
            ]
        });

        const reply = ai.choices[0].message.content;

        await bot.sendMessage(chatId, reply);

        // Datei löschen
        fs.unlinkSync(TEMP_FILE);

    } catch (err) {
        console.error("❌ Fehler:", err);
        bot.sendMessage(chatId, "Ohje… da lief etwas schief 😬");
    }
});

// Normale Nachrichten ignorieren
bot.on("message", (msg) => {
    if (!msg.voice) return;
});
