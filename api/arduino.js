const { SerialPort } = require('serialport');
let port = undefined, d;
const slotStatus = {
   running: false,
   direction: 'close'
}

function sendCmd(p1 = '', p2 = '') {
   if (port && d) {
      if (!slotStatus.running) {
         slotStatus.running = true
         let c = "cmd";
         if (p1)
            c += '\x1A' + p1
         if (p2)
            c += '\x1A' + p2
         port?.write(Buffer.from(c + '\n'))
      }
   }
}
const events = {
   opened() { },
   closed() { },
}

module.exports = {
   slotStatus,
   openSlot() {
      if (!slotStatus.running && slotStatus.direction == "close")
         sendCmd("open")
      return new Promise(res => {
         const c = events.opened = () => res((port && d) ? slotStatus : { error: 'Arduino not found' })

         if (slotStatus.direction == 'open' || !port || !d)
            c()
      })
   },
   closeSlot() {
      if (!slotStatus.running && slotStatus.direction == "open")
         sendCmd("close")
      return new Promise(res => {
         const c = events.closed = () => res((port && d) ? slotStatus : { error: 'Arduino not found' })
         if (slotStatus.direction == 'close' || !port || !d)
            c()
      })
   },
   async arduino() {
      d = (await SerialPort.list()).filter(v => v.productId == '7523')?.[0]
      if (d) {
         const pd = {
            path: d.path,
            baudRate: 9600,
            autoOpen: false,
         }
         port = new SerialPort(pd)
         
         let msg = ""
         port.on('data', function (dx) {
            msg += Buffer.copyBytesFrom(dx).toString();
            if (msg.includes('\n')) {
               const parts = msg.trim().split('\x1A').filter(v => v)
               if (parts[0] == 'arduino') {
                  if (slotStatus.running = (parts[1] == "running")) {
                     slotStatus.direction = parts[2]
                  }
                  if (parts[1] == 'status') {
                     if (parts[2] == "opened") {
                        slotStatus.direction = 'open'
                        events.opened()
                     }
                     if (parts[2] == "closed") {
                        slotStatus.direction = 'close'
                        events.closed()
                     }
                  }
               }
               msg = "";
            }
         })
         port.open()
      } else if (!port) {
         console.log('Arduino not found')
      }
   }
}