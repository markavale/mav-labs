const TELEGRAM_API = 'https://api.telegram.org';

function getBotToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not set');
  return token;
}

function getChatId(): string {
  const id = process.env.MAV_TELEGRAM_ID;
  if (!id) throw new Error('MAV_TELEGRAM_ID is not set');
  return id;
}

export async function sendMessage(
  text: string,
  parseMode: 'HTML' | 'Markdown' = 'Markdown'
): Promise<boolean> {
  try {
    const token = getBotToken();
    const chatId = getChatId();

    const res = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: parseMode,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error('[Telegram] sendMessage failed:', res.status, body);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[Telegram] sendMessage error:', err);
    return false;
  }
}

export async function sendProjectUpdate(build: {
  projectName: string;
  status: string;
  repoUrl?: string;
  error?: string;
}): Promise<boolean> {
  const icon = build.error ? '🔴' : build.status === 'complete' ? '✅' : '🔄';
  const lines = [
    `${icon} *Project Update: ${build.projectName}*`,
    `Status: \`${build.status}\``,
  ];

  if (build.repoUrl) {
    lines.push(`Repo: ${build.repoUrl}`);
  }
  if (build.error) {
    lines.push(`Error: ${build.error}`);
  }

  return sendMessage(lines.join('\n'));
}

export async function sendBuildComplete(
  projectName: string,
  repoUrl: string
): Promise<boolean> {
  const text = [
    `🚀 *Build Complete: ${projectName}*`,
    '',
    `Your project is live and pushed to GitHub.`,
    `📦 ${repoUrl}`,
    '',
    '_— Pace AI_',
  ].join('\n');

  return sendMessage(text);
}
