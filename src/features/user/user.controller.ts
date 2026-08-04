import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { UserService } from './user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { sendSuccess, sendCreated } from '../../common/utils/response';
import { AuthGuard } from '../../common/guards/auth.guard';
import type { AuthenticatedRequest } from '../../common/types/authenticated-request';

@Controller('auth')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto, @Res() res: Response) {
    const data = await this.userService.register(dto);
    sendCreated(res, data, 'Registration successful. Please check your email to confirm your account.');
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res() res: Response) {
    const data = await this.userService.login(dto);
    sendSuccess(res, data, 'Login successful');
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  async logout(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    const token = req.headers.authorization?.split(' ')[1];
    await this.userService.logout(token);
    sendSuccess(res, null, 'Logged out successfully');
  }

  @Post('refresh')
  async refresh(@Body() dto: RefreshDto, @Res() res: Response) {
    const data = await this.userService.refreshToken(dto.refreshToken);
    sendSuccess(res, data, 'Token refreshed');
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto, @Res() res: Response) {
    const data = await this.userService.forgotPassword(dto);
    sendSuccess(res, data, 'If an account with that email exists, a password reset link has been sent.');
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto, @Res() res: Response) {
    const data = await this.userService.resetPassword(dto);
    sendSuccess(res, data, 'Password has been reset successfully.');
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async getProfile(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    const profile = await this.userService.getProfile(req.user.id);
    sendSuccess(res, profile);
  }
}
