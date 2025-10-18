const dipto = "https://www.noobs-api.rf.gd/dipto";
const axios = require("axios");

module.exports = {
  config: {
    name: "numinfo",
    credits: "Dipto",
    hasPermssion: 0,
    commandCategory: "Information",
    usages: "numinfo <number>",
    version: "1.0.1",
  },
  run: async function ({ api, event, args }) {
    if (!args[0]) return api.sendMessage("⚠️ দয়া করে একটি নম্বর দিন!", event.threadID, event.messageID);

    let number = args[0]?.startsWith("01") ? "88" + args[0] : args[0];
    api.setMessageReaction("⌛", event.messageID, () => {}, true);

    try {
      let { data } = await axios.get(`${dipto}/numinfo?number=${number}`);
      if (!data || !data.info) throw new Error("কোনো তথ্য পাওয়া যায়নি!");

      let msg = {
        body: data.info.map(i => `Name: ${i.name || "Not found"} \nType: ${i.type || "Not found"}`).join("\n"),
      };
      if (data.image) {
        msg.attachment = (await axios.get(data.image, { responseType: "stream" })).data;
      }
      api.sendMessage(msg, event.threadID, event.messageID);
    } catch (e) {
      let errorMsg = "❌ ত্রুটি: ";
      if (e.response?.status === 500) {
        errorMsg += "API সার্ভারে সমস্যা হয়েছে (Status 500). দয়া করে পরে চেষ্টা করুন!";
      } else if (e.message.includes("timeout")) {
        errorMsg += "সার্ভারের সাথে সংযোগ বিচ্ছিন্ন হয়েছে।";
      } else {
        errorMsg += `কোনো ত্রুটি হয়েছে: ${e.message}`;
      }
      api.sendMessage(errorMsg, event.threadID, event.messageID);
      console.log(e);
    }
  },
};
