import axios from "axios";
export async function sendWhatsAppAlert(message) {
    const url = `https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
    await axios.post(url, {
        messaging_product: "whatsapp",
        to: process.env.WHATSAPP_TO,
        type: "text",
        text: {
            body: message,
        },
    }, {
        headers: {
            Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
            "Content-Type": "application/json",
        },
    });
}
