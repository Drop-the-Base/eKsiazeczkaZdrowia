/** Minimal observable value; late subscribers get the last value immediately. */
export interface Signal<T> {
  on(cb: (value: T) => void): () => void;
  emit(value: T): void;
  readonly value: T | undefined;
}

export function createSignal<T>(): Signal<T> {
  const subs = new Set<(value: T) => void>();
  let last: { value: T } | undefined;
  return {
    on(cb) {
      subs.add(cb);
      if (last) cb(last.value);
      return () => {
        subs.delete(cb);
      };
    },
    emit(value) {
      last = { value };
      for (const cb of [...subs]) cb(value);
    },
    get value() {
      return last?.value;
    },
  };
}
