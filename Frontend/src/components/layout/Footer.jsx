import { FiTruck, FiZap, FiShield, FiRotateCcw } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="tck-footer">
      <style>{`
        .tck-footer {
          margin-top: 48px;
          background: var(--surface, #FFFFFF);
          border-top: 1px solid var(--line, #E8E8EC);
        }
        .tck-footer-perks {
          max-width: 1280px;
          margin: 0 auto;
          padding: 22px 24px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          border-bottom: 1px solid var(--line, #E8E8EC);
        }
        @media (max-width: 800px) { .tck-footer-perks { grid-template-columns: repeat(2, 1fr); } }
        .tck-perk { display: flex; align-items: center; gap: 10px; }
        .tck-perk-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-dark, #B8362D);
          flex-shrink: 0;
        }
        .tck-perk-title { font-size: 13px; font-weight: 600; color: var(--ink, #1C1F26); }
        .tck-perk-sub { font-size: 11.5px; color: var(--muted, #6B7280); }
        .tck-footer-main {
          max-width: 1280px;
          margin: 0 auto;
          padding: 28px 24px;
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr 1fr;
          gap: 24px;
        }
        @media (max-width: 800px) { .tck-footer-main { grid-template-columns: 1fr 1fr; } }
        .tck-footer-logo {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 18px;
          color: var(--accent-dark, #B8362D);
          margin-bottom: 8px;
        }
        .tck-footer-brand p { font-size: 13px; color: var(--muted, #6B7280); }
        .tck-footer-head { font-size: 13px; font-weight: 600; margin-bottom: 10px; color: var(--ink, #1C1F26); }
        .tck-footer-col a {
          display: block;
          font-size: 13px;
          color: var(--muted, #6B7280);
          text-decoration: none;
          margin-bottom: 8px;
        }
        .tck-footer-col a:hover { color: var(--accent-dark, #B8362D); }
        .tck-footer-social { display: flex; gap: 10px; }
        .tck-footer-social span {
          border: 1px solid var(--line, #E8E8EC);
          border-radius: 8px;
          padding: 5px 10px;
          font-size: 11.5px;
          color: var(--muted, #6B7280);
        }
        .tck-footer-bottom {
          text-align: center;
          font-size: 12px;
          color: var(--muted, #6B7280);
          padding: 14px 24px;
          border-top: 1px solid var(--line, #E8E8EC);
        }
      `}</style>

      <div className="tck-footer-perks">
        <div className="tck-perk">
          <span className="tck-perk-icon"><FiTruck size={22} /></span>
          <div>
            <div className="tck-perk-title">ส่งฟรีทั่วไทย</div>
            <div className="tck-perk-sub">ช้อปครบ 2,000.- ขึ้นไป</div>
          </div>
        </div>
        <div className="tck-perk">
          <span className="tck-perk-icon"><FiZap size={22} /></span>
          <div>
            <div className="tck-perk-title">ส่งด่วนภายใน 3 ชม.</div>
            <div className="tck-perk-sub">กรุงเทพฯ และพื้นที่ให้บริการ</div>
          </div>
        </div>
        <div className="tck-perk">
          <span className="tck-perk-icon"><FiShield size={22} /></span>
          <div>
            <div className="tck-perk-title">ประกันใจทุกชิ้น</div>
            <div className="tck-perk-sub">รับประกันตามมาตรฐานผู้ผลิต</div>
          </div>
        </div>
        <div className="tck-perk">
          <span className="tck-perk-icon"><FiRotateCcw size={22} /></span>
          <div>
            <div className="tck-perk-title">เปลี่ยน/คืนง่าย</div>
            <div className="tck-perk-sub">ภายใน 7 วัน*</div>
          </div>
        </div>
      </div>

      <div className="tck-footer-main">
        <div className="tck-footer-col tck-footer-brand">
          <div className="tck-footer-logo">TleComKub</div>
          <p>ช้อปสเปคคอมได้ง่าย เลือกได้ตลอด 24 ชั่วโมง</p>
        </div>

        <div className="tck-footer-col">
          <div className="tck-footer-head">เกี่ยวกับ TleComKub</div>
          <a href="#">ติดต่อเรา</a>
          <a href="#">เกี่ยวกับเรา</a>
          <a href="#">ร่วมงานกับเรา</a>
        </div>

        <div className="tck-footer-col">
          <div className="tck-footer-head">บริการ</div>
          <a href="#">วิธีการสั่งซื้อ</a>
          <a href="#">การจัดส่งสินค้า</a>
          <a href="#">นโยบายการรับประกัน</a>
        </div>

        <div className="tck-footer-col">
          <div className="tck-footer-head">ติดตามเรา</div>
          <div className="tck-footer-social">
            <span>FB</span>
            <span>IG</span>
            <span>LINE</span>
            <span>TikTok</span>
          </div>
        </div>
      </div>

      <div className="tck-footer-bottom">
        © {new Date().getFullYear()} TleComKub. All Rights Reserved.
      </div>
    </footer>
  );
}