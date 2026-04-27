export type WeightUnit = 'kg' | 'lb';

export const WEIGHT_UNIT_OPTIONS: { label: string; value: WeightUnit }[] = [
  { label: 'KG', value: 'kg' },
  { label: 'LB', value: 'lb' },
];

export const DEFAULT_WEIGHT_UNIT: WeightUnit = 'lb';
