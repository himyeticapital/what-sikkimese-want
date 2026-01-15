/**
 * Email Service for What Sikkimese Want Portal
 * Handles sending confirmation and status update emails
 */

const nodemailer = require('nodemailer');

// Email configuration
let transporter = null;

/**
 * Initialize email transporter based on configuration
 */
function initializeEmailService() {
    const emailService = process.env.EMAIL_SERVICE;

    if (emailService === 'gmail') {
        // Gmail SMTP configuration
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    } else if (emailService === 'sendgrid') {
        // SendGrid SMTP configuration
        transporter = nodemailer.createTransport({
            host: 'smtp.sendgrid.net',
            port: 587,
            secure: false, // Use STARTTLS
            auth: {
                user: 'apikey',
                pass: process.env.SENDGRID_API_KEY
            },
            tls: {
                rejectUnauthorized: true,
                minVersion: 'TLSv1.2'
            },
            connectionTimeout: 10000, // 10 seconds
            greetingTimeout: 10000, // 10 seconds
            socketTimeout: 30000 // 30 seconds
        });
    } else {
        console.warn('⚠️  Email service not configured. Emails will not be sent.');
        console.warn('   Set EMAIL_SERVICE in .env file to "gmail" or "sendgrid"');
        return false;
    }

    console.log(`✅ Email service initialized: ${emailService}`);
    return true;
}

/**
 * Send confirmation email when user submits a request
 */
