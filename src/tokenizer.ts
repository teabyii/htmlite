export enum Type {
  DOCTYPE = 'DOCTYPE',
  OPEN_TAG_START = 'OPEN_TAG_START',
  OPEN_TAG_END = 'OPEN_TAG_END',
  SELF_CLOSE_TAG_END = 'SELF_CLOSE_TAG_END',
  CLOSE_TAG = 'CLOSE_TAG',
  ATTRIBUTE_NAME = 'ATTRIBUTE_NAME',
  ATTRIBUTE_VALUE_START = 'ATTRIBUTE_VALUE_START',
  ATTRIBUTE_VALUE_END = 'ATTRIBUTE_VALUE_END',
  TEXT = 'TEXT',
  ENTITY = 'ENTITY',
  COMMENT = 'COMMENT',
  CDATA = 'CDATA',
  PROCESSING = 'PROCESSING'
}

enum State {
  Data = 1,
  TagOpen,
  EndTagOpen,
  TagName,
  TagClose,
  SelfClosing,
  BeforeAttributeName,
  AfterAttributeName,
  AttributeName,
  BeforeAttributeValue,
  AttributeValueSingleQuoted,
  AttributeValueDoubleQuoted,
  AttributeValueUnquoted,
  AfterAttributeValueQuoted,
  CharacterReference,
  MarkupDeclarationOpen,
  Comment,
  CDATASection,
  Doctype,
  Processing
}

export interface Token {
  type: Type;
  data?: Record<string, string>;
}

function isLetter(t: string) {
  const charCode = t.charCodeAt(0);
  if (charCode > 64 && charCode < 91) return true;
  if (charCode > 97 && charCode < 122) return true;
  return false;
}

function isWhiteSpace(t: string) {
  return t === ' ' || t === '\n' || t === '\t' || t === '\f' || t === '\r';
}

export class Tokenizer {
  // 状态机
  private state = State.Data;
  private returnState = State.Data;

  // 用于合并上下文，组成完整 token
  private start = -1;

  // 字符状态
  private cur = '';
  private pos = 0;

  // 输入，输出
  private source: string = '';
  private token: Token[] = [];

  tokenize(html: string) {
    if (html.length <= 0) return [];

    // reset
    this.state = State.Data;
    this.pos = -1;
    this.start = -1;
    this.cur = '';
    this.token = [];
    this.source = html;

    while (this.pos < html.length) {
      this.next();
    }

    return this.token;
  }

  next() {
    this.pos += 1;
    this.cur = this.source[this.pos];

    switch (this.state) {
      case State.Data:
        this.onData();
        break;
      case State.TagOpen:
        this.onTagOpen();
        break;
      case State.TagClose:
        this.onTagClose();
        break;
      case State.EndTagOpen:
        this.onEndTagOpen();
        break;
      case State.TagName:
        this.onTagName();
        break;
      case State.BeforeAttributeName:
        this.onBeforeAttributeName();
        break;
      case State.AttributeName:
        this.onAttributeName();
        break;
      case State.AfterAttributeName:
        this.onAfterAttributeName();
        break;
      case State.BeforeAttributeValue:
        this.onBeforeAttributeValue();
        break;
      case State.AttributeValueSingleQuoted:
        this.onAttributeValueSingleQuoted();
        break;
      case State.AttributeValueDoubleQuoted:
        this.onAttributeValueDoubleQuoted();
        break;
      case State.AttributeValueUnquoted:
        this.onAttributeValueUnquoted();
        break;
      case State.AfterAttributeValueQuoted:
        this.onAfterAttributeValueQuoted();
        break;
      case State.SelfClosing:
        this.onSelfClosing();
        break;
      case State.CharacterReference:
        this.onCharacterReference();
        break;
      case State.MarkupDeclarationOpen:
        this.onMarkupDeclarationOpen();
        break;
      case State.Comment:
        this.onComment();
        break;
      case State.CDATASection:
        this.onCDATASection();
        break;
      case State.Doctype:
        this.onDoctype();
        break;
      case State.Processing:
        this.onProcessing();
        break;
      default:
    }
  }

  private addToken(type: Type, data?: Record<string, string>) {
    const token: Token = { type };
    if (data !== undefined) token.data = data;
    this.token.push(token);
    this.start = -1; // reset section start
  }

  private getSection(end = this.pos) {
    return this.source.substring(this.start, end);
  }

