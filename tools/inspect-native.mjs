// Static inspection only. Never imports, loads, or executes the inspected file.
import fs from 'node:fs';
import crypto from 'node:crypto';

const input = process.argv[2];
if (!input) throw new Error('Usage: node tools/inspect-native.mjs <ELF-or-PE>');
const data = fs.readFileSync(input);
const report = { bytes: data.length, sha256: crypto.createHash('sha256').update(data).digest('hex'), executed: false };
function range(offset, size) {
  if (!Number.isSafeInteger(offset) || !Number.isSafeInteger(size) || offset < 0 || size < 0 || offset + size > data.length) {
    throw new Error('Malformed file range');
  }
  return data.subarray(offset, offset + size);
}
function cstring(buffer, offset) {
  if (offset < 0 || offset >= buffer.length) throw new Error('Invalid string offset');
  const end = buffer.indexOf(0, offset);
  if (end < 0) throw new Error('Unterminated string');
  return buffer.toString('utf8', offset, end);
}
if (data.subarray(0, 4).equals(Buffer.from([0x7f, 0x45, 0x4c, 0x46]))) {
  report.format = 'ELF';
  report.class = data[4];
  report.endian = data[5];
  if (report.class !== 1 || report.endian !== 1) throw new Error('This inspector handles ELF32 little-endian only');
  report.type = data.readUInt16LE(16);
  report.machine = data.readUInt16LE(18);
  report.entry = '0x' + data.readUInt32LE(24).toString(16);
  report.flags = '0x' + data.readUInt32LE(36).toString(16);
  const sectionOffset = data.readUInt32LE(32);
  const sectionSize = data.readUInt16LE(46);
  const sectionCount = data.readUInt16LE(48);
  const stringIndex = data.readUInt16LE(50);
  if (sectionSize < 40 || sectionCount === 0 || stringIndex >= sectionCount) throw new Error('Unsupported section layout');
  range(sectionOffset, sectionSize * sectionCount);
  const sections = Array.from({ length: sectionCount }, (_, i) => {
    const offset = sectionOffset + i * sectionSize;
    return { nameOffset: data.readUInt32LE(offset), type: data.readUInt32LE(offset + 4),
      offset: data.readUInt32LE(offset + 16), size: data.readUInt32LE(offset + 20),
      link: data.readUInt32LE(offset + 24), entrySize: data.readUInt32LE(offset + 36) };
  });
  const names = range(sections[stringIndex].offset, sections[stringIndex].size);
  sections.forEach(s => { s.name = cstring(names, s.nameOffset); });
  report.sections = sections.map(s => ({ name: s.name, bytes: s.size }));
  const wanted = /^(insmod|rmmod|lsmod|dlopen|dlclose|exec|execl|execv|posix_spawn|system|luaopen_os|luaopen_io|os_execute|iwasm_main|lua_main|lvgl_main|nsh_main|cmd_insmod|cmd_rmmod|cmd_lsmod|g_userspace|g_symtab|g_nsymbols|g_kernel_symtab|g_kernel_nsymbols|up_userspace)$/;
  report.selectedSymbols = [];
  for (const section of sections.filter(s => s.type === 2 || s.type === 11)) {
    if (section.entrySize < 16 || section.link >= sections.length) throw new Error('Invalid symbol table');
    const symbols = range(section.offset, section.size);
    const strings = range(sections[section.link].offset, sections[section.link].size);
    for (let offset = 0; offset + section.entrySize <= symbols.length; offset += section.entrySize) {
      const name = cstring(strings, symbols.readUInt32LE(offset));
      if (wanted.test(name)) report.selectedSymbols.push({ name, value: '0x' + symbols.readUInt32LE(offset + 4).toString(16),
        size: symbols.readUInt32LE(offset + 8), sectionIndex: symbols.readUInt16LE(offset + 14), info: symbols[offset + 12] });
    }
  }
  // Debug macro literals are compiler evidence, not a claim that the API is exposed to apps.
  report.selectedConfigLiterals = [];
  for (const section of sections.filter(s => ['.debug_str', '.debug_macro', '.rodata'].includes(s.name))) {
    const text = range(section.offset, section.size).toString('latin1');
    const matches = text.match(/CONFIG_(?:BUILD_(?:FLAT|PROTECTED|KERNEL)|MODULE|LIBC_(?:DLFCN|EXECFUNCS)|ELF|INTERPRETERS_(?:LUA|WAMR)|ARCH_(?:CORTEXA7|CORTEXM[0-9]+|CHIP_[A-Z0-9_]+))[^\x00\r\n]{0,100}/g) ?? [];
    report.selectedConfigLiterals.push(...matches);
  }
  report.selectedConfigLiterals = [...new Set(report.selectedConfigLiterals)].sort();
} else if (data.subarray(0, 2).toString('ascii') === 'MZ') {
  report.format = 'PE';
  const pe = data.readUInt32LE(0x3c);
  if (range(pe, 4).readUInt32LE() !== 0x00004550) throw new Error('Invalid PE signature');
  report.machine = '0x' + data.readUInt16LE(pe + 4).toString(16);
  const count = data.readUInt16LE(pe + 6);
  const optionalSize = data.readUInt16LE(pe + 20);
  const optional = pe + 24;
  const is64 = data.readUInt16LE(optional) === 0x20b;
  const importsRva = data.readUInt32LE(optional + (is64 ? 112 : 96) + 8);
  const sectionStart = optional + optionalSize;
  const sections = Array.from({ length: count }, (_, i) => {
    const start = sectionStart + i * 40;
    range(start, 40);
    return { address: data.readUInt32LE(start + 12), virtualSize: data.readUInt32LE(start + 8),
      size: data.readUInt32LE(start + 16), offset: data.readUInt32LE(start + 20) };
  });
  function fromRva(rva) {
    const s = sections.find(s => rva >= s.address && rva < s.address + Math.max(s.size, s.virtualSize));
    if (!s) throw new Error('Unmapped RVA');
    const offset = s.offset + rva - s.address;
    range(offset, 1);
    return offset;
  }
  report.importedDlls = [];
  if (importsRva) {
    let offset = fromRva(importsRva);
    for (let i = 0; i < 512; i++, offset += 20) {
      const entry = range(offset, 20);
      if (entry.every(b => b === 0)) break;
      report.importedDlls.push(cstring(data, fromRva(entry.readUInt32LE(12))));
    }
  }
  const strings = data.toString('latin1').match(/[\x20-\x7e]{6,}/g) ?? [];
  report.selectedPathAndVersionLiterals = [...new Set(strings.filter(s =>
    /ANDROID_(?:AVD|USER|EMULATOR|SDK)_HOME|\.vela|Vela Emulator|Android Emulator version|32\.1\.15|Xiaomi/i.test(s)
  ))].slice(0, 60);
} else {
  throw new Error('Unrecognized native format');
}
process.stdout.write(JSON.stringify(report, null, 2) + '\n');
