export default async function handler(req, res) {
    const { name, email, action, reason } = req.query;
    
    // Gọi ngầm tới Google Apps Script để lưu dữ liệu
    const scriptUrl = `https://script.google.com/macros/s/AKfycbzBK60x6eTNoljW01Z1dedi2l5fIJeaPxkeFtba9JSvADlFeCvBwaL18rq5l6B5FJzUVg/exec?name=${encodeURIComponent(name || '')}&email=${encodeURIComponent(email || '')}&action=${encodeURIComponent(action || '')}&reason=${encodeURIComponent(reason || '')}`;
    
    try {
        await fetch(scriptUrl);
    } catch (error) {
        console.error("Lỗi khi gọi Apps Script:", error);
    }

    // Hiển thị nội dung trực tiếp trên web của bạn
    if (action === 'yes') {
        // Nếu chọn Có, chuyển thẳng đến trang đăng ký
        res.redirect(302, '/dangky');
    } else if (action === 'submit_reason') {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(`
            <!DOCTYPE html>
            <html lang="vi">
                <head>
                    <title>Cảm ơn - DPSG</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
                    <style>
                        body { font-family: 'Plus Jakarta Sans', sans-serif; text-align: center; padding: 20px; background: #f9f9ff; color: #434655; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
                        .card { background: white; padding: 48px 32px; border-radius: 24px; box-shadow: 0 12px 40px rgba(0,74,198,0.06); border: 1px solid #e3e6f1; max-width: 400px; width: 100%; }
                        h2 { color: #111c2d; font-size: 24px; margin-top: 0; margin-bottom: 16px; }
                        .icon { font-size: 48px; margin-bottom: 24px; }
                        .btn { display: inline-block; margin-top: 32px; color: #ffffff; background-color: #004ac6; text-decoration: none; font-weight: 700; padding: 14px 32px; border-radius: 999px; font-size: 15px; box-shadow: 0 12px 30px -12px rgba(0, 74, 198, 0.6); }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <div class="icon">💖</div>
                        <h2>Cảm ơn bạn!</h2>
                        <p style="margin: 0 0 12px; line-height: 1.6;">DPSG đã nhận được chia sẻ từ <b>${name || 'bạn'}</b>.</p>
                        <p style="margin: 0; line-height: 1.6;">Hẹn gặp lại bạn ở các sự kiện tiếp theo nhé! 💙</p>
                        <a href="/" class="btn">VỀ TRANG CHỦ</a>
                    </div>
                </body>
            </html>
        `);
    } else {
        // Nếu chọn Không, hiển thị form khảo sát lý do
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(`
            <!DOCTYPE html>
            <html lang="vi">
                <head>
                    <title>Xác nhận phản hồi - DPSG</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
                    <style>
                        body { font-family: 'Plus Jakarta Sans', sans-serif; text-align: center; padding: 20px; background: #f9f9ff; color: #434655; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
                        .card { background: white; padding: 40px 32px; border-radius: 24px; box-shadow: 0 12px 40px rgba(0,74,198,0.06); border: 1px solid #e3e6f1; max-width: 400px; width: 100%; }
                        h2 { color: #111c2d; font-size: 24px; margin-top: 0; margin-bottom: 12px; }
                        .icon { font-size: 40px; margin-bottom: 16px; }
                        .btn { display: inline-block; color: #ffffff; background-color: #004ac6; text-decoration: none; font-weight: 700; padding: 14px 32px; border-radius: 999px; font-size: 15px; box-shadow: 0 12px 30px -12px rgba(0, 74, 198, 0.6); }
                        textarea { width: 100%; box-sizing: border-box; padding: 16px; border-radius: 12px; border: 1.5px solid #e3e6f1; font-family: inherit; font-size: 15px; margin-bottom: 16px; resize: vertical; outline: none; transition: border-color 0.2s; }
                        textarea:focus { border-color: #004ac6; }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <div class="icon">✅</div>
                        <h2>Đã ghi nhận!</h2>
                        <p style="margin: 0 0 12px; line-height: 1.6;">Rất tiếc vì đợt này <b>${name || 'bạn'}</b> không tham gia được.</p>
                        <p style="margin: 0 0 24px; line-height: 1.6; color: #737686; font-size: 15px;">Nếu tiện, bạn có thể chia sẻ lý do để DPSG cải thiện hơn không?</p>
                        
                        <form method="GET" action="/api/feedback">
                            <input type="hidden" name="name" value="${name || ''}">
                            <input type="hidden" name="email" value="${email || ''}">
                            <input type="hidden" name="action" value="submit_reason">
                            <textarea name="reason" rows="3" required placeholder="Ví dụ: Đợt này mình bận chạy deadline..."></textarea>
                            <button type="submit" class="btn" style="border:none; cursor:pointer; width: 100%; margin-top: 8px;">GỬI LÝ DO</button>
                        </form>
                        
                        <a href="/" style="display:block; margin-top: 24px; color: #737686; text-decoration: none; font-size: 14px; font-weight: 500;">Bỏ qua, về trang chủ</a>
                    </div>
                </body>
            </html>
        `);
    }
}
