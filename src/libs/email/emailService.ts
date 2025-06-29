import { Tenant, TenantEmailConfig } from "@/entities/tenant/Tenant.schema";
import { SendSmtpEmail, TransactionalEmailsApi } from "@getbrevo/brevo";
import { z } from "zod";

// Enhanced interfaces with better type safety
export interface EmailOptions {
  to: string | string[]; // Support multiple recipients
  subject: string;
  htmlContent: string;
  textContent?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: EmailAttachment[];
  tags?: string[]; // For email tracking/categorization
}

export interface EmailAttachment {
  name: string;
  content: string; // Base64 encoded
  contentType: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  metadata?: {
    tenantId: number;
    tenantName: string;
    timestamp: Date;
    emailType: "transactional" | "marketing";
  };
}

// Custom error classes for better error handling
export class EmailConfigurationError extends Error {
  constructor(message: string, public tenantName?: string) {
    super(message);
    this.name = "EmailConfigurationError";
  }
}

export class EmailSendError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = "EmailSendError";
  }
}

// Zod schemas for email validation
const EmailSchema = z
  .string()
  .email()
  .transform((email) => email.trim());
const EmailListSchema = z
  .union([
    EmailSchema,
    z.array(EmailSchema).min(1, "At least one email address is required"),
  ])
  .transform((emails) => (Array.isArray(emails) ? emails : [emails]));

const EmailOptionsSchema = z.object({
  to: EmailListSchema,
  subject: z
    .string()
    .min(1, "Email subject cannot be empty")
    .transform((s) => s.trim()),
  htmlContent: z
    .string()
    .min(1, "Email content cannot be empty")
    .transform((s) => s.trim()),
  textContent: z
    .string()
    .optional()
    .transform((s) => s?.trim()),
  replyTo: EmailSchema.optional(),
  cc: z.array(EmailSchema).optional(),
  bcc: z.array(EmailSchema).optional(),
  attachments: z
    .array(
      z.object({
        name: z.string().min(1),
        content: z.string().min(1),
        contentType: z.string().min(1),
      })
    )
    .optional(),
  tags: z.array(z.string()).optional(),
});

// Email validation utilities using Zod
class EmailValidator {
  static validateEmail(email: string): string {
    return EmailSchema.parse(email);
  }

  static validateEmailList(emails: string | string[]): string[] {
    return EmailListSchema.parse(emails);
  }

  static validateEmailOptions(options: EmailOptions): EmailOptions {
    return EmailOptionsSchema.parse(options);
  }
}

// Logger interface for better observability
interface EmailLogger {
  info(message: string, metadata?: Record<string, unknown>): void;
  error(
    message: string,
    error?: unknown,
    metadata?: Record<string, unknown>
  ): void;
  warn(message: string, metadata?: Record<string, unknown>): void;
}

// Default console logger (can be replaced with structured logging)
class ConsoleEmailLogger implements EmailLogger {
  info(message: string, metadata?: Record<string, unknown>): void {
    console.log(
      `[EMAIL-INFO] ${message}`,
      metadata ? JSON.stringify(metadata) : ""
    );
  }

  error(
    message: string,
    error?: unknown,
    metadata?: Record<string, unknown>
  ): void {
    console.error(
      `[EMAIL-ERROR] ${message}`,
      error,
      metadata ? JSON.stringify(metadata) : ""
    );
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    console.warn(
      `[EMAIL-WARN] ${message}`,
      metadata ? JSON.stringify(metadata) : ""
    );
  }
}

class MultitenantEmailService {
  private apiInstance: TransactionalEmailsApi | null = null;
  private readonly logger: EmailLogger;
  private readonly maxRetries: number;
  private readonly retryDelay: number;

  constructor(
    logger: EmailLogger = new ConsoleEmailLogger(),
    maxRetries: number = 3,
    retryDelay: number = 1000
  ) {
    this.logger = logger;
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;
  }

