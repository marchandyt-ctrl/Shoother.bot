
require("dotenv").config();

const express = require("express");

const app = express();
app.use(express.json());

const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.PHONE_NUMBER_ID;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const API_VERSION = process.env.GRAPH_API_VERSION;

// Verify WhatsApp webhook
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  res.sendStatus(403);
});

// Send WhatsApp message
async function sendMessage(to, message) {
  const url = `https://graph.facebook.com/${API_VERSION}/${PHONE_ID}/messages`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: to,
      type: "text",
      text: {
        body: message
      }
    })
  });

  const result = await response.json();
  console.log("WhatsApp response:", result);
}

// Receive WhatsApp messages
app.post("/webhook", async (req, res) => {
  res.sendStatus(200);

  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const messages = changes?.value?.messages;

    if (!messages) return;

    for (const msg of messages) {
      if (msg.type !== "text") continue;

      const number = msg.from;
      const text = msg.text.body.trim().toLowerCase();

      let reply;

      if (["hi", "hello", "salut", "bonjou", "bonsoir"].includes(text)) {
        reply =
          "🔥 Byenveni sou SHOOTER.BOT!\n\n" +
          "Kisa ou vle fè?\n\n" +
          "1️⃣ Gade pwodwi\n" +
          "2️⃣ Pri pwodwi yo\n" +
          "3️⃣ Pase kòmand\n" +
          "4️⃣ Pale ak administratè";
      }

      else if (text === "1") {
        reply = "🛍️ Byenveni! Ki pwodwi ou ta renmen wè?";
      }

      else if (text === "2") {
        reply = "💰 Pou konnen pri yo, ekri non pwodwi ou enterese ladan l.";
      }

      else if (text === "3") {
        reply = "📦 Pou pase kòmand, voye non pwodwi a ak kantite ou bezwen.";
      }

      else if (text === "4") {
        reply = "👨‍💻 Tanpri tann administratè a kontakte ou.";
      }

      else {
        reply =
          "Mwen pa fin konprann mesaj ou a 😅\n\n" +
          "Ekri BONJOU pou wè meni SHOOTER.BOT la.";
      }

      await sendMessage(number, reply);
    }
  } catch (error) {
    console.error("Bot error:", error);
  }
});

app.get("/", (req, res) => {
  res.send("🔥 SHOOTER.BOT is running!");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`SHOOTER.BOT running on port ${PORT}`);
});
