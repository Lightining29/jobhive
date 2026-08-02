/**
 * resumePdfGenerator.service.js
 *
 * Two resume templates:
 *
 * Template 1 — "Classic" (default)
 *   Clean single-column, ATS-safe, matches the Michael Harris style.
 *
 * Template 2 — "Modern Sidebar"
 *   Two-column layout: dark teal left sidebar + white right column.
 *   Includes user profile photo in a circle (if avatar URL is available).
 */
'use strict';

const PdfPrinter = require('pdfmake/src/printer');
const vfsFonts   = require('pdfmake/build/vfs_fonts');
const https      = require('https');
const http       = require('http');

const fontDescriptors = {
  Roboto: {
    normal:      Buffer.from(vfsFonts.pdfMake.vfs['Roboto-Regular.ttf'],      'base64'),
    bold:        Buffer.from(vfsFonts.pdfMake.vfs['Roboto-Medium.ttf'],       'base64'),
    italics:     Buffer.from(vfsFonts.pdfMake.vfs['Roboto-Italic.ttf'],       'base64'),
    bolditalics: Buffer.from(vfsFonts.pdfMake.vfs['Roboto-MediumItalic.ttf'], 'base64'),
  },
};

// ── Fetch image as base64 (for embedding in PDF) ─────────────────────────────
function fetchImageAsBase64(url) {
  return new Promise((resolve) => {
    if (!url || typeof url !== 'string') return resolve(null);
    if (!/^https?:\/\//i.test(url)) return resolve(null);

    const transport = url.startsWith('https') ? https : http;
    const req = transport.get(url, { timeout: 8000 }, (res) => {
      if (res.statusCode !== 200) return resolve(null);
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const buf      = Buffer.concat(chunks);
        const mimeMap  = { 'image/jpeg': 'jpeg', 'image/png': 'png', 'image/webp': 'jpeg', 'image/gif': 'png' };
        const ct       = res.headers['content-type'] || 'image/jpeg';
        const ext      = mimeMap[ct.split(';')[0].trim()] || 'jpeg';
        resolve(`data:image/${ext};base64,${buf.toString('base64')}`);
      });
      res.on('error', () => resolve(null));
    });
    req.on('error',   () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
  });
}

// ── Read image from local disk as base64 ─────────────────────────────────────
function readLocalImageAsBase64(localPath) {
  try {
    const fs   = require('fs');
    const path = require('path');
    // localPath is like /uploads/filename.jpg
    // Actual disk path: backend/uploads/filename.jpg
    const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
    const filename   = path.basename(localPath);
    const fullPath   = path.join(uploadsDir, filename);
    if (!fs.existsSync(fullPath)) return null;
    const buf  = fs.readFileSync(fullPath);
    const ext  = path.extname(filename).slice(1).toLowerCase() || 'jpeg';
    const mime = ext === 'png' ? 'png' : 'jpeg';
    return `data:image/${mime};base64,${buf.toString('base64')}`;
  } catch {
    return null;
  }
}

// ── Get avatar as base64 from any source ──────────────────────────────────────
async function getAvatarBase64(avatarUrl) {
  if (!avatarUrl) return null;
  // Local /uploads/ path — read directly from disk
  if (avatarUrl.startsWith('/uploads/')) {
    return readLocalImageAsBase64(avatarUrl);
  }
  // Absolute HTTP URL (Cloudinary, Google, etc.)
  if (/^https?:\/\//i.test(avatarUrl)) {
    return fetchImageAsBase64(avatarUrl);
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 1 — Classic (single column, ATS-safe)
// ═══════════════════════════════════════════════════════════════════

const T1 = {
  BLACK: '#000000',
  DARK:  '#1a1a1a',
  GREY:  '#444444',
};

function t1SectionHeading(title) {
  return [
    { text: title.toUpperCase(), bold: true, fontSize: 13, color: T1.BLACK, margin: [0, 16, 0, 2] },
    { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1.2, lineColor: T1.BLACK }], margin: [0, 0, 0, 6] },
  ];
}

