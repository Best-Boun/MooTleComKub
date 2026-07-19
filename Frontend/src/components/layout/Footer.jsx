import { FiTruck, FiZap, FiShield, FiRotateCcw } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="tck-footer">
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