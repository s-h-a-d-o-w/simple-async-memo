import {arrayIsEqual, findKeyIdx, CompareFn} from './utils';

export type Options = {
	maxAge: number;
	matchesKey: CompareFn;
	rejectRetryDelay: number;
};

type Cache = {
	keys: any[][];
	values: any[];
	expirations: number[];
};

function initCacheEntry(
	fn: Function,
	args: any[],
	cache: Cache,
	opts: Options
) {
	return fn
		.apply(null, args)
		.then(() => {
			const innerIdx = findKeyIdx(cache.keys, args, opts.matchesKey);
			cache.expirations[innerIdx] = Date.now() + opts.maxAge;
		})
		.catch((error: any) => {
			// The initial rejection is passed along but leads to retries
			// console.log('Initial call rejected, scheduling retry.');
			const innerIdx = findKeyIdx(cache.keys, args, opts.matchesKey);
			cache.expirations[innerIdx] = Date.now() + opts.rejectRetryDelay;
			throw error;
		});
}

function renewCacheEntry(
	fn: Function,
	args: any[],
	cache: Cache,
	opts: Options,
	idx: number
) {
	fn.apply(null, args)
		.then((retval: any) => {
			// console.log('Cache result success');
			cache.expirations[idx] = Date.now() + opts.maxAge;
			cache.values[idx] = Promise.resolve(retval);
		})
		.catch(() => {
			// console.log('Rejected, scheduling retry.');
			cache.expirations[idx] = Date.now() + opts.rejectRetryDelay;
		});
}

export function memoize(fn: Function, opts?: Options) {
	const _opts = Object.assign(
		{},
		{
			maxAge: Number.MAX_SAFE_INTEGER * 0.5, // Will be added to Date.now()...
			matchesKey: arrayIsEqual,
			rejectRetryDelay: 1000 * 10,
		},
		opts
	);

	const cache: Cache = {
		keys: [],
		values: [],
		expirations: [],
	};

	const memoizedFn = (...args: any[]) => {
		// console.log(`${fn.name}(${args})`);
		const idx = findKeyIdx(cache.keys, args, _opts.matchesKey);
		if (idx >= 0) {
			if (Date.now() > cache.expirations[idx]) {
				// Renew expired cache in the background
				renewCacheEntry(fn, args, cache, _opts, idx);
			}

			return cache.values[idx];
		} else {
			const promise = initCacheEntry(fn, args, cache, _opts);

			// Create temporary cache entry (key/value may be permanent but expiration will change)
			// Necessary in case another call is made before the Promise resolves
			cache.keys.unshift(args);
			cache.expirations.unshift(Number.MAX_SAFE_INTEGER);
			cache.values.unshift(promise);

			return promise;
		}
	};

	return memoizedFn;
}
