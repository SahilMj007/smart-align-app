function otpEmailTemplate({ name, otp }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Smart Align OTP</title>
</head>
<body style="margin:0; padding:0; background:#f1f5f9; font-family:Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="padding:30px 0;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table width="500" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 10px 25px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#2563eb; color:#ffffff; padding:24px; text-align:center;">
              <h2 style="margin:0; font-size:22px;">Smart Align</h2>
              <p style="margin:6px 0 0; font-size:14px; opacity:0.9;">
                Secure OTP Verification
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:28px; color:#0f172a;">

              <p style="font-size:15px;">Hello <b>${name || "User"}</b>,</p>

              <p style="font-size:15px; line-height:1.6;">
                Use the following One-Time Password (OTP) to verify your account:
              </p>

              <!-- OTP box -->
              <div style="
                margin:24px auto;
                width:fit-content;
                padding:14px 28px;
                background:#f1f5f9;
                border-radius:12px;
                font-size:30px;
                letter-spacing:8px;
                font-weight:700;
                color:#2563eb;
                text-align:center;
              ">
                ${otp}
              </div>

              <p style="font-size:14px;">
                ⏳ This OTP is valid for <b>5 minutes</b>.
              </p>

              <p style="font-size:13px; color:#64748b; line-height:1.6;">
                If you did not request this OTP, please ignore this email.  
                For your security, do not share this code with anyone.
              </p>

              <hr style="border:none; border-top:1px solid #e5e7eb; margin:24px 0">

              <p style="font-size:12px; color:#94a3b8; text-align:center;">
                © ${new Date().getFullYear()} Smart Align. All rights reserved.
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
}

module.exports = { otpEmailTemplate };
