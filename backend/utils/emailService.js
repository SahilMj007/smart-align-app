import axios from "axios";

export const sendEmail = async ({ to, subject, html }) => {
  const res = await axios.post(
    "https://api.brevo.com/v3/smtp/email",
    {
      sender: {
        name: process.env.SENDER_NAME,
        email: process.env.SENDER_EMAIL
      },
      to: [{ email: to }],
      subject,
      htmlContent: html
    },
    {
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json"
      }
    }
  );

  return res.data;
};