async function sendConfirmationEmail(requestData) {
    if (!transporter) {
        console.log('📧 Email not sent: Service not configured');
        return { success: false, reason: 'not_configured' };
    }

    const { email, name, referenceId, district, location, amenities, priority } = requestData;

    const amenitiesList = amenities.map(a => `  • ${a}`).join('\n');
    const trackingUrl = `${process.env.DOMAIN}/#track`;

    const mailOptions = {
        from: `"What Sikkimese Want" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Request Received - Ref: ${referenceId}`,
        text: `
Dear ${name},

Thank you for submitting your amenity request for ${district}!

Your Reference ID: ${referenceId}

Request Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Location: ${location}
🏗️ Amenities Requested:
${amenitiesList}
⚡ Priority: ${priority}
📊 Status: Pending

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Track your request anytime: ${trackingUrl}

You will receive email updates when your request status changes.

Thank you for your participation in building a better Sikkim!

Best regards,
What Sikkimese Want Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Questions? Contact us at: ${process.env.EMAIL_USER}
        `,
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #0077a2 0%, #005a7d 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Request Received ✅</h1>
    </div>

    <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
        <p style="font-size: 16px; color: #333;">Dear <strong>${name}</strong>,</p>

        <p style="font-size: 15px; color: #555;">
            Thank you for submitting your amenity request for <strong>${district}</strong>!
        </p>

        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0077a2;">
            <p style="margin: 0 0 8px 0; font-weight: 600; color: #0077a2; font-size: 14px;">YOUR REFERENCE ID</p>
            <p style="margin: 0; font-size: 24px; font-weight: 700; color: #005a7d; font-family: 'Courier New', monospace; letter-spacing: 1px;">
                ${referenceId}
            </p>
            <p style="margin: 8px 0 0 0; font-size: 12px; color: #666;">Save this ID to track your request</p>
        </div>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 16px 0; color: #0077a2; font-size: 16px;">📋 Request Details</h3>

            <div style="margin-bottom: 12px;">
                <strong style="color: #555;">📍 Location:</strong><br>
                <span style="color: #333;">${location}</span>
            </div>

            <div style="margin-bottom: 12px;">
                <strong style="color: #555;">🏗️ Amenities Requested:</strong><br>
                ${amenities.map(a => `<span style="display: inline-block; background: #e3f2fd; padding: 4px 10px; margin: 4px 4px 4px 0; border-radius: 4px; font-size: 13px; color: #0077a2;">• ${a}</span>`).join('')}
            </div>

            <div style="margin-bottom: 12px;">
                <strong style="color: #555;">⚡ Priority:</strong><br>
                <span style="display: inline-block; background: ${priority === 'High' ? '#fee' : priority === 'Medium' ? '#fef7e0' : '#f0f9ff'}; color: ${priority === 'High' ? '#c33' : priority === 'Medium' ? '#ea9800' : '#0077a2'}; padding: 4px 12px; border-radius: 4px; font-weight: 600; font-size: 13px;">${priority}</span>
            </div>

            <div style="margin-bottom: 0;">
                <strong style="color: #555;">📊 Status:</strong><br>
                <span style="display: inline-block; background: #fff4e6; color: #ea9800; padding: 4px 12px; border-radius: 4px; font-weight: 600; font-size: 13px;">⏳ Pending</span>
            </div>
        </div>

        <div style="text-align: center; margin: 30px 0;">
            <a href="${trackingUrl}" style="display: inline-block; background: #0077a2; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px;">
                🔍 Track Your Request
            </a>
        </div>

        <div style="background: #e8f5e9; padding: 16px; border-radius: 6px; margin: 20px 0; border-left: 3px solid #4caf50;">
            <p style="margin: 0; color: #2e7d32; font-size: 14px;">
                ✉️ You will receive email updates when your request status changes.
            </p>
        </div>

        <p style="font-size: 14px; color: #666; margin-top: 24px;">
            Thank you for your participation in building a better Sikkim!
        </p>

        <p style="font-size: 14px; color: #333; margin-bottom: 0;">
            Best regards,<br>
            <strong>What Sikkimese Want Team</strong>
        </p>
    </div>

    <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
        <p style="margin: 0 0 8px 0;">Questions? Contact us at <a href="mailto:${process.env.EMAIL_USER}" style="color: #0077a2; text-decoration: none;">${process.env.EMAIL_USER}</a></p>
        <p style="margin: 0; color: #aaa;">What Sikkimese Want Portal - Building Sikkim Together</p>
    </div>
</body>
</html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Confirmation email sent to ${email} (Ref: ${referenceId})`);
        return { success: true };
    } catch (error) {
        console.error('❌ Error sending confirmation email:', error.message);
        console.error('   Error code:', error.code);
        console.error('   Error details:', error.response || 'No response details');
        return { success: false, error: error.message };
    }
}

/**
 * Send status update email when admin changes request status
 */
async function sendStatusUpdateEmail(updateData) {
    if (!transporter) {
        console.log('📧 Email not sent: Service not configured');
        return { success: false, reason: 'not_configured' };
    }

    const { email, name, referenceId, oldStatus, newStatus, adminNotes, district, location, amenities } = updateData;

    const trackingUrl = `${process.env.DOMAIN}/#track`;
    const amenitiesList = amenities ? amenities.join(', ') : 'N/A';

    // Status-specific guidance
    const statusGuidance = {
        'Pending': 'We are reviewing your request and will update you soon.',
        'In Progress': 'Our team is actively working on your request. A survey or assessment may be conducted soon.',
        'Approved': 'Great news! Your request has been approved and will move to the next phase of implementation.',
        'Rejected': 'Unfortunately, your request cannot be fulfilled at this time. Please see admin notes below for details.',
        'Completed': 'Your request has been completed! Thank you for your patience.'
    };

    const guidance = statusGuidance[newStatus] || 'Your request status has been updated.';

    // Status colors
    const statusColors = {
        'Pending': { bg: '#fff4e6', color: '#ea9800' },
        'In Progress': { bg: '#e3f2fd', color: '#0077a2' },
        'Approved': { bg: '#e8f5e9', color: '#2e7d32' },
        'Rejected': { bg: '#ffebee', color: '#c62828' },
        'Completed': { bg: '#e8f5e9', color: '#1b5e20' }
    };

    const newStatusColor = statusColors[newStatus] || { bg: '#f5f5f5', color: '#666' };
    const oldStatusColor = statusColors[oldStatus] || { bg: '#f5f5f5', color: '#999' };

    const mailOptions = {
        from: `"What Sikkimese Want" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `[Status Update] Your Request - Ref: ${referenceId}`,
        text: `
Dear ${name},

Your amenity request for ${district} has been updated!

Reference ID: ${referenceId}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STATUS UPDATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Previous Status: ${oldStatus}
New Status: ${newStatus}

${guidance}

${adminNotes ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MESSAGE FROM OUR TEAM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${adminNotes}
` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REQUEST DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 Location: ${location}
🏗️ Amenities: ${amenitiesList}

Track your request anytime: ${trackingUrl}

Thank you for your patience and participation!

Best regards,
What Sikkimese Want Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Questions? Reply to this email or contact: ${process.env.EMAIL_USER}
        `,
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #0077a2 0%, #005a7d 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">📢 Status Update</h1>
    </div>

    <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
        <p style="font-size: 16px; color: #333;">Dear <strong>${name}</strong>,</p>

        <p style="font-size: 15px; color: #555;">
            Good news! Your amenity request for <strong>${district}</strong> has been updated.
        </p>

        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0077a2;">
            <p style="margin: 0 0 8px 0; font-weight: 600; color: #0077a2; font-size: 14px;">REFERENCE ID</p>
            <p style="margin: 0; font-size: 20px; font-weight: 700; color: #005a7d; font-family: 'Courier New', monospace; letter-spacing: 1px;">
                ${referenceId}
            </p>
        </div>

        <div style="background: #f8f9fa; padding: 24px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 20px 0; color: #0077a2; font-size: 16px; text-align: center;">🔄 Status Change</h3>

            <div style="display: flex; align-items: center; justify-content: center; gap: 16px; flex-wrap: wrap;">
                <div style="text-align: center;">
                    <p style="margin: 0 0 8px 0; font-size: 12px; color: #999;">Previous</p>
                    <span style="display: inline-block; background: ${oldStatusColor.bg}; color: ${oldStatusColor.color}; padding: 8px 16px; border-radius: 6px; font-weight: 600; font-size: 14px;">
                        ${oldStatus}
                    </span>
                </div>

                <div style="font-size: 24px; color: #0077a2;">→</div>

                <div style="text-align: center;">
                    <p style="margin: 0 0 8px 0; font-size: 12px; color: #999;">New</p>
                    <span style="display: inline-block; background: ${newStatusColor.bg}; color: ${newStatusColor.color}; padding: 8px 16px; border-radius: 6px; font-weight: 600; font-size: 14px;">
                        ${newStatus}
                    </span>
                </div>
            </div>
        </div>

        <div style="background: #e3f2fd; padding: 16px; border-radius: 6px; margin: 20px 0; border-left: 3px solid #0077a2;">
            <p style="margin: 0; color: #0277bd; font-size: 14px;">
                <strong>What's Next?</strong><br>
                ${guidance}
            </p>
        </div>

        ${adminNotes ? `
        <div style="background: #fff9e6; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffa000;">
            <h4 style="margin: 0 0 12px 0; color: #f57c00; font-size: 14px;">💬 MESSAGE FROM OUR TEAM</h4>
            <p style="margin: 0; color: #333; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${adminNotes}</p>
        </div>
        ` : ''}

        <div style="background: #fafafa; padding: 16px; border-radius: 6px; margin: 20px 0; border: 1px solid #e0e0e0;">
            <h4 style="margin: 0 0 12px 0; color: #555; font-size: 14px;">📋 Your Request</h4>
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #666;">
                <strong>Location:</strong> ${location}
            </p>
            <p style="margin: 0; font-size: 13px; color: #666;">
                <strong>Amenities:</strong> ${amenitiesList}
            </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
            <a href="${trackingUrl}" style="display: inline-block; background: #0077a2; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px;">
                🔍 Track Your Request
            </a>
        </div>

        <p style="font-size: 14px; color: #666; margin-top: 24px;">
            Thank you for your patience and participation in building a better Sikkim!
        </p>

        <p style="font-size: 14px; color: #333; margin-bottom: 0;">
            Best regards,<br>
            <strong>What Sikkimese Want Team</strong>
        </p>
    </div>

    <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
        <p style="margin: 0 0 8px 0;">Questions? Reply to this email or contact us at <a href="mailto:${process.env.EMAIL_USER}" style="color: #0077a2; text-decoration: none;">${process.env.EMAIL_USER}</a></p>
        <p style="margin: 0; color: #aaa;">What Sikkimese Want Portal - Building Sikkim Together</p>
    </div>
</body>
</html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Status update email sent to ${email} (Ref: ${referenceId}, Status: ${newStatus})`);
        return { success: true };
    } catch (error) {
        console.error('❌ Error sending status update email:', error.message);
        console.error('   Error code:', error.code);
        console.error('   Error details:', error.response || 'No response details');
        return { success: false, error: error.message };
    }
}

module.exports = {
    initializeEmailService,
    sendConfirmationEmail,
    sendStatusUpdateEmail
};
