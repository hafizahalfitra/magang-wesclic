import urllib.request
import urllib.error

try:
    req = urllib.request.Request('http://127.0.0.1:8000/seed-from-csv?mode=reset', method='POST')
    res = urllib.request.urlopen(req)
    print(res.read().decode())
except urllib.error.HTTPError as e:
    print(e.read().decode())
