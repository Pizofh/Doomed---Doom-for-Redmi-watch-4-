local env = {type = type}
local normalizer = assert(load(RW4_PATH_SOURCE, "owned-path", "t", env))()
local legacy = assert(load(RW4_LEGACY_ADAPTER, "legacy-adapter", "t", {
    assert = assert, type = type, pcall = pcall, string = string
}))()
local id, passed = "365219997", 0
local function test(fn) fn(); passed = passed + 1 end
test(function()
    local expected = "/data/app/watchface/market/365219997/lua/"
    assert(normalizer.normalize(RW4_OBSERVED_PATH, id) == expected)
    assert(normalizer.normalize(expected, id) == expected)
    assert(normalizer.normalize(expected:gsub("/lua/", "///lua//"), id) == expected)
end)
for _, bad in ipairs({"/tmp/365219997/../lua/", "/tmp/365219997/lua/;bad/",
    "/tmp/365219997/lua/$bad/", "/tmp/365219997/lua/'bad/",
    "/tmp/365219997/lua/ bad/", "//tmp/365219997/lua/", "tmp/365219997/lua/",
    "/tmp/365219996/lua/", "/tmp/365219997/lua", "/tmp/365219997/other/",
    "/tmp/365219997/lua/\0/", "/tmp/" .. string.rep("a", 180) .. "/365219997/lua/"}) do
    test(function() assert(normalizer.normalize(bad, id) == nil) end)
end
test(function() assert(normalizer.normalize(nil, id) == nil) end)
test(function() assert(normalizer.normalize(RW4_OBSERVED_PATH, "../bad") == nil) end)
test(function()
    -- Replace only the own UI test ID to exercise the old adapter's pinned ID.
    -- This models its separator form; it is not a read of the RW4 physical path.
    local shaped = RW4_OBSERVED_PATH:gsub("/365219997/", "/365219996/")
    local commands = 0
    local options = {path = shaped, elf_hex = string.rep("0", 1568), armed = false}
    local files = {open = function() error("no-file-access") end}
    local system = {execute = function() commands = commands + 1; error("no-execution") end,
                    remove = function() error("no-removal") end}
    assert(not pcall(legacy.new, options, files, system))
    options.path = assert(normalizer.normalize(shaped, "365219996"))
    local ok, backend = pcall(legacy.new, options, files, system)
    assert(ok and type(backend) == "table" and commands == 0)
end)
print("RW4_PATH_TESTS_OK " .. passed)
