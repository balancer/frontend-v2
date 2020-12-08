import CwpStrategy, { name as cwpName } from './strategies/cwp';
import FlattenedStrategy, {
  name as flattenedName
} from './strategies/flattened';

export default {
  0: {
    type: '0',
    name: cwpName,
    class: CwpStrategy
  },
  1: {
    type: '1',
    name: flattenedName,
    class: FlattenedStrategy
  }
};
