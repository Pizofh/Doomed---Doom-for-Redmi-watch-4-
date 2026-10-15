-- Repeat only after confirmed native cleanup. No persistent one-shot marker.
local M={}
function M.new(config,files,system,view,native_factory,memory,crc)
    assert(config.allow_native==true and config.run_ticks==300)
    assert(config.min_free==6467285 and config.min_largest==4194320)
    local phase='READY'
    local function status(s)phase=s;view.status(s)end
    local native=native_factory.new(config,files,system,{status=status,detach=view.detach,frame=view.frame})
    local checks={{path=config.base..'doom.elf',bytes=config.elf_bytes,crc=config.elf_crc},
                  {path=config.base..'doom1.wad',bytes=config.wad_bytes,crc=config.wad_crc}}
    local checking,running,closing=false,false,false
    local current,index,total,value,ticks=nil,1,0,0xffffffff,0
    local function close_file()
        if current then local f=current;current=nil;assert(f:close(),'asset close failed')end
    end
    local function ram()
        local pools=assert(memory.collect(files),'memory snapshot unavailable');local umem
        for _,p in ipairs(pools)do if p.name=='UMEM'then assert(not umem);umem=p end end
        assert(umem and umem.free>=config.min_free and umem.max>=config.min_largest,'insufficient UMEM')
    end
    local b={}
    function b.recover()native.recover()end
    function b.start()
        if closing or checking or running or (phase~='READY' and phase~='CLOSED')then return end
        assert(not current);index=1;total=0;value=0xffffffff;ticks=0
        checking=true;status('CHECKING')
    end
    function b.tick()
        if closing then return end
        if checking then
            local item=checks[index]
            if not current then current=assert(files.open(item.path,'rb'));total=0;value=0xffffffff end
            local bytes,why=current:read(8192);assert(why==nil,'asset read failed')
            if bytes and #bytes>0 then
                assert(#bytes<=8192);total=total+#bytes;assert(total<=item.bytes,'asset oversized')
                value=crc.update(value,bytes)
            else
                close_file();assert(total==item.bytes and crc.finish(value)==item.crc,'asset checksum mismatch')
                index=index+1
                if index>#checks then checking=false;ram();native.start();running=true;ticks=0 end
            end
            return
        end
        if running then ticks=ticks+1;if ticks==config.run_ticks then native.stop()end end
        native.tick()
        if phase=='CLOSED' or phase=='ERROR'then running=false end
    end
    function b.stop()
        if checking then checking=false;close_file();status('CLOSED');return end
        native.stop()
    end
    function b.input(v)native.input(v)end
    function b.release(v)native.release(v)end
    function b.pause()native.pause()end
    function b.phase()return phase end
    function b.failed()checking=false;running=false;pcall(close_file);native.failed()end
    function b.close()closing=true;checking=false;running=false;pcall(close_file);native.close()end
    return b
end
return M
