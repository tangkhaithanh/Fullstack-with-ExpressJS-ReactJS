// ...existing code...
const { createUserService, loginService, getUserService } = require("../services/userService");

const createUser = async (req, res) => {
  const { name, email, password } = req.body;
  const data = await createUserService(name, email, password);

  if (!data) return res.status(500).json({ EC: -1, EM: "Unexpected service response" });

  if (data.EC === 0) return res.status(201).json(data);
  if (data.EC === 1) return res.status(400).json(data); // e.g. user exists
  return res.status(500).json(data);
}

const handleLogin = async (req, res) => {
  const { email, password } = req.body;
  const data = await loginService(email, password);

  if (!data) return res.status(500).json({ EC: -1, EM: "Unexpected service response" });

  if (data.EC === 0) return res.status(200).json(data);
  if (data.EC === 1 || data.EC === 2) return res.status(401).json(data);
  return res.status(500).json(data);
}

const getUser = async (req, res) => {
  const data = await getUserService();
  if (!data) return res.status(500).json({ EC: -1, EM: "Unexpected service response" });
  if (data.EC === 0) return res.status(200).json(data);
  return res.status(500).json(data);
}

const getAccount = async (req, res) => {
  return res.status(200).json({ EC: 0, EM: "OK", DT: req.user });
}

module.exports = {
  createUser,
  handleLogin,
  getUser,
  getAccount
}
// ...existing code...