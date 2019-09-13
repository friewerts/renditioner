const sharp = require('sharp');
const glob = require('glob');
const { basename } = require('path');

const renderImages = async () => {
  const files = glob.sync('src/images/**/*.jpg');
  return await Promise.all(files.map(async (file) => {
    const curFilename = basename(file, '.jpg');
    const curImg = await sharp(file).toBuffer();

    // generte sizes
    const desk = await sharp(curImg).resize(1224).toBuffer();
    const tab = await sharp(curImg).resize(220, 165).toBuffer();
    const mob = await sharp(curImg).resize(200, 150).toBuffer();

    // Desktop images
    await sharp(desk)
      .webp({reductionEffort: 6, quality: 70})
      .toFile(`target/${curFilename}.webp`);

    await sharp(desk)
      .jpeg({
        quality: 90,
        chromaSubsampling: '4:4:4'
      })
      .toFile(`target/${curFilename}.jpeg`);

    // tablet images
    await sharp(tab)
      .webp({reductionEffort: 6, quality: 70})
      .toFile(`target/${curFilename}__220x165.webp`);

    await sharp(tab)
      .jpeg({
        quality: 90,
        chromaSubsampling: '4:4:4'
      })
      .toFile(`target/${curFilename}__220x165.jpeg`);

    // mobile images
    await sharp(mob)
      .webp({reductionEffort: 6, quality: 70})
      .toFile(`target/${curFilename}__200x150.webp`);

    await sharp(mob)
      .jpeg({
        quality: 90,
        chromaSubsampling: '4:4:4'
      })
      .toFile(`target/${curFilename}__200x150.jpeg`);   

  }));
};
console.time();
renderImages().then(() => console.timeEnd());