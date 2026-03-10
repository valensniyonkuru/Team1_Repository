package com.amalitech.communityboard.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Value("${spring.mail.username:noreply@communityboard.com}")
    private String fromEmail;

    @Async
    public void sendVerificationEmail(String to, String token) {
        String verifyUrl = frontendUrl + "/verify-email?token=" + token;
        String subject = "Verify your email - CommunityBoard";
        String body = buildVerificationEmailHtml(verifyUrl);
        sendHtmlEmail(to, subject, body);
    }

    @Async
    public void sendPasswordResetEmail(String to, String token) {
        String resetUrl = frontendUrl + "/reset-password?token=" + token;
        String subject = "Reset your password - CommunityBoard";
        String body = buildPasswordResetEmailHtml(resetUrl);
        sendHtmlEmail(to, subject, body);
    }

    private void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    private String buildVerificationEmailHtml(String verifyUrl) {
        return """
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"></head>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: #f8f9fa; border-radius: 8px; padding: 40px; text-align: center;">
                    <h1 style="color: #333; margin-bottom: 20px;">Verify Your Email</h1>
                    <p style="color: #666; font-size: 16px; line-height: 1.5;">
                        Welcome to CommunityBoard! Please verify your email address by clicking the button below.
                    </p>
                    <a href="%s"
                       style="display: inline-block; background: #4f46e5; color: #fff; padding: 14px 32px;
                              border-radius: 6px; text-decoration: none; font-weight: bold; margin: 24px 0;">
                        Verify Email
                    </a>
                    <p style="color: #999; font-size: 13px; margin-top: 24px;">
                        This link expires in 30 minutes. If you did not create an account, ignore this email.
                    </p>
                </div>
            </body>
            </html>
            """.formatted(verifyUrl);
    }

    private String buildPasswordResetEmailHtml(String resetUrl) {
        return """
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"></head>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: #f8f9fa; border-radius: 8px; padding: 40px; text-align: center;">
                    <h1 style="color: #333; margin-bottom: 20px;">Reset Your Password</h1>
                    <p style="color: #666; font-size: 16px; line-height: 1.5;">
                        We received a request to reset your password. Click the button below to set a new password.
                    </p>
                    <a href="%s"
                       style="display: inline-block; background: #4f46e5; color: #fff; padding: 14px 32px;
                              border-radius: 6px; text-decoration: none; font-weight: bold; margin: 24px 0;">
                        Reset Password
                    </a>
                    <p style="color: #999; font-size: 13px; margin-top: 24px;">
                        This link expires in 20 minutes. If you did not request a password reset, ignore this email.
                    </p>
                </div>
            </body>
            </html>
            """.formatted(resetUrl);
    }
}
