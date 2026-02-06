export type ParameterType = 'string' | 'number' | 'boolean' | 'select';

export interface Parameter {
  id: string;
  name: string;
  key: string;
  type: ParameterType;
  options?: string[];
  category?: string;
}
