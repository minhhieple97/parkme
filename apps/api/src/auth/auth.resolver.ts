import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { BadRequestException } from '@nestjs/common';
import { LoginResponse } from './dtos/login-response';
import { AuthInput } from './dtos/auth.input';
import { SignupInput } from './dtos/signup.input';
import { User } from 'src/user/user.entity';
import { Role } from '@prisma/client';
import { CurrentUser } from './decorators/current-user.decorator';
import { Auth } from './decorators/auth.decorator';
import { UpdateUserInput } from './dtos/update-user.dto';
import { UpdateAvatarInput } from './dtos/update-avatar.dto';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => LoginResponse)
  async login(@Args('data') data: AuthInput): Promise<LoginResponse> {
    const user = await this.authService.validateUser(data.username, data.password);
    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }
    const token = await this.authService.login(user);

    return { access_token: token.access_token, user };
  }

  @Mutation(() => User)
  async signup(@Args('data') data: SignupInput): Promise<User> {
    return this.authService.signup(data);
  }

  @Query(() => User)
  @Auth()
  async me(@CurrentUser() user: User) {
    return user;
  }

  @Mutation(() => Boolean)
  @Auth(Role.ADMIN, Role.MANAGER)
  async deleteUser(@Args('userId') userId: string, @CurrentUser() user: User): Promise<boolean> {
    console.log('Current user:', user);
    return true;
  }

  @Mutation(() => User)
  @Auth()
  async updateUser(@Args('data') data: UpdateUserInput, @CurrentUser() user: User): Promise<User> {
    return this.authService.updateUser(user.id, data);
  }

  @Mutation(() => User)
  @Auth()
  async updateAvatar(
    @Args('data') data: UpdateAvatarInput,
    @CurrentUser() user: User
  ): Promise<User> {
    return this.authService.updateAvatar(user.id, data);
  }
}
