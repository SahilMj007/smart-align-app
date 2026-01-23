function resetPasswordTemplate({ name, link }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Reset Your Password</title>
</head>
<body style="margin:0; padding:0; background:#f1f5f9; font-family:Arial, sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
  <tr>
    <td align="center">

      <table width="520" cellpadding="0" cellspacing="0"
        style="background:#ffffff; border-radius:16px; box-shadow:0 10px 25px rgba(0,0,0,0.1); overflow:hidden;">

        <!-- HEADER -->
        <tr>
          <td style="background:#2563eb; color:white; padding:26px; text-align:center;">
            <h2 style="margin:0; font-size:22px;">Smart Align</h2>
            <p style="margin:6px 0 0; font-size:14px; opacity:0.9;">
              Password Reset Request
            </p>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="padding:32px; color:#0f172a;">
            <p style="font-size:15px;">Hello <b>${name || "User"}</b>,</p>

            <p style="font-size:15px; line-height:1.6;">
              We received a request to reset your password.  
              Click the button below to create a new password:
            </p>

            <!-- BUTTON -->
            <div style="text-align:center; margin:30px 0;">
              <a href="${link}"
                 style="
                   background:#2563eb;
                   color:white;
                   padding:14px 28px;
                   border-radius:10px;
                   text-decoration:none;
                   font-weight:600;
                   font-size:15px;
                   display:inline-block;
                 ">
                Reset Password
              </a>
            </div>

            <p style="font-size:14px;">
              ⏳ This link is valid for <b>15 minutes</b>.
            </p>

            <p style="font-size:13px; color:#64748b; line-height:1.6;">
              If you didn’t request this, you can safely ignore this email.  
              Your password will not be changed.
            </p>

            <hr style="border:none; border-top:1px solid #e5e7eb; margin:28px 0">

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

module.exports = { resetPasswordTemplate };
