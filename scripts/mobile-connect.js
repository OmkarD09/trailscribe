import os from 'os';
import qrcode from 'qrcode-terminal';

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const localIp = getLocalIp();
const mobileUrl = `https://${localIp}:5173`;
const scannerUrl = `https://${localIp}:5173/#specimen-capture`;

console.log('================================================================');
console.log('📱 TRAILSCRIBE SMARTPHONE MOBILE PWA LAUNCHER');
console.log('================================================================\n');

console.log('Point your smartphone camera at the QR code below to connect:\n');
qrcode.generate(scannerUrl, { small: true });

console.log('🌐 Direct Mobile URLs:');
console.log(`   - Home Dashboard:    ${mobileUrl}`);
console.log(`   - Nature Camera HUD: ${scannerUrl}\n`);

console.log('📋 STEP-BY-STEP SMARTPHONE SETUP:');
console.log('1. Ensure your smartphone is connected to the same Wi-Fi network.');
console.log('2. Open the URL or scan the QR code using Chrome (Android) or Safari (iPhone).');
console.log('3. Tap "Advanced" -> "Proceed to 192.168..." to accept the local dev SSL.');
console.log('4. Tap "Allow" when the browser requests Camera permissions.');
console.log('5. Install as Standalone App:');
console.log('   - Android Chrome: Tap menu (⋮) -> "Add to Home screen" or "Install App"');
console.log('   - iPhone Safari: Tap Share (⎋) -> "Add to Home Screen"');
console.log('\n================================================================');
