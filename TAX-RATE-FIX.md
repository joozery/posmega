# แก้ไขปัญหาอัตราภาษีจาก 7% เป็น 3%

## ปัญหา
ระบบแสดงอัตราภาษีเป็น 7% แทนที่จะเป็น 3% ที่ตั้งค่าไว้

## สาเหตุ
- ค่า default ในโค้ดถูกตั้งเป็น 7%
- การตั้งค่าจาก API อาจไม่ถูกบันทึกใน localStorage
- ไฟล์ที่ build แล้วยังใช้ค่าเก่า

## การแก้ไขที่ทำแล้ว

### 1. แก้ไขค่า default ในไฟล์ source code
- `src/pages/Settings.jsx` - เปลี่ยนจาก `taxRate: 7` เป็น `taxRate: 3`
- `src/hooks/usePos.js` - เปลี่ยนจาก `|| 7` เป็น `|| 3`
- `src/components/pos/CartPanel.jsx` - เปลี่ยนจาก `|| 7` เป็น `|| 3`
- `src/components/ReceiptDialog.jsx` - เปลี่ยนจาก `|| 7` เป็น `|| 3`

### 2. รีเซ็ตการตั้งค่าใน localStorage
รันคำสั่งนี้ใน Developer Console ของเบราว์เซอร์:

```javascript
// Copy and paste this code in browser console
console.log('🔄 Resetting tax rate to 3%...');
const currentSettings = JSON.parse(localStorage.getItem('pos_settings') || '{}');
if (!currentSettings.system) {
    currentSettings.system = {};
}
currentSettings.system.taxRate = 3;
localStorage.setItem('pos_settings', JSON.stringify(currentSettings));
window.dispatchEvent(new Event('settings_updated'));
console.log('✅ Tax rate updated to 3%');
```

### 3. Build ใหม่
รันคำสั่งเพื่อ build ใหม่:
```bash
npm run build
```

## การตรวจสอบ
1. เปิดหน้า POS
2. เพิ่มสินค้าในตะกร้า
3. ตรวจสอบว่าอัตราภาษีแสดงเป็น 3%
4. ตรวจสอบสลิปใบเสร็จว่าอัตราภาษีเป็น 3%

## หากยังไม่แก้ไข
1. ล้าง localStorage ทั้งหมด:
   ```javascript
   localStorage.clear();
   ```
2. รีเฟรชหน้าเว็บ
3. ไปที่หน้าตั้งค่าและบันทึกการตั้งค่าใหม่
4. ตรวจสอบว่าอัตราภาษีถูกต้อง

## หมายเหตุ
- การเปลี่ยนแปลงจะมีผลทันทีหลังจากรีเฟรชหน้า
- หากยังเห็นค่า 7% ให้ตรวจสอบว่าได้ build ใหม่แล้ว
- ตรวจสอบว่า localStorage ไม่มีค่าเก่าที่ override การตั้งค่าใหม่
