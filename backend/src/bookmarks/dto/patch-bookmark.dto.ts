import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class PatchBookmarkDto {
  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  // Omitted -> left untouched. Explicit `null` -> cleared. This is why
  // `@IsOptional()` (which allows both undefined and null) is enough here,
  // no separate "clear" flag needed.
  @IsOptional()
  @IsString()
  notes?: string | null;

  @IsOptional()
  @IsString()
  collectionId?: string | null;
}
