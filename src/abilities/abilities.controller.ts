import { BadRequestException, Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { Roles } from '../users/decorators';
import { RolesGuard } from '../users/guards';
import { AbilitiesService } from './abilities.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateOrUpdateAbilityDto } from './dtos/abilities-input.dto';
import { MUDARResponseAbilitiesDto, ResponseAbilitiesDto, ResponseAbilityDto } from './dtos/abilities-response.dto'
import { TAbilityOnReviewCreateInput } from './types/abilities-on-review.types';
import { GetUser } from '../auth/decorators';

@ApiTags('PF User -- Abilities')
@Controller('abilities')
@UseGuards(JwtGuard)
export class AbilitiesController {
  constructor(private readonly abilitiesService: AbilitiesService) {}

  @UseGuards(RolesGuard)
  @Roles('enabled')
  @Get('categories')
  async getAllEnabledThemes(): Promise<Array<string>> {
    const categories = await this.abilitiesService.getAllEnabledCategories();

    return categories.map((category) => category.tema);
  }

  @UseGuards(RolesGuard)
  @Roles('enabled')
  @Get('category/:category')
  async getAbilitiesByTheme(@Param('category') theme: string): Promise<ResponseAbilitiesDto> {
    const abilities = await this.abilitiesService.getAbilitiesByCategory(theme);

    return {
      abilities: abilities.map((ability) => {
        return { ability: ability.habilidade, category: ability.tema };
      }),
    };
  }

  @UseGuards(RolesGuard)
  @Roles('enabled')
  //TODO: CHANGE THIS CRAZY FUCKING ROUTE
  @Get('enabled')
  async getAllEnabledAbilities(): Promise<Array<MUDARResponseAbilitiesDto>> {
    const abilities = await this.abilitiesService.getAllEnabledAbilities();

    return abilities.map((ability) => {
      return {
        habilidade: ability.habilidade,
        habilidadeId: ability.habilidadeId,
        tema: ability.tema,
      };
    });

    //return {
    //  abilities: abilities.map((ability) => {
    //    return { ability: ability.habilidade, category: ability.tema };
    //  }),
    //};
  }

  @UseGuards(RolesGuard)
  @Roles('enabled')
  @Get('review')
  async getAllOnReviewAbilities(): Promise<ResponseAbilitiesDto> {
    const abilities = await this.abilitiesService.getAllOnReviewAbilities();

    return {
      abilities: abilities.map((ability) => {
        return { ability: ability.habilidade, category: ability.tema };
      }),
    };
  }

  @UseGuards(RolesGuard)
  @Roles('enabled')
  @Post('review')
  async createAbilityOnReview(
    @GetUser('userId') userId: string,
    @Body() dto: CreateOrUpdateAbilityDto,
  ): Promise<ResponseAbilityDto> {
    const data: TAbilityOnReviewCreateInput = {
      habilidade: dto.ability,
      tema: dto.category,
      ownerId: userId,
      createdByUser: true,
    };

    const abilityData = await this.abilitiesService.checkAbilityOnReview(data);

    if (abilityData.length != 0) {
      throw new BadRequestException('This ability already exists.');
    }

    const ability = await this.abilitiesService.createAbilityOnReview(data);

    return { ability: ability.habilidade, category: ability.tema };
  }
}
