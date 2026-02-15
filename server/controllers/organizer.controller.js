const organizerService = require('../services/organization.service');

async function register(req, res) {
  try {
    const result = await organizerService.registerOrganizer(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
}

async function approve(req, res) {
  try {
    const { userId } = req.params;
    const result = await organizerService.approveOrganizer(userId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function reject(req, res) {
  try {
    const { userId } = req.params;
    const result = await organizerService.rejectOrganizer(userId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function getPending(req, res) {
  try {
    const result = await organizerService.getPendingOrganizers();
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}


module.exports = {
  register,
  approve,
  reject,
  getPending
};
