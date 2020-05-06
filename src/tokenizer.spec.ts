import Tokenizer, { Type } from './tokenizer';

const tokenizer = new Tokenizer();

test('doctype', () => {
  const t1 = tokenizer.tokenize('<!DOCTYPE html>');
  expect(t1[0]).toEqual({ type: 'DOCTYPE', data: ' html' });
  const t2 = tokenizer.tokenize(
    '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">'
  );
  expect(t2[0]).toEqual({
    type: 'DOCTYPE',
    data:
      ' HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd"'
  });
});

test('comment', () => {
  const t1 = tokenizer.tokenize('<!-- hello world -->');
  expect(t1[0]).toEqual({ type: 'COMMENT', data: ' hello world ' });
});

test('tag', () => {
  const t1 = tokenizer.tokenize('<div></div>');
  expect(t1).toEqual([
    { type: 'OPEN_TAG_START', data: { tag: 'div' } },
    { type: 'OPEN_TAG_END' },
    { type: 'CLOSE_TAG', data: { tag: 'div' } }
  ]);
  const t2 = tokenizer.tokenize('<div><h1>hello world</h1></div>');
  expect(t2).toEqual([
    { type: 'OPEN_TAG_START', data: { tag: 'div' } },
    { type: 'OPEN_TAG_END' },
    { type: 'OPEN_TAG_START', data: { tag: 'h1' } },
    { type: 'OPEN_TAG_END' },
    { type: 'TEXT', data: 'hello world' },
    { type: 'CLOSE_TAG', data: { tag: 'h1' } },
    { type: 'CLOSE_TAG', data: { tag: 'div' } }
  ]);
});

test('self-close', () => {
  const t1 = tokenizer.tokenize('<br/>');
  expect(t1).toEqual([
    { type: 'OPEN_TAG_START', data: { tag: 'br' } },
    { type: 'SELF_CLOSE_TAG_END' }
  ]);
  const t2 = tokenizer.tokenize('<br />');
  expect(t2).toEqual([
    { type: 'OPEN_TAG_START', data: { tag: 'br' } },
    { type: 'SELF_CLOSE_TAG_END' }
  ]);
});

test('attribute', () => {
  const t1 = tokenizer.tokenize('<input type="checkbox"></input>');
  expect(t1).toEqual([
    { type: 'OPEN_TAG_START', data: { tag: 'input' } },
    { type: 'ATTRIBUTE_NAME', data: { name: 'type' } },
    { type: 'ATTRIBUTE_VALUE_START' },
    { type: 'TEXT', data: 'checkbox' },
    { type: 'ATTRIBUTE_VALUE_END' },
    { type: 'OPEN_TAG_END' },
    { type: 'CLOSE_TAG', data: { tag: 'input' } }
  ]);
  const t2 = tokenizer.tokenize(`<input type='text'></input>`);
  expect(t2).toEqual([
    { type: 'OPEN_TAG_START', data: { tag: 'input' } },
    { type: 'ATTRIBUTE_NAME', data: { name: 'type' } },
    { type: 'ATTRIBUTE_VALUE_START' },
    { type: 'TEXT', data: 'text' },
    { type: 'ATTRIBUTE_VALUE_END' },
    { type: 'OPEN_TAG_END' },
    { type: 'CLOSE_TAG', data: { tag: 'input' } }
  ]);
  const t3 = tokenizer.tokenize(`<input type=text></input>`);
  expect(t3).toEqual([
    { type: 'OPEN_TAG_START', data: { tag: 'input' } },
    { type: 'ATTRIBUTE_NAME', data: { name: 'type' } },
    { type: 'ATTRIBUTE_VALUE_START' },
    { type: 'TEXT', data: 'text' },
    { type: 'ATTRIBUTE_VALUE_END' },
    { type: 'OPEN_TAG_END' },
    { type: 'CLOSE_TAG', data: { tag: 'input' } }
  ]);
  const t4 = tokenizer.tokenize(`<input type="text" />`);
  expect(t4).toEqual([
    { type: 'OPEN_TAG_START', data: { tag: 'input' } },
    { type: 'ATTRIBUTE_NAME', data: { name: 'type' } },
    { type: 'ATTRIBUTE_VALUE_START' },
    { type: 'TEXT', data: 'text' },
    { type: 'ATTRIBUTE_VALUE_END' },
    { type: 'SELF_CLOSE_TAG_END' }
  ]);
  const t5 = tokenizer.tokenize(`<input type='text' />`);
  expect(t5).toEqual([
    { type: 'OPEN_TAG_START', data: { tag: 'input' } },
    { type: 'ATTRIBUTE_NAME', data: { name: 'type' } },
    { type: 'ATTRIBUTE_VALUE_START' },
    { type: 'TEXT', data: 'text' },
    { type: 'ATTRIBUTE_VALUE_END' },
    { type: 'SELF_CLOSE_TAG_END' }
  ]);
  const t6 = tokenizer.tokenize(`<input type=text />`);
  expect(t6).toEqual([
    { type: 'OPEN_TAG_START', data: { tag: 'input' } },
    { type: 'ATTRIBUTE_NAME', data: { name: 'type' } },
    { type: 'ATTRIBUTE_VALUE_START' },
    { type: 'TEXT', data: 'text' },
    { type: 'ATTRIBUTE_VALUE_END' },
    { type: 'SELF_CLOSE_TAG_END' }
  ]);
  const t7 = tokenizer.tokenize(`<input type=text class="input" />`);
  expect(t7).toEqual([
    { type: 'OPEN_TAG_START', data: { tag: 'input' } },
    { type: 'ATTRIBUTE_NAME', data: { name: 'type' } },
    { type: 'ATTRIBUTE_VALUE_START' },
    { type: 'TEXT', data: 'text' },
    { type: 'ATTRIBUTE_VALUE_END' },
    { type: 'ATTRIBUTE_NAME', data: { name: 'class' } },
    { type: 'ATTRIBUTE_VALUE_START' },
    { type: 'TEXT', data: 'input' },
    { type: 'ATTRIBUTE_VALUE_END' },
    { type: 'SELF_CLOSE_TAG_END' }
  ]);
});

