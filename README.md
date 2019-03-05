# simple-async-memo

A minimalistic memoization library with lazy cache renewal specifically for Promise-based usage.

Other solutions were comparatively slow (and/or big) because they offered a lot of options I didn't need.

Moize is actually pretty fast (faster than this solution in fact) but didn't offer the type of lazy cache renewal I was looking for and its architecture is structured in a way that doesn't allow for contributing such a feature easily.
