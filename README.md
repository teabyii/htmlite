# htmlite

[![NPM version][npm-badge]][npm-url]
[![Build status][travis-badge]][travis-url]
[![Coverage Status][coverage-badge]][coverage-url]
[![Commitizen Friendly][commitizen-badge]][commitizen-url]

:blush::blush::blush: A quick & tiny library to parse HTML string to JS Object Tree.

## Tokenizer

```js
import { Tokenizer } from 'htmlite';
const tokenizer = new Tokenizer();
const tokens = tokenizer.tokenize('<h1>hello htmlite</h1>');

// tokens:
// [
//   { type: 'OPEN_TAG_START', data: { tag: 'h1' } },
//   { type: 'OPEN_TAG_END' },
//   { type: 'TEXT', data: 'hello htmlite' },
//   { type: 'CLOSE_TAG', data: { tag: 'h1' } },
// ]
```

### Token Types

- DOCTYPE
- OPEN_TAG_START
- OPEN_TAG_END
- SELF_CLOSE_TAG_END
- CLOSE_TAG
- ATTRIBUTE_NAME
- ATTRIBUTE_VALUE_START
- ATTRIBUTE_VALUE_END
- TEXT
- ENTITY
- COMMENT
- CDATA

## Tree

```js
import { Tree } from 'htmlite';
// Use tokens above
const tree = new Tree(tokens);

// tree.toJSON():
// {
//   type: 'ELEMENT',
//   tag: 'h1',
//   children: 'hello htmlite'
//   attrs: {}
// }
```

### Node Types

- ELEMENT
- CDATA
- COMMENT
- TEXT (just a string)

## Development

First, clone repo and use `yarn` to install deps for testing.

```sh
yarn test # test 
```

## TODO

- [ ] support stream

[npm-url]: https://npmjs.org/package/htmlite
[npm-badge]: http://img.shields.io/npm/v/htmlite.svg?style=flat
[travis-url]: https://travis-ci.org/teabyii/htmlite
[travis-badge]: http://img.shields.io/travis/teabyii/htmlite.svg?style=flat
[coverage-url]: https://coveralls.io/github/teabyii/htmlite
[coverage-badge]: http://img.shields.io/coveralls/teabyii/htmlite.svg?style=flat
[commitizen-url]: http://commitizen.github.io/cz-cli/
[commitizen-badge]: https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat
