-- Exact factory/safe code; all module, shell, memory and file operations mocked.
local ef=assert(io.open('/tmp/rw4-boot-r381.elf','rb'));local ELF=assert(ef:read('a'));assert(ef:close())
local cut=assert(MAIN:find('\nend)()\nlocal raw=',1,true))+#'\nend)()'
local prefix=MAIN:sub(1,cut-1)..'\nreturn factory,config,boot'
local a=assert(MAIN:find('local function safe(fn)',1,true));local z=assert(MAIN:find('\nlocal function button(',a,true));local safe_code=MAIN:sub(a,z-1)..'\nreturn safe'
local cases=0
local function fixture(kind)
 local t={loads=0,unloads=0,commands={},native=false,collected=false,rows={},native_reads=0}
 local env=setmetatable({require=function(n)assert(n=='lvgl');return {}end,collectgarbage=function(mode)assert(mode=='collect' and not t.native);t.collected=true;return 0 end},{__index=_ENV})
 local factory,c,boot=assert(load(prefix,'boot-factory','t',env))();t.config=c;t.boot=boot
 local header=string.pack('<I4I4I4I4I4I4I4I4I4I4',0x31435752,1,c.wad_bytes,c.wad_crc,65536,c.packed_pages,c.packed_index_crc,c.packed_bytes,0,c.packed_header_crc)
 if kind=='header'then header='X'..header:sub(2)end
 if kind=='identity'then header=header:sub(1,4)..string.pack('<I4',2)..header:sub(9)end
 if kind=='layout'then header=header:sub(1,24)..string.pack('<I4',1)..header:sub(29)end
 local elf=ELF;if kind=='crc'then elf=ELF:sub(1,-2)..string.char(ELF:byte(-1)~1)end
 if kind=='short'then elf=elf:sub(1,-2)end
 local free,max=8000000,7000000
 if kind=='ram-low'then free=c.min_free-1 end
 if kind=='ram-fragmented'then max=c.min_largest-1 end
 t.data={[c.base..'doom.elf']=elf,[c.wad_path]=header,['/proc/meminfo']='total used free largest nused nfree\nUmem: 12000000 '..(12000000-free)..' '..free..' '..max..' 1 1\n'}
 if kind=='memory-format'then t.data['/proc/meminfo']='unknown' end
 local record=c.module..',0x12345,0x12401,0,0,0x12340,203000,0x40000,500000'
 local files={}
 function files.open(path,mode)
  if path=='/proc/meminfo'then assert(t.collected and not t.native)end
  if kind=='elf-missing'and path==c.base..'doom.elf'then return nil,'absent',2 end
  if kind=='wad-missing'and path==c.wad_path then return nil,'absent',2 end
  local content=t.data[path]
  if path=='/proc/modules'then content=kind=='foreign'and'othermodule,0x1'or t.native and record or ''end
  if path=='/dev/rw4doomready'then
   if not t.native then return nil,'absent',2 end
   t.native_reads=t.native_reads+1;local parts={};for i=1,72 do parts[i]=string.pack('<I4',t.state[i])end;content=table.concat(parts)
  end
  if mode=='wb'then content='';t.data[path]=''elseif content==nil then return nil,'absent',2 end
  local f={cursor=0}
  function f:setvbuf(v)assert(v=='no');return true end
  function f:seek(origin)assert(origin=='end');return path==c.wad_path and c.packed_bytes or #content end
  function f:read(n)local b=content:sub(self.cursor+1,self.cursor+n);self.cursor=self.cursor+#b;return #b>0 and b or nil end
  function f:write(b)
   if path=='/dev/rw4doomready'then
    local magic,seq,op,value=string.unpack('<I4I4I4I4',b);assert(magic==0x36445752 and seq==t.state[3]+1);t.state[3]=seq;t.commands[#t.commands+1]=op
    if op==1 then t.state[4]=1;t.state[5]=1;t.state[9]=42;t.state[10]=1;t.state[23]=1
    elseif op==4 then t.state[6]=1;t.state[47]=1
    elseif op==5 then t.state[7]=1;t.state[15]=1;t.state[18]=14;t.state[19]=14
    else assert(op==7 or op==10 or op==2 or op==3 or op==6)end
   else t.data[path]=t.data[path]..b end
   return self
  end
  function f:flush()return true end
  function f:close()return true end
  return f
 end
 local system={remove=function(path)t.data[path]=nil;return true end}
 function system.execute(cmd)
  local action,out=cmd:match('^(.-) > (.+)$');assert(out==c.base..'launcher-shell.txt');local text=''
  if action=='ls /dev'then text='/dev:\n null\n';if t.native or kind=='orphan'then text=text..' rw4doomready\n'end
  elseif action=='insmod '..c.base..'doom.elf '..c.module then
   t.loads=t.loads+1;if kind=='load-refused'then text='insmod: rejected\n'else t.native=true;t.state={};for i=1,72 do t.state[i]=0 end;t.state[1]=0x36445752;t.state[2]=kind=='bad-state'and 7 or 8 end
  elseif action=='rmmod '..c.module then t.unloads=t.unloads+1;t.native=false
  else error('unexpected shell')end
  t.data[out]=text;return false,'exit',1
 end
 local view={status=function(s)t.rows[#t.rows+1]=s end,slot=function()end,native=function()end,detach=function()end,frame=function()end}
 t.backend=factory.new(c,files,system,view)
 local se=setmetatable({boot=boot,backend=t.backend},{__index=_ENV});t.safe=assert(load(safe_code,'boot-safe','t',se))()
 function t.start()t.safe(t.backend.start);for _=1,90 do if t.backend.phase()=='ERROR'or boot.stage==60 then break end;t.safe(t.backend.tick)end end
 return t
end
for _,v in ipairs({{'crc',13,101},{'short',13,101},{'elf-missing',11,999},{'ram-low',21,201},{'ram-fragmented',21,201},{'memory-format',20,999},{'header',32,301},{'identity',32,302},{'layout',32,303},{'wad-missing',32,305},{'foreign',40,401},{'orphan',41,402},{'load-refused',50,501},{'bad-state',52,999}})do
 local t=fixture(v[1]);t.start();assert(t.backend.phase()=='ERROR',v[1]..' phase');assert(t.boot.stage==v[2],v[1]..' stage '..t.boot.stage);assert(t.boot.code==v[3],v[1]..' code '..t.boot.code)
 if v[2]<50 then assert(t.loads==0 and t.native_reads==0,'must refuse before native code')end
 if v[2]==21 then assert(t.boot.free>0 and t.boot.max>0)end
 assert(t.config.min_free==7366211 and t.config.min_largest==4194320);cases=cases+1
end
do
 local t=fixture('foreign');t.safe(t.backend.recover);assert(t.backend.phase()=='ERROR' and t.boot.stage==71 and t.loads==0 and t.unloads==0);cases=cases+1
end
do
 local t=fixture('ok');for _=1,2 do t.start();assert(t.boot.stage==60 and t.boot.code==0 and t.native);t.safe(t.backend.tick);assert(t.backend.phase()=='PLAYING');t.safe(t.backend.stop);t.safe(t.backend.tick);assert(t.backend.phase()=='CLOSED' and not t.native)end
 assert(t.loads==2 and t.unloads==2 and t.collected and t.boot.bytes==0);cases=cases+1 -- second start uses the existing context's verified CRC
end
print('BOOT_R381_OK',cases)
