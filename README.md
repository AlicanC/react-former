# React Former

[![Build Status](https://travis-ci.org/AlicanC/react-former.svg?branch=master)](https://travis-ci.org/AlicanC/react-former)
[![codecov](https://codecov.io/gh/AlicanC/react-former/branch/master/graph/badge.svg)](https://codecov.io/gh/AlicanC/react-former)

A UI-less form management library for React.

- Gives you the freedom to use your own UI components
- Typed with Flow
- Doesn't depend on any specific React flavor

## Notes

This library is still at an early stage. API and stability improvements will be made as it gets more battle tested.

## Usage

```javascript
import { createForm, FormHelper } from 'react-former';

class MyForm extends React.Component {
  static getDerivedStateFromProps(nextProps, prevState) {
    const { user } = nextProps;

    if (user === prevState.user) return null;

    const form = createForm({
      fields: {
        name: {
          initialValue: user.name,
          validator: (value: string) => !!value.length || 'required',
        },
        username: {
          initialValue: user.username,
          validator: async (value: string) => {
            if (!value.length) return 'required';

            if (value === user.username) return true;

            if (!(await isUsernametaken(value))) return 'taken';

            return true;
          },
        },
      },
    });

    form.validate();

    return {
      user,
      form,
      formState: form.getState(),
    };
  }

  state = {
    user: null,
    form: null,
    formState: null,
  };

  _onFormStateChange = (formState) => {
    this.setState({ formState });
  };

  _onSubmit = () => {
    const formData = form.getData();

    console.log(formData);
  };

  render() {
    const { formState } = this.state;

    return (
      <React.Fragment>
        <FormHelper form={form} onFormStateChange={this._onFormStateChange}>
          {({ username, password }) => (
            <React.Fragment>
              <MyInput onChange={username.onChange} value={username.value} />
              <MyInput onChange={password.onChange} value={password.value} />
            </React.Fragment>
          )}
        </FormHelper>
        <MySubmitButton onPress={this._onSubmit} disabled={!formState.isValid} />
      </React.Fragment>
    );
  }
}
```
