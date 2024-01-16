/* eslint-disable prettier/prettier */
export function forgotPasswordLinkTemplate(name: string, link: string): string {
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
            <p>Please click this link to reset your password. This link will expire after 2 minutes</p>
            <p>${link}</p>
        </body>
        </html>`;
  }
  