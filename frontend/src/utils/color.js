/* eslint-disable */

// const colorPoints = [
//   [255, 245, 198],
//   [255, 243, 184],
//   [255, 214, 214],
//   [255, 201, 201],
//   [255, 192, 192],
// ];

// const colorPoints = [
//   [188,255,194],
//   [188,226,255],
//   [255,188,221],
//   [255,214,188],
//   [204,170,255],
// ]

// const colorPoints = [
//   [161, 104, 249],
//   [158, 197, 226],
//   [225, 225, 225],
//   [200, 164, 233],
//   [246, 192, 248],
// ];

const colorPoints = [
  [115, 58, 135],
  [30, 77, 90],
  [231, 63, 35],
  [255, 192, 0],
  [154, 200, 60],
];

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

class ColorMap {
  constructor(points) {
    this.points = points;
    this.cdf = compute_cdf(points);
    console.log(this.cdf);
  }

  findBand(prop) {
    for (let i = 0, len = this.cdf.length; i < len; i++) {
      if (prop <= this.cdf[i]) return i;
    }
  }

  colorFromText(text) {
    const num = cyrb53(text);
    const prop = toProp(num, 11593);
    const bandIndex = this.findBand(prop);
    const prefValue = this.cdf[bandIndex - 1] || 0;
    const fraction = (prop - prefValue) / (this.cdf[bandIndex] - prefValue);
    const [r1, g1, b1] = this.points[bandIndex];
    const [r2, g2, b2] = this.points[bandIndex + 1];
    return [
      interpolate(r1, r2, fraction),
      interpolate(g1, g2, fraction),
      interpolate(b1, b2, fraction),
    ];
  }
}

const colorMap = new ColorMap(colorPoints);

const textToColor = (text) => {
  const [r, g, b] = colorMap.colorFromText(text);
  const bgcolor = RGBToHex(r, g, b);
  const fgcolor = foregroundColor(r, g, b);
  return [`#${bgcolor}`, `#${fgcolor}`];
};

export { textToColor };
