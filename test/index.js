import WebComponents from '../src';
import WcPage from './src/components/wc-page';

// Construct web components
const webComponents = new WebComponents(window);
webComponents.register(WcPage);

// start all
webComponents.start();
