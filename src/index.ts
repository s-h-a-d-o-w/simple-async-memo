import {arrayIsEqual, findKeyIdx, CompareFn} from './utils';

export type Options = {
	maxAge?: number;
	matchesKey?: CompareFn;
	rejectRetryDelay?: number;
};

export const memoize = (fn: Function, opts?: Options) => {
	const _opts = Object.assign(
		{},
		{
			maxAge: 1000 * 60 * 5,
			matchesKey: arrayIsEqual,
			rejectRetryDelay: 1000 * 10,
		},
		opts
	);

	const keyStore: any[] = [];
	const valStore: any[] = [];
	const timeoutStore: number[] = [];

	const memoizedFn = (...args: any[]) => {
		// console.log(`${fn.name}(${args})`);
		const idx = findKeyIdx(keyStore, args, _opts.matchesKey);
		if (idx >= 0) {
			// Renew expired cache in the background
			if (Date.now() > timeoutStore[idx]) {
				// console.log('Renew cache');
				fn.apply(null, args)
					.then((retval: any) => {
						// console.log('Cache result success');
						timeoutStore[idx] = Date.now() + _opts.maxAge;
						valStore[idx] = Promise.resolve(retval);
					})
					.catch(() => {
						// console.log('Rejected, scheduling retry.');
						timeoutStore[idx] = Date.now() + _opts.rejectRetryDelay;
					});
			}

			return valStore[idx];
		} else {
			const promise = fn
				.apply(null, args)
				.then(() => {
					const innerIdx = findKeyIdx(keyStore, args, _opts.matchesKey);
					timeoutStore[innerIdx] = Date.now() + _opts.maxAge;
				})
				.catch((error: any) => {
					// The initial rejection is passed along but leads to retries
					// console.log('Initial call rejected, scheduling retry.');
					const innerIdx = findKeyIdx(keyStore, args, _opts.matchesKey);
					timeoutStore[innerIdx] = Date.now() + _opts.rejectRetryDelay;
					throw error;
				});

			// Create temporary cache entry
			// Necessary in case another call is made before promise resolves
			keyStore.unshift(args);
			timeoutStore.unshift(Number.MAX_SAFE_INTEGER);
			valStore.unshift(promise);

			// console.log('Created new cache entry');
			return promise;
		}
	};

	return memoizedFn;
};
