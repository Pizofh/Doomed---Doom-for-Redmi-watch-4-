-- One frozen raw frame to a private PNG. No .bin image decoder or per-frame writes.
-- Four rows per UI tick; keep the raw driver's frame lease until its EOF/close.
local M={}
function M.new(files,crc,path)
    local input,output,row,expected,fnv,adler_a,adler_b,written
    local active,done=false,false
    local function close(which)
        local f
        if which=='input' then f=input;input=nil else f=output;output=nil end
        if f then assert(f:close(),'PNG close')end
    end
    local function write(b)
        written=written+#b;assert(written<=196000,'PNG size')
        assert(output:write(b),'PNG write')
    end
    local function chunk(kind,data)
        local sum=crc.finish(crc.update(crc.update(0xffffffff,kind),data))
        write(string.pack('>I4',#data)..kind..data..string.pack('>I4',sum))
    end
    local function read(n)
        local b,why=input:read(n)
        assert(why==nil and type(b)=='string' and #b==n,'raw frame length')
        return b
    end
    local b={}
    function b.cancel()
        active=false
        local a=pcall(close,'input');local c=pcall(close,'output')
        assert(a and c,'PNG cancel close')
    end
    function b.start()
        assert(not active and not done and not input and not output,'PNG already used')
        local old,_,errno=files.open(path,'rb')
        if old then assert(old:close());error('PNG path occupied')end
        assert(errno==2,'PNG path unknown')
        input=assert(files.open('/dev/rw4doomframe','rb'),'raw frame unavailable')
        assert(input:setvbuf('no'))
        local h={string.unpack('<I4I4I4I4I4I4I4I4',read(32))}
        assert(h[1]==0x32464452 and h[2]==1 and h[3]==320 and h[4]==200 and h[5]==2 and h[6]>0,'raw frame header')
        expected=h[8];fnv=0x811c9dc5;adler_a=1;adler_b=0;row=0;written=0
        output=assert(files.open(path,'wb'),'PNG output unavailable')
        write('\137PNG\13\10\26\10')
        chunk('IHDR',string.pack('>I4I4BBBBB',320,200,8,2,0,0,0))
        active=true
    end
    function b.tick()
        if not active then return end
        for _=1,4 do
            local raw=read(640);local pixels={'\0'}
            for x=1,640,2 do
                local lo,hi=raw:byte(x,x+1)
                fnv=((fnv~lo)*16777619)&0xffffffff
                fnv=((fnv~hi)*16777619)&0xffffffff
                local v=lo|(hi<<8);local r=(v>>11)&31;local g=(v>>5)&63;local blue=v&31
                pixels[#pixels+1]=string.char((r<<3)|(r>>2),(g<<2)|(g>>4),(blue<<3)|(blue>>2))
            end
            local scan=table.concat(pixels)
            for i=1,#scan do adler_a=(adler_a+scan:byte(i))%65521;adler_b=(adler_b+adler_a)%65521 end
            -- Independent byte-aligned, uncompressed DEFLATE blocks in one zlib stream.
            local data=(row==0 and '\120\1' or '')..string.pack('<BI2I2',row==199 and 1 or 0,#scan,0xffff-#scan)..scan
            if row==199 then data=data..string.pack('>I4',(adler_b<<16)|adler_a)end
            chunk('IDAT',data);row=row+1
        end
        if row==200 then
            local tail,why=input:read(1);assert(tail==nil and why==nil,'raw frame trailing bytes')
            assert(fnv==expected,'raw frame checksum')
            close('input');chunk('IEND','');assert(output:flush());close('output')
            active=false;done=true;return path
        end
    end
    function b.close()b.cancel()end
    return b
end
return M
