import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { AbilitiesService } from '../../abilities/abilities.service';
import { TAbilitiesCreateInput, TAbilitiesWhereInput } from '../../abilities/types/abilities.types';
import { JwtGuard } from '../../auth/guard';
import { Roles } from '../../users/decorators';
import { RolesGuard } from '../../users/guards';
import { CreateOrUpdateAbilityAdminDto } from '../dtos/abilities/abilities-input.dto';
import { ResponseAbilityAdminDto } from '../dtos/abilities/abilities-response.dto';

@ApiTags('ADMIN -- abilities')
@Controller('admin/abilities')
@UseGuards(JwtGuard, RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class AbilitiesAdminController {
  constructor(private readonly abilitiesService: AbilitiesService) {}

  @Roles('admin')
  @Post()
  async createNewAbility(@Body() dto: CreateOrUpdateAbilityAdminDto): Promise<ResponseAbilityAdminDto> {
    const data: TAbilitiesWhereInput = {
      habilidade: dto.ability,
      tema: dto.category,
      source: dto.source,
    };

    const checkAbility = await this.abilitiesService.checkAbility(data);

    if (checkAbility) {
      throw new BadRequestException('This ability already exists.');
    }

    const ability = await this.abilitiesService.createAbility({
      habilidade: dto.ability,
      tema: dto.category,
      source: dto.source,
    });

    return plainToInstance(ResponseAbilityAdminDto, {
      abilityId: ability.habilidadeId,
      ability: ability.habilidade,
      category: ability.tema,
    });
  }

  @Roles('admin')
  @Put(':abilityId')
  async updateAbility(
    @Param('abilityId') abilityId: string,
    @Body() dto: CreateOrUpdateAbilityAdminDto,
  ): Promise<ResponseAbilityAdminDto> {
    const data: TAbilitiesCreateInput = {
      habilidade: dto.ability,
      tema: dto.category,
      source: dto.source,
    };

    const abilityData = await this.abilitiesService.findAbility(abilityId);

    if (!abilityData) {
      throw new NotFoundException('Ability On Review not found.');
    }

    const ability = await this.abilitiesService.updateAbility(abilityData.habilidadeId, data);

    return {
      abilityId: ability.habilidadeId,
      ability: ability.habilidade,
      category: ability.tema,
    };
  }

  @Roles('admin')
  @Delete(':abilityId')
  async deleteAbility(@Param('abilityId') abilityId: string): Promise<{ success: boolean }> {
    const abilityData = await this.abilitiesService.findAbility(abilityId);

    if (!abilityData) {
      throw new NotFoundException('Ability On Review not found.');
    }

    await this.abilitiesService.deleteAbility(abilityId);

    return { success: true };
  }

  @Roles('admin')
  @Patch('upgrade/:abilityOnReviewId')
  async upgradeAbilityOnReview(
    @Param('abilityOnReviewId') abilityOnReviewId: string,
  ): Promise<ResponseAbilityAdminDto> {
    const abilityOnReview = await this.abilitiesService.findAbilityOnReview(abilityOnReviewId);

    if (!abilityOnReview) {
      throw new NotFoundException('Ability On Review not found.');
    }

    const ability = await this.abilitiesService.upgradeAbilityOnReview(abilityOnReview);

    return {
      abilityId: ability.habilidadeId,
      ability: ability.habilidade,
      category: ability.tema,
    };
  }

  @Roles('admin')
  @Delete('review/:abilityOnReviewId')
  async deleteAbilityOnReview(@Param('abilityOnReviewId') abilityOnReviewId: string): Promise<{ success: true }> {
    const abilityOnReview = await this.abilitiesService.findAbilityOnReview(abilityOnReviewId);

    if (!abilityOnReview) {
      throw new NotFoundException('Ability On Review not found.');
    }

    await this.abilitiesService.deleteAbilityOnReview(abilityOnReview.id);

    return { success: true };
  }
}
