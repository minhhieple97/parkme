import { ObjectType, Field, ID, registerEnumType } from "@nestjs/graphql";
import { Role } from "@prisma/client";

registerEnumType(Role, {
  name: "Role",
});

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  username: string;

  @Field()
  fullName: string;

  @Field()
  email: string;

  @Field(() => Role)
  role: Role;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field()
  avatar?: string;
}
