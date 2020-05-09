# htmlite

[![NPM version][npm-badge]][npm-url]
[![Build status][travis-badge]][travis-url]
[![Coverage Status][coverage-badge]][coverage-url]
[![Commitizen Friendly][commitizen-badge]][commitizen-url]

:blush::blush::blush: A quick & tiny library to parse HTML string to JS Object Tree.

:bowtie::bowtie::bowtie: The tokenizer follows partial [HTML 5.2 standard](https://www.w3.org/TR/2017/REC-html52-20171214/syntax.html#tokenization), ignores some complex but less used rules & XML support, for better performance.

> I will use this module to parse html from rich editor in client JS runtime, like React Native. However, you also can use it in Server JS runtime, like Node or Deno.

## Tokenizer

```js
import { Tokenizer } from 'htmlite';
const tokenizer = new Tokenizer();
const tokens = tokenizer.tokenize('<h1>hello htmlite</h1>');

// tokens:
// [
//   { type: 'OPEN_TAG_START', data: { tag: 'h1' } },
//   { type: 'OPEN_TAG_END' },
//   { type: 'TEXT', data: { text: 'hello htmlite' } },
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
//   children: 'hello htmlite',
// }
```

### Node Types

- DOCTYPE
- ELEMENT
- CDATA
- COMMENT
- ENTITY
- TEXT (just a string)

## Test

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
