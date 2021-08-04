/* eslint-disable */

const soft = [
  [188, 255, 194],
  [188, 226, 255],
  [255, 188, 221],
  [255, 214, 188],
  [204, 170, 255],
];

const ibm = [
  [100, 143, 255],
  [120, 94, 240],
  [220, 38, 127],
  [254, 97, 0],
  [255, 176, 0],
];

const wong = [
  [0, 0, 0],
  [230, 159, 0],
  [86, 180, 233],
  [0, 158, 115],
  [240, 228, 66],
  [0, 114, 178],
  [213, 94, 0],
  [204, 121, 167],
];

const tol = [
  [51, 34, 136],
  [17, 119, 51],
  [68, 170, 153],
  [136, 204, 238],
  [221, 204, 119],
  [204, 102, 119],
  [170, 68, 153],
  [136, 34, 85],
];

const viridis = [
  [68, 1, 84],
  [58, 82, 139],
  [32, 144, 140],
  [94, 201, 97],
  [253, 231, 36],
];

const grayscale = [
  [0,0,0],
  [204,204,204]
]

const colorPoints = { ibm, wong, tol, soft, viridis, grayscale};

const distance = (vector1, vector2) =>
  Math.sqrt(vector1.map((x, i) => (x - vector2[i]) ** 2).reduce((sum, x) => sum + x));

const compute_cdf = (points) => {
  const bands = points.slice(0, -1).map((point, i) => distance(point, points[i + 1]));
  const sum = bands.reduce((sum, x) => sum + x, 0);
  let currValue = 0;
  const cdf = bands.slice(0, -1).map((band) => {
    currValue += band / sum;
    return currValue;
  });
  cdf.push(1);
  return cdf;
};

const cyrb53 = (str, seed = 0) => {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

const toProp = (num, maxNum) => (num % maxNum) / (maxNum - 1);

const hexToRGB = (hex) => {
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
};

const RGBToHex = (r, g, b) => [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("");

const foregroundColor = (r, g, b) =>
  r * 0.299 + g * 0.587 + b * 0.114 > 150 ? "000000" : "ffffff";

const interpolate = (c1, c2, fraction) => ((c2 - c1) * fraction + c1) | 0;

const randomColor = (text) => {
  const num = cyrb53(text);
  return [(num >> 8) & 0xff, (num >> 16) & 0xff, (num >> 24) & 0xff];
};

class ColorMap {
  constructor(colorscheme, fallbackOnErr = false) {
    this.useColorscheme(colorscheme, fallbackOnErr);
  }

  useColorscheme(colorscheme, fallbackOnErr = false) {
    if (colorscheme in colorPoints) {
      this.colorscheme = colorscheme;
      const points = colorPoints[colorscheme];
      const cdf = compute_cdf(points);
      this.colorInfo = { points, cdf };
    } else if (colorscheme === "colorfull" || fallbackOnErr) {
      this.colorscheme = "colorfull";
      this.colorInfo = null;
    } else throw new Error(`unknown colorscheme ${colorscheme}`);
  }

  findBand(prop) {
    const { cdf } = this.colorInfo;
    for (let i = 0, len = cdf.length; i < len; i++) {
      if (prop <= cdf[i]) return i;
    }
  }

  colorFromText(text) {
    if (this.colorscheme === "colorfull") return randomColor(text);
    const num = cyrb53(text);
    const { cdf, points } = this.colorInfo;
    const prop = toProp(num, 11593);
    const bandIndex = this.findBand(prop);
    const prefValue = cdf[bandIndex - 1] || 0;
    const fraction = (prop - prefValue) / (cdf[bandIndex] - prefValue);
    const [r1, g1, b1] = points[bandIndex];
    const [r2, g2, b2] = points[bandIndex + 1];
    return [
      interpolate(r1, r2, fraction),
      interpolate(g1, g2, fraction),
      interpolate(b1, b2, fraction),
    ];
  }

  textToColor(text) {
    const [r, g, b] = this.colorFromText(text);
    const bgcolor = RGBToHex(r, g, b);
    const fgcolor = foregroundColor(r, g, b);
    return [`#${bgcolor}`, `#${fgcolor}`];
  }
}

const colorschemes = ["colorfull", ...Object.keys(colorPoints)];

export { ColorMap, colorschemes, randomColor, RGBToHex };
