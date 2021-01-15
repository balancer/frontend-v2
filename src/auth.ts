import Vue from 'vue';
import { LockPlugin } from '@snapshot-labs/lock/plugins/vue';
import injected from '@snapshot-labs/lock/connectors/injected';
import fortmatic from '@snapshot-labs/lock/connectors/fortmatic';
import torus from '@snapshot-labs/lock/connectors/torus';
import portis from '@snapshot-labs/lock/connectors/portis';
import walletconnect from '@snapshot-labs/lock/connectors/walletconnect';
import walletlink from '@snapshot-labs/lock/connectors/walletlink';
import connectors from '@/constants/connectors.json';

const options: any = { connectors: [] };
const connectorClasses = {
  injected,
  fortmatic,
  torus,
  portis,
  walletconnect,
  walletlink
};

Object.entries(connectors).forEach((connector: any) => {
  options.connectors.push({
    key: connector[0],
    connector: connectorClasses[connector[0]],
    options: connector[1].options
  });
});

Vue.use(LockPlugin, options);
