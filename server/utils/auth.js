import jwt from "jsonwebtoken";


const verifyToken = (req, res, next) => {
  try {
   
    const token = req.cookies.token; 

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: User is not signed in" });
    }

   

    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    

    req.userId = decoded.userId; 
    next(); 
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

export default verifyToken;
