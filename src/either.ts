export type Left<E> = {
  type: "Left";
  value: E;
}

export type Right<A> = {
  type: "Right";
  value: A;
}

export type Either<E,A> = Left<E> | Right<A>;

export const matchEither = <E, A, B>(
  either: Either<E,A>,
  onLeft: (error: E) => B,
  onRight: (value: A) => B,
): B => {
    if (either.type === "Left") {
      return onLeft(either.value)
    }

    return onRight(either.value)
};

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
