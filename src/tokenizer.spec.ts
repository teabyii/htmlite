import Tokenizer from './tokenizer';

const tokenizer = new Tokenizer();

test('doctype', () => {
  tokenizer.tokenize('<!DOCTYPE html>');
  tokenizer.tokenize(
    '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">'
  );
});

test('comment', () => {
  tokenizer.tokenize('<!-- hello world -->');
});

test('tag', () => {
  tokenizer.tokenize('<div></div>');
  tokenizer.tokenize('<div><h1>hello world</h1></div>');
});

test('self-close', () => {
  tokenizer.tokenize('<br/>');
  tokenizer.tokenize('<br />');
});

test('attribute', () => {
  tokenizer.tokenize('<input type="checkbox"></input>');
  tokenizer.tokenize(`<input type='text'></input>`);
  tokenizer.tokenize(`<input type=text></input>`);
  tokenizer.tokenize(`<input type="text" />`);
  tokenizer.tokenize(`<input type='text' />`);
  tokenizer.tokenize(`<input type=text />`);
  tokenizer.tokenize(`<input type=text class="input" />`);
});

test('cdata', () => {
  tokenizer.tokenize('<![CDATA[hello world]]>');
});

test('entity', () => {
  tokenizer.tokenize('&nbsp;');
});

test('mixed', () => {
  tokenizer.tokenize(`
    <!DOCTYPE html>
    <html>
      <head>
        <link href="main.css" rel="stylesheet" />
      </head>
      <![CDATA[ hello tokenizer ]]>
      <body class="spring" data-set="tokenizer">
        <!-- comment -->
        <h1>&nbsp;&nbsp;</h1>
        <script src="/index.js"></script>
      </body>
    </html>
  `);
});
