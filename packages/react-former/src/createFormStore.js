// @flow

import { createStore, type Store } from 'reductress-core';

import { type FormDescriptor, type FieldDescriptor } from './createForm';

export type Validity =
  | true // Valid
  | false // Invalid
  | null; // Pending

export type FieldValidationResult<ErrorCode: string> =
  | true // Valid
  | ErrorCode // Invalid
  | null; // Pending

export type FieldState<Value, ValidationErrorCode: string> = $ReadOnly<{
  value: Value,
  isValid: Validity,
  validationResult: FieldValidationResult<ValidationErrorCode>,
}>;

function createFieldState<Value, ValidationErrorCode: string>(
  fieldDescriptor: FieldDescriptor<Value, ValidationErrorCode>,
): FieldState<Value, ValidationErrorCode> {
  return {
    value: fieldDescriptor.initialValue,
    isValid: null,
    validationResult: null,
  };
}

type FormStateFields<Descriptor: FormDescriptor> = $ObjMap<
  $PropertyType<Descriptor, 'fields'>,
  typeof createFieldState,
>;

export type FormState<Descriptor: FormDescriptor> = $ReadOnly<{
  fields: FormStateFields<Descriptor>,
  isValid: Validity,
}>;

export type FormStore<Descriptor: FormDescriptor> = Store<FormState<Descriptor>> &
  $ReadOnly<{
    updateState: (formState: $Shape<FormState<Descriptor>>) => void,
    // $FlowFixMe
    getFieldState: <FieldKey: string>(fieldKey: FieldKey) => any,
    updateFieldState: <FieldKey: string>(
      fieldKey: FieldKey,
      // $FlowFixMe
      fieldState: $Shape<FieldState<any, any>>,
    ) => void,
  }>;

export default function createFormStore<Descriptor: FormDescriptor>(
  formDescriptor: Descriptor,
): FormStore<Descriptor> {
  const initialFieldStates = Object.keys(formDescriptor.fields).reduce((fv, fieldKey) => {
    const fieldDescription = formDescriptor.fields[fieldKey];

    // eslint-disable-next-line no-param-reassign
    fv[fieldKey] = createFieldState(fieldDescription);

    return fv;
  }, {});

  const initialState: FormState<Descriptor> = {
    fields: initialFieldStates,
    isValid: null,
  };

  const reductressStore = createStore(initialState);

  const updateState = (formState) => {
    const state = reductressStore.getState();

    // $FlowFixMe
    const nextState = {
      ...state,
      ...formState,
    };

    reductressStore.setState(nextState);
  };

  const getFieldState = (fieldKey) => reductressStore.getState().fields[fieldKey];
  const updateFieldState = (fieldKey, fieldState) => {
    const state = reductressStore.getState();

    // $FlowFixMe
    const nextState = {
      ...state,
      fields: {
        ...state.fields,
        [fieldKey]: {
          ...state.fields[fieldKey],
          // $FlowFixMe
          ...fieldState,
        },
      },
    };

    reductressStore.setState(nextState);
  };

  const formStore: FormStore<Descriptor> = {
    ...reductressStore,
    updateState,
    getFieldState,
    updateFieldState,
  };

  Object.freeze(formStore);

  return formStore;
}
