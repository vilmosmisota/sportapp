import { Tenant } from "@/entities/tenant/Tenant.schema";

export interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent?: string;
}

// Base template with tenant branding
function getBaseTemplate(tenant: Tenant, content: string): string {
  const logo = tenant.tenantConfigs?.general?.logo;
  const primaryColor = "#007bff"; // You could make this configurable per tenant

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${tenant.name}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid ${primaryColor}; padding-bottom: 20px;">
        ${
          logo
            ? `<img src="${logo}" alt="${tenant.name}" style="max-height: 60px; margin-bottom: 10px;">`
            : ""
        }
        <h1 style="color: ${primaryColor}; margin: 0;">${tenant.name}</h1>
        <p style="color: #666; margin: 5px 0 0 0;">${
          tenant.tenantConfigs?.general?.description ||
          "Sports Management Platform"
        }</p>
      </div>
      
      <div style="margin-bottom: 30px;">
        ${content}
      </div>
      
      <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #666; font-size: 12px;">
        <p>This email was sent by ${tenant.name}</p>
        <p>Powered by SportWise</p>
      </div>
    </body>
    </html>
  `;
}

export const welcomeEmailTemplate = (
  tenant: Tenant,
  userName: string,
  loginUrl?: string
): EmailTemplate => {
  const content = `
    <h2>Welcome to ${tenant.name}!</h2>
    <p>Hi ${userName},</p>
    <p>Welcome to our sports management platform! We're excited to have you join our community.</p>
    
    ${
      loginUrl
        ? `
      <div style="text-align: center; margin: 30px 0;">
        <a href="${loginUrl}" style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Access Your Account
        </a>
      </div>
    `
        : ""
    }
    
    <p>If you have any questions, feel free to reach out to our support team.</p>
    <p>Best regards,<br>The ${tenant.name} Team</p>
  `;

  return {
    subject: `Welcome to ${tenant.name}!`,
    htmlContent: getBaseTemplate(tenant, content),
    textContent: `Welcome to ${
      tenant.name
    }!\n\nHi ${userName},\n\nWelcome to our sports management platform! We're excited to have you join our community.\n\n${
      loginUrl ? `Access your account: ${loginUrl}\n\n` : ""
    }If you have any questions, feel free to reach out to our support team.\n\nBest regards,\nThe ${
      tenant.name
    } Team`,
  };
};

export const passwordResetTemplate = (
  tenant: Tenant,
  resetLink: string,
  userName?: string
): EmailTemplate => {
  const content = `
    <h2>Password Reset Request</h2>
    <p>${userName ? `Hi ${userName},` : "Hello,"}</p>
    <p>We received a request to reset your password for your ${
      tenant.name
    } account.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetLink}" style="background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Reset Your Password
      </a>
    </div>
    
    <p>This link will expire in 24 hours for security reasons.</p>
    <p>If you didn't request this password reset, please ignore this email or contact our support team if you have concerns.</p>
    <p>Best regards,<br>The ${tenant.name} Team</p>
  `;

  return {
    subject: `Reset Your ${tenant.name} Password`,
    htmlContent: getBaseTemplate(tenant, content),
    textContent: `Password Reset Request\n\n${
      userName ? `Hi ${userName},` : "Hello,"
    }\n\nWe received a request to reset your password for your ${
      tenant.name
    } account.\n\nReset your password: ${resetLink}\n\nThis link will expire in 24 hours for security reasons.\n\nIf you didn't request this password reset, please ignore this email.\n\nBest regards,\nThe ${
      tenant.name
    } Team`,
  };
};

export const invitationEmailTemplate = (
  tenant: Tenant,
  inviterName: string,
  inviteLink: string,
  roleName?: string
): EmailTemplate => {
  const content = `
    <h2>You're Invited to Join ${tenant.name}</h2>
    <p>Hello,</p>
    <p>${inviterName} has invited you to join ${
    tenant.name
  } on our sports management platform.</p>
    
    ${
      roleName
        ? `<p>You've been assigned the role of <strong>${roleName}</strong>.</p>`
        : ""
    }
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${inviteLink}" style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Accept Invitation
      </a>
    </div>
    
    <p>This invitation will expire in 7 days.</p>
    <p>If you have any questions, feel free to contact ${inviterName} or our support team.</p>
    <p>Best regards,<br>The ${tenant.name} Team</p>
  `;

  return {
    subject: `Invitation to Join ${tenant.name}`,
    htmlContent: getBaseTemplate(tenant, content),
    textContent: `You're Invited to Join ${
      tenant.name
    }\n\nHello,\n\n${inviterName} has invited you to join ${
      tenant.name
    } on our sports management platform.\n\n${
      roleName ? `You've been assigned the role of ${roleName}.\n\n` : ""
    }Accept invitation: ${inviteLink}\n\nThis invitation will expire in 7 days.\n\nBest regards,\nThe ${
      tenant.name
    } Team`,
  };
};

export const notificationEmailTemplate = (
  tenant: Tenant,
  title: string,
  message: string,
  actionUrl?: string,
  actionText?: string
): EmailTemplate => {
  const content = `
    <h2>${title}</h2>
    <p>${message}</p>
    
    ${
      actionUrl && actionText
        ? `
      <div style="text-align: center; margin: 30px 0;">
        <a href="${actionUrl}" style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          ${actionText}
        </a>
      </div>
    `
        : ""
    }
    
    <p>Best regards,<br>The ${tenant.name} Team</p>
  `;

  return {
    subject: `${tenant.name}: ${title}`,
    htmlContent: getBaseTemplate(tenant, content),
    textContent: `${title}\n\n${message}\n\n${
      actionUrl ? `${actionText}: ${actionUrl}\n\n` : ""
    }Best regards,\nThe ${tenant.name} Team`,
  };
};
