import { getAddress } from '@ethersproject/address';

export function returnChecksum() {
  return function (target: any, key: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: any[]) {
      const result = originalMethod.apply(this, args);
      return getAddress(result);
    };
    return descriptor;
  };
}
