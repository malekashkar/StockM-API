import { Router } from "express";
import { Response } from "node-fetch";

import auth from "./auth";

export default async function () {
  const router = Router();
  router.use("/auth", await auth());
  return router;
}

export class FetchError extends Error {
  constructor(message: string, public response: Response) {
    super(message);
  }
}