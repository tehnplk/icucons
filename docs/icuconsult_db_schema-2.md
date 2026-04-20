# icuconsult_db_schema

## provider
table : `provider`  
data  : เก็บข้อมูลผู้ให้บริการทางการแพทย์

| # | column | data_define | choice |
|---|---|---|---|
| 1 | id | รหัสผู้ให้บริการ | - |
| 2 | provider_code | รหัสผู้ให้บริการเดิมจากระบบต้นทาง | - |
| 3 | title | คำนำหน้าชื่อผู้ให้บริการ | (Dr., RN)
| 4 | first_name | ชื่อผู้ให้บริการ | - |
| 5 | last_name | นามสกุลผู้ให้บริการ | - |
| 6 | specialty | ความเชี่ยวชาญหรือสาขาของผู้ให้บริการ | {General Practitioner(GP), Internal Medicine, Cardiology, Critical Care Medicine, Endocrinology, Gastroenterology, Geriatric Medicine, Hematology, Infectious Disease, Medical Oncology, Nephrology, Pulmonary Disease, Rheumatology, Anesthesiology, Dermatology, Emergency Medicine, Family Medicine, Obstetrics and Gynecology, Ophthalmology, Orthopaedics Surgery, Otolaryngology, Pathology, Pediatrics, Physical Medicine and Rehabilitation, Plastic Surgery, Preventive Medicine, Psychiatry, Neurology, Radiology, General Surgery, Vascular Surgery, Thoracic and Cardiac Surgery, Urology}
| 7 | hospital | ชื่อสถานพยาบาลต้นสังกัดของผู้ให้บริการ | (โรงพยาบาลพุทธชินราช พิษณุโลก, โรงพยาบาลวังทอง, โรงพยาบาลวัดโบสถ์, โรงพยาบาลพรหมพิราม, โรงพยาบาลบางระกำ, โรงพยาบาลบางกระทุ่ม, โรงพยาบาลเนินมะปราง, โรงพยาบาลสมเด็จพระยุพราชนครไทย, โรงพยาบาลชาติตระการ)
| 8 | email | อีเมลผู้ให้บริการ | - |
| 9 | avatar_url | ที่อยู่รูปโปรไฟล์ของผู้ให้บริการ | - |
| 10 | phone_number | หมายเลขโทรศัพท์ผู้ให้บริการ | - |
| 11 | license | เลขใบประกอบวิชาชีพ | - |
| 12 | is_accepting_cases | สถานะการรับเคส | (Yes, No)
| 13 | is_accepting_notifications | สถานะการรับการแจ้งเตือน | (Yes, No) |
| 14 | status | สถานะการใช้งานของผู้ให้บริการ | (online, offline)
| 15 | notif_prefs | ค่าการตั้งค่าการแจ้งเตือนของผู้ให้บริการ | - |

note :
- type : master table
- relate_master : ไม่มี

## patient
table : `patient`  
data  : เก็บข้อมูลหลักของผู้ป่วย

| # | column | data_define | choice |
|---|---|---|---|
| 1 | id | รหัสผู้ป่วย | - |
| 2 | hoscode | รหัสสถานพยาบาลของผู้ป่วย | - |
| 3 | pid | CID สำหรับคนไทย หรือ Passport สำหรับต่างด้าว | - |
| 4 | hn | เลข HN ผู้ป่วย | - |
| 5 | an | เลข AN ผู้ป่วย | - |
| 6 | admit_date | วันที่รับเข้า | - |
| 7 | admit_time | เวลารับเข้า | - |
| 8 | pre_name | คำนำหน้าชื่อ | (นาย, นาง, นางสาว)
| 9 | first_name | ชื่อผู้ป่วย | - |
| 10 | last_name | นามสกุลผู้ป่วย | - |
| 11 | gender | เพศผู้ป่วย | (ชาย, หญิง)
| 12 | birth_date | วันเกิดผู้ป่วย | - |
| 13 | phone_number | หมายเลขโทรศัพท์ผู้ป่วย | - |
| 14 | district | อำเภอของผู้ป่วย | - |
| 15 | province | จังหวัดของผู้ป่วย | - |
| 16 | blood_type | หมู่เลือดผู้ป่วย | {A Rh positive, A Rh negative, B Rh positive, B Rh negative, AB Rh positive, AB Rh negative, O Rh positive, O Rh negative}
| 17 | discharge_date | วันที่จำหน่าย | - |
| 18 | discharge_time | เวลาจำหน่าย | - |
| 19 | discharge_type | ประเภทการจำหน่าย | (Dead, Refer, Discharge with approval, By escape, Against advice)
| 20 | discharge_note | หมายเหตุการจำหน่าย | - |

