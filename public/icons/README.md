# PWA Icons

This directory should contain the following icon files:

## Required Icons (for PWA)

| Filename | Size | Purpose |
|----------|------|---------|
| icon-72x72.png | 72x72 | Android/Mobile |
| icon-96x96.png | 96x96 | Android/Mobile |
| icon-128x128.png | 128x128 | Android/Mobile |
| icon-144x144.png | 144x144 | Android/Mobile |
| icon-152x152.png | 152x152 | iOS |
| icon-192x192.png | 192x192 | Android/Favicon |
| icon-384x384.png | 384x384 | Android |
| icon-512x512.png | 512x512 | Android/Play Store |
| icon-maskable-192x192.png | 192x192 | Android Adaptive |
| icon-maskable-512x512.png | 512x512 | Android Adaptive |

## How to Generate

Option 1: Use pwa-asset-generator
```bash
npm install -g pwa-asset-generator
pwa-asset-generator your-logo.png . --background "#EEEEF5" --padding "20%"
```

Option 2: Use online tools
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator

Option 3: Manual creation
- Provide a 512x512 PNG with transparency
- Ensure your logo is centered with padding

## Design Guidelines

- Use your app logo centered in the icon
- Background color should match your app: #EEEEF5
- Keep enough padding for safe areas (especially for maskable icons)
- For maskable icons, ensure content fits within a "safe zone" circle
