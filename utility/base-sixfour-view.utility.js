const path = require('path');
const fs = require('fs').promises;

async function sendFileFromBase64Txt(fileName) {
  try {
    const filePath = path.join(__dirname, '..', 'public', 'attachment', fileName);
    const base64Data = await fs.readFile(filePath, 'utf8');
    return base64Data;
  } catch (error) {
    console.error('sendFileFromBase64Txt error:', error);
    throw new Error('File not found or unable to read');
  }
}

module.exports = {
  sendFileFromBase64Txt,
};