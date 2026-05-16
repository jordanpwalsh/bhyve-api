export type Left<E> = {
  type: "Left";
  value: E;
}

export type Right<A> = {
  type: "Right";
  value: A;
}

export type Either<E,A> = Left<E> | Right<A>;

export const left = <E>(value: E): Left<E> => {
  return {
    type: "Left",
    value
  }
}

export const right = <A>(value: A): Right<A> => {
  return {
    type: "Right",
    value
  }
}
