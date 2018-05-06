import { configure, addDecorator } from '@storybook/react';
import '@storybook/addon-console';
import { withNotes } from '@storybook/addon-notes';
import { withConsole } from '@storybook/addon-console';

function loadStories() {
  require('../stories/index.js');
}

addDecorator(withNotes);
addDecorator((storyFn, context) => withConsole()(storyFn)(context));
configure(loadStories, module);
