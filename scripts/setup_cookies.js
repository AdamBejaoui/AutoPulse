const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
let envContent = '';

if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
}

// Clean up old FB_COOKIES if they exist
envContent = envContent.split('\n').filter(line => !line.startsWith('FB_COOKIES=')).join('\n');

const cookies = `[{"domain":".facebook.com","expirationDate":1810818455.97409,"hostOnly":false,"httpOnly":true,"name":"ps_l","path":"/","sameSite":"lax","secure":true,"session":false,"storeId":null,"value":"1"},{"domain":".facebook.com","expirationDate":1805988687.001873,"hostOnly":false,"httpOnly":true,"name":"datr","path":"/","sameSite":"no_restriction","secure":true,"session":false,"storeId":null,"value":"UduVaRpn133H5OwOm0_LQMVW"},{"domain":".facebook.com","expirationDate":1784398735.506137,"hostOnly":false,"httpOnly":true,"name":"fr","path":"/","sameSite":"no_restriction","secure":true,"session":false,"storeId":null,"value":"1bVXt3rlCUFk2FdvA.AWcytrN1-QcqUR614VOK_qeI5lg4OLSoZzBsq3gqAhTQ4bbTEWo.Bp5RyP..AAA.0.0.Bp5RyP.AWfxMmRLJc193z0w9jLUIm-VLtM"},{"domain":".facebook.com","expirationDate":1808158735.506208,"hostOnly":false,"httpOnly":true,"name":"xs","path":"/","sameSite":"no_restriction","secure":true,"session":false,"storeId":null,"value":"3%3AtWx4BeeQuMiaaQ%3A2%3A1776622733%3A-1%3A-1%3A%3AAcySDKxx3zaG8lFoU1G9aJeK_opC3LI9Kdg62t7Kpg"},{"domain":".facebook.com","expirationDate":1808158735.506003,"hostOnly":false,"httpOnly":false,"name":"c_user","path":"/","sameSite":"no_restriction","secure":true,"session":false,"storeId":null,"value":"61572109480802"},{"domain":".facebook.com","hostOnly":false,"httpOnly":false,"name":"presence","path":"/","sameSite":null,"secure":true,"session":true,"storeId":null,"value":"C%7B%22t3%22%3A%5B%5D%2C%22utc3%22%3A1776622738152%2C%22v%22%3A1%7D"},{"domain":".facebook.com","hostOnly":false,"httpOnly":true,"name":"ar_debug","path":"/","sameSite":"no_restriction","secure":true,"session":true,"storeId":null,"value":"1"},{"domain":".facebook.com","expirationDate":1810818455.974173,"hostOnly":false,"httpOnly":true,"name":"ps_n","path":"/","sameSite":"no_restriction","secure":true,"session":false,"storeId":null,"value":"1"},{"domain":".facebook.com","expirationDate":1811182734.415913,"hostOnly":false,"httpOnly":true,"name":"sb","path":"/","sameSite":"no_restriction","secure":true,"session":false,"storeId":null,"value":"VNuVacSQ6ISIzwr-xilPcW7N"},{"domain":".facebook.com","expirationDate":1777227542,"hostOnly":false,"httpOnly":false,"name":"wd","path":"/","sameSite":"lax","secure":true,"session":false,"storeId":null,"value":"1365x911"}]`;

envContent += `\nFB_COOKIES='${cookies}'\n`;

fs.writeFileSync(envPath, envContent);
console.log('✅ FB_COOKIES updated successfully in .env');
