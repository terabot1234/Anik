require('dotenv').config();
const login = require('fb-chat-api');

console.log('🔥 ANTIGALI BOT 2025 লোড হচ্ছে...');

// গালি লিস্ট
const BAD_WORDS = ['শালা','মাদারচোদ','হারামজাদা','fuck','bc','mc','randi','chutiya'];

login({ 
    email: process.env.FB_EMAIL, 
    password: process.env.FB_PASSWORD 
}, (err, api) => {
    
    if (err) {
        switch (err.error) {
            case 'login-required': 
                return console.error('❌ 2FA চালু আছে! App Password ব্যবহার করুন');
            case 'password-invalid': 
                return console.error('❌ ❌ পাসওয়ার্ড ভুল!');
            default: 
                return console.error('❌ লগিন ফেইল:', err.error);
        }
    }
    
    console.log('✅✅ ANTIGALI BOT চালু! 🚫');
    console.log('📱 Group এ যোগ করে "শালা" লিখুন = AUTO KICK!');
    
    api.listen((err, message) => {
        if (err) return console.error(err);
        
        if (!message.body || !message.isGroupMessage) return;
        
        const senderID = message.senderID;
        const groupID = message.threadID;
        const senderName = message.senderName;
        const text = message.body.toLowerCase();
        
        if (senderID === api.getCurrentUserID()) return;
        
        const badWord = BAD_WORDS.find(word => text.includes(word));
        if (badWord) {
            console.log(`🚨 ${senderName}: ${badWord}`);
            
            api.removeUserFromGroup(senderID, groupID, (err) => {
                if (err) {
                    api.sendMessage(`⚠️ ${senderName} কিক করতে পারলাম না! আমি Admin নই!`, groupID);
                    return;
                }
                
                api.sendMessage(`🚫 **${senderName}** গালি দিয়েছে!\n💥 AUTO KICK!\n👋 **${badWord}** = বাই!`, groupID);
                console.log(`✅ ${senderName} KICKED!`);
            });
        }
    });
});
