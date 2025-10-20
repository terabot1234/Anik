// auto-like.js
const axios = require('axios');
require('dotenv').config();

// Configuration
const LIKE_SERVICE_URL = process.env.LIKE_SERVICE_URL || 'http://localhost:3000';
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const USER_ID_PREFIX = process.env.USER_ID_PREFIX || 'freefire_bot';

async function autoLike(postId, count, userId) {
  if (!postId || !Number.isInteger(count) || count < 1) {
    throw new Error('Invalid input: postId and count (positive integer) are required');
  }

  try {
    const response = await axios.post(
      `${LIKE_SERVICE_URL}/posts/${postId}/auto-like`,
      { count, prefixUserId: `${USER_ID_PREFIX}_${userId}` },
      { headers: { 'Content-Type': 'application/json' }, timeout: 5000 }
    );

    return {
      success: true,
      message: `Auto-like added: ${response.data.added}. Total likes: ${response.data.likes}`,
      data: response.data,
    };

  } catch (err) {
    const errorMsg = err?.response?.data?.error || err.message;
    console.error('Auto-like error:', errorMsg);
    throw new Error(errorMsg);
  }
}

async function sendConfirmation(userId, message) {
  if (!PAGE_ACCESS_TOKEN) {
    console.warn('PAGE_ACCESS_TOKEN not set, skipping Messenger notification');
    return;
  }

  try {
    await axios.post(
      `https://graph.facebook.com/v17.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
      { recipient: { id: userId }, message: { text: message } },
      { timeout: 5000 }
    );
    console.log(`Confirmation sent to user ${userId}`);
  } catch (err) {
    console.error('sendConfirmation error:', err?.response?.data?.error?.message || err.message);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const postId = args[0];
  const count = parseInt(args[1], 10);
  const userId = args[2] || 'default_user';

  if (!postId || isNaN(count) || count < 1) {
    console.error('Usage: node auto-like.js <post_id> <count> [user_id]');
    process.exit(1);
  }

  try {
    const result = await autoLike(postId, count, userId);
    console.log(result.message);
    await sendConfirmation(userId, result.message);

  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { autoLike, sendConfirmation };
