import nodemailer from "nodemailer";

export const sendEmail = async (options) => {
    try {
        // Support both object and individual parameters for backward compatibility
        const { to, subject, text, html } = typeof options === 'string'
            ? { to: options, subject: arguments[1], text: arguments[2], html: null }
            : options;

        const transporter = nodemailer.createTransport({
            host: process.env.MAILTRAP_SMTP_HOST,
            port: process.env.MAILTRAP_SMTP_PORT,
            secure: process.env.MAILTRAP_SMTP_PORT == 465, // true for 465, false for other ports
            auth: {
                user: process.env.MAILTRAP_SMTP_USERNAME,
                pass: process.env.MAILTRAP_SMTP_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_FROM || "TicketAI <noreply@ticketai.com>",
            to,
            subject,
            text,
        };

        // Add HTML if provided
        if (html) {
            mailOptions.html = html;
        }

        const info = await transporter.sendMail(mailOptions);
        console.log("Message sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};