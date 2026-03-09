import { Test } from '@nestjs/testing';
import { AbilitiesController } from '../../../../src/abilities/abilities.controller';
import { AbilitiesService } from '../../../../src/abilities/abilities.service';
import { RolesGuard } from '../../../../src/users/guards';
import { getAbilitiesByCategoryMock } from './mock/abilities-controller.inputs';
import { getAbilitiesByCategoryResponse } from './mock/abilities-controller.responses';

const abilitiesServiceMock = {
  getAllEnabledCategories: jest.fn().mockResolvedValue([{ tema: 'A' }, { tema: 'B' }, { tema: 'C' }]),
  getAbilitiesByCategory: jest.fn().mockResolvedValue({}),
};

const rolesGuardMock = {
  canActivate: jest.fn().mockResolvedValue(true),
};

describe('Abilities Controller', () => {
  let controller: AbilitiesController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AbilitiesController],
      providers: [{ provide: AbilitiesService, useValue: abilitiesServiceMock }],
    })
      .overrideGuard(RolesGuard)
      .useValue(rolesGuardMock)
      .compile();

    controller = moduleRef.get(AbilitiesController);
  });

  it('should be instantiated', () => {
    expect(controller).toBeDefined();
  });

  describe('Get All Enabled Themes', () => {
    it('should return the exact correct value', async () => {
      expect(await controller.getAllEnabledThemes()).toStrictEqual(['A', 'B', 'C']);
    });

    it('should return an empty list', async () => {
      abilitiesServiceMock.getAllEnabledCategories = jest.fn().mockResolvedValue([]);
      expect(await controller.getAllEnabledThemes()).toStrictEqual([]);
    });
  });

  describe('Get Abilities By Theme', () => {
    it('should return the exact correct value', async () => {
      abilitiesServiceMock.getAbilitiesByCategory = jest.fn().mockResolvedValue(getAbilitiesByCategoryMock);
      expect(await controller.getAbilitiesByTheme('doesnt matter')).toStrictEqual(getAbilitiesByCategoryResponse);
    });

    it('should return an empty list', async () => {
      abilitiesServiceMock.getAbilitiesByCategory = jest.fn().mockResolvedValue([]);
      expect(await controller.getAllEnabledThemes()).toStrictEqual([]);
    });
  });
});
