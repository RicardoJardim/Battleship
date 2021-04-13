const jwt = require("jsonwebtoken");
const config = require("config");

function header(req, res, next) {
  //get the token from the header if present
  const token = req.headers["authorization"];
  //if no token found, return response (without going to the next middelware)
  if (!token)
    return res.status(401).json({
      success: false,
      message: "Not allowed",
    });

  try {
    //if can verify the token, set req.user and pass to next middleware
    const decoded = jwt.verify(token, config.get("myprivatekey"));
    req.user = decoded;
    next();
  } catch (ex) {
    //if invalid token
    res.status(400).send({ success: false, message: "Token invalida." });
  }
}

function params(req, res, next) {
  //get the token from the header if present
  const token = req.params.token;
  //if no token found, return response (without going to the next middelware)
  if (!token)
    return res.status(401).json({
      success: false,
      message: "Acesso não permitido",
    });

  try {
    //if can verify the token, set req.user and pass to next middleware
    const decoded = jwt.verify(token, config.get("myprivatekey"));
    req.user = decoded;
    next();
  } catch (ex) {
    //if invalid token
    res.status(400).send({ success: false, message: "Token invalida." });
  }
}

module.exports = {
  header,
  params,
};
