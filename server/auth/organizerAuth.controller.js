const organizerService = require('./organizerAuth.service');

async function register(req, res) {
  try {
    const result = await organizerService.registerOrganizer(req.body);

    return res.status(201).json({
      message: 'Organizer registered successfully. Waiting for approval.',
      ...result
    });

  } catch (err) {
    return res.status(400).json({
      error: err.message
    });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    const result = await organizerService.loginOrganizer(email, password);

    return res.status(200).json(result);

  } catch (err) {
    return res.status(err.statusCode || 400).json({
      error: err.message
    });
  }
}


module.exports = {
  register,
  login
};
