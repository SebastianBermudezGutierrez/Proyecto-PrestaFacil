import {
  Controller,
  Get,
  Req,
  UseGuards,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from "@nestjs/common";

import { AppService } from "./app.service.js";
import { SupabaseAuthGuard } from "./auth/supabase-auth.guard.js";
import type { AuthenticatedRequest } from "./auth/supabase-auth.guard.js";

import { CreateItemDto } from "./items/dto/create-item.dto.js";
import { UpdateItemDto } from "./items/dto/update-item.dto.js";
import { CreateLoanDto } from "./loans/dto/create-loan.dto.js";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // =====================================
  // RUTA PRINCIPAL
  // =====================================

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // =====================================
  // PERFIL
  // =====================================

  @Get("auth/profile")
  @UseGuards(SupabaseAuthGuard)
  getProfile(@Req() request: AuthenticatedRequest) {
    return {
      message: "Usuario autenticado correctamente",
      user: request.user,
    };
  }

  // =====================================
  // DASHBOARD
  // =====================================

  @Get("dashboard")
  @UseGuards(SupabaseAuthGuard)
  getDashboard(@Req() request: AuthenticatedRequest) {
    return this.appService.getDashboard(
      request.user.id,
    );
  }

  // =====================================
  // OBJETOS
  // =====================================

  @Get("items")
  @UseGuards(SupabaseAuthGuard)
  getItems(@Req() request: AuthenticatedRequest) {
    return this.appService.getItems(
      request.user.id,
    );
  }

  @Get("items/:id")
  @UseGuards(SupabaseAuthGuard)
  getItemById(
    @Req() request: AuthenticatedRequest,
    @Param("id", new ParseUUIDPipe()) id: string,
  ) {
    return this.appService.getItemById(
      request.user.id,
      id,
    );
  }

  @Post("items")
  @UseGuards(SupabaseAuthGuard)
  createItem(
    @Req() request: AuthenticatedRequest,
    @Body() body: CreateItemDto,
  ) {
    return this.appService.createItem(
      request.user.id,
      request.user.email,
      body,
    );
  }

  @Patch("items/:id")
  @UseGuards(SupabaseAuthGuard)
  updateItem(
    @Req() request: AuthenticatedRequest,
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body() body: UpdateItemDto,
  ) {
    return this.appService.updateItem(
      request.user.id,
      id,
      body,
    );
  }

  @Delete("items/:id")
  @UseGuards(SupabaseAuthGuard)
  deactivateItem(
    @Req() request: AuthenticatedRequest,
    @Param("id", new ParseUUIDPipe()) id: string,
  ) {
    return this.appService.deactivateItem(
      request.user.id,
      id,
    );
  }

  // =====================================
  // PRÉSTAMOS
  // =====================================

  @Get("loans")
  @UseGuards(SupabaseAuthGuard)
  getLoans(@Req() request: AuthenticatedRequest) {
    return this.appService.getLoans(
      request.user.id,
    );
  }

  @Post("loans")
  @UseGuards(SupabaseAuthGuard)
  createLoan(
    @Req() request: AuthenticatedRequest,
    @Body() body: CreateLoanDto,
  ) {
    return this.appService.createLoan(
      request.user.id,
      body,
    );
  }

  @Patch("loans/:id/return")
  @UseGuards(SupabaseAuthGuard)
  returnLoan(
    @Req() request: AuthenticatedRequest,
    @Param("id", new ParseUUIDPipe()) id: string,
  ) {
    return this.appService.returnLoan(
      request.user.id,
      id,
    );
  }
}
