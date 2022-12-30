import { component, listener } from '../../../src/annotations/components';
import { reference } from '../../../src/annotations/services';

@component()
class Button {
  @reference() accessor #storeManager;

  @listener({
    event: 'click',
  })
  clickButton() {
    this.#storeManager.emit('button', { hello: 'ciao' });
  }
}

export default Button;
