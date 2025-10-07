// bot.js (versión CommonJS con respuestas de venta)
// -----------------------------------------------
require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

/** ====== Textos comerciales (editables) ====== **/
const BRAND = 'Chatbot Multicanal (MVP)';
const VENDEDOR = 'Maximiliano San Martín';
const CIUDAD = 'Mar del Plata, Argentina';
const CONTACTO = '+54 9 223 541 8695'; // podés cambiarlo
const CATALOGO_URL = 'https://tu-sitio.com/catalogo'; // opcional

const TXT_PRESENTACION = `🤖 ${BRAND}
Automatizá atención y ventas en Telegram y chat web (sin costo mensual).
• Responde 24/7
• Muestra catálogo/servicios
• Deriva a humano cuando hace falta
• Se actualiza fácil con Google Sheets

¿Te muestro beneficios o cómo funciona?`;

const TXT_BENEFICIOS = `✨ Beneficios clave
• Respuesta inmediata 24/7
• Reducción de costos de atención
• Más ventas por tiempos de respuesta
• Se integra con tus herramientas (Sheets, CRM)
• Escalable a WhatsApp cuando quieras`;

const TXT_FUNCIONA = `⚙️ Cómo funciona
1) El cliente escribe por Telegram o chat web.
2) El bot entiende el mensaje (IA o flujo guiado).
3) Consulta tus datos (FAQ / catálogo en Sheets).
4) Responde en segundos o deriva a un agente.
Todo centralizado en un panel (Chatwoot).`;

const TXT_PLANES = `💼 Planes sugeridos
• MVP Gratuito: Telegram + Webchat + FAQ + Catálogo (sin costo)
• PyME: + WhatsApp e IA completa (USD 20–30/mes + uso)
• Premium: + CRM, reportes, IA contextual (USD 50–100/mes)

Elegimos el que mejor te encaje y lo personalizamos.`;

const TXT_CONTACTO = `📞 Contacto
${VENDEDOR}
${CIUDAD}
Tel/WhatsApp: ${CONTACTO}

¿Querés una demo en vivo o preferís ver el catálogo?
${CATALOGO_URL ? 'Catálogo: ' + CATALOGO_URL : ''}`;

/** ====== Teclado (menú) ====== **/
const mainMenu = {
  reply_markup: {
    inline_keyboard: [
      [{ text: '🎯 Presentación', callback_data: 'presentacion' }],
      [
        { text: '✨ Beneficios', callback_data: 'beneficios' },
        { text: '⚙️ Cómo funciona', callback_data: 'funciona' }
      ],
      [{ text: '💼 Planes', callback_data: 'planes' }],
      [{ text: '📞 Contacto', callback_data: 'contacto' }]
    ]
  }
};

/** ====== Helpers ====== **/
function sendMenu(chatId, text = 'Elegí una opción 👇') {
  return bot.sendMessage(chatId, text, mainMenu);
}

/** ====== /start ====== **/
bot.onText(/^\/start$/, (msg) => {
  const chatId = msg.chat.id;
  const saludo = `¡Hola! Soy tu asistente comercial.\n${TXT_PRESENTACION}`;
  bot.sendMessage(chatId, saludo, mainMenu);
});

/** ====== Comandos rápidos ====== **/
bot.onText(/^\/presentacion$/, (msg) => bot.sendMessage(msg.chat.id, TXT_PRESENTACION, mainMenu));
bot.onText(/^\/beneficios$/,   (msg) => bot.sendMessage(msg.chat.id, TXT_BENEFICIOS, mainMenu));
bot.onText(/^\/como_funciona$/, (msg) => bot.sendMessage(msg.chat.id, TXT_FUNCIONA, mainMenu));
bot.onText(/^\/planes$/,       (msg) => bot.sendMessage(msg.chat.id, TXT_PLANES, mainMenu));
bot.onText(/^\/contacto$/,     (msg) => bot.sendMessage(msg.chat.id, TXT_CONTACTO, mainMenu));

/** ====== Botones (callbacks) ====== **/
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  try {
    if (data === 'presentacion') await bot.sendMessage(chatId, TXT_PRESENTACION, mainMenu);
    if (data === 'beneficios')   await bot.sendMessage(chatId, TXT_BENEFICIOS, mainMenu);
    if (data === 'funciona')     await bot.sendMessage(chatId, TXT_FUNCIONA, mainMenu);
    if (data === 'planes')       await bot.sendMessage(chatId, TXT_PLANES, mainMenu);
    if (data === 'contacto')     await bot.sendMessage(chatId, TXT_CONTACTO, mainMenu);

    await bot.answerCallbackQuery(query.id);
  } catch (e) {
    console.error('Error en callback:', e.message);
  }
});

/** ====== Fallback de texto (si el cliente escribe libre) ====== **/
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = (msg.text || '').toLowerCase();

  // Ignorar mensajes que ya manejamos por comandos / callbacks
  if (text.startsWith('/')) return;

  if (text.includes('hola') || text.includes('buenas')) {
    return bot.sendMessage(chatId, `¡Hola! 👋\n${TXT_PRESENTACION}`, mainMenu);
  }
  if (text.includes('beneficio')) {
    return bot.sendMessage(chatId, TXT_BENEFICIOS, mainMenu);
  }
  if (text.includes('funciona') || text.includes('como funciona') || text.includes('cómo funciona')) {
    return bot.sendMessage(chatId, TXT_FUNCIONA, mainMenu);
  }
  if (text.includes('plan') || text.includes('precio') || text.includes('costo')) {
    return bot.sendMessage(chatId, TXT_PLANES, mainMenu);
  }
  if (text.includes('contacto') || text.includes('whatsapp') || text.includes('tel')) {
    return bot.sendMessage(chatId, TXT_CONTACTO, mainMenu);
  }
  if (text.includes('catalogo') || text.includes('catálogo')) {
    return bot.sendMessage(chatId, CATALOGO_URL ? `🛒 Catálogo: ${CATALOGO_URL}` : 'Aún no tengo un catálogo cargado.', mainMenu);
  }

  // Si no entendemos, ofrecemos el menú
  return sendMenu(chatId, 'No me quedó claro 🤔. Te dejo el menú para seguir:');
});

console.log('🤖 Bot comercial listo. En espera de mensajes...');
