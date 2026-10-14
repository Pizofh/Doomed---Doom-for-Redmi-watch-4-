-- Inside the fixed adapter closure. Never overwrite a pre-existing ELF.
function b.check_file()
    local bytes,state=read(elf,2621)
    if state=="absent" then
        assert(options.armed==true and not dispatched and b.handles_closed())
        with_file(elf,"wb",function(f)assert(f:write(expected));assert(f:flush());return true end)
        bytes,state=read(elf,2621)
    end
    return state=="present" and bytes==expected
end
