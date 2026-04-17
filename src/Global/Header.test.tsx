import { fireEvent, render, screen } from '@testing-library/react';
import Header from './Header';
import { LANGUAGE_OPTIONS } from '../i18nConfig';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('Header', () => {
  const originalConsoleError = console.error;

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation((message?: unknown, ...args: unknown[]) => {
      if (
        typeof message === 'string'
        && message.includes('ReactDOM.render is no longer supported in React 18')
      ) {
        return;
      }

      originalConsoleError(message, ...args);
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('renders every supported language in the selector', () => {
    render(<Header language='en' onLanguageChange={jest.fn()} />);

    const desktopSelect = screen.getAllByLabelText('language')[0] as HTMLSelectElement;
    expect(desktopSelect.value).toBe('en');

    const optionLabels = Array.from(desktopSelect.options).map((option) => option.textContent);
    expect(optionLabels).toEqual(LANGUAGE_OPTIONS.map((option) => option.label));
  });

  it('calls onLanguageChange when a new language is selected', () => {
    const onLanguageChange = jest.fn();
    render(<Header language='en' onLanguageChange={onLanguageChange} />);

    fireEvent.change(screen.getAllByLabelText('language')[0], { target: { value: 'ar' } });

    expect(onLanguageChange).toHaveBeenCalledWith('ar');
  });
});
