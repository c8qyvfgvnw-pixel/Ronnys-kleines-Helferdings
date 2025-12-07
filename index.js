import 'dotenv/config';
import TelegramBot from 'node-telegram-bot-api';
import OpenAI from 'openai';
import axios from "axios";
import fs from "fs";
import express from "express";

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

console.log("🤖 Ronny‘s kleines Helferdings startet...");

// -----------------------------------------
// 📌 Voice Handler
// -----------------------------------------
bot.on("voice", async (msg) => {
    const chatId = msg.chat.id;

    try {
        // Datei von Telegram holen
        const fileInfo = await bot.getFile(msg.voice.file_id);
        const fileUrl = `https://api.telegram.org/file/bot${TELEGRAM_TOKEN}/${fileInfo.file_path}`;

        // Datei herunterladen
        const oggBuffer = await axios.get(fileUrl, { responseType: "arraybuffer" });
        fs.writeFileSync("voice.ogg", oggBuffer.data);

        // 💬 OpenAI Transcribe (korrekter Call!)
        const transcript = await openai.audio.transcriptions.create({
            file: fs.createReadStream("voice.ogg"),
            model: "gpt-4o-transcribe"
        });

        console.log("🎙️ User sagte:", transcript.text);

        // 🧠 OpenAI Chat Completion
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "Du bist Ronnys kleiner Helfer. Antworte immer freundlich und klar." },
                { role: "user", content: transcript.text }
            ]
        });

        const reply = response.choices[0].message.content;
        await bot.sendMessage(chatId, reply);

    } catch (err) {
        console.error("❌ Fehler:", err.message);
        bot.sendMessage(chatId, "⚠️ Fehler beim Verarbeiten deiner Nachricht.");
    }
});

// -----------------------------------------
// 📌 Text-Handler
// -----------------------------------------
bot.on("message", (msg) => {
    if (!msg.voice) {
        bot.sendMessage(msg.chat.id, "Bitte schick mir eine 🎤 *Sprachnachricht*!");
    }
});

// -----------------------------------------
// 📌 Render braucht einen Webserver
// -----------------------------------------
const app = express();

app.get("/", (req, res) => {
    res.send("Ronny‘s Helferdings läuft ✔️");
});

app.listen(process.env.PORT || 3000, () =>
    console.log("🌐 Webserver läuft")
);
