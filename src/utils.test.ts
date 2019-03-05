import {arrayIsEqual, findKeyIdx} from './utils';

describe('arrayIsEqual', () => {
	it('compares arrays that contain literals successfully', () => {
		const a = [123, 234, 345];
		const b = [123, 234, 345];
		expect(arrayIsEqual(a, b)).toBe(true);

		const c = [234, 345, 456];
		expect(arrayIsEqual(a, c)).toBe(false);
	});

	it('compares arrays that contain the same references successfully', () => {
		const obj = {foo: 'bar'};
		const a = [123, obj];
		const b = [123, obj];
		expect(arrayIsEqual(a, b)).toBe(true);

		const c = [123, {foo: 'bar'}];
		expect(arrayIsEqual(a, c)).toBe(false);
	});

	it(`fails if lengths don't match`, () => {
		const a = [123, 234];
		const b = [123, 234, 345];
		expect(arrayIsEqual(a, b)).toBe(false);
	});
});

describe('findKeyIdx', () => {
	it('finds the key in an array of keys', () => {
		const keys = [[1, 2], [3, 4], [5, 6], [7, 8]];
		expect(findKeyIdx(keys, [5, 6], arrayIsEqual)).toBe(2);
	});

	it('provides a return value that signals if a key was not found', () => {
		const keys = [[1, 2], [3, 4], [5, 6], [7, 8]];
		expect(findKeyIdx(keys, [9, 0], arrayIsEqual)).toBe(-1);
	});
});
