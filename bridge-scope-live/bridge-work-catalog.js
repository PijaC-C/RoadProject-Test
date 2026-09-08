/*
 * รายการเนื้องานและราคาต่อหน่วยจาก
 * ราคาพื้นฐานจาก "ราคางานจัดซ่อมสะพานคนเดินข้ามถนน ประมาณก.pdf" (แผ่นที่ 1-2)
 * และราคาต่อหน่วยที่มีรายการตรงกันอัปเดตจาก
 * "สะพานลอยคนชุดที่ 2 6 เขต 27-8-2569.xlsx" แท็บ "ปร.4 ชุดที่2 7-9-69"
 *
 * ปริมาณใน PDF เป็นยอดรวมของ 4 สะพาน ไม่ใช่ปริมาณรายรหัสสะพาน
 * จึงเก็บเฉพาะรายการ/หน่วย/ราคาต่อหน่วยไว้เป็นฐานให้ผู้สำรวจเลือกและกรอก
 * ปริมาณรายสะพานในเครื่องคำนวณ โดยรายการที่มีฐานจากข้อมูลสำรวจจะเติมให้
 * อัตโนมัติและยังเปิดให้ผู้สำรวจแก้เป็น Hard fill ได้
 *
 * รหัสที่แสดงในหน้าเว็บเรียงใหม่เป็น 1, 2, 3, ... เพื่อกรอกและอ้างอิงง่าย
 */
(function (root) {
  const catalog = [
    { id: 'pdf-1.1.1', code: '1', name: 'เคลือบทับหน้ากันลื่นพื้นสะพานด้วยวัสดุ Polyurethane', unit: 'ตร.ม.', rate: 570.75, condition: 'concrete', auto: 'concreteTop' },
    { id: 'pdf-1.1.2', code: '2', name: 'งานซ่อมรอยแตกร้าวคอนกรีตโครงสร้างด้วย High Strength Mortar', unit: 'ตร.ม.', rate: 4224.71, condition: 'concrete', auto: null },
    { id: 'pdf-1.1.3', code: '3', name: 'ฉาบพื้นผิวสะพานด้วย High Strength Mortar', unit: 'ตร.ม.', rate: 1238.6, condition: 'concrete', auto: 'concretePaint' },
    { id: 'pdf-1.1.4', code: '4', name: 'ทาสีสะพานส่วนที่เป็นคอนกรีต', unit: 'ตร.ม.', rate: 92.02, condition: 'concrete', auto: 'concretePaint' },
    { id: 'pdf-1.1.5', code: '5', name: 'ตีเส้นแบ่งช่องทางเดินบนสะพานและบันได', unit: 'ตร.ม.', rate: 95.5, condition: 'all', auto: 'marking' },
    { id: 'pdf-1.1.6.1', code: '6', name: 'ปรับปรุงซ่อมแซมท่อน้ำทิ้ง PVC ขนาด 4 นิ้ว', unit: 'ม.', rate: 860, condition: 'all', auto: 'drainHeight' },
    { id: 'pdf-1.1.6.2', code: '7', name: 'ตะแกรงรังผึ้งสแตนเลส ขนาด 4 นิ้ว', unit: 'ชุด', rate: 50, condition: 'all', auto: null },
    { id: 'pdf-1.1.7', code: '8', name: 'งานขูดลอกสีเดิม', unit: 'ตร.ม.', rate: 10, condition: 'steel', auto: 'paint' },
    { id: 'pdf-1.1.8', code: '9', name: 'งานทาสีน้ำมันกันสนิมเหล็ก (รองพื้นกันสนิม+สีน้ำมัน 2 เที่ยว)', unit: 'ตร.ม.', rate: 95, condition: 'steel', auto: 'paint' },
    { id: 'pdf-1.1.9', code: '10', name: 'งานติดตั้งป้ายจำกัดความสูง', unit: 'ชุด', rate: 1200, condition: 'all', auto: null },
    { id: 'pdf-1.1.10.1', code: '11', name: 'รื้อถอนพร้อมติดตั้งแผ่นเรียบไฟเบอร์ซีเมนต์ หนา 10 มม. พร้อมทาสี', unit: 'ตร.ม.', rate: 490, condition: 'roof', auto: null },
    { id: 'pdf-1.1.10.2', code: '12', name: 'รื้อถอนพร้อมติดตั้งวัสดุมุงหลังคาเมทัลชีท', unit: 'ตร.ม.', rate: 390, condition: 'roof', auto: null },
    { id: 'pdf-1.1.10.3', code: '13', name: 'ซ่อมแซมโครงเหล็กหลังคา เหล็กแผ่นเรียบดำ หนา 2 มม.', unit: 'ตร.ม.', rate: 760, condition: 'roof', auto: null },
    { id: 'pdf-1.1.11.1', code: '14', name: 'งาน Grout plate', unit: 'จุด', rate: 600, condition: 'all', auto: null },
    { id: 'pdf-1.1.11.2', code: '15', name: 'ซ่อมเปลี่ยนเหล็กกล่อง ขนาด 1x1 หนา 2.3 มม. งานราวกันตก', unit: 'ม.', rate: 80, condition: 'all', auto: null },
    { id: 'pdf-1.1.11.3', code: '16', name: 'ซ่อมเปลี่ยนเสาเหล็ก ขนาดท่อเหล็กกลมดำ 4 นิ้ว หนา 2.3 มม. งานราวกันตก', unit: 'ม.', rate: 290, condition: 'all', auto: null },
    { id: 'pdf-1.1.12.1', code: '17', name: 'รางน้ำฝนสแตนเลส ขนาด 4 นิ้ว ตะขอสแตนเลสแท้ พร้อมติดตั้ง', unit: 'ม.', rate: 700, condition: 'roof', auto: null },
    { id: 'pdf-1.1.12.2', code: '18', name: 'ท่อระบายน้ำฝนสังกะสี ขนาด 4 นิ้ว พร้อมติดตั้ง', unit: 'ม.', rate: 500, condition: 'roof', auto: null },
    { id: 'work-electrical-repair', code: '19', name: 'งานซ่อมระบบไฟฟ้า', unit: 'ม.', rate: 211, condition: 'all', auto: null },
    { id: 'work-expansion-joint', code: '20', name: 'งานซ่อมรอยต่อสะพาน', unit: 'ม.', rate: 1328, condition: 'all', auto: null }
  ];
  root.BRIDGE_WORK_CATALOG = Object.freeze(catalog);
  root.BRIDGE_WORK_BY_ID = Object.freeze(Object.fromEntries(catalog.map(item => [item.id, item])));
}(window));
