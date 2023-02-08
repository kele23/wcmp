import { afterInit } from '../../../../src/annotations/common';
import { component, listener, storeListener } from '../../../../src/annotations/components';
import pageHtml from './wc-page.tpl';

@component({ template: pageHtml, templateLoader: 'string-template-loader' })
class WcPage extends HTMLElement {
  constructor() {
    super();
  }

  @listener({ ref: 'button' })
  buttonClick(event) {
    console.log('buttonClick', event);
  }

  @storeListener({ match: 'button' })
  buttonStore(path, newData) {
    console.log('store', newData);
  }

  @afterInit
  init() {
    console.log('ciao');
  }
}

export default WcPage;
