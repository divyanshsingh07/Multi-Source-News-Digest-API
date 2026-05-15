import { Router } from "express";
import {
  getArticleById,
  getDigest,
  getHealth,
  getTopicByName,
  getTopics,
} from "../controllers/newsController.js";

const router = Router();

router.get("/health", getHealth);
router.get("/digest", getDigest);
router.get("/topics", getTopics);
router.get("/topic/:name", getTopicByName);
router.get("/article/:id", getArticleById);

export default router;
