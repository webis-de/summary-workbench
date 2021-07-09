/* eslint-disable */

// const colorMap = [
//   [255, 245, 198],
//   [255, 243, 184],
//   [255, 214, 214],
//   [255, 201, 201],
//   [255, 192, 192],
// ];

const colorMap = [
[115,58,135],
[30,77,90],
[231,63,35],
[255,192,0],
[154,200,60],
]

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

const randomColor = (num) => {
  const c = (num & 0xffffff).toString(16).toUpperCase();
  return "00000".substring(0, 6 - c.length) + c;
};

const hexToRGB = (hex) => {
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
};

const RGBToHex = (r, g, b) => [r, g, b].map(c => c.toString(16).padStart(2, "0")).join("")

const foregroundColor = (backgroundColor) => {
  const [r, g, b] = hexToRGB(backgroundColor);
  return r * 0.299 + g * 0.587 + b * 0.114 > 150 ? "000000" : "ffffff";
};

const interpolate = (c1, c2, fraction) => ((c2 - c1) * fraction + c1) | 0

const randomColorFromColorMap = (num) => {
  const colorIndex = num % (colorMap.length - 1)
  const [r1, g1, b1] = colorMap[colorIndex]
  const [r2, g2, b2] = colorMap[colorIndex + 1]
  const fraction = (num % 1001)/1000
  return RGBToHex(interpolate(r1, r2, fraction), interpolate(g1, g2, fraction), interpolate(b1, b2, fraction))
}

const colorMarkup = (num) => {
  const bgcolor = randomColorFromColorMap(num);
  const fgcolor = foregroundColor(bgcolor);
  return [`#${bgcolor}`, `#${fgcolor}`];
};

const textToColor = (text) => colorMarkup(cyrb53(text));

export { textToColor };
