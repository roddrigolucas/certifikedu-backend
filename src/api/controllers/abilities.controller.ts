import { Body, Controller, Get, NotFoundException, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TAbilitiesWhereInput } from '../../abilities/types/abilities.types';
import { AbilitiesService } from '../../abilities/abilities.service';
import { GetUser } from '../../auth/decorators';
import { CreateNewAbilitieAPIDto } from '../dtos/abilities/abilities-input.dto';
import { ResponseAbilitiesAPIDto, ResponseCategoryMetricAPIDto } from '../dtos/abilities/abilities-response.dto';
import { ApiKeyGuard } from '../guards/api_secret.guard';

@ApiTags('API Abilities')
@UseGuards(ApiKeyGuard)
@Controller('api/v1')
export class AbilitiesAPIController {
  constructor(private readonly abilitiesService: AbilitiesService) { }

  @Post('create/ability')
  async createNewAbilityAPI(
    @GetUser('id') userId: string,
    @Body() abilityInfo: CreateNewAbilitieAPIDto,
  ): Promise<ResponseAbilitiesAPIDto> {
    const data: TAbilitiesWhereInput = {
      habilidade: abilityInfo.ability,
      tema: abilityInfo.category,
    };

    const abilityData = await this.abilitiesService.checkAbility(data);

    if (abilityData) {
      return {
        abilityId: abilityData.habilidadeId,
        ability: abilityData.habilidade,
        category: abilityData.tema,
      };
    }

    const ability = await this.abilitiesService.createAbility({
      habilidade: abilityInfo.ability,
      tema: abilityInfo.category,
      source: 'api',
      ownerId: userId,
    });

    return {
      abilityId: ability.habilidadeId,
      ability: ability.habilidade,
      category: ability.tema,
    };
  }

  @Get('abilities/categories')
  async getAllCategories(@GetUser('id') userId: string): Promise<Array<ResponseCategoryMetricAPIDto>> {
    const findCategories = await this.abilitiesService.getAllCategoriesMetrics(userId);

    return findCategories.map((categoryInfo) => {
      return {
        category: categoryInfo.tema,
        qty: categoryInfo._count.tema,
      };
    });
  }

  @Get('/abilities/category/:category')
  async getAbilityByCategory(
    @Param('category') category: string,
    @GetUser('id') userId: string,
  ): Promise<Array<ResponseAbilitiesAPIDto>> {
    const abilities = await this.abilitiesService.getAbilityByUserAndCategory(category, userId);

    return abilities.map((ability) => {
      return {
        abilityId: ability.habilidadeId,
        ability: ability.habilidade,
        category: ability.tema,
      };
    });
  }

  @Get('/abilities/:id')
  async getAbilityById(@Param('id') abilityId: string): Promise<ResponseAbilitiesAPIDto> {
    const ability = await this.abilitiesService.getAbilityById(abilityId);

    if (!ability) {
      throw new NotFoundException('Ability not Found.');
    }

    return {
      abilityId: ability.habilidadeId,
      ability: ability.habilidade,
      category: ability.tema,
    };
  }
}
