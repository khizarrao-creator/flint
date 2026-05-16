const fs = require('fs');
let c = fs.readFileSync('enhanced-schema.prisma', 'utf8');
const lines = c.split(/\r?\n/);
let outputLines = [
  'generator client {',
  '  provider        = "prisma-client-js"',
  '  previewFeatures = ["metrics"]',
  '}',
  '',
  'datasource db {',
  '  provider = "postgresql"',
  '  url      = env("DATABASE_URL")',
  '}',
  ''
];

// Skip to line 11 (index 10)
outputLines = outputLines.concat(lines.slice(10));
fs.writeFileSync('enhanced-schema.prisma', outputLines.join('\n'));
