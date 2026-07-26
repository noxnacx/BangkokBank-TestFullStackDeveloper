import { CreateBookmarkDto } from './create-bookmark.dto';

// PUT is a full replace: url/title are still required, and omitting the
// nullable fields (notes/collectionId) means "clear them", not "leave
// untouched" -- the service applies that `?? null` default, not the DTO.
export class UpdateBookmarkDto extends CreateBookmarkDto {}
