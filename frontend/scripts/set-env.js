const { writeFileSync, mkdirSync } = require('fs');
const path = require('path');

const apiUrl = process.env.RAILWAY_API_URL || 'http://localhost:3001/api';

const content = `export const environment = {
  production: true,
  apiUrl: '${apiUrl}',
};
`;

const dir = path.join(__dirname, '../src/environments');
mkdirSync(dir, { recursive: true });
writeFileSync(path.join(dir, 'environment.prod.ts'), content);
console.log(`set-env: apiUrl -> ${apiUrl}`);
