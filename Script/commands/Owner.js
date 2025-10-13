const request = require("request");
const fs = require("fs-extra");
module.exports.config = {
  name: "owner",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "𝐂𝐀𝐏𝐓𝐈𝐍☃︎𝐑𝐀𝐁𝐁𝐈♲︎︎︎𝐕𝐀𝐈",
  description: "Show Owner Info with styled box & random photo",
  commandCategory: "Information",
  usages: "owner",
  cooldowns: 2
};
module.exports.run = async function ({ api, event }) {
  
  const info = `
╔═════════════════════ ✿
║ ✨ 𝗢𝗪𝗡𝗘𝗥 𝗜𝗡𝗙𝗢 ✨
╠═════════════════════ ✿
║ 👑 𝗡𝗮𝗺𝗲 : 𝐂𝐀𝐏𝐓𝐈𝐍☃︎𝐑𝐀𝐁𝐁𝐈♲︎︎︎𝐕𝐀𝐈
║ 🧸 𝗡𝗶𝗰𝗸 𝗡𝗮𝗺𝗲 : 𝐑𝐀𝐁𝐁𝐈
║ 🎂 𝗔𝗴𝗲 : 19+
║ 💘 𝗥𝗲𝗹𝗮𝘁𝗶𝗼𝗻 : 𝗦𝗶𝗻𝗴𝗹𝗲
║ 🎓 𝗣𝗿𝗼𝗳𝗲𝘀𝘀𝗶𝗼𝗻 : 🖕🖕
║ 📚 𝗘𝗱𝘂𝗰𝗮𝘁𝗶𝗼𝗻 : 🖕🖕
║ 🏡 𝗔𝗱𝗱𝗿𝗲𝘀𝘀 : kataliya 
╠═════════════════════ ✿
║ 🔗 𝗖𝗢𝗡𝗧𝗔𝗖𝗧 𝗟𝗜𝗡𝗞𝗦
╠═════════════════════ ✿
║ 📘 𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸 :
║ fb.com/61564002689411
║ 💬 𝗠𝗲𝘀𝘀𝗲𝗻𝗴𝗲𝗿 :
║ m.me/61564002689411
║ 📞 𝗪𝗵𝗮𝘁𝘀𝗔𝗽𝗽 :
║ wa.me/01795486467
║ ✈️ 𝗧𝗲𝗹𝗲𝗴𝗿𝗮𝗺 :
║https://t.me/RKrabbivai
╚═════════════════════ ✿
`;
  const images = [
    "https://i.imgur.com/uGhfdDy.jpeg",
    "https://i.imgur.com/uGhfdDy.jpeg",
    "https://i.imgur.com/uGhfdDy.jpeg",
    "https://i.imgur.com/uGhfdDy.jpeg"
  ];
  const randomImg = images[Math.floor(Math.random() * images.length)];
  const callback = () => api.sendMessage(
    {
      body: info,
      attachment: fs.createReadStream(__dirname + "/cache/owner.jpg")
    },
    event.threadID,
    () => fs.unlinkSync(__dirname + "/cache/owner.jpg")
  );
  return request(encodeURI(randomImg))
    .pipe(fs.createWriteStream(__dirname + "/cache/owner.jpg"))
    .on("close", () => callback());
};
