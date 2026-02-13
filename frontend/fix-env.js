const fs = require('fs');

function fixEnv(filename) {
    if (!fs.existsSync(filename)) return;
    const buffer = fs.readFileSync(filename);

    // Check for UTF-16 LE BOM (0xFF 0xFE)
    if (buffer[0] === 0xFF && buffer[1] === 0xFE) {
        console.log(`Fixing ${filename}: Found UTF-16 LE BOM`);
        let content = buffer.toString('utf16le');
        if (content.charCodeAt(0) === 0xFEFF) {
            content = content.substring(1);
        }
        fs.writeFileSync(filename, content, 'utf8');
        console.log(`${filename} converted to UTF-8`);
    } else if (buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
        console.log(`Fixing ${filename}: Found UTF-8 BOM, removing it`);
        const content = buffer.slice(3);
        fs.writeFileSync(filename, content, 'utf8');
    } else {
        console.log(`${filename} seems to be already in a compatible encoding or has no BOM`);
    }
}

fixEnv('.env');
fixEnv('.env.local');
