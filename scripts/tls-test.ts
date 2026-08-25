import tls from 'tls'

const host = 'ep-fragrant-mouse-b3fyo6ry.c-4.ap-southeast-1.aws.neon.tech'
const socket = tls.connect({ host, port: 5432, servername: host, rejectUnauthorized: false })
socket.setTimeout(15000)

socket.on('secureConnect', () => {
  console.log('TLS HANDSHAKE OK:', socket.getProtocol())
  socket.destroy()
  process.exit(0)
})

socket.on('timeout', () => {
  console.log('TIMEOUT during TLS')
  socket.destroy()
  process.exit(1)
})

socket.on('error', e => {
  console.log('TLS ERROR:', e.message)
  process.exit(1)
})