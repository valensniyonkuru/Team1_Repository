import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Ping branding', () => {
  render(<App />);
  const logoElement = screen.getByAltText(/Ping/i);
  expect(logoElement).toBeInTheDocument();
});
