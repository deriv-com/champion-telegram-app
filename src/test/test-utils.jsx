import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

// Create a container div that will be used for all tests
const createContainer = () => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  return container;
};

// Custom render function that includes router context
export function renderWithRouter(ui, { route = '/', ...renderOptions } = {}) {
  const container = createContainer();
  const user = userEvent.setup({
    document: container.ownerDocument,
  });

  const utils = render(ui, {
    wrapper: ({ children }) => (
      <MemoryRouter initialEntries={[route]}>
        {children}
      </MemoryRouter>
    ),
    container,
    ...renderOptions,
  });

  return {
    user,
    container,
    ...utils,
  };
}

// Standard render function with container setup
export function renderWithContainer(ui, options = {}) {
  const container = createContainer();
  return render(ui, { container, ...options });
}

// Re-export everything
export * from '@testing-library/react';
