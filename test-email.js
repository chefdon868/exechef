const dotenv = require('dotenv');
dotenv.config();

const EmailService = require('./src/services/EmailService');

async function testEmails() {
  console.log('\n=== Email Service Test ===\n');

  // Test 1: Welcome email
  console.log('Test 1: Sending welcome email...');
  try {
    const result = await EmailService.sendWelcomeEmail(
      'test@example.com',
      'John Doe'
    );
    console.log('✓ Welcome email:', result);
  } catch (error) {
    console.error('✗ Welcome email failed:', error.message);
  }

  console.log('\n---\n');

  // Test 2: Verification email
  console.log('Test 2: Sending verification email...');
  try {
    const result = await EmailService.sendVerificationEmail(
      'verify@example.com',
      'Jane Smith',
      'verification_token_123456'
    );
    console.log('✓ Verification email:', result);
  } catch (error) {
    console.error('✗ Verification email failed:', error.message);
  }

  console.log('\n---\n');

  // Test 3: Password reset email
  console.log('Test 3: Sending password reset email...');
  try {
    const result = await EmailService.sendPasswordResetEmail(
      'reset@example.com',
      'Bob Johnson',
      'reset_token_789012'
    );
    console.log('✓ Password reset email:', result);
  } catch (error) {
    console.error('✗ Password reset email failed:', error.message);
  }

  console.log('\n---\n');

  // Test 4: Contact form email
  console.log('Test 4: Sending contact form email...');
  try {
    const result = await EmailService.sendContactFormEmail({
      name: 'Alice Wonder',
      email: 'alice@example.com',
      phone: '555-1234',
      subject: 'Question about ExeChef',
      message: 'I have a question about how the COGs calculation works. Can you help me understand the formula?'
    });
    console.log('✓ Contact form email:', result);
  } catch (error) {
    console.error('✗ Contact form email failed:', error.message);
  }

  console.log('\n=== Tests Complete ===\n');
}

testEmails();
