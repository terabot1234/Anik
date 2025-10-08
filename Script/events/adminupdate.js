module.exports.config = {
  name: "adminUpdate",
  eventType: ["log:thread-admins", "log:thread-name", "log:user-nickname", "log:thread-icon", "log:thread-color"],
  version: "1.0.1",
  credits: "𝗜𝘀𝗹𝗮𝗺𝗶𝗰𝗸 𝗰𝗵𝗮𝘁 𝗯𝗼𝘁 (Modified by Akash)",
  description: "Update team information quickly (no call notifications)",
  envConfig: {
    sendNoti: true,
  },
};

module.exports.run = async function ({ event, api, Threads, Users }) {
  const fs = require("fs");
  var iconPath = __dirname + "/emoji.json";
  if (!fs.existsSync(iconPath)) fs.writeFileSync(iconPath, JSON.stringify({}));
  const { threadID, logMessageType, logMessageData } = event;
  const { setData, getData } = Threads;

  const thread = global.data.threadData.get(threadID) || {};
  if (typeof thread["adminUpdate"] != "undefined" && thread["adminUpdate"] == false) return;

  try {
    let dataThread = (await getData(threadID)).threadInfo;
    switch (logMessageType) {

      // ─── Admin Add/Remove ─────────────────────────────
      case "log:thread-admins": {
        if (logMessageData.ADMIN_EVENT == "add_admin") {
          dataThread.adminIDs.push({ id: logMessageData.TARGET_ID });
          if (global.configModule[this.config.name].sendNoti)
            api.sendMessage(
              `»» NOTICE ««\nUpdate user ${logMessageData.TARGET_ID}\n🧙‍♂️ এখন সে অফিসিয়ালি VIP 🎩`,
              threadID
            );
        } else if (logMessageData.ADMIN_EVENT == "remove_admin") {
          dataThread.adminIDs = dataThread.adminIDs.filter(item => item.id != logMessageData.TARGET_ID);
          if (global.configModule[this.config.name].sendNoti)
            api.sendMessage(
              `»» NOTICE ««\nUpdate user ${logMessageData.TARGET_ID}\nতোকে এডমিন থেকে সরানো হয়েছে 😂`,
              threadID
            );
        }
        break;
      }

      // ─── Group Icon Change ─────────────────────────────
      case "log:thread-icon": {
        let preIcon = JSON.parse(fs.readFileSync(iconPath));
        dataThread.threadIcon = event.logMessageData.thread_icon || "👍";
        if (global.configModule[this.config.name].sendNoti)
          api.sendMessage(
            `» [ GROUP UPDATE ]\n» Icon changed from ${preIcon[threadID] || "unknown"} to ${dataThread.threadIcon}`,
            threadID,
            async (error, info) => {
              preIcon[threadID] = dataThread.threadIcon;
              fs.writeFileSync(iconPath, JSON.stringify(preIcon));
            }
          );
        break;
      }

      // ─── Group Color Change ─────────────────────────────
      case "log:thread-color": {
        dataThread.threadColor = event.logMessageData.thread_color || "🌤";
        if (global.configModule[this.config.name].sendNoti)
          api.sendMessage(
            `» [ GROUP UPDATE ]\n» ${event.logMessageBody.replace("Theme", "color")}`,
            threadID
          );
        break;
      }

      // ─── (No Call Notifications — removed) ─────────────────────────────
    }
  } catch (err) {
    console.log("Error in adminUpdate.js:", err);
  }
};
