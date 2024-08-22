import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { render, screen, fireEvent, waitFor, act, } from '@testing-library/react';
import { BrowserRouter as Router, MemoryRouter, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import Login from './components/Login';
import GitHubCallback from './components/GitHubCallback';
import GoogleCallback from './components/GoogleCallback';


jest.mock('axios');

const mockSetIsAuthenticated = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockSetIsAuthenticated,
}));

describe('GitHubCallback Component', () => {
    const setIsAuthenticated = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
      localStorage.clear();
    });

    test('handles successful GitHub authorization', async () => {
      const accessToken = 'mocked-access-token';
      const code = 'mocked-github-code';

      axios.post.mockResolvedValueOnce({
        data: { access_token: accessToken },
      });

      window.history.pushState({}, 'GitHub Callback', `/callback?code=${code}`);
      render(
        <MemoryRouter initialEntries={[`/callback?code=${code}`]}>
          <Routes>
            <Route
              path="/callback"
              element={<GitHubCallback setIsAuthenticated={setIsAuthenticated} />}
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => expect(localStorage.getItem('access_token')).toBe(accessToken));
      expect(axios.defaults.headers.common['Authorization']).toBe(`Bearer ${accessToken}`);
      expect(setIsAuthenticated).toHaveBeenCalledWith(true);
      expect(mockSetIsAuthenticated).toHaveBeenCalledWith('/');
    });

    test('handles API request failure', async () => {
      const code = 'mocked-github-code';

      axios.post.mockRejectedValueOnce(new Error('API request failed'));

      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      window.history.pushState({}, 'GitHub Callback', `/callback?code=${code}`);
      render(
        <MemoryRouter initialEntries={[`/callback?code=${code}`]}>
          <Routes>
            <Route
              path="/callback"
              element={<GitHubCallback setIsAuthenticated={setIsAuthenticated} />}
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith('Error exchanging GitHub code:', expect.any(Object));
      });

      consoleError.mockRestore();
    });
  });


  describe('GoogleCallback Component', () => {
    const setIsAuthenticated = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
      localStorage.clear();
    });

    test('handles successful Google authorization', async () => {
      const accessToken = 'mocked-access-token';
      const idToken = 'mocked-id-token';
      const code = 'mocked-google-code';

      axios.post.mockResolvedValueOnce({
        data: { access_token: accessToken, id_token: idToken },
      });

      window.history.pushState({}, 'Google Callback', `/callback?code=${code}`);
      render(
        <MemoryRouter initialEntries={[`/callback?code=${code}`]}>
          <Routes>
            <Route
              path="/callback"
              element={<GoogleCallback setIsAuthenticated={setIsAuthenticated} />}
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(localStorage.getItem('access_token')).toBe(accessToken);
        expect(localStorage.getItem('id_token')).toBe(idToken);
        expect(axios.defaults.headers.common['Authorization']).toBe(`Bearer ${accessToken}`);
      });

      expect(setIsAuthenticated).toHaveBeenCalledWith(true);
      expect(mockSetIsAuthenticated).toHaveBeenCalledWith('/');
    });

    test('handles API request failure', async () => {
      const code = 'mocked-google-code';

      axios.post.mockRejectedValueOnce(new Error('API request failed'));

      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      window.history.pushState({}, 'Google Callback', `/callback?code=${code}`);
      render(
        <MemoryRouter initialEntries={[`/callback?code=${code}`]}>
          <Routes>
            <Route
              path="/callback"
              element={<GoogleCallback setIsAuthenticated={setIsAuthenticated} />}
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() =>
        expect(consoleError).toHaveBeenCalledWith('Error exchanging Google code:', expect.any(Object))
      );

      consoleError.mockRestore();
    });
  });


describe('Login Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
        render(
            <Router>
                <Login setIsAuthenticated={mockSetIsAuthenticated} />
            </Router>
        );
    });

    test('renders login form', () => {
        expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
        // Check for all buttons
        expect(screen.getAllByRole('button', { name: /login/i })).toHaveLength(3);
    });

    test('handles successful login', async () => {
        axios.post.mockResolvedValue({
            data: {
                access: 'mock_access_token',
                refresh: 'mock_refresh_token',
            },
        });

        fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'password' } });
        fireEvent.click(screen.getByRole('button', { name: /login using username/i }));

        await waitFor(() => {
            expect(localStorage.getItem('access_token')).toBe('mock_access_token');
            expect(localStorage.getItem('refresh_token')).toBe('mock_refresh_token');
            expect(mockSetIsAuthenticated).toHaveBeenCalledWith(true);
        });
    });

    test('handles login failure', async () => {
        axios.post.mockRejectedValue(new Error('Invalid credentials'));

        fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: 'wronguser' } });
        fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'wrongpassword' } });

        // Again, be specific with the button query
        fireEvent.click(screen.getByRole('button', { name: /login using username/i }));

        await waitFor(() => {
            expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
        });
    });

    test('redirects to Google OAuth on button click', () => {
        delete window.location; // Temporarily delete location object to mock it
        window.location = { href: '' }; // Mock location.href

        fireEvent.click(screen.getByRole('button', { name: /login with google/i }));

        expect(window.location.href).toContain('https://accounts.google.com/o/oauth2/v2/auth');
    });

    test('redirects to GitHub OAuth on button click', () => {
        delete window.location; // Temporarily delete location object to mock it
        window.location = { href: '' }; // Mock location.href

        fireEvent.click(screen.getByRole('button', { name: /login with github/i }));

        expect(window.location.href).toContain('https://github.com/login/oauth/authorize');
    });
});


describe('OAuth Login Component', () => {
    beforeEach(() => {
        render(
            <Router>
                <Login setIsAuthenticated={() => {}} />
            </Router>
        );
    });

    test('redirects to Google OAuth on button click', () => {
        delete window.location;
        window.location = { href: '' };

        fireEvent.click(screen.getByText(/login with google/i));

        expect(window.location.href).toContain('https://accounts.google.com/o/oauth2/v2/auth');
    });

    test('redirects to GitHub OAuth on button click', () => {
        delete window.location;
        window.location = { href: '' };

        fireEvent.click(screen.getByText(/login with github/i));

        expect(window.location.href).toContain('https://github.com/login/oauth/authorize');
    });
});




