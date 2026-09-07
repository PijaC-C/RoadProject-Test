/*
 * รายการเนื้องานและราคาต่อหน่วยจาก
 * ราคาพื้นฐานจาก "ราคางานจัดซ่อมสะพานคนเดินข้ามถนน ประมาณก.pdf" (แผ่นที่ 1-2)
 * และราคาต่อหน่วยที่มีรายการตรงกันอัปเดตจาก
 * "สะพานลอยคนชุดที่ 2 6 เขต 27-8-2569.xlsx" แท็บ "ปร.4 ชุดที่2 7-9-69"
 *
 * ปริมาณใน PDF เป็นยอดรวมของ 4 สะพาน ไม่ใช่ปริมาณรายรหัสสะพาน
 * จึงเก็บเฉพาะรายการ/หน่วย/ราคาต่อหน่วยไว้เป็นฐานให้ผู้สำรวจเลือกและกรอก
 * ปริมาณรายสะพานในเครื่องคำนวณ
 */
(function (root) {
  const catalog = [
    { id: 'pdf-1.1.1', code: '1.1.1', name: 'เคลือบทับหน้ากันลื่นพื้นสะพานและบันไดด้วยวัสดุ Polyurethane', unit: 'ตร.ม.', rate: 570.75, condition: 'all', auto: 'puTotal' },
    { id: 'pdf-1.1.2', code: '1.1.2', name: 'งานซ่อมรอยแตกร้าวคอนกรีตโครงสร้างด้วย High Strength Mortar', unit: 'ตร.ม.', rate: 4224.71, condition: 'concrete', auto: null },
    { id: 'pdf-1.1.3', code: '1.1.3', name: 'ฉาบพื้นผิวสะพานด้วย High Strength Mortar', unit: 'ตร.ม.', rate: 1238.6, condition: 'concrete', auto: 'mortar' },
    { id: 'pdf-1.1.4', code: '1.1.4', name: 'ทาสีสะพานส่วนที่เป็นคอนกรีต', unit: 'ตร.ม.', rate: 92.02, condition: 'concrete', auto: null },
    { id: 'pdf-1.1.5', code: '1.1.5', name: 'ตีเส้นแบ่งช่องทางเดินบนสะพานและบันได', unit: 'ตร.ม.', rate: 95.5, condition: 'all', auto: 'marking' },
    { id: 'pdf-1.1.6.1', code: '1.1.6.1', name: 'ปรับปรุงซ่อมแซมท่อน้ำทิ้ง PVC ขนาด 4 นิ้ว', unit: 'ม.', rate: 860, condition: 'all', auto: null },
    { id: 'pdf-1.1.6.2', code: '1.1.6.2', name: 'ตะแกรงรังผึ้งสแตนเลส ขนาด 4 นิ้ว', unit: 'ชุด', rate: 50, condition: 'all', auto: null },
    { id: 'pdf-1.1.7', code: '1.1.7', name: 'งานขูดลอกสีเดิม', unit: 'ตร.ม.', rate: 10, condition: 'steel', auto: null },
    { id: 'pdf-1.1.8', code: '1.1.8', name: 'งานทาสีน้ำมันกันสนิมเหล็ก (รองพื้นกันสนิม+สีน้ำมัน 2 เที่ยว)', unit: 'ตร.ม.', rate: 95, condition: 'steel', auto: null },
    { id: 'pdf-1.1.9', code: '1.1.9', name: 'งานติดตั้งป้ายจำกัดความสูง', unit: 'ชุด', rate: 1200, condition: 'all', auto: null },
    { id: 'pdf-1.1.10.1', code: '1.1.10.1', name: 'รื้อถอนพร้อมติดตั้งแผ่นเรียบไฟเบอร์ซีเมนต์ หนา 10 มม. พร้อมทาสี', unit: 'ตร.ม.', rate: 490, condition: 'roof', auto: null },
    { id: 'pdf-1.1.10.2', code: '1.1.10.2', name: 'รื้อถอนพร้อมติดตั้งวัสดุมุงหลังคาเมทัลชีท', unit: 'ตร.ม.', rate: 390, condition: 'roof', auto: null },
    { id: 'pdf-1.1.10.3', code: '1.1.10.3', name: 'ซ่อมแซมโครงเหล็กหลังคา เหล็กแผ่นเรียบดำ หนา 2 มม.', unit: 'ตร.ม.', rate: 760, condition: 'roof', auto: null },
    { id: 'pdf-1.1.11.1', code: '1.1.11.1', name: 'งาน Grout plate', unit: 'จุด', rate: 600, condition: 'all', auto: null },
    { id: 'pdf-1.1.11.2', code: '1.1.11.2', name: 'ซ่อมเปลี่ยนเหล็กกล่อง ขนาด 1x1 หนา 2.3 มม. งานราวกันตก', unit: 'ม.', rate: 80, condition: 'all', auto: null },
    { id: 'pdf-1.1.11.3', code: '1.1.11.3', name: 'ซ่อมเปลี่ยนเสาเหล็ก ขนาดท่อเหล็กกลมดำ 4 นิ้ว หนา 2.3 มม. งานราวกันตก', unit: 'ม.', rate: 290, condition: 'all', auto: null },
    { id: 'pdf-1.1.12.1', code: '1.1.12.1', name: 'รางน้ำฝนสแตนเลส ขนาด 4 นิ้ว ตะขอสแตนเลสแท้ พร้อมติดตั้ง', unit: 'ม.', rate: 700, condition: 'roof', auto: null },
    { id: 'pdf-1.1.12.2', code: '1.1.12.2', name: 'ท่อระบายน้ำฝนสังกะสี ขนาด 4 นิ้ว พร้อมติดตั้ง', unit: 'ม.', rate: 500, condition: 'roof', auto: null },
    { id: 'pdf-1.1.13.1', code: '1.1.13.1', name: 'โคมไฟกันน้ำกันฝุ่น 1x36W พร้อมอุปกรณ์ครบชุด', unit: 'ชุด', rate: 750, condition: 'all', auto: null },
    { id: 'pdf-1.1.13.2', code: '1.1.13.2', name: 'สายไฟฟ้า 60227 IEC01 THW แรงดัน 450/750 โวลท์ ขนาด 1 x 2.5 ตร.มม.', unit: 'ม.', rate: 40, condition: 'all', auto: null },
    { id: 'pdf-1.1.13.3', code: '1.1.13.3', name: 'ท่อเหล็กร้อยสายไฟ ชนิดหนา RSC ขนาดเส้นผ่านศูนย์กลาง 1/2 นิ้ว', unit: 'ม.', rate: 120, condition: 'all', auto: null }
  ];
  root.BRIDGE_WORK_CATALOG = Object.freeze(catalog);
  root.BRIDGE_WORK_BY_ID = Object.freeze(Object.fromEntries(catalog.map(item => [item.id, item])));
}(window));
