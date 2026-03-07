import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders community board branding', () => {
  render(<App />);
  const linkElement = screen.getByText(/CommunityBoard/i);
  expect(linkElement).toBeInTheDocument();
});