note :
- type : master table
- relate_master : hospital.hoscode -> patient.hoscode

## case_register
table : `case_register`  
data  : เก็บข้อมูลการลงทะเบียนเคสของผู้ป่วย

| # | column | data_define | choice |
|---|---|---|---|
| 1 | id | รหัสรายการลงทะเบียนเคส | - |
| 2 | patient_id | รหัสผู้ป่วย | - |
| 3 | record_date | วันที่ลงทะเบียนเคส | - |
| 4 | record_time | เวลาลงทะเบียนเคส | - |
| 5 | status | สถานะเคส | - |
| 6 | priority | ระดับความเร่งด่วน | (Immediate Life-Threatening, Emergency, Urgency, Semi-urgency, Non-urgency)
| 7 | specialty | สาขาที่ขอปรึกษา | {General Practitioner(GP), Internal Medicine, Cardiology, Critical Care Medicine, Endocrinology, Gastroenterology, Geriatric Medicine, Hematology, Infectious Disease, Medical Oncology, Nephrology, Pulmonary Disease, Rheumatology, Anesthesiology, Dermatology, Emergency Medicine, Family Medicine, Obstetrics and Gynecology, Ophthalmology, Orthopaedics Surgery, Otolaryngology, Pathology, Pediatrics, Physical Medicine and Rehabilitation, Plastic Surgery, Preventive Medicine, Psychiatry, Neurology, Radiology, General Surgery, Vascular Surgery, Thoracic and Cardiac Surgery, Urology}
| 8 | reason | เหตุผลในการส่งปรึกษา | {for proper management} 
| 9 | current_symptoms | อาการปัจจุบัน | - |
| 10 | initial_diagnosis | การวินิจฉัยเบื้องต้น | - |
| 11 | clinical_notes | บันทึกทางคลินิก | - |
| 12 | sender_id | รหัสผู้ส่งเคส | - |
| 13 | last_action | การกระทำล่าสุดของเคส | - |
| 14 | last_active_time | เวลาที่เคสมีความเคลื่อนไหวล่าสุด | - |

note :
- type : child table
- relate_master : patient.id -> case_register.patient_id

## case_close
table : `case_close`  
data  : เก็บข้อมูลการปิดเคสของผู้ป่วย

| # | column | data_define | choice |
|---|---|---|---|
| 1 | id | รหัสรายการปิดเคส | - |
| 2 | patient_id | รหัสผู้ป่วย | - |
| 3 | close_date | วันที่ปิดเคส | - |
| 4 | close_time | เวลาปิดเคส | - |
| 5 | close_type | ประเภทการปิดเคส | - |
| 6 | close_note | หมายเหตุการปิดเคส | - |

note :
- type : child table
- relate_master : patient.id -> case_close.patient_id

## case_file
table : `case_file`  
data  : เก็บไฟล์เอกสารหรือรูปภาพที่แนบกับเคสของผู้ป่วย

| # | column | data_define | choice |
|---|---|---|---|
| 1 | id | รหัสรายการไฟล์ | - |
| 2 | patient_id | รหัสผู้ป่วย | - |
| 3 | file_date | วันที่อัปโหลดไฟล์ | - |
| 4 | file_time | เวลาอัปโหลดไฟล์ | - |
| 5 | privder_id_do_file | รหัสผู้ให้บริการที่อัปโหลดไฟล์ | - |
| 6 | file_name | ชื่อไฟล์ | - |
| 7 | file_type | ประเภทไฟล์ | - |
| 8 | category | หมวดหมู่ไฟล์ | - |
| 9 | mime_type | ชนิด MIME ของไฟล์ | - |
| 10 | file_url | ตำแหน่งเก็บไฟล์หรือ URL ของไฟล์ | - |
| 11 | size_kb | ขนาดไฟล์หน่วยกิโลไบต์ | - |
| 12 | description | คำอธิบายไฟล์ | - |
| 13 | is_previewable | สถานะว่าสามารถแสดงตัวอย่างไฟล์ได้หรือไม่ | - |

