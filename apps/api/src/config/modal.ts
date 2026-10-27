import { ModalClient } from "modal";

export const modal = new ModalClient({
  tokenId: process.env.MODAL_TOKEN_ID!,
  tokenSecret: process.env.MODAL_TOKEN_SECRET!,
});

export const MODAL_APP_NAME = process.env.MODAL_APP_NAME ?? "processor";
export const MODAL_FUNCTION_NAME =
  process.env.MODAL_FUNCTION_NAME ?? "process_video";
export const MODAL_ENVIRONMENT = process.env.MODAL_ENVIRONMENT;
