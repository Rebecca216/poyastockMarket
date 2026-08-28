# -*- coding: utf-8 -*-
"""
台股即時行情本地高效代理與 Web 伺服器
Local High-Performance Stock Quote API Server & Web Host
"""

import os
import sys
import json
import urllib.request
import urllib.parse
from http.server import HTTPServer, SimpleHTTPRequestHandler

PORT = 8765
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class StockServerHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == '/api/quote':
            query = urllib.parse.parse_qs(parsed.query)
            symbol = query.get('symbol', ['5904.TWO'])[0].strip().upper()

            # Ensure .TW or .TWO
            if not symbol.endswith('.TW') and not symbol.endswith('.TWO'):
                # Try probe
                symbol = f"{symbol}.TW"

            data = self.fetch_yahoo_tw_quote(symbol)
            if not data and symbol.endswith('.TW'):
                data = self.fetch_yahoo_tw_quote(symbol.replace('.TW', '.TWO'))

            self.send_response(200 if data else 502)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()

            if data:
                self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))
            else:
                self.wfile.write(json.dumps({"error": "Quote not found", "symbol": symbol}).encode('utf-8'))
            return

        super().do_GET()

    def fetch_yahoo_tw_quote(self, symbol):
        url = f"https://tw.stock.yahoo.com/_td-stock/api/resource/StockServices.stockList;symbols=%5B%22{symbol}%22%5D"
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        })
        try:
            with urllib.request.urlopen(req, timeout=4) as resp:
                raw_json = json.loads(resp.read().decode('utf-8'))
                if raw_json and len(raw_json) > 0:
                    item = raw_json[0]
                    price_val = float(item.get('price', {}).get('raw', 0) or 0)
                    if price_val > 0:
                        return item
        except Exception as e:
            pass

        # Fallback to Yahoo Finance v8
        try:
            yf_url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?interval=1m&range=1d"
            req2 = urllib.request.Request(yf_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req2, timeout=4) as resp2:
                yf_json = json.loads(resp2.read().decode('utf-8'))
                meta = yf_json.get('chart', {}).get('result', [{}])[0].get('meta', {})
                price = float(meta.get('regularMarketPrice', 0) or 0)
                if price > 0:
                    prev = float(meta.get('chartPreviousClose', price) or price)
                    return {
                        "systexId": symbol.split('.')[0],
                        "symbol": symbol,
                        "symbolName": symbol.split('.')[0],
                        "price": {"raw": str(price), "fmt": f"{price:,.2f}", "sort": price},
                        "regularMarketPreviousClose": {"raw": str(prev), "fmt": f"{prev:,.2f}", "sort": prev},
                        "change": {"raw": str(price - prev), "fmt": f"{price - prev:,.2f}", "sort": price - prev},
                        "changePercent": f"{((price - prev) / prev * 100):.2f}%",
                        "bid": {"raw": str(price - 0.1), "sort": price - 0.1},
                        "ask": {"raw": str(price + 0.1), "sort": price + 0.1},
                        "regularMarketDayHigh": {"raw": str(meta.get('regularMarketDayHigh', price))},
                        "regularMarketDayLow": {"raw": str(meta.get('regularMarketDayLow', price))},
                        "regularMarketOpen": {"raw": str(meta.get('regularMarketOpen', price))},
                        "volumeK": int(meta.get('regularMarketVolume', 0) / 1000)
                    }
        except Exception:
            pass

        return None

def run_server():
    server = HTTPServer(('127.0.0.1', PORT), StockServerHandler)
    print(f"[即時行情伺服器] 已啟動於 http://127.0.0.1:{PORT}/")
    print(f"[API 介面] http://127.0.0.1:{PORT}/api/quote?symbol=2330.TW")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n伺服器已停止。")

if __name__ == '__main__':
    run_server()
