"""저장소 루트에서 python 01_frontend/serve.py --port 8765로 실행합니다."""
from argparse import ArgumentParser
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

parser = ArgumentParser()
parser.add_argument("--port", type=int, default=8765)
args = parser.parse_args()
SimpleHTTPRequestHandler.extensions_map.update({".js": "text/javascript", ".json": "application/json"})
server = ThreadingHTTPServer(("127.0.0.1", args.port), partial(SimpleHTTPRequestHandler, directory=str(Path(__file__).resolve().parent)))
print(f"EnjoyTrip: http://127.0.0.1:{args.port}")
try:
    server.serve_forever()
except KeyboardInterrupt:
    server.server_close()