  private onData() {
    const { cur } = this;
    if (cur === '<') {
      this.state = State.TagOpen;
      if (this.start !== -1) {
        this.addToken(Type.TEXT, { text: this.getSection() });
      }
    } else if (cur === '&') {
      this.state = State.CharacterReference;
      this.returnState = State.Data;
      if (this.start !== -1) {
        this.addToken(Type.TEXT, { text: this.getSection() });
      }
    } else {
      if (this.start === -1) this.start = this.pos;
    }
  }

  private onTagOpen() {
    const { cur } = this;
    if (cur === '!') {
      this.state = State.MarkupDeclarationOpen;
    } else if (cur === '/') {
      this.state = State.TagClose;
    } else if (isLetter(cur)) {
      this.pos -= 1;
      this.state = State.TagName;
    } else {
      // error
    }
  }

  private onTagClose() {
    const { cur, pos } = this;
    if (isLetter(cur)) {
      if (this.start === -1) this.start = pos;
    } else if (cur === '>') {
      this.addToken(Type.CLOSE_TAG, { tag: this.getSection() });
      this.state = State.Data;
    } else {
      // error
    }
  }

  private onTagName() {
    const { cur, pos } = this;
    if (isWhiteSpace(cur)) {
      this.addToken(Type.OPEN_TAG_START, { tag: this.getSection() });
      this.state = State.BeforeAttributeName;
    } else if (cur === '/') {
      this.addToken(Type.OPEN_TAG_START, { tag: this.getSection() });
      this.state = State.SelfClosing;
    } else if (cur === '>') {
      this.addToken(Type.OPEN_TAG_START, { tag: this.getSection() });
      this.pos -= 1;
      this.state = State.EndTagOpen;
    } else {
      if (this.start === -1) this.start = pos;
    }
  }

  private onEndTagOpen() {
    const { cur } = this;
    if (cur === '>') {
      this.addToken(Type.OPEN_TAG_END);
      this.state = State.Data;
    } else {
      // error
    }
  }

  private onBeforeAttributeName() {
    const { cur } = this;
    if (isWhiteSpace(cur)) {
      return;
    } else if (cur === '/' || cur === '>') {
      this.pos -= 1;
      this.state = State.AfterAttributeName;
    } else if (cur === '=') {
      // error
    } else {
      this.pos -= 1;
      this.state = State.AttributeName;
    }
  }

  private onAttributeName() {
    const { cur, pos } = this;
    if (cur === '/' || cur === '>' || isWhiteSpace(cur)) {
      this.pos -= 1;
      this.addToken(Type.ATTRIBUTE_NAME, { name: this.getSection() });
      this.state = State.AfterAttributeName;
    } else if (cur === '=') {
      this.addToken(Type.ATTRIBUTE_NAME, { name: this.getSection() });
      this.state = State.BeforeAttributeValue;
    } else if (cur === '"' || cur === "'" || cur === '<') {
      // error
    } else {
      if (this.start === -1) this.start = pos;
    }
  }

  private onAfterAttributeName() {
    const { cur } = this;
    if (isWhiteSpace(cur)) {
      return;
    } else if (cur === '/') {
      this.state = State.SelfClosing;
    } else if (cur === '=') {
      this.state = State.BeforeAttributeValue;
    } else if (cur === '>') {
      this.state = State.Data;
    } else {
      this.pos -= 1;
      this.state = State.AttributeName;
    }
  }

  private onBeforeAttributeValue() {
    const { cur } = this;
    if (isWhiteSpace(cur)) {
      return;
    } else if (cur === '"') {
      this.addToken(Type.ATTRIBUTE_VALUE_START);
      this.state = State.AttributeValueDoubleQuoted;
    } else if (cur === "'") {
      this.addToken(Type.ATTRIBUTE_VALUE_START);
      this.state = State.AttributeValueSingleQuoted;
    } else if (cur === '>') {
      // error
    } else {
      this.addToken(Type.ATTRIBUTE_VALUE_START);
      this.pos -= 1;
      this.state = State.AttributeValueUnquoted;
    }
  }

