import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ReportQrCode from './ReportQrCode';

describe('ReportQrCode Component', () => {
  it('renders nothing when value is empty or null', () => {
    const { container } = render(<ReportQrCode value="" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders QR code image with correct URI and verification label', () => {
    render(<ReportQrCode value="https://intervai.app/report/abc" label="Scan to verify" />);
    
    const img = screen.getByRole('img');
    expect(img).toBeDefined();
    expect(img.getAttribute('src')).toContain('api.qrserver.com');
    expect(img.getAttribute('src')).toContain('https%3A%2F%2Fintervai.app%2Freport%2Fabc');
    expect(screen.getByText('Scan to verify')).toBeDefined();
  });
});
