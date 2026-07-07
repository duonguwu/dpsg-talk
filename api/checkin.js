export default async function handler(req, res) {
    const { email } = req.query;

    if (req.method === 'POST') {
        // Xử lý request Check-in từ nút bấm của BTC
        const { pin } = req.body;

        // Mật khẩu dành cho BTC (bạn có thể đổi mật khẩu này)
        if (pin !== '1234') {
            return res.status(403).json({ error: 'Sai mã PIN BTC!' });
        }

        // Gọi Google Apps Script để ghi vào file Excel
        // THAY LINK SCRIPT CỦA BẠN VÀO ĐÂY SAU NHÉ!
        const scriptUrl = `https://script.google.com/macros/s/AKfycbyA5SELsN2BQewd0APkIp_ta-ncjgjDQE4a2DoYYBYb7vmQK-iTr7Wr9UqgCHdJOZOP/exec?email=${encodeURIComponent(email || '')}`;

        try {
            // Khi chưa có link script, nó sẽ văng lỗi fetch, nhưng mình sẽ giả lập thành công nếu chưa thay link
            if (scriptUrl.includes('YOUR_GOOGLE')) {
                return res.status(200).json({ success: true, note: 'Chưa gắn link Google Script' });
            }
            await fetch(scriptUrl);
            return res.status(200).json({ success: true });
        } catch (e) {
            return res.status(500).json({ error: 'Lỗi máy chủ' });
        }
    }

    // Giao diện Thẻ tham dự & Đếm ngược
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`
        <!DOCTYPE html>
        <html lang="vi">
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>Vé Tham Dự - DPSG</title>
                <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
                <style>
                    body { font-family: 'Plus Jakarta Sans', sans-serif; text-align: center; padding: 20px; background: #e7eeff; margin: 0; color: #111c2d; }
                    .ticket { background: white; padding: 40px 24px; border-radius: 24px; max-width: 400px; margin: 20px auto; box-shadow: 0 12px 40px rgba(0,74,198,0.06); border: 1px solid #e3e6f1; position: relative; overflow: hidden; }
                    .ticket::before { content: ""; position: absolute; top: 0; left: 0; right: 0; height: 8px; background: linear-gradient(90deg, #004ac6, #3b82f6); }
                    .logo { font-size: 12px; font-weight: 800; letter-spacing: 2px; color: #004ac6; text-transform: uppercase; margin-bottom: 24px; }
                    h2 { margin: 0 0 16px; font-size: 24px; }
                    .email-box { background: #f4f7ff; border: 1px dashed #004ac6; border-radius: 12px; padding: 16px; margin: 24px 0; word-break: break-all; }
                    .info { text-align: left; background: #f9f9ff; padding: 16px; border-radius: 12px; margin-bottom: 24px; font-size: 14px; line-height: 1.6; }
                    
                    /* Countdown */
                    .countdown { display: flex; justify-content: center; gap: 12px; margin: 24px 0; }
                    .cd-box { background: #111c2d; color: white; padding: 12px; border-radius: 12px; min-width: 50px; }
                    .cd-num { font-size: 24px; font-weight: 800; }
                    .cd-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #8b92ad; margin-top: 4px; }
                    
                    .btn { background: #004ac6; color: white; border: none; padding: 16px; border-radius: 999px; font-size: 14px; font-weight: 700; width: 100%; cursor: pointer; font-family: inherit; margin-top: 24px; box-shadow: 0 12px 30px -12px rgba(0, 74, 198, 0.6); }
                    .btn:hover { background: #003b9e; }
                </style>
            </head>
            <body>
                <div class="ticket">
                    <div class="logo">DPSG Connect</div>
                    <h2>Thẻ Tham Dự Talkshow</h2>
                    
                    <div class="email-box">
                        <span style="color: #737686; font-size: 12px; text-transform: uppercase; font-weight: 700;">Hội viên / Khách mời</span><br>
                        <b style="font-size: 16px; line-height: 2;">${email}</b>
                    </div>

                    <div class="info">
                        <strong>📍 Địa điểm:</strong> Wiselands Coffee, 216 Điện Biên Phủ, Quận 3<br>
                        <strong>🕖 Thời gian:</strong> 08:30 · Thứ Bảy, 11/07/2026
                    </div>

                    <p style="font-weight: 600; font-size: 14px; margin-bottom: 12px; color: #434655;">Sự kiện sẽ bắt đầu sau:</p>
                    <div class="countdown" id="countdown">
                        <div class="cd-box"><div class="cd-num" id="d">--</div><div class="cd-label">Ngày</div></div>
                        <div class="cd-box"><div class="cd-num" id="h">--</div><div class="cd-label">Giờ</div></div>
                        <div class="cd-box"><div class="cd-num" id="m">--</div><div class="cd-label">Phút</div></div>
                        <div class="cd-box"><div class="cd-num" id="s">--</div><div class="cd-label">Giây</div></div>
                    </div>

                    <!-- Nút Check-in dành cho BTC -->
                    <button class="btn" onclick="doCheckin()">XÁC NHẬN CHECK-IN (Dành cho BTC)</button>
                    <p id="status" style="margin-top: 16px; font-weight: 700; font-size: 18px;"></p>
                </div>

                <script>
                    // Script đếm ngược
                    const eventDate = new Date("2026-07-11T08:30:00+07:00").getTime();
                    setInterval(() => {
                        const now = new Date().getTime();
                        const distance = eventDate - now;
                        if (distance < 0) {
                            document.getElementById("countdown").innerHTML = "<b style='color:#059669; font-size: 18px;'>Sự kiện đang diễn ra!</b>";
                            return;
                        }
                        document.getElementById("d").innerText = Math.floor(distance / (1000 * 60 * 60 * 24));
                        document.getElementById("h").innerText = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                        document.getElementById("m").innerText = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                        document.getElementById("s").innerText = Math.floor((distance % (1000 * 60)) / 1000);
                    }, 1000);

                    // Script check-in
                    async function doCheckin() {
                        const pin = prompt("KHU VỰC NỘI BỘ:\\nVui lòng nhập mã PIN của BTC để xác nhận Check-in:");
                        if (!pin) return;
                        
                        document.getElementById("status").innerText = "Đang xử lý...";
                        document.getElementById("status").style.color = "#f59e0b";

                        try {
                            const res = await fetch("/api/checkin?email=${encodeURIComponent(email || '')}", {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ pin })
                            });
                            const data = await res.json();
                            if (data.success) {
                                document.getElementById("status").innerText = "✅ ĐÃ CHECK-IN THÀNH CÔNG!";
                                document.getElementById("status").style.color = "#059669";
                            } else {
                                alert("Lỗi: " + data.error);
                                document.getElementById("status").innerText = "";
                            }
                        } catch (e) {
                            alert("Lỗi kết nối mạng!");
                            document.getElementById("status").innerText = "";
                        }
                    }
                </script>
            </body>
        </html>
    `);
}
