# -*- coding: utf-8 -*-
"""
寶雅 (5904) 股市即時行情與低價警示監控腳本
Python Real-Time Stock Quote Monitor & Low Price Alert for Poya (5904.TWO)
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
    [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier("寶雅低價監控").Show($toast)
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

def fetch_quote(symbol="5904.TWO"):
    url = f"https://tw.stock.yahoo.com/_td-stock/api/resource/StockServices.stockList;symbols=%5B%22{symbol}%22%5D"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    try:
        with urllib.request.urlopen(req, timeout=6) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            if data and len(data) > 0:
                item = data[0]
                price = float(item.get('price', {}).get('raw', 0) or 0)
                change = float(item.get('change', {}).get('raw', 0) or 0)
                change_pct = item.get('changePercent', '0.00%')
                bid = float(item.get('bid', {}).get('raw', 0) or price)
                ask = float(item.get('ask', {}).get('raw', 0) or price)
                vol = int(item.get('volumeK', 0) or 0)
                high = float(item.get('regularMarketDayHigh', {}).get('raw', price) or price)
                low = float(item.get('regularMarketDayLow', {}).get('raw', price) or price)
                return {
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
        # Fallback to Yahoo Finance v8 chart
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
                return {
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
    os.system('') # Enable ANSI colors on Windows cmd
    cfg = load_config()

    print("=" * 65)
    print(" 🛒 寶雅 (5904) 股市即時行情與自訂低價智慧通知系統 (Python)")
    print("=" * 65)
    print(f" 🎯 目前設定低價門檻 : NT$ {cfg['target_low_price']} 元")
    print(f" 🔍 觸發判斷條件     : {cfg['condition']}")
    print(f" ⏱️ 檢查間隔頻率     : 每 {cfg['check_interval_seconds']} 秒")
    print(f" 🔔 桌面推播 / 音效  : 推播={cfg['enable_windows_toast']}, 蜂鳴音={cfg['enable_sound_beep']}")
    print(f" 💡 提示: 您可直接修改 config.json 調整低價門檻與參數。")
    print("=" * 65)
    print("時間      | 成交價   | 漲跌       | 買價(Bid)| 賣價(Ask)| 總量(張)")
    print("-" * 65)

    last_alert_time = 0

    while True:
        try:
            quote = fetch_quote(cfg['stock_code'])
            if quote:
                p = quote['price']
                chg = quote['change']
                pct = quote['change_pct']
                bid = quote['bid']
                ask = quote['ask']
                vol = quote['volume']
                t = quote['time']

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

                print(f"{t}  | {color}{p:7.1f}{reset}  | {color}{chg_str:11}{reset}| {bid:7.1f} | {ask:7.1f} | {vol:7d}")

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
                        print("\n" + "!" * 65)
                        print(" 🚨【低價通知觸發】 寶雅 (5904) 股價達到低價目標！")
                        print(f" 📌 原因: {reason}")
                        print(f" 💰 觸發價格: NT$ {trigger_price} 元 (門檻: {target} 元)")
                        print("!" * 65 + "\n")

                        if cfg['enable_sound_beep']:
                            play_alert_sound()

                        if cfg['enable_windows_toast']:
                            send_windows_toast(
                                "🚨 寶雅 (5904) 低價買進通知！",
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
