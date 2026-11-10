import { describe, it, expect } from 'vitest';
import { escapeHtml } from './escapeHtml';

describe('escapeHtml', () => {
  it('neutralizes markup and attribute breakouts', () => {
    expect(escapeHtml('<img src=x onerror="alert(1)">')).toBe('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
    expect(escapeHtml(`" autofocus onfocus='x' a="`)).toBe('&quot; autofocus onfocus=&#39;x&#39; a=&quot;');
    expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
  });

  it('stringifies non-string values', () => {
    expect(escapeHtml(undefined)).toBe('');
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(1.5)).toBe('1.5');
  });
});