test('cdata', () => {
  const t1 = tokenizer.tokenize('<![CDATA[hello world]]>');
  expect(t1).toEqual([{ type: 'CDATA', data: 'hello world' }]);
});

test('entity', () => {
  const t2 = tokenizer.tokenize('&nbsp;');
  expect(t2).toEqual([{ type: 'ENTITY', data: 'nbsp' }]);
});

test('mixed', () => {
  let t1 = tokenizer.tokenize(`
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
  t1 = t1.filter(n => n.type !== Type.TEXT || n.data?.trim() !== '');
  expect(t1).toEqual([
    { type: 'DOCTYPE', data: ' html' },
    { type: 'OPEN_TAG_START', data: { tag: 'html' } },
    { type: 'OPEN_TAG_END' },
    { type: 'OPEN_TAG_START', data: { tag: 'head' } },
    { type: 'OPEN_TAG_END' },
    { type: 'OPEN_TAG_START', data: { tag: 'link' } },
    { type: 'ATTRIBUTE_NAME', data: { name: 'href' } },
    { type: 'ATTRIBUTE_VALUE_START' },
    { type: 'TEXT', data: 'main.css' },
    { type: 'ATTRIBUTE_VALUE_END' },
    { type: 'ATTRIBUTE_NAME', data: { name: 'rel' } },
    { type: 'ATTRIBUTE_VALUE_START' },
    { type: 'TEXT', data: 'stylesheet' },
    { type: 'ATTRIBUTE_VALUE_END' },
    { type: 'SELF_CLOSE_TAG_END' },
    { type: 'CLOSE_TAG', data: { tag: 'head' } },
    { type: 'CDATA', data: ' hello tokenizer ' },
    { type: 'OPEN_TAG_START', data: { tag: 'body' } },
    { type: 'ATTRIBUTE_NAME', data: { name: 'class' } },
    { type: 'ATTRIBUTE_VALUE_START' },
    { type: 'TEXT', data: 'spring' },
    { type: 'ATTRIBUTE_VALUE_END' },
    { type: 'ATTRIBUTE_NAME', data: { name: 'data-set' } },
    { type: 'ATTRIBUTE_VALUE_START' },
    { type: 'TEXT', data: 'tokenizer' },
    { type: 'ATTRIBUTE_VALUE_END' },
    { type: 'OPEN_TAG_END' },
    { type: 'COMMENT', data: ' comment ' },
    { type: 'OPEN_TAG_START', data: { tag: 'h1' } },
    { type: 'OPEN_TAG_END' },
    { type: 'ENTITY', data: 'nbsp' },
    { type: 'ENTITY', data: 'nbsp' },
    { type: 'CLOSE_TAG', data: { tag: 'h1' } },
    { type: 'OPEN_TAG_START', data: { tag: 'script' } },
    { type: 'ATTRIBUTE_NAME', data: { name: 'src' } },
    { type: 'ATTRIBUTE_VALUE_START' },
    { type: 'TEXT', data: '/index.js' },
    { type: 'ATTRIBUTE_VALUE_END' },
    { type: 'OPEN_TAG_END' },
    { type: 'CLOSE_TAG', data: { tag: 'script' } },
    { type: 'CLOSE_TAG', data: { tag: 'body' } },
    { type: 'CLOSE_TAG', data: { tag: 'html' } }
  ]);
});
