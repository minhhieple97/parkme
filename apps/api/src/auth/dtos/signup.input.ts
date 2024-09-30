import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsEmail, MinLength, IsOptional } from 'class-validator';

@InputType()
export class SignupInput {
  @Field()
  @IsNotEmpty()
  username: string;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsNotEmpty()
  fullName: string;

  @Field()
  @MinLength(6)
  password: string;

  @Field({ nullable: true })
  @IsOptional()
  avatar?: string;
}
