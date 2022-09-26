import {
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/abstract-provider';

import { Step } from './index';

export type TransactionError = {
  title: string;
  description: string;
};

export type TransactionActionState = {
  init: boolean;
  confirming: boolean;
  confirmed: boolean;
  confirmedAt: string;
  error?: TransactionError | null;
  receipt?: TransactionReceipt;
};

export type TransactionAction = {
  label: string;
  loadingLabel: string;
  pending: boolean;
  step: Step;
  promise: () => Promise<void>;
  isSignAction?: boolean;
};

export type TransactionActionInfo = {
  label: string;
  loadingLabel: string;
  confirmingLabel: string;
  stepTooltip: string;
  action: () => Promise<TransactionResponse>;
  isSignAction?: boolean;
  isStakeAction?: boolean;
  isUnstakeAction?: boolean;
};