function t1Experience(exp) {
  const items = [];
  items.push({ text: exp.role || '', bold: true, fontSize: 11, color: T1.BLACK, margin: [0, 4, 0, 1] });
  items.push({
    columns: [
      { text: exp.company || '', italics: true, fontSize: 10, color: T1.GREY, width: '*' },
      { text: exp.duration || '', fontSize: 10, color: T1.GREY, alignment: 'right', width: 'auto' },
    ],
    margin: [0, 0, 0, 3],
  });
  for (const b of exp.bullets || []) {
    items.push({ ul: [{ text: b, fontSize: 10, color: T1.DARK, lineHeight: 1.4 }], margin: [0, 1, 0, 1] });
  }
  return items;
}

function t1Education(edu) {
  return [
    { text: edu.degree || '', bold: true, fontSize: 11, color: T1.BLACK, margin: [0, 4, 0, 1] },
    {
      columns: [
        { text: edu.institution || '', italics: true, fontSize: 10, color: T1.GREY, width: '*' },
        { text: edu.year || '', fontSize: 10, color: T1.GREY, alignment: 'right', width: 'auto' },
      ],
      margin: [0, 0, 0, 2],
    },
    ...(edu.highlights ? [{ text: edu.highlights, fontSize: 10, color: T1.DARK, margin: [0, 0, 0, 2] }] : []),
  ];
}

function buildTemplate1(resume, user) {
  const contactParts = [];
  const loc = resume.location || (user.preferences?.preferredLocations?.[0]) || '';
  if (loc)                         contactParts.push(loc);
  if (user.email)                  contactParts.push(user.email);
  if (user.phone)                  contactParts.push(user.phone);
  if (user.socialLinks?.linkedin)  contactParts.push(user.socialLinks.linkedin.replace(/^https?:\/\/(www\.)?/i, ''));
  if (user.socialLinks?.github)    contactParts.push(user.socialLinks.github.replace(/^https?:\/\/(www\.)?/i, ''));

  const titleLine = resume.title || user.headline || '';

  const skillGroups = [];
  if (resume.skills?.technical?.length) skillGroups.push(resume.skills.technical.join(', '));
  if (resume.skills?.tools?.length)     skillGroups.push(resume.skills.tools.join(', '));
  if (resume.skills?.soft?.length)      skillGroups.push(resume.skills.soft.join(', '));

  const expContent = (resume.experience || []).flatMap(e => t1Experience(e));
  const eduContent = (resume.education  || []).flatMap(e => t1Education(e));

  const certItems = buildCertItems(resume, user, T1.DARK);

  const content = [
    { text: (resume.name || user.name || '').toUpperCase(), fontSize: 26, bold: true, color: T1.BLACK, alignment: 'center', margin: [0, 0, 0, 4] },
    ...(titleLine ? [{ text: titleLine, fontSize: 11, bold: true, color: T1.BLACK, alignment: 'center', margin: [0, 0, 0, 3] }] : []),
    ...(contactParts.length ? [{ text: contactParts.join('  |  '), fontSize: 9.5, color: T1.GREY, alignment: 'center', margin: [0, 0, 0, 4] }] : []),
    ...(resume.summary ? [...t1SectionHeading('Professional Summary'), { text: resume.summary, fontSize: 10.5, color: T1.DARK, lineHeight: 1.45, alignment: 'justify' }] : []),
    ...(expContent.length ? [...t1SectionHeading('Work Experience'), ...expContent] : []),
    ...(eduContent.length ? [...t1SectionHeading('Education'), ...eduContent] : []),
    ...(skillGroups.length ? [...t1SectionHeading('Skills'), ...skillGroups.map(line => ({ ul: [{ text: line, fontSize: 10, color: T1.DARK, lineHeight: 1.4 }], margin: [0, 1, 0, 1] }))] : []),
    ...(certItems.length ? [...t1SectionHeading('Certifications'), ...certItems] : []),
    ...(resume.projects?.length ? [
      ...t1SectionHeading('Projects'),
      ...(resume.projects).flatMap(p => [
        { text: p.name || '', bold: true, fontSize: 11, color: T1.BLACK, margin: [0, 4, 0, 1] },
        ...(p.tech ? [{ text: `Tech Stack: ${p.tech}`, italics: true, fontSize: 10, color: T1.GREY, margin: [0, 0, 0, 2] }] : []),
        { ul: [{ text: p.desc || '', fontSize: 10, color: T1.DARK, lineHeight: 1.4 }], margin: [0, 1, 0, 3] },
      ]),
    ] : []),
  ];

  return {
    pageSize: 'A4', pageMargins: [50, 45, 50, 45],
    content,
    defaultStyle: { font: 'Roboto', fontSize: 10, color: T1.DARK },
  };
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 2 — Modern Sidebar (two-column, teal sidebar)
// ═══════════════════════════════════════════════════════════════════

// ── Build circular SVG avatar using clip-path (proper circle) ────────────────
function buildCircleAvatarSvg(base64DataUri, size = 120) {
  const half = size / 2;
  const r    = half - 2; // radius with 2px border gap
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${size}" height="${size}">` +
    `<defs><clipPath id="cc"><circle cx="${half}" cy="${half}" r="${r}"/></clipPath></defs>` +
    `<image x="0" y="0" width="${size}" height="${size}" href="${base64DataUri}" clip-path="url(#cc)" preserveAspectRatio="xMidYMid slice"/>` +
    `<circle cx="${half}" cy="${half}" r="${r}" fill="none" stroke="white" stroke-width="3"/>` +
    `</svg>`
  );
}

