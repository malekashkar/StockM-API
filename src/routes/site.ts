import { config } from "dotenv";
import express, { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import path from "path";

config();

export const REACT_BUILD_PATH =
  process.env.REACT_BUILD_PATH || path.join(__dirname, "..", "..", "build");

export default async function () {
  const router = Router();

  if (process.env.NODE_ENV === "production") {
    router.use("/", express.static(REACT_BUILD_PATH));
    router.get("*", (_req, res) => {
      res.sendFile(path.join(REACT_BUILD_PATH, "index.html"));
    });
  } else {
    router.use(
      "/",
      createProxyMiddleware({
        target: "http://localhost:3000",
        changeOrigin: true,
      })
    );
  }

  return router;
}