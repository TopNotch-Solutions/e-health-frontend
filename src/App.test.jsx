import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login as first screen', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /^login$/i })).toBeInTheDocument();
});
