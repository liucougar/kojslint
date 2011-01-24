
"""The KoLintResults PyXPCOM component manages a set of lint results for
a file.
"""

from koLintResults import koLintResults

if not koLintResults.__dict__.get('_reg_contractid_'):
    class koLintResultsXPCOM(koLintResults):
        _reg_desc_ = "Komodo Lint Results"
        _reg_clsid_ = "{03a6c3ad-26a4-4bf3-8e71-ac4e41b0efe6}"
        _reg_contractid_ = "@activestate.com/koLintResults;1"

