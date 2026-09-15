import fs from 'fs';
import path from 'path';

const localesDir = path.resolve('src/locales');
const enPath = path.join(localesDir, 'en.json');
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

// Helper to get all nested keys
function getKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys = keys.concat(getKeys(obj[key], prefix + key + '.'));
    } else {
      keys.push(prefix + key);
    }
  }
  return keys;
}

// Helper to set nested key
function setKey(obj, pathStr, value) {
  const parts = pathStr.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]]) current[parts[i]] = {};
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = value;
}

const enKeys = getKeys(enData);
const files = fs.readdirSync(localesDir).filter((f) => f.endsWith('.json') && f !== 'en.json');

files.forEach((file) => {
  const filePath = path.join(localesDir, file);
  let data = {};
  try {
    data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.error(`Error parsing ${file}`, e);
  }

  const existingKeys = getKeys(data);
  let missingCount = 0;

  enKeys.forEach((key) => {
    if (!existingKeys.includes(key)) {
      // Get value from en
      const parts = key.split('.');
      let val = enData;
      parts.forEach((p) => (val = val[p]));
      setKey(data, key, val);
      missingCount++;
    }
  });

  if (missingCount > 0) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
    console.log(`Updated ${file}: added ${missingCount} missing keys.`);
  } else {
    console.log(`${file} is up to date.`);
  }
});
