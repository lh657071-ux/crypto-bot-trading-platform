# 🎨 Crypto Trading Bot Dashboard - Frontend

## Preview di Browser

Ini adalah **dashboard web interaktif** yang terhubung dengan backend API di port 5000.

## 🚀 Cara Membuka di Browser

### Option 1: Langsung buka file HTML
```bash
# Cukup buka file di browser
open frontend/index.html
# atau
start frontend/index.html
```

### Option 2: Gunakan Live Server (VS Code)
1. Install extension "Live Server"
2. Right-click pada `frontend/index.html`
3. Pilih "Open with Live Server"
4. Dashboard akan terbuka di http://localhost:5500 (atau port lain)

### Option 3: Gunakan Python Simple Server
```bash
cd frontend
python -m http.server 8000
# Buka http://localhost:8000
```

### Option 4: Gunakan Node.js
```bash
npm install -g http-server
cd frontend
http-server
# Buka http://localhost:8080
```

---

## ✨ Fitur Dashboard

### 📊 Dashboard Cards
- **Bot Status** - Status current bot (RUNNING/STOPPED)
- **Uptime** - Berapa lama bot sudah berjalan
- **Active Positions** - Jumlah trade yang sedang dibuka
- **Total Profit** - Total profit yang sudah didapat
- **Win Rate** - Persentase trade yang profitable
- **Max Positions** - Konfigurasi maksimal open positions

### 📡 Trading Signals
Menampilkan signal real-time dari AI:
- Symbol (BTC/USDT, ETH/USDT, dll)
- Action (BUY, SELL, HOLD)
- Confidence level
- Current price
- Strength indicator

### ⚙️ Bot Configuration
Melihat konfigurasi bot saat ini:
- Max positions
- Risk limit
- Update interval
- Auto trade status
- Signal threshold
- Trading pairs

### 💱 Execute Trade
Form untuk manual trade execution:
- Select trading pair
- Choose action (BUY/SELL)
- Input amount
- Execute button

### 📜 Trade History
Melihat semua trade yang sudah executed:
- Trade ID
- Pair
- Action
- Amount
- Entry price
- Exit price
- Profit/Loss
- Status

---

## 🔄 Auto Refresh

Dashboard otomatis refresh setiap **10 detik** untuk menampilkan data terbaru.

---

## 🔌 API Connection

Dashboard terhubung ke backend API:
```
API Base URL: http://localhost:5000/api
Health Check: http://localhost:5000/health
```

Status koneksi ditampilkan di bagian atas:
- 🟢 Connected - Backend running
- 🔴 Disconnected - Backend tidak accessible

---

## 🎨 Styling

- **Gradient background** - Purple gradient theme
- **Responsive cards** - Auto layout untuk berbagai ukuran screen
- **Real-time updates** - Live data dari backend
- **Color coded signals**:
  - 🟢 GREEN - BUY signals
  - 🔴 RED - SELL signals
  - 🟠 ORANGE - HOLD signals

---

## 🚀 Fitur Lanjut

- ✅ Real-time bot status monitoring
- ✅ Trading signals display
- ✅ Manual trade execution
- ✅ Trade history view
- ✅ Configuration management
- ✅ Error handling
- ✅ Success/Error messages
- ✅ Automatic data refresh
- ✅ Responsive design

---

## 📋 Requirements

- ✅ Backend API running di port 5000
- ✅ Modern web browser (Chrome, Firefox, Safari, Edge)
- ✅ CORS enabled di backend (sudah dikonfigurasi)

---

## 🔧 Troubleshooting

### Dashboard menunjukkan "🔴 Disconnected"
1. Pastikan backend running: `docker-compose up -d`
2. Cek port 5000 accessible
3. Pastikan CORS_ORIGIN=* di .env

### Data tidak refresh
1. Check browser console untuk error messages
2. Pastikan API endpoints accessible
3. Check network tab di browser developer tools

### Manual trade tidak work
1. Pastikan backend API running
2. Check console untuk error messages
3. Validasi input amount

---

## 📱 Mobile Responsive

Dashboard fully responsive untuk mobile devices:
- Tablet-optimized layout
- Touch-friendly buttons
- Readable fonts on small screens

---

## 🎯 Next Steps

1. ✅ Buka `frontend/index.html` di browser
2. ✅ Pastikan backend running di port 5000
3. ✅ Monitor trading signals real-time
4. ✅ Execute trades dari dashboard
5. ✅ Track profit/loss

---

**Dashboard siap! 🚀**
