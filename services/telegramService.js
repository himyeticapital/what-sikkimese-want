/**
 * Telegram Service for What Sikkimese Want Portal
 * Handles sending notifications to district-specific Telegram groups
 */

const TelegramBot = require('node-telegram-bot-api');

let bot = null;

// District group chat ID mappings
const districtGroups = {
    'Gangtok': process.env.TELEGRAM_GROUP_GANGTOK,
    'Mangan': process.env.TELEGRAM_GROUP_MANGAN,
    'Namchi': process.env.TELEGRAM_GROUP_NAMCHI,
    'Gyalshing': process.env.TELEGRAM_GROUP_GYALSHING,
    'Pakyong': process.env.TELEGRAM_GROUP_PAKYONG,
    'Soreng': process.env.TELEGRAM_GROUP_SORENG
};

/**
 * Initialize Telegram bot
 */
function initializeTelegramService() {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
        console.warn('⚠️  Telegram bot not configured. Group notifications will not be sent.');
        console.warn('   Set TELEGRAM_BOT_TOKEN in .env file');
        return false;
    }

    try {
        bot = new TelegramBot(botToken, { polling: false });
        console.log('✅ Telegram bot initialized');

        // Verify all district groups are configured
        const missingGroups = [];
        Object.keys(districtGroups).forEach(district => {
            if (!districtGroups[district]) {
                missingGroups.push(district);
            }
        });

        if (missingGroups.length > 0) {
            console.warn(`⚠️  Missing Telegram group IDs for: ${missingGroups.join(', ')}`);
            console.warn('   Run getChatIds.js to get Chat IDs and add them to .env');
        }

        return true;
    } catch (error) {
        console.error('❌ Error initializing Telegram bot:', error.message);
        return false;
    }
}

/**
 * Send new request notification to district Telegram group
 */
async function sendNewRequestNotification(requestData) {
    if (!bot) {
        console.log('📱 Telegram notification not sent: Bot not configured');
        return { success: false, reason: 'not_configured' };
    }

    const { district, referenceId, name, phone, location, gpu, amenities, description, population, priority } = requestData;

    const chatId = districtGroups[district];
    if (!chatId) {
        console.warn(`⚠️  No Telegram group configured for district: ${district}`);
        return { success: false, reason: 'no_chat_id' };
    }

    // Format amenities list
    const amenitiesList = amenities.map(a => `  • ${a}`).join('\n');

    // Priority emoji
    const priorityEmoji = {
        'High': '🔴',
        'Medium': '🟡',
        'Low': '🟢'
    };

    const emoji = priorityEmoji[priority] || '⚪';

    // Format phone number (hide middle digits for privacy)
    const formattedPhone = phone.replace(/(\d{2})\d{5}(\d{3})/, '$1XXXXX$2');

    const message = `
🆕 <b>New Amenity Request</b>

📍 <b>District:</b> ${district}
${gpu ? `🏘️ <b>GPU:</b> ${gpu}\n` : ''}🏘️ <b>Location:</b> ${location}
👤 <b>Submitted by:</b> ${name.split(' ')[0]} (${formattedPhone})

🏗️ <b>Amenities Requested:</b>
${amenitiesList}

📝 <b>Description:</b>
${description.length > 150 ? description.substring(0, 150) + '...' : description}

${population ? `👥 <b>Population Benefiting:</b> ${population}\n` : ''}${emoji} <b>Priority:</b> ${priority}

🔗 <b>Reference ID:</b> <code>${referenceId}</code>

⏰ <b>Submitted:</b> ${new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
})}

━━━━━━━━━━━━━━━━━━━━━━━━━━
Admin panel: ${process.env.DOMAIN}/admin.html
`;

    try {
        await bot.sendMessage(chatId, message, {
            parse_mode: 'HTML',
            disable_web_page_preview: true
        });
        console.log(`✅ Telegram notification sent to ${district} group (Ref: ${referenceId})`);
        return { success: true };
    } catch (error) {
        console.error(`❌ Error sending Telegram notification to ${district}:`, error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Send status update notification to district Telegram group (optional feature)
 */
async function sendStatusUpdateNotification(updateData) {
    if (!bot) {
        console.log('📱 Telegram notification not sent: Bot not configured');
        return { success: false, reason: 'not_configured' };
    }

    const { district, referenceId, oldStatus, newStatus, adminNotes, location } = updateData;

    const chatId = districtGroups[district];
    if (!chatId) {
        console.warn(`⚠️  No Telegram group configured for district: ${district}`);
        return { success: false, reason: 'no_chat_id' };
    }

    // Status emoji
    const statusEmoji = {
        'Pending': '⏳',
        'In Progress': '🔄',
        'Approved': '✅',
        'Rejected': '❌',
        'Completed': '🎉'
    };

    const newEmoji = statusEmoji[newStatus] || '📊';

    const message = `
📢 <b>Request Status Update</b>

🔗 <b>Reference:</b> <code>${referenceId}</code>
📍 <b>Location:</b> ${location}

<b>Status Changed:</b>
${oldStatus} ➡️ ${newEmoji} <b>${newStatus}</b>

${adminNotes ? `💬 <b>Admin Message:</b>\n${adminNotes}\n\n` : ''}⏰ <b>Updated:</b> ${new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
})}
`;

    try {
        await bot.sendMessage(chatId, message, {
            parse_mode: 'HTML',
            disable_web_page_preview: true
        });
        console.log(`✅ Status update notification sent to ${district} group (Ref: ${referenceId})`);
        return { success: true };
    } catch (error) {
        console.error(`❌ Error sending status update to ${district}:`, error.message);
        return { success: false, error: error.message };
    }
}

module.exports = {
    initializeTelegramService,
    sendNewRequestNotification,
    sendStatusUpdateNotification
};