const T2 = {
  SIDEBAR_BG:   '#1a3a4a',   // dark teal (matches screenshot)
  ACCENT:       '#00b4d8',   // cyan-blue for section bars and headings
  ACCENT_DARK:  '#0077a8',
  WHITE:        '#ffffff',
  OFF_WHITE:    '#f0f4f6',
  BODY:         '#1a1a1a',
  GREY:         '#555555',
  LIGHT_GREY:   '#888888',
  SIDEBAR_TEXT: '#d0e8f0',
  TIMELINE:     '#00b4d8',
};

// Sidebar section heading (cyan filled bar)
function t2SidebarHeading(title) {
  return {
    table: {
      widths: ['*'],
      body: [[{
        text: title.toUpperCase(),
        fontSize: 9, bold: true, color: T2.WHITE,
        fillColor: T2.ACCENT,
        alignment: 'center',
        margin: [4, 5, 4, 5],
        border: [false, false, false, false],
      }]],
    },
    layout: 'noBorders',
    margin: [0, 10, 0, 6],
  };
}

// Right column section heading (cyan filled bar, full width)
function t2RightHeading(title) {
  return {
    table: {
      widths: ['*'],
      body: [[{
        text: title.toUpperCase(),
        fontSize: 10, bold: true, color: T2.WHITE,
        fillColor: T2.ACCENT,
        alignment: 'center',
        margin: [6, 6, 6, 6],
        border: [false, false, false, false],
      }]],
    },
    layout: 'noBorders',
    margin: [0, 14, 0, 8],
  };
}

// Timeline item with circle bullet and vertical line
function t2ExpItem(exp) {
  return {
    columns: [
      // Left: circle + vertical line
      {
        width: 16,
        stack: [
          { canvas: [{ type: 'ellipse', x: 5, y: 6, r1: 5, r2: 5, lineColor: T2.ACCENT, lineWidth: 1.5 }] },
          { canvas: [{ type: 'line', x1: 5, y1: 0, x2: 5, y2: 80, lineWidth: 1, lineColor: T2.ACCENT, dash: { length: 3 } }] },
        ],
      },
      // Right: content
      {
        width: '*',
        stack: [
          { text: (exp.role || '').toUpperCase(), bold: true, fontSize: 10.5, color: T2.ACCENT_DARK, margin: [0, 0, 0, 2] },
          { text: exp.company || '', fontSize: 9.5, color: T2.GREY, margin: [0, 0, 0, 1] },
          { text: exp.duration || '', fontSize: 9, color: T2.LIGHT_GREY, margin: [0, 0, 0, 4] },
          { text: (exp.bullets || []).join(' '), fontSize: 9.5, color: T2.BODY, lineHeight: 1.4, alignment: 'justify', margin: [0, 0, 0, 8] },
        ],
        margin: [6, 0, 0, 0],
      },
    ],
    margin: [0, 0, 0, 4],
  };
}

