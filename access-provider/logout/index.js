/**
 * Logout user by clearing cookies
 *
 * Input: None required
 *
 * Output:
 * - Clears authentication cookies
 * - Returns success message
 */
async function main(params) {
  try {
    // Create expired cookies to clear them
    const cookies = [
      'access_verification=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0',
      'user_data=; Path=/; Secure; SameSite=Strict; Max-Age=0',
    ];

    return {
      statusCode: 200,
      headers: {
        'Set-Cookie': cookies,
        'Content-Type': 'application/json',
      },
      body: {
        success: true,
        message: 'Logged out successfully',
      },
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Logout error:', error);
    return {
      statusCode: 500,
      body: {
        error: 'Internal server error',
      },
    };
  }
}

exports.main = main;

