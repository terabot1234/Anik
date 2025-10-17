const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "leave",
  eventType: ["log:unsubscribe"],
  version: "3.8.0",
  credits: "𝐒𝐀𝐈𝐌⍟𝐕𝐀𝐈 | Modified by Akash",
  description: "Leave & Kick message system with gif/video/image support"
};

module.exports.onLoad = function () {
  const folders = [
    path.join(__dirname, "cache", "leaveGif"),
    path.join(__dirname, "cache", "KickGif") // ✅ বড় হাতের K
  ];
  for (const folder of folders) {
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
  }
};

module.exports.run = async function ({ api, event, Users, Threads }) {
  try {
    const { threadID } = event;
    const leftID = event.logMessageData?.leftParticipantFbId || event.logMessageData?.participant_id;
    if (!leftID) return;
    if (leftID == api.getCurrentUserID()) return; // বট নিজে গেলে কিছু না পাঠাবে

    const threadData = global.data.threadData.get(parseInt(threadID)) || (await Threads.getData(threadID)).data;
    const userName = global.data.userName.get(leftID) || await Users.getNameUser(leftID);

    // 🔎 কিক না লিভ সেটা ডিটেক্ট করা
    const isKick = event.author && event.author !== leftID;
    const isLeave = !isKick;

    console.log("========== LEAVE/KICK EVENT ==========");
    console.log("👤 User:", userName);
    console.log("📤 LeftID:", leftID);
    console.log("🦵 Author:", event.author);
    console.log(isKick ? "👉 Detected: KICK event" : "👉 Detected: LEAVE event");
    console.log("======================================");

    const typeText = isLeave
      ? "তুই নিজেই গ্রুপ থেকে লিভ নিলি 😤 আবার আইসিস না! 🚫"
      : "তোমাকে গ্রুপ থেকে লাথি মেরে বের করে দেওয়া হলো 🤣🚪";

    let msg = (typeof threadData.customLeave == "undefined")
      ? `━━━━━━━━━━━━━━━━━━━━━
😢 {name} {type}
━━━━━━━━━━━━━━━━━━━━━
ভালো থাকিস... কিন্তু গ্রুপের মজা মিস করবি 😉
✦─────꯭─⃝‌‌☞︎︎︎𝐒𝐀𝐈𝐌 𝐕𝐀𝐈☜︎︎𝐂𝐇𝐀𝐓 𝐁𝐎𝐓────✦`
      : threadData.customLeave;

    msg = msg.replace(/\{name}/g, userName).replace(/\{type}/g, typeText);

    // ✅ বড় হাতের K অনুযায়ী পথ ঠিক করা
    const folderPath = isKick
      ? path.join(__dirname, "cache", "KickGif")
      : path.join(__dirname, "cache", "leaveGif");

    const fileList = fs.readdirSync(folderPath).filter(file =>
      [".mp4", ".gif", ".jpg", ".png", ".jpeg", ".mp3"].some(ext => file.toLowerCase().endsWith(ext))
    );

    const selectedFile = fileList.length > 0
      ? path.join(folderPath, fileList[Math.floor(Math.random() * fileList.length)])
      : null;

    console.log("📁 Folder path:", folderPath);
    console.log("🎥 Selected file:", selectedFile ? path.basename(selectedFile) : "❌ No file found");

    let attachment = null;
    if (selectedFile && fs.existsSync(selectedFile)) {
      attachment = fs.createReadStream(selectedFile);
    }

    api.sendMessage(
      attachment ? { body: msg, attachment } : { body: msg },
      threadID,
      (err) => {
        if (err) console.error("❌ Message Send Error:", err);
        else console.log("✅ Message sent successfully!\n");
      }
    );

  } catch (err) {
    console.error("❌ Leave Event Error:", err);
  }
};
