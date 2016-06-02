export class Attr {
  constructor(type, options) {
    this.type = type;
    this.options = options;
    this.prop = null;
  }
}

export function attr(transformName = 'string', options = {}) {
  return new Attr(transformName, options);
}

export default attr;
