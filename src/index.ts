import { sync as globS } from 'glob';
import * as sharp from 'sharp';
import { basename, extname } from 'path';

type srcFilesDef = string | string[];
const getSrcFiles = (srcFiles: srcFilesDef): string[] => {
  if (typeof srcFiles === 'string') {
    return globS(srcFiles);
  } else {
    let paths: string[] = [];
    srcFiles.forEach(srcFile => {
      paths = paths.concat(globS(srcFile));
    });
    return paths;
  }
};

interface Rendition {
  width: number;
  height?: number;
}

interface RenditionOptions extends Rendition {
  buffer: Buffer;
  filename: string;
}

const getFilename = (renditionOptions: Rendition, image: ImageOptions): string => {
  const base = `${image.filename}__${renditionOptions.width}`;
  if (renditionOptions.height) return `${base}x${renditionOptions.height}`;
  return base;
};

const createRendition = async (image: ImageOptions, options: Rendition): Promise<RenditionOptions> => {
  const resizeOpts = [options.width];

  if (options.height) resizeOpts.push(options.height);

  const buffer = await sharp(image.buffer)
    .resize(...resizeOpts)
    .toBuffer();

  return {
    ...options,
    buffer,
    filename: getFilename(options, image),
  };
};

type fileType = 'webp' | 'jpeg';

const createWebpFile = (rendition: Buffer, filename: string) => {
  return sharp(rendition)
    .webp({ quality: 70 })
    .toFile(`target/${filename}.webp`);
};

const createJpegFile = (rendition: Buffer, filename: string): Promise<sharp.OutputInfo> => {
  return sharp(rendition)
    .jpeg({
      quality: 90,
      chromaSubsampling: '4:4:4',
    })
    .toFile(`target/${filename}.jpeg`);
};

const createFiles = (renditions: RenditionOptions[], fileType: fileType): Promise<sharp.OutputInfo[]> => {
  return Promise.all(
    renditions.map((rendition: RenditionOptions) => {
      if (fileType === 'webp') {
        return createWebpFile(rendition.buffer, rendition.filename);
      } else {
        return createJpegFile(rendition.buffer, rendition.filename);
      }
    }),
  );
};

interface ImageOptions {
  path: string;
  filename: string;
  buffer: Buffer;
}

const importFile = async (path: string): Promise<ImageOptions> => {
  const buffer = await sharp(path).toBuffer();
  return {
    path,
    filename: basename(path, extname(path)),
    buffer,
  };
};

interface RenderOptions {
  renditions: Rendition[];
  fileTypes: fileType[];
  sources: srcFilesDef;
}

const renderImages = async (options: RenderOptions) => {
  const files = getSrcFiles(options.sources);
  return await Promise.all(
    files.map(async file => {
      const curImg = await importFile(file);

      const renditionBuffers = await Promise.all(
        options.renditions.map(rendition => createRendition(curImg, rendition)),
      );

      return await Promise.all(options.fileTypes.map(fileType => createFiles(renditionBuffers, fileType)));
    }),
  );
};

console.time();
const renditions = [
  {
    width: 1224,
  },
  {
    width: 220,
    height: 165,
  },
  {
    width: 200,
    height: 150,
  },
];
const sources = 'src/images/**/*.*';
renderImages({ sources, fileTypes: ['webp', 'jpeg'], renditions }).then(() => console.timeEnd());
