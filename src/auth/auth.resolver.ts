import { Resolver, Mutation, Args, ObjectType, Field } from '@nestjs/graphql';
import { AuthService } from './auth.service';

@ObjectType()
class LoginResponse {
  @Field()
  access_token: string;
}

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => LoginResponse)
  async login(
    @Args('username') username: string,
    @Args('password', { nullable: true }) pass: string,
    @Args('mfaToken', { nullable: true }) mfaToken?: string,
  ) {
    if (!pass) throw new Error('Password required for standard login');
    const user = await this.authService.validateUser(username, pass);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    return this.authService.login(user, mfaToken);
  }

  @Mutation(() => LoginResponse)
  async socialLogin(
    @Args('provider') provider: string,
    @Args('providerId') providerId: string,
    @Args('email', { nullable: true }) email: string,
    @Args('mfaToken', { nullable: true }) mfaToken?: string,
  ) {
    const user = await this.authService.validateSocialLogin(provider, providerId, email || '');
    return this.authService.login(user, mfaToken);
  }
  @Mutation(() => LoginResponse)
  async register(
    @Args('username') username: string,
    @Args('password') pass: string,
    @Args('email') email: string,
  ) {
    return this.authService.registerUser(username, pass, email);
  }

  @Mutation(() => String)
  async generateMfaSecret(@Args('userId') userId: number) {
    return this.authService.generateMfaSecret(userId);
  }

  @Mutation(() => Boolean)
  async verifyMfaSetup(
    @Args('userId') userId: number,
    @Args('mfaToken') mfaToken: string,
  ) {
    return this.authService.verifyMfaSetup(userId, mfaToken);
  }
}
