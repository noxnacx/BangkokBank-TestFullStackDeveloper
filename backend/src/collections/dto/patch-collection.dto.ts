import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PatchCollectionDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;
}
