import { act, render, screen } from '@testing-library/react';
import App from './App';

const renderAt = async (path) => {
  window.history.pushState({}, '', path);
  await act(async () => {
    render(<App />);
  });
};

beforeAll(() => {
  window.scrollTo = jest.fn();
});

test('renders the homepage hero and primary calls to action', async () => {
  await renderAt('/');
  expect(screen.getByRole('heading', { level: 1, name: /shift swaps your whole team can count on/i })).toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: /create a company account/i }).length).toBeGreaterThan(0);
  expect(screen.getAllByRole('link', { name: /join your company/i }).length).toBeGreaterThan(0);
});

test('lazy-loads the features page', async () => {
  await renderAt('/features');
  expect(await screen.findByRole('heading', { level: 1, name: /everything a fair shift swap needs/i })).toBeInTheDocument();
});

test('shows the not-found page for unknown routes', async () => {
  await renderAt('/definitely-not-a-page');
  expect(await screen.findByRole('heading', { level: 1, name: /this shift doesn't exist/i })).toBeInTheDocument();
});
