import { getTenantByDomain } from "@/entities/tenant/Tenant.services";
import { emailService } from "@/libs/email/emailService";
import {
  invitationEmailTemplate,
  notificationEmailTemplate,
  passwordResetTemplate,
  welcomeEmailTemplate,
} from "@/libs/email/emailTemplates";
import { getServerClient } from "@/libs/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const {
      tenantDomain,
      to,
      templateType,
      templateData,
      customSubject,
      customHtmlContent,
      customTextContent,
    } = await request.json();

    if (!tenantDomain || !to) {
      return NextResponse.json(
        { error: "Missing required fields: tenantDomain and to" },
        { status: 400 }
      );
    }

    // Get tenant information
    const supabase = getServerClient();
    const tenant = await getTenantByDomain(tenantDomain, supabase);

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    let emailTemplate;

    // Handle different template types
    if (templateType && templateData) {
      switch (templateType) {
        case "welcome":
          emailTemplate = welcomeEmailTemplate(
            tenant,
            templateData.userName,
            templateData.loginUrl
          );
          break;
        case "passwordReset":
          emailTemplate = passwordResetTemplate(
            tenant,
            templateData.resetLink,
            templateData.userName
          );
          break;
        case "invitation":
          emailTemplate = invitationEmailTemplate(
            tenant,
            templateData.inviterName,
            templateData.inviteLink,
            templateData.roleName
          );
          break;
        case "notification":
          emailTemplate = notificationEmailTemplate(
            tenant,
            templateData.title,
            templateData.message,
            templateData.actionUrl,
            templateData.actionText
          );
          break;
        default:
          return NextResponse.json(
            { error: "Invalid template type" },
            { status: 400 }
          );
      }
    } else if (customSubject && customHtmlContent) {
      // Handle custom email content
      emailTemplate = {
        subject: customSubject,
        htmlContent: customHtmlContent,
        textContent: customTextContent,
      };
    } else {
      return NextResponse.json(
        {
          error:
            "Either templateType with templateData or custom content is required",
        },
        { status: 400 }
      );
    }

    // Send the email
    const result = await emailService.sendEmail(tenant, {
      to,
      subject: emailTemplate.subject,
      htmlContent: emailTemplate.htmlContent,
      textContent: emailTemplate.textContent,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        tenant: tenant.name,
      });
    } else {
      return NextResponse.json(
        { error: result.error || "Failed to send email" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Email sending failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
