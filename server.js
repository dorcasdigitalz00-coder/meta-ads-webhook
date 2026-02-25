const express = require('express');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const app = express();

app.use(express.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

app.post('/webhook/paystack', (req, res) => {
  const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (hash !== req.headers['x-paystack-signature']) {
    return res.status(400).send('Invalid signature');
  }

  const event = req.body;
  console.log('Webhook received:', event.event);

  if (event.event === 'charge.success') {
    const data = event.data;
    const customerEmail = data.customer.email;
    const customerName = data.metadata?.custom_fields?.find(f => f.variable_name === 'full_name')?.value || 'Student';
    const amount = data.amount / 100;

    const mailOptions = {
      from: `"Meta Ads Mastery" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: '🎉 Welcome to Meta Ads Mastery - Your Course Access',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1877F2, #7c3aed); padding: 40px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">Meta Ads Mastery</h1>
            <p style="margin: 8px 0 0;">Facebook & Instagram Ads Course</p>
          </div>
          <div style="padding: 40px 30px; background: white; color: #333;">
            <div style="font-size: 48px; text-align: center; margin-bottom: 20px;">🎉</div>
            <h2 style="color: #333; margin-bottom: 16px;">Hi ${customerName}! 👋</h2>
            <p style="font-size: 15px; line-height: 1.7; color: #666;">
              <strong>Congratulations!</strong> Your payment of <strong style="color: #F59E0B;">₦${amount.toLocaleString()}</strong> has been confirmed. 
              You now have <strong>lifetime access</strong> to the Meta Ads Mastery Course!
            </p>
            <div style="background: #f8f9fa; border-radius: 8px; padding: 24px; margin: 24px 0; text-align: center;">
              <h3 style="margin: 0 0 16px; color: #333;">🚀 Access Your Course Now</h3>
              <a href="https://t.me/+2g1cPC0xPyQzZjg8" style="display: block; background: linear-gradient(135deg, #1877F2, #7c3aed); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; margin: 12px 0; font-weight: bold;">▶️ Access Course Videos (Telegram)</a>
              <a href="https://chat.whatsapp.com/C84bndfHk5X0rq8UmlFbOI" style="display: block; background: linear-gradient(135deg, #25D366, #128C7E); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; margin: 12px 0; font-weight: bold;">💬 Join WhatsApp Support Group</a>
            </div>
            <div style="background: #fff3cd; border-left: 4px solid #F59E0B; padding: 16px; margin: 20px 0; border-radius: 4px;">
              <strong style="color: #856404;">📌 Important:</strong> Save these links! They are your permanent access to the course.
            </div>
            <p style="font-size: 15px; line-height: 1.7; color: #666;">We're excited to have you in the community! 🔥</p>
          </div>
          <div style="background: #f8f9fa; padding: 24px 30px; text-align: center; font-size: 12px; color: #999;">
            <p>© 2025 Meta Ads Mastery. All rights reserved.</p>
          </div>
        </div>
      `
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.messageId);
      }
    });
  }

  res.status(200).send('Webhook received');
});

app.get('/', (req, res) => {
  res.send('Meta Ads Mastery Webhook Server is running! ✅');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Webhook server running on port ${PORT}`);
  console.log(`📧 Email configured: ${process.env.EMAIL_USER}`);
});
