import { InputType, Field } from "@nestjs/graphql";
import { IsNotEmpty, Matches, MaxLength } from "class-validator";
import { MAX_IMAGE_SIZE } from "src/constants";

@InputType()
export class UpdateAvatarInput {
  @Field()
  @IsNotEmpty()
  @Matches(/^data:image\/\w+;base64,/, {
    message: "Invalid base64 image format",
  })
  @MaxLength(MAX_IMAGE_SIZE, {
    message: `Image size exceeds ${MAX_IMAGE_SIZE} characters`,
  })
  base64Image: string;
}
