import { Injectable, BadRequestException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { User } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthPayload } from "./types";
import { ACCESS_TOKEN_KEY, AVATAR_FOLDER, MAX_IMAGE_SIZE } from "src/constants";
import { AwsService } from "src/aws/aws.service";
import * as Joi from "joi";
import { v4 as uuidv4 } from "uuid";
import { UpdateUserInput } from "./dtos/update-user.dto";
import { UpdateAvatarInput } from "./dtos/update-avatar.dto";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private awsService: AwsService
  ) {}

  async validateUser(username: string, pass: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      return user;
    }
    return null;
  }

  async login(user: User) {
    const payload: AuthPayload = {
      username: user.username,
      sub: user.id,
      role: user.role,
    };
    return {
      [ACCESS_TOKEN_KEY]: this.jwtService.sign(payload),
    };
  }

  async signup(userData: {
    username: string;
    password: string;
    email: string;
    fullName: string;
    avatar?: string;
  }): Promise<User> {
    const existingUser = await this.prisma.user.findUnique({
      where: { username: userData.username },
    });
    if (existingUser) {
      throw new BadRequestException("Username already exists");
    }

    if (userData.avatar) {
      this.validateBase64Image(userData.avatar);
      const avatarUrl = await this.uploadBase64ImageToS3(
        userData.avatar,
        AVATAR_FOLDER
      );
      userData.avatar = avatarUrl;
    }

    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(userData.password, salt);

    const user = await this.prisma.user.create({
      data: {
        username: userData.username,
        email: userData.email,
        fullName: userData.fullName,
        passwordHash: hash,
        passwordSalt: salt,
        avatar: userData.avatar,
      },
    });

    return user;
  }

  private validateBase64Image(base64Image: string): void {
    const schema = Joi.string()
      .pattern(/^data:image\/\w+;base64,/)
      .max(MAX_IMAGE_SIZE)
      .required();

    const { error } = schema.validate(base64Image);
    if (error) {
      throw new BadRequestException(
        "Invalid base64 image or image size exceeds 5MB"
      );
    }
  }

  private async uploadBase64ImageToS3(
    base64Image: string,
    folder: string
  ): Promise<string> {
    const buffer = Buffer.from(
      base64Image.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );
    const key = `${folder}/${uuidv4()}.jpg`;

    const uploadResult = await this.awsService.uploadFile(
      buffer,
      key,
      "image/jpeg"
    );
    return uploadResult;
  }

  async updateUser(userId: string, data: UpdateUserInput): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        ...(data.username !== undefined && { username: data.username }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.fullName !== undefined && { fullName: data.fullName }),
        ...(data.avatar !== undefined && { avatar: data.avatar }),
      },
    });
  }

  async updateAvatar(userId: string, data: UpdateAvatarInput): Promise<User> {
    this.validateBase64Image(data.base64Image);
    const avatarUrl = await this.uploadBase64ImageToS3(
      data.base64Image,
      AVATAR_FOLDER
    );

    return this.prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
    });
  }
}
