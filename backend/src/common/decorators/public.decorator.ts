import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'auth:isPublic';

/** Opens a route (or a whole controller) to callers who aren't signed in. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
