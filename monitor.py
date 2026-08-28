# -*- coding: utf-8 -*-
"""
台股上市櫃 (TWSE / TPEx) 股市即時行情與低價警示監控腳本
Python Multi-Stock Real-Time Quote Monitor & Low Price Alert
"""

import sys
import os
import time
import json
import urllib.request
import subprocess

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

try:
    import winsound
except ImportError:
    winsound = None

CONFIG_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'config.json')

DEFAULT_CONFIG = {
    "stock_code": "5904.TWO",
    "stock_name": "寶雅",
    "target_low_price": 74.0,
    "condition": "price_or_ask", # price_or_ask, price_le, ask_le, bid_le
    "check_interval_seconds": 1,
    "cooldown_seconds": 180,
    "enable_sound_beep": True,
    "enable_windows_toast": True
}

def load_config():
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
                return {**DEFAULT_CONFIG, **json.load(f)}
        except Exception as e:
            print(f"[警告] 讀取配置檔失敗: {e}，使用預設值")
    return DEFAULT_CONFIG

def save_config(cfg):
    try:
        with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
            json.dump(cfg, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"[錯誤] 儲存配置失敗: {e}")

def send_windows_toast(title, message):
    """發送 Windows 原生系統通知彈窗"""
    ps_cmd = f"""
    [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
    [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null
    $template = @"
    <toast duration="long">
        <visual>
            <binding template="ToastGeneric">
                <text>{title}</text>
                <text>{message}</text>
            </binding>
        </visual>
        <audio src="ms-winsoundevent:Notification.Reminder"/>
    </toast>
"@
    $xml = New-Object Windows.Data.Xml.Dom.XmlDocument
    $xml.LoadXml($template)
    $toast = [Windows.UI.Notifications.ToastNotification]::new($xml)
    [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier("台股即時監控").Show($toast)
    """
    try:
        subprocess.run(["powershell", "-NoProfile", "-Command", ps_cmd], capture_output=True, timeout=5)
    except Exception:
        try:
            import ctypes
            ctypes.windll.user32.MessageBoxW(0, message, title, 0x40 | 0x1000)
        except Exception:
            pass

def play_alert_sound():
    if winsound:
        try:
            for freq in [800, 1000, 1200]:
                winsound.Beep(freq, 150)
                time.sleep(0.05)
        except Exception:
            pass

KNOWN_SYMBOLS = {
    "5904": "5904.TWO", "3293": "3293.TWO", "8069": "8069.TWO", "6488": "6488.TWO", "5483": "5483.TWO",
    "5347": "5347.TWO", "3105": "3105.TWO", "8299": "8299.TWO", "6147": "6147.TWO", "3529": "3529.TWO",
    "5274": "5274.TWO", "6446": "6446.TWO", "6547": "6547.TWO", "4743": "4743.TWO", "8044": "8044.TWO",
    "2330": "2330.TW", "2317": "2317.TW", "2454": "2454.TW", "2382": "2382.TW", "2308": "2308.TW",
    "2303": "2303.TW", "3711": "3711.TW", "3231": "3231.TW", "2357": "2357.TW", "2376": "2376.TW",
    "2377": "2377.TW", "2356": "2356.TW", "2353": "2353.TW", "6669": "6669.TW", "3661": "3661.TW",
    "3008": "3008.TW", "2327": "2327.TW", "2379": "2379.TW", "3034": "3034.TW", "2408": "2408.TW",
    "2603": "2603.TW", "2609": "2609.TW", "2615": "2615.TW", "2618": "2618.TW", "2610": "2610.TW",
    "1519": "1519.TW", "1513": "1513.TW", "1503": "1503.TW", "1504": "1504.TW", "1514": "1514.TW",
    "2881": "2881.TW", "2882": "2882.TW", "2891": "2891.TW", "2886": "2886.TW", "2884": "2884.TW",
    "0050": "0050.TW", "0056": "0056.TW", "00878": "00878.TW", "00919": "00919.TW", "00929": "00929.TW", "00940": "00940.TW"
}

