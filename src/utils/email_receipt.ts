function generatePaymentReceiptEmail({
  senderName,
  senderAccount,
  senderBank,
  recipientName,
  recipientAccount,
  recipientBank,
  transactionId,
  amount,
  amountReceived,
  fee,
  note,
  time,
  requestId,
}: {
  senderName: string;
  senderAccount: string;
  senderBank: string;
  recipientName: string;
  recipientAccount: string;
  recipientBank: string;
  transactionId: string;
  amount: number;
  amountReceived: number;
  fee: number;
  note: string;
  time: string;
  requestId: string;
}): string {
  const fmt = (n: number) => n.toLocaleString("vi-VN");
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Sora:wght@600;700;800&display=swap" rel="stylesheet"/>
</head>
<body style="margin:0;padding:0;background:#eef1f7;font-family:'DM Sans',Arial,sans-serif;">

<!-- CONTAINER -->

<table width="100%" bgcolor="#eef1f7" cellpadding="0" cellspacing="0" style="padding:20px 0;font-family:Arial, sans-serif;">
  <tr>
    <td align="center">
  <!-- MAIN CARD -->
  <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;">

    <!-- HEADER -->
    <tr>
      <td style="background:linear-gradient(135deg,#1e3a8a,#2563eb);padding:24px 28px;color:#fff;">
        <div style="font-size:20px;font-weight:800;">
          <span style="color:#fff;">Free</span><span style="color:#f59e0b;">Work</span>
        </div>
        <div style="font-size:11px;opacity:0.7;margin-top:4px;">
          BIÊN LAI THANH TOÁN
        </div>
      </td>
    </tr>

    <!-- STATUS -->
    <tr>
      <td align="center" style="padding:24px;">
        <div style="display:inline-block;background:#dcfce7;color:#15803d;padding:8px 18px;border-radius:50px;font-size:13px;font-weight:600;">
          ✓ Giao dịch thành công
        </div>
      </td>
    </tr>

    <!-- AMOUNT -->
    <tr>
      <td style="padding:0 24px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#1e3a8a,#2563eb);border-radius:14px;">
          <tr>
            <td align="center" style="padding:20px;color:#fff;">
              <div style="font-size:12px;opacity:0.7;">SỐ TIỀN</div>
              <div style="font-size:28px;font-weight:800;margin-top:6px;">
                ${fmt(amount)} VND
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- SENDER / RECEIVER -->
    <tr>
      <td style="padding:0 24px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>

            <!-- SENDER -->
            <td width="45%" valign="top">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid #f59e0b;border-radius:12px;">
                <tr>
                  <td style="padding:14px;">
                    <div style="font-size:11px;color:#f59e0b;font-weight:700;margin-bottom:8px;">NGƯỜI CHUYỂN</div>
                    <div style="font-size:14px;font-weight:700;color:#0f172a;">${senderName}</div>
                    <div style="font-size:12px;color:#64748b;margin-top:4px;">${senderAccount}</div>
                    <div style="font-size:11px;color:#94a3b8;margin-top:2px;">${senderBank}</div>
                  </td>
                </tr>
              </table>
            </td>

            <!-- ARROW -->
            <td width="10%" align="center" valign="middle">
              <div style="background:#f1f5f9;border-radius:50%;width:34px;height:34px;line-height:34px;text-align:center;font-weight:bold;color:#1e3a8a;">
                →
              </div>
            </td>

            <!-- RECEIVER -->
            <td width="45%" valign="top">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid #1e3a8a;border-radius:12px;">
                <tr>
                  <td style="padding:14px;">
                    <div style="font-size:11px;color:#1e3a8a;font-weight:700;margin-bottom:8px;">NGƯỜI NHẬN</div>
                    <div style="font-size:14px;font-weight:700;color:#0f172a;">${recipientName}</div>
                    <div style="font-size:12px;color:#64748b;margin-top:4px;">${recipientAccount}</div>
                    <div style="font-size:11px;color:#94a3b8;margin-top:2px;">${recipientBank}</div>
                  </td>
                </tr>
              </table>
            </td>

          </tr>
        </table>
      </td>
    </tr>

    <!-- TRANSACTION -->
    <tr>
      <td style="padding:0 24px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px dashed #cbd5e1;border-radius:10px;">
          <tr>
            <td style="padding:12px 16px;">
              <table width="100%">
                <tr>
                  <td>
                    <div style="font-size:11px;color:#94a3b8;">MÃ GIAO DỊCH</div>
                    <div style="font-size:13px;font-weight:600;">#${transactionId}</div>
                  </td>
                  <td align="right">
                    <div style="font-size:11px;color:#94a3b8;">THỜI GIAN</div>
                    <div style="font-size:13px;font-weight:600;">${time}</div>
                  </td> 
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- DETAIL -->
    <tr>
      <td style="padding:0 24px 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e2e8f0;">

          <tr>
            <td style="padding:10px 0;color:#64748b;">Mã yêu cầu</td>
            <td align="right">${requestId}</td>
          </tr>

          <tr>
            <td style="padding:10px 0;color:#64748b;">Số tiền gốc</td>
            <td align="right">${fmt(amount)} VND</td>
          </tr>

          <tr>
            <td style="padding:10px 0;color:#64748b;">Phí giao dịch</td>
            <td align="right">${fmt(fee)} VND</td>
          </tr>

          <tr>
            <td style="padding:12px 0;font-weight:700;">Thực nhận</td>
            <td align="right" style="color:#16a34a;font-weight:700;">
              ${fmt(amountReceived)} VND
            </td>
          </tr>

          <tr>
            <td style="padding:10px 0;color:#64748b;">Nội dung chuyển khoản</td>
            <td align="right">${note}</td>
          </tr>

          <tr>
            <td style="padding:10px 0;color:#64748b;">Trạng thái giao dịch</td>
            <td style="color: #108810ff;" align="right">Thành công</td>
          </tr>

        </table>
      </td>
    </tr>

    <!-- FOOTER -->
    <tr>
      <td style="background:#0f172a;color:#94a3b8;text-align:center;padding:20px;font-size:11px;">
        Email tự động từ FreeWork. Không trả lời email này.
      </td>
    </tr>

  </table>
</td>
  </tr>
</table>
</body>
</html>
  `;
}

function generatePaymentRejectedEmail({
  senderName,
  senderAccount,
  senderBank,
  recipientName,
  recipientAccount,
  recipientBank,
  transactionId,
  amount,
  fee,
  note,
  time,
  requestId,
  reason,
}: {
  senderName: string;
  senderAccount: string;
  senderBank: string;
  recipientName: string;
  recipientAccount: string;
  recipientBank: string;
  transactionId: string;
  amount: number;
  fee: number;
  note: string;
  time: string;
  requestId: string;
  reason?: string;
}): string {
  const fmt = (n: number) => n.toLocaleString("vi-VN");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 0;background:#f3f4f6;">
  <tr>
    <td align="center">

      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;">

        <!-- HEADER -->
        <tr>
          <td style="background:linear-gradient(135deg,#7f1d1d,#dc2626);padding:24px 28px;color:#fff;">
            <div style="font-size:20px;font-weight:800;">
              <span>Free</span><span style="color:#fbbf24;">Work</span>
            </div>
            <div style="font-size:11px;opacity:0.8;margin-top:4px;">
              BIÊN LAI GIAO DỊCH
            </div>
          </td>
        </tr>

        <!-- STATUS -->
        <tr>
          <td align="center" style="padding:26px 24px 18px;">
            <div style="display:inline-block;background:#fee2e2;color:#b91c1c;padding:9px 20px;border-radius:50px;font-size:13px;font-weight:700;">
              ✕ Giao dịch bị từ chối
            </div>
          </td>
        </tr>

        <!-- AMOUNT -->
        <tr>
          <td style="padding:0 24px 22px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff1f2;border:1px solid #fecdd3;border-radius:14px;">
              <tr>
                <td align="center" style="padding:22px;color:#7f1d1d;">
                  <div style="font-size:12px;color:#991b1b;">SỐ TIỀN GIAO DỊCH</div>
                  <div style="font-size:30px;font-weight:800;margin-top:6px;">
                    ${fmt(amount)} VND
                  </div>
                  <div style="font-size:12px;color:#b91c1c;margin-top:8px;">
                    Giao dịch chưa được xử lý thành công
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- SENDER / RECEIVER -->
        <tr>
          <td style="padding:0 24px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="45%" valign="top">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid #f59e0b;border-radius:12px;">
                    <tr>
                      <td style="padding:14px;">
                        <div style="font-size:11px;color:#f59e0b;font-weight:700;margin-bottom:8px;">NGƯỜI CHUYỂN</div>
                        <div style="font-size:14px;font-weight:700;color:#0f172a;">${senderName}</div>
                        <div style="font-size:12px;color:#64748b;margin-top:4px;">${senderAccount}</div>
                        <div style="font-size:11px;color:#94a3b8;margin-top:2px;">${senderBank}</div>
                      </td>
                    </tr>
                  </table>
                </td>

                <td width="10%" align="center" valign="middle">
                  <div style="background:#fee2e2;border-radius:50%;width:34px;height:34px;line-height:34px;text-align:center;font-weight:bold;color:#b91c1c;">
                    ✕
                  </div>
                </td>

                <td width="45%" valign="top">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid #dc2626;border-radius:12px;">
                    <tr>
                      <td style="padding:14px;">
                        <div style="font-size:11px;color:#dc2626;font-weight:700;margin-bottom:8px;">NGƯỜI NHẬN</div>
                        <div style="font-size:14px;font-weight:700;color:#0f172a;">${recipientName}</div>
                        <div style="font-size:12px;color:#64748b;margin-top:4px;">${recipientAccount}</div>
                        <div style="font-size:11px;color:#94a3b8;margin-top:2px;">${recipientBank}</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- TRANSACTION -->
        <tr>
          <td style="padding:0 24px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px dashed #cbd5e1;border-radius:10px;">
              <tr>
                <td style="padding:12px 16px;">
                  <table width="100%">
                    <tr>
                      <td>
                        <div style="font-size:11px;color:#94a3b8;">MÃ GIAO DỊCH</div>
                        <div style="font-size:13px;font-weight:600;">#${transactionId}</div>
                      </td>
                      <td align="right">
                        <div style="font-size:11px;color:#94a3b8;">THỜI GIAN</div>
                        <div style="font-size:13px;font-weight:600;">${time}</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- DETAIL -->
        <tr>
          <td style="padding:0 24px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e2e8f0;">
              <tr>
                <td style="padding:10px 0;color:#64748b;">Mã yêu cầu</td>
                <td align="right">${requestId}</td>
              </tr>

              <tr>
                <td style="padding:10px 0;color:#64748b;">Số tiền giao dịch</td>
                <td align="right">${fmt(amount)} VND</td>
              </tr>

              <tr>
                <td style="padding:10px 0;color:#64748b;">Phí giao dịch</td>
                <td align="right">${fmt(fee)} VND</td>
              </tr>

              <tr>
                <td style="padding:10px 0;color:#64748b;">Nội dung chuyển khoản</td>
                <td align="right">${note}</td>
              </tr>

              <tr>
                <td style="padding:10px 0;color:#64748b;">Lý do từ chối</td>
                <td align="right" style="color:#b91c1c;font-weight:600;">
                  ${reason || "Giao dịch không đáp ứng điều kiện xử lý"}
                </td>
              </tr>

              <tr>
                <td style="padding:12px 0;font-weight:700;">Trạng thái giao dịch</td>
                <td align="right" style="color:#dc2626;font-weight:700;">
                  Đã bị từ chối
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- NOTICE -->
        <tr>
          <td style="padding:0 24px 24px;">
            <div style="background:#fff7ed;border:1px solid #fed7aa;color:#9a3412;border-radius:10px;padding:12px 14px;font-size:12px;line-height:1.5;">
              Giao dịch này chưa được hoàn tất. Vui lòng kiểm tra lại thông tin hoặc liên hệ bộ phận hỗ trợ nếu bạn cần thêm trợ giúp.
            </div>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#0f172a;color:#94a3b8;text-align:center;padding:20px;font-size:11px;">
            Email tự động từ FreeWork. Không trả lời email này.
          </td>
        </tr>

      </table>

    </td>
  </tr>
</table>

</body>
</html>
  `;
}

