const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const config = require('../config/config');
const logger = require('../config/logger');

// Create a transporter
const transport = nodemailer.createTransport(config.email.smtp);

// Verify connection
if (config.env !== 'test') {
  transport
    .verify()
    .then(() => logger.info('Connected to email server'))
    .catch((error) => logger.warn('Unable to connect to email server. Make sure you have configured the SMTP options.', error));
}

/**
 * Compile email template with handlebars
 * @param {string} templateName
 * @param {Object} data
 * @returns {string}
 */
const compileTemplate = (templateName, data) => {
  const templatePath = path.join(__dirname, `../templates/emails/${templateName}.html`);
  const source = fs.readFileSync(templatePath, 'utf-8');
  const template = handlebars.compile(source);
  return template(data);
};

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @param {string} html
 * @returns {Promise}
 */
const sendEmail = async (to, subject, text, html) => {
  const msg = { from: config.email.from, to, subject, text, html };
  await transport.sendMail(msg);
};

/**
 * Send verification email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendVerificationEmail = async (to, token) => {
  const subject = '7irafie - Email Verification';
  const verificationEmailUrl = `${config.clientUrl}/verify-email?token=${token}`;
  const html = compileTemplate('verification', {
    name: to.split('@')[0],
    verificationEmailUrl,
  });
  const text = `Dear user,
  To verify your email, please click on this link: ${verificationEmailUrl}
  If you did not create an account, then ignore this email.`;
  await sendEmail(to, subject, text, html);
};

/**
 * Send password reset email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendResetPasswordEmail = async (to, token) => {
  const subject = '7irafie - Reset Password';
  const resetPasswordUrl = `${config.clientUrl}/reset-password?token=${token}`;
  const html = compileTemplate('resetPassword', {
    name: to.split('@')[0],
    resetPasswordUrl,
  });
  const text = `Dear user,
  To reset your password, please click on this link: ${resetPasswordUrl}
  If you did not request any password resets, then ignore this email.`;
  await sendEmail(to, subject, text, html);
};

/**
 * Send order confirmation email
 * @param {string} to
 * @param {Object} order
 * @returns {Promise}
 */
const sendOrderConfirmationEmail = async (to, order) => {
  const subject = '7irafie - Order Confirmation';
  const html = compileTemplate('orderConfirmation', {
    name: to.split('@')[0],
    orderId: order.id,
    orderDetails: order,
    orderUrl: `${config.clientUrl}/orders/${order.id}`,
  });
  const text = `Dear user,
  Your order has been confirmed. Order ID: ${order.id}.
  You can view your order details at: ${config.clientUrl}/orders/${order.id}`;
  await sendEmail(to, subject, text, html);
};

/**
 * Send order status update email
 * @param {string} to
 * @param {Object} order
 * @returns {Promise}
 */
const sendOrderStatusUpdateEmail = async (to, order) => {
  const subject = `7irafie - Order Status Update: ${order.status}`;
  const html = compileTemplate('orderStatusUpdate', {
    name: to.split('@')[0],
    orderId: order.id,
    status: order.status,
    orderDetails: order,
    orderUrl: `${config.clientUrl}/orders/${order.id}`,
  });
  const text = `Dear user,
  Your order status has been updated to: ${order.status}. Order ID: ${order.id}.
  You can view your order details at: ${config.clientUrl}/orders/${order.id}`;
  await sendEmail(to, subject, text, html);
};

/**
 * Send new order notification to artisan
 * @param {string} to
 * @param {Object} order
 * @returns {Promise}
 */
const sendNewOrderNotificationEmail = async (to, order) => {
  const subject = '7irafie - New Order Received';
  const html = compileTemplate('newOrderNotification', {
    name: to.split('@')[0],
    orderId: order.id,
    orderDetails: order,
    orderUrl: `${config.clientUrl}/orders/${order.id}`,
  });
  const text = `Dear artisan,
  You have received a new order. Order ID: ${order.id}.
  You can view the order details at: ${config.clientUrl}/orders/${order.id}`;
  await sendEmail(to, subject, text, html);
};

module.exports = {
  transport,
  sendEmail,
  sendVerificationEmail,
  sendResetPasswordEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail,
  sendNewOrderNotificationEmail,
};