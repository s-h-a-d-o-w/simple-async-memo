export type CompareFn = (a: any[], b: any[]) => boolean;

export const arrayIsEqual: CompareFn = (a, b) => {
	if (a.length !== b.length) return false;

	for (let i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) return false;
	}

	return true;
};

export const findKeyIdx = (
	keys: any[][],
	key: any[],
	compareFn: CompareFn
): number => {
	for (let i = 0; i < keys.length; i++) {
		if (compareFn(keys[i], key)) {
			return i;
		}
	}

	return -1;
};
