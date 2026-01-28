import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Select } from './Select';

describe('Select', () => {
  const options = [
    { value: '', label: 'Select option' },
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
  ];

  it('renders select with label', () => {
    render(<Select label="Choose" id="test-select" options={options} />);
    expect(screen.getByLabelText('Choose')).toBeInTheDocument();
  });

  it('renders all options', () => {
    render(<Select options={options} />);
    expect(screen.getByText('Select option')).toBeInTheDocument();
    // Options are shown when dropdown is opened.
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('option', { name: 'Option 1' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Option 2' })).toBeInTheDocument();
  });

  it('calls onChange when option is selected', () => {
    const handleChange = vi.fn();
    render(<Select id="test-select" name="test" options={options} onChange={handleChange} />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByRole('option', { name: 'Option 1' }));
    expect(handleChange).toHaveBeenCalled();
  });

  it('shows required asterisk when required', () => {
    render(<Select label="Choose" options={options} required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('displays error message', () => {
    render(<Select options={options} error="Please select an option" />);
    expect(screen.getByText('Please select an option')).toBeInTheDocument();
  });

  it('disables select when disabled prop is true', () => {
    render(<Select options={options} disabled />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('sets selected value', () => {
    render(<Select options={options} value="1" onChange={() => {}} />);
    expect(screen.getByRole('button')).toHaveTextContent('Option 1');
  });
});