function generateNotificationContractorAcceptFreelancerEmail({
  projectId,
  freelancerName,
  projectName,
  budget,
  contractorName,
  contractorEmail
}: {
  projectId: string;
  freelancerName: string;
  projectName: string;
  budget: string;
  contractorName: string;
  contractorEmail: string;
}): string {

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Sora:wght@600;700;800&display=swap" rel="stylesheet"/>
</head>
<body style="margin:0;padding:0;background:#eef1f7;font-family:'DM Sans',Arial,sans-serif;">

<!-- CONTAINER -->

<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#eef1f7" style="padding:20px 0;font-family:Arial, sans-serif;">
  <tr>
    <td align="center">
  <!-- MAIN -->
  <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;overflow:hidden;">
    
    <!-- HEADER -->
    <tr>
      <td style="background:linear-gradient(135deg,#1e3a8a,#2563eb);padding:24px 28px;color:#fff;">
        <div style="font-size:20px;font-weight:800;">
          Free<span style="color:#f59e0b;">Work</span>
        </div>
        <div style="font-size:11px;opacity:.8;margin-top:4px;">THÔNG BÁO CHẤP NHẬN HỢP ĐỒNG</div>
      </td>
    </tr>

    <!-- STATUS -->
    <tr>
      <td align="center" style="padding:22px 24px 10px;">
        <div style="display:inline-block;background:#dcfce7;color:#166534;padding:8px 16px;border-radius:50px;font-weight:700;font-size:13px;">
          🎉 Bạn đã được nhận thầu!
        </div>
        <div style="font-size:18px;font-weight:700;color:#0f172a;margin-top:12px;">
          Chúc mừng ${freelancerName}
        </div>
      </td>
    </tr>

    <!-- PROJECT CARD -->
    <tr>
      <td style="padding:10px 24px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;">
          <tr>
            <td style="padding:16px;">
              <div style="font-size:12px;color:#64748b;">Dự án</div>
              <div style="font-size:16px;font-weight:700;color:#0f172a;margin-top:4px;">
                ${projectName}
              </div>

              <table width="100%" style="margin-top:10px;">
                <tr>
                  <td style="font-size:12px;color:#64748b;">Mã dự án</td>
                  <td align="right">${projectId}</td>
                </tr>
                <tr>
                  <td style="font-size:12px;color:#64748b;">Chủ thầu</td>
                  <td align="right">${contractorName}</td>
                </tr>
                <tr>
                  <td style="font-size:12px;color:#64748b;">Email liên hệ</td>
                  <td align="right">${contractorEmail}</td>
                </tr>
                <tr>
                  <td style="font-size:12px;color:#64748b;">Ngân sách</td>
                  <td align="right" style="font-weight:700;">${budget}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- WARNING -->
    <tr>
      <td align="center" style="padding:0 24px 20px;font-size:12px;color:#64748b;">
        Vui lòng truy cập vào website để ký xác nhận hợp đồng trong vòng <b>24 giờ</b>, nếu không hợp đồng sẽ tự động hủy.
      </td>
    </tr>

    <!-- BUTTON -->
    <tr>
      <td align="center" style="padding:10px 24px 24px;">
        <a href="http://localhost:3000" style="display:inline-block;background:#16a34a;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-weight:700;">
          Truy cập website
        </a>
      </td>
    </tr>

    <!-- FOOTER -->
    <tr>
      <td style="background:#0f172a;color:#94a3b8;text-align:center;padding:18px;font-size:11px;">
        Email tự động từ FreeWork · support.freework@freework.vn
      </td>
    </tr>

  </table>
</td>
  </tr>
</table>

</body>
</html>
  `;
}

function generateNotificationFreelancerAcceptJob({
  projectId,
  contractorName,
  freelancerName,
  freelancerEmail,
  projectName,
  budget
}: {
  projectId: string;
  contractorName: string;
  freelancerName: string;
  freelancerEmail: string;
  projectName: string;
  budget: string;
}): string {

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Sora:wght@600;700;800&display=swap" rel="stylesheet"/>
</head>
<body style="margin:0;padding:0;background:#eef1f7;font-family:'DM Sans',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#eef1f7" style="padding:20px 0;font-family:Arial, sans-serif;">
    <tr>
      <td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;overflow:hidden;">
      
      <!-- HEADER -->
      <tr>
        <td style="background:linear-gradient(135deg,#1e3a8a,#2563eb);padding:24px 28px;color:#fff;">
          <div style="font-size:20px;font-weight:800;">
            Free<span style="color:#f59e0b;">Work</span>
          </div>
          <div style="font-size:11px;opacity:.8;margin-top:4px;">XÁC NHẬN THÔNG TIN FREELANCER</div>
        </td>
      </tr>

      <!-- STATUS -->
      <tr>
        <td align="center" style="padding:22px 24px;">
          <div style="display:block;background:#dcfce7;color:#166534;padding:8px 16px;border-radius:50px;font-weight:700;font-size:13px;">
            Freelancer đã nhận dự án vui lòng truy cập vào link website bên dưới để tiến hành ký hợp đồng trong vòng 24 giờ
          </div>
          <div style="font-size:18px;font-weight:700;color:#0f172a;margin-top:12px;">
            Xin chào ${contractorName}
          </div>
        </td>
      </tr>

      <!-- INFO -->
      <tr>
        <td style="padding:0 24px 20px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;">
            <tr>
              <td style="padding:16px;">
                
                <div style="font-size:14px;font-weight:700;color:#0f172a;">
                  ${projectName}
                </div>

                <table width="100%" style="margin-top:10px;">
                  <tr>
                    <td style="font-size:12px;color:#64748b;">Mã dự án</td>
                    <td align="right">${projectId}</td>
                  </tr>
                  <tr>
                    <td style="font-size:12px;color:#64748b;">Freelancer</td>
                    <td align="right" style="font-weight:700;">${freelancerName}</td>
                  </tr>
                  <tr>
                    <td style="font-size:12px;color:#64748b;">Email liên hệ</td>
                    <td align="right">${freelancerEmail}</td>
                  </tr>
                  <tr>
                    <td style="font-size:12px;color:#64748b;">Ngân sách</td>
                    <td align="right">${budget}</td>
                  </tr>
                </table>

              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- NEXT STEPS -->
      <tr>
        <td style="padding:0 24px 24px;font-size:12px;color:#64748b;">
          Bạn có thể trao đổi yêu cầu, theo dõi tiến độ và quản lý thanh toán ngay trong hệ thống.
        </td>
      </tr>

      <!-- FOOTER -->
      <tr>
        <td style="background:#0f172a;color:#94a3b8;text-align:center;padding:18px;font-size:11px;">
          FreeWork · Nền tảng freelance hàng đầu
        </td>
      </tr>

      <!-- BUTTON -->
      <tr>
        <td align="center" style="padding:10px 24px 24px;">
          <a href="http://localhost:3000" style="display:inline-block;background:#16a34a;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-weight:700;">
            Truy cập website
          </a>
        </td>
      </tr>

    </table>

  </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export { generatePaymentReceiptEmail, generatePaymentRejectedEmail, generateNotificationContractorAcceptFreelancerEmail, generateNotificationFreelancerAcceptJob };