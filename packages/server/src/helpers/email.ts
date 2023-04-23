import config from 'config';
import { SendMailOptions, createTransport } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport/index.js';

const transportConfig = config.get<SMTPTransport.Options>('smtp');

const transporter = createTransport(transportConfig);

export const sendEmail = async (options: SendMailOptions) => {
  return await transporter.sendMail(options);
};
