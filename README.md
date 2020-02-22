# renditioner

Renditioner is a NodeJS Image Rendition Generator. It uses [sharpjs](https://github.com/lovell/sharp) to generate a given set of Renditions in a given set of filetypes. 

## Installing

```
npm i renditioner
```

## Usage

```
import { renderImages } from 'renditioner';

const sources = 'src/images/**/*.*';
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
await renderImages({ sources, fileTypes: ['webp', 'jpeg'], renditions, basedir: "src/images/", target: "dist" });
```

## RenderOptions
| key       | description                                                           |
|------------|------------------------------------------------------------------------------|
| sources:    | glob or Array of glob describing paths to all image you want to be processed |
| fileTypes:  | Array the target-filetype you want your images to be rendered in ('webp', 'jpeg')  |
| renditions: | Array of all Renditions you want to be processed |
| basedir:    | releative path-anchor to create target paths (defaults to rootdir)  |
| target:     | target path   |

### Rendition
Renditions are defined as objects with with and height (optional)

```
interface Rendition {
  width: number;
  height?: number;
  aspectRatio?: string; // (e.g. 16:9)
}
```

