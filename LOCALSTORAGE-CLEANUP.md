# 🧹 คู่มือการล้าง localStorage

## ปัญหา
ระบบแสดงอัตราภาษีเป็น 7% แทนที่จะเป็น 3% เนื่องจาก localStorage มีค่าเก่าที่ override การตั้งค่าใหม่

## วิธีแก้ไข

### วิธีที่ 1: ใช้ไฟล์ HTML (แนะนำ)
1. เปิดไฟล์ `clear-localStorage.html` ในเบราว์เซอร์
2. คลิกปุ่ม "🗑️ ล้าง localStorage ทั้งหมด"
3. รีเฟรชหน้าเว็บ
4. ไปที่หน้าตั้งค่าและตรวจสอบว่าอัตราภาษีเป็น 3%

### วิธีที่ 2: ใช้ Developer Console
1. เปิด Developer Console (F12)
2. รันคำสั่งนี้:
   ```javascript
   localStorage.clear();
   ```
3. รีเฟรชหน้าเว็บ

### วิธีที่ 3: ใช้ไฟล์ JavaScript
1. เปิดไฟล์ `clear-localStorage.js` ในเบราว์เซอร์
2. รันฟังก์ชัน `main()` ใน console
3. รีเฟรชหน้าเว็บ

## ฟังก์ชันที่มีให้

### 🗑️ clearAllLocalStorage()
ล้าง localStorage ทั้งหมด
```javascript
clearAllLocalStorage();
```

### ⚙️ clearSettingsOnly()
ล้างเฉพาะการตั้งค่า
```javascript
clearSettingsOnly();
```

### 💰 resetTaxRate()
รีเซ็ตอัตราภาษีเป็น 3%
```javascript
resetTaxRate();
```

### 📋 showLocalStorageContents()
แสดงข้อมูลใน localStorage
```javascript
showLocalStorageContents();
```

### 🔄 forceReloadSettings()
บังคับโหลดการตั้งค่าใหม่
```javascript
forceReloadSettings();
```

## ขั้นตอนการตรวจสอบ

### 1. ล้าง localStorage
```javascript
localStorage.clear();
```

### 2. รีเฟรชหน้าเว็บ
```javascript
window.location.reload();
```

### 3. ตรวจสอบหน้าตั้งค่า
- ไปที่หน้าตั้งค่า
- ตรวจสอบว่าฟิลด์อัตราภาษีแสดง 3%
- บันทึกการตั้งค่า

### 4. ตรวจสอบหน้า POS
- ไปที่หน้า POS
- เพิ่มสินค้าในตะกร้า
- ตรวจสอบว่าอัตราภาษีแสดง 3%
- ตรวจสอบสลิปใบเสร็จ

## การตรวจสอบ localStorage

### ดูข้อมูลทั้งหมด
```javascript
for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    console.log(`${key}:`, value);
}
```

### ดูการตั้งค่าเฉพาะ
```javascript
const settings = localStorage.getItem('pos_settings');
if (settings) {
    const parsed = JSON.parse(settings);
    console.log('Settings:', parsed);
    console.log('Tax rate:', parsed.system?.taxRate);
}
```

## หมายเหตุ

- การล้าง localStorage จะลบข้อมูลทั้งหมดที่เก็บไว้ในเบราว์เซอร์
- ระบบจะโหลดการตั้งค่าใหม่จาก API เมื่อรีเฟรชหน้า
- หากยังเห็นค่า 7% ให้ตรวจสอบว่าฐานข้อมูลถูกอัปเดตแล้ว
- ตรวจสอบว่า API ส่งค่า 3% กลับมา

## Troubleshooting

### หากยังเห็นค่า 7% หลังล้าง localStorage
1. ตรวจสอบว่าฐานข้อมูลถูกอัปเดตเป็น 3% แล้ว
2. ตรวจสอบว่า API ส่งค่า 3% กลับมา
3. ลองล้าง cache ของเบราว์เซอร์
4. ลองใช้เบราว์เซอร์อื่น

### หากไม่สามารถล้าง localStorage ได้
1. ตรวจสอบว่าเปิด Developer Console แล้ว
2. ตรวจสอบว่าไม่มี JavaScript error
3. ลองรีเฟรชหน้าเว็บก่อน
4. ลองปิดและเปิดเบราว์เซอร์ใหม่
