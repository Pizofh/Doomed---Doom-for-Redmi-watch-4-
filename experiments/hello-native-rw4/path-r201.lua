-- Pure normalization for a caller-pinned own ID. No files, shell or execution.
local M = {}
function M.normalize(raw, id)
    if type(id) ~= "string" or not id:match("^%d%d%d%d%d%d%d%d%d$") then return nil end
    if type(raw) ~= "string" or #raw >= 180 or raw:sub(1, 2) == "//" or
       not raw:match("^/[A-Za-z0-9_/%-]+/$") then return nil end
    -- NuttX watchface runtime can repeat internal separators, e.g. ID//lua/.
    -- Validate raw ASCII/metacharacters first; normalization only removes '/'.
    local canonical = raw:gsub("/+", "/")
    if not canonical:match("/" .. id .. "/lua/$") then return nil end
    return canonical
end
return M
