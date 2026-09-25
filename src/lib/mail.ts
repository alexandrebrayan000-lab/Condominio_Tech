import nodemailer from 'nodemailer';

const host = process.env.EMAIL_SERVER_HOST;
const port = Number(process.env.EMAIL_SERVER_PORT) || 587;
const user = process.env.EMAIL_SERVER_USER;
const pass = process.env.EMAIL_SERVER_PASSWORD;
const from = process.env.EMAIL_FROM || '"CondomínioTech" <nao-responda@condominiotech.com>';

export const mailTransporter = nodemailer.createTransport({
  host: host || 'smtp.ethereal.email',
  port: port,
  secure: port === 465,
  auth: user && pass ? { user, pass } : undefined,
});

export async function enviarEmailRedefinicao(email: string, token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const resetUrl = `${baseUrl}/redefinir-senha?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Redefinição de Senha - CondomínioTech</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #020617; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #020617; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);">
              <tr>
                <td style="padding: 32px 32px 24px; text-align: center; border-bottom: 1px solid #1e293b;">
                  <div style="display: inline-block; width: 44px; height: 44px; line-height: 44px; border-radius: 12px; background-color: #06b6d4; color: #020617; font-weight: bold; font-size: 20px; margin-bottom: 12px;">
                    CT
                  </div>
                  <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                    Condomínio<span style="color: #22d3ee;">Tech</span>
                  </h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 32px;">
                  <h2 style="margin: 0 0 12px; font-size: 18px; font-weight: 600; color: #ffffff;">
                    Redefinição de Senha
                  </h2>
                  <p style="margin: 0 0 20px; font-size: 14px; line-height: 22px; color: #94a3b8;">
                    Recebemos uma solicitação para redefinir a senha da sua conta vinculada ao e-mail <strong style="color: #f1f5f9;">${email}</strong>.
                  </p>
                  <p style="margin: 0 0 28px; font-size: 14px; line-height: 22px; color: #94a3b8;">
                    Clique no botão abaixo para escolher uma nova senha. Este link é válido por <strong>1 hora</strong>.
                  </p>
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 28px;">
                    <tr>
                      <td align="center">
                        <a href="${resetUrl}" target="_blank" style="display: inline-block; background-color: #06b6d4; color: #020617; font-weight: 700; font-size: 14px; text-decoration: none; padding: 14px 28px; border-radius: 10px; box-shadow: 0 4px 14px rgba(6, 182, 212, 0.35);">
                          Redefinir Minha Senha
                        </a>
                      </td>
                    </tr>
                  </table>
                  <div style="background-color: #020617; border: 1px solid #1e293b; border-radius: 8px; padding: 12px; margin-bottom: 24px; word-break: break-all;">
                    <p style="margin: 0 0 6px; font-size: 11px; color: #64748b;">Se o botão não funcionar, copie e cole o link no seu navegador:</p>
                    <a href="${resetUrl}" target="_blank" style="font-size: 12px; color: #38bdf8; text-decoration: underline;">
                      ${resetUrl}
                    </a>
                  </div>
                  <p style="margin: 0; font-size: 12px; line-height: 18px; color: #64748b;">
                    Se você não solicitou a redefinição de senha, nenhuma ação é necessária. Sua conta permanecerá em segurança.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 32px; background-color: #0b1120; border-top: 1px solid #1e293b; text-align: center;">
                  <p style="margin: 0; font-size: 11px; color: #475569;">
                    © ${new Date().getFullYear()} CondomínioTech • Gestão Inteligente para Condomínios
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  if (!host) {
    console.log('\n======================================================');
    console.log('📧 [EMAIL MOCK / DEV] Link de redefinição de senha:');
    console.log(resetUrl);
    console.log('======================================================\n');
  }

  try {
    return await mailTransporter.sendMail({
      from,
      to: email,
      subject: 'Redefinição de Senha - CondomínioTech',
      html,
    });
  } catch (error) {
    console.error('Erro ao enviar e-mail de redefinição:', error);
    if (process.env.NODE_ENV !== 'production') {
      return { mock: true, resetUrl };
    }
    throw new Error('Falha ao enviar e-mail de redefinição.');
  }
}
