import {
  Either as _Either,
  right,
  left,
  isLeft,
  isRight,
} from 'fp-ts/lib/Either';

export type Either<L, A> = _Either<L, A>;

export { right, left, isLeft, isRight };
