const express = require('express');
const router = express.Router();
const Card = require('../models/Card');
const logger = require('../config/logger');
const { uploadImage } = require('../middleware/upload');

// ── POST /api/cards/upload - Upload card image (avatar, logo, signature, background) ──
router.post('/upload', uploadImage.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    logger.info(`[cards.upload] image uploaded successfully: ${imageUrl}`);

    return res.status(200).json({
      success: true,
      imageUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  } catch (error) {
    logger.error('[cards.upload] error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Image upload failed' });
  }
});

// ── GET /api/cards - Get all cards (with optional search/filter) ────────────────
router.get('/', async (req, res) => {
  try {
    const { search, cardType, status } = req.query;
    const filter = {};

    if (cardType) filter.cardType = cardType;
    if (status) filter.status = status;
    if (search) {
      const escaped = String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { title: { $regex: escaped, $options: 'i' } },
        { 'personal.fullName': { $regex: escaped, $options: 'i' } },
        { 'personal.jobTitle': { $regex: escaped, $options: 'i' } },
        { 'personal.organization': { $regex: escaped, $options: 'i' } },
        { 'personal.idNumber': { $regex: escaped, $options: 'i' } },
        { 'contact.email': { $regex: escaped, $options: 'i' } },
      ];
    }

    const cards = await Card.find(filter).sort({ updatedAt: -1 }).lean();
    return res.json({ success: true, count: cards.length, cards });
  } catch (error) {
    logger.error('[cards.get] error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── GET /api/cards/public/:id or /verify/:id - Public Verification Endpoint ─────
router.get(['/public/:id', '/verify/:id'], async (req, res) => {
  try {
    const { id } = req.params;
    let card = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      card = await Card.findById(id).lean();
    } else {
      card = await Card.findOne({ 'personal.idNumber': id }).lean();
    }

    if (!card) {
      return res.status(404).json({
        success: false,
        verified: false,
        message: 'Identity Card record not found or revoked.',
      });
    }

    // Increment scan counter in background
    Card.findByIdAndUpdate(card._id, { $inc: { 'analytics.qrScans': 1 } }).catch(() => {});

    return res.json({
      success: true,
      verified: card.status === 'active' && card.isVerified !== false,
      card,
      verificationDetails: {
        status: card.status || 'active',
        issuedBy: card.issuedBy || 'JobHive Official Identity Authority',
        verifiedAt: new Date().toISOString(),
        securityBadge: card.security?.badgeLabel || 'VERIFIED IDENTITY',
        authSignature: `JHV-AUTH-SEC-${card._id.toString().slice(-6).toUpperCase()}`,
      },
    });
  } catch (error) {
    logger.error('[cards.public] error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── GET /api/cards/:id - Get single card ──────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const card = await Card.findById(id).lean();
    if (!card) return res.status(404).json({ success: false, message: 'Card not found' });
    return res.json({ success: true, card });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── POST /api/cards - Create new identity card ────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const cardData = req.body;
    const newCard = await Card.create(cardData);
    logger.info(`[cards] created new iCard: ${newCard._id} for ${newCard.personal?.fullName}`);
    return res.status(201).json({ success: true, card: newCard });
  } catch (error) {
    logger.error('[cards.create] error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── PUT /api/cards/:id - Update card ──────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cardData = req.body;

    const updated = await Card.findByIdAndUpdate(id, cardData, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Card not found' });

    return res.json({ success: true, card: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── DELETE /api/cards/:id - Delete card ───────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Card.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Card not found' });
    return res.json({ success: true, message: 'Card deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── GET /api/cards/:id/vcard - Generate and download standard vCard (.vcf) ────
router.get('/:id/vcard', async (req, res) => {
  try {
    const { id } = req.params;
    const card = await Card.findById(id).lean();

    if (!card) {
      return res.status(404).json({ success: false, message: 'Card not found' });
    }

    // Increment vCard download metric
    Card.findByIdAndUpdate(id, { $inc: { 'analytics.vcardDownloads': 1 } }).catch(() => {});

    const { personal = {}, contact = {}, socials = {} } = card;
    const nameParts = (personal.fullName || 'Contact').split(' ');
    const lastName = nameParts.length > 1 ? nameParts.pop() : '';
    const firstName = nameParts.join(' ');

    const vCardLines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `N:${lastName};${firstName};;;`,
      `FN:${personal.fullName || 'Contact'}`,
      personal.organization ? `ORG:${personal.organization}${personal.department ? ';' + personal.department : ''}` : '',
      personal.jobTitle ? `TITLE:${personal.jobTitle}` : '',
      contact.email ? `EMAIL;TYPE=INTERNET,WORK:${contact.email}` : '',
      contact.phone ? `TEL;TYPE=CELL,VOICE:${contact.phone}` : '',
      contact.website ? `URL;TYPE=WORK:${contact.website}` : '',
      contact.address ? `ADR;TYPE=WORK:;;${contact.address};;;;` : '',
      personal.bio ? `NOTE:${personal.bio.replace(/\n/g, ' ')}` : '',
      socials.linkedin ? `X-SOCIALPROFILE;TYPE=linkedin:https://linkedin.com/in/${socials.linkedin}` : '',
      socials.github ? `X-SOCIALPROFILE;TYPE=github:https://github.com/${socials.github}` : '',
      socials.twitter ? `X-SOCIALPROFILE;TYPE=twitter:https://twitter.com/${socials.twitter}` : '',
      'END:VCARD',
    ].filter(Boolean).join('\r\n');

    const filename = `${(personal.fullName || 'identity_card').toLowerCase().replace(/\s+/g, '_')}.vcf`;

    res.setHeader('Content-Type', 'text/vcard; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(vCardLines);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── POST /api/cards/:id/scan - Track QR Scan ─────────────────────────────────
router.post('/:id/scan', async (req, res) => {
  try {
    const { id } = req.params;
    await Card.findByIdAndUpdate(id, { $inc: { 'analytics.qrScans': 1 } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// ── POST /api/cards/:id/view - Track Card View ───────────────────────────────
router.post('/:id/view', async (req, res) => {
  try {
    const { id } = req.params;
    await Card.findByIdAndUpdate(id, { $inc: { 'analytics.views': 1 } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

module.exports = router;
