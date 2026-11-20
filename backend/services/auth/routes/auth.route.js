import express from 'express';
import { login, register, loginWithPassword, logOut } from '../controllers/auth.controller.js';

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/login-password", loginWithPassword);
router.get("/logout", logOut);

export default router;
