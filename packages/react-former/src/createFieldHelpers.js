// @flow

import { type Validity, type FieldValidationResult } from './createFormStore';
import { type Form, type FormDescriptor, type Field } from './createForm';

export type FieldHelper<Value, ValidationErrorCode: string> = $ReadOnly<{|
  value: Value,
  isValid: Validity,
  validationResult: FieldValidationResult<ValidationErrorCode>,
  setValue: (value: Value) => void,
  onChangeValue: (value: Value) => mixed,
  onChangeText: (value: Value) => mixed,
  // $FlowFixMe
  onChange: (event: any) => mixed,
|}>;

function createFieldHelper<Value, ValidationErrorCode: string>(
  field: Field<Value, ValidationErrorCode>,
): FieldHelper<Value, ValidationErrorCode> {
  const state = field.getState();

  const onChangeValue = (value) => field.setValue(value);

  return {
    value: state.value,
    isValid: state.isValid,
    validationResult: state.validationResult,
    setValue: field.setValue,
    onChangeValue: field.setValue,
    onChangeText: field.setValue,
    onChange: (event) => onChangeValue(event.target.value),
  };
}

type Fields<Descriptor: FormDescriptor> = $ObjMap<
  $PropertyType<Descriptor, 'fields'>,
  $PropertyType<Form<Descriptor>, 'getField'>,
>;
export type FieldHelpers<Descriptor: FormDescriptor> = $ObjMap<
  Fields<Descriptor>,
  typeof createFieldHelper,
>;

export default function createFieldHelpers<Descriptor: FormDescriptor>(
  form: Form<Descriptor>,
): FieldHelpers<Descriptor> {
  const fieldHelpers = Object.keys(form.descriptor.fields).reduce((helpers, fieldKey) => {
    const field = form.getField(fieldKey);

    // eslint-disable-next-line no-param-reassign
    helpers[fieldKey] = createFieldHelper(field);

    return helpers;
  }, {});

  return fieldHelpers;
}
