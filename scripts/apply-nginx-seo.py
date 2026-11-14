"""Apply only the static-export routing rules to the active salarytimer vhost.
Preserves TLS, logging and other server settings. Validates and rolls back on error.
Run as root on the deployment host after uploading the static export.
"""
import datetime
from pathlib import Path
import re
import subprocess

BEGIN = "    # BEGIN salarytimer SEO routing"
END = "    # END salarytimer SEO routing"


def block_end(text, opening):
    depth = 0
    tokens = re.compile(r'''\#[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|[{}]''')
    for token in tokens.finditer(text, opening):
        if token.group() == "{":
            depth += 1
        elif token.group() == "}":
            depth -= 1
            if depth == 0:
                return token.end()
    raise ValueError("Unclosed nginx block")


def patch_server(body):
    body = re.sub(re.escape(BEGIN) + r"[\s\S]*?" + re.escape(END), "", body)
    removals = []
    for loc in re.finditer(r"(?m)^\s*location\s+([^\n{]+)\{", body):
        header = " ".join(loc[1].split())
        if header in ("/", "= /404.html", r"~ ^/(.+)/$"):
            removals.append((loc.start(), block_end(body, loc.end() - 1)))
    for start, end in reversed(removals):
        body = body[:start] + body[end:]
    body = re.sub(r"(?m)^\s*error_page\s+404\s+[^;]+;", "", body)
    return body.rstrip() + "\n" + BEGIN + """
    if ($host = www.salarytimer.work) { return 301 https://salarytimer.work$request_uri; }
    error_page 404 /404.html;
    location = /404.html { internal; }
    location / { try_files $uri $uri/ $uri.html =404; }
""" + END + "\n"


def patch_config(text):
    changes = []
    for server in re.finditer(r"(?m)^\s*server\s*\{", text):
        end = block_end(text, server.end() - 1)
        body = text[server.end():end - 1]
        if (re.search(r"server_name\s+[^;]*\bsalarytimer\.work\b[^;]*;", body)
                and re.search(r"root\s+/var/www/salarytimer/?\s*;", body)):
            changes.append((server.end(), end - 1, patch_server(body)))
    for start, end, body in reversed(changes):
        text = text[:start] + body + text[end:]
    return text, len(changes)


def main():
    dump = subprocess.run(["nginx", "-T"], check=True, capture_output=True, text=True).stdout
    files = list(dict.fromkeys(re.findall(r"^# configuration file ([^\n]+):$", dump, re.M)))
    candidates = []
    for filename in files:
        path = Path(filename).resolve()
        original = path.read_text()
        updated, count = patch_config(original)
        if count:
            candidates.append((path, original, updated))
    if len(candidates) != 1:
        raise RuntimeError("Expected exactly one active salarytimer configuration file; refusing to guess")
    path, original, updated = candidates[0]
    stamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S%f")
    backup = Path("/var/backups/salarytimer-nginx")
    backup.mkdir(parents=True, exist_ok=True)
    (backup / (path.name + "." + stamp)).write_text(original)
    try:
        path.write_text(updated)
        subprocess.run(["nginx", "-t"], check=True)
        subprocess.run(["systemctl", "reload", "nginx"], check=True)
    except BaseException:
        path.write_text(original)
        subprocess.run(["nginx", "-t"], check=True)
        subprocess.run(["systemctl", "reload", "nginx"], check=True)
        raise
    print("Applied static-export routing; configuration backup retained in", backup)


if __name__ == "__main__":
    main()
