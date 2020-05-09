import { Tokenizer } from './tokenizer';
import { Tree } from './tree';

function parse(html: string) {
  const tokenizer = new Tokenizer();
  return new Tree(tokenizer.tokenize(html)).toJSON();
}

test('mixed', () => {
  const data = parse(`
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
  console.log(data);
  // console.log((data[1] as any).children[0] as any);
});