def resolve_symbol(input_code):
    """自動判斷上市 (.TW) 或上櫃 (.TWO)"""
    code = input_code.strip().upper()
    if code.endswith('.TW') or code.endswith('.TWO'):
        return code

    if code in KNOWN_SYMBOLS:
        return KNOWN_SYMBOLS[code]

    # Probe TWSE then TPEx
    for ext in ['.TW', '.TWO']:
        sym = f"{code}{ext}"
        url = f"https://tw.stock.yahoo.com/_td-stock/api/resource/StockServices.stockList;symbols=%5B%22{sym}%22%5D"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        try:
            with urllib.request.urlopen(req, timeout=2) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                if data and len(data) > 0 and data[0].get('price'):
                    return sym
        except Exception:
            pass
    return f"{code}.TW"

def fetch_quote(symbol="5904.TWO"):
    url = f"https://tw.stock.yahoo.com/_td-stock/api/resource/StockServices.stockList;symbols=%5B%22{symbol}%22%5D"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    try:
        with urllib.request.urlopen(req, timeout=6) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            if data and len(data) > 0:
                item = data[0]
                name = item.get('symbolName', '')
                is_twse = item.get('exchange') == 'TAI' or symbol.endswith('.TW')
                market_str = "上市" if is_twse else "上櫃"
                price = float(item.get('price', {}).get('raw', 0) or 0)
                change = float(item.get('change', {}).get('raw', 0) or 0)
                change_pct = item.get('changePercent', '0.00%')
                bid = float(item.get('bid', {}).get('raw', 0) or price)
                ask = float(item.get('ask', {}).get('raw', 0) or price)
                vol = int(item.get('volumeK', 0) or 0)
                high = float(item.get('regularMarketDayHigh', {}).get('raw', price) or price)
                low = float(item.get('regularMarketDayLow', {}).get('raw', price) or price)
                return {
                    "symbol": symbol,
                    "name": name,
                    "market": market_str,
                    "price": price,
                    "change": change,
                    "change_pct": change_pct,
                    "bid": bid,
                    "ask": ask,
                    "volume": vol,
                    "high": high,
                    "low": low,
                    "time": time.strftime("%H:%M:%S")
                }
    except Exception:
        # Fallback to Yahoo Finance v8
        try:
            yf_url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?interval=1m&range=1d"
            req2 = urllib.request.Request(yf_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req2, timeout=6) as resp2:
                data2 = json.loads(resp2.read().decode('utf-8'))
                meta = data2['chart']['result'][0]['meta']
                price = float(meta.get('regularMarketPrice', 0))
                prev = float(meta.get('chartPreviousClose', price))
                change = price - prev
                change_pct = f"{(change/prev)*100:.2f}%"
                is_twse = symbol.endswith('.TW')
                return {
                    "symbol": symbol,
                    "name": symbol.split('.')[0],
                    "market": "上市" if is_twse else "上櫃",
                    "price": price,
                    "change": change,
                    "change_pct": change_pct,
                    "bid": price - 0.1,
                    "ask": price + 0.1,
                    "volume": int(meta.get('regularMarketVolume', 0) / 1000),
                    "high": float(meta.get('regularMarketDayHigh', price)),
                    "low": float(meta.get('regularMarketDayLow', price)),
                    "time": time.strftime("%H:%M:%S")
                }
        except Exception:
            pass
    return None

