import { Controller, Post, Body, UseGuards, Patch, Req, HttpCode } from "@nestjs/common";
import { Request } from "express";

import { AuthService } from "./auth.service";
import { SignUpDTO } from "./dto/signup.dto";
import { LoginDTO } from "./dto/login.dto";
import { JWTAuthGuard } from "../common/validators/jwt-auth.guard";

@Controller("auth")
export class AuthController {
    constructor(private readonly service: AuthService) { }

    @Post("signup")
    async signUp(@Body() dto: SignUpDTO) {
        return this.service.signUp(dto);
    }

    @Post("login")
    @HttpCode(200)
    async login(@Body() dto: LoginDTO) {
        return this.service.login(dto);
    }

    @Post("confirm")
    @HttpCode(200)
    async confirmAccount(
        @Body() body: { email: string; code?: string }
    ) {
        if (body.code)
            return this.service.confirmAccount(body.email, body.code);
        return this.service.generateConfirmationCode(body.email);
    }

    @Post("forgot")
    @HttpCode(200)
    async forgotPassword(@Body() body: { email: string }) {
        return this.service.forgotPassword(body.email);
    }

    @Post("reset")
    @HttpCode(200)
    async resetPassword(
        @Body() body: { email: string; code: string; newPassword: string; confirmPassword: string }
    ) {
        return this.service.resetPassword(
            body.email,
            body.code,
            body.newPassword,
            body.confirmPassword,
        );
    }

    @UseGuards(JWTAuthGuard)
    @Patch("change-password")
    async changePassword(
        @Req() req: Request & { user: { id: string } },
        @Body() body: { currentPassword: string; newPassword: string; confirmPassword: string }
    ) {
        return this.service.changePassword(
            req.user.id,
            body.currentPassword,
            body.newPassword,
            body.confirmPassword,
        );
    }
}
