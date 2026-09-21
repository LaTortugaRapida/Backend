const jwt = require("jsonwebtoken");
const SECRET = process.env.SECRET;

function authenticate(req, res, next) {
    const header = req.headers.authorization;

    if (!header) {
        return res.status(401).json({ error: "No token provided!" });
    }
    const token = header.split(" ")[1];

    try{
        req.user = jwt.verify(token, SECRET);
        next()
    } catch {
        res.status(401).json( {error: "Invalid or expired token!"});
    }
}

function authorize(...allowedRoles) {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({error: "Forbidden"});
        }
        next();
    }
}

module.exports = {authenticate, authorize};