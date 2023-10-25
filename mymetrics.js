const os = require('os')
const client = require('prom-client')

const NetIO = require('./utils/netio')
const netio = new NetIO()

const MemUsage = require('./utils/memusage')
const memUsage = new MemUsage()

const MemInfo = require('./utils/meminfo')
const memInfo = new MemInfo()

const DiskStat = require('./utils/diskstat')
const diskStat = new DiskStat()

const DiskFree = require('./utils/diskfree')
const diskFree = new DiskFree()


function systemMetrics(registry) {
  // const gauge_in = new client.Gauge({
  //   name: 'network_receive_bytes',
  //   help: 'network receive bytes by second per interface',
  //   registers: [registry],
  //   labelNames: ['iface'],
  // })

  // const gauge_out = new client.Gauge({
  //   name: 'network_transmit_bytes',
  //   help: 'network transmit bytes by second per interface',
  //   registers: [registry],
  //   labelNames: ['iface'],
  // })

  const gauge_net_io_total = new client.Gauge({
    name: 'network_io_total',
    help: 'network receive/transmit bytes/errors/drops per interface',
    registers: [registry],
    labelNames: ['iface', 'type'],
  })

  const memory = new client.Gauge({
    name: 'memory_summary',
    help: 'memory summary, total and free of RAM and swap',
    registers: [registry],
    labelNames: ['type'],
  })

  const gauge_dr_time = new client.Gauge({
    name: 'node_disk_read_time',
    help: 'The total number of seconds spent by all reads',
    registers: [registry],
    labelNames: ['dev'],
  })

  const gauge_dr_bytes = new client.Gauge({
    name: 'node_disk_read_bytes',
    help: 'The total number of bytes read successfully',
    registers: [registry],
    labelNames: ['dev'],
  })

  const gauge_dw_time = new client.Gauge({
    name: 'node_disk_write_time',
    help: 'The total number of seconds spent by all writes',
    registers: [registry],
    labelNames: ['dev'],
  })

  const gauge_dw_bytes = new client.Gauge({
    name: 'node_disk_written_bytes',
    help: 'The total number of bytes written successfully.',
    registers: [registry],
    labelNames: ['dev'],
  })


  const node_cpu_ticks = new client.Gauge({
    name: 'node_cpu_ticks',
    help: 'CPU time usage',
    registers: [registry],
    labelNames: ['cpu', 'type'],
  })


  const node_filesystem_free = new client.Gauge({
    name: 'node_filesystem_free',
    help: 'node_filesystem_free',
    registers: [registry],
    labelNames: ['device', 'fstype', 'mountpoint', 'type'],
  })


  const memory_usage = new client.Gauge({
    name: 'memory_usage',
    help: 'memory_usage',
    registers: [registry],
    labelNames: ['fullname', 'name', 'type'],
  })


  const getStats = async () => {

    // console.time('all')

    // Object.entries(netio.getIncrementalInfo()).forEach(([k, m]) => {
    //   gauge_in.set({ iface: k }, m.inputBytes)
    //   gauge_out.set({ iface: k }, m.outputBytes)
    // })

    Object.entries(netio.getTotalInfo()).forEach(([iface, ioData]) => {
      for (const type in ioData)
        gauge_net_io_total.set({ iface, type }, Number(ioData[type]))
    })

    Object.entries(memInfo.getInfo()).
      forEach(([key, val]) => memory.set({ type: key }, val))


    Object.entries(memUsage.getInfo()).forEach(([fullname, mem]) => {
      for (const type of ['Rss', 'Pss', 'Private', 'SwapPss'])
        memory_usage.set({ name: mem.name, fullname, type }, mem[type])
    })


    Object.entries(diskStat.getInfo()).
      forEach(([dev, val]) => {
        gauge_dr_bytes.set({ dev }, val.dr_bytes)
        gauge_dw_bytes.set({ dev }, val.dw_bytes)
        gauge_dr_time.set({ dev }, val.dr_time)
        gauge_dw_time.set({ dev }, val.dw_time)
      })


    Object.values(diskFree.getInfo()).forEach(fs => {
      const params = { device: fs.Filesystem, fstype: fs.Type, mountpoint: fs.Mounted }
      node_filesystem_free.set({ ...params, type: 'total' }, Number(fs.Total))
      node_filesystem_free.set({ ...params, type: 'free' }, Number(fs.Avail))
      node_filesystem_free.set({ ...params, type: 'percentage' }, fs.Avail / fs.Total)
    })


    for (var [i, cpu] of os.cpus().entries())
      for (var type in cpu.times) {
        const cpu_index = i.toString().padStart(2, '0')
        node_cpu_ticks.set({ cpu: cpu_index, type }, cpu.times[type])
      }

    // console.timeEnd('all')

  }

  setInterval(() => { getStats(); }, 1000)

}


module.exports = (registry) => {
  systemMetrics(registry)
}
