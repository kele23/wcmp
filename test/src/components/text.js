import { postConstruct } from '../../../src/annotations/common';
import { component, root } from '../../../src/annotations/components';

@component()
class Text {
  @root accessor #root;

  @postConstruct
  init() {
    console.log('CIAO');
  }
}

export default Text;
