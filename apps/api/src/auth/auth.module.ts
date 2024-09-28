import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthResolver } from "./auth.resolver";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { PrismaService } from "src/prisma/prisma.service";
import { UserModule } from "src/user/user.module";
import { ConfigService } from "@nestjs/config";
import { AwsModule } from "src/aws/aws.module";
import { AwsService } from "src/aws/aws.service";

@Module({
  imports: [
    AwsModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get("JWT_SECRET"),
        signOptions: { expiresIn: configService.get("JWT_EXPIRES_IN") },
      }),
    }),
    UserModule,
  ],
  providers: [
    AuthService,
    AuthResolver,
    JwtStrategy,
    PrismaService,
    AwsService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
