import { Injectable } from '@nestjs/common';
import { AuxService } from 'src/common/common.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EventsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly auxService: AuxService,
  ) {}


  async getEventById() {}
}
