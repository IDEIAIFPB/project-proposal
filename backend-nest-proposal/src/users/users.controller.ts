import {
    Controller,
    Get,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Req,
    ParseUUIDPipe,
} from "@nestjs/common";
import { Request } from "express";

import { UsersService } from "./users.service";
import { UpdateUserDTO } from "./dto/update-user.dto";
import { JWTAuthGuard } from "../common/validators/jwt-auth.guard";

@Controller("users")
export class UsersController {
    constructor(private readonly service: UsersService) { }

    @Get()
    findAll() {
        return this.service.findAll();
    }

    @UseGuards(JWTAuthGuard)
    @Get("me")
    me(@Req() req: Request & { user: { id: string } }) {
        return this.service.findById(req.user.id);
    }

    @UseGuards(JWTAuthGuard)
    @Get(":id")
    findOne(@Param("id", new ParseUUIDPipe()) id: string) {
        return this.service.findById(id);
    }

    @UseGuards(JWTAuthGuard)
    @Patch(":id")
    update(
        @Param("id", new ParseUUIDPipe()) id: string,
        @Body() dto: UpdateUserDTO,
    ) {
        return this.service.update(id, dto);
    }

    @UseGuards(JWTAuthGuard)
    @Delete(":id")
    remove(@Param("id", new ParseUUIDPipe()) id: string) {
        return this.service.remove(id);
    }
}
