import { config } from '@notifications/config';
import { IEmailLocals } from '@notifications/helper/email.interface';
import { winstonLogger } from '@notifications/helper/logger';
import { emailTemplates } from '@notifications/helpers';
import { Logger } from 'winston';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'mail transport', 'debug');

async function sendEmail(template: string, reciverEmail: string, locals: IEmailLocals): Promise<void> {
  try {
    emailTemplates(template, reciverEmail, locals);
    log.info('email send successfully ...');
  } catch (error) {
    log.log('error', 'notification service mail transport MailTransport sendEmail() method error :', error);
  }
}

export { sendEmail };
