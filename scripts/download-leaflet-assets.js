const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const LEAFLET_ASSETS = [
  {
    url: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    destination: 'marker-icon.png'
  },
  {
    url: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    destination: 'marker-icon-2x.png'
  },
  {
    url: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    destination: 'marker-shadow.png'
  }
];

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Download each asset
LEAFLET_ASSETS.forEach(asset => {
  const destinationPath = path.join(publicDir, asset.destination);
  
  // Skip if file already exists
  if (fs.existsSync(destinationPath)) {
    console.log(`✓ ${asset.destination} already exists`);
    return;
  }
  
  console.log(`Downloading ${asset.url}...`);
  
  // Download the file
  const file = fs.createWriteStream(destinationPath);
  https.get(asset.url, response => {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log(`✓ Downloaded ${asset.destination}`);
    });
  }).on('error', err => {
    fs.unlink(destinationPath);
    console.error(`× Error downloading ${asset.url}:`, err.message);
  });
});

console.log('Done!'); 