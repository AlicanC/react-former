// @flow

import createFormStore from '../src/createFormStore';
import { type FormDescriptor } from '../src/createForm';

test('this is not enough', () => {
  const formDescriptor: FormDescriptor = {
    fields: {
      username: {
        initialValue: 'AlicanC',
      },
      password: {
        initialValue: 'pwisstronk',
      },
    },
  };

  const formStore = createFormStore(formDescriptor);

  expect(formStore.getState()).toMatchSnapshot();
});
