const sgMail = require('@sendgrid/mail');

class EmailService {
  constructor() {
    if (process.env.SENDGRID_API_KEY) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    }
  }

  async sendVerificationEmail(email, username, verificationToken) {
    try {
      if (!process.env.SENDGRID_API_KEY) {
        console.log('SendGrid API key not configured. Skipping email send.');
        console.log(`Would send verification email to ${email} for user ${username}`);
        return { success: true, message: 'Email service not configured (development mode)' };
      }

      const verificationLink = `${process.env.APP_URL || 'http://forms.exechef.com'}/verify?token=${verificationToken}`;

      const msg = {
        to: email,
        from: process.env.SENDGRID_FROM_EMAIL || 'noreply@exechef.com',
        subject: 'Verify Your ExeChef Account',
        html: `
          <h1>Welcome to ExeChef!</h1>
          <p>Hi ${username},</p>
          <p>Please verify your email address by clicking the link below:</p>
          <a href="${verificationLink}" style="display:inline-block;padding:10px 20px;background-color:#007bff;color:white;text-decoration:none;border-radius:5px;">Verify Email</a>
          <p>Or copy this link: ${verificationLink}</p>
          <p>This link expires in 24 hours.</p>
          <p>If you didn't create this account, please ignore this email.</p>
        `,
      };

      await sgMail.send(msg);
      return { success: true, message: 'Verification email sent' };
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  async sendWelcomeEmail(email, username) {
    try {
      if (!process.env.SENDGRID_API_KEY) {
        console.log('SendGrid API key not configured. Skipping email send.');
        console.log(`Would send welcome email to ${email}`);
        return { success: true, message: 'Email service not configured (development mode)' };
      }

      const msg = {
        to: email,
        from: process.env.SENDGRID_FROM_EMAIL || 'noreply@exechef.com',
        subject: 'Welcome to ExeChef!',
        html: `
          <h1>Welcome to ExeChef!</h1>
          <p>Hi ${username},</p>
          <p>Your account has been successfully created. You can now log in and start using ExeChef.</p>
          <p><a href="${process.env.APP_URL || 'http://forms.exechef.com'}/login" style="display:inline-block;padding:10px 20px;background-color:#28a745;color:white;text-decoration:none;border-radius:5px;">Go to Login</a></p>
          <p>If you have any questions, please contact our support team.</p>
        `,
      };

      await sgMail.send(msg);
      return { success: true, message: 'Welcome email sent' };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  async sendPasswordResetEmail(email, username, resetToken) {
    try {
      if (!process.env.SENDGRID_API_KEY) {
        console.log('SendGrid API key not configured. Skipping email send.');
        console.log(`Would send password reset email to ${email}`);
        return { success: true, message: 'Email service not configured (development mode)' };
      }

      const resetLink = `${process.env.APP_URL || 'http://forms.exechef.com'}/reset-password?token=${resetToken}`;

      const msg = {
        to: email,
        from: process.env.SENDGRID_FROM_EMAIL || 'noreply@exechef.com',
        subject: 'Reset Your ExeChef Password',
        html: `
          <h1>Password Reset Request</h1>
          <p>Hi ${username},</p>
          <p>We received a request to reset your password. Click the link below to reset it:</p>
          <a href="${resetLink}" style="display:inline-block;padding:10px 20px;background-color:#ffc107;color:black;text-decoration:none;border-radius:5px;">Reset Password</a>
          <p>Or copy this link: ${resetLink}</p>
          <p>This link expires in 1 hour.</p>
          <p>If you didn't request a password reset, please ignore this email.</p>
        `,
      };

      await sgMail.send(msg);
      return { success: true, message: 'Password reset email sent' };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  async sendContactFormEmail(contactData) {
    try {
      if (!process.env.SENDGRID_API_KEY) {
        console.log('SendGrid API key not configured. Skipping email send.');
        console.log(`Would send contact form email from ${contactData.email}`);
        return { success: true, message: 'Email service not configured (development mode)' };
      }

      const msg = {
        to: process.env.CONTACT_EMAIL || 'admin@exechef.com',
        from: process.env.SENDGRID_FROM_EMAIL || 'noreply@exechef.com',
        replyTo: contactData.email,
        subject: `New Contact Form Submission from ${contactData.name}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${contactData.name}</p>
          <p><strong>Email:</strong> ${contactData.email}</p>
          <p><strong>Phone:</strong> ${contactData.phone || 'Not provided'}</p>
          <p><strong>Subject:</strong> ${contactData.subject || 'No subject'}</p>
          <p><strong>Message:</strong></p>
          <p>${contactData.message.replace(/\n/g, '<br>')}</p>
        `,
      };

      await sgMail.send(msg);
      return { success: true, message: 'Contact form email sent' };
    } catch (error) {
      console.error('Error sending contact form email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }
}

module.exports = new EmailService();
