from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import os
from urllib.parse import unquote, urlparse


ROOT = Path(__file__).resolve().parent / "dist"
PORT = 4373


class SpaHandler(SimpleHTTPRequestHandler):
    def translate_path(self, path: str) -> str:
        parsed = urlparse(path)
        cleaned = unquote(parsed.path.lstrip("/"))
        full = (ROOT / cleaned).resolve()
        if ROOT not in full.parents and full != ROOT:
            return str(ROOT / "index.html")
        return str(full)

    def do_GET(self):
        parsed = urlparse(self.path)
        candidate = (ROOT / unquote(parsed.path.lstrip("/"))).resolve()
        if ROOT not in candidate.parents and candidate != ROOT:
            self.path = "/index.html"
        elif parsed.path == "/" or not candidate.exists() or candidate.is_dir():
            self.path = "/index.html"
        return super().do_GET()

    def log_message(self, format, *args):
        return


if __name__ == "__main__":
    os.chdir(ROOT)
    server = ThreadingHTTPServer(("0.0.0.0", PORT), SpaHandler)
    print(f"Serving {ROOT} on http://0.0.0.0:{PORT}")
    server.serve_forever()
