import { Controller, Post, Body, HttpCode, HttpStatus, BadRequestException, Patch, Req, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { ResponseAuthDto, ResponseUsersRawInfoDto } from './dto/auth-response.dto';
import { AuthenticateRequestDto, AuthPfDto, AuthPjDto, RawUserDto, ResetUserPasswordDto } from './dto/auth-input.dto';
import { AuxService } from '../_aux/_aux.service';
import { CognitoService } from '../aws/cognito/cognito.service';
import {
  TPessoaFisicaCreateWoUserInput,
  TPessoaJuridicaCreateWoUserInput,
  TSocioCreateWoPjInput,
  TUserCreateInput,
} from './types/auth.types';
import { IResponseUsersRawInfo } from './interfaces/auth.interfaces';

@ApiTags('Public -- Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly auxService: AuxService,
    private readonly cognitoService: CognitoService,
  ) { }

  @Post('signup/pj')
  async signUpPj(@Body() dto: AuthPjDto): Promise<ResponseAuthDto> {
    const ddf = this.auxService.formatDate(dto.pjInfo.dataDeFundacao);
    if (!ddf) {
      throw new BadRequestException('Data de fundacao invalida');
    }

    const socioDbo = this.auxService.formatDate(dto.pjInfo.socios.dataDeNascimento);
    if (!socioDbo) {
      throw new BadRequestException('Data de nascimento invalida');
    }

    const checkUser = await this.authService.checkUser(dto.documentNumber, dto.email);

    if (checkUser.exist) {
      throw new BadRequestException(checkUser.errorMessage);
    }

    const socio: TSocioCreateWoPjInput = {
      CPF: dto.pjInfo.socios.CPF,
      nome: dto.pjInfo.socios.nome,
      telefone: dto.pjInfo.socios.telefone,
      dataDeNascimento: socioDbo,
      cepNumber: dto.pjInfo.socios.cepNumber,
      estado: dto.pjInfo.socios.estado,
      cidade: dto.pjInfo.socios.cidade,
      bairro: dto.pjInfo.socios.bairro,
      rua: dto.pjInfo.socios.rua,
      numero: dto.pjInfo.socios.numero,
      complemento: dto.pjInfo.socios.complemento,
    };

    const pj: TPessoaJuridicaCreateWoUserInput = {
      razaoSocial: dto.pjInfo.razaoSocial,
      nomeFantasia: dto.pjInfo.nomeFantasia,
      telefone: dto.pjInfo.telefone,
      dataDeFundacao: ddf,
      segmento: dto.pjInfo.segmento,
      numeroDeFuncionarios: dto.pjInfo.numeroDeFuncionarios,
      socios: { create: socio },
    };

    const data: TUserCreateInput = {
      numeroDocumento: dto.documentNumber,
      email: dto.email,
      type: 'PJ',
      pessoaJuridica: { create: pj },
    };

    await this.authService.signUpPjUser(data, dto.password);

    return { success: true };
  }

  @Post('signup/pf')
  async signUpPf(@Body() dto: AuthPfDto): Promise<ResponseAuthDto> {
    const dob = this.auxService.formatDate(dto.pfInfo.dataDeNascimento);
    if (!dob) {
      throw new BadRequestException('Data de nascimento invalida');
    }

    const checkUser = await this.authService.checkUser(dto.documentNumber, dto.email);

    if (checkUser.exist) {
      throw new BadRequestException(checkUser.errorMessage);
    }

    const pf: TPessoaFisicaCreateWoUserInput = {
      nome: dto.pfInfo.nome,
      telefone: dto.pfInfo.telefone,
      dataDeNascimento: dob,
      cepNumber: dto.pfInfo.cepNumber,
      estado: dto.pfInfo.estado,
      cidade: dto.pfInfo.cidade,
      bairro: dto.pfInfo.bairro,
      rua: dto.pfInfo.rua,
      numero: dto.pfInfo.numero,
      complemento: dto.pfInfo.complemento,
    };

    const data: TUserCreateInput = {
      numeroDocumento: dto.documentNumber,
      email: dto.email,
      type: 'PF',
      pessoaFisica: { create: pf },
    };

    await this.authService.signUpPfUser(data, dto.password);

    return { success: true };
  }

  @Post('signup/raw')
  async signUpRaw(@Body() dto: RawUserDto): Promise<ResponseUsersRawInfoDto> {
    const responseDict: IResponseUsersRawInfo = {
      name: dto?.name ?? '',
      phone: dto?.phone ?? '',
      email: dto.email,
      documentNumber: dto.documentNumber,
      isValid: true,
    };

    const userData: TUserCreateInput = {
      email: dto.email,
      numeroDocumento: dto.documentNumber,
      type: 'PF',
      tempName: dto?.name ?? null,
      tempPhone: dto?.phone ?? null,
    };

    return await this.authService.signUpRawUser(userData, responseDict);
  }

  @Patch('reset')
  async resetRawUserPassword(@Body() dto: ResetUserPasswordDto): Promise<{ hasAccount: boolean; isRaw: boolean }> {
    return await this.authService.resetRawUserPassword(dto.email);
  }

  @HttpCode(HttpStatus.OK)
  @Post('authenticate')
  async authenticate(@Body() dto: AuthenticateRequestDto): Promise<{ access_token: string }> {
    return await this.cognitoService.authenticateCognito(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Req() req: Request): Promise<{ success: boolean }> {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token não fornecido');
    }

    const token = authHeader.split(' ')[1];
    return await this.authService.logoutSession(token);
  }
}
