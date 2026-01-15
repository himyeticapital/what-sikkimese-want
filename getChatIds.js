/**
 * Telegram Chat ID Getter
 *
 * Instructions:
 * 1. Install the telegram bot library: npm install node-telegram-bot-api
 * 2. Replace YOUR_BOT_TOKEN below with your actual bot token from @BotFather
 * 3. Run this script: node getChatIds.js
 * 4. Send a message in each district group (the bot must be a member)
 * 5. The script will print the chat ID for each group
 * 6. Copy these Chat IDs and save them - you'll need them for the .env file
 */

const TelegramBot = require('node-telegram-bot-api');

// Replace this with your actual bot token from @BotFather
const BOT_TOKEN = '8545832601:AAHz91jQtLC715sW0DCsv58nC_sWW9NF2-k';

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

console.log('🤖 Telegram Chat ID Getter is running...');
console.log('📝 Instructions:');
console.log('   1. Make sure your bot is added as admin in all 6 district groups');
console.log('   2. Send any message in each group (type "test" or anything)');
console.log('   3. The Chat ID will appear below');
console.log('   4. Copy and save each Chat ID for your .env file');
console.log('');
console.log('⏳ Waiting for messages...\n');

// Store found chat IDs to avoid duplicates
const foundChats = new Map();

// Listen for any message
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const chatTitle = msg.chat.title || 'Private Chat';
    const chatType = msg.chat.type;
    const fromUser = msg.from.first_name || 'Unknown';

    // Only process group/supergroup messages
    if (chatType === 'group' || chatType === 'supergroup') {
        if (!foundChats.has(chatId)) {
            foundChats.set(chatId, chatTitle);

            console.log('✅ Found Group Chat:');
            console.log(`   Group Name: ${chatTitle}`);
            console.log(`   Chat ID: ${chatId}`);
            console.log(`   Message from: ${fromUser}`);
            console.log('');

            // Send confirmation message to the group
            bot.sendMessage(chatId, `✅ Chat ID detected: ${chatId}\nGroup: ${chatTitle}`);
        }
    } else {
        console.log(`⚠️  Received message from ${chatType} (${fromUser}) - ignoring (not a group)`);
    }
});

// Handle errors
bot.on('polling_error', (error) => {
    console.error('❌ Polling error:', error.message);
    if (error.message.includes('401')) {
        console.error('');
        console.error('⚠️  Invalid bot token! Please check your BOT_TOKEN in this script.');
    }
});

// Keep script running
console.log('Press Ctrl+C to stop the script when you have all Chat IDs.\n');
