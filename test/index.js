import WebComponents from '../src';
import Button from './src/components/button';
import Page from './src/components/page';

// Construct web components
const webComponents = new WebComponents(document.body);

const dynamic = (name) => {
  return async () => {
    return (await import(`./src/components/${name}`)).default;
  };
};

webComponents.registerComponent(Page);
webComponents.registerComponent(Button);
webComponents.registerDynamicComponent('text', dynamic('text'));

// start all
webComponents.start();
