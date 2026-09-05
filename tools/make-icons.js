const zlib = require('zlib');
const fs = require('fs');

// ---- Codificador PNG minimo (RGBA, 8 bits, sin filtro) ----
function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = c ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function encodePNG(w, h, rgba) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0; // filtro None
    rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---- Dibujo del icono: sol tras una nube, sobre cuadrado redondeado ----
function draw(S) {
  const px = Buffer.alloc(S * S * 4);
  const SS = 4; // supermuestreo para bordes suaves
  const put = (x, y, r, g, b, a) => {
    const i = (y * S + x) * 4;
    const sa = a, da = px[i + 3] / 255;
    const oa = sa + da * (1 - sa);
    if (oa === 0) return;
    px[i]     = Math.round((r * sa + px[i]     * da * (1 - sa)) / oa);
    px[i + 1] = Math.round((g * sa + px[i + 1] * da * (1 - sa)) / oa);
    px[i + 2] = Math.round((b * sa + px[i + 2] * da * (1 - sa)) / oa);
    px[i + 3] = Math.round(oa * 255);
  };

  const u = S / 32; // todo se define sobre una rejilla de 32
  const roundRect = (x, y) => {
    const r = 7 * u, w = S, h = S;
    const cx = Math.min(Math.max(x, r), w - r), cy = Math.min(Math.max(y, r), h - r);
    return Math.hypot(x - cx, y - cy) <= r;
  };
  const circle = (x, y, cx, cy, rad) => Math.hypot(x - cx * u, y - cy * u) <= rad * u;

  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      let bg = 0, sun = 0, cloud = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const px_ = x + (sx + 0.5) / SS, py_ = y + (sy + 0.5) / SS;
          if (roundRect(px_, py_)) bg++;
          if (circle(px_, py_, 20.8, 11.2, 6.0)) sun++;
          // Nube: tres lobulos mas una base de esquinas redondeadas, de modo
          // que el contorno inferior no forme escalones ni toque el borde.
          const capsule = (x0, x1, y0, y1, r) => {
            const cx = Math.min(Math.max(px_, (x0 + r) * u), (x1 - r) * u);
            const cy = Math.min(Math.max(py_, (y0 + r) * u), (y1 - r) * u);
            return Math.hypot(px_ - cx, py_ - cy) <= r * u;
          };
          if (circle(px_, py_, 12.2, 19.2, 5.3) || circle(px_, py_, 17.8, 17.4, 6.4) ||
              circle(px_, py_, 22.4, 20.4, 4.7) ||
              capsule(6.9, 27.1, 18.5, 24.6, 2.6)) cloud++;
        }
      }
      const n = SS * SS;
      if (bg) put(x, y, 0x10, 0x17, 0x28, bg / n);
      if (sun) put(x, y, 0xff, 0xd4, 0x79, (sun / n) * (bg / n));
      if (cloud) put(x, y, 0xf2, 0xf7, 0xfd, (cloud / n) * (bg / n));
    }
  }
  return px;
}

// ---- Empaquetado ICO (admite PNG embebido) ----
function buildICO(sizes) {
  const imgs = sizes.map((s) => ({ size: s, png: encodePNG(s, s, draw(s)) }));
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(imgs.length, 4);
  let offset = 6 + imgs.length * 16;
  const entries = [], datas = [];
  for (const { size, png } of imgs) {
    const e = Buffer.alloc(16);
    e[0] = size >= 256 ? 0 : size; e[1] = size >= 256 ? 0 : size;
    e[2] = 0; e[3] = 0;
    e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6);
    e.writeUInt32LE(png.length, 8); e.writeUInt32LE(offset, 12);
    entries.push(e); datas.push(png); offset += png.length;
  }
  return Buffer.concat([header, ...entries, ...datas]);
}

fs.writeFileSync(process.argv[2] + '/favicon.ico', buildICO([16, 32, 48]));
fs.writeFileSync(process.argv[2] + '/icon-192.png', encodePNG(192, 192, draw(192)));
fs.writeFileSync(process.argv[2] + '/icon-512.png', encodePNG(512, 512, draw(512)));
fs.writeFileSync(process.argv[2] + '/apple-touch-icon.png', encodePNG(180, 180, draw(180)));
console.log('iconos generados');
