const express = require('express');
const router = express.Router();
const EmailService = require('../services/EmailService');
const { validateContactForm } = require('../middleware/validation');

// Submit contact form
router.post('/contact', validateContactForm, async (req, res) => {
  try {
    const contactData = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      subject: req.body.subject,
      message: req.body.message
    };

    // Send email
    const result = await EmailService.sendContactFormEmail(contactData);

    // Send confirmation response
    res.status(200).json({
      message: 'Contact form submitted successfully',
      result
    });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test email endpoint (development only)
router.post('/test-email', async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name are required' });
    }

    const result = await EmailService.sendWelcomeEmail(email, name);
    res.status(200).json({
      message: 'Test email sent',
      result
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
