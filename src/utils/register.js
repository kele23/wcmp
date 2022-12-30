export class Register {
  #register = {};

  add(name, type, value, options) {
    const key = this.#makeKey(name, type);
    this.#register[key] = {
      name,
      type,
      ...options,
      value,
    };
  }

  get(name, type) {
    const key = this.#makeKey(name, type);
    return this.#register[key]?.value;
  }

  remove(name, type) {
    const key = this.#makeKey(name, type);
    delete this.#register[key];
  }

  list() {
    return Object.values(this.#register);
  }

  #makeKey(name, type) {
    return `${type}-${name}`;
  }
}