function t2EduItem(edu) {
  return {
    columns: [
      {
        width: 16,
        stack: [
          { canvas: [{ type: 'ellipse', x: 5, y: 6, r1: 5, r2: 5, lineColor: T2.ACCENT, lineWidth: 1.5 }] },
          { canvas: [{ type: 'line', x1: 5, y1: 0, x2: 5, y2: 50, lineWidth: 1, lineColor: T2.ACCENT, dash: { length: 3 } }] },
        ],
      },
      {
        width: '*',
        stack: [
          { text: (edu.degree || '').toUpperCase(), bold: true, fontSize: 10.5, color: T2.ACCENT_DARK, margin: [0, 0, 0, 2] },
          { text: edu.institution || '', fontSize: 9.5, color: T2.GREY, margin: [0, 0, 0, 1] },
          { text: edu.year || '', fontSize: 9, color: T2.LIGHT_GREY, margin: [0, 0, 0, 6] },
          ...(edu.highlights ? [{ text: edu.highlights, fontSize: 9.5, color: T2.BODY, margin: [0, 0, 0, 4] }] : []),
        ],
        margin: [6, 0, 0, 0],
      },
    ],
    margin: [0, 0, 0, 4],
  };
}

function buildTemplate2(resume, user, avatarBase64 = null) {
  const name      = (resume.name || user.name || '').toUpperCase();
  const nameParts = name.split(' ');
  // First name normal weight, last name bold (like template: ANKITA light, TIWARI bold)
  const firstName = nameParts.slice(0, -1).join(' ');
  const lastName  = nameParts.slice(-1)[0] || '';

  const titleLine = (resume.title?.split('|')[0]?.trim()) || user.headline || '';
  const loc       = resume.location || (user.preferences?.preferredLocations?.[0]) || '';

  // All skills combined for sidebar
  const allSkills = [
    ...(resume.skills?.technical || []),
    ...(resume.skills?.tools     || []),
  ].slice(0, 10);

  // Languages from user if available (or from soft skills)
  const languages = (user.languages || []);

  // ── SIDEBAR (left column) ─────────────────────────────────────────────────
  const sidebarContent = [
    // Profile photo — SVG circle with clip-path (proper circular crop)
    avatarBase64
      ? {
          svg:       buildCircleAvatarSvg(avatarBase64, 130),
          width:     130,
          alignment: 'center',
          margin:    [0, 14, 0, 10],
        }
      : {
          // Placeholder silhouette
          canvas: [
            { type: 'ellipse', x: 65, y: 65, r1: 55, r2: 55, color: T2.ACCENT, lineWidth: 3, lineColor: T2.WHITE },
            { type: 'ellipse', x: 65, y: 55, r1: 24, r2: 24, color: T2.SIDEBAR_BG },
            { type: 'ellipse', x: 65, y: 88, r1: 36, r2: 26, color: T2.SIDEBAR_BG },
          ],
          margin: [0, 10, 0, 10],
        },

    // CONTACT
    t2SidebarHeading('Contact'),
    ...(user.phone ? [
      { text: 'Phone', bold: true, fontSize: 9, color: T2.ACCENT, margin: [0, 3, 0, 1] },
      { text: user.phone, fontSize: 9, color: T2.SIDEBAR_TEXT, margin: [0, 0, 0, 5] },
    ] : []),
    ...(user.email ? [
      { text: 'Email', bold: true, fontSize: 9, color: T2.ACCENT, margin: [0, 0, 0, 1] },
      { text: user.email, fontSize: 8.5, color: T2.SIDEBAR_TEXT, margin: [0, 0, 0, 5] },
    ] : []),
    ...(loc ? [
      { text: 'Address', bold: true, fontSize: 9, color: T2.ACCENT, margin: [0, 0, 0, 1] },
      { text: loc, fontSize: 9, color: T2.SIDEBAR_TEXT, margin: [0, 0, 0, 5] },
    ] : []),
    ...(user.socialLinks?.linkedin ? [
      { text: 'LinkedIn', bold: true, fontSize: 9, color: T2.ACCENT, margin: [0, 0, 0, 1] },
      { text: user.socialLinks.linkedin.replace(/^https?:\/\/(www\.)?/i, ''), fontSize: 8, color: T2.SIDEBAR_TEXT, margin: [0, 0, 0, 5] },
    ] : []),

    // SKILLS
    ...(allSkills.length ? [
      t2SidebarHeading('Skills'),
      ...allSkills.map(s => ({
        columns: [
          { canvas: [{ type: 'ellipse', x: 4, y: 5, r1: 3, r2: 3, color: T2.ACCENT }], width: 12 },
          { text: s, fontSize: 9, color: T2.SIDEBAR_TEXT, width: '*' },
        ],
        margin: [0, 2, 0, 2],
      })),
    ] : []),

    // SOFT SKILLS as "Languages" column (or actual languages)
    ...(resume.skills?.soft?.length ? [
      t2SidebarHeading('Soft Skills'),
      ...resume.skills.soft.map(s => ({
        columns: [
          { canvas: [{ type: 'ellipse', x: 4, y: 5, r1: 3, r2: 3, color: T2.ACCENT }], width: 12 },
          { text: s, fontSize: 9, color: T2.SIDEBAR_TEXT, width: '*' },
        ],
        margin: [0, 2, 0, 2],
      })),
    ] : []),

    // CERTIFICATIONS in sidebar
    ...((resume.certifications?.length || user.certifications?.length) ? [
      t2SidebarHeading('Certifications'),
      ...(resume.certifications?.length ? resume.certifications : (user.certifications || []).map(c => `${c.name}${c.issuer ? ' — ' + c.issuer : ''}`)).map(c => ({
        columns: [
          { canvas: [{ type: 'ellipse', x: 4, y: 5, r1: 3, r2: 3, color: T2.ACCENT }], width: 12 },
          { text: typeof c === 'string' ? c : c.name, fontSize: 8.5, color: T2.SIDEBAR_TEXT, width: '*' },
        ],
        margin: [0, 2, 0, 2],
      })),
    ] : []),
  ];

  // ── RIGHT COLUMN ──────────────────────────────────────────────────────────
  const rightContent = [
    // Name
    {
      text: [
        { text: firstName + ' ', fontSize: 22, bold: false, color: T2.BODY },
        { text: lastName, fontSize: 22, bold: true, color: T2.BODY },
      ],
      alignment: 'center',
      margin: [0, 10, 0, 3],
    },
    { text: titleLine.toUpperCase(), fontSize: 10, bold: true, color: T2.GREY, alignment: 'center', margin: [0, 0, 0, 10] },

    // Summary box (light grey background)
    ...(resume.summary ? [{
      table: {
        widths: ['*'],
        body: [[{
          text: resume.summary,
          fontSize: 9.5, color: T2.BODY, lineHeight: 1.5, alignment: 'justify',
          fillColor: T2.OFF_WHITE,
          border: [false, false, false, false],
          margin: [10, 10, 10, 10],
        }]],
      },
      layout: 'noBorders',
      margin: [0, 0, 0, 6],
    }] : []),

    // Work Experience
    ...(resume.experience?.length ? [
      t2RightHeading('Work Experience'),
      ...(resume.experience || []).map(t2ExpItem),
    ] : []),

    // Education
    ...(resume.education?.length ? [
      t2RightHeading('Education'),
      ...(resume.education || []).map(t2EduItem),
    ] : []),

    // Projects
    ...(resume.projects?.length ? [
      t2RightHeading('Projects'),
      ...(resume.projects || []).map(p => ({
        columns: [
          {
            width: 16,
            stack: [
              { canvas: [{ type: 'ellipse', x: 5, y: 6, r1: 5, r2: 5, lineColor: T2.ACCENT, lineWidth: 1.5 }] },
            ],
          },
          {
            width: '*',
            stack: [
              { text: (p.name || '').toUpperCase(), bold: true, fontSize: 10, color: T2.ACCENT_DARK, margin: [0, 0, 0, 1] },
              ...(p.tech ? [{ text: p.tech, italics: true, fontSize: 9, color: T2.GREY, margin: [0, 0, 0, 2] }] : []),
              { text: p.desc || '', fontSize: 9.5, color: T2.BODY, lineHeight: 1.4, margin: [0, 0, 0, 6] },
            ],
            margin: [6, 0, 0, 0],
          },
        ],
        margin: [0, 0, 0, 2],
      })),
    ] : []),
  ];

  // Two-column table layout — full page fill
  const docDef = {
    pageSize:    'A4',
    pageMargins: [0, 0, 0, 0],

    // Full-page sidebar background drawn before content
    background: function(currentPage, pageSize) {
      return {
        canvas: [{
          type:      'rect',
          x:         0,
          y:         0,
          w:         175,
          h:         pageSize.height,
          color:     T2.SIDEBAR_BG,
        }],
      };
    },

    content: [
      {
        columns: [
          // ── Left sidebar ────────────────────────────────────────────────
          {
            width: 175,
            stack: sidebarContent,
            margin: [12, 12, 12, 0],
          },
          // ── Right content ────────────────────────────────────────────────
          {
            width: '*',
            stack: rightContent,
            margin: [16, 0, 20, 0],
          },
        ],
        columnGap: 0,
      },
    ],
    defaultStyle: { font: 'Roboto', fontSize: 10 },
  };

  return docDef;
}

