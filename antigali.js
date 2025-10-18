require('dotenv').config();
const login = require('fb-chat-api');

console.log('🔥 KICK BOT লোড হচ্ছে...');

// গালি লিস্ট
const BAD_WORDS = [
    'madarchod','bhenchod','randi','chutiya','bc','mc','fack','fuck',
    'bhosdi','gandu','hijra','launda','শালা','হারামজাদা','মাদারচোদ',
    'ভোদা','চোদাচুদি','kutiya','saala','bhosadike','chodu','randi'
];

// লগিন
login({ 
    email: process.env.FB_EMAIL, 
    password: process.env.FB_PASSWORD 
}, (err, api) => {
    
    if (err) {
        return console.error('❌ লগিন ফেইল!\n📧 .env ফাইলে ইমেইল+পাসওয়ার্ড ঠিক করুন');
    }
    
    console.log('✅✅ বট চালু! গালি দিলে AUTO KICK! 🚫');
    console.log('📱 গ্রুপে যোগ করে টেস্ট করুন: "শালা" লিখুন');
    
    api.setOptions({listenEvents: true});
    
    // মেসেজ লিসেনার
    api.listenMqtt((err, message) => {
        if (err) return console.error('❌ মেসেজ এরর:', err);
        
        // শুধু গ্রুপ মেসেজ
        if (!message.isGroupMessage || !message.body) return;
        
        const senderID = message.senderID;
        const groupID = message.threadID;
        const senderName = message.senderName;
        const text = message.body.toLowerCase();
        
        // বট নিজেকে ইগনোর
        if (senderID === api.getCurrentUserID()) return;
        
        // গালি চেক
        const badWordFound = BAD_WORDS.find(word => 
            text.includes(word.toLowerCase())
        );
        
        if (badWordFound) {
            console.log(`🚨 ${senderName} বলেছে: "${badWordFound}"`);
            
            // ১ সেকেন্ড ওয়েট করে কিক
            setTimeout(() => {
                api.removeUserFromGroup(senderID, groupID, (err) => {
                    if (err) {
                        api.sendMessage(`⚠️ ${senderName} কে কিক করতে পারলাম না! (আমি অ্যাডমিন না)`, groupID);
                        return console.log('❌ কিক ফেইল: অ্যাডমিন নই');
                    }
                    
                    const kickMsg = `🚫 **${senderName}** গালি দিয়েছে!\n💥 **AUTO KICK** হয়েছে!\n👋 ${badWordFound} = বাই বাই!`;
                    api.sendMessage(kickMsg, groupID);
                    console.log(`✅ ${senderName} SUCCESSFULLY KICKED!`);
                });
            }, 1000);
        }
    });
});
