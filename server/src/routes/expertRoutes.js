import express from "express";
import { getExpertById, getExperts } from "../controllers/expertController.js";

export const expertRouter = express.Router();

expertRouter.get("/", getExperts);
expertRouter.get("/:id", getExpertById);
