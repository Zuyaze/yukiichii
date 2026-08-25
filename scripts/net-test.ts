import net from 'net'

const host = 'ep-fragrant-mouse-b3fyo6ry-pooler.c-4.ap-southeast-1.aws.neon.tech'
const socket = new net.Socket()
socket.setTimeout(15000)

socket.on('connect', () => {
  console.log('TCP CONNECTED to port 5432 - network OK')
  socket.destroy()
  process.exit(0)
})

socket.on('timeout', () => {
  console.log('TIMEOUT - cannot reach Neon (blocked/firewall?)')
  socket.destroy()
  process.exit(1)
})

socket.on('error', e => {
  console.log('ERROR:', e.message)
  process.exit(1)
})

socket.connect(5432, host)