const exec = require('./shellExec')

module.exports = class DiskFree {
    constructor() {
        this.diskInfo = {}
        this.updateInfo()
    }

    async updateInfo() {
        const out = await exec('df --output=source,fstype,size,avail,target')
        let keys = ['Filesystem', 'Type', 'Total', 'Avail', 'Mounted']

        for (let row of out.trim().split('\n')) {
            const values = row.trim().split(/\s+/)
            const fsKey = values[0]
            if (fsKey == 'Filesystem') continue;  // skip 1st row
            this.diskInfo[fsKey] = {}
            values.forEach((par, i) => this.diskInfo[fsKey][keys[i]] = par)
        }
    }

    getInfo() {
        this.updateInfo()   // run in bg
        return this.diskInfo
    }

}