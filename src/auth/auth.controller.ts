import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubAuth() {
    // Passport redirects to GitHub
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubAuthCallback(@Req() req: any, @Res() res: any) {
    if (req.user) {
      // The user object is what our strategy returned
      const tokenObj = this.authService.login(req.user);
      // Because this is a standard REST redirect, we pass token back to UI
      // In a real SPA, you'd pass it via query string or cookie. We'll use query string for POC.
      return res.redirect(`/?token=${tokenObj.access_token}`);
    }
    return res.redirect('/?error=login_failed');
  }

  @Get('gitlab')
  @UseGuards(AuthGuard('gitlab'))
  async gitlabAuth() {
    // Passport redirects to GitLab
  }

  @Get('gitlab/callback')
  @UseGuards(AuthGuard('gitlab'))
  async gitlabAuthCallback(@Req() req: any, @Res() res: any) {
    if (req.user) {
      const tokenObj = this.authService.login(req.user);
      return res.redirect(`/?token=${tokenObj.access_token}`);
    }
    return res.redirect('/?error=login_failed');
  }
}
