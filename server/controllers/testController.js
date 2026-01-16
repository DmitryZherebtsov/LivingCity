const testModel = require('../models/testModel');

// CREATE
exports.create = async (req, res) => {
  try {
    const { title } = req.body;
    const item = await testModel.createTestItem(title);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// READ ALL
exports.getAll = async (req, res) => {
  try {
    const items = await testModel.getAllTestItems();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// READ ONE
exports.getOne = async (req, res) => {
  try {
    const item = await testModel.getTestItemById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE
exports.update = async (req, res) => {
  try {
    const { title } = req.body;
    const item = await testModel.updateTestItem(req.params.id, title);
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE
exports.remove = async (req, res) => {
  try {
    await testModel.deleteTestItem(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
