// お問い合わせフォームの送信処理（Vercel Functions / Node.js）
//
// 事前に Vercel の Environment Variables に以下を登録してください。
//   RESEND_API_KEY  … Resend の API キー（https://resend.com で無料取得）
//   MAIL_FROM       … 送信元。例）Pigro お問い合わせ <noreply@pigro-fukuoka.com>
//                     ※ドメイン認証がまだの間は onboarding@resend.dev でも動きます
//   MAIL_TO         … 受信先。例）pigro@pigro-fukuoka.com
//
// 重要：MAIL_FROM に受信用アドレス（pigro@…）をそのまま使うと SPF/DKIM で
// 迷惑メール判定されやすくなります。送信元は noreply@ 等の専用アドレスにし、
// 返信先（Reply-To）にお問い合わせ者のアドレスを入れる構成にしています。

const TO = process.env.MAIL_TO || 'pigro@pigro-fukuoka.com';
const FROM = process.env.MAIL_FROM || 'Pigro お問い合わせ <onboarding@resend.dev>';

const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );

async function send(payload) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
  return res.json();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const name = (body.name || '').trim();
    const company = (body.company || '').trim();
    const email = (body.email || '').trim();
    const tel = (body.tel || '').trim();
    const message = (body.message || '').trim();
    const service = Array.isArray(body.service) ? body.service : [];

    // ハニーポット：自動投稿はここに値が入る。成功を装って静かに破棄する
    if ((body.website || '').trim() !== '') {
      return res.status(200).json({ ok: true });
    }

    if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: '入力内容をご確認ください。' });
    }
    if (message.length > 5000 || name.length > 100) {
      return res.status(400).json({ error: '入力内容が長すぎます。' });
    }

    const services = service.length ? service.join('、') : '（選択なし）';
    const received = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });

    // 1. 社内への通知メール
    await send({
      from: FROM,
      to: [TO],
      reply_to: email,
      subject: `【HP】お問い合わせ：${name} 様${company ? '（' + company + '）' : ''}`,
      html: `
        <div style="font-family:sans-serif;line-height:1.9;font-size:14px;color:#14191b">
          <p>コーポレートサイトのフォームからお問い合わせがありました。</p>
          <table style="border-collapse:collapse;margin-top:12px">
            <tr><td style="padding:6px 16px 6px 0;color:#6b7571">お名前</td><td>${esc(name)}</td></tr>
            <tr><td style="padding:6px 16px 6px 0;color:#6b7571">会社名</td><td>${esc(company) || '—'}</td></tr>
            <tr><td style="padding:6px 16px 6px 0;color:#6b7571">メール</td><td><a href="mailto:${esc(email)}">${esc(email)}</a></td></tr>
            <tr><td style="padding:6px 16px 6px 0;color:#6b7571">電話</td><td>${esc(tel) || '—'}</td></tr>
            <tr><td style="padding:6px 16px 6px 0;color:#6b7571">興味のあるサービス</td><td>${esc(services)}</td></tr>
            <tr><td style="padding:6px 16px 6px 0;color:#6b7571">受信日時</td><td>${esc(received)}</td></tr>
          </table>
          <p style="margin-top:18px;color:#6b7571">お問い合わせ内容</p>
          <div style="white-space:pre-wrap;background:#f1f4f2;padding:16px;border-left:3px solid #2c6a5e">${esc(message)}</div>
        </div>`,
    });

    // 2. お問い合わせ者への自動返信
    await send({
      from: FROM,
      to: [email],
      reply_to: TO,
      subject: '【Pigro株式会社】お問い合わせありがとうございます',
      html: `
        <div style="font-family:sans-serif;line-height:1.95;font-size:14px;color:#14191b">
          <p>${esc(name)} 様</p>
          <p>この度は Pigro株式会社 へお問い合わせいただき、誠にありがとうございます。<br>
          以下の内容で承りました。通常2営業日以内に担当よりご返信いたします。</p>
          <div style="white-space:pre-wrap;background:#f1f4f2;padding:16px;border-left:3px solid #2c6a5e;margin:16px 0">${esc(message)}</div>
          <p style="color:#6b7571;font-size:13px">※本メールは自動送信です。お急ぎの場合は 092-401-3675（平日 9:00–18:00）までお電話ください。</p>
          <hr style="border:0;border-top:1px solid #dce2de;margin:22px 0">
          <p style="font-size:13px;color:#6b7571">
            Pigro株式会社<br>
            〒810-0041 福岡県福岡市中央区大名2丁目4-38-404<br>
            TEL 092-401-3675 ／ pigro@pigro-fukuoka.com<br>
            有料職業紹介事業 厚生労働大臣許可 40-ユ-301648号
          </p>
        </div>`,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('contact form error:', err);
    return res.status(500).json({ error: '送信に失敗しました。' });
  }
}
