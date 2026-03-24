import { withModuleFederation } from '@nx/module-federation/angular';
import config from './module-federation.config';

/**
 * DTS Plugin is disabled in Nx Workspaces as Nx already provides Typing support for Module Federation
 * The DTS Plugin can be enabled by setting dts: true
 * Learn more about the DTS Plugin here: https://module-federation.io/configure/dts.html
 */
export default withModuleFederation(
  {
    ...config,
    remotes: [
      ['product', 'http://a5d10a03df4854b31852097b4df725ec-1461367908.us-east-1.elb.amazonaws.com/product-remote/remoteEntry.mjs'],
      ['cart',    'http://a5d10a03df4854b31852097b4df725ec-1461367908.us-east-1.elb.amazonaws.com/cart-remote/remoteEntry.mjs'],
      ['auth',    'http://a5d10a03df4854b31852097b4df725ec-1461367908.us-east-1.elb.amazonaws.com/auth-remote/remoteEntry.mjs'],
    ],
  },
  { dts: false },
);
