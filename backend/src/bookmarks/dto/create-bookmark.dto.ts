import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateBookmarkDto {
  @IsUrl()
  url!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  notes?: string | null;

  // Nullable, matching the schema: a bookmark doesn't have to belong to a
  // collection. When present, ownership is checked in the service — a
  // collectionId that isn't yours must not be attachable to your bookmark.
  @IsOptional()
  @IsString()
  collectionId?: string | null;
}
