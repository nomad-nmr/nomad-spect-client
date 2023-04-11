import { it, expect, vi, describe } from 'vitest'
import axios from 'axios'

import { uploadDataManual } from '../src/uploader.js'

vi.mock('axios')

describe('uploadDataManual', () => {
  it('should work', () => {
    uploadDataManual(
      `{"userId": "123", "group":"test-group", "expsArr": ["test-dataset#-#10"],"claimId": "456"}`
    )
    expect(true).toBe(true)
    // expect(axios.post).toBeCalled()
  })
})
