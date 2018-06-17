// @flow

import createFormStore, {
  type FormStore,
  // type FormState,
  type FieldState,
  type FieldValidationResult,
} from './createFormStore';

type MaybePromise<T> = T | Promise<T>;
export type FieldValidator<Value, ValidationErrorCode: string> = (
  value: Value,
) => MaybePromise<FieldValidationResult<ValidationErrorCode>>;

export type FieldDescriptor<Value, ValidationErrorCode: string> = $ReadOnly<{
  initialValue: Value,
  validator?: FieldValidator<Value, ValidationErrorCode>,
  // validators?: $ReadOnlyArray<FieldValidator<Value, ErrorCode>>,
}>;

export type FormDescriptor = $ReadOnly<{
  // $FlowFixMe
  fields: { [key: string]: FieldDescriptor<any, any> },
}>;

export type Field<Value, ValidationErrorCode: string> = $ReadOnly<{|
  getState: () => FieldState<Value, ValidationErrorCode>,
  setValue: (value: Value) => void,
|}>;

export type FormData<Descriptor: FormDescriptor> = $ObjMap<
  $PropertyType<Descriptor, 'fields'>,
  // $FlowFixMe
  <Value>(FieldDescriptor<Value, any>) => Value,
>;

type FieldDescriptorFromDescriptor<Descriptor: FormDescriptor, FieldKey: string> = $ElementType<
  $PropertyType<Descriptor, 'fields'>,
  FieldKey,
>;

export type Form<Descriptor: FormDescriptor> = $ReadOnly<{|
  descriptor: Descriptor,
  getState: $PropertyType<FormStore<Descriptor>, 'getState'>,
  subscribe: $PropertyType<FormStore<Descriptor>, 'addConsumer'>,
  getField: <FieldKey: string>(
    fieldKey: FieldKey,
  ) => $Call<
    <Value, ValidationErrorCode: string>(
      FieldDescriptor<Value, ValidationErrorCode>,
    ) => Field<Value, ValidationErrorCode>,
    FieldDescriptorFromDescriptor<Descriptor, FieldKey>,
  >,
  getData: () => FormData<Descriptor>,
  validate: () => void,
|}>;

export default function createForm<Descriptor: FormDescriptor>(
  descriptor: Descriptor,
): Form<Descriptor> {
  const {
    getState,
    addConsumer: subscribe,
    updateState,
    getFieldState,
    updateFieldState,
  } = createFormStore(descriptor);

  const setFieldValidationResult = (fieldKey, validationResult) => {
    // $FlowFixMe
    updateFieldState(fieldKey, {
      isValid: typeof validationResult === 'string' ? false : validationResult,
      validationResult,
    });

    // Update form validity
    if (validationResult === null) {
      // $FlowFixMe
      updateState({ isValid: null });
    } else if (typeof validationResult === 'string') {
      // $FlowFixMe
      updateState({ isValid: false });
    } else {
      const isValid = Object.keys(descriptor.fields).reduce((prevIsValid, aFieldKey) => {
        if (prevIsValid !== true) return prevIsValid;

        return getFieldState(aFieldKey).isValid;
      }, true);

      // $FlowFixMe
      updateState({ isValid });
    }
  };

  const validateField = async (fieldKey) => {
    const { validator } = descriptor.fields[fieldKey];
    const fieldState = getFieldState(fieldKey);

    let validationResult = true;

    if (validator) {
      setFieldValidationResult(fieldKey, null);

      validationResult = await validator(fieldState.value);
    }

    // TODO: Do proper cancelation
    if (fieldState.value !== getFieldState(fieldKey).value) return;

    setFieldValidationResult(fieldKey, validationResult);
  };

  // $FlowFixMe
  const setFieldValue = (fieldKey: any, value: any) => {
    // $FlowFixMe
    updateFieldState(fieldKey, { value });
    validateField(fieldKey);
  };

  // $FlowFixMe
  const getField = (fieldKey): Field<any, any> => {
    const field = {
      getState: () => getFieldState(fieldKey),
      setValue: (value) => setFieldValue(fieldKey, value),
    };

    Object.freeze(field);

    return field;
  };

  const getData = () =>
    Object.keys(descriptor.fields).reduce((fv, fieldKey) => {
      // eslint-disable-next-line no-param-reassign
      fv[fieldKey] = getFieldState(fieldKey).value;

      return fv;
    }, {});

  const validate = () => {
    Object.keys(descriptor.fields).forEach(validateField);
  };

  const form: Form<Descriptor> = {
    descriptor,
    getState,
    getData,
    subscribe,
    getField,
    validate,
  };

  Object.freeze(form);

  return form;
}
