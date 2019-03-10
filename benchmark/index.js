// Based on :
// https://github.com/caiogondim/fast-memoize.js/tree/master/benchmark
const Benchmark = require('benchmark');
const ora = require('ora');
const Table = require('cli-table2');

const memoizee = require('memoizee');
const fastMemoize = require('fast-memoize');
const moize = require('moize').default;

const results = [];
const spinner = ora('Running benchmark');

//
// View
//

function showResults(benchmarkResults) {
	const table = new Table({
		head: ['NAME', 'OPS/SEC', 'RELATIVE MARGIN OF ERROR', 'SAMPLE SIZE'],
	});
	benchmarkResults.forEach((result) => {
		table.push([
			result.target.name,
			result.target.hz.toLocaleString('en-US', {maximumFractionDigits: 0}),
			`± ${result.target.stats.rme.toFixed(2)}%`,
			result.target.stats.sample.length,
		]);
	});

	console.log(table.toString());
}

function sortDescResults(benchmarkResults) {
	return benchmarkResults.sort((a, b) => (a.target.hz < b.target.hz ? 1 : -1));
}

function onCycle(event) {
	results.push(event);
	ora(event.target.name).succeed();
}

function onComplete() {
	spinner.stop();

	const orderedBenchmarkResults = sortDescResults(results);
	showResults(orderedBenchmarkResults);
}

spinner.start();

//
// Benchmark
//

const add = (a, b) => {
	return Promise.resolve(a + b);
};
const valA = 123;
const valB = 234;

const memoizedMemoizee = memoizee(add, {promise: true});
const memoizedFastMemoizeCurrentVersion = fastMemoize(add);
const memoizedMoize = moize(add, {isPromise: true});
const memoizedSimpleAsyncMemo = require('../lib/').memoize(add);

const benchmark = new Benchmark.Suite();
benchmark
	.add('memoizee', {
		defer: true,
		fn: (deferred) => {
			memoizedMemoizee(valA, valB).then(() => deferred.resolve());
		},
	})
	.add(`fast-memoize`, {
		defer: true,
		fn: (deferred) => {
			memoizedFastMemoizeCurrentVersion(valA, valB).then(() =>
				deferred.resolve()
			);
		},
	})
	.add(`moize`, {
		defer: true,
		fn: (deferred) => {
			memoizedMoize(valA, valB).then(() => deferred.resolve());
		},
	})
	.add(`simple-async-memo`, {
		defer: true,
		fn: (deferred) => {
			memoizedSimpleAsyncMemo(valA, valB).then(() => deferred.resolve());
		},
	})
	.on('cycle', onCycle)
	.on('complete', onComplete)
	.run();