  private async getApiInstance(): Promise<TransactionalEmailsApi> {
    if (this.apiInstance) {
      return this.apiInstance;
    }

    const apiKey = process.env.BREVO_API_KEY;

    if (!apiKey) {
      throw new EmailConfigurationError(
        "BREVO_API_KEY environment variable is not set"
      );
    }

    try {
      this.apiInstance = new TransactionalEmailsApi();

      // Set API key using the correct authentication method
      let apiKeyAuth = (this.apiInstance as any).authentications["api-key"];
      apiKeyAuth.apiKey = apiKey;

      this.logger.info("Brevo API instance initialized successfully");
      return this.apiInstance;
    } catch (error) {
      this.logger.error("Failed to initialize Brevo API instance", error);
      throw new EmailConfigurationError("Failed to initialize email service");
    }
  }

  private validateAndGetEmailConfig(
    tenant: Tenant
  ): Required<Pick<TenantEmailConfig, "senderEmail" | "senderName">> {
    const emailConfig = tenant.tenantConfigs?.emailConfig;

    const senderEmail =
      emailConfig?.senderEmail ||
      process.env.BREVO_SENDER_EMAIL ||
      `noreply@${tenant.domain}`;

    const senderName =
      emailConfig?.senderName ||
      tenant.name ||
      process.env.BREVO_SENDER_NAME ||
      "SportWise";

    // Validate sender email
    try {
      EmailValidator.validateEmail(senderEmail);
    } catch (error) {
      throw new EmailConfigurationError(
        `Invalid sender email configured for tenant ${tenant.name}: ${senderEmail}`,
        tenant.name
      );
    }

    return { senderEmail, senderName };
  }

  private async sendWithRetry(
    sendFunction: () => Promise<any>,
    tenant: Tenant,
    attempt: number = 1
  ): Promise<any> {
    try {
      return await sendFunction();
    } catch (error) {
      if (attempt < this.maxRetries) {
        this.logger.warn(`Email send attempt ${attempt} failed, retrying...`, {
          tenantId: tenant.id,
          tenantName: tenant.name,
          attempt,
        });

        await new Promise((resolve) =>
          setTimeout(resolve, this.retryDelay * attempt)
        );
        return this.sendWithRetry(sendFunction, tenant, attempt + 1);
      }
      throw error;
    }
  }

