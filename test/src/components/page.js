import { component, storeListener, sub } from '../../../src/annotations/components';

@component()
class Page {
  @sub() accessor #button;

  @storeListener({ match: 'button' })
  buttonStore(path, newData) {
    console.log('store', newData);
  }
}

export default Page;
