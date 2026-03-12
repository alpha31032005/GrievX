const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Create email transporter (uses env vars in production, Mailtrap fallback in dev)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'sandbox.smtp.mailtrap.io',
  port: parseInt(process.env.SMTP_PORT || '2525', 10),
  auth: {
    user: process.env.SMTP_USER || 'e3b326997fd1c6',
    pass: process.env.SMTP_PASS || '286a4571e307c2',
  },
});

// Verify SMTP connection configuration
transporter.verify(function (error, success) {
  if (error) {
    logger.error('Email service connection failed:', error);
  } else {
    logger.info('Email service is ready to send emails');
  }
});

/**
 * Send email notification
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML content
 * @param {string} options.text - Email text content (optional)
 */
const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: '"Smart Civic System" <noreply@smartcivic.com>',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent successfully to ${options.to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error(`Failed to send email to ${options.to}:`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send complaint status update notification
 * @param {Object} user - User object with email and name
 * @param {Object} complaint - Complaint object
 * @param {string} previousStatus - Previous status of the complaint
 */
const sendComplaintStatusUpdate = async (user, complaint, previousStatus) => {
  const statusMessages = {
    open: 'has been registered and is awaiting review',
    in_progress: 'is now being worked on',
    resolved: 'has been successfully resolved',
    rejected: 'has been reviewed and marked as rejected',
    closed: 'has been closed',
  };

  const statusColors = {
    open: '#3B82F6',
    in_progress: '#F59E0B',
    resolved: '#10B981',
    rejected: '#EF4444',
    closed: '#6B7280',
  };

  const subject = `Update on Your Complaint #${complaint._id.toString().slice(-6)}`;
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Complaint Status Update</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 0; text-align: center; background-color: #1e293b;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Smart Civic System</h1>
        <p style="color: #94a3b8; margin: 5px 0 0 0; font-size: 14px;">Building Better Communities Together</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 0;">
        <table role="presentation" style="width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 40px 20px 40px;">
              <h2 style="color: #1e293b; margin: 0 0 10px 0; font-size: 24px;">Hello ${user.name},</h2>
              <p style="color: #64748b; margin: 0; font-size: 16px; line-height: 1.5;">
                There's an update on your complaint:
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px;">
              <div style="background-color: #f8fafc; border-left: 4px solid ${statusColors[complaint.status]}; padding: 20px; border-radius: 4px; margin: 20px 0;">
                <h3 style="color: #1e293b; margin: 0 0 10px 0; font-size: 18px;">Complaint Details</h3>
                <p style="margin: 5px 0; color: #475569; font-size: 14px;">
                  <strong>ID:</strong> #${complaint._id.toString().slice(-6)}
                </p>
                <p style="margin: 5px 0; color: #475569; font-size: 14px;">
                  <strong>Title:</strong> ${complaint.title}
                </p>
                <p style="margin: 5px 0; color: #475569; font-size: 14px;">
                  <strong>Category:</strong> ${complaint.category.charAt(0).toUpperCase() + complaint.category.slice(1).replace(/_/g, ' ')}
                </p>
                <p style="margin: 5px 0; color: #475569; font-size: 14px;">
                  <strong>Ward:</strong> ${complaint.ward}
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 20px 40px;">
              <div style="background-color: ${statusColors[complaint.status]}15; border-radius: 4px; padding: 20px; text-align: center;">
                <p style="margin: 0 0 10px 0; color: #64748b; font-size: 14px;">Status Updated</p>
                <p style="margin: 0; font-size: 24px; font-weight: bold; color: ${statusColors[complaint.status]};">
                  ${complaint.status.toUpperCase().replace(/-/g, ' ')}
                </p>
                <p style="margin: 15px 0 0 0; color: #475569; font-size: 16px; line-height: 1.5;">
                  Your complaint ${statusMessages[complaint.status]}
                </p>
              </div>
            </td>
          </tr>
          ${complaint.resolution ? `
          <tr>
            <td style="padding: 0 40px 20px 40px;">
              <div style="background-color: #f1f5f9; border-radius: 4px; padding: 20px;">
                <h3 style="color: #1e293b; margin: 0 0 10px 0; font-size: 16px;">Resolution Details</h3>
                <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.6;">
                  ${complaint.resolution}
                </p>
              </div>
            </td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 20px 40px 40px 40px; text-align: center;">
              <p style="color: #64748b; margin: 0 0 20px 0; font-size: 14px;">
                You can track your complaint status anytime by logging into your account.
              </p>
              <a href="http://localhost:5173/citizen/complaints" 
                 style="display: inline-block; background-color: #3B82F6; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">
                View My Complaints
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 30px 0; text-align: center;">
        <p style="color: #94a3b8; margin: 0; font-size: 12px;">
          © ${new Date().getFullYear()} Smart Civic System. All rights reserved.
        </p>
        <p style="color: #94a3b8; margin: 10px 0 0 0; font-size: 12px;">
          This is an automated message, please do not reply to this email.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return await sendEmail({
    to: user.email,
    subject,
    html,
  });
};

/**
 * Send complaint submission confirmation
 * @param {Object} user - User object with email and name
 * @param {Object} complaint - Complaint object
 */
const sendComplaintConfirmation = async (user, complaint) => {
  const subject = `Complaint Registered Successfully #${complaint._id.toString().slice(-6)}`;
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Complaint Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 0; text-align: center; background-color: #1e293b;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Smart Civic System</h1>
        <p style="color: #94a3b8; margin: 5px 0 0 0; font-size: 14px;">Building Better Communities Together</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 0;">
        <table role="presentation" style="width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 40px 20px 40px;">
              <div style="text-align: center; margin-bottom: 20px;">
                <div style="display: inline-block; background-color: #10B981; border-radius: 50%; padding: 15px;">
                  <span style="color: #ffffff; font-size: 32px;">✓</span>
                </div>
              </div>
              <h2 style="color: #1e293b; margin: 0 0 10px 0; font-size: 24px; text-align: center;">Complaint Registered Successfully!</h2>
              <p style="color: #64748b; margin: 0; font-size: 16px; line-height: 1.5; text-align: center;">
                Dear ${user.name}, thank you for reporting the issue. We have received your complaint and will address it promptly.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px;">
              <div style="background-color: #f8fafc; border-left: 4px solid #3B82F6; padding: 20px; border-radius: 4px; margin: 20px 0;">
                <h3 style="color: #1e293b; margin: 0 0 10px 0; font-size: 18px;">Complaint Details</h3>
                <p style="margin: 5px 0; color: #475569; font-size: 14px;">
                  <strong>Reference ID:</strong> #${complaint._id.toString().slice(-6)}
                </p>
                <p style="margin: 5px 0; color: #475569; font-size: 14px;">
                  <strong>Title:</strong> ${complaint.title}
                </p>
                <p style="margin: 5px 0; color: #475569; font-size: 14px;">
                  <strong>Category:</strong> ${complaint.category.charAt(0).toUpperCase() + complaint.category.slice(1).replace(/_/g, ' ')}
                </p>
                <p style="margin: 5px 0; color: #475569; font-size: 14px;">
                  <strong>Ward:</strong> ${complaint.ward}
                </p>
                <p style="margin: 5px 0; color: #475569; font-size: 14px;">
                  <strong>Status:</strong> <span style="color: #3B82F6; font-weight: bold;">OPEN</span>
                </p>
                <p style="margin: 5px 0; color: #475569; font-size: 14px;">
                  <strong>Submitted on:</strong> ${new Date(complaint.createdAt).toLocaleString()}
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px;">
              <div style="background-color: #EFF6FF; border-radius: 4px; padding: 20px;">
                <h3 style="color: #1e293b; margin: 0 0 10px 0; font-size: 16px;">What happens next?</h3>
                <ul style="margin: 10px 0; padding-left: 20px; color: #475569; font-size: 14px; line-height: 1.8;">
                  <li>Your complaint has been forwarded to the ${complaint.department ? complaint.department.replace(/_/g, ' ').toUpperCase() : 'relevant'} department</li>
                  <li>Our team will review and prioritize your complaint</li>
                  <li>You'll receive email updates when the status changes</li>
                  <li>You can track progress anytime in your dashboard</li>
                </ul>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px 40px 40px; text-align: center;">
              <p style="color: #64748b; margin: 0 0 20px 0; font-size: 14px;">
                Track your complaint status anytime by logging into your account.
              </p>
              <a href="http://localhost:5173/citizen/complaints" 
                 style="display: inline-block; background-color: #3B82F6; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">
                View My Complaints
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 30px 0; text-align: center;">
        <p style="color: #94a3b8; margin: 0; font-size: 12px;">
          © ${new Date().getFullYear()} Smart Civic System. All rights reserved.
        </p>
        <p style="color: #94a3b8; margin: 10px 0 0 0; font-size: 12px;">
          This is an automated message, please do not reply to this email.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return await sendEmail({
    to: user.email,
    subject,
    html,
  });
};

/**
 * Send complaint assignment notification
 * @param {Object} user - User object (complaint owner)
 * @param {Object} complaint - Complaint object
 * @param {Object} assignedOfficer - Officer object with name and email
 */
const sendComplaintAssignment = async (user, complaint, assignedOfficer) => {
  const subject = `Officer Assigned to Your Complaint #${complaint._id.toString().slice(-6)}`;
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Complaint Assignment</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 0; text-align: center; background-color: #1e293b;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Smart Civic System</h1>
        <p style="color: #94a3b8; margin: 5px 0 0 0; font-size: 14px;">Building Better Communities Together</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 0;">
        <table role="presentation" style="width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 40px 20px 40px;">
              <h2 style="color: #1e293b; margin: 0 0 10px 0; font-size: 24px;">Hello ${user.name},</h2>
              <p style="color: #64748b; margin: 0; font-size: 16px; line-height: 1.5;">
                Good news! An officer has been assigned to handle your complaint.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px;">
              <div style="background-color: #f8fafc; border-left: 4px solid #F59E0B; padding: 20px; border-radius: 4px; margin: 20px 0;">
                <h3 style="color: #1e293b; margin: 0 0 10px 0; font-size: 18px;">Complaint: #${complaint._id.toString().slice(-6)}</h3>
                <p style="margin: 5px 0; color: #475569; font-size: 14px;">
                  <strong>Title:</strong> ${complaint.title}
                </p>
                <p style="margin: 5px 0; color: #475569; font-size: 14px;">
                  <strong>Category:</strong> ${complaint.category.charAt(0).toUpperCase() + complaint.category.slice(1).replace(/_/g, ' ')}
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 20px 40px;">
              <div style="background-color: #FEF3C7; border-radius: 4px; padding: 20px;">
                <h3 style="color: #1e293b; margin: 0 0 10px 0; font-size: 16px;">Assigned Officer</h3>
                <p style="margin: 5px 0; color: #475569; font-size: 14px;">
                  <strong>Name:</strong> ${assignedOfficer.name}
                </p>
                <p style="margin: 5px 0; color: #475569; font-size: 14px;">
                  <strong>Email:</strong> ${assignedOfficer.email}
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px 40px 40px; text-align: center;">
              <p style="color: #64748b; margin: 0 0 20px 0; font-size: 14px;">
                The assigned officer will work on resolving your complaint. You'll receive updates as progress is made.
              </p>
              <a href="http://localhost:5173/citizen/complaints" 
                 style="display: inline-block; background-color: #3B82F6; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">
                View Complaint Details
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 30px 0; text-align: center;">
        <p style="color: #94a3b8; margin: 0; font-size: 12px;">
          © ${new Date().getFullYear()} Smart Civic System. All rights reserved.
        </p>
        <p style="color: #94a3b8; margin: 10px 0 0 0; font-size: 12px;">
          This is an automated message, please do not reply to this email.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return await sendEmail({
    to: user.email,
    subject,
    html,
  });
};

/**
 * Generate a 6-digit OTP
 * @returns {string} 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Hash OTP for secure storage
 * @param {string} otp - Plain OTP
 * @returns {string} Hashed OTP
 */
const hashOTP = (otp) => {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(otp).digest('hex');
};

/**
 * Send OTP via email
 * @param {Object} user - User object with email and name
 * @param {string} otp - OTP code
 */
const sendOTPEmail = async (user, otp) => {
  const subject = `Your Login OTP - Smart Civic System`;
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OTP Verification</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 0; text-align: center; background-color: #1e293b;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Smart Civic System</h1>
        <p style="color: #94a3b8; margin: 5px 0 0 0; font-size: 14px;">Building Better Communities Together</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 0;">
        <table role="presentation" style="width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 40px 20px 40px;">
              <div style="text-align: center; margin-bottom: 20px;">
                <div style="display: inline-block; background-color: #3B82F6; border-radius: 50%; padding: 15px; width: 60px; height: 60px;">
                  <span style="color: #ffffff; font-size: 32px;">🔐</span>
                </div>
              </div>
              <h2 style="color: #1e293b; margin: 0 0 10px 0; font-size: 24px; text-align: center;">Login Verification</h2>
              <p style="color: #64748b; margin: 0; font-size: 16px; line-height: 1.5; text-align: center;">
                Hello ${user.name}, use the code below to login to your account:
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 30px; text-align: center;">
                <p style="margin: 0 0 10px 0; color: #ffffff; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Your OTP Code</p>
                <h1 style="margin: 0; color: #ffffff; font-size: 48px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                  ${otp}
                </h1>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 20px 40px;">
              <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; border-radius: 4px; padding: 15px;">
                <p style="margin: 0; color: #92400E; font-size: 14px; line-height: 1.5;">
                  <strong>⏰ Important:</strong> This OTP is valid for <strong>10 minutes</strong> only. Do not share this code with anyone.
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px;">
              <div style="background-color: #f8fafc; border-radius: 4px; padding: 20px;">
                <h3 style="color: #1e293b; margin: 0 0 10px 0; font-size: 16px;">Security Tips:</h3>
                <ul style="margin: 10px 0; padding-left: 20px; color: #475569; font-size: 14px; line-height: 1.8;">
                  <li>Never share your OTP with anyone</li>
                  <li>Smart Civic System will never ask for your OTP via phone</li>
                  <li>If you didn't request this OTP, please ignore this email</li>
                </ul>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px 40px 40px;">
              <p style="color: #64748b; margin: 0; font-size: 14px; text-align: center; line-height: 1.5;">
                If you didn't request this code, please ignore this email. Your account is still secure.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 30px 0; text-align: center;">
        <p style="color: #94a3b8; margin: 0; font-size: 12px;">
          © ${new Date().getFullYear()} Smart Civic System. All rights reserved.
        </p>
        <p style="color: #94a3b8; margin: 10px 0 0 0; font-size: 12px;">
          This is an automated message, please do not reply to this email.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return await sendEmail({
    to: user.email,
    subject,
    html,
  });
};

module.exports = {
  sendEmail,
  sendComplaintStatusUpdate,
  sendComplaintConfirmation,
  sendComplaintAssignment,
  generateOTP,
  hashOTP,
  sendOTPEmail,
};
