import {
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/abstract-provider';

export type TransactionError = {
  title: string;
  description?: string;
};

export type TransactionActionState = {
  init: boolean;
  confirming: boolean;
  confirmed: boolean;
  confirmedAt: string;
  error?: TransactionError | null;
  receipt?: TransactionReceipt;
};

export type TransactionActionInfo = {
  label: string;
  loadingLabel: string;
  confirmingLabel: string;
  stepTooltip: string;
  action: () => Promise<TransactionResponse>;
  postActionValidation?: () => Promise<boolean>;
  actionInvalidReason?: TransactionError;
  isSignAction?: boolean;
  isStakeAction?: boolean;
  isUnstakeAction?: boolean;
};
