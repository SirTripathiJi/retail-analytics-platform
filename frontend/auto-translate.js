import fs from 'fs';
import path from 'path';
import translate from 'translate';

// Configure translation engine
translate.engine = 'google';

const localesDir = path.resolve('./src/locales');
const enPath = path.join(localesDir, 'en.json');
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

// Language code mapping if needed (Google Translate uses standard ISO 639-1)
// 'bn', 'gu', 'hi', 'kn', 'mr', 'pa', 'ta', 'te', 'ur'
const langs = ['hi', 'gu', 'bn', 'kn', 'mr', 'pa', 'ta', 'te', 'ur'];

async function processObject(obj, enObj, langCode, pathPrefix = '') {
  let updatedCount = 0;
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      updatedCount += await processObject(
        obj[key],
        enObj[key] || {},
        langCode,
        `${pathPrefix}${key}.`
      );
    } else {
      const enText = enObj[key];
      const currentText = obj[key];
      // If the localized text is exactly the same as the English text, it means it's untranslated
      // Or if it contains specific words. We'll translate if currentText === enText.
      // Exception: "GST", etc. which might be same, but translate will just return GST anyway.
      // Some keys might just legitimately be the same. But since we used sync-i18n.js to copy english values,
      // all the missing keys are currently exactly equal to enText.
      if (currentText === enText && currentText) {
        // Skip short symbols or acronyms that don't need translation
        if (currentText.length < 2 || ['GST', 'UPI', 'ID'].includes(currentText)) {
          continue;
        }

        try {
          console.log(`Translating [${langCode}] ${pathPrefix}${key}: "${enText}" ...`);
          const translated = await translate(enText, { from: 'en', to: langCode });
          obj[key] = translated;
          updatedCount++;
          // Small delay to avoid rate limiting
          await new Promise((r) => setTimeout(r, 100));
        } catch (e) {
          console.error(`Error translating [${langCode}] ${pathPrefix}${key}:`, e.message);
        }
      }
    }
  }
  return updatedCount;
}

async function run() {
  for (const lang of langs) {
    const p = path.join(localesDir, `${lang}.json`);
    if (!fs.existsSync(p)) continue;

    console.log(`\nProcessing ${lang}.json...`);
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));

    const count = await processObject(data, enData, lang);

    if (count > 0) {
      fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n', 'utf8');
      console.log(`Saved ${lang}.json (${count} keys translated)`);
    } else {
      console.log(`No translations needed for ${lang}.json`);
    }
  }
}

run()
  .then(() => console.log('Auto-translation complete.'))
  .catch(console.error);
