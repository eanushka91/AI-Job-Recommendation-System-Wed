// __mocks__/lucide-react.js
const React = require('react');

const createIconMock = (displayName, defaultTestId) => {
  const MockIcon = (props) =>
    React.createElement('svg', {
      'data-testid': props['data-testid'] || defaultTestId || `lucide-${displayName.toLowerCase()}`,
      ...props,
    });
  MockIcon.displayName = displayName; // Helpful for debugging in React DevTools
  return MockIcon;
};

module.exports = {
  __esModule: true, // This is important for modules that are ES Modules
  X: createIconMock('X', 'lucide-x'),
  CheckIcon: createIconMock('CheckIcon', 'lucide-checkicon'),
  // Add any other specific icons your components might use directly by name here
  // For any other icons that might be dynamically used (less common for direct imports):
  default: new Proxy({}, {
    get: function(target, prop) {
      if (prop === '__esModule') return false;
      // Return a generic mock for any other requested icon
      return createIconMock(prop);
    }
  })
};