const { SerialPort } = require('serialport');
let port = undefined, d;
const slotStatus = {
   running: false,
   direction: 'close'
}

function sendCmd(cmd) {
   if (port && d) {
      if (slotStatus.running) {
         console.error("Still running!")
      } else {
         port?.write(Buffer.from(cmd + String.fromCharCode(26)))
      }
   }
   else
      console.error("Arduino not detected")
}
const events = {
   opened() { },
   closed() { }
}

module.exports = {
   slotStatus,
   openSlot() {
      sendCmd("open")
      return new Promise(res => {
         const c = () => res(slotStatus)
         events.opened = c
         if (slotStatus.direction == 'open' && !slotStatus.running)
            c()
      })
   },
   closeSlot() {
      sendCmd("close")
      return new Promise(res => {
         const c = () => res(slotStatus)
         events.closed = c
         if (slotStatus.direction == 'close' && !slotStatus.running)
            c()
      })
   },
   async arduino() {
      d = (await SerialPort.list()).filter(v => v.productId == '7523')?.[0]
      if (d) {
         const pd = {
            path: d.path,
            baudRate: 9600,
            autoOpen: false
         }
         port = new SerialPort(pd)

         port.on('data', function (dx) {
            const raw = Buffer.copyBytesFrom(dx).toString().split(String.fromCharCode(26)).filter(v => v)
            for (const r of raw) {
               const cmd = r.trim().split(':')
               if (slotStatus.running = (cmd[0] == "running")) {
                  slotStatus.direction = cmd[1]
               }
               if (cmd[0] == "opened") {
                  slotStatus.direction = 'open'
                  events.opened()
               }
               if (cmd[0] == "closed") {
                  slotStatus.direction = 'close'
                  events.closed()
               }
            }
         })
         port.open()
      }
   }
}