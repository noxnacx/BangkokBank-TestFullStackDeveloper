import { IsOptional, IsString } from 'class-validator';

export class ListBookmarksQueryDto {
  @IsOptional()
  @IsString()
  collectionId?: string;
}
