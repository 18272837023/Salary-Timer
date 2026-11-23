"""Remove only the explicitly retired static pages, including legacy flat HTML."""
import argparse
from pathlib import Path
import shutil

RETIRED = ("learn", "salary-per-second", "paycheck-countdown", "shift-worker-salary-timer", "overtime-pay-calculator")


def prune(root):
    root = Path(root).resolve(strict=True)
    targets = [root / (name + suffix) for name in RETIRED for suffix in ("", ".html", ".txt")]
    # Validate the whole operation before deleting anything. Never follow links.
    for target in targets:
        if target.is_symlink() or target.resolve().parent != root:
            raise ValueError("Refusing unsafe retired-page path: " + str(target))
    for target in targets:
        if target.is_dir():
            shutil.rmtree(target)
        elif target.is_file():
            target.unlink()
    print("Retired page artifacts removed; homepages, policies and shared assets preserved")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", required=True)
    prune(parser.parse_args().root)
