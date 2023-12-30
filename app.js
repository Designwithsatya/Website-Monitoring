const cron = require("cron");
const axios = require("axios");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const express = require("express");

dotenv.config();

const app = express();
const port = process.env.BACKEND_PORT || 5000;
const WEBSITE_URL = process.env.WEBSITE_URL;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_USERNAME = process.env.SMTP_USERNAME;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
const SMTP_TO_EMAIL = process.env.SMTP_TO_EMAIL;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: false,
  auth: {
    user: SMTP_USERNAME,
    pass: SMTP_PASSWORD,
  },
});

async function checkWebsiteHealth() {
  try {
    const response = await axios.get(WEBSITE_URL);
    const isWebsiteHealthy = response.status === 200;

    if (!isWebsiteHealthy) {
      sendNotification(
        "Urgent: Me@Titan Website Issue",
        createEmailContent("Website is down")
      );
    } else {
      console.log("Website is working.");
    }
  } catch (error) {
    console.error("Error checking website health:", error.message);
  }
}
const job = new cron.CronJob("*/10 * * * *", checkWebsiteHealth);

job.start();
function createEmailContent(message) {
  const coloredMessage = `<span style="color: red;">${message}</span>`;
  return `
    <p>Dear Team,</p>
    <p>Our Me@Titan Portal is currently facing technical issues, affecting its normal functionality. This may impact the experience and accessibility for our users.</p>
    <p><strong>Portal Name:</strong> Me@Titan</p>
    <p><strong>Status:</strong> Currently Unavailable</p>
    <p><strong>Issue:</strong> ${coloredMessage}</p>
    <p>Note: This is an auto-generated email by the system. Please do not reply to/on this mail.</p>
  `;
}

async function sendNotification(subject, htmlContent) {
  const mailOptions = {
    from: SMTP_USERNAME,
    to: SMTP_TO_EMAIL,
    cc: [
      "pramodkumar@titan.co.in",
      "kvprasad@titan.co.in",
      "satyendrasingh@titan.co.in",
    ],
    subject,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email notification sent successfully.");
  } catch (error) {
    console.error("Error sending email:", error);
  }
}
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
