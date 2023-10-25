/* based on https://github.com/SunilWang/node-os-utils/blob/master/lib/mem.js */

var fs = require('fs').promises

module.exports = class MemInfo {

    constructor() {
        this.memInfo = {}
        this.updateInfo()
    }

    async updateInfo() {
        const out = await fs.readFile('/proc/meminfo', 'utf8')
        const usage = out.toString().trim().split('\n')

        const memInfo = {}
        usage.forEach((line) => {
            var pair = line.split(':')
            memInfo[pair[0]] = parseInt(pair[1], 10)
        })
        
        if (!memInfo.MemAvailable) {
            memInfo.MemAvailable = memInfo.MemFree + memInfo.Buffers
                + memInfo.Cached + memInfo.SReclaimable - memInfo.Shmem
        }

        var memTotal = memInfo.MemTotal * 1024
        var memFree = memInfo.MemFree * 1024
        var memAvailable = memInfo.MemAvailable * 1024
        var swapTotal = memInfo.SwapTotal * 1024
        var swapFree = memInfo.SwapFree * 1024

        this.memInfo = { memTotal, memFree, memAvailable, swapTotal, swapFree }
    }

    getInfo() {
        this.updateInfo()   // run in bg
        return this.memInfo
    }

}