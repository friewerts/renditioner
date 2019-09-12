const sharp = require('sharp');
const glob = require('glob');
const { basename } = require('path');

const renderImages = async () => {
  const files = glob.sync('src/images/**/*.jpg');
  return await Promise.all(files.map(async (file) => {
    const curFilename = basename(file, '.jpg');
    const curImg = await sharp(file).toBuffer();
    await sharp(curImg)
      .resize(220, 165)
      .webp({reductionEffort: 6, quality: 70})
      .toFile(`target/${curFilename}__220x165.webp`);
    await sharp(curImg)
      .resize(200, 150)
      .webp({reductionEffort: 6, quality: 70})
      .toFile(`target/${curFilename}__200x150.webp`);
  }));
};
console.time();
renderImages().then(() => console.timeEnd());