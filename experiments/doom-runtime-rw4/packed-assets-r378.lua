-- Exact production assets() body, no native/module or filesystem access.
do
 local first=assert(MAIN:find('local function assets()',1,true))
 local last=assert(MAIN:find('\n    local b={}',first,true))
 local body=MAIN:sub(first,last-1)..'\nreturn assets'
 local config=assert(load('return '..assert(MAIN:match('local config=(%b{})'))))()
 local header=string.pack('<'..string.rep('I4',10),0x31435752,1,config.wad_bytes,config.wad_crc,65536,config.packed_pages,config.packed_index_crc,config.packed_bytes,0,config.packed_header_crc)
 local cases=0
 local function test(bytes,size,ok)
  local env=setmetatable({config=config,base=config.base,opened=function(p,mode,fn)
   assert(mode=='rb');local elf=p==config.base..'doom.elf';assert(elf or p==config.wad_path)
   return fn({read=function(_,n)return (elf and ELF_HEADER or bytes):sub(1,n)end,
    seek=function(_,origin)assert(origin=='end');return elf and config.elf_bytes or size end})
  end},{__index=_ENV})
  local assets=assert(load(body,'production-assets','t',env))();assert(pcall(assets)==ok);cases=cases+1
 end
 test(header,config.packed_bytes,true)
 for i=1,10 do local at=(i-1)*4+1;local corrupt=header:sub(1,at-1)..string.char(header:byte(at)~1)..header:sub(at+1);test(corrupt,config.packed_bytes,false)end
 test(header:sub(1,39),config.packed_bytes,false);test(header,config.packed_bytes-1,false)
 print('PACKED_ASSETS_R378_OK',cases)
end
