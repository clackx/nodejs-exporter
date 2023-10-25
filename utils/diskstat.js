const exec = require('./shellExec')

module.exports = class DiskStat {
    constructor() {
        this.statInfo = {}
        this.updateInfo()
    }

    async updateInfo() {
        const iostat = await exec('iostat -d -x 1 1 -y -o JSON')
        let hoststat, disksstat
        if (iostat) hoststat = JSON.parse(iostat).sysstat.hosts
        if (hoststat) disksstat = hoststat[0].statistics[0].disk
        if (disksstat)
            for (let d of disksstat) {
                const dev = d.disk_device
                this.statInfo[dev] = {}
                this.statInfo[dev].dr_bytes = d['rkB/s']
                this.statInfo[dev].dw_bytes = d['wkB/s']
                this.statInfo[dev].dr_time = d.r_await
                this.statInfo[dev].dw_time = d.w_await
            }
    }

    getInfo() {
        this.updateInfo()   // run in bg
        return this.statInfo
    }
}