export class Attr {

  constructor(type, options) {
    this.options = options;
    this.prop = null;
    this.defaultValue = options.defaultValue;
    this.type = type;
  }

}

export function attr(type = 'string', options = {}) {
  return new Attr(type, options);
}

export default attr;
