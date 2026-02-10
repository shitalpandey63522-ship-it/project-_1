import { Router } from "express";
import { loginUser, registerUser, logOutUser ,refreshAccessToken} from "../controllers/user.controller.js";
import { verifyJWT } from "../middleweares/auth.middleware.js";  
import { upload } from "../middleweares/multer.middleware.js";   

const router = Router();

// Register route
router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 }
  ]),
  registerUser
);

router.route("/register").get((req, res) => {
  res.status(200).json({ message: "GET route working" });
});

// Login route
router.route("/login").post(loginUser);

// Secured logout route
router.route("/logout").post(verifyJWT, logOutUser);
router.route("/refresh-token").post(refreshAccessToken)

export default router;
