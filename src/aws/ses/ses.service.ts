import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class SESService implements OnModuleInit {
  private transporter: nodemailer.Transporter;
  sourceEmailAddress: string;
  adminEmail: string;

  constructor(private configService: ConfigService) { }

  async onModuleInit() {
    this.sourceEmailAddress = this.configService.get('SOURCE_EMAIL') || 'noreply@certifikedu.local';
    this.adminEmail = this.configService.get('ADMIN_EMAIL') || 'admin@certifikedu.local';

    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST') || 'localhost',
      port: parseInt(this.configService.get('SMTP_PORT') || '1025'),
      ignoreTLS: true,
    });
  }

  async sendRawEmail(nome: string, email: string, phone?: string) {
    try {
      await this.transporter.sendMail({
        from: this.sourceEmailAddress,
        to: this.adminEmail,
        subject: 'Novo usuario cadastrado -- sem documento',
        text: `Nome: ${nome}, email: ${email}, phone: ${phone ?? 'nao informado'}`,
      });
    } catch (err) {
      console.log('[LocalEmail] Error sending raw email:', err.message);
    }
  }

  async sendEmail(emails: string, templateName: string, templateData: any) {
    try {
      await this.transporter.sendMail({
        from: this.sourceEmailAddress,
        to: emails,
        subject: `[CertifikEDU] ${templateName}`,
        html: `<h2>${templateName}</h2><pre>${JSON.stringify(templateData, null, 2)}</pre>`,
      });
    } catch (err) {
      console.log(`[LocalEmail] Error sending template "${templateName}":`, err.message);
    }
  }

  async sendNewUserPassword(destinationEmail: string, password: string, userName: string) {
    return this.sendEmail(destinationEmail, 'TempPassword', { password, name: userName });
  }

  async sendNewDocumentAdmin(userEmail: string) {
    return this.sendEmail(this.adminEmail, 'AdminNewUserVerification', { email: userEmail });
  }

  async sendDocumentReceived(destinationEmail: string, userName: string) {
    return this.sendEmail(destinationEmail, 'DocsReceived', { name: userName });
  }

  async sendApprovedDocument(destinationEmail: string, userName: string) {
    return this.sendEmail(destinationEmail, 'DocsApproved', { name: userName });
  }

  async sendTemplateCreatedCertificate(destinationEmail: string, userName: string, imageUrl: string) {
    return this.sendEmail(destinationEmail, 'CertificateIssued', { imageUrl, name: userName });
  }

  async sendNewUserRequestCertificateAdmin(userEmail: string, certificateId: string) {
    return this.sendEmail(this.adminEmail, 'AdminCertificateVerification', {
      email: userEmail,
      certificateId,
    });
  }
}
