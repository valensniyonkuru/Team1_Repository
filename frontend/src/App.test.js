import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Ping Logo by alt text', () => {
  render(<App />);
  const logoElement = screen.getByAltText(/Ping Logo/i);
  expect(logoElement).toBeInTheDocument();
});