note :
- type : child table
- relate_master : patient.id -> case_file.patient_id, provider.id -> case_file.privder_id_do_file

## case_lab
table : `case_lab`  
data  : เก็บผลตรวจทางห้องปฏิบัติการของผู้ป่วย

| # | column | data_define | choice |
|---|---|---|---|
| 1 | id | รหัสรายการผลแล็บ | - |
| 2 | patient_id | รหัสผู้ป่วย | - |
| 3 | lab_date | วันที่ตรวจแล็บ | - |
| 4 | lab_time | เวลาตรวจแล็บ | - |
| 5 | name | ชื่อรายการตรวจ | - |
| 6 | result | ผลตรวจ | - |
| 7 | unit | หน่วยของผลตรวจ | - |
| 8 | ref_range | ช่วงค่าอ้างอิง | - |
| 9 | status | สถานะผลตรวจ | - |
| 10 | note | หมายเหตุเพิ่มเติมของผลตรวจ | - |

note :
- type : child table
- relate_master : patient.id -> case_lab.patient_id

## case_medication
table : `case_medication`  
data  : เก็บรายการยาที่ผู้ป่วยได้รับ

| # | column | data_define | choice |
|---|---|---|---|
| 1 | id | รหัสรายการยา | - |
| 2 | patient_id | รหัสผู้ป่วย | - |
| 3 | start_date | วันที่เริ่มให้ยา | - |
| 4 | start_time | เวลาเริ่มให้ยา | - |
| 5 | name | ชื่อยา | - |
| 6 | dose | ขนาดยา | - |
| 7 | freq | ความถี่ในการให้ยา | - |
| 8 | route | วิธีการให้ยา | - |
| 9 | category | หมวดหมู่ยา | - |
| 10 | note | หมายเหตุเพิ่มเติมของยา | - |

note :
- type : child table
- relate_master : patient.id -> case_medication.patient_id

## case_message
table : `case_message`  
data  : เก็บข้อความสนทนาในเคสของผู้ป่วย

| # | column | data_define | choice |
|---|---|---|---|
| 1 | id | รหัสข้อความ | - |
| 2 | patient_id | รหัสผู้ป่วย | - |
| 3 | record_date | วันที่บันทึกข้อความ | - |
| 4 | record_time | เวลาบันทึกข้อความ | - |
| 5 | sender_id | รหัสผู้ส่งข้อความ | - |
| 6 | sender_name | ชื่อผู้ส่งข้อความ | - |
| 7 | text | เนื้อหาข้อความ | - |
| 8 | is_self | สถานะว่าเป็นข้อความจากผู้ใช้งานปัจจุบันหรือไม่ | - |
| 9 | is_system | สถานะว่าเป็นข้อความจากระบบหรือไม่ | - |

note :
- type : child table
- relate_master : patient.id -> case_message.patient_id

## case_note
table : `case_note`  
data  : เก็บบันทึกข้อความหรือโน้ตในเคสของผู้ป่วย

| # | column | data_define | choice |
|---|---|---|---|
| 1 | id | รหัสบันทึกโน้ต | - |
| 2 | patient_id | รหัสผู้ป่วย | - |
| 3 | record_date | วันที่บันทึกโน้ต | - |
| 4 | record_time | เวลาบันทึกโน้ต | - |
| 5 | provider_id_do_note | รหัสผู้ให้บริการที่บันทึกโน้ต | - |
| 6 | color | สีที่ใช้แสดงโน้ต | - |
| 7 | note_text | ข้อความโน้ต | - |

note :
- type : child table
- relate_master : patient.id -> case_note.patient_id, provider.id -> case_note.provider_id_do_note

## case_team
table : `case_team`  
data  : เก็บข้อมูลทีมผู้ให้บริการที่ได้รับมอบหมายให้ดูแลผู้ป่วย

| # | column | data_define | choice |
|---|---|---|---|
| 1 | id | รหัสรายการทีมดูแล | - |
| 2 | patient_id | รหัสผู้ป่วย | - |
| 3 | provider_id | รหัสผู้ให้บริการ | - |
| 4 | role | บทบาทของผู้ให้บริการในทีมดูแล | - |
| 5 | assign_date | วันที่มอบหมายงาน | - |
| 6 | assign_time | เวลามอบหมายงาน | - |

