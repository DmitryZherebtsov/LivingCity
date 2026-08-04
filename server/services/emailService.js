const axios = require("axios");

const SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
const TEMPLATE_APPROVE = process.env.EMAILJS_TEMPLATE_APPROVE_ID;
const TEMPLATE_REJECT = process.env.EMAILJS_TEMPLATE_REJECT_ID;
const USER_ID = process.env.EMAILJS_USER_ID;
const ACCESS_TOKEN = process.env.EMAILJS_ACCESS_TOKEN;

const SEND_URL = "https://api.emailjs.com/api/v1.0/email/send";

async function sendEmail(templateId, toEmail, params = {}) {
  const payload = {
    service_id: SERVICE_ID,
    template_id: templateId,
    user_id: USER_ID,
    template_params: {
      to_email: toEmail,
      ...params,
    },
  };

  return axios.post(SEND_URL, payload, {
    headers: { "Content-Type": "application/json" },
  });
}

async function sendApprovedEmail(toEmail, params) {
  return sendEmail(TEMPLATE_APPROVE, toEmail, params);
}

async function sendRejectedEmail(toEmail, params) {
  return sendEmail(TEMPLATE_REJECT, toEmail, params);
}

module.exports = {
  sendApprovedEmail,
  sendRejectedEmail,
};
