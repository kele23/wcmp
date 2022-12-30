import { component, root } from '../../../src/annotations/components';

@component()
class Text {
  @root accessor #root;
}

export default Text;