note :
- type : child table
- relate_master : patient.id -> case_team.patient_id, provider.id -> case_team.provider_id

## case_vital
table : `case_vital`  
data  : เก็บข้อมูลสัญญาณชีพของผู้ป่วย

| # | column | data_define | choice |
|---|---|---|---|
| 1 | id | รหัสรายการสัญญาณชีพ | - |
| 2 | patient_id | รหัสผู้ป่วย | - |
| 3 | record_date | วันที่บันทึกสัญญาณชีพ | - |
| 4 | record_time | เวลาบันทึกสัญญาณชีพ | - |
| 5 | bp | ความดันโลหิต | - |
| 6 | hr | ชีพจร | - |
| 7 | temp | อุณหภูมิร่างกาย | - |
| 8 | rr | อัตราการหายใจ | - |
| 9 | spo2 | ค่าออกซิเจนปลายนิ้ว | - |
| 10 | gcs | ระดับความรู้สึกตัว GCS | - |

note :
- type : child table
- relate_master : patient.id -> case_vital.patient_id

## hospital
table : `hospital`  
data  : เก็บข้อมูลสถานพยาบาล

| # | column | data_define | choice |
|---|---|---|---|
| 1 | id | รหัสสถานพยาบาล | - |
| 2 | hoscode | รหัสสถานพยาบาล | - |
| 3 | hosname | ชื่อสถานพยาบาล | - |
| 4 | hostype | ประเภทสถานพยาบาล | - |
| 5 | is_active | สถานะการใช้งาน | - |

note :
- type : master table
- relate_master : ไม่มี

## notification
table : `notification`  
data  : เก็บข้อมูลการแจ้งเตือนของผู้ให้บริการในระบบ

| # | column | data_define | choice |
|---|---|---|---|
| 1 | id | รหัสรายการแจ้งเตือน | - |
| 2 | provider_id | รหัสผู้ให้บริการที่ได้รับแจ้งเตือน | - |
| 3 | notify_date | วันที่แจ้งเตือน | - |
| 4 | notify_time | เวลาแจ้งเตือน | - |
| 5 | title | หัวข้อแจ้งเตือน | - |
| 6 | message | เนื้อหาการแจ้งเตือน | - |
| 7 | is_read | สถานะการอ่านแจ้งเตือน | - |
| 8 | type | ประเภทการแจ้งเตือน | - |

note :
- type : child table
- relate_master : provider.id -> notification.provider_id

## activity
table : `activity`  
data  : เก็บประวัติกิจกรรมที่เกิดขึ้นในระบบ

| # | column | data_define | choice |
|---|---|---|---|
| 1 | id | รหัสรายการกิจกรรม | - |
| 2 | activity_date | วันที่เกิดกิจกรรม | - |
| 3 | activity_time | เวลาที่เกิดกิจกรรม | - |
| 4 | title | หัวข้อกิจกรรม | - |
| 5 | description | คำอธิบายกิจกรรม | - |
| 6 | detail | รายละเอียดเพิ่มเติมของกิจกรรม | - |
| 7 | icon | ไอคอนที่ใช้แสดงกิจกรรม | - |

note :
- type : standalone table
- relate_master : ไม่มี

## patient_allergy
table : `patient_allergy`  
data  : เก็บรายการประวัติการแพ้ของผู้ป่วย

| # | column | data_define | choice |
|---|---|---|---|
| 1 | id | รหัสรายการประวัติแพ้ | - |
| 2 | patient_id | รหัสผู้ป่วย | - |
| 3 | allergy_name | ชื่อสิ่งที่แพ้ | - |
| 4 | item_order | ลำดับการแสดงผล | - |

note :
- type : child table
- relate_master : patient.id -> patient_allergy.patient_id

## patient_condition
table : `patient_condition`  
data  : เก็บรายการโรคประจำตัวหรือภาวะสำคัญของผู้ป่วย

| # | column | data_define | choice |
|---|---|---|---|
| 1 | id | รหัสรายการโรคประจำตัว | - |
| 2 | patient_id | รหัสผู้ป่วย | - |
| 3 | condition_name | ชื่อโรคประจำตัวหรือภาวะสำคัญ | - |
| 4 | item_order | ลำดับการแสดงผล | - |

note :
- type : child table
- relate_master : patient.id -> patient_condition.patient_id
