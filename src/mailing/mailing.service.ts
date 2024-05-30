import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { google } from 'googleapis';

import { SendConfirmMailDto } from './dto/send-confirmation-link.dto';

@Injectable()
export class MailingService {

  constructor(
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
  ) {
  }

  private async setTransport() {
    const OAuth2 = google.auth.OAuth2;
    const oauth2Client = new OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      process.env.OAUTHREDIRECTURI,
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.REFRESH_TOKEN
    });

    const accessToken:string = await new Promise((resolve, reject) => {
      oauth2Client.getAccessToken((err, token) => {
        if (err) {
          console.log(err);
          reject(err);
        }
        resolve(token!);
      });
    });

    const transporter = this.mailerService.addTransporter('gmail',{
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL,
        accessToken,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.CLIENT_SECRET
      }
    });

    return transporter;
  }

  public async sendConfirmationLink({ link, email, template, subject }: SendConfirmMailDto) {
    await this.setTransport();
    await this.mailerService.sendMail({
      transporterName: 'gmail',
      to: email,
      from: 'noreply@urlshortner.com',
      subject: subject,
      template: template,
      context: {
        email,
        link,
      },
    });
  }

}