  private onAttributeValueSingleQuoted() {
    const { cur, pos } = this;
    if (cur === "'") {
      this.addToken(Type.TEXT, { text: this.getSection() });
      this.state = State.AfterAttributeValueQuoted;
    } else if (cur === '&') {
      this.addToken(Type.TEXT, { text: this.getSection() });
      this.state = State.CharacterReference;
      this.returnState = State.AttributeValueSingleQuoted;
    } else {
      if (this.start === -1) this.start = pos;
    }
  }
  private onAttributeValueDoubleQuoted() {
    const { cur, pos } = this;
    if (cur === '"') {
      this.addToken(Type.TEXT, { text: this.getSection() });
      this.state = State.AfterAttributeValueQuoted;
    } else if (cur === '&') {
      this.addToken(Type.TEXT, { text: this.getSection() });
      this.state = State.CharacterReference;
      this.returnState = State.AttributeValueDoubleQuoted;
    } else {
      if (this.start === -1) this.start = pos;
    }
  }

  private onAttributeValueUnquoted() {
    const { cur, pos } = this;
    if (isWhiteSpace(cur)) {
      this.addToken(Type.TEXT, { text: this.getSection() });
      this.addToken(Type.ATTRIBUTE_VALUE_END);
      this.state = State.BeforeAttributeName;
    } else if (cur === '&') {
      this.addToken(Type.TEXT, { text: this.getSection() });
      this.state = State.CharacterReference;
      this.returnState = State.AttributeValueUnquoted;
    } else if (cur === '>') {
      this.addToken(Type.TEXT, { text: this.getSection() });
      this.addToken(Type.ATTRIBUTE_VALUE_END);
      this.pos -= 1;
      this.state = State.EndTagOpen;
    } else if (
      cur === '"' ||
      cur === "'" ||
      cur === '<' ||
      cur === '=' ||
      cur === '`'
    ) {
      // error
    } else {
      if (this.start === -1) this.start = pos;
    }
  }

  private onAfterAttributeValueQuoted() {
    const { cur } = this;
    if (isWhiteSpace(cur)) {
      this.addToken(Type.ATTRIBUTE_VALUE_END);
      this.state = State.BeforeAttributeName;
    } else if (cur === '/') {
      this.addToken(Type.ATTRIBUTE_VALUE_END);
      this.state = State.SelfClosing;
    } else if (cur === '>') {
      this.addToken(Type.ATTRIBUTE_VALUE_END);
      this.pos -= 1;
      this.state = State.EndTagOpen;
    } else {
      this.pos -= 1;
      this.state = State.BeforeAttributeName;
    }
  }

  private onSelfClosing() {
    const { cur } = this;
    if (cur === '>') {
      this.addToken(Type.SELF_CLOSE_TAG_END);
      this.state = State.Data;
    } else {
      this.pos -= 1;
      this.state = State.BeforeAttributeName;
    }
  }

  private onCharacterReference() {
    const { cur, pos } = this;
    if (isWhiteSpace(cur)) {
      this.state = this.returnState;
      this.start = pos - 1; // move back
    } else if (cur === ';') {
      this.state = this.returnState;
      if (pos - this.start > 1) {
        this.addToken(Type.ENTITY, { text: this.getSection() });
      } else {
        this.start = pos - 1;
      }
    } else {
      this.state = State.CharacterReference;
      if (this.start === -1) this.start = pos;
    }
  }

  private onMarkupDeclarationOpen() {
    const { pos, source } = this;
    if (source.substring(pos, pos + 2) === '--') {
      this.state = State.Comment;
      this.pos += 1;
    } else if (source.substring(pos, pos + 7).toLowerCase() === 'doctype') {
      this.state = State.Doctype;
      this.pos += 6;
    } else if (source.substring(pos, pos + 7).toLowerCase() === '[cdata[') {
      this.state = State.CDATASection;
      this.pos += 6;
    } else {
      // error
    }
  }

  private onComment() {
    const { pos } = this;
    if (this.source.substring(pos, pos + 3) === '-->') {
      this.addToken(Type.COMMENT, { text: this.getSection() });
      this.pos += 2;
      this.state = State.Data;
    } else {
      if (this.start === -1) this.start = pos;
    }
  }

  private onCDATASection() {
    const { pos } = this;
    if (this.source.substring(pos, pos + 3) === ']]>') {
      this.addToken(Type.CDATA, { text: this.getSection() });
      this.pos += 2;
      this.state = State.Data;
    } else {
      if (this.start === -1) this.start = pos;
    }
  }

  private onDoctype() {
    const { cur, pos } = this;
    if (cur === '>') {
      this.addToken(Type.DOCTYPE, { text: this.getSection() });
      this.start = -1;
      this.state = State.Data;
    } else {
      if (this.start === -1) this.start = pos;
    }
  }

  private onProcessing() {}
}
