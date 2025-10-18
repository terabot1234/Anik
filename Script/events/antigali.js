require('dotenv').config();
const login = require('fb-chat-api');

console.log('🔥 ANTIGALI BOT লোড হচ্ছে...');

// গালি লিস্ট
const BAD_WORDS = [
    'madarchod','bhenchod','randi','chutiya','bc','mc','fack','fuck',
    'bhosdi','gandu','hijra','launda','শালা','হারামজাদা','মাদারচোদ',
    'ভোদা','চোদাচুদি','kutiya','saala','bhosadike','chodu','randi'
];

login({ 
    email: process.env.FB_EMAIL, 
    password: process.env.FB_PASSWORD 
}, (err, api) => {
    
    if (err) {
        return console.error('❌ লগিন ফেইল!\n📧 .env চেক করুন:\nFB_EMAIL=your@email.com\nFB_PASSWORD=yourpass');
    }
    
    console.log('✅✅ ANTIGALI BOT চালু!');
    console.log('📱 Group এ যোগ করে "শালা" লিখে Test করুন!');
    
    api.setOptions({listenEvents: true});
    
    api.listenMqtt((err, message) => {
        if (err) return;
        
        if (!message.isGroupMessage || !message.body) return;
        
        const senderID = message.senderID;
        const groupID = message.threadID;
        const senderName = message.senderName;
        const text = message.body.toLowerCase();
        
        if (senderID === api.getCurrentUserID()) return;
        
        const badWordFound = BAD_WORDS.find(word => 
            text.includes(word.toLowerCase())
        );
        
        if (badWordFound) {
            console.log(`🚨 ${senderName}: "${badWordFound}"`);
            
            setTimeout(() => {
                api.removeUserFromGroup(senderID, groupID, (err) => {
                    if (err) {
                        return api.sendMessage(`⚠️ ${senderName} কে কিক করতে পারলাম না! আমি Admin নই!`, groupID);
                    }
                    
                    const kickMsg = `🚫 **${senderName}** গালি দিয়েছে!\n💥 **AUTO KICK**!\n👋 ${badWordFound} = বাই!`;
                    api.sendMessage(kickMsg, groupID);
                    console.log(`✅ ${senderName} KICKED!`);
                });
            }, 500);
        }
    });
});
