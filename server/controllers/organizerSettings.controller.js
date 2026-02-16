const organizationService = require('../services/organization.service');
const path = require("path");
const fs = require("fs");

async function getOrganization(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const org = await organizationService.getOrganizationByUserId(userId);
    if (!org) return res.status(404).json({ error: 'Organization not found' });

    const out = {
      id: org.id,
      name: org.name || '',
      website: org.website || '',
      contact_email: org.contact_email || '',
      phone: org.phone || '',
      address: org.address || '',
      city: org.city || '',
      nip_krs: org.nip_krs || '',
      logo_url: org.logo_url || '',
    };

    return res.json(out);
  } catch (err) {
    console.error('getOrganization error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function updateOrganization(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const payload = {
      name: req.body.name,
      website: req.body.website,
      contact_email: req.body.contact_email,
      phone: req.body.phone,
      address: req.body.address,
      city: req.body.city,
      nip_krs: req.body.nip_krs,
      logo_url: req.body.logo_url,
      description: req.body.description,    
      metadata: req.body.metadata || null   
    };

    const updated = await organizationService.updateOrganizationByUserId(userId, payload);

    const out = {
      name: updated.name || '',
      website: updated.website || '',
      contact_email: updated.contact_email || '',
      phone: updated.phone || '',
      address: updated.address || '',
      city: updated.city || '',
      nip_krs: updated.nip_krs || '',
      logo_url: updated.logo_url || ''
    };

    return res.json(out);
  } catch (err) {
    console.error('updateOrganization error', err);
    return res.status(400).json({ error: err.message || 'Update failed' });
  }
}

exports.uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const org = await organizationService.getOrganizationByUserId(req.user.id);
    if (!org) return res.status(404).json({ error: "Organization not found" });

    if (org.logo_url) {
      const oldPath = path.join(__dirname, "..", org.logo_url);
      if (fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
        } catch (e) {
          console.warn("Failed to remove old logo", e);
        }
      }
    }

    // const relativePath = `uploads/organizations/${org.id}/${req.file.filename}`;

    await organizationService.updateOrganizationByUserId(req.user.id, {
      logo_url: req.file.filename,
    });

    res.json({ logo_url: req.file.filename });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.deleteLogo = async (req, res) => {
  try {
    const org = await organizationService.getOrganizationByUserId(req.user.id);
    if (!org || !org.logo_url) {
      return res.status(404).json({ error: "Logo not found" });
    }

    const absPath = path.join(__dirname, "..", org.logo_url);
    if (fs.existsSync(absPath)) fs.unlinkSync(absPath);

    await organizationService.updateOrganizationByUserId(req.user.id, {
      logo_url: null,
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};


module.exports = {
  getOrganization,
  updateOrganization,
  uploadLogo: exports.uploadLogo,
  deleteLogo: exports.deleteLogo
};
