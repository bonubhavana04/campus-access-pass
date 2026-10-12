
import jwt from "jsonwebtoken";

export function authenticate(req, res, next) {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({
        error: "Authentication required",
    });
    }

    const token = authorization.slice(7);

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ["HS256"],
    });

    if (
        typeof payload !== "object" ||
        !payload.sub ||
        !Number.isInteger(Number(payload.sub)) ||
        !["STUDENT", "APPROVER", "VERIFIER", "ADMIN"].includes(payload.role)
    ) {
        return res.status(401).json({
        error: "Invalid authentication token",
        });
    }

    req.user = {
        id: Number(payload.sub),
        role: payload.role,
    };

    next();
    } catch {
    return res.status(401).json({
        error: "Invalid or expired token",
    });
    }
}

export function allowRoles(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
            error: "Authentication required",
        });
    }

    if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
            error: "You do not have permission to perform this action",
    });
    }

    next();
    };
}
