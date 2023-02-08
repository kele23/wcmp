import { service } from '../annotations/services';
import BasicTemplateLoader from './basic-template-loader';

@service({ name: 'string-template-loader', tags: 'template-loader' })
class StringTemplateLoader extends BasicTemplateLoader {
  #parser = new DOMParser();

  run(data) {
    const doc = this.#parser.parseFromString(data, 'text/html');
    return Array.from(doc.body.children);
  }
}

export default StringTemplateLoader;
