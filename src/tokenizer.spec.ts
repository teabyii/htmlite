import Tokenizer from './tokenizer';

const tokenizer = new Tokenizer();

test('doctype', () => {
  tokenizer.tokenize('<!DOCTYPE html>');
});

test('comment', () => {
  tokenizer.tokenize('<!-- hello world -->');
});

test('tag', () => {
  tokenizer.tokenize('<div class="box"></div>');
});

test('self-close', () => {
  tokenizer.tokenize('<br class="seperator />');
});

test('cdata', () => {
  tokenizer.tokenize('<![CDATA[hello world]]>');
});

test('entity', () => {
  console.log(tokenizer.tokenize('&nbsp;'));
});
