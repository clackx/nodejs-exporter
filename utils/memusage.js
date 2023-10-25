/* based on https://github.com/pixelb/ps_mem/blob/master/ps_mem.py */

var fsa = require('fs').promises

module.exports = class MemUsage {

  constructor() {
    this.memUsageObj = {}
    this.prevUsageObj = {}
    this.updateInfo()
  }


  summarize(usageObj) {
    const process = usageObj.process
    if (!this.memUsageObj[process])
      this.memUsageObj[process] = { ...usageObj }
    else
      for (let key of Object.keys(usageObj))
        if (Number(usageObj[key]))
          this.memUsageObj[process][key] += usageObj[key]

  }


  async readAsync(filename) {
    let result
    try {
      result = await fsa.readFile(filename, 'utf8')
    } catch (err) {
      if (!['EACCES', 'ESRCH', 'ENOENT'].includes(err.code))
        console.log(filename, 'read err:', err.message)
      return
    }
    return result
  }


  async getProcStat(pid) {
    if (!Number(pid)) return

    const rows = await this.readAsync('/proc/' + pid + '/smaps_rollup')
    const cmdline = await this.readAsync('/proc/' + pid + '/cmdline')

    if (!rows || !cmdline) return

    const fullname = cmdline.split(/\0|\s+/)[0]
    const splits = fullname.split('/')
    const name = splits[splits.length - 1]

    const usageObj = {}
    usageObj['process'] = fullname
    usageObj['name'] = name

    for (let r of rows.split('\n')) {
      if (r.includes('kB')) {
        const splits = r.split(/\s+/)
        const [key, num] = [splits[0], Number(splits[1])]
        if (key == 'Rss:') usageObj['Rss'] = usageObj['Rss'] + num || num
        if (key == 'Pss:') usageObj['Pss'] = usageObj['Pss'] + num || num
        if (key == 'Swap:') usageObj['Swap'] = usageObj['Swap'] + num || num
        if (key == 'SwapPss:') usageObj['SwapPss'] = usageObj['SwapPss'] + num || num
        if (key.includes('Shared')) usageObj['Shared'] = usageObj['Shared'] + num || num
        if (key.includes('Private')) usageObj['Private'] = usageObj['Private'] + num || num
      }
    }

    this.summarize(usageObj)
  }
  

  async updateInfo() {
    const pids = await fsa.readdir('/proc/')
    for (let p of pids) await this.getProcStat(p)
    this.prevUsageObj = { ...this.memUsageObj }
    this.memUsageObj = {}
  }


  getInfo() {
    this.updateInfo()  // update in bg
    return this.prevUsageObj
  }


}
