/* eslint-disable prettier/prettier */
export function verifyEmailTemplate(name: string, otp: string): string {
  return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title></title>
      </head>
      <body>
          <h1>Welcome ${name}</h1>
          <p>Please verify your email via OTP. This OTP will expire after 2 minutes</p>
          <h2>${otp}</h2>
      </body>
      </html>`;
}
