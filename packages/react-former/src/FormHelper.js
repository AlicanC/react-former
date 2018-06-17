/* @flow */

import * as React from 'react';

import { type Form, type FormDescriptor } from './createForm';
import { type FormState } from './createFormStore';
import createFieldHelpers, { type FieldHelpers } from './createFieldHelpers';

export type Props<Descriptor: FormDescriptor> = {
  form: Form<Descriptor>,
  children: (fieldHelpers: FieldHelpers<Descriptor>, form: Form<Descriptor>) => React.Node,
  onFormStateChange?: (formState: FormState<Descriptor>) => void,
};

type State = {
  // $FlowFixMe
  fieldHelpers: FieldHelpers<any>,
};

export default class FormHelper<Descriptor: FormDescriptor> extends React.PureComponent<
  Props<Descriptor>,
  State,
> {
  state = {
    fieldHelpers: createFieldHelpers(
      // $FlowFixMe
      this.props.form,
    ),
  };
  // $FlowFixMe
  subscription: any;

  componentDidMount() {
    const { form } = this.props;

    this.subscription = form.subscribe((formState: FormState<Descriptor>) => {
      const { onFormStateChange } = this.props;

      if (onFormStateChange) {
        onFormStateChange(formState);
      }

      this.setState({
        fieldHelpers: createFieldHelpers(form),
      });
    });
  }

  componentWillUnmount() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  render() {
    const { form, children: render } = this.props;
    const { fieldHelpers } = this.state;

    const children = render(
      // $FlowFixMe
      fieldHelpers,
      form,
    );

    return children;
  }
}
