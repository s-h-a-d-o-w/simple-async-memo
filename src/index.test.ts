import {memoize} from './index';

it('works and respects maxAge', async () => {
	const maxAge = 100;
	const alwaysResolves = jest.fn().mockResolvedValue(123);
	const memoized = memoize(alwaysResolves, {maxAge});

	expect(memoized()).resolves.toBe(123);
	expect(alwaysResolves).toHaveBeenCalledTimes(1);
	expect(memoized()).resolves.toBe(123);
	expect(alwaysResolves).toHaveBeenCalledTimes(1);

	alwaysResolves.mockResolvedValue(234);
	setTimeout(async () => {
		// First call will still contain old value
		expect(memoized()).resolves.toBe(123);
		expect(alwaysResolves).toHaveBeenCalledTimes(2);

		// Wait a bit for cache to get lazily updated
		await new Promise((resolve) => setTimeout(resolve, 100));

		expect(memoized()).resolves.toBe(234);
		expect(alwaysResolves).toHaveBeenCalledTimes(2);
	}, maxAge + 50);
});

it('keeps retrying if promise rejects', async () => {
	const rejectRetryDelay = 20;
	const alwaysRejects = jest.fn().mockRejectedValue({});
	const memoized = memoize(alwaysRejects, {rejectRetryDelay});

	memoized().catch(() => {});
	await new Promise((resolve) => setTimeout(resolve, rejectRetryDelay + 10));
	memoized().catch(() => {});
	await new Promise((resolve) => setTimeout(resolve, rejectRetryDelay + 10));
	memoized().catch(() => {});
	await new Promise((resolve) => setTimeout(resolve, rejectRetryDelay + 10));
	memoized().catch(() => {});
	expect(alwaysRejects).toHaveBeenCalledTimes(4);
});

it('eventually returns the resolved value even if the initial promise rejected', async () => {
	const maxAge = 1000;
	const rejectRetryDelay = 20;
	const fn = jest.fn();
	const memoized = memoize(fn, {maxAge, rejectRetryDelay});

	fn.mockRejectedValueOnce('Failure');
	expect(memoized()).rejects.toBe('Failure');

	await new Promise((resolve) => setTimeout(resolve, rejectRetryDelay + 10));
	fn.mockResolvedValue('Success');
	// First call will still fail since resolved value will replace rejected value lazily
	expect(memoized()).rejects.toBe('Failure');

	await new Promise((resolve) => setTimeout(resolve, 10));
	expect(memoized()).resolves.toBe('Success');

	// 2 calls reach the function that was memoized because of the initial rejected call and the second resolved one
	expect(fn).toHaveBeenCalledTimes(2);
});

it('supports Symbols as arguments', async () => {
	const symbols = {
		A: Symbol(),
		B: Symbol(),
		C: Symbol(),
	};

	const fn = jest.fn().mockResolvedValue({});
	const memoized = memoize(fn);

	await memoized(symbols.A, symbols.B);
	await memoized(symbols.A, symbols.B);
	await memoized(symbols.A, symbols.C);

	expect(fn).toHaveBeenCalledTimes(2);
});

it('supports functions as arguments', async () => {
	const functions = {
		a: () => {},
		b: () => {},
		c: () => {},
	};

	const fn = jest.fn().mockResolvedValue({});
	const memoized = memoize(fn);

	await memoized(functions.a, functions.b);
	await memoized(functions.a, functions.b);
	await memoized(functions.a, functions.c);

	expect(fn).toHaveBeenCalledTimes(2);
});
