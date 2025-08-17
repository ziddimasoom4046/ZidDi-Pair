const { makeid } = require('./gen-id');
const express = require('express');
const QRCode = require('qrcode');
const fs = require('fs');
let router = express.Router();
const pino = require("pino");
const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers,
    jidNormalizedUser
} = require("@whiskeysockets/baileys");
const { upload } = require('./mega');
function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}
router.get('/', async (req, res) => {
    const id = makeid();

    async function UMAR_SESSION() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);

        try {
            const sock = makeWASocket({
                auth: state,
                printQRInTerminal: false,
                logger: pino({ level: "silent" }),
                browser: Browsers.macOS("Desktop"),
            });

            sock.ev.on('creds.update', saveCreds);

            sock.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect, qr } = s;

                if (qr && !res.headersSent) {
                    const Jimp = require('jimp');
                    const qrBuffer = await QRCode.toBuffer(qr, { errorCorrectionLevel: 'H', width: 400 });
                    const qrImage = await Jimp.read(qrBuffer);
                    const logo = await Jimp.read(__dirname + '/assets/logo.png');
                    logo.resize(80, 80);
                    qrImage.composite(logo, (qrImage.bitmap.width / 2) - 40, (qrImage.bitmap.height / 2) - 40);
                    const finalBuffer = await qrImage.getBufferAsync(Jimp.MIME_PNG);

                    res.setHeader('Content-Type', 'image/png');
                    return res.end(finalBuffer);
                }

                if (connection === "open") {
                    await delay(5000);

                    try {
                        const rf = __dirname + `/temp/${id}/creds.json`;
                        const data = fs.readFileSync(rf);
                        const mega_url = await upload(fs.createReadStream(rf), `${sock.user.id}.json`);
                        const string_session = mega_url.replace('https://mega.nz/file/', '');
                        const md = "UMAR-PRIVATE~" + string_session;

                        const code = await sock.sendMessage(sock.user.id, { text: md });

                        const desc = `*┏━━━━━━━━━━━━━━*\n*┃ZIDDI-PRIVATE SESSION IS*\n*┃SUCCESSFULLY*\n*┃CONNECTED ✅🔥*\n*┗━━━━━━━━━━━━━━━*\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n*❶ || Creator = ZIDDI ZM*\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n*❷ || WhatsApp Channel =* https://whatsapp.com/channel/0029VbApoI6LdQeg7Vzcdy3S\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n*❸ || Owner =* admin@cravo.live\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n*❹ || Repo =* https://github.com/Um4r719/UMAR-PRIVATE\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n*❺ || insta =* https://instagram.com/masoom446\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n*Developement By Cravo Tech*`;

                        await sock.sendMessage(sock.user.id, {
                            text: desc,
                            contextInfo: {
                                externalAdReply: {
                                    title: "UMAR DEV",
                                    thumbnailUrl: "https://ibb.co/d0mShM55",
                                    sourceUrl: "https://whatsapp.com/channel/0029VbApoI6LdQeg7Vzcdy3S",
                                    mediaType: 1,
                                    renderLargerThumbnail: true
                                }
                            }
                        }, { quoted: code });

                    } catch (e) {
                        const ddd = await sock.sendMessage(sock.user.id, { text: e.message });
                        await sock.sendMessage(sock.user.id, {
                            text: desc,
                            contextInfo: {
                                externalAdReply: {
                                    title: "UMAR DEV",
                                    thumbnailUrl: "https://ibb.co/d0mShM55",
                                    sourceUrl: "https://whatsapp.com/channel/0029VbApoI6LdQeg7Vzcdy3S",
                                    mediaType: 2,
                                    renderLargerThumbnail: true,
                                    showAdAttribution: true
                                }
                            }
                        }, { quoted: ddd });
                    }

                    await delay(10);
                    await sock.ws.close();
                    await removeFile('./temp/' + id);
                    console.log(`👤 ${sock.user.id} Connected ✅ Restarting...`);
                    await delay(10);
                    process.exit();
                }

                else if (connection === "close" && lastDisconnect?.error?.output?.statusCode != 401) {
                    await delay(10);
                    UMAR_SESSION();
                }
            });
        } catch (err) {
            console.log("service restarted due to error");
            await removeFile('./temp/' + id);
            if (!res.headersSent) {
                res.send({ code: "❗ Service Unavailable" });
            }
        }
    }

    await UMAR_SESSION();
});

setInterval(() => {
    console.log("☘️ 𝗥𝗲𝘀𝘁𝗮𝗿𝘁𝗶𝗻𝗴 𝗽𝗿𝗼𝗰𝗲𝘀𝘀...");
    process.exit();
}, 180000); //30min
module.exports = router;