import { IsEmail, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class SendEmailDto {
  @IsEmail()
  @IsNotEmpty()
  to: string;

  @IsOptional()
  @IsEmail()
  from?: string;

  @IsNotEmpty()
  subject: string;

  @IsOptional()
  text?: string;

  @IsOptional()
  html?: string;

  @IsOptional()
  template?: string;

  @IsOptional()
  @IsObject()
  context?: Record<string, any>;

  @IsOptional()
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}
