import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { createPrismaBase, MODELS } from "src/prisma/util/prisma.util";
import { PlaceFilterDto } from "./places.schema";
import { Prisma } from "@prisma/client";

@Injectable()
export class PlacesService extends createPrismaBase(MODELS.Place) {
  constructor(private readonly prisma: PrismaService) { super() }

  async getPlaces(filterDto: PlaceFilterDto) {
    const { includeChildren, includeParent, includeRaces, depth, state, name, mtfcc } = filterDto
    
    depth ?? 1 // No children
    
    if (!includeChildren && !includeParent && depth >= 2) {
      // Run normal prisma query

      const where: Prisma.PlaceWhereInput = {
        ...(state ? { state } : {}),
        ...(name ? { name } : {}),
        ...(mtfcc ? { mtfcc } : {})
      }

      const include: Prisma.PlaceInclude = includeRaces ? { Races: true } : {}

      this.model.findMany({ where, include })
    } else {
      // Run raw SQL
    }
  }

  async getPlaceById(id: string, includeRaces: boolean) {
    const place = includeRaces
    ? this.model.findFirst({ where: { id }, include: { Races: true }})
    : this.model.findFirst({ where: { id }})
    return place
  }

  
}