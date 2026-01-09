import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn utility', () => {
  it('merges class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional class names', () => {
    expect(cn('foo', true && 'bar')).toBe('foo bar')
    expect(cn('foo', false && 'bar')).toBe('foo')
  })

  it('handles undefined and null values', () => {
    expect(cn('foo', undefined, 'bar')).toBe('foo bar')
    expect(cn('foo', null, 'bar')).toBe('foo bar')
  })

  it('handles arrays of class names', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar')
    expect(cn(['foo'], ['bar'])).toBe('foo bar')
  })

  it('handles objects with boolean values', () => {
    expect(cn({ foo: true, bar: false })).toBe('foo')
    expect(cn({ foo: true, bar: true })).toBe('foo bar')
  })

  it('merges tailwind classes correctly', () => {
    // tailwind-merge should dedupe conflicting classes
    expect(cn('p-4', 'p-2')).toBe('p-2')
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
    expect(cn('bg-white', 'bg-black')).toBe('bg-black')
  })

  it('preserves non-conflicting tailwind classes', () => {
    expect(cn('p-4', 'm-2')).toBe('p-4 m-2')
    expect(cn('text-lg', 'font-bold')).toBe('text-lg font-bold')
  })

  it('handles complex tailwind class combinations', () => {
    expect(cn('px-4 py-2', 'px-2')).toBe('py-2 px-2')
    expect(cn('hover:bg-gray-100', 'hover:bg-gray-200')).toBe('hover:bg-gray-200')
  })

  it('handles empty inputs', () => {
    expect(cn()).toBe('')
    expect(cn('')).toBe('')
    expect(cn('', '')).toBe('')
  })

  it('handles mixed inputs', () => {
    expect(cn('foo', { bar: true }, ['baz'], null, undefined)).toBe('foo bar baz')
  })
})
