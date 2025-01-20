import { it, expect, vi, describe } from 'vitest'
import axios from '../src/axios-instance.js'

import { uploadDataManual, uploadDataAuto } from '../src/uploader.js'

vi.mock('../src/axios-instance.js')

axios.post.mockImplementation((...args) => Promise.resolve({ status: 200, url: args[0] }))

describe('uploadDataAuto', () => {
  it('should call axios.post to send multipart-form-data to /data/auto/ API endpoint', async () => {
    await uploadDataAuto(
      `{"datasetName": "2202281226-1-2-tl12", "expNo": "10", "group": "test-group"}`
    )

    expect(axios.post).toHaveReturnedWith({
      status: 200,
      url: '/data/auto/123-test-id'
    })
  })
})

describe('uploadDataManual', () => {
  it('should call axios.post to send multipart-form-data to /data/manual/ API endpoint', async () => {
    await uploadDataManual(
      `{"userId": "123", "group":"test-group", "expsArr": ["test-dataset#-#10"],"claimId": "456"}`
    )

    expect(axios.post).toHaveReturnedWith({
      status: 200,
      url: '/data/manual/123-test-id'
    })
  })
})
