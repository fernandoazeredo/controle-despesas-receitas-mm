type ZipInput = {
  name: string
  content: string | Uint8Array
}

function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff
  for (const byte of bytes) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0)
    }
  }
  return (crc ^ 0xffffffff) >>> 0
}

function dosDateTime(date: Date) {
  const year = Math.max(1980, date.getFullYear())
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2)
  const day = date.getDate()
  const month = date.getMonth() + 1
  const dosDate = ((year - 1980) << 9) | (month << 5) | day
  return { time, date: dosDate }
}

function header(size: number) {
  return new Uint8Array(size)
}

function view(bytes: Uint8Array) {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
}

function join(parts: Uint8Array[]) {
  const total = parts.reduce((sum, item) => sum + item.byteLength, 0)
  const output = new Uint8Array(total)
  let offset = 0
  for (const part of parts) {
    output.set(part, offset)
    offset += part.byteLength
  }
  return output
}

export function createZip(entries: ZipInput[]) {
  const encoder = new TextEncoder()
  const now = dosDateTime(new Date())
  const localParts: Uint8Array[] = []
  const centralParts: Uint8Array[] = []
  let localOffset = 0

  for (const entry of entries) {
    const fileName = encoder.encode(entry.name)
    const data = typeof entry.content === 'string' ? encoder.encode(entry.content) : entry.content
    const checksum = crc32(data)

    const local = header(30)
    const localView = view(local)
    localView.setUint32(0, 0x04034b50, true)
    localView.setUint16(4, 20, true)
    localView.setUint16(6, 0x0800, true)
    localView.setUint16(8, 0, true)
    localView.setUint16(10, now.time, true)
    localView.setUint16(12, now.date, true)
    localView.setUint32(14, checksum, true)
    localView.setUint32(18, data.byteLength, true)
    localView.setUint32(22, data.byteLength, true)
    localView.setUint16(26, fileName.byteLength, true)
    localView.setUint16(28, 0, true)

    localParts.push(local, fileName, data)

    const central = header(46)
    const centralView = view(central)
    centralView.setUint32(0, 0x02014b50, true)
    centralView.setUint16(4, 20, true)
    centralView.setUint16(6, 20, true)
    centralView.setUint16(8, 0x0800, true)
    centralView.setUint16(10, 0, true)
    centralView.setUint16(12, now.time, true)
    centralView.setUint16(14, now.date, true)
    centralView.setUint32(16, checksum, true)
    centralView.setUint32(20, data.byteLength, true)
    centralView.setUint32(24, data.byteLength, true)
    centralView.setUint16(28, fileName.byteLength, true)
    centralView.setUint16(30, 0, true)
    centralView.setUint16(32, 0, true)
    centralView.setUint16(34, 0, true)
    centralView.setUint16(36, 0, true)
    centralView.setUint32(38, 0, true)
    centralView.setUint32(42, localOffset, true)
    centralParts.push(central, fileName)

    localOffset += local.byteLength + fileName.byteLength + data.byteLength
  }

  const localData = join(localParts)
  const centralData = join(centralParts)
  const end = header(22)
  const endView = view(end)
  endView.setUint32(0, 0x06054b50, true)
  endView.setUint16(4, 0, true)
  endView.setUint16(6, 0, true)
  endView.setUint16(8, entries.length, true)
  endView.setUint16(10, entries.length, true)
  endView.setUint32(12, centralData.byteLength, true)
  endView.setUint32(16, localData.byteLength, true)
  endView.setUint16(20, 0, true)

  return join([localData, centralData, end])
}
