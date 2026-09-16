import os
import sys
import time
import urllib.request
import threading

cbm_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "cbm_wispbyte"))
if cbm_dir not in sys.path:
    sys.path.insert(0, cbm_dir)

import main as cbm_main
db = cbm_main.db

TEST_PORT = 10098

def main():
    cbm_main.PORT = TEST_PORT
    cbm_main.load_static_cache()
    server = cbm_main.CBMThreadPoolServer(("127.0.0.1", TEST_PORT), cbm_main.CBMHealthHandler, max_workers=64)
    server_thread = threading.Thread(target=server.serve_forever, daemon=True)
    server_thread.start()
    time.sleep(0.5)

    routes = [
        "/vault.html",
        "/cbm.html",
        "/api/cbm/status",
        "/api/cbm/analytics/vault-history?days=7",
        "/api/cbm/donors?limit=5",
        "/api/cbm/account?name=Alice",
        "/api/cbm/account?name=NonExistentUser123"
    ]

    print(f"{'ROUTE':<45} | {'1 REQ (ms)':<12} | {'10 CONCURRENT (ms)':<20}")
    print("-" * 80)

    for route in routes:
        url = f"http://127.0.0.1:{TEST_PORT}{route}"
        
        # Warmup
        try:
            urllib.request.urlopen(url, timeout=2.0).read()
        except Exception:
            pass

        # Single request latency
        durations = []
        for _ in range(20):
            t0 = time.perf_counter()
            try:
                urllib.request.urlopen(url, timeout=2.0).read()
            except Exception:
                pass
            durations.append((time.perf_counter() - t0) * 1000.0)
        durations.sort()
        median_1 = durations[len(durations)//2]

        # 10 Concurrent requests latency
        conc_durations = []
        def req():
            t0 = time.perf_counter()
            try:
                urllib.request.urlopen(url, timeout=2.0).read()
            except Exception:
                pass
            conc_durations.append((time.perf_counter() - t0) * 1000.0)

        threads = [threading.Thread(target=req) for _ in range(10)]
        for t in threads:
            t.start()
        for t in threads:
            t.join()
        avg_conc = sum(conc_durations) / len(conc_durations) if conc_durations else 0

        print(f"{route:<45} | {median_1:10.2f} ms | {avg_conc:18.2f} ms")

    server.shutdown()
    server.server_close()

if __name__ == "__main__":
    main()
