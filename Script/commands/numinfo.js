const dipto = "https://www.noobs-api.rf.gd/dipto";
const axios = require("axios");

module.exports = {
  config: {
    name: "numinfo",
    credits: "Dipto (Fixed by Grok)",
    hasPermssion: 0,
    commandCategory: "Information",
    usages: "numinfo <number>",
    version: "1.1.0",
  },
  run: async function ({ api, event, args }) {
    // Input validation
    if (!args[0]) {
      return api.sendMessage("⚠️ দয়া করে একটি নম্বর দিন!\n\n📝 উদাহরণ: numinfo 017xxxxxxxx", event.threadID, event.messageID);
    }

    // Format number (Bangladesh format)
    let number = args[0].toString().replace(/\D/g, ''); // Remove non-digits
    if (number.startsWith("1") && number.length === 11) {
      number = "88" + number; // 01xx -> 88xx
    } else if (number.startsWith("88") && number.length === 12) {
      // Already formatted
    } else if (number.length === 10 && number.startsWith("0")) {
      number = "88" + number.slice(1); // 0xx -> 88xx
    } else {
      return api.sendMessage("❌ অবৈধ নম্বর! বাংলাদেশের মোবাইল নম্বর দিন (01xx-xxxxxxx)", event.threadID, event.messageID);
    }

    // Set loading reaction
    api.setMessageReaction("⏳", event.messageID);

    try {
      const response = await axios.get(`${dipto}/numinfo?number=${number}`, {
        timeout: 10000 // 10 second timeout
      });

      const data = response.data;
      
      if (!data || !data.info || data.info.length === 0) {
        return api.sendMessage(`❌ নম্বর ${number} এর কোনো তথ্য পাওয়া যায়নি!`, event.threadID, event.messageID);
      }

      // Format message
      let messageBody = `📱 *নম্বর তথ্য*\n\n`;
      messageBody += `📞 *নম্বর:* ${number}\n\n`;
      
      data.info.forEach((info, index) => {
        messageBody += `👤 *${index + 1}.* ${info.name || "তথ্য নেই"}\n`;
        messageBody += `📋 *টাইপ:* ${info.type || "তথ্য নেই"}\n`;
        messageBody += `────────────────\n`;
      });

      let msg = { body: messageBody };

      // Add image if available
      if (data.image && data.image !== "") {
        try {
          const imageResponse = await axios.get(data.image, { 
            responseType: "stream", 
            timeout: 8000 
          });
          msg.attachment = [imageResponse.data];
        } catch (imgError) {
          console.log("Image load failed:", imgError.message);
          // Continue without image
        }
      }

      api.setMessageReaction("✅", event.messageID);
      return api.sendMessage(msg, event.threadID, event.messageID);

    } catch (error) {
      api.setMessageReaction("❌", event.messageID);
      
      let errorMsg = "❌ *ত্রুটি ঘটেছে!*\n\n";
      
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        errorMsg += "⏰ সার্ভার ধীরগতির। দয়া করে পরে চেষ্টা করুন!";
      } else if (error.response?.status === 500) {
        errorMsg += "🔧 API সার্ভারে সমস্যা (500 Error)";
      } else if (error.response?.status === 404) {
        errorMsg += "📝 এই API endpoint খুঁজে পাওয়া যায়নি!";
      } else if (error.response?.status === 429) {
        errorMsg += "🚫 অনেক বেশি রিকোয়েস্ট! কিছুক্ষণ পর চেষ্টা করুন।";
      } else {
        errorMsg += `💡 ${error.message}`;
      }

      api.sendMessage(errorMsg, event.threadID, event.messageID);
      console.error("Numinfo Error:", error);
    }
  }
};
