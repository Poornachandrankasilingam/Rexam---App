import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

console.log('RESEND_API_KEY present:', !!process.env.RESEND_API_KEY, 'Length:', process.env.RESEND_API_KEY?.length);
console.log('FROM_EMAIL:', process.env.FROM_EMAIL);
console.log('EMAIL_FROM:', process.env.EMAIL_FROM);

async function testResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('❌ No RESEND_API_KEY found in process.env');
    return;
  }

  const target = 'poornachandran106@gmail.com';
  
  // Test 1: with onboarding@resend.dev
  console.log('\n--- Test 1: Sending with onboarding@resend.dev ---');
  try {
    const res1 = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: 'Rexam Auth <onboarding@resend.dev>',
        to: [target],
        subject: 'Rexam Verification Test OTP',
        html: '<strong>Your 6-digit OTP is: 123456</strong>'
      })
    });
    const data1 = await res1.json();
    console.log('Status 1:', res1.status, JSON.stringify(data1));
  } catch (err: any) {
    console.error('Error 1:', err.message);
  }

  // Test 2: with FROM_EMAIL if set
  if (process.env.FROM_EMAIL) {
    console.log(`\n--- Test 2: Sending with FROM_EMAIL (${process.env.FROM_EMAIL}) ---`);
    try {
      const res2 = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          from: `Rexam Auth <${process.env.FROM_EMAIL}>`,
          to: [target],
          subject: 'Rexam Verification Test OTP',
          html: '<strong>Your 6-digit OTP is: 123456</strong>'
        })
      });
      const data2 = await res2.json();
      console.log('Status 2:', res2.status, JSON.stringify(data2));
    } catch (err: any) {
      console.error('Error 2:', err.message);
    }
  }
}

testResend();
