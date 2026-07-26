import { CreateCollectionDto } from './create-collection.dto';

// PUT is a full replace, and Collection only has one user-settable field
// (`name`), so the validation shape is identical to create.
export class UpdateCollectionDto extends CreateCollectionDto {}
