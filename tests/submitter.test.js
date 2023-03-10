import { it, expect, vi } from 'vitest'
import { writeFileSync } from 'fs'

import { deleteExps, submitExps, bookExps } from '../src/submitter.js'
import { bookingData1, bookingData2, bookingString1, bookingString2 } from './fixtures/submitter'

//mocking only writeFileSync in fs module
vi.mock('fs', async () => {
  const actual = await vi.importActual('fs')
  return {
    ...actual,
    writeFileSync: vi.fn((...args) => args[1])
  }
})

it('should write submission file that deletes holders 5 and 6', () => {
  deleteExps('["5", "6"]')
  expect(writeFileSync).toHaveLastReturnedWith(
    '\n  HOLDER 5\n  DELETE\n      \n  HOLDER 6\n  DELETE\n      \n  END'
  )
})

it('should write submission file that submits holders 5 and 6', () => {
  submitExps('["5", "6"]')
  expect(writeFileSync).toHaveLastReturnedWith(
    '\nHOLDER 5\nSUBMIT_HOLDER 5\n\t\t\t\nHOLDER 6\nSUBMIT_HOLDER 6\n\t\t\t\nEND'
  )
})

it('should write submission file that books two experiments for holder 7', () => {
  bookExps(bookingData1)
  expect(writeFileSync).toHaveLastReturnedWith(bookingString1)
})

it('should write submission file that books two experiments for holder 7 with NIGH, PRIORITY and custom parameters', () => {
  bookExps(bookingData2)
  expect(writeFileSync).toHaveLastReturnedWith(bookingString2)
})