// ═══════════════════════════════════════════════════════════════════
// SHARED HELPERS
// ═══════════════════════════════════════════════════════════════════

function buildCertItems(resume, user, textColor) {
  const certs = resume.certifications?.length
    ? resume.certifications
    : (user.certifications || []).map(c => `${c.name}${c.issuer ? ' — ' + c.issuer : ''}${c.year ? ' (' + c.year + ')' : ''}`);
  return certs.map(c => ({
    ul: [{ text: typeof c === 'string' ? c : c.name, fontSize: 10, color: textColor }],
    margin: [0, 1, 0, 1],
  }));
}

// ═══════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════

/**
 * @param {object} resume       - Structured resume from voice/resume/build
 * @param {object} user         - User document
 * @param {string} [template]   - 'classic' (default) | 'modern'
 * @returns {Promise<Buffer>}
 */
async function generateResumePdf(resume, user, template = 'classic') {
  // For the modern sidebar, load the user's avatar as base64 (local disk or remote URL)
  let avatarBase64 = null;
  if (template === 'modern' && user.avatar) {
    avatarBase64 = await getAvatarBase64(user.avatar);
  }

  const docDef = template === 'modern'
    ? buildTemplate2(resume, user, avatarBase64)
    : buildTemplate1(resume, user);

  return new Promise((resolve, reject) => {
    const printer = new PdfPrinter(fontDescriptors);
    const pdfDoc  = printer.createPdfKitDocument(docDef);
    const chunks  = [];
    pdfDoc.on('data',  c  => chunks.push(c));
    pdfDoc.on('end',   () => resolve(Buffer.concat(chunks)));
    pdfDoc.on('error', reject);
    pdfDoc.end();
  });
}

module.exports = { generateResumePdf };
