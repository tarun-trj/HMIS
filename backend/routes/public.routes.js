import express from 'express';
import {downloadZip,getDiagonses} from "../controllers/publicDataController.js";
const router = express.Router();

// Fix the route handler to use DataController
router.get('/download', downloadZip);
router.get('/get-diagonses',getDiagonses);


export default router;