def main():
    os.system('') # Enable ANSI colors
    cfg = load_config()

    # Allow passing stock code via CLI argument: e.g. py monitor.py 2330
    if len(sys.argv) > 1:
        raw_code = sys.argv[1]
        resolved = resolve_symbol(raw_code)
        cfg['stock_code'] = resolved
        if len(sys.argv) > 2:
            try:
                cfg['target_low_price'] = float(sys.argv[2])
            except ValueError:
                pass

    current_symbol = cfg['stock_code']
    first_quote = fetch_quote(current_symbol)
    stock_name = first_quote['name'] if first_quote else cfg.get('stock_name', current_symbol)
    market_str = first_quote['market'] if first_quote else "上市櫃"

    print("=" * 68)
    print(f" 📈 台股上市櫃即時行情與自訂低價智慧通知系統 (Python)")
    print("=" * 68)
    print(f" 🛒 觀察股票標的     : {stock_name} ({current_symbol}) · [{market_str}]")
    print(f" 🎯 目前設定低價門檻 : NT$ {cfg['target_low_price']} 元")
    print(f" 🔍 觸發判斷條件     : {cfg['condition']}")
    print(f" ⏱️ 檢查間隔頻率     : 每 {cfg['check_interval_seconds']} 秒")
    print(f" 🔔 桌面推播 / 音效  : 推播={cfg['enable_windows_toast']}, 蜂鳴音={cfg['enable_sound_beep']}")
    print(f" 💡 提示: 您可直接輸入 `py monitor.py 2330 2400` 切換監控台積電與門檻")
    print("=" * 68)
    print("時間      | 股票       | 成交價   | 漲跌       | 買價(Bid)| 賣價(Ask)| 總量(張)")
    print("-" * 68)

    last_alert_time = 0

    while True:
        try:
            quote = fetch_quote(current_symbol)
            if quote:
                p = quote['price']
                chg = quote['change']
                pct = quote['change_pct']
                bid = quote['bid']
                ask = quote['ask']
                vol = quote['volume']
                t = quote['time']
                name = quote['name'] or stock_name

                if chg > 0:
                    chg_str = f"+{chg:.1f} ({pct})"
                    color = "\033[91m" # Red (Taiwan Stock Up)
                elif chg < 0:
                    chg_str = f"{chg:.1f} ({pct})"
                    color = "\033[92m" # Green (Taiwan Stock Down)
                else:
                    chg_str = f" 0.0 ({pct})"
                    color = "\033[90m"

                reset = "\033[0m"

                print(f"{t}  | {name:8} | {color}{p:7.1f}{reset}  | {color}{chg_str:11}{reset}| {bid:7.1f} | {ask:7.1f} | {vol:7d}")

                # Check Low Price Alert
                target = float(cfg['target_low_price'])
                condition = cfg['condition']
                is_alert = False
                reason = ""
                trigger_price = p

                if condition == 'price_or_ask':
                    if p <= target:
                        is_alert = True
                        reason = f"成交價 ({p} 元) ≤ 設定低價門檻 ({target} 元)"
                        trigger_price = p
                    elif ask > 0 and ask <= target:
                        is_alert = True
                        reason = f"委賣價 Ask ({ask} 元) ≤ 設定低價門檻 ({target} 元)，可直接低價買進！"
                        trigger_price = ask
                elif condition == 'price_le' and p <= target:
                    is_alert = True
                    reason = f"成交價 ({p} 元) ≤ 設定低價門檻 ({target} 元)"
                    trigger_price = p
                elif condition == 'ask_le' and ask > 0 and ask <= target:
                    is_alert = True
                    reason = f"委賣價 Ask ({ask} 元) ≤ 設定低價門檻 ({target} 元)"
                    trigger_price = ask
                elif condition == 'bid_le' and bid > 0 and bid <= target:
                    is_alert = True
                    reason = f"委買價 Bid ({bid} 元) ≤ 設定低價門檻 ({target} 元)"
                    trigger_price = bid

                if is_alert:
                    now = time.time()
                    if now - last_alert_time >= cfg['cooldown_seconds']:
                        last_alert_time = now
                        print("\n" + "!" * 68)
                        print(f" 🚨【低價通知觸發】 {name} ({current_symbol}) 股價達到低價目標！")
                        print(f" 📌 原因: {reason}")
                        print(f" 💰 觸發價格: NT$ {trigger_price} 元 (門檻: {target} 元)")
                        print("!" * 68 + "\n")

                        if cfg['enable_sound_beep']:
                            play_alert_sound()

                        if cfg['enable_windows_toast']:
                            send_windows_toast(
                                f"🚨 {name} ({current_symbol}) 低價買進通知！",
                                f"{reason}\n目前價格: {trigger_price} 元 (門檻: {target} 元)"
                            )

            else:
                print(f"{time.strftime('%H:%M:%S')}  | 連線更新中...")

            time.sleep(cfg['check_interval_seconds'])

        except KeyboardInterrupt:
            print("\n[系統] 監控已停止。")
            break
        except Exception as e:
            print(f"[錯誤] {e}")
            time.sleep(2)

if __name__ == '__main__':
    main()
