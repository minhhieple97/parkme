import { InputType, Field, OmitType, PartialType } from "@nestjs/graphql";
import { SignupInput } from "./signup.input";
import { IsOptional } from "class-validator";

@InputType()
export class UpdateUserInput extends PartialType(
  OmitType(SignupInput, ["avatar", "password"] as const)
) {
  @Field({ nullable: true })
  @IsOptional()
  avatar?: string;
}