  private validateEmailOptions(options: EmailOptions): EmailOptions {
    try {
      return EmailValidator.validateEmailOptions(options);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        throw new EmailConfigurationError(
          `Validation error: ${firstError.message} at ${firstError.path.join(
            "."
          )}`
        );
      }
      throw new EmailConfigurationError("Invalid email options provided");
    }
  }

  async sendEmail(
    tenant: Tenant,
    options: EmailOptions,
    emailType: "transactional" | "marketing" = "transactional"
  ): Promise<EmailResult> {
    const startTime = Date.now();
    const metadata = {
      tenantId: tenant.id,
      tenantName: tenant.name,
      timestamp: new Date(),
      emailType,
    };

    try {
      // Validate inputs
      const validatedOptions = this.validateEmailOptions(options);

      const emailConfig = tenant.tenantConfigs?.emailConfig;

      // Check if email type is enabled for this tenant
      const isEnabled =
        emailType === "transactional"
          ? emailConfig?.enableTransactional !== false
          : emailConfig?.enableMarketing === true;

      if (!isEnabled) {
        const error = `${emailType} emails are disabled for tenant ${tenant.name}`;
        this.logger.warn(error, metadata);
        return {
          success: false,
          error,
          metadata,
        };
      }

      const apiInstance = await this.getApiInstance();
      const { senderEmail, senderName } =
        this.validateAndGetEmailConfig(tenant);

      const sendSmtpEmail = new SendSmtpEmail();

      // Configure sender
      sendSmtpEmail.sender = {
        email: senderEmail,
        name: senderName,
      };

      // Configure recipients (already validated and transformed)
      const recipients = validatedOptions.to as string[];
      sendSmtpEmail.to = recipients.map((email: string) => ({ email }));

      if (validatedOptions.cc?.length) {
        sendSmtpEmail.cc = validatedOptions.cc.map((email) => ({ email }));
      }

      if (validatedOptions.bcc?.length) {
        sendSmtpEmail.bcc = validatedOptions.bcc.map((email) => ({ email }));
      }

      // Configure content (already validated and trimmed)
      sendSmtpEmail.subject = validatedOptions.subject;
      sendSmtpEmail.htmlContent = validatedOptions.htmlContent;

      if (validatedOptions.textContent) {
        sendSmtpEmail.textContent = validatedOptions.textContent;
      }

      // Configure reply-to
      const replyToEmail =
        validatedOptions.replyTo || emailConfig?.replyToEmail || senderEmail;
      sendSmtpEmail.replyTo = { email: replyToEmail };

      // Add attachments if provided
      if (validatedOptions.attachments?.length) {
        sendSmtpEmail.attachment = validatedOptions.attachments.map((att) => ({
          name: att.name,
          content: att.content,
          contentType: att.contentType,
        }));
      }

      // Add tags for tracking
      if (validatedOptions.tags?.length) {
        sendSmtpEmail.tags = validatedOptions.tags;
      }

      // Send with retry logic
      const response = await this.sendWithRetry(
        () => apiInstance.sendTransacEmail(sendSmtpEmail),
        tenant
      );

      const duration = Date.now() - startTime;
      this.logger.info(`Email sent successfully to ${recipients.join(", ")}`, {
        ...metadata,
        duration,
        messageId: response.body?.messageId,
      });

      return {
        success: true,
        messageId: response.body?.messageId || "sent",
        metadata,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      this.logger.error(
        `Failed to send email for tenant ${tenant.name}`,
        error,
        { ...metadata, duration }
      );

      return {
        success: false,
        error: errorMessage,
        metadata,
      };
    }
  }

  async sendTransactionalEmail(
    tenant: Tenant,
    options: EmailOptions
  ): Promise<EmailResult> {
    return this.sendEmail(tenant, options, "transactional");
  }

  async sendMarketingEmail(
    tenant: Tenant,
    options: EmailOptions
  ): Promise<EmailResult> {
    return this.sendEmail(tenant, options, "marketing");
  }

  // Bulk email sending with rate limiting
  async sendBulkEmails(
    tenant: Tenant,
    emailList: Array<{ to: string; options: Omit<EmailOptions, "to"> }>,
    emailType: "transactional" | "marketing" = "transactional",
    batchSize: number = 10,
    delayBetweenBatches: number = 1000
  ): Promise<EmailResult[]> {
    const results: EmailResult[] = [];

    for (let i = 0; i < emailList.length; i += batchSize) {
      const batch = emailList.slice(i, i + batchSize);

      const batchPromises = batch.map(({ to, options }) =>
        this.sendEmail(tenant, { ...options, to }, emailType)
      );

      const batchResults = await Promise.allSettled(batchPromises);

      for (const result of batchResults) {
        if (result.status === "fulfilled") {
          results.push(result.value);
        } else {
          results.push({
            success: false,
            error: result.reason?.message || "Batch send failed",
            metadata: {
              tenantId: tenant.id,
              tenantName: tenant.name,
              timestamp: new Date(),
              emailType,
            },
          });
        }
      }

      // Delay between batches to respect rate limits
      if (i + batchSize < emailList.length) {
        await new Promise((resolve) =>
          setTimeout(resolve, delayBetweenBatches)
        );
      }
    }

    return results;
  }

  // Health check method
  async healthCheck(): Promise<{ healthy: boolean; error?: string }> {
    try {
      await this.getApiInstance();
      return { healthy: true };
    } catch (error) {
      return {
        healthy: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Reset connection (useful for testing or config changes)
  resetConnection(): void {
    this.apiInstance = null;
    this.logger.info("Email service connection reset");
  }

  // Get service statistics
  getServiceInfo(): {
    maxRetries: number;
    retryDelay: number;
    hasActiveConnection: boolean;
  } {
    return {
      maxRetries: this.maxRetries,
      retryDelay: this.retryDelay,
      hasActiveConnection: this.apiInstance !== null,
    };
  }
}

// Export singleton instance with default configuration
export const emailService = new MultitenantEmailService();

// Factory function for custom configurations
export function createEmailService(
  logger?: EmailLogger,
  maxRetries?: number,
  retryDelay?: number
): MultitenantEmailService {
  return new MultitenantEmailService(logger, maxRetries, retryDelay);
}

// Convenience function for backward compatibility
export async function sendEmail(
  tenant: Tenant,
  options: EmailOptions
): Promise<EmailResult> {
  return emailService.sendTransactionalEmail(tenant, options);
}
