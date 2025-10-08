module.exports.config = {
name: "adminUpdate",
eventType: ["log:thread-admins","log:thread-name", "log:user-nickname","log:thread-icon","log:thread-call","log:thread-color"],
version: "1.0.1",
credits: "𝗜𝘀𝗹𝗮𝗺𝗶𝗰𝗸 𝗰𝗵𝗮𝘁 𝗯𝗼𝘁",
description: "Update team information quickly",
envConfig: {
sendNoti: true,
}
};

module.exports.run = async function ({ event, api, Threads,Users }) {
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
        case "log:thread-admins": {  
            if (logMessageData.ADMIN_EVENT == "add_admin") {  
                dataThread.adminIDs.push({ id: logMessageData.TARGET_ID })  
                if (global.configModule[this.config.name].sendNoti) api.sendMessage(`»» NOTICE «« Update user ${logMessageData.TARGET_ID}  Admin Power Activate! 🧙‍♂️🔮\n অফিসিয়ালি এখন তুই VIP 😎🎩`, threadID, async (error, info) => {  
                    if (global.configModule[this.config.name].autoUnsend) {  
                        await new Promise(resolve => setTimeout(resolve, global.configModule[this.config.name].timeToUnsend * 1000));  
                        return api.unsendMessage(info.messageID);  
                    } else return;  
                });  
            }  
            else if (logMessageData.ADMIN_EVENT == "remove_admin") {  
                dataThread.adminIDs = dataThread.adminIDs.filter(item => item.id != logMessageData.TARGET_ID);  
                if (global.configModule[this.config.name].sendNoti) api.sendMessage(`»» NOTICE «« Update user ${logMessageData.TARGET_ID} বেশি চুল পাকনামি করার কারণে🥴 তোকে এডমিন থেকে\n  লাথি মেরে  বের করে দেওয়া হল 😀😂`, threadID, async (error, info) => {  
                    if (global.configModule[this.config.name].autoUnsend) {  
                        await new Promise(resolve => setTimeout(resolve, global.configModule[this.config.name].timeToUnsend * 1000));  
                        return api.unsendMessage(info.messageID);  
                    } else return;  
                });  
            }  
            break;  
        }  

        case "log:thread-icon": {  
        	let preIcon = JSON.parse(fs.readFileSync(iconPath));  
        	dataThread.threadIcon = event.logMessageData.thread_icon || "👍";  
            if (global.configModule[this.config.name].sendNoti) api.sendMessage
                if (global.configModule[this.config.name].autoUnsend) {  
                    await new Promise(resolve => setTimeout(resolve, global.configModule[this.config.name].timeToUnsend * 1000));  
                    return api.unsendMessage(info.messageID);  
                } else return;  
            });  
            break;  
        }  
        case "log:thread-call": {  
    if (logMessageData.event === "group_call_started") {  
      const name = await Users.getNameUser(logMessageData.caller_id);  
      api.sendMessage(`[ GROUP UPDATE ]\n❯ ${name} STARTED A ${(logMessageData.video) ? 'VIDEO ' : ''}CALL.`, threadID);  
    } else if (logMessageData.event === "group_call_ended") {  
      const callDuration = logMessageData.call_duration;  
      const hours = Math.floor(callDuration / 3600);  
      const minutes = Math.floor((callDuration - (hours * 3600)) / 60);  
      const seconds = callDuration - (hours * 3600) - (minutes * 60);  
      const timeFormat = `${hours}:${minutes}:${seconds}`;  
      api.sendMessage(`[ GROUP UPDATE ]\n❯ ${(logMessageData.video) ? 'Video' : ''} call has ended.\n❯ Call duration: ${timeFormat}`, threadID);  
    } else if (logMessageData.joining_user) {  
      const name = await Users.getNameUser(logMessageData.joining_user);  
      api.sendMessage(`❯❯ ${name} Joined the ${(logMessageData.group_call_type == '1') ? 'Video' : ''} call.`, threadID);  
    }  
    break;  
        }  
        case "log:thread-color": {  
        	dataThread.threadColor = event.logMessageData.thread_color || "🌤";  
            if (global.configModule[this.config.name].sendNoti) api.sendMessage(`» [ GROUP UPDATE ]\n» ${event.logMessageBody.replace("Theme", "color")}`, threadID, async (error, info) => {  
                if (global.configModule[this.config.name].autoUnsend) {  
                    await new Promise(resolve => setTimeout(resolve, global.configModule[this.config.name].timeToUnsend *
