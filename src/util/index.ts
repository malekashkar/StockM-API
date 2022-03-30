import { Response } from "node-fetch";

export class FetchError extends Error {
    constructor(message: string, public response: Response) {
      super(message);
    }
}