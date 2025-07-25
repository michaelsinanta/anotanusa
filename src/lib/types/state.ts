export type ActionState<T> = {
  message: string;
  isError: boolean;
  isValid: boolean;
  validationErrors?: T;
};
