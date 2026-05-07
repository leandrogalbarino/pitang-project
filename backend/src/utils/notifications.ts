const NTFY_TOPIC = 'pitang_reimbursements_notifications'; 
const NTFY_URL = `https://ntfy.sh/${NTFY_TOPIC}`;

export const sendNotification = async (title: string, message: string) => {
  try {
    await fetch(NTFY_URL, {
      method: 'POST',
      body: message,
      headers: {
        'Title': title,
        'Priority': 'default',
        'Tags': 'money_with_wings,bell'
      }
    });
    console.log(`[Notification] Sent: ${title}`);
  } catch (error) {
    console.error('[Notification] Error sending notification:', error);
  }
};
