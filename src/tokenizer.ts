export enum Type {
  DOCTYPE = 'DOCTYPE',
  OPEN_TAG = 'TAG_OPEN',
  CLOSE_TAG = 'TAG_CLOSE',
  ATTRIBUTE = 'ATTRIBUTE',
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
  BeforeAttributeName,
  AfterAttributeName,
  AttributeName,
  BeforeAttributeValue,
  AttributeValue,
  AfterAttributeValue,
  SelfClosingStartTag,
  CharacterReference,
  MarkupDeclarationOpen,
  CommentStart,
  CommentStartDash,
  Comment,
  CommentEndDash,
  CommentEnd,
  CDATASection,
  CDATASectionBracket,
  CDATASectionEnd,
  Doctype,
  Processing
}

interface Token {
  type: Type;
  data: Record<string, any>;
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

export default class Tokenizer {
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
      case State.AttributeValue:
        this.onAttributeValue();
        break;
      case State.AfterAttributeValue:
        this.onAfterAttributeValue();
        break;
      case State.SelfClosingStartTag:
        this.onSelfClosingStartTag();
        break;
      case State.CharacterReference:
        this.onCharacterReference();
        break;
      case State.MarkupDeclarationOpen:
        this.onMarkupDeclarationOpen();
        break;
      case State.CommentStart:
        this.onCommentStart();
        break;
      case State.CommentStartDash:
        this.onCommentStartDash();
        break;
      case State.Comment:
        this.onComment();
        break;
      case State.CommentEndDash:
        this.onCommentEndDash();
        break;
      case State.CommentEnd:
        this.onCommentEnd();
        break;
      case State.CDATASection:
        this.onCDATASection();
        break;
      case State.CDATASectionBracket:
        this.onCDATASectionBracket();
        break;
      case State.CDATASectionEnd:
        this.onCDATASectionEnd();
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

  private addToken(type: Type, data: any) {
    this.token.push({ type, data });
    this.start = -1; // reset section start
  }

  private getSection() {
    return this.source.substring(this.start, this.pos);
  }

  private onData() {
    const { cur } = this;
    if (cur === '<') {
      this.state = State.TagOpen;
      if (this.start !== -1) {
        this.addToken(Type.TEXT, this.getSection());
      }
    } else if (cur === '&') {
      this.state = State.CharacterReference;
      this.returnState = State.Data;
      if (this.start !== -1) {
        this.addToken(Type.TEXT, this.getSection());
      }
    } else {
      if (this.start === -1) this.start = this.pos;
    }
  }

  private onTagOpen() {
    const { cur } = this;
    if (cur === '!') {
      this.state = State.MarkupDeclarationOpen;
    }
    if (cur === '/') {
      this.state = State.EndTagOpen;
    }
    if (isLetter(cur)) {
      this.state = State.TagName;
    }
  }

  private onEndTagOpen() {}

  private onTagName() {}

  private onBeforeAttributeName() {}

  private onAfterAttributeName() {}

  private onAttributeName() {}

  private onBeforeAttributeValue() {}

  private onAttributeValue() {}

  private onAfterAttributeValue() {}

  private onSelfClosingStartTag() {}

  private onCharacterReference() {
    const { cur, pos } = this;
    if (isWhiteSpace(cur)) {
      this.state = this.returnState;
      this.start = pos - 1; // move back
    } else if (cur === ';') {
      this.state = this.returnState;
      if (pos - this.start > 1) {
        this.addToken(Type.ENTITY, this.getSection());
      } else {
        this.start = pos - 1;
      }
    } else {
      this.state = State.CharacterReference;
      if (this.start === -1) this.start = pos;
    }
  }

  private onMarkupDeclarationOpen() {}

  private onCommentStart() {}

  private onCommentStartDash() {}

  private onComment() {}

  private onCommentEndDash() {}

  private onCommentEnd() {}

  private onCDATASection() {}

  private onCDATASectionBracket() {}

  private onCDATASectionEnd() {}

  private onDoctype() {}

  private onProcessing() {}
}
