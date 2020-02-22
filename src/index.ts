import { sync as globS } from 'glob';
import sharp from 'sharp';
import { basename, extname, join, relative, dirname } from 'path';
import fs from 'fs';

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
  dirname: string;
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
    dirname: image.dirname,
  };
};

type fileType = 'webp' | 'jpeg';

const createWebpFile = (rendition: Buffer, filename: string) => {
  return sharp(rendition)
    .webp({ quality: 70 })
    .toFile(`${filename}.webp`);
};

const createJpegFile = (rendition: Buffer, filename: string): Promise<sharp.OutputInfo> => {
  return sharp(rendition)
    .jpeg({
      quality: 90,
      chromaSubsampling: '4:4:4',
    })
    .toFile(`${filename}.jpeg`);
};

const createFiles = (
  renditions: RenditionOptions[],
  fileType: fileType,
  target: string,
): Promise<sharp.OutputInfo[]> => {
  return Promise.all(
    renditions.map((rendition: RenditionOptions) => {
      const targetDir = join(target, rendition.dirname);
      if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
      if (fileType === 'webp') {
        return createWebpFile(rendition.buffer, join(targetDir, rendition.filename));
      } else {
        return createJpegFile(rendition.buffer, join(targetDir, rendition.filename));
      }
    }),
  );
};

interface ImageOptions {
  path: string;
  filename: string;
  dirname: string;
  buffer: Buffer;
}

const importFile = async (path: string, basedir: string): Promise<ImageOptions> => {
  const buffer = await sharp(path).toBuffer();
  return {
    path,
    filename: basename(path, extname(path)),
    dirname: dirname(relative(basedir, path)),
    buffer,
  };
};

interface RenderOptions {
  renditions: Rendition[];
  fileTypes: fileType[];
  sources: srcFilesDef;
  target: string;
  basedir?: string;
}

export const renderImages = async (options: RenderOptions) => {
  const files = getSrcFiles(options.sources);

  if (!fs.existsSync(options.target)) fs.mkdirSync(options.target, { recursive: true });

  return await Promise.all(
    files.map(async file => {
      const curImg = await importFile(file, options.basedir || '.');

      const renditionBuffers = await Promise.all(
        options.renditions.map(rendition => createRendition(curImg, rendition)),
      );

      return await Promise.all(
        options.fileTypes.map(fileType => createFiles(renditionBuffers, fileType, options.target)),
      );
    }),
  );
};
