const fs = require('fs');
try {
    const content = fs.readFileSync('.env', 'utf8');
    console.log('File length:', content.length);
    console.log('First 50 chars:', content.substring(0, 50).replace(/\r/g, '\\r').replace(/\n/g, '\\n'));
    const match = content.match(/DATABASE_URL=(.*)/);
    if (match) {
        console.log('DATABASE_URL found manually, length:', match[1].trim().length);
    } else {
        console.log('DATABASE_URL NOT found manually');
    }
} catch (e) {
    console.error(e);
}
