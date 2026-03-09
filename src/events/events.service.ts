import { Injectable } from '@nestjs/common';
import { AuxService } from 'src/aux/aux.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EventsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly auxService: AuxService,
  ) {}


  async getEventById() {}
}
