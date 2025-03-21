import { Module } from "@nestjs/common";
import { PlaceController } from "./places.controller";
import { PlacesService } from "./places.service";

@Module({
  controllers: [PlaceController],
  providers: [PlacesService],
})
export class PlacesModule{}