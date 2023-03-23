import { it, expect, vi, describe } from 'vitest'
import getFolders from '../src/claimManual/getFolders.js'

const cb = vi.fn(arg => {
  if (typeof arg === 'object') {
    const resp = arg[0].exps[0]
    delete resp.dateCreated
    delete resp.dateLastModified
    console.log(resp)
    return resp
  }
  return arg
})

describe('GET-FOLDERS', () => {
  it('should call callback function that returns object with expNo metadata', async () => {
    await getFolders({ group: 'test-group' }, cb)

    expect(cb).toBeCalled()
    expect(cb).toReturnWith({
      expNo: '10',
      title: 'test-title',
      solvent: 'DMSO',
      pulseProgram: 'zg30',
      key: 'test-dataset#/#10'
    })
  })

  it('should call callback function that returns error string if group data folder does not exist', async () => {
    await getFolders({ group: 'test-error' }, cb)

    expect(cb).toBeCalled()
    expect(cb).toReturnWith('error')
  })
})
