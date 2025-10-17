const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "leave",
  eventType: ["log:unsubscribe"],
  version: "3.6.0",
  credits: "𝐒𝐀𝐈𝐌⍟𝐕𝐀𝐈 | Modified by Akash",
  description: "Leave message system with gif/video/image for leave & kick (with debug)"
};

module.exports.onLoad = function () {
  const folders = [
    path.join(__dirname, "cache", "leaveGif"),
    path.join(__dirname, "cache", "kickGif")
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

    // 🪵 DEBUG START
    console.log("========== LEAVE/KICK EVENT ==========");
    console.log("Thread ID:", threadID);
    console.log("Left ID:", leftID);
    console.log("Author (who did the action):", event.author);
    console.log("--------------------------------------");
    // 🪵 DEBUG END

    // ✅ ফিক্সড কন্ডিশন
    const isLeave = (!event.author || event.author == leftID);

    console.log(isLeave ? "👉 Detected: LEAVE event" : "👉 Detected: KICK event");

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

    const leavePath = path.join(__dirname, "cache", "leaveGif");
    const kickPath = path.join(__dirname, "cache", "kickGif");
    const folderPath = isLeave ? leavePath : kickPath;

    // 🎬 ফাইল লিস্ট চেক
    const fileList = fs.readdirSync(folderPath).filter(file =>
      [".mp4", ".gif", ".jpg", ".png", ".jpeg", ".mp3"].some(ext => file.toLowerCase().endsWith(ext))
    );

    console.log("📁 Folder path:", folderPath);
    console.log("📄 Files found:", fileList);

    const selectedFile = fileList.length > 0
      ? path.join(folderPath, fileList[Math.floor(Math.random() * fileList.length)])
      : null;

    console.log("🎥 Selected file:", selectedFile ? path.basename(selectedFile) : "❌ No file found");

    let attachment = null;
    if (selectedFile && fs.existsSync(selectedFile)) {
      attachment = fs.createReadStream(selectedFile);
    }

    // পাঠানো হচ্ছে
    api.sendMessage(
      attachment ? { body: msg, attachment } : { body: msg },
      threadID,
      (err) => {
        if (err) console.error("❌ Message Send Error:", err);
        else console.log("✅ Message sent successfully!");
        console.log("======================================\n");
      }
    );

  } catch (err) {
    console.error("❌ Leave Event Error:", err);
  }
};
