[![Travis Build Status](https://travis-ci.org/s-h-a-d-o-w/simple-async-memo.svg?branch=master)](https://travis-ci.org/s-h-a-d-o-w/simple-async-memo)
[![npm version](https://img.shields.io/npm/v/simple-async-memo.svg)](https://www.npmjs.com/package/simple-async-memo)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# simple-async-memo

A minimalistic, reasonably fast (see [alternatives below](#alternatives)) memoization
library with lazy cache renewal specifically for Promise-based usage.

Rejection is generally considered an unacceptable result. Hence, whenever calling the function
to be memoized is required (either the initial call or on cache expiration - see `maxAge`),
simple-async-memo will retry on every call (but you can also customize the interval at which
this happens - see `rejectRetryDelay`).

If the initial call results in rejection, this will still be returned though.

## Installation

```bash
yarn add simple-async-memo
```

## Example

```js
const {memoize} = require('simple-async-memo');

function fn(arg1, arg2) {
    return fetch('...');
}

const memoized = memoize(fn); // fn HAS to return a Promise!

memoized('foo', 'bar')
    .then(...)
    .catch(...);
memoized('foo', 'bar')
    .then(...)
    .catch(...);
```

## Options

### `maxAge`

**Default: MAX_SAFE_INTEGER \* 0.5**

So by default, the cache doesn't expire.

### `rejectRetryDelay`

**Default: 10000 ms**

This does not mean that `simple-async-memo` keeps retrying by itself. Instead, if you e.g. call a function regularly every 200 ms and you set this delay to 500 ms, if
the initial call failed, `simple-async-memo` will not retry for the first 2 calls but only the 3rd. IF that one succeeds, the cache will be updated lazily - meaning, only
the 4th call will get the resolved value.

### `matchesKey: (any[], any[]) => boolean`

**Default: shallow comparison of all array elements**

## Alternatives <a name="alternatives"></a>

![Two parameters](benchmark/result.png)

[Moize](https://github.com/planttheidea/moize) offers great performance and has async options but unfortunately no lazy cache renewal. And its architecture is structured in a way that doesn't allow for contributing such a feature easily. (If this changes, let me know 😉)
