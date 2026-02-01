const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Verify transporter
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Email transporter verification failed:', error.message);
    } else {
        console.log('✅ Email transporter is ready');
    }
});

// Send email
async function sendEmail({ to, subject, html, text }) {
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || '"Immobilien Ghumman" <noreply@immobilien-ghumman.de>',
            to,
            subject,
            text,
            html
        });
        
        console.log('✅ Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
        
    } catch (error) {
        console.error('❌ Email send error:', error);
        return { success: false, error: error.message };
    }
}

// Send inquiry notification to admin
async function sendInquiryNotification(inquiry, property) {
    const subject = `Neue Immobilienanfrage: ${property.title}`;
    
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #336699 0%, #2a5580 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                .property-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #336699; }
                .info-row { margin: 10px 0; }
                .label { font-weight: bold; color: #336699; }
                .button { display: inline-block; background: #336699; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>🏠 Neue Immobilienanfrage</h2>
                </div>
                <div class="content">
                    <p>Sie haben eine neue Anfrage für folgende Immobilie erhalten:</p>
                    
                    <div class="property-info">
                        <h3>${property.title}</h3>
                        <div class="info-row"><span class="label">Typ:</span> ${property.type}</div>
                        <div class="info-row"><span class="label">Preis:</span> €${property.price}</div>
                        <div class="info-row"><span class="label">Standort:</span> ${property.location}</div>
                    </div>
                    
                    <h3>Anfrage-Details:</h3>
                    <div class="property-info">
                        <div class="info-row"><span class="label">Name:</span> ${inquiry.name}</div>
                        <div class="info-row"><span class="label">Email:</span> <a href="mailto:${inquiry.email}">${inquiry.email}</a></div>
                        ${inquiry.phone ? `<div class="info-row"><span class="label">Telefon:</span> <a href="tel:${inquiry.phone}">${inquiry.phone}</a></div>` : ''}
                        <div class="info-row"><span class="label">Nachricht:</span></div>
                        <p style="background: #f0f0f0; padding: 15px; border-radius: 6px;">${inquiry.message}</p>
                        <div class="info-row" style="font-size: 12px; color: #666;">
                            <span class="label">Datum:</span> ${new Date().toLocaleString('de-DE')}
                        </div>
                    </div>
                    
                    <p>Bitte antworten Sie zeitnah auf diese Anfrage.</p>
                    
                    <a href="mailto:${inquiry.email}" class="button">Jetzt antworten</a>
                </div>
            </div>
        </body>
        </html>
    `;
    
    return sendEmail({
        to: process.env.ADMIN_EMAIL,
        subject,
        html,
        text: `Neue Anfrage von ${inquiry.name} (${inquiry.email}) für ${property.title}: ${inquiry.message}`
    });
}

// Send inquiry confirmation to user
async function sendInquiryConfirmation(inquiry, property) {
    const subject = `Ihre Anfrage zu: ${property.title}`;
    
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #336699 0%, #2a5580 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                .property-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .info-row { margin: 10px 0; }
                .label { font-weight: bold; color: #336699; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>✅ Anfrage erhalten</h2>
                </div>
                <div class="content">
                    <p>Liebe/r ${inquiry.name},</p>
                    
                    <p>vielen Dank für Ihr Interesse an unserer Immobilie:</p>
                    
                    <div class="property-info">
                        <h3>${property.title}</h3>
                        <div class="info-row"><span class="label">Typ:</span> ${property.type}</div>
                        <div class="info-row"><span class="label">Preis:</span> €${property.price}</div>
                        <div class="info-row"><span class="label">Standort:</span> ${property.location}</div>
                    </div>
                    
                    <p>Wir haben Ihre Anfrage erhalten und werden uns schnellstmöglich bei Ihnen melden.</p>
                    
                    <p><strong>Ihre Nachricht:</strong></p>
                    <p style="background: #f0f0f0; padding: 15px; border-radius: 6px;">${inquiry.message}</p>
                    
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                    
                    <p style="font-size: 14px; color: #666;">
                        <strong>Immobilien Ghumman</strong><br>
                        Bad Vilbel<br>
                        Tel: +49 (0) 160 98787878<br>
                        Email: info@immobilien-ghumman.de
                    </p>
                </div>
            </div>
        </body>
        </html>
    `;
    
    return sendEmail({
        to: inquiry.email,
        subject,
        html,
        text: `Vielen Dank für Ihre Anfrage zu ${property.title}. Wir melden uns schnellstmöglich bei Ihnen.`
    });
}

// Send welcome email
async function sendWelcomeEmail(user) {
    const subject = 'Willkommen bei Immobilien Ghumman';
    
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #336699 0%, #2a5580 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid #336699; }
                .button { display: inline-block; background: #336699; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🏠 Willkommen!</h1>
                </div>
                <div class="content">
                    <p>Hallo ${user.full_name || user.username},</p>
                    
                    <p>herzlich willkommen bei Immobilien Ghumman! Wir freuen uns, Sie als neues Mitglied begrüßen zu dürfen.</p>
                    
                    <h3>Was Sie jetzt tun können:</h3>
                    
                    <div class="feature">
                        <strong>🔍 Immobilien durchsuchen</strong><br>
                        Entdecken Sie unsere aktuellen Angebote an Wohnungen, Häusern und Gewerbeflächen.
                    </div>
                    
                    <div class="feature">
                        <strong>❤️ Favoriten speichern</strong><br>
                        Markieren Sie interessante Immobilien und greifen Sie jederzeit darauf zu.
                    </div>
                    
                    <div class="feature">
                        <strong>📧 Anfragen stellen</strong><br>
                        Kontaktieren Sie uns direkt zu Ihren Wunschimmobilien.
                    </div>
                    
                    <p>Bei Fragen stehen wir Ihnen jederzeit gerne zur Verfügung.</p>
                    
                    <a href="${process.env.FRONTEND_URL}" class="button">Zur Website</a>
                    
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                    
                    <p style="font-size: 14px; color: #666;">
                        <strong>Immobilien Ghumman</strong><br>
                        Ihr Partner für Immobilien in Bad Vilbel und Umgebung
                    </p>
                </div>
            </div>
        </body>
        </html>
    `;
    
    return sendEmail({
        to: user.email,
        subject,
        html,
        text: `Willkommen bei Immobilien Ghumman, ${user.full_name || user.username}!`
    });
}

module.exports = {
    sendEmail,
    sendInquiryNotification,
    sendInquiryConfirmation,
    sendWelcomeEmail
};
