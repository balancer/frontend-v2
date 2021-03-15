export type RuleFunction = (val: string) => string;
export type Rules = Array<RuleFunction>;

export interface FormRef {
  validate(): boolean;
}
