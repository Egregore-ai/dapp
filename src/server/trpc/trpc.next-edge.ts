/// Next.js Edge Runtime check - won't activate otherwise
declare global {
  // noinspection ES6ConvertVarToLetConst
  var EdgeRuntime: string | undefined;
}


export function delayPostAsyncGeneratorOnEdge<TArgs, TYield>(
  delayMs: number,
  originalAsyncGeneratorFn: (args: TArgs) => AsyncGenerator<TYield>,
): (args: TArgs) => AsyncGenerator<TYield> {
  return async function* wrappedAsyncGenerator(args: TArgs): AsyncGenerator<TYield> {

    yield* originalAsyncGeneratorFn(args);

    // [EdgeRuntime]
    if (typeof EdgeRuntime === 'string') {
      if (delayMs >= 0)
        await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    // explicitly return void
    return;
  };
}
