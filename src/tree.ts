import { Token, Type } from './tokenizer';

export enum NodeType {
  ROOT = 'ROOT',
  DOCTYPE = 'DOCTYPE',
  ELEMENT = 'ELEMENT',
  CDATA = 'CDATA',
  COMMENT = 'COMMENT',
  ENTITY = 'ENTITY'
}

export interface Node {
  type: NodeType;
  tag?: string;
  children: (Node | string)[] | string;
  attrs?: Record<string, any>;
  parent?: Node;
}

function isEmpty(text?: string) {
  if (!text) return true;
  return text.trim() === '';
}

function reduceChildren(children: (Node | string)[]) {
  if (children.length === 1 && typeof children[0] === 'string')
    return children[0];
  else return children;
}

export class Tree {
  // 输入，输出
  tokens: Token[];

  // 遍历状态
  root = {
    type: NodeType.ROOT,
    children: []
  };
  current: Node = this.root;
  inTag = false;
  attr?: string;
  value?: (Node | string)[];

  constructor(tokens: Token[]) {
    this.tokens = tokens;
    this.build();
  }

  private build() {
    const { tokens } = this;

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const { current } = this;
      const { children } = current;
      if (!Array.isArray(children)) continue;

      const { type, data } = token;
      if (type === Type.DOCTYPE) {
        children.push({
          type: NodeType.DOCTYPE,
          children: data?.text as string,
          parent: current
        });
      } else if (type === Type.TEXT) {
        if (isEmpty(data?.text)) continue;
        if (!this.inTag) children.push(data?.text as string);
        else if (this.attr) {
          this.value?.push(data?.text as string);
        }
      } else if (type === Type.COMMENT) {
        children.push({
          type: NodeType.COMMENT,
          children: data?.text as string,
          parent: current
        });
      } else if (type === Type.CDATA) {
        children.push({
          type: NodeType.CDATA,
          children: data?.text as string,
          parent: current
        });
      } else if (type === Type.ENTITY) {
        const node = {
          type: NodeType.ENTITY,
          children: data?.text as string,
          parent: current
        };
        if (!this.inTag) {
          children.push(node);
        } else if (this.attr) {
          this.value?.push(node);
        }
      } else if (type === Type.OPEN_TAG_START) {
        const t = {
          type: NodeType.ELEMENT,
          tag: (data as any).tag,
          children: [],
          parent: current
        };
        children.push(t);
        // 切换上下文
        this.current = t;
        this.inTag = true;
      } else if (type === Type.OPEN_TAG_END) {
        this.inTag = false;
      } else if (type === Type.CLOSE_TAG || type === Type.SELF_CLOSE_TAG_END) {
        this.current = current.parent || this.root;
      } else if (type === Type.ATTRIBUTE_NAME) {
        const { name } = data as any;
        current.attrs = { ...current.attrs, [name]: true };
        this.attr = name;
      } else if (type === Type.ATTRIBUTE_VALUE_START) {
        if (this.attr && current.attrs) {
          current.attrs[this.attr] = [];
          this.value = current.attrs[this.attr];
        }
      } else if (type === Type.ATTRIBUTE_VALUE_END) {
        if (this.attr && current.attrs) {
          current.attrs[this.attr] = reduceChildren(current.attrs[this.attr]);
        }
        this.attr = undefined;
        this.value = undefined;
      } else {
        // error
      }
    }
  }

  toJSON() {
    return this.root.children;
  }
}
