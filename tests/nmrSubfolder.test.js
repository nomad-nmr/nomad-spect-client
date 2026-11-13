import { it, expect, vi, describe, afterEach } from 'vitest'

import { resolveSubfolder, DEFAULT_NMR_SUBFOLDER } from '../src/config.js'

vi.mock('../src/axios-instance.js', () => ({
  default: { post: vi.fn((...args) => ({ status: 200, url: args[0] })) }
}))

//readConfig() is evaluated when uploader.js/getFolders.js are imported,
//so modules are re-imported after the environment is set
const importWithSubfolders = async (auto, manual) => {
  vi.resetModules()
  if (auto === undefined) delete process.env.NMR_SUBFOLDER_AUTO
  else process.env.NMR_SUBFOLDER_AUTO = auto
  if (manual === undefined) delete process.env.NMR_SUBFOLDER_MANUAL
  else process.env.NMR_SUBFOLDER_MANUAL = manual

  const axios = (await import('../src/axios-instance.js')).default
  axios.post.mockClear()
  const uploader = await import('../src/uploader.js')
  const getFolders = (await import('../src/claimManual/getFolders.js')).default
  return { axios, uploader, getFolders }
}

afterEach(() => {
  delete process.env.NMR_SUBFOLDER_AUTO
  delete process.env.NMR_SUBFOLDER_MANUAL
})

describe('resolveSubfolder', () => {
  it('defaults to "nmr" when the setting is missing', () => {
    expect(resolveSubfolder(undefined)).toBe(DEFAULT_NMR_SUBFOLDER)
    expect(resolveSubfolder(null)).toBe('nmr')
  })

  it('returns empty string for "", whitespace or "none"', () => {
    expect(resolveSubfolder('')).toBe('')
    expect(resolveSubfolder('  ')).toBe('')
    expect(resolveSubfolder('none')).toBe('')
    expect(resolveSubfolder('NONE')).toBe('')
  })

  it('keeps a custom subfolder name', () => {
    expect(resolveSubfolder(' spectra ')).toBe('spectra')
  })
})

describe('data paths without nmr subfolder', () => {
  it('uploads IconNMR data from <dataPath>/<group>/<dataset>/<expNo>', async () => {
    const { axios, uploader } = await importWithSubfolders('', undefined)
    await uploader.uploadDataAuto(
      `{"datasetName": "2202281226-1-2-tl12", "expNo": "10", "group": "test-group-flat"}`
    )
    expect(axios.post).toHaveReturnedWith({ status: 200, url: '/data/auto/123-test-id' })
  })

  it('does not find classic-layout data when subfolder is disabled', async () => {
    const { axios, uploader } = await importWithSubfolders('', undefined)
    await uploader.uploadDataAuto(
      `{"datasetName": "2202281226-1-2-tl12", "expNo": "10", "group": "test-group"}`
    )
    expect(axios.post).not.toHaveBeenCalled()
  })

  it('uploads manual data from <dataPath>/<group>/<dataset>/<expNo>', async () => {
    const { axios, uploader } = await importWithSubfolders(undefined, 'none')
    await uploader.uploadDataManual(
      `{"userId": "123", "group":"test-group-flat", "expsArr": ["test-dataset#-#10"],"claimId": "456"}`
    )
    expect(axios.post).toHaveReturnedWith({ status: 200, url: '/data/manual/123-test-id' })
  })

  it('lists manual folders from <dataPath>/<group>', async () => {
    const { getFolders } = await importWithSubfolders(undefined, '')
    const cb = vi.fn()
    await getFolders({ group: 'test-group-flat' }, cb)
    const result = cb.mock.calls[0][0]
    expect(result).not.toBe('error')
    expect(result[0].datasetName).toBe('test-dataset')
    expect(result[0].exps[0]).toMatchObject({
      expNo: '10',
      key: 'test-dataset#-#10'
    })
  })

  it('keeps the classic layout when settings are not set', async () => {
    const { axios, uploader } = await importWithSubfolders(undefined, undefined)
    await uploader.uploadDataAuto(
      `{"datasetName": "2202281226-1-2-tl12", "expNo": "10", "group": "test-group"}`
    )
    expect(axios.post).toHaveReturnedWith({ status: 200, url: '/data/auto/123-test-id' })
  })
})
