import { BatchSwapStep, SwapV2 } from '@balancer-labs/sdk';
import { BigNumberish } from '@ethersproject/bignumber';

export type RuleFunction = (val: string | number) => string | boolean;
export type Rules = Array<RuleFunction>;
export interface FormRef {
  validate(): boolean;
}

export interface Token {
  address: string;
  balance: string;
  balanceDenorm: BigNumberish;
  chainId: number;
  decimals: number;
  logoURI: string;
  name: string;
  price: number;
  price24HChange: number;
  symbol: string;
  value: number;
  value24HChange: number;
}

export type TokenMap = Record<string, Token>;

export interface Claim {
  id: string;
  amount: string;
}

export interface WalletError extends Error {
  code: number | string;
}

export type BatchSwap = {
  amountTokenOut: string;
  swaps: SwapV2[];
  assets: string[];
};

export type BatchSwapOut = {
  returnAmounts: string[];
  swaps: BatchSwapStep[];
  assets: string[];
};

export enum StepState {
  Todo,
  Active,
  WalletOpen,
  Pending,
  Success,
  Warning,
  Error,
  Completed,
}

export type Step = {
  tooltip: string;
  state: StepState;
};

export type Address = string;

export type TokenAmountMap = Record<Address, string>;

export type BaseContent = {
  title: string;
  description: string;
};

export interface BlockNumberResponse {
  data: {
    blocks: [
      {
        number: string;
      }
    ];
  };
}

export class CaseInsensitiveMap<T, U> extends Map<T, U> {
  set(key: T, value: U): this {
    if (typeof key === 'string') {
      key = key.toLowerCase() as any as T;
    }
    return super.set(key, value);
  }

  get(key: T): U | undefined {
    if (typeof key === 'string') {
      key = key.toLowerCase() as any as T;
    }

    return super.get(key);
  }

  has(key: T): boolean {
    if (typeof key === 'string') {
      key = key.toLowerCase() as any as T;
    }

    return super.has(key);
  }

  delete(key: T): boolean {
    const keyLowerCase =
      typeof key === 'string' ? (key.toLowerCase() as any as T) : key;
    return super.delete(keyLowerCase);
  }

  clear(): void {
    super.clear();
  }

  keys(): IterableIterator<T> {
    return super.keys();
  }

  values(): IterableIterator<U> {
    return super.values();
  }

  *entries(): IterableIterator<[T, U]> {
    const keys = super.keys();
    const values = super.values();
    for (let i = 0; i < super.size; i++) {
      yield [keys.next().value, values.next().value];
    }
  }

  forEach(
    callbackfn: (value: U, key: T, map: CaseInsensitiveMap<T, U>) => void
  ): void {
    const keys = super.keys();
    const values = super.values();
    for (let i = 0; i < super.size; i++) {
      callbackfn(values.next().value, keys.next().value, this);
    }
  }

  next(): IteratorResult<[T, U]> {
    return super.entries().next();
  }

  [Symbol.iterator](): IterableIterator<[T, U]> {
    return this;
  }
}
