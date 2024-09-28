import { User } from "@prisma/client";

export type AuthPayload = {
  username: string;
  sub: string;
  role: User["role"];
};
