# renditioner

Renditioner is a NodeJS Image Rendition Generator. It uses [sharpjs](https://github.com/lovell/sharp) to generate a given set of Renditions in a given set of filetypes. 

## Installing

```
npm i renditioner
```

## Usage

```
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
await renderImages({ sources, fileTypes: ['webp', 'jpeg'], renditions });
```

## RenderOptions
| key       | description                                                           |
|------------|------------------------------------------------------------------------------|
| sources: | glob or Array of glob describing paths to all image you want to be processed |
| fileTypes: | Array the target-filetype you want your images to be rendered in (e.g 'webp', 'jpeg', 'png', etc..)  |
| renditions: | Array of all Renditions you want to be processed |

### Rendition
Renditions are defined as objects with with and height (optional)

```
interface Rendition {
  width: number;
  height?: number;
}
```

