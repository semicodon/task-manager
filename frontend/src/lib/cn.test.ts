
import { describe, it, expect } from 'vitest'

import { cn } from './cn'

describe('cn — class name joiner', () => {
  it('joins truthy string values with spaces', () => {
    expect(cn('foo', 'bar', 'baz')).toBe('foo bar baz')
  })

  it('drops falsy values (null, undefined, false, empty string)', () => {
    expect(cn('btn', false, null, undefined, '')).toBe('btn')
  })

  it('handles all-falsy input by returning an empty string', () => {
    expect(cn(false, null, undefined)).toBe('')
  })

  it('handles zero arguments', () => {
    expect(cn()).toBe('')
  })

  it('coerces a 0 number to a class name', () => {
    expect(cn(0, 'foo')).toBe('foo')
  })
})
