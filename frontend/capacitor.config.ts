import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.eunaman.checklist',
    appName: 'Eunaman Checklist',
    webDir: 'out',
    server: {
        url: 'https://eunaman.vercel.app/checklist-app',
        cleartext: true
    }
};

export default config;
