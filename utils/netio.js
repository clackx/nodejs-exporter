/* based on https://github.com/SunilWang/node-os-utils/blob/master/lib/netstat.js */

const exec = require('./shellExec')

module.exports = class NetIO {
    constructor() {
        this.deltaObj = {}
        this.currObj = {}
        this.prevObj = {}
        this.updateInfo()
    }


    async updateInfo() {
        this.prevObj = { ...this.currObj }

        const stdout = await exec('ip -s link')

        const names = new RegExp(/[0-9]+: ([\S]+): /g)
        const RX = new RegExp(/\s+RX:\s+bytes\s+packets\s+errors\s+dropped\s+(overrun|missed)\s+mcast\s*\n\s*([0-9]+)\s+([0-9]+)\s+([0-9]+)\s+([0-9]+)\s+/)
        const TX = new RegExp(/\s+TX:\s+bytes\s+packets\s+errors\s+dropped\s+carrier\s+collsns\s*\n\s*([0-9]+)\s+([0-9]+)\s+([0-9]+)\s+([0-9]+)\s+/)

        let res = []
        while ((res = names.exec(stdout)) !== null) {

            const fromCurr = stdout.slice(res.index)
            const RXmatch = fromCurr.match(RX)
            const TXmatch = fromCurr.match(TX)
            if (res.length && RXmatch && TXmatch)
                this.currObj[res[1]] = {
                    inputBytes: RXmatch[2],
                    inputErrors: RXmatch[4],
                    inputDropped: RXmatch[5],
                    outputBytes: TXmatch[1],
                    outputErrors: TXmatch[3],
                    outputDropped: TXmatch[4]
                }
        }
    }

    // getIncrementalInfo() {
    //     if (!this.prevObj) return

    //     for (let iface of Object.keys(this.prevObj)) {
    //         if (!this.deltaObj[iface]) this.deltaObj[iface] = {}
    //         for (let key in this.prevObj[iface]) {
    //             this.deltaObj[iface][key] =
    //                 this.currObj[iface][key] -
    //                 this.prevObj[iface][key]
    //         }
    //     }

    //     // this.updateInfo()
    //     return this.deltaObj
    // }


    getTotalInfo() {
        this.updateInfo()    // run update in bg
        return this.currObj
    }

}

