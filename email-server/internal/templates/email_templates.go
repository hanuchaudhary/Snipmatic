package templates

import "fmt"

// CompletionEmailTemplate generates a beautiful HTML email template for task completion
func CompletionEmailTemplate(message, userEmail string) string {
	return fmt.Sprintf(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Snipmatic - Task Completed</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            border: 1px solid #e5e5e5;
        }
        .header {
            background: linear-gradient(135deg, #1a1a1a 0%%, #2d2d2d 100%%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
            letter-spacing: -0.5px;
        }
        .header-subtitle {
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 40px 30px;
        }
        .success-icon {
            text-align: center;
            margin-bottom: 30px;
        }
        .success-icon svg {
            width: 80px;
            height: 80px;
        }
        .title {
            font-size: 28px;
            font-weight: 700;
            color: #1a202c;
            text-align: center;
            margin-bottom: 20px;
        }
        .message {
            font-size: 16px;
            color: #4a5568;
            text-align: center;
            margin-bottom: 30px;
            line-height: 1.7;
        }
        .details-box {
            background-color: #f8f8f8;
            border-left: 4px solid #ea580c;
            padding: 20px;
            margin: 30px 0;
            border-radius: 8px;
        }
        .details-title {
            font-size: 16px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 10px;
        }
        .details-text {
            color: #4a4a4a;
            font-size: 14px;
        }
        .cta-button {
            display: block;
            width: 200px;
            margin: 30px auto;
            padding: 15px 30px;
            background: #ea580c;
            color: white !important;
            text-decoration: none !important;
            text-align: center;
            border-radius: 25px;
            font-weight: 600;
            font-size: 16px;
            transition: transform 0.2s ease;
        }
        .cta-button:hover {
            transform: translateY(-2px);
            background: #dc2626;
            color: white !important;
            text-decoration: none !important;
        }
        .cta-button:visited {
            color: white !important;
            text-decoration: none !important;
        }
        .cta-button:link {
            color: white !important;
            text-decoration: none !important;
        }
        .footer {
            background-color: #f8f8f8;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e5e5;
        }
        .footer-text {
            color: #666666;
            font-size: 14px;
            margin-bottom: 15px;
        }
        .social-links {
            margin-top: 20px;
        }
        .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #666666;
            text-decoration: none;
        }
        .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, #e5e5e5, transparent);
            margin: 30px 0;
        }
        @media (max-width: 600px) {
            .container {
                margin: 0;
                border-radius: 0;
            }
            .header, .content, .footer {
                padding: 30px 20px;
            }
            .title {
                font-size: 24px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">✂️ <span style="color: #ea580c;">Snipmatic</span></div>
            <div class="header-subtitle">AI-Powered Video Clipping</div>
        </div>
        
        <div class="content">
            <div class="success-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" fill="#10B981"/>
                    <path d="m9 12 2 2 4-4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            
            <h1 class="title">🎉 Your Video is Ready!</h1>
            
            <p class="message">
               🚀 All set! Your clips are ready to go.
Download them now and share your viral moments across all your socials.
            </p>
            
            <div class="details-box">
                <div class="details-title">📋 Task Details</div>
                <div class="details-text">%s</div>
            </div>
            
            <div class="divider"></div>
            
            <a href="#" class="cta-button" style="color: white !important; text-decoration: none !important; background: #ea580c !important;">View Your Clips</a>
            
            <p style="text-align: center; color: #718096; font-size: 14px; margin-top: 20px;">
                Click the button above to access your processed video clips and start sharing!
            </p>
        </div>
        
        <div class="footer">
            <p class="footer-text">
                Thank you for choosing Snipmatic! We hope your content goes viral! 🚀
            </p>
            <p class="footer-text">
                This is an automated message. Please do not reply to this email.
            </p>
            <div style="margin-top: 20px; font-size: 12px; color: #999999;">
                © 2025 Snipmatic. All rights reserved.<br>
                This email was sent to %s
            </div>
        </div>
    </div>
</body>
</html>`, message, userEmail)
}
