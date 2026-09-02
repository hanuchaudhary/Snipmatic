import { ModalClient } from "modal";

export const modal = new ModalClient({
    tokenId: process.env.MODAL_TOKEN_ID!,
    tokenSecret: process.env.MODAL_TOKEN_SECRET!,
});