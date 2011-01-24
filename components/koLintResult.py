from koLintResult import KoLintResult #the latter name starts with a capital K (should report to upsteam)

if not KoLintResult.__dict__.get('_reg_contractid_'):
    class koLintResultXPCOM(KoLintResult):
        _reg_desc_ = "Komodo Lint Result"
        _reg_clsid_ = "{21648850-492F-11d4-AC24-0090273E6A60}"
        _reg_contractid_ = "@activestate.com/koLintResult;1"
