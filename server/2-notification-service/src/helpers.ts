import { Logger } from 'winston';
import { winstonLogger } from '@notifications/helper/logger';
import { config } from '@notifications/config';
import { IEmailLocals } from '@notifications/helper/email.interface';
import nodemailer, { Transporter } from 'nodemailer';
import Email from 'email-templates';
import path from 'path';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'mail transport helper', 'debug');

async function emailTemplates(template: string, reciver: string, locals: IEmailLocals) {
  try {
    const smtpTransport: Transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: config.SENDER_EMAIL,
        pass: config.SENDER_EMAIL_PASSWORD
      }
    });
    const email: Email = new Email({
      message: {
        from: `Jobber App <${config.SENDER_EMAIL}>`
      },
      send: true,
      preview: false,
      transport: smtpTransport,
      views: {
        options: {
          extension: 'ejs'
        }
      },
      juice: true,
      juiceResources: {
        preserveImportant: true,
        webResources: {
          relativeTo: path.join(__dirname, '../build')
        }
      }
    });

    await email.send({
      template: path.join(__dirname, '..', 'src/emails', template),
      message: {
        to: reciver
      },
      locals: locals
    });
  } catch (error) {
    console.log(error)
    log.error(error);
  }
}

export { emailTemplates };
