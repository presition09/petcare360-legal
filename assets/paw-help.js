/* PetCare AI 360 · Paw Support — the app's own help text and matchers (no AI) · built 2026-11-02 by scripts/site/build-site.mjs */
(()=>{const S={"paw-help-web":function(require,module,exports){
// Paw Support on the web page (2 Nov 2569 · boss: "ไม่มีช่องแชท มีแค่เมนูให้เลือก … ถามตอบข้อมูลหน้าเว็บ การใช้งาน ข้อมูลอื่นๆไม่ได้เลย").
// A typed question goes through the app's own free chat (lib/smartBot · getSmartBotReply, no AI, no server, no cost) —
// the same answers and the same health limits as the app: red flags and symptoms → a veterinarian, food safety with
// sources, how to use the app. This file only adds what a web visitor needs: facts about the site and the download, and
// a pointer to the app for anything about one pet's own records (the web has no pet data).
// build-site.mjs bundles it with the compiled Smart Bot into assets/paw-help.js (loaded when the panel opens);
// scripts/site/paw-help-web.test.mjs runs that bundle. Plain CommonJS: the bundle gives each module `require`.
const { getSmartBotReply } = require('./index');
const { APP_HELP_CONTENT } = require('./appHelpContent');

/** the buttons under "หนูช่วยอะไรได้บ้าง" — the first four are the ones the panel always showed */
const MENU_TOPICS = ['add_pet', 'medicine', 'reminder_troubleshoot', 'paw_coin', 'vaccine', 'appointments', 'buddy', 'app_overview'];
/** what the visitor typed means this topic, when the app's chat asks back instead ("paw coin คืออะไร") */
const NAMED_TOPICS = [
  [/paw\s?coin|เหรียญ/i, 'paw_coin'],
  [/สมาชิก|membership/i, 'membership'],
  [/เพื่อนซี้|น้องลอย|buddy/i, 'buddy'],
  [/ความเป็นส่วนตัว|privacy|ข้อมูล.{0,12}(ปลอดภัย|รั่ว|ใคร(เห็น|ดู))|เก็บข้อมูล/i, 'privacy'],
  [/(petcare|เพ็ทแคร์|แอป(นี้)?)\s*(คือ|คืออะไร|ทำอะไร|มีอะไร|ใช้ทำอะไร)/i, 'app_overview'],
];
const ANDROID = /แอนดรอยด์|android|play\s?store|เพลย์\s?สโตร์|google\s?play|กูเกิล\s?เพลย์/i;
const DOWNLOAD = /ดาวน์?โหลด|โหลดแอป|ติดตั้ง|ลงแอป|หาแอป|ลิงก์แอป|app\s?store|แอปสโตร์|ไอโฟน|iphone|ไอแพด|ipad|\bios\b/i;
const TROUBLE = /ไม่ได้|ไม่ขึ้น|ค้าง|error|เด้ง|พัง/i;
const GREET = /^(สวัสดี|หวัดดี|ดีจ้า|hello\b|hi\b|hey\b)/i;
const PRICE = /ราคา|กี่บาท|เสียเงิน|ค่าใช้จ่าย|ค่าบริการ|ค่าสมาชิก|ฟรี\s*(ไหม|มั้ย|หรือเปล่า|รึเปล่า|ป่ะ|จริงไหม)|ใช้ฟรี|แพ็กเกจ|แพคเกจ/i;
const SITE_Q = /เว็บ|website|หน้านี้/i;
const CONTACT = /ติดต่อ|อีเมล|อีเมล์|e-?mail|เบอร์|โทร(ศัพท์)?|คุยกับ\s*(คน|ทีมงาน|แอดมิน|เจ้าหน้าที่)|แอดมิน|ทีมงาน/i;

const topicText = (id) => {
  const [title, ...rest] = APP_HELP_CONTENT[id].th.split('\n');
  return `**${title}**\n${rest.join('\n').trim()}`;
};
/** a help topic for a button: { id, title, text } */
function topic(id) {
  const c = APP_HELP_CONTENT[id];
  return c ? { id, title: c.th.split('\n')[0], text: topicText(id) } : null;
}
const menu = (text) => ({ kind: 'menu', text, topics: MENU_TOPICS });

function helpTopic(id) {
  // the reset email may not reach people yet (custom SMTP · docs/PreLaunch-Plan-2569-10-28.md §3) → the team
  if (id === 'password_reset')
    return { kind: 'help', text: 'ถ้าลืมรหัสผ่านแล้วไม่ได้รับอีเมลตั้งรหัสใหม่ แตะ "ส่งอีเมลหาทีมงาน" ด้านล่างได้เลยค่ะ ทีมงานจะช่วยดูให้', mail: true };
  // the steps live on the contact page (store / PDPA rules) — answered with that link, not promoted here (boss 31 Oct)
  if (id === 'account_delete')
    return { kind: 'help', text: 'วิธีลบบัญชีและข้อมูล อยู่ที่หน้า ติดต่อ / ลบบัญชี ค่ะ', link: { href: 'contact/', label: 'เปิดหน้า ติดต่อ / ลบบัญชี' } };
  if (!APP_HELP_CONTENT[id]) return null;
  return { kind: 'help', text: topicText(id), ...(id === 'privacy' ? { link: { href: 'privacy/', label: 'อ่านนโยบายความเป็นส่วนตัว' } } : {}) };
}

function siteFact(q, site) {
  if (ANDROID.test(q))
    return { kind: 'site', text: 'ตอนนี้ PetCare AI 360 มีให้ดาวน์โหลดบน App Store สำหรับ iPhone (ประเทศไทย) ค่ะ ยังไม่มีใน Google Play\nมีคำถามเพิ่มเติม ส่งอีเมลหาทีมงานได้เลยนะคะ', mail: true };
  if (DOWNLOAD.test(q) && TROUBLE.test(q))
    return { kind: 'site', text: 'แอปอยู่บน App Store ประเทศไทย สำหรับ iPhone ค่ะ ถ้าหาไม่เจอหรือโหลดไม่ได้ ลองเช็กว่าบัญชี App Store ตั้งประเทศเป็นไทย แล้วแตะปุ่มด้านล่าง ถ้ายังไม่ได้ แตะ "ส่งอีเมลหาทีมงาน" ได้เลยนะคะ', link: { href: site.appStoreUrl, label: 'เปิด App Store' }, mail: true };
  if (DOWNLOAD.test(q))
    return { kind: 'site', text: 'ดาวน์โหลดฟรีบน App Store สำหรับ iPhone (ประเทศไทย) ค่ะ แตะปุ่มด้านล่างได้เลย', link: { href: site.appStoreUrl, label: 'เปิด App Store' } };
  if (GREET.test(q) && q.length <= 24) return menu('สวัสดีค่ะ 🙏 หนูน้องพอว์ ช่วยบอกวิธีใช้แอปและตอบเรื่องบนเว็บนี้ได้ค่ะ พิมพ์ถามได้เลย หรือเลือกหัวข้อด้านล่าง');
  if (PRICE.test(q))
    return { kind: 'site', text: 'ดาวน์โหลดแอปฟรีค่ะ ส่วนสมาชิก PetCare AI 360 และ Paw Coin ดูรายละเอียดได้ในแอป: ที่ Home แตะการ์ด PetCare AI 360 ด้านบน หรือแตะรูปหรือชื่อบัญชี > สมาชิก PetCare AI 360', topics: ['paw_coin'] };
  const named = NAMED_TOPICS.find(([re]) => re.test(q));
  if (named) return helpTopic(named[1]);
  if (SITE_Q.test(q))
    return { kind: 'site', text: 'เว็บนี้แนะนำแอป PetCare AI 360 ค่ะ ข้อมูลบนเว็บดึงมาจากแอปจริง ลองได้เลย:\n• จอมือถือจำลองด้านบน กดได้เหมือนแอป\n• ลองถามน้องพอว์ (ตัวอย่างคำตอบจากแชตธรรมดา)\n• ตารางวัคซีนตามอายุน้อง\n• เลือกเพื่อนน้องมาเดินเล่นบนหน้าเว็บ\n• คำถามพบบ่อย\nนโยบายความเป็นส่วนตัว ข้อกำหนด และติดต่อ อยู่ท้ายเว็บค่ะ' };
  if (CONTACT.test(q)) return { kind: 'site', text: 'ติดต่อทีมงานทางอีเมลได้เลยค่ะ แตะ "ส่งอีเมลหาทีมงาน" ด้านล่าง แล้วเล่าเรื่องที่อยากถามหรือปัญหาที่เจอ', mail: true };
  return null;
}

/**
 * One typed question → { kind, text, topics?, link?, mail?, sources? }
 *   text   — may hold **bold** (the page renders it) · sources = URLs shown under the answer
 *   topics — help-topic ids to offer as buttons · link = { href, label } · mail = point to "ส่งอีเมลหาทีมงาน"
 * @param {string} raw
 * @param {{ appStoreUrl: string }} site
 */
function answer(raw, site) {
  const q = String(raw || '').normalize('NFC').replace(/\s+/g, ' ').trim().slice(0, 300);
  if (!q) return null;
  let r = null;
  try { r = getSmartBotReply(q, null, { language: 'th', petNames: [] }); } catch { r = null; }
  const kind = r?.kind;
  // health, food, red flags, guidance: the app's own answer as it is — the web never words these itself
  if (r && kind !== 'app_info' && kind !== 'records' && kind !== 'no_data' && kind !== 'handoff' && kind !== 'smalltalk')
    return { kind: kind === 'emergency' || kind === 'human_safety' ? 'emergency' : kind, text: r.text, ...(r.sources?.length ? { sources: r.sources } : {}) };
  const fact = siteFact(q, site);
  if (fact) return fact;
  if (kind === 'app_info') {
    const id = String(r.intent || '').replace(/^app_help:/, '');
    const t = id !== 'clarify' && helpTopic(id);
    if (t) return t;
    return menu('หนูช่วยบอกวิธีใช้แอปได้ค่ะ เลือกเรื่องที่อยากรู้ด้านล่าง หรือพิมพ์ถามให้ละเอียดขึ้นอีกนิดได้เลย');
  }
  if (kind === 'records' || kind === 'no_data')
    return { kind: 'app', text: 'ข้อมูลของน้องแต่ละตัว (ยา น้ำหนัก วัคซีน นัดหมาย) อยู่ในแอปค่ะ เปิดแอปแล้วถามในแชตธรรมดา น้องพอว์จะตอบจากบันทึกของน้องให้', link: { href: site.appStoreUrl, label: 'ดาวน์โหลดบน App Store' } };
  if (kind === 'smalltalk') return { kind: 'smalltalk', text: r.text };
  return { kind: 'unknown', text: 'ขออภัยค่ะ หนูยังตอบเรื่องนี้ไม่ได้ หนูตอบได้เรื่องวิธีใช้แอปและเว็บนี้ ลองเลือกหัวข้อด้านล่าง หรือแตะ "ส่งอีเมลหาทีมงาน" ได้เลยค่ะ', topics: MENU_TOPICS.slice(0, 4), mail: true };
}

module.exports = { answer, topic, MENU_TOPICS };

},
"index":function(require,module,exports){
"use strict";
// lib/smartBot/index.ts
// ─────────────────────────────────────────────────────────────────────────
// Smart Bot — โหมดแชตฟรี (0 Paw)
//
// ⚠️ สัญญา 3 ข้อของไฟล์นี้ ห้ามผิด:
//   1) ออฟไลน์ 100% — ห้าม import อะไรที่ยิงเน็ต ห้ามเรียก LLM ห้ามหัก Pew
//   2) deterministic — input เดิม ต้องได้ output เดิมทุกครั้ง (ไม่มีสุ่ม ไม่มีเวลาเข้ามาปน
//      ยกเว้นการเทียบวันที่ของบันทึกจริง)
//   3) ไม่มั่นใจ = ส่งต่อ ไม่ใช่เดา
//
// ลำดับการทำงาน (สำคัญมาก — เรียงตาม "พลาดแล้วเสียหายที่สุดก่อน"):
//   1. ฉุกเฉิน   — ต้องมาก่อนทุกอย่าง แม้แต่กำแพงกันตอบ
//   2. กำแพงกัน  — วินิจฉัย/ขนาดยา/หยุดยา/ยาคน/ตารางวัคซีน/รักษาเอง
//   3. อาหาร     — ตารางที่มี source ทุกแถว
//   4. บันทึก    — น้ำหนัก ยา วัคซีน นัด กิจกรรม ประวัติ
//   5. ทักทาย
//   6. ส่งต่อ Agent
// ─────────────────────────────────────────────────────────────────────────
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EMPTY_NUDGE_STATE = exports.nudgeCopy = exports.isHighValueQuestion = exports.rollNudgeState = exports.decideNudge = exports.matchIntent = exports.isGeneralFoodQuestion = exports.matchFoods = exports.matchGuard = exports.SERVICE_RULES = exports.matchService = exports.isCostQuestion = exports.KNOWLEDGE_RULES = exports.matchKnowledge = exports.BEHAVIOR_RULES = exports.matchBehavior = exports.TRIAGE_RULES = exports.matchTriage = exports.matchRedFlag = exports.matchHumanSafety = exports.matchEmergency = void 0;
exports.getSmartBotReply = getSmartBotReply;
const english_1 = require("./english");
const humanSafety_1 = require("./humanSafety");
const emergency_1 = require("./emergency");
const redflags_1 = require("./redflags");
const triage_1 = require("./triage");
const behavior_1 = require("./behavior");
const knowledge_1 = require("./knowledge");
const riskBoundary_1 = require("./riskBoundary");
const compoundRecords_1 = require("./compoundRecords");
const clinicalDecision_1 = require("./clinicalDecision");
const catNightVocalization_1 = require("./catNightVocalization");
const feedingManagement_1 = require("./feedingManagement");
const catHouseholdCare_1 = require("./catHouseholdCare");
const socialSpeciesCare_1 = require("./socialSpeciesCare");
const costs_1 = require("./costs");
const services_1 = require("./services");
const appHelp_1 = require("./appHelp");
const guard_1 = require("./guard");
const food_1 = require("./food");
const intents_1 = require("./intents");
const petScope_1 = require("./petScope");
const careKnowledge_1 = require("./careKnowledge");
const medicalFallback_1 = require("./medicalFallback");
const socialConversation_1 = require("./socialConversation");
const otherSpecies_1 = require("./otherSpecies");
const seniorChange_1 = require("./seniorChange");
const answers_1 = require("./answers");
__exportStar(require("./types"), exports);
var emergency_2 = require("./emergency");
Object.defineProperty(exports, "matchEmergency", { enumerable: true, get: function () { return emergency_2.matchEmergency; } });
var humanSafety_2 = require("./humanSafety");
Object.defineProperty(exports, "matchHumanSafety", { enumerable: true, get: function () { return humanSafety_2.matchHumanSafety; } });
var redflags_2 = require("./redflags");
Object.defineProperty(exports, "matchRedFlag", { enumerable: true, get: function () { return redflags_2.matchRedFlag; } });
var triage_2 = require("./triage");
Object.defineProperty(exports, "matchTriage", { enumerable: true, get: function () { return triage_2.matchTriage; } });
Object.defineProperty(exports, "TRIAGE_RULES", { enumerable: true, get: function () { return triage_2.TRIAGE_RULES; } });
var behavior_2 = require("./behavior");
Object.defineProperty(exports, "matchBehavior", { enumerable: true, get: function () { return behavior_2.matchBehavior; } });
Object.defineProperty(exports, "BEHAVIOR_RULES", { enumerable: true, get: function () { return behavior_2.BEHAVIOR_RULES; } });
var knowledge_2 = require("./knowledge");
Object.defineProperty(exports, "matchKnowledge", { enumerable: true, get: function () { return knowledge_2.matchKnowledge; } });
Object.defineProperty(exports, "KNOWLEDGE_RULES", { enumerable: true, get: function () { return knowledge_2.KNOWLEDGE_RULES; } });
var costs_2 = require("./costs");
Object.defineProperty(exports, "isCostQuestion", { enumerable: true, get: function () { return costs_2.isCostQuestion; } });
var services_2 = require("./services");
Object.defineProperty(exports, "matchService", { enumerable: true, get: function () { return services_2.matchService; } });
Object.defineProperty(exports, "SERVICE_RULES", { enumerable: true, get: function () { return services_2.SERVICE_RULES; } });
var guard_2 = require("./guard");
Object.defineProperty(exports, "matchGuard", { enumerable: true, get: function () { return guard_2.matchGuard; } });
var food_2 = require("./food");
Object.defineProperty(exports, "matchFoods", { enumerable: true, get: function () { return food_2.matchFoods; } });
Object.defineProperty(exports, "isGeneralFoodQuestion", { enumerable: true, get: function () { return food_2.isGeneralFoodQuestion; } });
var intents_2 = require("./intents");
Object.defineProperty(exports, "matchIntent", { enumerable: true, get: function () { return intents_2.matchIntent; } });
var handoff_1 = require("./handoff");
Object.defineProperty(exports, "decideNudge", { enumerable: true, get: function () { return handoff_1.decideNudge; } });
Object.defineProperty(exports, "rollNudgeState", { enumerable: true, get: function () { return handoff_1.rollNudgeState; } });
Object.defineProperty(exports, "isHighValueQuestion", { enumerable: true, get: function () { return handoff_1.isHighValueQuestion; } });
Object.defineProperty(exports, "nudgeCopy", { enumerable: true, get: function () { return handoff_1.nudgeCopy; } });
Object.defineProperty(exports, "EMPTY_NUDGE_STATE", { enumerable: true, get: function () { return handoff_1.EMPTY_NUDGE_STATE; } });
/** ทักทาย/ขอบคุณ — ตอบเองได้ ไม่ต้องเปลือง Agent */
const GREETING = /^(สวัสดี|หวัดดี|ดีครับ|ดีค่ะ|hello|hi|hey|ว่าไง|โย่)/;
const THANKS = /(ขอบคุณ|ขอบใจ|thank|thx|ขอบคุณมาก)/;
/**
 * ⚠️ ทักทายต้องเป็นข้อความ "สั้น" เท่านั้น
 * เคสจริงที่เคยพลาด: "สวัสดีครับ คือตอนนี้ผมกังวลมากครับ … หมาผมโดนรถชน"
 * ขึ้นต้นด้วยคำทักทาย แต่เนื้อหาคือเหตุฉุกเฉิน → ห้ามตอบเป็นการทักทายเด็ดขาด
 */
const GREETING_MAX_LEN = 25;
/**
 * สัญญาณว่า "กินเข้าไปแล้ว" หรือ "กำลังตกใจขอความช่วยเหลือ"
 * ถ้าเจอคู่กับอาหารที่เป็นพิษ → ต้องยกระดับเป็นข้อความฉุกเฉิน ไม่ใช่แค่ข้อมูลโภชนาการ
 */
const INGESTION_SIGNAL = /(กินเข้าไป|กินไปแล้ว|กิน.{1,24}(?:เข้าไปแล้ว|ไปแล้ว)|เผลอกิน|แอบกิน|ทานเข้าไป|ทานไปแล้ว|ให้ไปแล้ว|เพิ่งกิน|เมื่อกี้|กินแล้ว|ช่วยด้วย|ทำไงดี|ทำยังไงดี|ต้องทำยังไง|ทำไงต่อ|กินเท่าไห?ร่ถึง)|อันตราย.{0,8}(ไหม|มั้ย|แค่ไหน|ขนาดไหน|รึเปล่า|หรือเปล่า|มากไหม)/;
/** Match an addressed name without confusing น้ำ with น้ำหนัก. */
function explicitlyNamesPet(q, name) {
    const n = name.normalize('NFC').toLowerCase().trim();
    if (!n)
        return false;
    let at = q.indexOf(n);
    while (at >= 0) {
        if ((0, petScope_1.insideCommonThaiWord)(q, at, at + n.length)) {
            at = q.indexOf(n, at + 1);
            continue;
        }
        const before = q.slice(0, at), after = q.slice(at + n.length);
        const left = !before || /(?:\s|น้อง|ชื่อ|แมว|สุนัข|หมา|ของ|กับ|และ)$/.test(before);
        const right = !after || /^(?:\s|ของ|กับ|และ|น้ำหนัก|หนัก|แพ้อะไร|มีวัคซีน|มียา|ล่าสุด|เท่าไหร่|เท่าไร|กี่|เมื่อไหร่|เมื่อไร|อะไร|ไหม|มั้ย)/.test(after);
        if (left && right)
            return true;
        at = q.indexOf(n, at + 1);
    }
    return false;
}
function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
/**
 * Remove a known pet name only where Thai sentence structure uses it as the
 * subject/owner. The same word remains matchable when it is the food object:
 * "โกโก้กินโกโก้" -> "กินโกโก้".
 */
function stripPetNameSubjects(q, names) {
    let result = q;
    const subjectTail = '(?=\\s|ครับ|ค่ะ|คะ|จ๊ะ|เป็น|มี|กิน|ไม่|อาเจียน|ถ่าย|ฉี่|นอน|เดิน|วิ่ง|ไอ|จาม|ซึม|คัน|เกา|แพ้|เจ็บ|ป่วย|น้ำหนัก|วัคซีน|ยา|ประวัติ|อาการ|ข้อมูล|ล่าสุด|เท่าไหร่|เท่าไร|$)';
    const punctuation = '(?:[,，:：!?]\\s*)?';
    for (const rawName of [...names].sort((a, b) => b.length - a.length)) {
        const name = rawName.normalize('NFC').toLowerCase().trim();
        if (!name)
            continue;
        const escaped = escapeRegExp(name);
        result = result.replace(new RegExp(`^(?:น้อง\\s*)?${escaped}${punctuation}${subjectTail}`), 'น้อง');
        result = result.replace(new RegExp(`((?:วันนี้|ตอนนี้|อาการ|น้ำหนัก|วัคซีน|ยา|ประวัติ|ข้อมูล)(?:ของ)?)(?:น้อง\\s*)?${escaped}${punctuation}${subjectTail}`, 'g'), '$1น้อง');
        result = result.replace(new RegExp(`(\\s)(?:น้อง\\s*)?${escaped}${punctuation}${subjectTail}`, 'g'), '$1น้อง');
    }
    return result.replace(/\\s+/g, ' ').trim();
}
function agentHint() {
    // Label/position match the chip above the message box (app/(tabs)/camera.tsx).
    return '\n\nถ้าอยากให้ช่วยค้นหาหรือทำงานหลายขั้นตอน แตะ **"✨ Agent"** เหนือช่องพิมพ์ได้ค่ะ — โหมดนั้นมีค่าใช้ Paw Coin ต่อข้อความ และคำตอบอาจคลาดเคลื่อน';
}
/**
 * ตัวหลักของ Smart Bot
 * @param message ข้อความจากผู้ใช้
 * @param pet     โปรไฟล์สัตว์ที่เลือกอยู่ (อาจเป็น null ถ้ายังไม่ได้เลือก)
 */
function getSmartBotReplyCore(message, pet, context) {
    const raw = String(message || '').trim();
    let q = raw.normalize('NFC').replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/[๐-๙]/g, d => String(d.charCodeAt(0) - 0x0E50)).toLowerCase();
    const qWithPetNames = q;
    const knownPetNames = [...new Set([pet?.name, ...(context?.petNames || [])].filter((name) => !!name))];
    q = stripPetNameSubjects(q, knownPetNames);
    const referenceMessage = (0, petScope_1.petReferenceText)(qWithPetNames, context?.ownerProfiles || []);
    const { matchedProfiles: fullNameProfiles, remainingText: remainingNameText } = (0, petScope_1.matchCanonicalPetNames)(referenceMessage, context?.ownerProfiles || []);
    const namedProfiles = (context?.ownerProfiles || []).filter((profile) => fullNameProfiles.some((match) => match.id === profile.id) ||
        (profile.aliases || []).some((name) => explicitlyNamesPet(remainingNameText, name)));
    const namedScope = (0, petScope_1.resolveNamedPetScope)(qWithPetNames, namedProfiles, pet, context?.explicitPetSelection);
    const targetPet = namedScope.target;
    if (!q) {
        return {
            text: 'พิมพ์คำถามมาได้เลยค่ะ 🐾',
            kind: 'smalltalk',
            intent: 'empty',
            confidence: 1,
            suggestAgent: false,
        };
    }
    const inferredSpecies = (0, careKnowledge_1.careSpecies)(q, targetPet?.species);
    const species = inferredSpecies === 'both' ? undefined : inferredSpecies;
    const petName = targetPet?.name;
    // ───────── 0.5) คนถูกสัตว์กัด/ข่วน — แพทย์คน ไม่ใช่สัตวแพทย์ ─────────
    const human = (0, humanSafety_1.matchHumanSafety)(q);
    if (human) {
        return {
            text: humanSafety_1.HUMAN_EXPOSURE_ANSWER,
            kind: 'human_safety',
            intent: `human_safety:${human.id}`,
            confidence: 0.95,
            suggestAgent: false,
            sources: human.sources,
        };
    }
    if ((0, humanSafety_1.isPetVictimBite)(q)) {
        return {
            text: 'น้องถูกสัตว์อีกตัวกัดหรือข่วน **ติดต่อสัตวแพทย์โดยตรงโดยเร็ว** ค่ะ หนูไม่เลือกยา วัคซีน หรือประเมินความเสี่ยงจากข้อความแชทแทนหมอค่ะ',
            kind: 'out_of_scope', intent: 'medical:pet_bite', confidence: 0.9,
            suggestAgent: false,
        };
    }
    // Dog/cat care cards and red flags must never be applied to another species.
    const birdUrgency = (0, socialSpeciesCare_1.birdUrgencyReply)(q, 'th');
    if (birdUrgency)
        return birdUrgency;
    const rabbitUrgency = (0, socialSpeciesCare_1.rabbitUrgencyReply)(q, 'th');
    if (rabbitUrgency)
        return rabbitUrgency;
    const rabbitCare = (0, socialSpeciesCare_1.socialSpeciesCareReply)(q, species, 'th');
    if (rabbitCare?.intent === 'care:rabbit_new_home')
        return rabbitCare;
    const otherSpecies = (0, otherSpecies_1.matchOtherSpecies)(q);
    if (otherSpecies)
        return otherSpecies;
    // ───────── 1) ฉุกเฉิน ─────────
    const lily = (0, clinicalDecision_1.matchLilyExposure)(q, species, 'th');
    if (lily)
        return lily;
    const emg = (0, emergency_1.matchEmergency)(q, species);
    if (emg) {
        return {
            text: `🚨 **${emg.rule.labelTh}**\n\n${emg.rule.adviceTh}${emergency_1.EMERGENCY_FOOTER}`,
            kind: 'emergency',
            intent: `emergency:${emg.rule.id}`,
            confidence: 0.95,
            // ฉุกเฉินไม่ชวนซื้อ/ไม่ชวนคุยต่อ — สิ่งที่ต้องทำคือไปหาหมอ
            suggestAgent: false,
            sources: [emg.rule.sourceUrl, ...(emg.rule.extraSources || [])],
        };
    }
    const reassessment = (0, clinicalDecision_1.matchVetReassessment)(q, species, 'th');
    if (reassessment)
        return reassessment;
    const clinicalDecision = (0, clinicalDecision_1.matchClinicalDecision)(q, 'th');
    if (clinicalDecision)
        return clinicalDecision;
    // Preserve medicine safeguards while answering explicit care before app-help.
    if (!(0, guard_1.matchGuard)(q)) {
        const catNight = (0, catNightVocalization_1.catNightVocalizationReply)(q, species, 'th');
        if (catNight)
            return catNight;
        const feeding = (0, feedingManagement_1.feedingManagementReply)(q, species, 'th');
        if (feeding)
            return feeding;
        const catHousehold = (0, catHouseholdCare_1.catHouseholdCareReply)(q, species, 'th');
        if (catHousehold)
            return catHousehold;
        const speciesCare = (0, socialSpeciesCare_1.socialSpeciesCareReply)(q, species, 'th');
        if (speciesCare)
            return speciesCare;
    }
    // ───────── 1.5) ถามเกณฑ์ "แบบไหนถึงต้องรีบไปหาหมอ" ─────────
    // ต้องอยู่ **หลัง** ฉุกเฉินเสมอ — คนที่กำลังเจอเหตุจริงต้องได้คำเตือนฉุกเฉินก่อน
    const rf = (0, redflags_1.matchRedFlag)(q);
    if (rf) {
        return {
            text: `📋 **${rf.rule.labelTh}**\n\n${rf.rule.answerTh}${redflags_1.RED_FLAG_FOOTER}`,
            kind: 'red_flags',
            intent: `red_flags:${rf.rule.id}`,
            confidence: 0.85,
            // เรื่องอาการต้องพาไปสัตวแพทย์ ไม่ชวนไปถาม Agent ต่อ (บอส 2 พ.ย. 2569: ห้ามทำตัวเป็นหมอ)
            suggestAgent: false,
            sources: rf.sources,
        };
    }
    // Requests to change a record must be acknowledged before app-help matching.
    // Keep a clear "how do I" question on the free tutorial route instead.
    // Emergency and red-flag checks above deliberately retain higher priority.
    // Match English "record" as a whole action word; do not treat the past
    // participle "recorded weight" as a request to mutate a record.
    const recordMutation = /(?:บันทึก|เพิ่ม|แก้ไข|เปลี่ยน|ลบ|save|\brecord\b|update|delete)\s*.{0,30}(?:น้ำหนัก|กิจกรรม|วัคซีน|ยา(?!ก)|นัดหมาย|ประวัติ|ข้อมูล|weight|activity|vaccine|medicine|record)/i.test(q);
    const negatedMutation = /(?:ไม่ต้อง|อย่า|ห้าม|ไม่ได้|ไม่อยาก|don't|do not)\s*.{0,12}(?:บันทึก|เพิ่ม|แก้ไข|เปลี่ยน|ลบ|save|record|update|delete)/i.test(q);
    const recordReadQuestion = /(?:เมื่อไหร่|เมื่อไร|วันไหน|หรือยัง|ไปแล้ว|ไว้แล้ว|ล่าสุด.*(?:เท่าไหร่|เท่าไร|อะไร)|มี.*(?:อะไร|ไหม)|when|already)/i.test(q);
    // "ปุ่มเพิ่มยาอยู่ไหน" / "บันทึกน้ำหนักย้อนหลังได้ไหม" ask where/whether the app can do it.
    // A capability question with a value or "ช่วย…ให้" is still a request to write now.
    const asksCapability = /(?:ได้ไหม|ได้มั้ย|ได้หรือเปล่า|ได้รึเปล่า)/.test(q) && !/\d|ช่วย|ให้หน่อย|ให้ที|ให้ด้วย|please/i.test(q);
    const appHowToQuestion = /(?:วิธี|ไง|อย่างไร|ตรงไหน|ที่ไหน|อยู่ไหน|หน้าไหน|ปุ่มไหน|กดอะไร|ไม่เป็น|help|how|where)/i.test(q) || asksCapability;
    // Dose changes ("เพิ่มยาเป็น 2 เม็ดได้ไหม") go to the clinical guard, not the write notice.
    // Naming an app control ("เปลี่ยนเวลาเตือนยา", "เพิ่มยาเข้าแอป") asks for the screen, not a write.
    const namesAppControl = /(?:เวลาเตือน|แจ้งเตือน|ตั้งเตือน|ปุ่ม|หน้าจอ|แท็บ|สต็อก|ในแอป|เข้าแอป|ในระบบ|เข้าระบบ)/.test(q);
    // "บันทึกน้ำหนักแล้วหาย" reports a failed save; the save-problem steps answer it.
    const reportsSaveProblem = /(?:แล้ว\s*(?:หาย|ไม่ขึ้น)|ไม่สำเร็จ|ไม่ขึ้น|หายไป|ผิดพลาด|error|ไม่\s*sync|ไม่อัปเดต)/i.test(q);
    if (recordMutation && !negatedMutation && !recordReadQuestion && !appHowToQuestion && !namesAppControl && !reportsSaveProblem && !(0, appHelp_1.isClinicalDosingQuestion)(q)) {
        return {
            text: 'ยังไม่ได้บันทึกหรือเปลี่ยนแปลงข้อมูลนะคะ โหมดฟรีอ่านข้อมูลที่มีอยู่เท่านั้นค่ะ หากต้องการเพิ่มหรือแก้ไข ให้เปิดฟอร์มของรายการนั้น หรือเลือก Agent เพื่อเสนอรายการให้คุณตรวจและยืนยันก่อนบันทึก\n\nตอนนี้ยังลบหรือแก้รายการน้ำหนัก วัคซีน พบหมอ หรือกิจกรรมทีละรายการไม่ได้ (น้ำหนักที่บันทึกซ้ำในวันเดิมจะแทนค่าเดิม) ส่วนยาแก้ไข หยุด หรือลบได้ที่ ยา-อาหารเสริม > สต็อก และนัดแก้ไขหรือยกเลิกได้ที่แท็บนัดหมายค่ะ',
            kind: 'handoff',
            intent: 'records:mutation_requires_confirmation',
            confidence: 1,
            suggestAgent: true,
        };
    }
    if (/(ไม่กินอาหาร|หยุดกิน|กินอาหารน้อย)/.test(q) && /(?:ควรจด|จดอาการ|บอกหมอ|ก่อนโทรหาหมอ)/.test(q)) {
        return {
            text: 'ถ้าน้องไม่กินอาหารอยู่ตอนนี้ **ติดต่อสัตวแพทย์โดยตรง** ค่ะ ก่อนโทรให้จดเวลาเริ่มอาการ อาหารและน้ำที่กินได้จริง การอาเจียน/ขับถ่าย ยาที่ได้รับ และความเปลี่ยนแปลงของพฤติกรรม เพื่อเล่าให้หมอประเมิน หนูไม่สรุปสาเหตุหรือแนะนำยาเองค่ะ',
            kind: 'out_of_scope', intent: 'medical:vet_prep', confidence: 0.85,
            suggestAgent: false, sources: ['https://www.aaha.org/resources/help-is-this-a-pet-emergency/'],
        };
    }
    // ───────── 1.6) วิธีใช้แอป ─────────
    // มาก่อนความรู้สุขภาพ: “สร้างโปรไฟล์แมวใหม่” ต้องไม่ถูกตอบเป็นวิธีเลี้ยงแมว
    // Menu names can also be pet aliases (for example QA-Records -> Records).
    // App instructions need the original UI words; never strip them as names.
    const appHelp = (0, appHelp_1.matchAppHelp)(qWithPetNames);
    if (appHelp) {
        // A how-to answer must not eclipse the owner's active symptom concern.
        if (/(ไม่กินอาหาร|หยุดกิน|กินน้อยลง)/.test(q) && /(?:หมอ|สัตวแพทย์)/.test(q)) {
            return { ...appHelp, text: `${appHelp.text}\n\nถ้าน้องไม่กินอาหารอยู่ตอนนี้ ให้ติดต่อสัตวแพทย์โดยตรงด้วยค่ะ และแจ้งว่าเริ่มเมื่อไร ดื่มน้ำและขับถ่ายอย่างไร` };
        }
        return appHelp;
    }
    // ───────── 1.7) ความรู้ที่ยืนยันแหล่งแล้ว ─────────
    // มาก่อน guard/food เพื่อกัน "ลงทะเบียน...จำเป็นไหม" และ "หวงชามอาหาร" ถูกจัดผิด
    const knowledge = (0, knowledge_1.matchKnowledge)(q, species);
    if (knowledge) {
        return {
            text: `📚 **${knowledge.labelTh}**\n\n${knowledge.answerTh}`,
            kind: 'guidance',
            intent: `knowledge:${knowledge.id}`,
            confidence: 0.82,
            suggestAgent: false,
            sources: [knowledge.sourceUrl, ...(knowledge.extraSources || [])],
        };
    }
    // ───────── 2) กำแพงกันตอบเกินขอบเขต ─────────
    // Dose changes the guard patterns do not spell out ("ให้ยาลดลงเหลือครึ่งเม็ดได้ไหม",
    // "เพิ่มยาเป็นวันละ 3 ครั้งได้มั้ย") still get the dosage boundary, never a record read.
    const dosingRule = guard_1.GUARD_RULES.find((rule) => rule.id === 'drug_dosage');
    const guard = (0, guard_1.matchGuard)(q)
        || (dosingRule && (0, appHelp_1.isClinicalDosingQuestion)(q) && !(0, guard_1.isStockReadQuestion)(q) ? { rule: dosingRule, matched: 'dose' } : null);
    if (guard) {
        return {
            text: `${guard.rule.replyTh}${guard_1.GUARD_CLOSING}`,
            kind: 'out_of_scope',
            intent: `guard:${guard.rule.id}`,
            confidence: 0.9,
            // เรื่องพวกนี้ "ทั้งระบบ" ห้ามตอบ — ส่งให้ Agent ก็ห้ามตอบเหมือนกัน
            suggestAgent: false,
        };
    }
    // A household overview may read the owner-scoped pet directory. A unique
    // name can also resolve to that pet's records without switching the UI.
    const ownerPets = context?.ownerPets;
    const householdQuestion = /(?:สัตว์|น้อง|หมา|แมว).{0,25}(?:กี่ตัว|ทั้งหมด|รายชื่อ|มีใครบ้าง|ตัวไหนบ้าง)|(?:รายชื่อ|ทั้งหมด).{0,20}(?:สัตว์|น้อง|หมา|แมว)/.test(q);
    if (ownerPets && householdQuestion) {
        const dogs = ownerPets.filter((item) => item.species === 'dog').length;
        const cats = ownerPets.filter((item) => item.species === 'cat').length;
        const others = ownerPets.length - dogs - cats;
        const names = ownerPets.map((item) => `• ${item.name} (${item.species === 'dog' ? 'สุนัข' : item.species === 'cat' ? 'แมว' : 'สัตว์เลี้ยง'})`);
        return {
            text: ownerPets.length
                ? `ในบัญชีนี้มีน้อง ${ownerPets.length} ตัว — สุนัข ${dogs}, แมว ${cats}${others ? `, อื่น ๆ ${others}` : ''} ค่ะ\n${names.join('\n')}\n\nถามข้อมูลของน้องโดยระบุชื่อให้ชัดเจน หรือเลือกน้องจากแถบด้านบนก่อนถามก็ได้ค่ะ`
                : 'บัญชีนี้ยังไม่มีสัตว์เลี้ยงที่โหลดไว้ค่ะ ลองเพิ่มน้องหรือเชื่อมต่อเพื่อโหลดข้อมูลก่อนนะคะ',
            kind: ownerPets.length ? 'records' : 'no_data',
            intent: 'records:household', confidence: 1, suggestAgent: false,
        };
    }
    // Never mix records when two owner pets are named or the caller supplied
    // only a name directory without the corresponding owner-scoped profiles.
    const isRecordsQuestion = /น้ำหนัก|หนักเท่า|อายุ|ประวัติ|บันทึก|วัคซีน|รายการยา|ยาที่|แพ้อะไร|ข้อมูลส่วนตัว/.test(q);
    if (isRecordsQuestion && !/(กิน|เผลอ|เลีย|กลืน|สารพิษ)/.test(q) &&
        (namedScope.ambiguous || namedScope.speciesConflict || (!context?.ownerProfiles && context?.petNames.some(name => name !== pet?.name && explicitlyNamesPet(qWithPetNames, name))))) {
        return { text: 'คำถามระบุชื่อน้องอีกตัวหรือหลายตัวค่ะ กรุณาเลือกโปรไฟล์ของน้องที่ต้องการดู แล้วถามทีละตัว เพื่อไม่ให้ประวัติสลับกันค่ะ',
            kind: 'no_data', intent: 'records:clarify_pet', confidence: 1, suggestAgent: false };
    }
    // ───────── 3) อาหาร ─────────
    const foods = (0, food_1.matchFoods)(q, species);
    if (foods.length > 0) {
        const { text, sources } = (0, food_1.formatFoodAnswer)(foods, petName);
        const worstToxic = foods[0].row.status === 'toxic';
        // กินของเป็นพิษเข้าไปแล้ว = เหตุฉุกเฉิน ไม่ใช่คำถามโภชนาการ
        const escalate = worstToxic && INGESTION_SIGNAL.test(q);
        return {
            text: escalate
                ? `🚨 **ต้องรีบพาไปหาสัตวแพทย์ค่ะ**\n\n${text}\n\n` +
                    'ระหว่างทางให้เตรียมข้อมูลไปด้วย: **กินอะไร · ประมาณเท่าไร · กินเมื่อกี่โมง** ' +
                    'และถ้ามีห่อ/ฉลากให้ถือไปด้วยค่ะ\n\n' +
                    '⚠️ **ห้ามทำให้อาเจียนเองโดยไม่ได้รับคำสั่งจากสัตวแพทย์** เพราะบางกรณีทำให้แย่ลง' +
                    emergency_1.EMERGENCY_FOOTER
                : text,
            kind: escalate ? 'emergency' : 'food_safety',
            intent: `food:${foods.map((f) => f.row.nameEn).join('+')}`,
            confidence: escalate ? 0.9 : 0.85,
            suggestAgent: false,
            sources,
        };
    }
    if ((0, food_1.isGeneralFoodQuestion)(q)) {
        const { text, sources } = (0, food_1.formatToxicList)(species);
        return {
            text,
            kind: 'food_safety',
            intent: 'food:list',
            confidence: 0.8,
            suggestAgent: false,
            sources,
        };
    }
    // ───────── 4) ข้อมูลที่บันทึกไว้ ─────────
    // Explicit requests for existing records can contain several topics. Keep
    // safety/mutation checks above this branch; never infer treatment here.
    const tri = (0, triage_1.matchTriage)(q, species);
    if (tri) {
        return {
            text: `📋 **${tri.rule.labelTh}**\n\n${tri.rule.answerTh}${triage_1.TRIAGE_FOOTER}`,
            kind: 'red_flags',
            intent: `triage:${tri.rule.id}`,
            confidence: 0.75,
            // คัดกรองอาการ → ส่งต่อสัตวแพทย์ ไม่ชวนไปถาม Agent ต่อ (บอส 2 พ.ย. 2569: ห้ามทำตัวเป็นหมอ)
            suggestAgent: false,
            sources: tri.sources,
        };
    }
    const seniorChange = (0, seniorChange_1.matchSeniorChange)(q);
    if (seniorChange)
        return seniorChange;
    const activityRecordCue = /เท่าไหร่|เท่าไร|กี่|บันทึก|ข้อมูล|รายการ|สรุป|ยอด/.test(q);
    const recordTopics = [
        { match: /(อายุ|วันเกิด|สายพันธุ์|พันธุ์|เพศ|สี|ไมโครชิป|microchip|เลขชิป|แพ้อะไร|อาการแพ้|ข้อมูลส่วนตัว)/.test(q), answer: answers_1.answerProfile },
        { match: /น้ำหนัก/.test(q), answer: answers_1.answerWeight },
        { match: /วัคซีน/.test(q), answer: answers_1.answerVaccine },
        { match: /(?:กับยา|และยา|รายการยา|ยาที่|ยามีอะไร)/.test(q), answer: answers_1.answerMedicine },
        { match: /(?:มีนัด|นัดหมาย|ตารางนัด|นัดครั้ง|นัดวัน)/.test(q), answer: answers_1.answerBooking },
        { match: /ประวัติ(การ)?(?:รักษา|สุขภาพ|ป่วย|ไปหาหมอ|พบสัตวแพทย์)/.test(q), answer: answers_1.answerHealthRecords },
        { match: activityRecordCue && intents_1.SAVED_WATER_TOPIC.test(q), answer: (p) => (0, answers_1.answerActivity)(p, 'water', q) },
        { match: activityRecordCue && /(?:อาหาร|กินข้าว)/.test(q), answer: (p) => (0, answers_1.answerActivity)(p, 'food', q) },
        { match: activityRecordCue && /(?:เดิน|ออกกำลัง)/.test(q), answer: (p) => (0, answers_1.answerActivity)(p, 'walk', q) },
        { match: activityRecordCue && /นอน/.test(q), answer: (p) => (0, answers_1.answerActivity)(p, 'sleep', q) },
    ].filter(topic => topic.match);
    const compoundRecordCue = /แล้ว|และ|กับ|พร้อม|รวม|ทั้ง|ข้อมูล|รายการ|ประวัติ|มีอะไร|ล่าสุด|บันทึก|เท่าไร|เท่าไหร่|กี่|ยอด/.test(q);
    const vaccineAppointmentOnly = recordTopics.length === 2 && /วัคซีนนัด(?:วัน|เมื่อ|ครั้ง)/.test(q);
    if (targetPet && recordTopics.length > 1 && compoundRecordCue && !vaccineAppointmentOnly) {
        const answers = recordTopics.map(topic => topic.answer === answers_1.answerProfile ? topic.answer(targetPet, q) : topic.answer(targetPet));
        return { text: answers.map(answer => answer.text).join('\n\n'),
            kind: answers.some(answer => answer.hasData) ? 'records' : 'no_data',
            intent: 'records:multiple', confidence: 1, suggestAgent: false };
    }
    const intent = (0, intents_1.matchIntent)(q, { knownPetNamed: namedScope.knownNamed });
    if (intent) {
        if (!targetPet) {
            return {
                text: 'ยังไม่ได้เลือกน้องตัวไหนเลยค่ะ — เลือกน้องก่อน แล้วถามใหม่ได้เลยนะคะ 🐾',
                kind: 'no_data',
                intent: `records:${intent.id}:no_pet`,
                confidence: intent.confidence,
                suggestAgent: false,
            };
        }
        let res;
        switch (intent.id) {
            case 'weight':
                res = (0, answers_1.answerWeight)(targetPet);
                break;
            case 'activity':
                res = (0, answers_1.answerActivity)(targetPet, intent.activityType || 'water', q);
                break;
            case 'medicine':
                res = (0, answers_1.answerMedicine)(targetPet);
                break;
            case 'vaccine':
                res = (0, answers_1.answerVaccine)(targetPet);
                break;
            case 'booking':
                res = (0, answers_1.answerBooking)(targetPet);
                break;
            case 'profile':
                res = (0, answers_1.answerProfile)(targetPet, q);
                break;
            case 'health_records':
                res = (0, answers_1.answerHealthRecords)(targetPet);
                break;
            case 'summary':
                res = (0, answers_1.answerSummary)(targetPet);
                break;
            default: res = { text: '', hasData: false };
        }
        const intentId = `records:${intent.id}${intent.activityType ? `:${intent.activityType}` : ''}`;
        return {
            text: res.text,
            kind: res.hasData ? 'records' : 'no_data',
            intent: intentId,
            confidence: intent.confidence,
            // ข้อมูลว่างก็ส่งให้ Agent ไม่ช่วยอะไร — Agent อ่านบันทึกชุดเดียวกัน
            suggestAgent: false,
        };
    }
    // ───────── 4.5) อาการทั่วไป "เกิดจากอะไร / ทำไงดี" ─────────
    // อยู่ตรงนี้โดยตั้งใจ — ต้องหลังฉุกเฉิน · กำแพงกัน · อาหาร · บันทึกในแอป
    //   หลังฉุกเฉิน  = คนกำลังเจอเหตุจริงต้องได้คำเตือนก่อน
    //   หลังกำแพงกัน = คำถามวินิจฉัย/ขนาดยา ต้องโดนกันก่อน ห้ามมาตอบเป็นเกณฑ์
    //   หลังบันทึก   = "อึกี่ครั้งวันนี้" คือขอดูข้อมูลในแอป ไม่ใช่ถามอาการ
    // ───────── 4.55) พฤติกรรมกวนใจ — เห่า · ข่วนโซฟา · ก้าวร้าว · หลบซ่อน ─────────
    // อยู่หลัง triage โดยตั้งใจ: "แมวเกาบ่อยจนขนร่วง" คืออาการผิวหนัง ไม่ใช่พฤติกรรม
    const beh = (0, behavior_1.matchBehavior)(q, species);
    if (beh) {
        return {
            text: `🐾 **${beh.rule.labelTh}**\n\n${beh.rule.answerTh}${behavior_1.BEHAVIOR_FOOTER}`,
            kind: 'guidance',
            intent: `behavior:${beh.rule.id}`,
            confidence: 0.75,
            suggestAgent: true,
            sources: beh.sources,
        };
    }
    // ───────── 4.58) "แอปมีบริการ ___ ไหม" — ตอบเรื่องความสามารถของแอปตรง ๆ ─────────
    // ⚠️ อยู่ก่อนตัวตอบเรื่องราคาโดยตั้งใจ: "ประกันสัตว์เลี้ยงเจ้าไหนดี" ควรได้
    //    รายการสิ่งที่ต้องอ่านก่อนเซ็น ซึ่งมีประโยชน์กว่าคำปฏิเสธเรื่องราคาแบบกว้าง ๆ
    // ⚠️ และอยู่หลังฉุกเฉิน/กำแพงกันตอบเกินขอบเขตเสมอ — เคสด่วนต้องชนะข้อมูลบริการ
    const svc = (0, services_1.matchService)(q);
    if (svc) {
        return {
            text: svc.rule.answerTh,
            kind: 'app_info',
            intent: `service:${svc.rule.id}`,
            confidence: 0.8,
            // เป็นคำถามเรื่องแอป ไม่ใช่คำถามการแพทย์ — Agent ตอบแทนไม่ได้ดีกว่านี้
            suggestAgent: false,
        };
    }
    // ───────── 4.6) ถามราคา — ตอบว่าไม่รู้ พร้อมวิธีหาคำตอบ ─────────
    // ⚠️ นับเป็น out_of_scope ไม่ใช่ "ตอบได้" — เพราะมันคือการปฏิเสธอย่างมีประโยชน์
    //    ห้ามเอาไปนับรวมเป็นตัวเลขความสามารถของบอทแบบเงียบ ๆ
    if ((0, costs_1.isCostQuestion)(q)) {
        return {
            text: (0, costs_1.isPetLivingCostQuestion)(q) ? costs_1.PET_LIVING_COST_ANSWER : costs_1.COST_ANSWER,
            kind: 'out_of_scope',
            intent: 'cost:no_price_data',
            confidence: 0.7,
            // Agent ก็ไม่มีราคาจริงเหมือนกัน — ส่งไปให้เดาราคาคือสิ่งที่ห้ามที่สุด
            suggestAgent: false,
        };
    }
    const care = (0, careKnowledge_1.matchCareKnowledge)(q, species);
    if (care)
        return care;
    // Social posts often describe symptoms in long, indirect language. If no
    // narrower sourced rule matched, send the owner to a veterinarian for an
    // assessment instead of guessing or selling an Agent response.
    const medicalFallback = (0, medicalFallback_1.matchUnrecognizedMedical)(q);
    if (medicalFallback)
        return medicalFallback;
    const socialReply = (0, socialConversation_1.matchSocialConversation)(q);
    if (socialReply)
        return socialReply;
    // ───────── 5) ทักทาย / ขอบคุณ ─────────
    if (GREETING.test(q) && raw.length <= GREETING_MAX_LEN) {
        const who = petName ? `น้อง${petName}` : 'น้อง';
        return {
            text: `สวัสดีค่ะ 🐾 หนูช่วยดูข้อมูลของ${who}ที่บันทึกไว้ในแอปได้นะคะ\n\n` +
                'ลองถามได้เลย เช่น\n' +
                '• "น้ำหนักล่าสุดเท่าไหร่"\n' +
                '• "ยามีอะไรบ้าง"\n' +
                '• "วัคซีนนัดวันไหน"\n' +
                '• "แมวกินช็อกโกแลตได้ไหม"',
            kind: 'smalltalk',
            intent: 'greeting',
            confidence: 0.9,
            suggestAgent: false,
        };
    }
    if (THANKS.test(q) && raw.length <= GREETING_MAX_LEN) {
        return {
            text: 'ยินดีค่ะ 🐾 มีอะไรถามได้อีกนะคะ',
            kind: 'smalltalk',
            intent: 'thanks',
            confidence: 0.9,
            suggestAgent: false,
        };
    }
    // ───────── 6) ไม่มั่นใจ → ส่งต่อ (ห้ามเดา) ─────────
    // An app-related question that nothing matched gets the help-topic menu, not "ระบุหมาหรือแมว".
    const menu = (0, appHelp_1.appHelpMenu)(qWithPetNames, 'th');
    if (menu)
        return menu;
    return {
        text: 'ยังจับประเด็นคำถามนี้ได้ไม่ชัดค่ะ ช่วยระบุ **หมาหรือแมว · อายุ · เรื่องที่อยากทราบ** และถามทีละเรื่องได้ไหมคะ?\n\n' +
            'โหมดฟรีช่วยอ่านประวัติและตอบความรู้การดูแลที่มีแหล่งอ้างอิงได้ แต่ไม่วินิจฉัยหรือกำหนดขนาดยาค่ะ' +
            agentHint(),
        kind: 'handoff',
        intent: 'unknown',
        confidence: 0.2,
        suggestAgent: true,
    };
}
function getSmartBotReply(message, pet, context) {
    if (context?.language === 'en') {
        const english = (0, english_1.getEnglishSmartBotReply)(message, pet, context);
        if (/[ก-๙]/.test(message) && (english.kind === 'handoff' || english.kind === 'app_info')) {
            const thaiClassification = (0, riskBoundary_1.applyRiskBoundary)(message, getSmartBotReplyCore(message, pet, context));
            if (thaiClassification.kind === 'emergency') {
                return {
                    text: (0, clinicalDecision_1.withMultiPetIllnessContext)(message, { ...thaiClassification, text: 'This may be an emergency. Contact an emergency veterinarian immediately. I cannot diagnose or treat your pet in chat.' }, 'en').text,
                    kind: 'emergency', intent: `en:${thaiClassification.intent}`, confidence: 1,
                    suggestAgent: false, sources: thaiClassification.sources,
                };
            }
            if (thaiClassification.kind === 'human_safety') {
                return {
                    text: 'Please contact a doctor or emergency medical service promptly. I cannot assess human bites or scratches in chat.',
                    kind: 'human_safety', intent: `en:${thaiClassification.intent}`, confidence: 1,
                    suggestAgent: false,
                };
            }
            if (thaiClassification.kind === 'out_of_scope') {
                return {
                    text: 'I cannot diagnose symptoms, choose treatment or prescribe medication. Please contact a veterinarian for an assessment.',
                    kind: 'out_of_scope', intent: `en:${thaiClassification.intent}`, confidence: 1,
                    suggestAgent: false, sources: thaiClassification.sources,
                };
            }
        }
        return (0, compoundRecords_1.withCompoundSavedFacts)(message, english, pet, context);
    }
    return (0, compoundRecords_1.withCompoundSavedFacts)(message, (0, riskBoundary_1.applyRiskBoundary)(message, getSmartBotReplyCore(message, pet, context)), pet, context);
}
exports.default = getSmartBotReply;

},
"appHelpContent":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APP_HELP_CONTENT = exports.APP_HELP_REVIEWED_ON = void 0;
// Shared by offline Free Chat and the generated user guide. Review against
// the actual screens before changing instructions or availability claims.
// 26 Oct 2026: re-checked against app/** + components/** after the medicine
// edit/stop/refill, calendar/time pickers, appointment edit and account-deletion changes.
exports.APP_HELP_REVIEWED_ON = '2026-10-26';
exports.APP_HELP_CONTENT = {
    app_overview: {
        th: 'เริ่มใช้ PetCare AI 360\n1. เพิ่มน้องที่หน้า Home แล้วเลือกน้องให้ถูกตัว\n2. ใช้ Health บันทึกน้ำหนัก อาหาร น้ำ เดิน และนอน\n3. เปิดประวัติน้อง (Records) เพื่อบันทึกวัคซีน ตรวจสุขภาพ ยา หรือนัดแพทย์\n4. ใช้ Chat ธรรมดาถามข้อมูลที่บันทึกหรือวิธีใช้แอปได้ฟรี\n5. ค้นหาสถานที่แล้วติดต่อร้านหรือคลินิกเอง\n\nแอปไม่วินิจฉัยโรค หากน้องมีอาการหรือความเสี่ยง ให้ติดต่อสัตวแพทย์ค่ะ',
        en: 'Getting started with PetCare AI 360\n1. Add a pet on Home and select the correct pet.\n2. Use Health to log weight, food, water, walks and sleep.\n3. Open Records to add vaccinations, checkups, medicine or a vet appointment.\n4. Use Free Chat for saved records and app instructions at no Paw Coin cost.\n5. Search for businesses and contact them yourself.\n\nThe app cannot diagnose illness. Contact a veterinarian for symptoms or health risks.',
    },
    add_pet: {
        th: 'เพิ่มสัตว์เลี้ยง\n1. ไปหน้า Home แล้วแตะ + เพิ่มสัตว์เลี้ยง (ท้ายแถวรายชื่อน้อง)\n2. หน้า ข้อมูลพื้นฐาน: เลือกชนิดและกรอกชื่อน้อง ข้อมูลอื่นใส่เท่าที่มี แล้วแตะ ถัดไป →\n3. หน้า รายละเอียดเพิ่มเติม: ใส่วัคซีนล่าสุดหรือยาที่กำลังใช้ได้ (ไม่บังคับ) ถ้าใส่ยา ให้เลือกความถี่และเวลาให้ยาด้วย\n4. แตะ 🐾 เพิ่มน้อง แล้วตรวจว่าน้องใหม่ขึ้นในแถวรายชื่อ และเลือกน้องตัวนั้นก่อนบันทึกข้อมูลเพิ่ม\n\nเพิ่มได้ไม่จำกัดจำนวน ไม่หัก Paw Coin รูปและข้อมูลอื่นแก้ภายหลังได้ค่ะ',
        en: 'Add a pet\n1. On Home, tap + Add Pet at the end of the pet row.\n2. On Basic Info, choose the species and enter the name (add any other details you know), then tap Next.\n3. On Additional Details, you can add the latest vaccination or a current medicine (optional). For a medicine, also choose its frequency and dose times.\n4. Tap Add Pet, check that the new pet appears in the row, and select it before adding records.\n\nYou can add any number of pets at no Paw Coin cost, and edit photos and details later.',
    },
    switch_pet: {
        th: 'สลับน้องก่อนใช้งาน\n1. เลือกการ์ดน้องที่หน้า Home หรือเลือกน้องจากแถบด้านบนในหน้าที่รองรับ\n2. ตรวจชื่อที่แสดงก่อนเปิด Health ยา ประวัติน้อง หรือแชท\n3. กลับมาน้องเดิมเพื่อตรวจว่าบันทึกยังเป็นของตัวเดิม\n\nถ้ามีชื่อซ้ำ ให้เลือกตัวจากรายการและตรวจข้อมูลโปรไฟล์ ไม่อาศัยชื่ออย่างเดียวค่ะ',
        en: 'Switch pets\n1. Select the pet card on Home or use the pet selector where available.\n2. Check the selected name before opening Health, medicine, Records or chat.\n3. Return to the previous pet to check its own records.\n\nFor duplicate names, select the pet explicitly and check its profile rather than relying on the name alone.',
    },
    weight: {
        th: 'บันทึกและดูกราฟน้ำหนัก\n1. เลือกน้อง แล้วเปิด Health > น้ำหนัก\n2. แตะ + บันทึก แล้วกรอกน้ำหนักเป็นกิโลกรัม\n3. ช่อง วันที่ ตั้งเป็นวันนี้ไว้แล้ว ถ้าชั่งวันก่อนหน้า ให้แตะเลือกวันจากปฏิทิน (ย้อนหลังได้ เลือกวันในอนาคตไม่ได้)\n4. ตรวจน้องและตัวเลขแล้วกดบันทึก จากนั้นดูกราฟและประวัติน้ำหนัก\n\nวันเดียวกันเก็บน้ำหนักได้ 1 ค่า ถ้าบันทึกซ้ำในวันเดิม ค่าใหม่จะแทนค่าเดิมทันทีโดยไม่มีหน้าต่างถามยืนยัน ถ้าลงผิด ให้บันทึกค่าที่ถูกต้องในวันเดิมอีกครั้ง ตอนนี้ยังลบรายการน้ำหนักทีละรายการไม่ได้ บันทึกจาก ประวัติน้อง > น้ำหนัก หรือหน้าข้อมูลน้อง > ชั่งน้ำหนัก ได้เช่นกันค่ะ',
        en: 'Log weight and view the graph\n1. Select the pet and open Health > Weight.\n2. Tap + Record and enter the weight in kilograms.\n3. The Date field starts at today. For an earlier weighing, pick the date from the calendar (past dates are allowed; future dates are not).\n4. Check the pet and value, save, then review the weight graph and history.\n\nEach date keeps one weight. Saving again on the same date replaces the earlier value immediately, without a confirmation prompt. To fix a wrong entry, save the correct value on that same date. Single weight entries cannot be deleted yet. You can also record weight from Pet Records > Weight or from the pet details page > Weight.',
    },
    activity: {
        th: 'บันทึกอาหาร น้ำ เดิน และนอน\n1. เลือกน้อง แล้วเปิด Health\n2. เปิดแท็บ กิจกรรม หรือ อาหาร แล้วแตะ + บันทึก\n3. เลือก เดิน · การนอน · อาหาร หรือ น้ำ แล้วกรอกค่าตามหน่วยที่หน้าจอแสดง\n4. ช่อง วันที่ ตั้งเป็นวันนี้ไว้แล้ว ถ้าบันทึกย้อนหลังให้เลือกวันจากปฏิทิน (เลือกวันในอนาคตไม่ได้) แล้วกดบันทึก จากนั้นตรวจประวัติและกราฟ\n\nอาหารหนึ่งรายการนับเป็นหนึ่งมื้อ จึงบันทึกเช้ากับเย็นแยกกันได้ค่ะ',
        en: 'Log food, water, walks and sleep\n1. Select the pet and open Health.\n2. Open the Activities or Food tab and tap + Record.\n3. Choose Walk, Sleep, Food or Water and use the unit shown on screen.\n4. The Date field starts at today. To back-date, pick a date from the calendar (future dates are not allowed), then save and review the history and graph.\n\nEach food entry counts as one meal; record breakfast and dinner separately.',
    },
    quick_records: {
        th: 'บันทึกด่วนจากหน้าข้อมูลน้อง (รวมกรูมมิ่ง)\n1. ที่ Home แตะรูปน้อง แล้วแตะ 📋 ดูประวัติเต็ม\n2. ในหัวข้อ บันทึกข้อมูล เลือก ชั่งน้ำหนัก · วัคซีน · ตรวจสุขภาพ · เดินเล่น · อาหาร หรือ กรูมมิ่ง\n3. กรอกข้อมูลที่หน้าจอขอ เช่น กรูมมิ่ง: บริการ ชื่อร้าน และค่าใช้จ่าย / เดินเล่น: ระยะทาง (เมตร) หรือเวลา (นาที) แล้วเลือกวันที่จากปฏิทิน (ย้อนหลังได้ ไม่เกินวันนี้)\n4. กดบันทึก แล้วตรวจรายการใน ไทม์ไลน์ประวัติ ด้านล่าง\n\nปุ่ม วัคซีน จะเปิดหน้าโปรแกรมวัคซีน ให้แตะ + บันทึกว่าฉีดแล้ว ตรวจชื่อน้องก่อนบันทึกทุกครั้งค่ะ',
        en: 'Quick records on the pet details page (including grooming)\n1. On Home, tap the pet, then tap View full history.\n2. Under Add records, choose Weight, Vaccinations, Checkup, Walk, Food or Grooming.\n3. Fill in the requested fields, for example Grooming: service, business name and cost; Walk: distance (m) or duration (min). Pick the date from the calendar (past dates allowed, not later than today).\n4. Save and check the entry in the Record timeline below.\n\nVaccinations opens the vaccination program page; tap + Record a vaccination there. Always check the pet before saving.',
    },
    medicine: {
        th: 'เพิ่มยา–อาหารเสริม\n1. เลือกน้อง แล้วไป Home > เมนูลัด ยา-อาหารเสริม (หรือ ประวัติน้อง > เพิ่มบันทึก > ยา)\n2. แตะ เพิ่มยา/อาหารเสริม\n3. กรอก ชื่อยา/อาหารเสริม และ ขนาดยา ตามฉลากหรือคำสั่งสัตวแพทย์ แล้วเลือก ความถี่\n4. เวลากินยา ต้องเลือกอย่างน้อย 1 เวลา: แตะปุ่มเวลาที่มี หรือแตะ + เวลาอื่น เพื่อเลือกชั่วโมงใดก็ได้ นาทีละ 10 นาที\n5. ระยะเวลาให้ยา: กินต่อเนื่อง · 7 วัน · 14 วัน · 30 วัน หรือ กำหนดวันจบเอง (เลือกวันสุดท้ายจากปฏิทิน)\n6. จำนวนยาที่มี ไม่บังคับ เว้นว่าง = แอปไม่นับจำนวน ถ้าใส่ตัวเลข แอปจะลดลงครั้งละ 1 ทุกครั้งที่บันทึกว่าให้แล้ว\n7. กดบันทึก แล้วดูในแท็บ ยาวันนี้ · กราฟและประวัติ · สต็อก\n\nแอปไม่เลือกยาหรือกำหนดขนาดยาให้ ขนาดยาและการเปลี่ยนยาให้ทำตามสัตวแพทย์ค่ะ',
        en: 'Add medicine or a supplement\n1. Select the pet and open Home > Medicine & Supplements (or Pet Records > Add a record > Medicine).\n2. Tap Add medicine or supplement.\n3. Enter the Medicine or supplement name and the Dosage from the label or your veterinarian, then choose a Frequency.\n4. Dose times needs at least one time: tap a time, or tap + Other time to pick any hour in 10-minute steps.\n5. How long: Ongoing, 7 days, 14 days, 30 days, or Set last day (pick the last day from the calendar).\n6. Stock quantity is optional. Leave it empty to not count stock; if you enter a number, the app subtracts 1 each time you mark a dose given.\n7. Save, then check the Today, Chart and history, and Stock tabs.\n\nThe app does not choose medicines or set doses. Follow your veterinarian for doses and changes.',
    },
    medicine_manage: {
        th: 'แก้ไข หยุด หรือเติมยา\n1. เลือกน้อง แล้วไป Home > ยา-อาหารเสริม > แท็บ สต็อก\n2. แก้ไข: แตะ แก้ไข ที่การ์ดยา เปลี่ยนชื่อ ขนาดยา ความถี่ เวลากินยา (แตะเวลาที่เลือกไว้เพื่อเอาออก หรือ + เวลาอื่น) หรือระยะเวลาให้ยา แล้วกด บันทึกการแก้ไข ประวัติการให้ยาเดิมยังอยู่\n3. เติมจำนวน: ในหน้าแก้ไข แตะ + เติม 10 หรือ + เติม 30 (หรือพิมพ์จำนวนเอง) แล้วกด บันทึกการแก้ไข\n4. หยุดยา: แตะ หยุดยา แล้วเลือก วันนี้เป็นวันสุดท้าย หรือ หยุดตั้งแต่วันนี้ (ไม่ให้วันนี้แล้ว) ซึ่งมีให้เลือกเมื่อเริ่มยามาก่อนวันนี้ การเตือนจะหยุดหลังวันจบ และประวัติเดิมยังอยู่\n5. ลบ: แตะ ลบ แล้วยืนยัน ถ้าต้องการเก็บประวัติไว้ ให้ใช้ หยุดยา แทน\n\nกล่อง ยาที่ต้องแก้ จะขึ้นเมื่อยายังไม่ได้ตั้งเวลา ใช้ความถี่ที่แอปตั้งเตือนไม่ได้ หรือจำนวนในแอปเป็น 0 แตะ แก้ไข ในกล่องเพื่อแก้ได้ทันที จำนวนเป็น 0 ก็ยังบันทึกว่าให้แล้วได้ แต่แอปจะเตือนตามเวลาต่อจนจบคอร์สหรือกดหยุดยา การหยุดหรือเปลี่ยนยาให้ทำตามคำสั่งสัตวแพทย์ค่ะ',
        en: 'Edit, stop or restock a medicine\n1. Select the pet and open Home > Medicine & Supplements > Stock tab.\n2. Edit: tap Edit on the medicine card and change the name, dosage, frequency, dose times (tap a selected time to remove it, or + Other time) or How long, then tap Save changes. Earlier dose history is kept.\n3. Restock: in Edit, tap + Add 10 or + Add 30 (or type the amount), then tap Save changes.\n4. Stop: tap Stop, then choose Today is the last day or Stop from today (no dose today), which appears when the medicine started before today. Reminders end after the last day and history is kept.\n5. Delete: tap Delete and confirm. To keep the history, use Stop instead.\n\nThe Needs your attention box appears when a medicine has no dose time, uses a frequency the app cannot remind, or its in-app count is 0; tap Edit there to fix it. At a count of 0 you can still mark doses given, and reminders continue on schedule until the course ends or you tap Stop. Stop or change a medicine only on your veterinarian’s instructions.',
    },
    medicine_history: {
        th: 'กราฟและบันทึกการให้ยา\n1. เลือกน้อง แล้วเปิด Home > ยา–อาหารเสริม หรือประวัติน้อง > ยา\n2. ดูกราฟและบันทึกการให้ยาของยาแต่ละตัวในช่วง 7 วัน\n3. แตะวันที่เพื่อดูรอบให้ยา หากให้จริงแต่ลืมลง ให้แตะ ไม่ได้บันทึก · แตะบันทึกว่าให้แล้ว\n4. หากลงผิด ให้แตะ ให้แล้ว · แตะแก้ไข แล้วอ่านและยืนยันการแก้ไข\n\nช่องว่างหมายถึงไม่มีบันทึกว่าให้แล้ว ไม่ยืนยันว่าไม่ได้ให้จริง รายการค้างย้อนหลังไม่ส่งเตือนซ้ำ บันทึกเฉพาะสิ่งที่เกิดขึ้นจริงค่ะ',
        en: 'Medicine chart and log\n1. Select the pet and open Home > Medicine and supplements or Records > Medicine.\n2. Review each medicine’s chart and log for the last 7 days.\n3. Tap a date to inspect its dose times. If you actually gave it but forgot to log it, tap Not recorded to mark it given.\n4. If a log is wrong, tap Given to correct it, then read and confirm the correction.\n\nA gap means no given-dose record; it does not prove the dose was missed. Overdue past doses do not generate repeated reminders. Record only what actually happened.',
    },
    records: {
        th: 'ดูประวัติน้อง (Records)\n1. เลือกน้อง แล้วไป Home > ประวัติน้อง / Records\n2. ดูหัวข้อ ประวัติการบันทึก และเลือกตัวกรอง\n3. ถ้าต้องการรายการเพิ่มเติม แตะ ดูทั้งหมด\n4. เพิ่มข้อมูลใหม่ในหัวข้อ เพิ่มบันทึก หรือบันทึกนัดแพทย์\n\nตอนนี้ยังลบหรือแก้รายการวัคซีน พบหมอ น้ำหนัก หรือกิจกรรมทีละรายการไม่ได้ (น้ำหนักที่บันทึกซ้ำในวันเดิมจะแทนค่าเดิม) ส่วนยาแก้ไข หยุด หรือลบได้ที่ ยา-อาหารเสริม > สต็อก และนัดแก้ไขหรือยกเลิกได้ที่แท็บนัดหมาย ตรวจน้องให้ถูกตัว คะแนนการดูแลไม่ใช่ผลวินิจฉัยสุขภาพค่ะ',
        en: 'View Records\n1. Select the pet and open Home > Pet Records (Records).\n2. Review Record history and choose a filter.\n3. Tap View all for additional entries.\n4. Use Add a record or Record a vet appointment to enter new information.\n\nSingle vaccination, vet-visit, weight or activity entries cannot be deleted or edited yet (saving a weight again on the same date replaces it). Medicines can be edited, stopped or deleted in Medicine & Supplements > Stock, and appointments can be edited or cancelled in the Appointments tab. Check the selected pet. The care score is not a health diagnosis.',
    },
    health_history: {
        th: 'บันทึกตรวจสุขภาพหรือพบสัตวแพทย์\n1. เลือกน้อง แล้วเปิด Home > ประวัติน้อง (Records)\n2. ใน เพิ่มบันทึก แตะ พบหมอ\n3. กรอกเหตุผลหรืออาการ คลินิก และโน้ตตามใบตรวจ แล้วเลือกวันที่จากปฏิทิน (ย้อนหลังได้ ไม่เกินวันนี้)\n4. กดบันทึก แล้วตรวจในประวัติการบันทึกของน้อง\n\nเก็บตามข้อเท็จจริงจากสัตวแพทย์ ไม่ใช้บันทึกแทนการวินิจฉัยค่ะ',
        en: 'Record a checkup or vet visit\n1. Select the pet and open Home > Pet Records (Records).\n2. Under Add a record, choose Vet Visit.\n3. Enter the reason or symptom, clinic and notes from the veterinary report, and pick the date from the calendar (past dates allowed, not later than today).\n4. Save and review the pet’s Record history.\n\nRecord the veterinarian’s findings; a record is not a diagnosis.',
    },
    vaccine: {
        th: 'บันทึกวัคซีน\n1. เลือกน้อง แล้วเปิด Home > ประวัติน้อง (Records)\n2. ใน เพิ่มบันทึก แตะ วัคซีน\n3. กรอกชื่อวัคซีน เลือกวันที่ฉีดจากปฏิทิน (ย้อนหลังได้ ไม่เกินวันนี้) และใส่คลินิกตามเอกสารจริง\n4. กดบันทึก แล้วตรวจในประวัติการบันทึก\n\nหรือเปิดหน้าโปรแกรมวัคซีน (Health > ภาพรวม > การ์ด 💉 หรือหน้าข้อมูลน้อง > วัคซีน) แล้วแตะ + บันทึกว่าฉีดแล้ว วันนัดและโปรแกรมวัคซีนให้สัตวแพทย์กำหนด แอปช่วยเก็บข้อมูลค่ะ',
        en: 'Record a vaccination\n1. Select the pet and open Home > Pet Records (Records).\n2. Under Add a record, choose Vaccine.\n3. Enter the vaccine name, pick the administration date from the calendar (past dates allowed, not later than today) and add the clinic from the actual report.\n4. Save and check Record history.\n\nYou can also open the vaccination program page (Health > Overview > the 💉 card, or the pet details page > Vaccinations) and tap + Record a vaccination. A veterinarian must set the vaccination plan and appointment dates. The app stores the information.',
    },
    appointments: {
        th: 'บันทึกนัดหมายส่วนตัว\n1. เลือกน้อง แล้วไป Home > ประวัติน้อง (Records) แล้วแตะ บันทึกนัดแพทย์\n2. กรอก หัวข้อนัด คลินิก / โรงพยาบาลสัตว์ และสัตวแพทย์ (ถ้ามี) เลือก วันที่นัด จากปฏิทิน (วันนี้หรือวันข้างหน้า) และ เวลานัด จากปุ่มเวลาหรือ + เวลาอื่น\n3. ใส่ แจ้งเตือนล่วงหน้า (วัน) ค่าเริ่มต้น 1 วัน · 0 = เตือนตามเวลานัด แล้วแตะ บันทึกนัดแพทย์\n4. ดูนัดทั้งหมดที่แท็บ นัดหมาย (Appointments) แถบล่าง\n\nหรือพิมพ์รายละเอียดนัดในโหมด Agent แล้วแตะ ✅ ยืนยันบันทึก บนการ์ดเสนอนัด ปุ่ม + ในแท็บนัดหมายใช้ค้นหาคลินิก ร้านอาบน้ำ-ตัดขน หรือโรงแรมสัตว์เลี้ยงเพื่อโทรติดต่อ ไม่ได้สร้างนัดให้ นี่คือบันทึกนัดของคุณ ต้องติดต่อคลินิกหรือร้านเพื่อจองคิวเอง แอปไม่จองหรือยืนยันคิวกับร้านค่ะ',
        en: 'Record a personal appointment\n1. Select the pet and open Home > Pet Records (Records), then tap Record a vet appointment.\n2. Enter the Appointment title, Clinic / animal hospital and Veterinarian (optional). Pick the Date from the calendar (today or later) and the Time from a time button or + Other time.\n3. Set Reminder days before (default 1; 0 = at the appointment time), then tap Save appointment.\n4. See all appointments in the Appointments tab at the bottom.\n\nYou can also describe the appointment in Agent mode and tap ✅ Confirm and save on its proposal card. The + button in the Appointments tab searches clinics, groomers or pet hotels for you to contact; it does not create an appointment. This is your personal record: contact the clinic or business to book. The app does not book or confirm availability.',
    },
    appointment_manage: {
        th: 'แก้ไข เลื่อน หรือยกเลิกนัด\n1. เปิดแท็บ นัดหมาย (Appointments) แถบล่าง แล้วหาการ์ดนัดที่ยังไม่ถึงเวลา (ถ้าเลือกวันไว้ ให้แตะ แสดงทุกวัน)\n2. เลื่อนหรือแก้นัด: แตะ ✏️ แก้ไข เลือกวันจากปุ่มลัดหรือปฏิทิน (วันข้างหน้าวันไหนก็ได้) เลือกเวลาจากปุ่มหรือ + เวลาอื่น แก้ แจ้งเตือนล่วงหน้า (วัน) และหมายเหตุ แล้วแตะ 💾 บันทึก\n3. ยกเลิกนัด: แตะ ยกเลิก บนการ์ด แล้วยืนยันในหน้าต่าง ยกเลิกนัดหมาย\n4. นำทาง: แตะ 📍 นำทาง เพื่อเปิดแผนที่ไปยังสถานที่นัด\n\nการแก้หรือยกเลิกในแอปไม่ได้แจ้งคลินิกให้ โปรดโทรเลื่อนหรือยกเลิกกับคลินิกเองด้วยค่ะ',
        en: 'Edit, reschedule or cancel an appointment\n1. Open the Appointments tab at the bottom and find the upcoming appointment card (if a date is selected, tap Show all dates).\n2. Reschedule or edit: tap ✏️ Edit, pick a date from the shortcuts or the calendar (any future date), pick a time button or + Other time, adjust Reminder days before and notes, then tap 💾 Save.\n3. Cancel: tap Cancel on the card and confirm in the Cancel Appointment dialog.\n4. Directions: tap 📍 Navigate to open maps to the place.\n\nEditing or cancelling in the app does not notify the clinic. Call the clinic to reschedule or cancel.',
    },
    nearby_vet: {
        th: 'ค้นหาสัตวแพทย์และสถานที่\n1. ไป Home > เมนูลัด คลินิก-โรงพยาบาล · ร้านอาบน้ำ-ตัดขน · โรงแรมสัตว์เลี้ยง หรือ ร้านอุปกรณ์สัตว์เลี้ยง (หรือปุ่ม + ในแท็บนัดหมาย)\n2. แตะ เปิด GPS เพื่อใช้ตำแหน่งปัจจุบัน หรือ เลือกเมือง และพื้นที่ที่ต้องการ\n3. เปิดรายการเพื่อดูรายละเอียด แผนที่ และเบอร์โทร\n4. ติดต่อสถานที่และตกลงคิวเอง\n\nผลค้นหาไม่ได้แปลว่าเป็นร้านคู่สัญญาหรือมีคิวว่าง แอปไม่รับชำระค่าจองร้านค่ะ',
        en: 'Find vets and local businesses\n1. On Home, use the Vet & Hospital, Grooming Shops, Pet Hotel or Pet Supplies shortcut (or the + button in the Appointments tab).\n2. Tap Enable GPS to use your current location, or Choose city and area.\n3. Open a result for details, maps and phone information.\n4. Contact the business to arrange services yourself.\n\nSearch results do not mean a confirmed partnership or available appointment. The app does not take merchant booking payments.',
    },
    notification_settings: {
        th: 'ตั้งค่าและตรวจการแจ้งเตือน\n1. ที่ Home แตะรูปหรือชื่อบัญชี\n2. เปิดหัวข้อ การแจ้งเตือน แล้วปรับสวิตช์ แจ้งเตือนนัดหมาย และ แจ้งเตือนยา/วัคซีน\n3. แตะ ตรวจสถานะแจ้งเตือน และตรวจสิทธิ์ของ PetCare ในการตั้งค่าเครื่อง บน Android ถ้าขึ้นว่ายังไม่อนุญาตตั้งเตือนตามเวลา ให้แตะ เปิดตั้งค่า Android\n4. ตรวจรายการยาและเวลาที่ตั้งไว้ หากเปิดจากการเตือนให้ตรวจน้องและรายการที่ปลายทาง\n\nสวิตช์ในแอปไม่ข้ามสิทธิ์ของเครื่อง ยาค้างย้อนหลังใช้ดูในกราฟ ไม่ส่งเตือนซ้ำ การได้รับแจ้งเตือนจริงยังขึ้นกับสิทธิ์และระบบเครื่อง ถ้าแจ้งเตือนไม่มา ถามว่า “ทำไมไม่เตือน” เพื่อดูวิธีตรวจทีละข้อค่ะ',
        en: 'Set up and check notifications\n1. Tap your account photo or name on Home.\n2. Open Notifications and adjust Appointment notifications and Medicine & vaccine reminders.\n3. Tap Check notification status and check PetCare’s permission in device Settings. On Android, if exact alarms are not allowed, tap Open Android settings.\n4. Check medicine times and verify the pet and item when opening a reminder.\n\nAn app switch cannot override device permissions. Past overdue medicine doses stay in the graph without repeated reminders. Delivery also depends on the device’s permissions and operating system. If reminders do not arrive, ask “why no reminder” for a step-by-step check.',
    },
    reminder_troubleshoot: {
        th: 'ทำไมไม่มีแจ้งเตือน (หรือยังเตือนอยู่)\n1. เปิด Home > ยา-อาหารเสริม แล้วดูกล่อง ยาที่ต้องแก้ ยาที่ยังไม่ได้ตั้งเวลา หรือใช้ความถี่ที่แอปตั้งเตือนไม่ได้ จะไม่มีแจ้งเตือน ให้แตะ แก้ไข แล้วเลือกเวลาและความถี่จากตัวเลือก\n2. ตรวจว่าวันนี้ยังอยู่ในช่วงคอร์ส ยาที่เลยวันสุดท้ายหรือกดหยุดยาแล้วจะไม่เตือน\n3. ที่ Home แตะรูปหรือชื่อบัญชี > การแจ้งเตือน เปิดสวิตช์ แจ้งเตือนยา/วัคซีน หรือ แจ้งเตือนนัดหมาย แตะ ตรวจสถานะแจ้งเตือน และตรวจสิทธิ์แจ้งเตือนของ PetCare ในการตั้งค่าเครื่อง\n4. Android: ถ้าขึ้นว่ายังไม่อนุญาตตั้งเตือนตามเวลา ให้แตะ เปิดตั้งค่า Android แล้วอนุญาต\n5. แอปตั้งคิวเตือนล่วงหน้าเป็นช่วง ๆ ควรเปิดแอปทุกไม่กี่วัน ถ้าไม่ได้เปิดนาน จะเหลือแจ้งเตือนสรุปวันละครั้งไม่เกิน 30 วัน และยารายเดือนที่รอบถัดไปห่างเกิน 30 วัน จะถูกตั้งเตือนเมื่อเปิดแอปครั้งถัดไป\n\nยาหมดแล้วยังเตือน: การเตือนเป็นไปตามตารางยา ไม่ได้ดูจำนวนยา ถ้าหมอสั่งหยุด ให้ไปแท็บ สต็อก แล้วแตะ หยุดยา ถ้ามียาเพิ่ม ให้แตะ แก้ไข แล้ว + เติม จำนวนเป็น 0 ก็ยังบันทึกว่าให้แล้วได้ค่ะ',
        en: 'Why a reminder did not arrive (or keeps arriving)\n1. Open Home > Medicine & Supplements and check the Needs your attention box. A medicine with no dose time, or with a frequency the app cannot remind, gets no reminder; tap Edit and choose times and a listed frequency.\n2. Check that today is within the course. Medicines past their last day, or stopped, are not reminded.\n3. Tap your account photo or name on Home > Notifications, turn on Medicine & vaccine reminders or Appointment notifications, tap Check notification status, and check PetCare’s notification permission in device Settings.\n4. Android: if it says exact alarms are not allowed, tap Open Android settings and allow them.\n5. The app schedules reminders ahead in batches, so open it every few days. If it stays closed, only a daily summary remains, for up to 30 days. A monthly medicine whose next dose is more than 30 days away is scheduled the next time you open the app.\n\nStill reminded after running out: reminders follow the medicine schedule, not the stock count. If your veterinarian says to stop, open the Stock tab and tap Stop. If you have more, tap Edit and use + Add. You can still mark doses given at a count of 0.',
    },
    date_time_pickers: {
        th: 'เลือกวันที่และเวลา\n1. ช่องวันที่ไม่ต้องพิมพ์ แตะช่องเพื่อเปิดปฏิทิน แล้วแตะวันที่ต้องการ ใช้ลูกศร ◀ ▶ เปลี่ยนเดือน หรือแตะชื่อเดือนเพื่อเลือกปี\n2. บันทึกสุขภาพ เช่น น้ำหนัก กิจกรรม วัคซีน และพบหมอ เลือกวันย้อนหลังได้ แต่เลือกวันในอนาคตไม่ได้ ส่วนวันนัดและวันสุดท้ายของคอร์สยาเลือกได้ตั้งแต่วันนี้เป็นต้นไป\n3. เวลา: แตะปุ่มเวลาที่มี หรือแตะ + เวลาอื่น แล้วเลือกชั่วโมงและนาที (นาทีละ 10 นาที) จากนั้นแตะ ตกลง\n4. ช่องเวลากินยาเลือกได้หลายเวลา แตะเวลาที่เลือกไว้อีกครั้งเพื่อเอาออก\n\nวันที่แสดงแบบ 26 ต.ค. 2569 เมื่อใช้ภาษาไทยค่ะ',
        en: 'Pick dates and times\n1. Date fields need no typing: tap the field to open the calendar and tap the day. Use the ◀ ▶ arrows to change month, or tap the month name to choose a year.\n2. Health records such as weight, activities, vaccinations and vet visits can be back-dated but not set in the future. Appointment dates and a medicine’s last day start from today.\n3. Times: tap a time button, or tap + Other time, choose the hour and minute (10-minute steps), then tap OK.\n4. Dose times can hold several times; tap a selected time again to remove it.\n\nIn English, dates are shown like 26 Oct 2026.',
    },
    language_settings: {
        th: 'เปลี่ยนภาษา\n1. ที่ Home แตะรูปหรือชื่อบัญชี\n2. ไป ตั้งค่า > ภาษา\n3. เลือก ไทย หรือ English\n4. กลับมาเปิดหน้าที่ใช้งานและตรวจภาษาของเมนูกับ Free Chat\n\nชื่อสัตว์ ข้อมูลที่กรอก และข้อความเก่าไม่ถูกแปลหรือแก้ไขโดยการสลับภาษาค่ะ',
        en: 'Change language\n1. Tap your account photo or name on Home.\n2. Go to Settings > Language.\n3. Select Thai or English.\n4. Reopen the relevant screen and check the menu and Free Chat language.\n\nSwitching language does not translate pet names, your saved text or earlier chat messages.',
    },
    location_permission: {
        th: 'อนุญาตตำแหน่ง\n1. เปิดค้นหาสถานที่และเลือกตำแหน่งปัจจุบัน\n2. อนุญาตเมื่อเครื่องถาม\n3. หากไม่อนุญาต ให้เลือกเมืองหรือพื้นที่เอง\n4. หากเคยปฏิเสธ ให้ตรวจสิทธิ์ตำแหน่งของ PetCare ในการตั้งค่าเครื่อง\n\nใช้ตำแหน่งเพื่อค้นหา ไม่ใช่ยืนยันการจองค่ะ',
        en: 'Allow location access\n1. Open business search and choose your current location.\n2. Allow access when your device asks.\n3. If you decline, choose a city or area manually.\n4. If access was previously denied, check PetCare’s location permission in device Settings.\n\nLocation is used for search, not for booking confirmation.',
    },
    chat_mode: {
        th: 'เลือกโหมดแชท\n1. เปิด AI Chat แล้วตรวจชื่อน้อง\n2. เลือก Chat ธรรมดา เพื่อถามข้อมูลที่บันทึกและวิธีใช้แอปได้ฟรี\n3. Agent เป็นอีกโหมดและแสดงค่าใช้ Paw Coin ก่อนส่ง\n4. ถ้าเล่าข้อมูล เช่น น้ำหนัก ยา วัคซีน หรือนัด ในโหมด Agent จะมีการ์ดให้ตรวจ แล้วแตะ ยืนยันบันทึก ก่อนบันทึกจริง (ยาต้องเลือกเวลาให้ยาในการ์ดก่อน) หรือบันทึกเองที่หน้าบันทึก แล้วตรวจประวัติหลังบันทึก\n\nChat ธรรมดาไม่แก้ข้อมูลให้ ไม่วินิจฉัยหรือกำหนดยา และไม่หัก Paw Coin ค่ะ',
        en: 'Choose a chat mode\n1. Open AI Chat and check the pet.\n2. Choose Free Chat for saved records and app instructions at no charge.\n3. Agent is a separate mode with a Paw Coin cost shown before sending.\n4. If you describe a weight, medicine, vaccination or appointment in Agent mode, it shows a card to review; tap Confirm save before anything is saved (a medicine needs its dose times chosen on the card first). You can also use the entry screens, then verify the saved history.\n\nFree Chat does not edit records, diagnose illness or prescribe medicines, and does not spend Paw Coin.',
    },
    chat_context: {
        th: 'ข้อมูลรายตัวใน Chat ธรรมดา\n1. เลือกชื่อน้องจากแถบด้านบนและตรวจน้องก่อนถาม\n2. ถามน้ำหนัก ยา วัคซีน หรือข้อมูลที่มีบันทึก\n3. หากระบุชื่อซ้ำหรือหลายตัว ระบบอาจขอให้เลือกให้ชัดเจนก่อน\n4. สลับน้องแล้วตรวจว่าอ่านข้อมูลของน้องที่ต้องการ\n\nการพิมพ์ในแชทไม่แทนการบันทึกสุขภาพ และข้อมูลที่ยังไม่บันทึกไม่ควรถูกเดาขึ้นมาค่ะ',
        en: 'Pet-specific Free Chat records\n1. Choose a pet in the selector and check it before asking.\n2. Ask about saved weight, medicine, vaccinations or other available records.\n3. Duplicate names or multiple pets may require an explicit selection.\n4. Switch pets and check that the intended pet’s records are used.\n\nTyping in chat does not save a health record. Missing records must not be invented.',
    },
    save_problem: {
        th: 'บันทึกไม่สำเร็จหรือหาไม่เจอ\n1. ตรวจว่ายังล็อกอินและเลือกน้องถูกตัว\n2. ตรวจช่องจำเป็น วันที่ และอินเทอร์เน็ต\n3. หากขึ้นข้อผิดพลาด เก็บข้อความนั้นไว้ แล้วเปิดประวัติหรือกราฟเพื่อตรวจว่ามีรายการหรือไม่\n4. อย่ากดบันทึกซ้ำหากยังไม่แน่ใจว่ารายการแรกเข้าแล้ว\n\nหากยังไม่พบ ให้บอกหน้าที่ใช้ ประเภทรายการ และข้อความผิดพลาด ไม่ส่งรหัสผ่านหรือ OTP ค่ะ',
        en: 'A record did not save or cannot be found\n1. Check that you are signed in and have selected the correct pet.\n2. Check required fields, the date and your internet connection.\n3. Keep the error text and inspect the history or graph for the record.\n4. Do not repeatedly save while unsure whether the first entry succeeded.\n\nIf it is still missing, describe the screen, record type and error. Never send your password or OTP.',
    },
    auth_register: {
        th: 'สมัครบัญชี\n1. ที่หน้าเข้าสู่ระบบ แตะ สมัครสมาชิก\n2. กรอกข้อมูลและตรวจข้อกำหนดที่แสดง\n3. ดำเนินการตามขั้นตอนยืนยันอีเมลที่ระบบแจ้ง\n4. เมื่อเข้าได้ ให้เพิ่มน้องที่ Home\n\nไม่ส่งรหัสผ่านหรือ OTP ในแชทค่ะ',
        en: 'Create an account\n1. On the login screen, tap Sign up.\n2. Complete the fields and review the displayed terms.\n3. Follow any email verification instructions shown.\n4. After signing in, add your pet on Home.\n\nNever share your password or OTP in chat.',
    },
    password_reset: {
        th: 'ลืมรหัสผ่าน\n1. ที่หน้าเข้าสู่ระบบ กรอกอีเมลบัญชีในช่อง อีเมล ก่อน\n2. แตะ ลืมรหัสผ่าน? ระบบจะส่งลิงก์ตั้งรหัสผ่านใหม่ไปที่อีเมลนั้น ถ้าอีเมลนี้อยู่ในระบบ\n3. เปิดอีเมล รวมถึงโฟลเดอร์สแปม แล้วแตะลิงก์\n4. ตั้ง รหัสผ่านใหม่ อย่างน้อย 8 ตัวอักษร ยืนยันอีกครั้ง แตะ บันทึกรหัสผ่านใหม่ แล้วเข้าสู่ระบบ\n\nถ้าลิงก์หมดอายุ ให้แตะ กลับไปขอลิงก์ใหม่ อย่าส่งลิงก์รีเซ็ต รหัสผ่าน หรือ OTP ให้ใครค่ะ',
        en: 'Reset your password\n1. On the sign-in screen, enter your account email in the Email field first.\n2. Tap Forgot password?. If the email has an account, a reset link is sent to it.\n3. Check your inbox, including spam, and open the link.\n4. Enter a New password of at least 8 characters, confirm it, tap Save new password, and sign in.\n\nIf the link has expired, tap Request a new link. Do not share reset links, passwords or OTPs.',
    },
    edit_pet: {
        th: 'แก้ไขข้อมูลน้อง\nแก้ได้ 2 ทาง\n1. Home > เมนูลัด ประวัติน้อง (Records) > แตะ แก้ไขข้อมูลน้อง ด้านบน แก้ชื่อ แพ้ / ข้อห้าม และโน้ต แล้วแตะ 💾 บันทึกการแก้ไข\n2. Home > แตะรูปน้อง > 📋 ดูประวัติเต็ม > แตะ ⋯ มุมขวาบน > ✏️ แก้ชื่อ/สายพันธุ์ (แก้ชื่อ ชื่อเรียกในแชต สายพันธุ์ และสี) หรือ 📸 เปลี่ยนรูป\n\nชื่อเรียกในแชต ใส่ได้ไม่เกิน 8 ชื่อ คั่นด้วยเครื่องหมายจุลภาค (,) เพื่อให้แชทรู้ว่าหมายถึงน้องตัวไหน น้ำหนักใหม่ให้บันทึกที่ Health > น้ำหนัก เพื่อเก็บกราฟ แชทนี้ยังไม่ได้แก้ข้อมูลให้ค่ะ',
        en: 'Edit a pet profile\nThere are two ways.\n1. Home > Pet Records (Records) > tap Edit pet details at the top, change the name, allergies / restrictions and notes, then tap Save Changes.\n2. Home > tap the pet > View full history > tap ⋯ at the top right > Edit name / breed (name, chat aliases, breed and color) or Change photo.\n\nChat aliases (up to 8, separated by commas) help chat identify the right pet. Log new weighings in Health > Weight to keep the graph. This chat has not edited your data.',
    },
    delete_pet: {
        th: 'ลบโปรไฟล์สัตว์เลี้ยง\n1. ที่ Home แตะรูปน้องตัวที่ต้องการ แล้วแตะ 📋 ดูประวัติเต็ม\n2. ตรวจว่าเป็นน้องตัวที่ถูกต้อง แล้วแตะ ⋯ มุมขวาบน\n3. แตะ 🗑️ ลบสัตว์เลี้ยง และอ่านคำเตือน: ข้อมูลทั้งหมดของน้องตัวนี้ รวมถึงรูป การ์ดน้อง และการแจ้งเตือนจะถูกลบ\n4. แตะ ยืนยันลบสัตว์เลี้ยง เมื่อแน่ใจเท่านั้น หรือแตะ ยกเลิก\n\nแชทนี้ไม่ได้ลบข้อมูลให้ การลบเป็นการเปลี่ยนแปลงข้อมูลสำคัญค่ะ',
        en: 'Delete a pet profile\n1. On Home, tap the pet, then tap View full history.\n2. Check that it is the right pet, then tap ⋯ at the top right.\n3. Tap Delete pet and read the warning: all records, photos, pet cards and reminders for this pet will be removed.\n4. Tap Delete pet again to confirm only when you are sure, or tap Cancel.\n\nThis chat has not deleted anything. Deletion is a significant data change.',
    },
    paw_coin: {
        th: 'ดู Paw Coin และรับเหรียญ\n1. แตะยอดเหรียญมุมขวาบนของหน้า Home เพื่อเปิด Paw Coin ของคุณ\n2. ดูยอด ได้รับทั้งหมด ใช้ไปทั้งหมด และแตะ ประวัติ เพื่อดูรายการ\n3. แตะ 📅 Check-in วันนี้ วันละครั้งเพื่อรับเหรียญ หรือรับเพิ่มจากการชวนเพื่อน\n4. เหรียญใช้กับ Agent (ค่าใช้ต่อข้อความแสดงที่ปุ่ม Agent) และการ์ตูน AI ในการ์ดน้อง\n\nตอนนี้ยังซื้อหรือเติม Paw Coin ด้วยเงินจริงในแอปไม่ได้ Chat ธรรมดาไม่หักเหรียญ และ Paw Coin แยกจากค่าสมาชิกค่ะ',
        en: 'View Paw Coin and earn coins\n1. Tap the coin balance at the top right of Home to open Your Paw Coin.\n2. Check Total earned and Total spent, and tap History for transactions.\n3. Tap Check in today once a day to earn coins, or earn more by inviting friends.\n4. Coins are used for Agent (the cost per message is shown on the Agent button) and AI cartoons on pet cards.\n\nPaw Coin cannot be bought with real money in the app yet. Free Chat does not spend coins, and Paw Coin is separate from membership.',
    },
    membership: {
        th: 'ดูหรือจัดการสมาชิก\n1. ที่ Home แตะการ์ด PetCare AI 360 ด้านบน หรือแตะรูปหรือชื่อบัญชี > สมาชิก PetCare AI 360\n2. ถ้ายังไม่เริ่ม แตะ เริ่มใช้ฟรี 3 เดือน (นับจากวันที่กด) แล้วหน้าเดิมจะแสดงวันสิ้นสุดช่วงทดลองใช้\n3. ถ้าสถานะยังไม่อัปเดต แตะ ตรวจสอบสถานะอีกครั้ง\n\nรายละเอียดแพ็กเกจหลังช่วงทดลองใช้ให้ดูที่หน้าสมาชิกในแอป ถ้าสมัครผ่านร้านค้า ให้จัดการการต่ออายุหรือยกเลิกในร้านค้านั้น สมาชิกไม่รวม Paw Coin ของ Agent การยกเลิกสมาชิกไม่ใช่การลบบัญชี และไม่ใช่สมาชิก Apple Developer ค่ะ',
        en: 'View or manage membership\n1. On Home, tap the PetCare AI 360 card near the top, or tap your account photo or name > PetCare AI 360 Membership.\n2. If you have not started, tap Start 3-month free trial (it starts when you tap). The screen then shows when your trial ends.\n3. If the status has not updated, tap Check status again.\n\nSee the membership screen in the app for plan details after the trial. If you subscribed through an app store, manage renewal or cancellation in that store. Membership does not include Agent Paw Coin. Cancelling membership does not delete your account and is unrelated to Apple Developer membership.',
    },
    referral: {
        th: 'ชวนเพื่อนและใช้โค้ด\n1. เปิดแท็บ ชวนเพื่อน หรือเมนู แนะนำเพื่อน\n2. ดูและแชร์โค้ดของคุณ\n3. ผู้รับใช้บัญชีของตัวเองและกรอกโค้ดในเมนูที่แสดง\n4. อ่านเงื่อนไขรางวัลก่อนยืนยัน\n\nไม่ส่งโค้ดซ้ำเพื่อทดสอบรางวัล และไม่แชร์รหัสผ่านหรือข้อมูลสุขภาพค่ะ',
        en: 'Invite friends and use a code\n1. Open Invite friends or the Referral menu.\n2. View and share your invitation code.\n3. The recipient uses their own account and enters the code in the available entry.\n4. Review the reward conditions before confirming.\n\nDo not repeatedly submit a code to test rewards or share passwords or health records.',
    },
    buddy: {
        th: 'Buddy (น้องลอย)\n1. ถ้าน้องลอยบังปุ่มหรือข้อมูล ให้แตะค้างแล้วลากไปไว้ตำแหน่งอื่น หรือเลื่อนหน้าจอให้เนื้อหาพ้นตัวน้อง\n2. แตะน้องลอยหนึ่งครั้งเพื่อเปิดเมนู แล้วแตะ เปลี่ยนเพื่อน เพื่อดูรายการเพื่อนซี้\n3. น้องแต่ละตัวเลือกเพื่อนซี้ได้ฟรี 1 ตัว (หรือแตะ เพื่อนซี้ ในการ์ดข้อมูลน้องที่ Home) เลือกแล้วยังเปลี่ยนไม่ได้ จะเปลี่ยนได้ในเวอร์ชันถัดไป\n\nน้องลอยตั้งใจให้อยู่บนจอเสมอ จึงไม่มีปุ่มปิดหรือซ่อน ถ้าบังอยู่ให้ลากไปไว้ที่อื่นหรือเลื่อนหน้าจอค่ะ',
        en: 'Buddy (floating companion)\n1. If Buddy covers a button or information, press and drag it elsewhere, or scroll the screen.\n2. Tap Buddy once to open its menu, then tap Change buddy to see the companions.\n3. Each pet can have one free companion (you can also tap Companion on the pet details card on Home). Once chosen it cannot be changed yet; changing is planned for a future version.\n\nBuddy stays on screen by design, so there is no switch to hide or remove it. If it covers something, drag it elsewhere or scroll.',
    },
    tutorial: {
        th: 'เปิดคำแนะนำในแอป\nที่ Home แตะรูปหรือชื่อบัญชี แล้วเปิด ช่วยเหลือ เพื่อดูคำแนะนำการใช้งาน หรือถามวิธีใช้ใน Chat ธรรมดาได้ฟรี\n\nบอกชื่อหน้าหรือสิ่งที่อยากทำเพื่อให้แนะนำขั้นตอนตรงเรื่องค่ะ',
        en: 'Open app help\nTap your account photo or name on Home and open Help for the tutorial. You can also ask Free Chat for app instructions at no coin cost.\n\nInclude the screen or action you need help with.',
    },
    camera_ai: {
        th: 'Camera AI\nเวอร์ชันนี้ยังไม่มี Camera AI จึงยังสแกนหรือดูสุขภาพจากรูปไม่ได้ บันทึกสุขภาพได้ที่ ประวัติน้อง และ Health\n\nภาพและอาการของสัตว์ต้องให้สัตวแพทย์ประเมิน หากมีความเสี่ยงให้ติดต่อสัตวแพทย์ค่ะ',
        en: 'Camera AI\nCamera AI is not part of this version, so photo scanning and health checks from photos are unavailable. Keep health records in Pet Records and Health.\n\nA veterinarian must assess animal symptoms and health concerns. Contact one if there is a risk.',
    },
    unavailable_features: {
        th: 'ฟีเจอร์ที่ยังไม่เปิดให้ใช้\nในเวอร์ชันนี้ยังใช้ไม่ได้: ชุมชน · ประกวด Paw Cup · หาบ้านให้น้อง · ซื้อหรือเติม Paw Coin ด้วยเงินจริง · ย้ายหรือโอนน้องไปบัญชีอื่น · เข้าสู่ระบบด้วย Google, Apple, LINE หรือบัญชีโซเชียลอื่น (ตอนนี้ใช้อีเมลและรหัสผ่านเท่านั้น) · Camera AI สแกนสุขภาพจากรูป\n\nที่ใช้ได้ตอนนี้: ทะเบียนน้อง ประวัติสุขภาพ ยาและการเตือน นัดหมาย ค้นหาคลินิกและร้าน การ์ดน้อง และ Chat ค่ะ',
        en: 'Features not available yet\nNot available in this version: Community, the Paw Cup contest, pet adoption listings, buying or topping up Paw Coin with real money, moving or transferring a pet to another account, signing in with Google, Apple, LINE or other social accounts (sign-in is email and password only), and Camera AI photo health scans.\n\nAvailable now: pet profiles, health records, medicines and reminders, appointments, clinic and business search, pet cards and chat.',
    },
    account_delete: {
        th: 'ลบบัญชี\n1. ที่ Home แตะรูปหรือชื่อบัญชี เลื่อนลงไปที่ ตั้งค่า แล้วแตะ 🗑️ ลบบัญชี\n2. อ่านผลกระทบ กรอก รหัสผ่าน (เหตุผลไม่บังคับ) แล้วแตะ ยืนยันและขอลบบัญชี ถ้าจำรหัสผ่านไม่ได้ ให้แตะ จำรหัสผ่านไม่ได้? ยืนยันทางอีเมลแทน แล้วกรอกรหัสตัวเลขจากอีเมล\n3. ระบบเก็บข้อมูลไว้ 30 วันแล้วจึงลบถาวร แชตที่เก็บในเครื่องนี้ถูกลบทันทีเมื่อยืนยัน\n4. ถ้าเปลี่ยนใจภายใน 30 วัน ให้เข้าสู่ระบบด้วยบัญชีเดิม แล้วแตะ กู้คืนบัญชี\n\nแชทนี้ไม่ได้ลบบัญชีให้ การลบบัญชีไม่ใช่การยกเลิกการต่ออายุสมาชิกในร้านค้า อย่าลบบัญชีเพื่อแก้ปัญหาเข้าสู่ระบบค่ะ',
        en: 'Delete an account\n1. Tap your account photo or name on Home, scroll to Settings and tap Delete Account.\n2. Read the consequences, enter your Password (the reason is optional) and tap Confirm and request deletion. If you forgot your password, tap Forgot your password? Verify by email instead and enter the number code from your email.\n3. Your data is kept for 30 days and then permanently deleted. Chats stored on this device are deleted as soon as you confirm.\n4. To change your mind within 30 days, sign in with the same account and tap Restore account.\n\nThis chat has not deleted your account. Deleting the account does not cancel an app-store subscription renewal. Do not delete your account to fix a login problem.',
    },
    pet_card: {
        th: 'สร้างหรือดูการ์ดน้อง\n1. ที่ Home แตะรูปหรือชื่อบัญชี > การ์ดน้องของฉัน\n2. แตะ สร้างการ์ดน้อง หรือเลือกการ์ดเดิมเพื่อแก้ไข\n3. ตรวจน้องและข้อมูลในแบบฟอร์มก่อนบันทึกหรือแชร์\n4. หากเลือกตัวเลือก AI ให้ตรวจค่าใช้เหรียญที่หน้าจอแสดงก่อนยืนยัน\n\nการ์ดเป็นข้อมูลที่ผู้ใช้จัดทำ ไม่ใช่ใบรับรองสุขภาพจากสัตวแพทย์ค่ะ',
        en: 'Create or view a pet card\n1. Tap your account photo or name on Home > My Pet Cards.\n2. Tap Create pet card or choose an existing card to edit.\n3. Check the pet and form details before saving or sharing.\n4. For AI options, check any displayed coin cost before confirming.\n\nA user-created card is not a veterinary health certificate.',
    },
    certificates: {
        th: 'ดูใบเซอร์ของฉัน\nที่ Home แตะรูปหรือชื่อบัญชี > ใบเซอร์ของฉัน เลือกรายการที่มี แล้วเปิด ดูใบเซอร์ / Verify เพื่อดูรายละเอียดและสถานะ\n\nหากไม่มีข้อมูลจะขึ้นว่ายังไม่มีใบเซอร์ แชทไม่สร้างหรือรับรองใบเซอร์ให้ และเมนูนี้ไม่ยืนยันว่าเปิดรับโอนจากฟาร์มแล้วค่ะ',
        en: 'View My certificates\nTap your account photo or name on Home > My Certificates. Choose an available entry and use View / verify certificate to inspect its details and status.\n\nIf none exist, the screen shows No certificates yet. Chat does not issue or certify documents, and this menu does not mean farm transfers are enabled.',
    },
    privacy: {
        th: 'อ่านนโยบายและข้อกำหนด\nที่ Home แตะรูปหรือชื่อบัญชี แล้วเลือก ความเป็นส่วนตัว หรือ เงื่อนไขการใช้งาน เพื่ออ่านเอกสารที่แอปแสดง หากพบปัญหาให้แจ้งชื่อหน้าและข้อความผิดพลาด โดยไม่ส่งรหัสผ่าน OTP หรือลิงก์รีเซ็ต\n\nตรวจข้อมูลส่วนตัวก่อนแชร์การ์ดหรือภาพหน้าจอค่ะ',
        en: 'Read privacy and terms\nTap your account photo or name on Home and open Privacy or Terms of Service to read the documents shown by the app. Report problems with the screen name and error text, without sending passwords, OTPs or reset links.\n\nCheck personal information before sharing cards or screenshots.',
    },
};

},
"english":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnglishSmartBotReply = getEnglishSmartBotReply;
const petDisplay_1 = require("./petDisplay");
const bookingView_1 = require("./bookingView");
const petScope_1 = require("./petScope");
const clinicalDecision_1 = require("./clinicalDecision");
const catNightVocalization_1 = require("./catNightVocalization");
const feedingManagement_1 = require("./feedingManagement");
const catHouseholdCare_1 = require("./catHouseholdCare");
const socialSpeciesCare_1 = require("./socialSpeciesCare");
const riskBoundary_1 = require("./riskBoundary");
const appHelp_1 = require("./appHelp");
const ingestion_1 = require("./ingestion");
const dateFormat_1 = require("./dateFormat");
const emergencySource = 'https://www.aspca.org/pet-care/general-pet-care/emergency-care-your-pet';
const EN_HUMAN_MEDS = String.raw `(?:(?:my|human|someone'?s|mom'?s|dad'?s|skin|hand|face|topical|pain(?:-relief)?|hydrocortisone|steroid|antibiotic|numbing|diaper|hemorrhoid|eczema|acne|muscle|sun|anti-itch) (?:creams?|gels?|lotions?|ointments?)|(?:the |some |a )?(?:creams?|gels?|lotions?|ointments?) (?:on|from) (?:my|her|his|our|the) (?:arm|hand|face|leg|skin|body|feet|foot|neck)|(?:my |human )?(?:sunscreen|sunblock|sun cream|mouthwash)|(?:human|my|our|regular|fluoride|whitening|mint) toothpaste|ointments?|essential oils?|tea tree oil|tiger balm|deep heat|voltaren|bengay|icy hot|minoxidil|rogaine|hair (?:growth|loss) (?:treatment|products?|serum)|nicotine (?:patch(?:es)?|gum)|paracetamol|acetaminophen|tylenol|panadol|ibuprofen|advil|nurofen|motrin|brufen|naproxen|aleve|aspirin|painkillers?|pain relievers?|human (?:medicines?|medications?|pills?|tablets?|meds)|(?:my|our|mom'?s|dad'?s|grandma'?s|grandpa'?s|someone'?s|the family'?s) (?:pills?|tablets?|capsules?|medicines?|medications?|meds|painkillers?))`;
// "My dog bit open a tube of toothpaste" is the pet's exposure; a person bitten or scratched is not.
const EN_HUMAN_VICTIM = /\b(?:bit|bitten|scratch(?:ed)?)\s+(?:me|us|him|her|them|my (?:son|daughter|kid|child|baby|wife|husband|partner|friend|mom|mum|dad|mother|father|neighbou?r|hand|arm|leg|finger|face|foot|toe|nose|ear))\b|\b(?:i|we|he|she|they)\s+(?:was|were|got|have been|has been)\s+(?:bit|bitten|scratched)\b|\brabies\b/;
// "Can I give my dog paracetamol?" / "can I give two tablets" / "increase to 3 times a day"
// are medicine decisions for the veterinarian, never app instructions.
const EN_MEDICINE_DECISION = new RegExp(String.raw `\b(?:half|quarter|third|part|portion|piece|fraction)s?\s+(?:of\s+)?(?:an?\s+|the\s+|his\s+|her\s+|its\s+|my\s+|one\s+|each\s+|this\s+|that\s+)?(?:(?!bottle|pack|box|strip|blister|container|jar)[a-z-]+\s+){0,2}?(?:pills?|tablets?|capsules?|chews?|chewables?|doses?|meds|medicines?|medications?)\b|\b(?:cut|split|halve|break|crush|divide)\b.{0,20}\b(?:pills?|tablets?|capsules?|meds?|medicines?|doses?)\b|\b(?:pills?|tablets?|doses?)\b.{0,15}\bin (?:half|two)\b|\bhalf (?:a |the )?(?:pill|tablet|dose)\b|\b(?:can|could|should|may|shall)\s+(?:i|we)\s+(?:give|use|put|apply|rub|add|try|double|split|halve|increase|decrease|raise|lower|reduce)\b.{0,40}\b(?:${EN_HUMAN_MEDS}|(?:\d+|one|two|three|four|five|half|another|extra|more|a second|a double)\s*(?:an?\s+)?(?:tablets?|pills?|capsules?|drops?|ml|mg|doses?|times?\b))|\bis it (?:ok|okay|safe|fine) to (?:give|use)\b.{0,30}\b${EN_HUMAN_MEDS}|\b(?:increase|decrease|raise|lower|reduce|change|up)\b.{0,25}\b(?:to\s+)?(?:\d+|one|two|three|four|twice|three times|four times)\s*(?:times?\s*)?(?:a|per)\s*day\b`, 'i');
const poisonSource = 'https://www.aspca.org/news/what-expect-emergency-veterinarian-after-toxin-exposure';
function reply(text, kind, intent, sources) {
    return { text, kind, intent, confidence: 1, suggestAgent: false, sources };
}
function nameMentioned(question, name) {
    const normalizedName = name.normalize('NFC').trim().toLowerCase();
    if (!normalizedName)
        return false;
    const index = question.indexOf(normalizedName);
    if (index < 0)
        return false;
    const before = question[index - 1] || '';
    const after = question[index + normalizedName.length] || '';
    // English word boundary; Thai pet names have no spaces inside their names.
    return !/[a-z0-9]/i.test(before) && !/[a-z0-9]/i.test(after);
}
function speciesName(species) {
    const value = species.toLowerCase();
    if (value === 'dog' || value === 'สุนัข' || value === 'หมา')
        return 'dog';
    if (value === 'cat' || value === 'แมว')
        return 'cat';
    return 'pet';
}
function activityUnitEnglish(unit) {
    const labels = { 'ชม.': 'hrs', 'ชม': 'hrs', 'ชั่วโมง': 'hrs', 'นาที': 'min', 'มื้อ': 'meals', 'ครั้ง': 'times', 'มล.': 'ml', 'กรัม': 'g', 'กม.': 'km', 'เมตร': 'm' };
    return labels[unit.trim()] || unit;
}
/** Offline English free-chat path. All facts come from the signed-in owner's records. */
function getEnglishSmartBotReplyCore(message, pet, context) {
    const q = String(message || '').normalize('NFC').trim().toLowerCase();
    if (!q)
        return reply('Ask me about your pets or their saved records. 🐾', 'smalltalk', 'empty');
    const ownerPets = context?.ownerPets || [];
    const profiles = context?.ownerProfiles || [];
    const mentionedPets = ownerPets.filter((p) => nameMentioned(q, p.name));
    const referenceMessage = (0, petScope_1.petReferenceText)(q, profiles);
    const { matchedProfiles: fullNameProfiles, remainingText: remainingNameText } = (0, petScope_1.matchCanonicalPetNames)(referenceMessage, profiles);
    const mentionedProfiles = profiles.filter((p) => fullNameProfiles.some(full => full.id === p.id) || (p.aliases || []).some((alias) => nameMentioned(remainingNameText, alias)));
    const namedScope = (0, petScope_1.resolveNamedPetScope)(q, mentionedProfiles, pet, context?.explicitPetSelection);
    const missingNamedProfile = mentionedPets.length > 0 && !mentionedProfiles.length && !mentionedPets.some(p => p.id === pet?.id);
    const target = missingNamedProfile ? null : namedScope.target;
    // Risk routing must precede greetings and ordinary record lookups.
    const lily = (0, clinicalDecision_1.matchLilyExposure)(q, target?.species, 'en');
    if (lily)
        return lily;
    const birdUrgency = (0, socialSpeciesCare_1.birdUrgencyReply)(q, 'en');
    if (birdUrgency)
        return birdUrgency;
    // A pet that swallowed, licked or chewed a non-food product (structural detector, 26 Oct 2026
    // round 5). The pet's own medicine as prescribed is not an accident; "can I give…" stays clinical.
    const humanMedicineIngestion = (0, ingestion_1.isAccidentalIngestionEn)(q, target?.species);
    if (humanMedicineIngestion && !EN_HUMAN_VICTIM.test(q)) {
        return reply('This could be an emergency. Contact a veterinarian or an emergency animal hospital immediately. Do not induce vomiting or give a treatment unless a veterinarian tells you to.', 'emergency', 'toxic_exposure', [poisonSource]);
    }
    if (/\b(i|me|my|we|us|human|person|child|kid)\b.*\b(bit(?:ten)?|scratch(?:ed)?|rabies|expos(?:ed|ure))\b|\b(bit(?:ten)?|scratch(?:ed)?)\b.*\b(by|me|my|human|person|child|kid)\b/.test(q)) {
        return reply('Please contact a doctor or emergency medical service promptly for a human bite, scratch, or possible rabies exposure. I cannot assess human health risks in chat.', 'human_safety', 'human_exposure');
    }
    if (humanMedicineIngestion || /\b(poison|toxic|toxins?|overdose|swallowed|ingested)\b|\b(ate|eaten|licked|chewed)\b.*\b(chocolate|grape|raisin|onion|garlic|xylitol|medicines?|medications?|pills?|tablets?|drugs?|chemical|cleaner|pesticide|rat poison|antifreeze)\b|\b(chocolate|grape|raisin|onion|garlic|xylitol|medicines?|medications?|pills?|tablets?|drugs?|chemical|cleaner|pesticide|rat poison|antifreeze)\b.*\b(ate|eaten|swallowed|ingested|licked|chewed)\b/.test(q)) {
        return reply('This could be an emergency. Contact a veterinarian or an emergency animal hospital immediately. Do not induce vomiting or give a treatment unless a veterinarian tells you to.', 'emergency', 'toxic_exposure', [poisonSource]);
    }
    if (/\b(can't breathe|cannot breathe|trouble breathing|difficulty breathing|struggles? (?:to breathe|breathing)|struggling (?:to breathe|breathing)|not breathing|choking|seizure|convulsion|unconscious|collapsed|hit by a car|severe bleeding|bleeding heavily|blue gums|bloated abdomen|unable to urinate|can't pee|cannot pee|hasn't peed|not peeing)\b/.test(q)) {
        return reply('This may be an emergency. Contact an emergency veterinarian immediately and follow their instructions. I cannot diagnose or treat this in chat.', 'emergency', 'urgent_symptom', [emergencySource]);
    }
    const rabbitUrgency = (0, socialSpeciesCare_1.rabbitUrgencyReply)(q, 'en');
    if (rabbitUrgency)
        return rabbitUrgency;
    const reassessment = (0, clinicalDecision_1.matchVetReassessment)(q, target?.species, 'en');
    if (reassessment)
        return reassessment;
    const clinicalDecision = (0, clinicalDecision_1.matchClinicalDecision)(q, 'en');
    if (clinicalDecision)
        return clinicalDecision;
    const appHelp = (0, appHelp_1.matchAppHelp)(q, 'en');
    // App-log wording ("mark a dose as given", "dose times") is an instruction about the
    // medicine screen; amounts and dose changes stay clinical.
    const doseLogInstruction = !!appHelp && /^app_help:(?:medicine_history|medicine_manage|medicine|reminder_troubleshoot)$/.test(appHelp.intent)
        && /\b(?:given[- ]dose (?:log|record)|dose (?:log|record)|doses? as given|dose times?)\b/.test(q)
        && !/\b(?:dosage|how much|what dose|safe dose|increase|decrease|double)\b|\bchange (?:the |a |my )?dose\b(?!\s*times?)/.test(q);
    // "How do I stop a medicine in the app" is the Stop button; "can/should I stop" is clinical.
    const stopButtonInstruction = appHelp?.intent === 'app_help:medicine_manage'
        && /\b(?:how (?:do|can) i|how to|where (?:do|can|is))\b/.test(q)
        && !/\b(?:should|can i stop|is it (?:ok|okay|safe)|early|before (?:the )?(?:course|end))\b/.test(q);
    // "Where can I see my pet's vaccine schedule" asks for the screen; "which vaccines / how often" is clinical.
    const vaccineScheduleLocation = /\bwhere\b|\b(?:see|view|open|find)\b.{0,25}\b(?:my|the|saved|pets?'?s?)\b/.test(q)
        && !/\b(?:when should|how often|what vaccines?|which vaccines?|need|should (?:i|my|she|he|it))\b/.test(q);
    const requestsClinicalDecision = /\b(diagnos(?:e|is)|what disease|what illness|dosage|how much (?:medicine|medication|drug)|prescri(?:be|ption))\b/.test(q)
        || (!vaccineScheduleLocation && /\b(?:vaccination|vaccine) schedule\b/.test(q))
        || (!stopButtonInstruction && /\bstop (?:the )?(?:medicine|medication)\b/.test(q))
        || (EN_MEDICINE_DECISION.test(q) && !/\b(?:in|on) the app\b|\b(?:reminders?|log|logged|record|stock|field|tap|button|screen|tab)\b/.test(q))
        || /\btreat(?:ment)?\b.{0,30}\bat home\b/.test(q);
    if (requestsClinicalDecision || (/\bdose\b/.test(q) && !doseLogInstruction)) {
        return reply('Only a veterinarian can diagnose your pet, choose treatment or medication doses, or set a vaccination plan. Please contact your veterinarian directly.', 'out_of_scope', 'medical_boundary');
    }
    const generalThreshold = (0, riskBoundary_1.generalVomitingThresholdReply)(q, 'en');
    if (generalThreshold)
        return generalThreshold;
    if (/\b(vomit(?:s|ing|ed)?|diarrh(?:ea|ea)|limp(?:ing)?|cough(?:ing)?|itch(?:ing)?|fever|letharg(?:ic|y)|pain|sick|injur(?:ed|y)|not eating|won't eat|blood|symptom|seiz(?:ing|ure))\b/.test(q)) {
        return reply('I cannot tell what is causing these symptoms from chat. Please contact a veterinarian for an assessment. If your pet is struggling to breathe, collapsing, seizing, or bleeding heavily, seek emergency veterinary care now.', 'out_of_scope', 'symptom_referral', [emergencySource]);
    }
    if (appHelp)
        return appHelp;
    const catNight = (0, catNightVocalization_1.catNightVocalizationReply)(q, target?.species, 'en');
    if (catNight)
        return catNight;
    const feeding = (0, feedingManagement_1.feedingManagementReply)(q, target?.species, 'en');
    if (feeding)
        return feeding;
    const catHousehold = (0, catHouseholdCare_1.catHouseholdCareReply)(q, target?.species, 'en');
    if (catHousehold)
        return catHousehold;
    const speciesCare = (0, socialSpeciesCare_1.socialSpeciesCareReply)(q, target?.species, 'en');
    if (speciesCare)
        return speciesCare;
    const asksCount = /\b(how many|number of|count|total)\b.*\b(pets?|dogs?|cats?)\b|\b(pets?|dogs?|cats?)\b.*\b(how many|count|total)\b/.test(q);
    if (asksCount) {
        if (!context?.ownerPets)
            return reply('I cannot see the complete pet list right now. Please reopen the chat after your pet data loads.', 'no_data', 'pet_count_unavailable');
        const species = /\bdogs?\b/.test(q) ? 'dog' : /\bcats?\b/.test(q) ? 'cat' : null;
        const count = species ? ownerPets.filter((p) => speciesName(p.species) === species).length : ownerPets.length;
        const label = species ? `${species}${count === 1 ? '' : 's'}` : `pet${count === 1 ? '' : 's'}`;
        return reply(`You have ${count} ${label} in this account.`, 'records', 'pet_count');
    }
    if (/\b(list|names?|who are|which)\b.*\b(pets?|dogs?|cats?)\b|\b(pets?)\b.*\b(names?|list)\b/.test(q)) {
        if (!context?.ownerPets)
            return reply('I cannot see the complete pet list right now. Please reopen the chat after your pet data loads.', 'no_data', 'pet_list_unavailable');
        if (!ownerPets.length)
            return reply('No pets are saved in this account yet.', 'no_data', 'pet_list_empty');
        return reply(`Pets in your account: ${ownerPets.map((p) => `${p.name} (${speciesName(p.species)})`).join(', ')}.`, 'records', 'pet_list');
    }
    if (namedScope.ambiguous || namedScope.speciesConflict || missingNamedProfile) {
        return reply('Please ask about one pet at a time so I can use the right records.', 'smalltalk', 'multiple_pets');
    }
    const recordTopic = /\b(weights?|weigh|breeds?|species|age|birthday|birth date|sex|gender|microchip|allerg(?:y|ies)|medicin(?:e|es)|medications?|vaccines?|vaccinations?|appointments?|bookings?|health records?|history|activity|activities|profile|information|details)\b/.test(q);
    const activityTypes = [
        { type: 'water', label: 'Water', match: /\b(water|drink(?:ing)?)\b/.test(q) },
        { type: 'food', label: 'Food', match: /\b(food|feed(?:ing)?|eat(?:en|ing)?)\b/.test(q) },
        { type: 'walk', label: 'Walking', match: /\b(walk(?:ing)?|distance|exercise)\b/.test(q) },
        { type: 'sleep', label: 'Sleep', match: /\b(sleep|slept|sleeping)\b/.test(q) },
    ].filter(topic => topic.match);
    const activityRead = /\b(saved|recorded|records?|today|this week|summary|total|how much|how long|how far)\b/.test(q)
        && (!/\b(should|recommend|need to)\b/.test(q) || /\b(saved|recorded|records?)\b/.test(q));
    if ((recordTopic || (activityRead && activityTypes.length)) && !target)
        return reply('Please select or name one pet first. I will use only the records saved for that pet.', 'no_data', 'select_pet');
    if (target) {
        const prefix = `${target.name}: `;
        const sections = [];
        if (/\b(weights?|weigh)\b/.test(q))
            sections.push(target.weight > 0
                ? { text: `${prefix}the saved weight is ${target.weight} kg. This is a recorded value, not a health assessment.`, hasData: true, intent: 'weight' }
                : { text: `${prefix}no weight is saved yet.`, hasData: false, intent: 'weight_missing' });
        if (/\b(medicin(?:e|es)|medication)\b/.test(q))
            sections.push(target.medicines?.length
                ? { text: `${prefix}saved medicines: ${target.medicines.map((m) => m.name).join(', ')}. Confirm medication questions with your veterinarian.`, hasData: true, intent: 'medicines' }
                : { text: `${prefix}no medicines are saved in the records available to this chat.`, hasData: false, intent: 'medicines_missing' });
        if (/\b(vaccines?|vaccinations?)\b/.test(q))
            sections.push(target.vaccines?.length
                ? { text: `${prefix}saved vaccinations: ${target.vaccines.map((v) => `${v.name} (${(0, dateFormat_1.formatDate)(v.date, 'en')})`).join(', ')}. Ask your veterinarian about what is due next.`, hasData: true, intent: 'vaccines' }
                : { text: `${prefix}no vaccinations are saved in the records available to this chat.`, hasData: false, intent: 'vaccines_missing' });
        if (/\b(appointments?|bookings?)\b/.test(q)) {
            if (/\b(next|upcoming|future)\b/.test(q)) {
                const next = (0, bookingView_1.nextUpcomingAppointment)(target.bookings || [], Date.now());
                sections.push(next ? { text: `${prefix}next saved appointment: ${next.title} on ${(0, dateFormat_1.formatDate)(next.date, 'en')} at ${(0, dateFormat_1.formatTime)(next.time, 'en')}.`, hasData: true, intent: 'bookings' } : { text: `${prefix}no upcoming saved appointment with a valid date and time is available.`, hasData: false, intent: 'bookings_missing' });
            }
            else
                sections.push(target.bookings?.length
                    ? { text: `${prefix}saved appointments: ${target.bookings.map((b) => `${b.title} on ${(0, dateFormat_1.formatDate)(b.date, 'en')}${b.time ? ` at ${(0, dateFormat_1.formatTime)(b.time, 'en')}` : ''}`).join(', ')}.`, hasData: true, intent: 'bookings' }
                    : { text: `${prefix}no appointments are saved in the records available to this chat.`, hasData: false, intent: 'bookings_missing' });
        }
        if (activityRead) {
            const now = new Date();
            const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            const today = /\btoday\b/.test(q);
            for (const topic of activityTypes) {
                const metric = today ? target.activityDaily?.find(a => a.date === date && a.type === topic.type) : target.activities?.find(a => a.type === topic.type);
                const range = today ? 'today' : 'the last 7 days';
                sections.push(metric
                    ? { text: `${prefix}${topic.label} recorded ${range}: ${metric.totalValue} ${activityUnitEnglish(metric.unit)} from ${metric.count} ${metric.count === 1 ? 'entry' : 'entries'}.`, hasData: true, intent: `activity:${topic.type}` }
                    : { text: `${prefix}no ${topic.label.toLowerCase()} records for ${range} are available to this chat.`, hasData: false, intent: `activity:${topic.type}:missing` });
            }
        }
        if (sections.length)
            return reply(sections.map(s => s.text).join('\n\n'), sections.some(s => s.hasData) ? 'records' : 'no_data', sections.length > 1 ? 'records:multiple' : sections[0].intent);
        if (recordTopic) {
            const facts = [`${speciesName(target.species)}`];
            if (target.breed)
                facts.push(`breed: ${target.breed}`);
            const age = (0, petDisplay_1.displayPetAge)(target.age, 'en', target.birthday);
            if (age)
                facts.push(`age: ${age}`);
            if (target.gender)
                facts.push(`sex: ${target.gender}`);
            if (target.birthday)
                facts.push(`birthday: ${(0, dateFormat_1.formatDate)(target.birthday, 'en')}`);
            if (target.microchip)
                facts.push(`microchip: ${target.microchip}`);
            return reply(`${prefix}${facts.join(' · ')}. These are the details saved in this account.`, 'records', 'profile');
        }
    }
    if (/^(hi|hello|hey|good morning|good afternoon|good evening)[!. ]*$/.test(q))
        return reply('Hello! I can help you read your pets’ saved records. 🐾', 'smalltalk', 'greeting');
    if (/\b(thank you|thanks|thank u|thx)\b/.test(q))
        return reply('You’re welcome. 🐾', 'smalltalk', 'thanks');
    if (/\b(what can you do|help|how does this app work)\b/.test(q))
        return reply('Free chat can read saved pet details and records. You can also use the app to find nearby businesses and contact them directly. I cannot diagnose, prescribe medication, or book a business appointment for you.', 'app_info', 'app_help');
    if (/\b(food|feed|eat|safe for|can my (?:dog|cat)|exercise|behavior|behaviour|care|grooming)\b/.test(q))
        return reply('Please tell me which pet and the specific item or situation. I do not want to guess about pet care or food safety. If your pet may have eaten something harmful, contact a veterinarian immediately.', 'handoff', 'care_clarify');
    const menu = (0, appHelp_1.appHelpMenu)(q, 'en');
    if (menu)
        return menu;
    return reply('I am not sure what you mean. Please ask about one pet and a specific saved detail, such as weight, medicines, vaccinations, or appointments. For health concerns, contact a veterinarian directly.', 'handoff', 'unknown');
}
function getEnglishSmartBotReply(message, pet, context) {
    return (0, clinicalDecision_1.withMultiPetIllnessContext)(message, getEnglishSmartBotReplyCore(message, pet, context), 'en');
}

},
"humanSafety":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HUMAN_EXPOSURE_ANSWER = void 0;
exports.isPetVictimBite = isPetVictimBite;
exports.matchHumanSafety = matchHumanSafety;
// คนถูกหมา/แมวกัด ข่วน หรือเลียแผล — แยกจาก emergency ของ "ตัวสัตว์" โดยเด็ดขาด
// แหล่งหลัก: WHO แนวทางการดูแลหลังสัมผัสโรคพิษสุนัขบ้า
const WHO_RABIES = 'https://www.who.int/teams/control-of-neglected-tropical-diseases/rabies/vaccinations-and-immunization';
const ANIMAL = '(?:หมา|สุนัข|แมว|ลูกหมา|ลูกสุนัข|ลูกแมว|กระต่าย|แฮมสเตอร์)';
const CONTACT = '(?:กัด|งับ|ข่วน|เลียแผล|เลียแผลถลอก)';
const PERSON = '(?:เรา|ผม|ฉัน|หนู|เจ้าของ|คน|เด็ก|ลูก|พ่อ|แม่|มือ|นิ้ว|แขน|ขา|หน้า)';
const INJURY = '(?:เป็นแผล|แผล|เลือด|ถลอก|รอยเขี้ยว|รอยข่วน|ผิวแตก|ไม่เข้า|ไม่ออก)';
const EXPOSURE_PATTERNS = [
    new RegExp(`(?:โดน|ถูก)${ANIMAL}.{0,12}${CONTACT}`),
    new RegExp(`${ANIMAL}.{0,10}${CONTACT}.{0,18}${PERSON}.{0,15}${INJURY}`),
    new RegExp(`${ANIMAL}.{0,10}${CONTACT}.{0,12}(?:${INJURY}|ต้องฉีด|พิษสุนัขบ้า|บาดทะยัก)`),
    new RegExp(`${CONTACT}.{0,12}(?:โดย|จาก)?${ANIMAL}.{0,15}${INJURY}`),
    // เรื่องเล่าจาก Social มักเอ่ยชื่อสัตว์ก่อน แล้วค่อยบอกว่าเจ้าของเป็นแผล
    new RegExp(`${ANIMAL}.{0,120}${CONTACT}.{0,80}(?:จน|ทำให้)(?:เรา|ผม|ฉัน|หนู|เจ้าของ|คน|เด็ก).{0,8}${INJURY}`),
];
const PET_VICTIM = /(?:หมา|สุนัข|แมว|น้อง).{0,12}(?:โดน|ถูก).{0,16}(?:หมา|สุนัข|แมว).{0,16}(?:กัด|ข่วน)|(?:หมา|สุนัข|แมว).{0,15}(?:กัด|ข่วน).{0,12}(?:หมา|สุนัข|แมว|น้อง)/;
const EXPLICIT_HUMAN_VICTIM = /(?:เรา|ผม|ฉัน|หนู|คน|เด็ก|พ่อ|แม่|เจ้าของ).{0,8}(?:โดน|ถูก).{0,18}(?:กัด|ข่วน)|(?:กัด|ข่วน).{0,12}(?:เรา|ผม|ฉัน|หนู|คน|เด็ก|พ่อ|แม่|เจ้าของ).{0,10}(?:แผล|เลือด|ถลอก)/;
function isPetVictimBite(text) {
    const q = String(text || '').toLowerCase();
    return PET_VICTIM.test(q) && !EXPLICIT_HUMAN_VICTIM.test(q);
}
function matchHumanSafety(text) {
    const q = String(text || '').toLowerCase();
    // In social stories the *pet* may be bitten by another animal. The word
    // “โดนแมวกัด” alone is not evidence that a person was injured.
    if (isPetVictimBite(q))
        return null;
    if (!EXPOSURE_PATTERNS.some((p) => p.test(q)))
        return null;
    return {
        id: 'animal_bite_scratch_exposure',
        sources: [WHO_RABIES],
        verifiedAt: '2026-09-29',
    };
}
exports.HUMAN_EXPOSURE_ANSWER = '🚨 **กรณีนี้เป็นความปลอดภัยของคน ต้องพบแพทย์คนค่ะ**\n\n' +
    'หากถูกกัดหรือข่วนจนผิวหนังแตก ให้ **ล้างแผลด้วยสบู่และน้ำสะอาดไหลผ่านอย่างน้อย 15 นาที** แล้ว **ไปสถานพยาบาลทันที** ให้แพทย์ประเมินแผลและความจำเป็นในการป้องกันโรคพิษสุนัขบ้ากับบาดทะยักค่ะ\n\n' +
    'บอทไม่ประเมินความเสี่ยงหรือเลือกการรักษาแทนแพทย์ แม้สัตว์จะเป็นสัตว์เลี้ยงของตัวเองค่ะ';

},
"emergency":function(require,module,exports){
"use strict";
// lib/smartBot/emergency.ts
// ─────────────────────────────────────────────────────────────────────────
// กฎ "สัญญาณฉุกเฉิน" ของ Smart Bot (โหมดฟรี · ออฟไลน์ 100%)
//
// ⚠️ กฎเหล็กของไฟล์นี้
//   1. ทุกกฎต้องมี sourceUrl + verifiedAt — ห้ามเพิ่มกฎที่ไม่มีแหล่งอ้างอิง
//   2. ข้อความ adviceTh ห้ามวินิจฉัยโรค ห้ามระบุขนาดยา ห้ามบอกให้หยุดยา
//      และห้ามบอกว่า "ไม่ต้องไปหาหมอ" — ทิศทางเดียวที่ปลอดภัยคือ "ให้ไปหาหมอ"
//   3. บอตนี้ทำได้แค่ "ยกธงแดง" ไม่ใช่ "ตัดสินว่าเป็นอะไร"
//
// แหล่งอ้างอิงที่ตรวจจริงเมื่อ 1 ก.ย. 2569 (2026-09-01) โดยเปิดหน้าเว็บอ่านเอง:
//   [M-EMERG] Merck Veterinary Manual — What to Do in a Dog or Cat Emergency
//     "Poisoning, Severe pain, Severe or uncontrolled bleeding, Trouble breathing,
//      Eye injuries, Suspected broken bones or a limb that can't move"
//     heat stroke: "Hot skin, vomiting, drooling, rapid panting, distress,
//      uncoordinated movement, collapse, or unconsciousness"
//     hypothermia: "Slow pulse, shallow breathing, confusion, collapse, or unconsciousness"
//     choking:  "Coughing, drooling, gagging, pawing at the mouth, or holding the
//      mouth open and being agitated"
//   [M-INTRO] Merck — Introduction to Emergencies
//     "Sudden changes in appearance, walking, activity, eating, bathroom habits,
//      or grooming can be signs of a medical problem."
//   [M-UROCAT] Merck — Urinary Stones (Uroliths, Calculi) in Cats
//     ท่อปัสสาวะอุดตันเป็นภาวะฉุกเฉิน ต้องพบสัตวแพทย์ทันที
//   [M-ANALG] Merck — Toxicoses From Human Analgesics in Animals
//     "Acetaminophen should not be used in cats because of inadequate cytochrome
//      P450–dependent hydroxylation (glucuronidation) and subsequent fatal
//      methemoglobinemia."
//   [M-SEIZURE] Merck (Pet Owners) — Evaluation and Initial Treatment of Dog and Cat Emergencies
//     Covers ongoing seizures and loss of consciousness as problems requiring
//     immediate veterinary treatment in dogs and cats. Verified 2026-10-03.
//   [M-GDV] Merck (Dog Owners) — Disorders of the Stomach and Intestines in Dogs
//     "Bloat (also called gastric dilation and volvulus, or GDV) is a
//      life-threatening emergency."
//     "Dogs with bloat commonly have eaten a large meal followed by exercise and
//      repeated, unsuccessful attempts to vomit."
//   [M-DYSTOCIA] Merck — Dystocia in Small Animals
//     "Interval between puppies or kittens is > 30 minutes with clear signs of
//      myometrial contractions" · "Active labor for > 4 hours and no puppies or
//      kittens produced"
//   [C-ANOREXIA] Cornell Feline Health Center — Anorexia
//     "anorexia can have a severe impact on a mature cat's health if it persists
//      for as little as 24 hours."
//     "For a kitten younger than six weeks of age, food avoidance for just 12
//      hours can pose a lethal threat."
//   [M-GIOBS] Merck — Gastrointestinal Obstruction in Small Animals
//     "Therefore, GI obstruction should be treated as an emergency."
//     "cats more typically ingest linear foreign bodies (eg, string, yarn,
//      dental floss) while playing with them."
//   [A-IVDD] ACVS — Intervertebral Disc Disease
//     "Intervertebral disc rupture is generally thought to be a true surgical emergency"
//     "Severe damage can lead to entire loss of pain sensation. This can carry a very
//      poor prognosis for recovery depending on the duration that pain perception
//      has been lost."
//   [M-SPINE] Merck (Dog Owners) — Disorders of the Spinal Column and Cord in Dogs
//     "Surgery must be performed promptly to relieve the pressure on the spinal cord."
//     "If surgery is delayed for more than 24 hours after pain perception is lost,
//      the chances of recovery decrease."
//     "Signs can occur suddenly or slowly worsen over several months."
//   [C-CARDIO] Cornell Feline Health Center — Cardiomyopathy
//     "Rapid/labored breathing and/or sudden paralysis are considered medical
//      emergencies that must be addressed immediately."
//     "Cats that suffer from a saddle thrombus usually experience a sudden onset of
//      hind limb lameness or paralysis, usually accompanied by severe pain."
//   [C-DM] Cornell Riney — Degenerative myelopathy
//     "It causes gradual muscle wasting and incoordination in the hind limbs"
//     "progresses to an inability to walk after six to twelve months"
//     "Several tests may need to be performed to rule out other potential spinal
//      cord diseases."
//
// ⚠️ บันทึกไว้กันพลาดซ้ำ: หน้า [M-EMERG] **ไม่ได้พูดถึง** ชัก · ท้องอืด GDV ·
//    คลอดยาก → ห้ามอ้าง M-EMERG กับ 3 กฎนั้น (ตรวจซ้ำแล้ว 1 ก.ย. 2569)
// ─────────────────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.EMERGENCY_FOOTER = exports.EMERGENCY_RULES = exports.HUMAN_PAINKILLER_NAMES = void 0;
exports.matchEmergency = matchEmergency;
const M_EMERG = 'https://www.merckvetmanual.com/special-pet-topics/emergencies/what-to-do-in-a-dog-or-cat-emergency';
const M_INTRO = 'https://www.merckvetmanual.com/special-pet-topics/emergencies/introduction-to-emergencies';
const M_UROCAT = 'https://www.merckvetmanual.com/cat-owners/kidney-and-urinary-tract-disorders-of-cats/urinary-stones-uroliths-calculi-in-cats';
const M_ANALG = 'https://www.merckvetmanual.com/toxicology/toxicoses-from-human-analgesics/toxicoses-from-human-analgesics-in-animals';
// Pet-owner reference explicitly covers ongoing seizures in both dogs and cats.
// Verified 2026-10-03; urgent care is provided by veterinary staff.
const M_SEIZURE = 'https://www.merckvetmanual.com/special-pet-topics/emergencies/evaluation-and-initial-treatment-of-dog-and-cat-emergencies';
const M_GDV = 'https://www.merckvetmanual.com/dog-owners/digestive-disorders-of-dogs/disorders-of-the-stomach-and-intestines-in-dogs';
const M_DYSTOCIA = 'https://www.merckvetmanual.com/reproductive-system/reproductive-diseases-of-the-female-small-animal/dystocia-in-small-animals';
const C_ANOREXIA = 'https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/anorexia';
const M_GIOBS = 'https://www.merckvetmanual.com/digestive-system/surgical-problems-of-the-gastrointestinal-tract-in-small-animals/gastrointestinal-obstruction-in-small-animals';
const A_IVDD = 'https://www.acvs.org/small-animal/intervertebral-disc-disease/';
const M_SPINE = 'https://www.merckvetmanual.com/dog-owners/brain-spinal-cord-and-nerve-disorders-of-dogs/disorders-of-the-spinal-column-and-cord-in-dogs';
const C_CARDIO = 'https://www.vet.cornell.edu/departments/cornell-feline-health-center/health-information/feline-health-topics/cardiomyopathy';
const C_DM = 'https://www.vet.cornell.edu/departments-centers-and-institutes/riney-canine-health-center/canine-health-topics/degenerative-myelopathy';
// ลูกสัตว์แรกเกิด (ตรวจสอบ + ดึงข้อความจริงแล้ว 1 ก.ย. 2569)
//   "Puppies and kittens lack thermoregulatory mechanisms until 4 weeks of age;
//    thus, the ambient temperature must be high enough to facilitate maintenance
//    of a body temperature of at least 97°F (36°C)."
//   "Chilled neonates must be rewarmed slowly (30–60 minutes)... Tube feeding
//    should be delayed until the neonate is euthermic."
//   "Hypothermia induces ileus, and regurgitation and aspiration can result."
//   "Care by a veterinarian in the immediate neonatal period improves survival
//    of the neonates and reduces morbidity in the dam."
// ⚠️ หน้านี้ **ไม่ได้พูดถึง** "ห้ามให้นมวัว" และ **ไม่ได้พูดถึง** การกระตุ้นให้ขับถ่าย
//    (2 เรื่องนั้นอยู่บนหน้า "สัตว์ป่า" ซึ่งคนละขอบเขต) → ห้ามอ้าง M_NEONATE กับ 2 เรื่องนี้
const M_NEONATE = 'https://www.merckvetmanual.com/management-and-nutrition/management-of-the-neonate/management-of-the-neonate-in-dogs-and-cats';
const ingestion_1 = require("./ingestion");
var ingestion_2 = require("./ingestion");
Object.defineProperty(exports, "HUMAN_PAINKILLER_NAMES", { enumerable: true, get: function () { return ingestion_2.HUMAN_PAINKILLER_NAMES; } });
/** ข้อความเหตุได้รับสารพิษ (ใช้ร่วมกันระหว่าง poisoning และ human_medicine_ingestion) */
const POISONING_ADVICE_TH = 'เข้าข่าย **ภาวะได้รับสารพิษ** ซึ่ง Merck จัดเป็นเหตุฉุกเฉินที่ต้องพบสัตวแพทย์ทันทีค่ะ\n\nสิ่งที่ควรทำ: พาไปโรงพยาบาลสัตว์เดี๋ยวนี้ และถ้าทำได้ให้ถ่ายรูป/ถือ **ฉลากหรือซองของสิ่งที่น้องกิน** ไปด้วย จะช่วยหมอมาก\n\n⚠️ อย่าพยายามทำให้อาเจียนเองโดยไม่ได้รับคำสั่งจากสัตวแพทย์ค่ะ';
/** กิน/เลีย/กลืน/กัด ยาแก้ปวดหรือยาทาของคน (ชื่อเฉพาะ · คงไว้เพื่อให้เคสเดิมใช้ intent เดิม) */
const HUMAN_MEDICINE_INGESTION = new RegExp(String.raw `(?:กิน|ทาน|เลีย|กลืน|เผลอ|แอบ|กัด|เคี้ยว|คาบ|ป้อน|ได้รับ).{0,24}${ingestion_1.HUMAN_PAINKILLER_NAMES}|${ingestion_1.HUMAN_PAINKILLER_NAMES}.{0,24}(?:กิน|ทาน|เลีย|กลืน|กัด|เคี้ยว|เข้าไป|ไปแล้ว)`);
/** คำกริยาที่ต้องมีก่อนจะเรียกตัวตรวจแบบโครงสร้าง (isAccidentalIngestionTh) */
const INGESTION_VERB = /กิน|ทาน|เลีย|แทะ|กัด|เคี้ยว|กลืน|คาบ|ดื่ม|ซด|ขโมย|คุ้ย|ฉีก|ได้รับ|โดน|ป้อน/;
/** สารเคมีในบ้าน/ยาเบื่อ: ตัวตรวจแบบโครงสร้างจับได้ แต่ตอบในชื่อกฎ poisoning (ข้อความเดียวกัน) */
const HOUSEHOLD_CHEMICAL = /น้ำยา(?!บ้วนปาก)|ผงซักฟอก|สารเคมี|แอมโมเนีย|น้ำมันเครื่อง|น้ำมันก๊าด|เบนซิน|ทินเนอร์|แอนตี้ฟรีซ|ยาเบื่อ|ยาฆ่า|ฟูราดาน/;
const V = '2026-09-01';
/**
 * เรียงตาม "ความร้ายแรงถ้าพลาด" จากมากไปน้อย
 * ตัวแรกที่แมตช์คือตัวที่ตอบ (ดู matchEmergency)
 */
exports.EMERGENCY_RULES = [
    {
        id: 'paracetamol_cat',
        labelTh: 'แมวกินยาแก้ปวดของคน (พาราเซตามอล)',
        species: 'cat',
        patterns: [
            /พารา(เซตามอล|เซต)?/,
            /ซาร่า|ซาร่าน้ำ|tylenol|ไทลินอล/,
            /อะเซตามิโนเฟน|acetaminophen/,
        ],
        adviceTh: 'อันตรายมากค่ะ — ตำราสัตวแพทย์ Merck ระบุว่า **ห้ามใช้พาราเซตามอล (acetaminophen) ในแมว** เพราะแมวเปลี่ยนรูปยาชนิดนี้ไม่ได้ และเกิดภาวะเมทฮีโมโกลบินที่ถึงตายได้\n\nถ้าน้องกินเข้าไปแล้วหรือสงสัยว่ากิน **ให้พาไปโรงพยาบาลสัตว์ทันที** พร้อมบอกชนิดยาและปริมาณ ห้ามรอดูอาการค่ะ',
        sourceUrl: M_ANALG,
        verifiedAt: V,
    },
    {
        // หมา/แมว (หรือไม่รู้ชนิด) กินยาแก้ปวด/ลดไข้ของคนเข้าไปแล้ว — 26 ต.ค. 2569
        // แมว + พาราเซตามอล ยังตอบด้วยกฎ paracetamol_cat ด้านบน (เจาะจงกว่า)
        // ใช้ข้อความเดียวกับกฎ poisoning (พาไปโรงพยาบาลสัตว์ทันที · ห้ามทำให้อาเจียนเอง) ไม่เขียนคำแนะนำใหม่
        id: 'human_medicine_ingestion',
        labelTh: 'กินหรือเลียยาของคน (ยาแก้ปวด/ยาทา/ครีม) เข้าไป',
        species: 'both',
        // ตัดสินด้วย isAccidentalIngestionTh (กริยา + ของที่ไม่ใช่อาหารสัตว์ + เกิดขึ้นแล้ว) — 26 ต.ค. 2569 รอบ 5
        patterns: [INGESTION_VERB],
        adviceTh: POISONING_ADVICE_TH,
        sourceUrl: M_ANALG,
        extraSources: [M_EMERG],
        verifiedAt: '2026-10-26',
    },
    {
        id: 'poisoning',
        labelTh: 'สงสัยได้รับสารพิษ',
        species: 'both',
        patterns: [
            /ยาเบื่อ|ยาฆ่าหญ้า|ยาฆ่าแมลง|ยาเบื่อหนู|ฟูราดาน/,
            /กินยา(ของ)?คน|กินยาเจ้าของ|กินยาผิด|กินยาเกิน|ป้อนยาเกิน|(?:กิน|ป้อน|ให้).{0,12}ยาเกิน/,
            /น้ำยา(ล้าง|ถู|ซัก|ฟอกขาว)|ควันน้ำยา|น้ำยาเข้าตา|ผงซักฟอก|สารเคมี|แอมโมเนีย|น้ำมันหอมระเหย|น้ำมันเครื่อง|แอนตี้ฟรีซ|antifreeze/,
            /โดนวางยา|ถูกวางยา|วางยาเบื่อ/,
        ],
        adviceTh: POISONING_ADVICE_TH,
        sourceUrl: M_EMERG,
        verifiedAt: V,
    },
    {
        id: 'seizure',
        labelTh: 'ชัก / เกร็ง น้ำลายฟูมปาก',
        species: 'both',
        patterns: [
            /ชัก(เกร็ง|กระตุก)?/,
            /น้ำลายฟูมปาก|ฟูมปาก/,
            /เกร็ง.{0,6}(ทั้งตัว|กระตุก)/,
            /ตาค้าง.{0,8}(เกร็ง|สั่น)/,
        ],
        adviceTh: '**อาการชักหรือไม่ตอบสนองอาจเป็นเหตุฉุกเฉินค่ะ ติดต่อสัตวแพทย์ฉุกเฉินหรือโรงพยาบาลสัตว์ และพาน้องไปทันที** หนูไม่วินิจฉัยหรือบอกวิธีรักษาผ่านแชทค่ะ',
        sourceUrl: M_SEIZURE,
        verifiedAt: '2026-10-03',
    },
    {
        // [M-HE] Merck — Hepatic Encephalopathy in Small Animals
        //   "Clinical signs ... include ... propulsive circling, head pressing,
        //    aimless wandering, weakness, ataxia ... collapse, seizures, and coma."
        id: 'head_pressing',
        labelTh: 'ดันหน้าผากค้างกับกำแพง / อาการทางระบบประสาท',
        species: 'both',
        patterns: [
            /ดัน(หน้าผาก|หัว).{0,10}(กำแพง|ผนัง|พื้น|ประตู)/,
            /(ยืน|เดิน).{0,8}(เอา|กด|ดัน)หัว.{0,10}(กำแพง|ผนัง|ประตู)/,
            /หัวติดกำแพง|หัวน้องติดกำแพง|กดหัวกับ(กำแพง|ผนัง)/,
        ],
        adviceTh: 'ถ้าน้อง **ดันหน้าผากหรือหัวค้างกับกำแพง/ผนัง** ไม่ใช่แค่เอาหน้าซุกนอน อาจเป็นสัญญาณทางระบบประสาทที่ต้องประเมินเร่งด่วนค่ะ Merck ระบุอาการร่วมที่ต้องระวังคือ เดินวน สับสน เดินเซ อ่อนแรง ชัก หรือไม่ตอบสนอง\n\nพาไปโรงพยาบาลสัตว์ทันที จัดพื้นที่ไม่ให้ชนของแข็ง อย่าฝืนป้อนอาหาร/ยา และถ่ายคลิปสั้น ๆ ไว้ให้หมอถ้าทำได้อย่างปลอดภัยค่ะ',
        sourceUrl: 'https://www.merckvetmanual.com/digestive-system/hepatic-diseases-of-small-animals/hepatic-encephalopathy-in-small-animals',
        verifiedAt: V,
    },
    {
        id: 'bloat_gdv',
        labelTh: 'ท้องอืด/ท้องกาง ขย้อนไม่ออก (สงสัย GDV)',
        species: 'dog',
        patterns: [
            /ท้อง(อืด|กาง|ป่อง|บวม|แข็ง)/,
            /(ขย้อน|จะอ้วก|พยายามอ้วก|เบ่งอาเจียน).{0,10}(ไม่ออก|ไม่มีอะไรออก)/,
        ],
        adviceTh: '⚠️ ท้องกาง/ท้องอืดร่วมกับ **พยายามอาเจียนแต่ไม่มีอะไรออก** ในสุนัข เป็นภาพที่ตำรา Merck อธิบายไว้ในภาวะ **กระเพาะขยาย-บิดตัว (GDV)** ซึ่งระบุชัดว่าเป็น "ภาวะฉุกเฉินที่คุกคามชีวิต" และให้ **รีบพาไปพบสัตวแพทย์ทันที** เพราะเพิ่มโอกาสรอด\n\n**อย่ารอดูอาการ** และห้ามให้กินน้ำ/อาหารเพิ่มระหว่างเดินทางค่ะ\n\n(พบบ่อยในสุนัขพันธุ์ใหญ่อกลึก มักเกิดหลังกินอาหารมื้อใหญ่แล้วออกวิ่ง)',
        sourceUrl: M_GDV,
        verifiedAt: V,
    },
    {
        id: 'dystocia',
        labelTh: 'คลอดยาก',
        species: 'both',
        patterns: [
            /คลอด(ไม่ออก|ยาก|ติด)/,
            /เบ่ง(คลอด|ลูก).{0,12}(นาน|ไม่ออก|หลายชั่วโมง)/,
            /(ท้อง|ตั้งท้อง).{0,10}(เบ่ง|ปวดท้อง).{0,10}(ไม่คลอด|ยังไม่คลอด)/,
            /ลูก.{0,6}ติด.{0,6}(ช่องคลอด|ออกมาครึ่ง)/,
        ],
        adviceTh: '**คลอดยาก (dystocia)** ต้องให้สัตวแพทย์ดูค่ะ — ตำรา Merck ใช้เกณฑ์ว่า **เบ่งจริงจังเกิน 4 ชั่วโมงแล้วยังไม่มีลูกออก** หรือ **ห่างระหว่างลูกแต่ละตัวเกิน 30 นาที ทั้งที่ยังมีการบีบตัวของมดลูก** ให้ถือว่าผิดปกติ\n\nพาไปโรงพยาบาลสัตว์ทันทีค่ะ ⚠️ **ห้ามดึงลูกออกเอง** และห้ามให้ยาเร่งคลอดเองเด็ดขาด — อาจทำให้มดลูกแตกได้',
        sourceUrl: M_DYSTOCIA,
        verifiedAt: V,
    },
    {
        id: 'foreign_body',
        labelTh: 'กลืนสิ่งแปลกปลอม',
        species: 'both',
        patterns: [
            /กิน(หนังยาง|เชือก|ไหมขัดฟัน|ด้าย|ไหมพรม|ถุงพลาสติก|ถุงขนม|ยางรัด|ของเล่น|เข็ม|เบ็ด|กระดุม|เหรียญ|ตุ๊กตา)/,
            /(กัด|ฉีก).{0,16}(ถุงขนม|ถุงพลาสติก).{0,40}(กิน|กลืน).{0,20}(พลาสติก|ถุง)/,
            /กลืน.{0,10}(ของ|สิ่ง).{0,6}(แปลกปลอม|ไม่ใช่อาหาร)/,
            /กลืน(หนังยาง|เชือก|ด้าย|เข็ม|เหรียญ|กระดุม)/,
            /กลืน.{0,18}(?:ชิ้นส่วน)?(?:ของเล่น|ตุ๊กตา)/,
            /(หนังยาง|เชือก|ด้าย).{0,10}(หายไป|ห้อยออกมา|โผล่จาก)/,
        ],
        adviceTh: 'การกลืนของเล่น เชือก หรือสิ่งที่ไม่ใช่อาหารอาจทำให้ทางเดินอาหารอุดตันได้ค่ะ **ติดต่อโรงพยาบาลสัตว์หรือพาไปพบสัตวแพทย์ทันที** พร้อมแจ้งว่ากลืนอะไร ขนาดโดยประมาณ และเมื่อไร หนูไม่ประเมินเองว่าของจะผ่านออกมาได้หรือไม่\n\n⚠️ ถ้าเห็นเชือกหรือด้ายห้อยออกมาจากปากหรือก้น ห้ามดึงเองค่ะ',
        sourceUrl: M_GIOBS,
        verifiedAt: V,
    },
    {
        id: 'breathing',
        labelTh: 'หายใจลำบาก',
        species: 'both',
        patterns: [
            /หายใจ(ไม่ออก|ลำบาก|ติดขัด|แรง|เร็ว|หอบ)/,
            /หายใจไม่ทัน|ขาดอากาศ|หายใจแผ่ว|คอยืด/,
            /หอบ(แรง|เหนื่อย|ตลอด)?/,
            /อ้าปากหายใจ|หายใจทางปาก/,
            /ลิ้นม่วง|ลิ้นเขียว|เหงือก(?:น้อง)?(?:ซีด|ม่วง|เขียว)|ตัวเขียว/,
        ],
        adviceTh: '**หายใจลำบาก** อยู่ในรายการเหตุฉุกเฉินของ Merck ที่ต้องพบสัตวแพทย์ทันทีค่ะ — โดยเฉพาะแมวที่อ้าปากหายใจ/หอบเหมือนหมา ถือว่าผิดปกติเสมอ\n\nพาไปโรงพยาบาลสัตว์ทันที ระหว่างทางให้อยู่ในที่อากาศถ่ายเท เย็น ไม่ต้องบังคับจับหรือกอดแน่น เพราะจะยิ่งเครียดและหายใจแย่ลงค่ะ',
        sourceUrl: M_EMERG,
        verifiedAt: V,
    },
    {
        id: 'urinary_block',
        labelTh: 'ปัสสาวะไม่ออก / เบ่งฉี่ไม่ออก',
        species: 'both',
        patterns: [
            // ⚠️ "ฉี่" มักพิมพ์ตกวรรณยุกต์เป็น "ฉี" — ต้องรับทั้งสองแบบ
            //    (เคสจริงที่เคยหลุด: "เข้าไปนั่งฉี่ในกระบะ ชั่วโมงละหลายรอบ แต่ฉีไม่ออก")
            /ฉี่?ไม่ออก|ปัสสาวะไม่ออก|เยี่ยวไม่ออก|(?:ฉี่|ปัสสาวะ|เยี่ยว).{0,12}ไม่ได้/,
            // ⚠️ แก้ 1 ก.ย. 2569 (รอบเทรน 2): เดิมเป็น /เบ่ง.{0,20}ไม่ออก/ ซึ่งกว้างเกิน
            //    "แมวเบ่งอึไม่ออก" (ท้องผูก) เคยได้คำตอบเรื่องท่อปัสสาวะอุดตัน = ผิดอวัยวะ
            //    ต้องกันคำว่า อึ/ขี้/อุจจาระ ออกด้วย negative lookahead
            /เบ่งฉี่?|เบ่งปัสสาวะ|เบ่ง(?!.{0,10}(อึ|ขี้|อุจจาระ)).{0,20}ไม่ออก/,
            // เข้ากระบะถี่อย่างเดียวควรไปคัดกรองอาการก่อน; ฉุกเฉินเมื่อมีหลักฐานว่า
            // ไม่มีฉี่/ออกน้อย/เป็นหยดร่วมด้วย
            /(เข้า|นั่ง|ขึ้น).{0,10}กระบะ.{0,25}(บ่อย|หลายรอบ|หลายครั้ง|ทั้งวัน).{0,20}(แต่|แล้ว|ก็)?\s*(ไม่มี|ไม่ออก|นิดเดียว|ทีละหยด)/,
            /(ฉี่?|ปัสสาวะ).{0,20}(บ่อยมาก|หลายรอบ).{0,25}(ไม่ออก|นิดเดียว|ไม่มี|ทีละหยด)/,
            /ฉี่?.{0,20}(ทีละหยด|ออกนิดเดียว|เป็นหยด)/,
            // ภาษาพูดที่พบบ่อย: "ฉี่ออกแค่หยดเดียวแล้วร้อง" ไม่ตรงกับ
            // "ออกนิดเดียว" หรือ "ทีละหยด" ด้านบน แต่มีความเสี่ยงอุดตันเท่ากัน
            /(ฉี่?|ปัสสาวะ).{0,16}(ออก)?(?:แค่|เพียง|ได้)?(?:เป็น)?หยด(?:เดียว)?(?:.{0,12}(ร้อง|เจ็บ|เบ่ง))?/,
            /ร้อง.{0,12}(พยายามฉี่|ฉี่)|สวนฉี่.{0,15}ไม่ฉี่/,
        ],
        adviceTh: '⚠️ **ฉี่ไม่ออก / เบ่งแล้วไม่มีปัสสาวะ ถือเป็นภาวะฉุกเฉิน** ค่ะ ตำรา Merck ระบุว่าท่อปัสสาวะอุดตันต้องได้รับการรักษาจากสัตวแพทย์ทันที และการอุดตันแบบสมบูรณ์ทำให้ของเสียคั่งภายใน 1–2 วัน\n\n**อย่ารอดูอาการข้ามคืน** พาไปโรงพยาบาลสัตว์เดี๋ยวนี้ค่ะ (พบบ่อยที่สุดในแมวเพศผู้)',
        sourceUrl: M_UROCAT,
        verifiedAt: V,
    },
    {
        id: 'bleeding',
        labelTh: 'เลือดออกมาก / มีเลือดปน',
        species: 'both',
        patterns: [
            /เลือดออก(?:จาก.{0,12})?(ไม่หยุด|เยอะ|มาก)/,
            /เลือดออก.{0,12}(ปาก|จมูก|แผล)/,
            /(อึ|ขี้|ถ่าย|อุจจาระ).{0,20}(เป็น|ปน|มี)เลือด/,
            /(ฉี่|ปัสสาวะ).{0,20}(เป็น|ปน|มี)เลือด/,
            /(อ้วก|อาเจียน).{0,20}(เป็น|ปน|มี)เลือด/,
            /ตกเลือด|เลือดไหลไม่หยุด/,
        ],
        adviceTh: '**เลือดออกรุนแรงหรือห้ามเลือดไม่อยู่** เป็นเหตุฉุกเฉินตามรายการของ Merck ค่ะ — และถ่าย/ฉี่/อาเจียนปนเลือดก็เป็นสัญญาณที่ไม่ควรรอเช่นกัน\n\nพาไปโรงพยาบาลสัตว์ทันที ถ้ามีแผลเลือดออกให้กดห้ามเลือดด้วยผ้าสะอาดระหว่างเดินทาง และถ้าเป็นไปได้ **ถ่ายรูปสิ่งที่ถ่าย/อาเจียนออกมา** ไปให้หมอดูค่ะ',
        sourceUrl: M_EMERG,
        verifiedAt: V,
    },
    {
        id: 'trauma',
        labelTh: 'อุบัติเหตุ / บาดเจ็บรุนแรง',
        species: 'both',
        patterns: [
            /โดนรถ(ชน|ทับ|เหยียบ|เฉี่ยว)|รถชน|ถูกรถชน/,
            // เผื่อสำนวนที่มีคำแทรก เช่น "โดนรถบ้านข้างๆชน" / "รถมอเตอร์ไซค์ทับ"
            /(โดน|ถูก)?รถ.{0,14}(ชน|ทับ|เหยียบ)/,
            /ตก(ตึก|ระเบียง|ที่สูง|บันได|หน้าต่าง|คอนโด)/,
            /ตกจาก(ที่สูง|ชั้น|ระเบียง|หน้าต่าง|ตึก)/,
            /ตกลงไป(ด้านล่าง|ข้างล่าง|จาก)/,
            /โดน(กัด|ข่วน).{0,20}(แผล|เลือด|ลึก)/,
            /ขาหัก|กระดูกหัก|เดินไม่ได้.{0,14}(หลังจาก|หลังโดน|หลังตก)/,
            /โดนไฟ(ช็อต|ดูด)|ไฟช็อต|ไฟดูด|น้ำร้อนลวก|ไฟไหม้/,
            /(หัว|ศีรษะ).{0,12}(กระแทก|ชน).{0,12}(ซึม|สลบ|หมดสติ)/,
            /อก.{0,12}(โดน|ถูก).{0,12}(ของแหลม|แทง)/,
        ],
        adviceTh: 'บาดเจ็บจากอุบัติเหตุถือเป็นเหตุฉุกเฉินค่ะ — Merck ระบุว่า **สงสัยกระดูกหัก หรือขาที่ขยับไม่ได้** ต้องพบสัตวแพทย์ทันที และการบาดเจ็บรุนแรงจากอุบัติเหตุต้องรักษาโดยเร็ว\n\n**สำคัญ:** สัตว์ที่ตกจากที่สูงหรือโดนรถชน อาจดูเหมือนปกติภายนอกแต่มีเลือดออกในหรือปอดช้ำได้ — ต้องให้หมอตรวจแม้จะเดินได้ ระหว่างเคลื่อนย้ายให้ประคองทั้งตัวบนแผ่นแข็ง อย่าอุ้มพาดค่ะ',
        sourceUrl: M_EMERG,
        verifiedAt: V,
    },
    {
        id: 'heatstroke',
        labelTh: 'โรคลมแดด (ฮีทสโตรก)',
        species: 'both',
        patterns: [
            /ฮีท ?สโตรก|heat ?stroke|ลมแดด|โรคลมร้อน/,
            /(ตัวร้อน|ตัวร้อนจัด).{0,20}(หอบ|ล้ม|ชัก|เดินเซ)/,
            /(ติดอยู่ใน|ลืมไว้ใน)รถ/,
        ],
        adviceTh: 'สงสัย **โรคลมแดด** — Merck ระบุสัญญาณว่า: ผิวร้อน อาเจียน น้ำลายยืด หอบถี่ กระวนกระวาย เดินเซ ล้ม หรือหมดสติ\n\n**ต้องพาไปโรงพยาบาลสัตว์ทันที** ระหว่างทางย้ายเข้าที่ร่มเย็น เปิดลม และใช้น้ำ **อุณหภูมิห้อง** ชุบตัว — ห้ามใช้น้ำแข็งหรือน้ำเย็นจัดค่ะ',
        sourceUrl: M_EMERG,
        verifiedAt: V,
    },
    {
        id: 'choking',
        labelTh: 'สำลัก / มีของติดคอ',
        species: 'both',
        patterns: [
            /ติดคอ|ก้างติด|กระดูกติด|สำลัก/,
            /ขย้อน.{0,20}(ไม่ออก)|ไอ.{0,20}(เหมือน).{0,20}(ติดคอ)/,
            /เอาเท้า(ตะกุย|เขี่ย)ปาก|อ้าปากค้าง/,
        ],
        adviceTh: 'สัญญาณสำลัก/มีของติดคอตามตำรา Merck คือ: **ไอ น้ำลายยืด ขย้อน เอาอุ้งเท้าตะกุยปาก หรืออ้าปากค้างและกระวนกระวาย**\n\nพาไปโรงพยาบาลสัตว์ทันทีค่ะ ⚠️ **ห้ามล้วงคอเอาออกเอง** โดยเฉพาะก้างปลาหรือเศษกระดูก เพราะอาจดันลึกลงไปหรือทิ่มทางเดินอาหารจนแย่กว่าเดิม',
        sourceUrl: M_EMERG,
        verifiedAt: V,
    },
    {
        // ⚠️ เพิ่ม 1 ก.ย. 2569 (รอบเทรน 2) — ปิดช่องโหว่จริงจากคลังคำถาม 250 ข้อ
        //    S169 "สุนัขอายุ 10 ขวบ เดินไม่ได้มาพักนึงแล้ว"
        //    S172 "สุนัข ขาหลังเดินไม่ได้ กลุ้มใจมาก"
        //    S173 "หมาแก่ อายุ 15 ปี ตอนนี้ เดินไม่ได้ ขาหลังไม่มีแรง"
        //    ทั้ง 3 ข้อเดิม "ตกไป handoff" คือบอตเงียบสนิท ทั้งที่ ACVS เรียกหมอนรองกระดูก
        //    ปริแตกว่า "a true surgical emergency"
        //
        // ⚠️ ทำไมถึงยิงทั้งแบบเฉียบพลันและแบบเป็นมานาน (ตัดสินใจแล้ว ห้ามถอย)
        //    ตรวจ 1 ก.ย. 2569: **ไม่มีแหล่งไหน** ที่ให้เกณฑ์ปลอดภัยว่า "ค่อยเป็นค่อยไป =
        //    ไม่ต้องรีบ" — Merck เขียนไว้เองว่า "Signs can occur suddenly or slowly worsen
        //    over several months" แต่ไม่ได้ให้คำแนะนำต่างกันสำหรับสองแบบนั้น
        //    และหน้า degenerative myelopathy ของ Cornell (สาเหตุแบบค่อยเป็นค่อยไปของจริง)
        //    ก็ยังบอกว่า "Several tests may need to be performed to rule out other
        //    potential spinal cord diseases."
        //    ⇒ ทางที่ปลอดภัยคือ "ให้ไปหาหมอทั้งคู่ แต่แยกน้ำเสียง" ไม่ใช่ปล่อยเงียบ
        //
        // ⚠️ ห้ามเขียนว่า "ห้ามนวด" แล้วอ้างตำรา — ตรวจแล้วไม่มีแหล่งไหนที่เปิดอ่านได้
        //    เขียนห้ามนวดตรง ๆ สิ่งที่อ้างได้จริงคือ Merck หน้าเหตุฉุกเฉิน:
        //    "minimize movement of its head, neck, and spine" · "Avoid jerking movements"
        id: 'hind_limb_paralysis',
        labelTh: 'ขาหลังไม่มีแรง / เดินไม่ได้',
        species: 'both',
        patterns: [
            /(ขาหลัง|ขาหน้า|สองขา|ขา).{0,6}(ไม่มีแรง|อ่อนแรง|ยกไม่ขึ้น|ขยับไม่ได้|ไม่ขยับ|เป็นอัมพาต)/,
            /(ขาหลัง|ขาหน้า).{0,6}(เดิน|ยืน|ลุก).{0,4}ไม่ได้/,
            /(เดิน|ยืน|ลุก|ทรงตัว).{0,4}ไม่ได้/,
            /อัมพาต|ขาลาก|ลากขา|ขาพับ|ขาแข็ง.{0,6}(เดิน|ยืน).{0,4}ไม่/,
        ],
        adviceTh: '🚨 **ขาหลังไม่มีแรงหรือเดินไม่ได้ ตำราจัดเป็นเรื่องด่วนค่ะ — ควรพาไปพบสัตวแพทย์**\n\n' +
            '• **หมา** — วิทยาลัยศัลยแพทย์สัตว์อเมริกัน (ACVS) ระบุว่าหมอนรองกระดูกสันหลังปริแตก ' +
            'ถือเป็น **"เหตุฉุกเฉินทางศัลยกรรมที่แท้จริง"** และตำรา Merck ระบุว่า ' +
            '**ถ้าผ่าตัดช้ากว่า 24 ชั่วโมงหลังจากน้องเสียความรู้สึกเจ็บไปแล้ว โอกาสฟื้นตัวจะลดลง** — เวลามีผลจริง\n' +
            '• **แมว** — ศูนย์สุขภาพแมว Cornell ระบุว่า **อัมพาตแบบเกิดขึ้นทันทีเป็นเหตุฉุกเฉินที่ต้องจัดการเดี๋ยวนั้น** ' +
            'และแมวที่มีลิ่มเลือดอุดหลอดเลือดขาหลัง (saddle thrombus) มัก **เจ็บปวดรุนแรงมาก** ร่วมด้วย\n\n' +
            '🚗 **ระหว่างพาไป** — ตำรา Merck หน้าเหตุฉุกเฉินแนะนำว่า ให้ขยับ **หัว คอ และกระดูกสันหลังให้น้อยที่สุด** ' +
            'ประคองน้องบน **แผ่นแข็งเรียบ กระดาษลังหนา ๆ หรือผ้าห่มพับ** และ **เลี่ยงการกระตุกหรือขยับแรง ๆ** ค่ะ\n\n' +
            '📌 **ถ้าเป็นมานานแล้ว / ค่อย ๆ แย่ลง** (เช่น น้องสูงวัย เดินลำบากมาหลายเดือน) — ยังต้องให้หมอตรวจอยู่ดีค่ะ ' +
            'Merck ระบุว่าอาการกลุ่มนี้ **"เกิดขึ้นทันทีก็ได้ หรือค่อย ๆ แย่ลงเป็นเดือน ๆ ก็ได้"** ' +
            'และ Cornell ระบุว่าต้องตรวจหลายอย่างเพื่อ **แยกโรคไขสันหลังอื่นออกไป** — ' +
            'ถ้าอาการทรุดเร็วขึ้นกว่าเดิม ให้ถือเป็นเรื่องด่วนทันทีค่ะ\n\n' +
            '⚠️ หนูบอกไม่ได้ว่าน้องเป็นอะไร — เรื่องนี้ต้องเอกซเรย์/ตรวจระบบประสาทโดยหมอเท่านั้นค่ะ',
        sourceUrl: A_IVDD,
        extraSources: [M_SPINE, C_CARDIO, C_DM, M_EMERG],
        verifiedAt: V,
    },
    {
        id: 'collapse',
        labelTh: 'หมดสติ / ล้มลุกไม่ขึ้น',
        species: 'both',
        patterns: [
            /หมดสติ|ไม่รู้สึกตัว|สลบ|ไม่ตอบสนอง/,
            /ล้ม(ลง)?.{0,20}(ลุกไม่|ไม่ลุก)|ลุกไม่ขึ้น|ยืนไม่ได้.{0,20}(จู่ ?ๆ|ทันที)/,
            /ตัวอ่อน(ปวกเปียก)?|ตัวเย็น(ผิดปกติ)?/,
            // ทรุด/ล้มพับ/ขาไม่มีแรง = ภาวะเดียวกับ "ล้มแล้วลุกไม่ขึ้น" แค่คนละสำนวน
            /ทรุดลง|ล้มพับ|ขา(ไม่มีแรง|อ่อนแรง)|ยืนไม่ไหว|เดินไม่ไหว/,
            /เดินเซ.{0,12}ล้ม|ล้ม.{0,12}เดินเซ/,
            /(ขา|ตัว).{0,10}สั่น.{0,25}(ล้ม|ทรุด)|(ล้ม|ทรุด).{0,25}(ขา|ตัว).{0,10}สั่น/,
        ],
        adviceTh: '**หมดสติหรือล้มแล้วลุกไม่ขึ้น** เป็นสัญญาณอันตรายที่ Merck ระบุไว้ทั้งในกลุ่มโรคลมแดดและภาวะตัวเย็นเกินค่ะ\n\nพาไปโรงพยาบาลสัตว์ทันที ระหว่างทางให้นอนตะแคง คอยืดตรง อย่ากรอกน้ำหรืออาหารเข้าปากขณะไม่รู้สึกตัวเพราะจะสำลักค่ะ',
        sourceUrl: M_EMERG,
        verifiedAt: V,
    },
    {
        id: 'eye_injury',
        labelTh: 'ตาบาดเจ็บ',
        species: 'both',
        patterns: [
            /ตา(โปน|ทะลัก|หลุด)/,
            /ตา.{0,20}(โดน|ถูก).{0,20}(ข่วน|ตำ|กระแทก)/,
            /ตา(บวม|แดง).{0,20}(เลือด|มาก)|เลือดออกที่ตา/,
        ],
        adviceTh: '**การบาดเจ็บที่ตา** อยู่ในรายการเหตุฉุกเฉินของ Merck ค่ะ ดวงตาเสียหายเร็วมากและมักกู้ไม่ได้ถ้าช้า\n\nพาไปพบสัตวแพทย์ทันที ระหว่างทาง **ห้ามหยอดยาอะไรเองทั้งสิ้น** และใส่ปลอกคอกันเลีย/กันเกาถ้ามีค่ะ',
        sourceUrl: M_EMERG,
        verifiedAt: V,
    },
    {
        id: 'severe_pain',
        labelTh: 'เจ็บปวดรุนแรง',
        species: 'both',
        patterns: [
            /ร้อง(เจ็บ|ครวญคราง|โหยหวน).{0,20}(ไม่หยุด|ตลอด)/,
            /(แตะ|จับ).{0,20}(ไม่ได้|แล้วร้องเจ็บ|ร้องลั่น|ร้องไม่หยุด)/,
            /ปวด(มาก|ทรมาน)|ทรมานมาก/,
        ],
        adviceTh: '**ความเจ็บปวดรุนแรง** อยู่ในรายการเหตุฉุกเฉินของ Merck ที่ต้องพบสัตวแพทย์ทันทีค่ะ\n\n⚠️ **ห้ามให้ยาแก้ปวดของคนเด็ดขาด** — ยาแก้ปวดคนหลายชนิดเป็นพิษต่อหมาแมว โดยเฉพาะพาราเซตามอลในแมวที่ถึงตายได้ ให้สัตวแพทย์เป็นคนสั่งยาเท่านั้นค่ะ',
        sourceUrl: M_EMERG,
        verifiedAt: V,
    },
    {
        id: 'cat_anorexia',
        labelTh: 'แมวไม่กินอาหารต่อเนื่อง',
        species: 'cat',
        patterns: [
            // ต้องมี "ไม่กิน" + ตัวบอกระยะเวลา จึงจะยิง (ดูตัวกรองใน matchEmergency)
            /ไม่(ยอม)?(กิน|ทาน|แดก)(ข้าว|อาหาร|อะไร)?/,
            /(เบื่ออาหาร|ไม่แตะอาหาร|อดอาหาร)/,
        ],
        adviceTh: '⚠️ **แมวที่ไม่กินอาหารเป็นเรื่องเร่งด่วนกว่าที่หลายคนคิดค่ะ** — ศูนย์สุขภาพแมว Cornell ระบุว่า การไม่กินอาหารส่งผลรุนแรงต่อสุขภาพแมวโตได้ **ตั้งแต่แค่ 24 ชั่วโมง** และในลูกแมวอายุต่ำกว่า 6 สัปดาห์ **แค่ 12 ชั่วโมงก็อันตรายถึงชีวิตได้**\n\nถ้าน้องไม่กินเกิน 1 วันแล้ว ควร **พาไปให้สัตวแพทย์ตรวจ** ไม่ควรรอต่อค่ะ\n\n💡 ระหว่างนี้ช่วยจดไว้ว่า: มื้อสุดท้ายที่กินคือเมื่อไร · ยังดื่มน้ำอยู่ไหม · มีอาเจียน/ท้องเสียร่วมไหม — หมอจะใช้ข้อมูลนี้มาก (บันทึกในแอปได้เลยค่ะ)',
        sourceUrl: C_ANOREXIA,
        verifiedAt: V,
    },
    {
        id: 'orphan_neonate',
        labelTh: 'ลูกสัตว์แรกเกิดไม่มีแม่ / แม่ไม่เลี้ยง',
        species: 'both',
        patterns: [
            // ⚠️ ต้องมีสัญญาณ "ไม่มีแม่ / ตัวมีปัญหา" จริง ๆ
            //    ห้ามยิงจากคำว่า "ลูกแมวแรกเกิด" เฉย ๆ เพราะคำถามแบบ
            //    "วิธีเลี้ยงลูกแมวแรกเกิดให้แข็งแรง" เป็นคำถามความรู้ ไม่ใช่เหตุด่วน
            /(ลูกแมว|ลูกหมา|ลูกสุนัข).{0,14}(ไม่มีแม่|แม่ทิ้ง|แม่ไม่เลี้ยง|แม่ตาย|กำพร้า|ไม่มีนมกิน)/,
            /(แม่แมว|แม่หมา|แม่สุนัข).{0,10}(ทิ้ง|ตาย|ไม่เลี้ยง|ไม่ให้นม|หนีไป)/,
            /(เก็บ|เจอ|พบ).{0,10}(ลูกแมว|ลูกหมา).{0,14}(แรกเกิด|ยังไม่ลืมตา|ตัวแดง|ข้างถนน)/,
            /(ลูกแมว|ลูกหมา).{0,12}(ยังไม่ลืมตา|ตัวเย็น|ไม่ดูดนม|ไม่ยอมดูดนม|ไม่ยอมกินนม)/,
        ],
        adviceTh: 'ลูกสัตว์แรกเกิดที่ไม่มีแม่ **ต้องให้สัตวแพทย์ดูโดยเร็วค่ะ** — ตำรา Merck ระบุว่าการได้รับการดูแลจากสัตวแพทย์ในช่วงแรกเกิด **ช่วยเพิ่มอัตราการรอด**\n\n' +
            '🌡️ **เรื่องที่สำคัญที่สุดคือความอบอุ่น** — ลูกหมาลูกแมวยัง **ควบคุมอุณหภูมิร่างกายเองไม่ได้จนอายุ 4 สัปดาห์** ต้องทำให้อุณหภูมิรอบตัวสูงพอที่จะรักษาอุณหภูมิร่างกายไว้ที่อย่างน้อย 36°C\n\n' +
            '⚠️ **ถ้าตัวเย็นอยู่ ห้ามป้อนนมค่ะ** — ตำราระบุให้ค่อย ๆ อุ่นตัวขึ้นก่อน (ราว 30–60 นาที) แล้วจึงค่อยป้อน เพราะตัวเย็นทำให้ลำไส้หยุดทำงาน เสี่ยงสำรอกและสำลักเข้าปอด\n\n' +
            'ติดต่อสัตวแพทย์เพื่อขอคำแนะนำเรื่องนมและวิธีป้อนที่ถูกต้องนะคะ — ชนิดนมและปริมาณ หนูระบุแทนไม่ได้ค่ะ',
        sourceUrl: M_NEONATE,
        verifiedAt: V,
    },
    {
        id: 'sudden_change',
        labelTh: 'เปลี่ยนแปลงกะทันหันหลายอย่างพร้อมกัน',
        species: 'both',
        patterns: [
            // ต้องเจอ "ซึม" ร่วมกับอย่างน้อยอีกอาการหนึ่ง จึงจะยิงกฎนี้ (ดู matchEmergency)
            /ซึม(มาก|ลง|ผิดปกติ)?/,
        ],
        adviceTh: 'Merck ระบุว่า **การเปลี่ยนแปลงกะทันหันของรูปร่าง การเดิน ความกระฉับกระเฉง การกิน การขับถ่าย หรือการเลียแต่งตัว เป็นสัญญาณว่ามีปัญหาสุขภาพ**\n\nที่เล่ามามีหลายอย่างเปลี่ยนพร้อมกัน ควร **พาไปให้สัตวแพทย์ตรวจ** ค่ะ หนูบอกไม่ได้ว่าเป็นโรคอะไร — วินิจฉัยต้องมาจากหมอที่ได้ตรวจตัวจริงเท่านั้น',
        sourceUrl: M_INTRO,
        verifiedAt: V,
    },
];
/**
 * ข้อความที่ "มีคำว่าไม่กิน" แต่จริง ๆ เป็นคำถามเรื่องความชอบอาหาร ไม่ใช่ป่วย
 * เช่น "แมวติดอาหารเปียก ไม่ยอมกินอาหารเม็ดเลย" → ต้องไม่ยิงกฎฉุกเฉิน
 */
const ANOREXIA_FALSE_POSITIVES = [
    /(อาหารเม็ด|อาหารเปียก|ยี่ห้อ|สูตร|รสชาติ|เปลี่ยนอาหาร|ติดอาหาร)/,
    /(กินแต่|เลือกกิน|ชอบกิน)/,
    // คำถามเชิงความรู้ ("สาเหตุคืออะไร" / "9 สาเหตุที่ทำให้…") ไม่ใช่เคสจริงตรงหน้า
    /\d+\s*สาเหตุ/,
    /สาเหตุ.{0,10}(ที่ทำให้|คืออะไร|มีอะไรบ้าง|อะไรบ้าง)/,
    /เกิดจาก(อะไร|สาเหตุ)/,
];
/**
 * ⚠️ ตัวแทนที่ทับ ANOREXIA_FALSE_POSITIVES (เจอจริง 1 ก.ย. 2569 รอบเทรน 2 — บั๊กความปลอดภัย)
 *
 * เคส S247 "จู่ ๆ เจ้าแมวบ้านผมก็ไม่กินข้าวทั้งอาหารเม็ด อาหารเปียก ทูน่ากระป๋อง
 * ปลาทูทอด อีกสารพัดที่คิดว่าจะกิน ไม่ยอมกินสักอย่างเลยครับ"
 * → เดิม **ถูกกลบทิ้ง** เพราะมีคำว่า "อาหารเม็ด"/"อาหารเปียก" อยู่ในตัวกรองด้านบน
 *   ทั้งที่นี่คือแมวไม่กินอะไรเลย = เคสที่ Cornell บอกว่าอันตรายตั้งแต่ 24 ชม.
 *
 * ต่างกับ S232 "แมวติดอาหารเปียกแทบไม่ยอมกินอาหารเม็ดเลย" ที่เป็นเรื่องความชอบจริง ๆ
 * ⇒ ตัวชี้ขาดคือ "ไม่กิน **ทุกอย่าง**" ไม่ใช่ "ไม่กินอย่างใดอย่างหนึ่ง"
 *
 * ⚠️ ห้ามลบตัวนี้ทิ้งเพื่อให้ตัวเลข false positive ในชุดทดสอบสวยขึ้น
 *    การพลาดเคสแมวไม่กินอาหารเสียหายมากกว่าการเตือนเกิน
 */
const ANOREXIA_OVERRIDE = [
    // "น้องไม่กินอะไร" ยังไม่ยืนยันว่าไม่กินทุกอย่างหรือเป็นมานานแค่ไหน
    // จึงปล่อยให้ triage ถามเวลา/อาการร่วมก่อน; ต้องมีคำย้ำว่าเลย/สักอย่าง/ทุกอย่าง
    /ไม่(ยอม)?(กิน|แตะ)(?:สักอย่าง|อะไรเลย|ทุกอย่าง)(?:เลย)?$/,
    /ไม่(ยอม)?กินสักอย่าง|ไม่ยอมกินอะไรเลย|ไม่กินอะไรเลย|ไม่แตะอะไรเลย/,
    /ไม่(ยอม)?กิน.{0,6}ทั้ง(อาหาร)?เม็ด/,
    /ทั้งอาหารเม็ด.{0,6}(และ|กับ)?.{0,4}อาหารเปียก/,
    /(อดอาหาร|ไม่กินอะไร).{0,10}(มา)?\d+\s*(วัน|คืน)/,
];
/**
 * ตัวบอกว่า "ไม่กิน" ถึงเกณฑ์เร่งด่วนแล้วจริง
 * Cornell ให้เกณฑ์แมวโต 24 ชม. และลูกแมวอายุต่ำกว่า 6 สัปดาห์ 12 ชม.
 * ข้อความที่ไม่บอกเวลา/อายุจะไป triage แทน ห้ามตีเป็น emergency จากคำว่าไม่กินลอย ๆ
 */
const ANOREXIA_URGENT_CONTEXT = [
    /(มา|เกิน|ครบ|ประมาณ)?\s*([1-9]|[๑-๙])\s*(วัน|คืน)/,
    /(24|๒๔)\s*(ชั่วโมง|ชม)/,
    /(12|๑๒)\s*(ชั่วโมง|ชม).{0,12}(ลูกแมว|อายุ.{0,4}(สัปดาห์|เดือน))/,
    /(ลูกแมว).{0,12}(แรกเกิด|ยังไม่ลืมตา|อายุต่ำกว่า|อายุไม่ถึง).{0,8}(6|๖)?\s*(สัปดาห์)?/,
    /จู่ ?ๆ.{0,20}ไม่(ยอม)?กิน.{0,20}(สักอย่าง|อะไรเลย|ทุกอย่าง)/,
];
/**
 * กันเคสที่คำว่า "สลบ" มาจากบริบท "ยาสลบ/วางยาสลบ" ซึ่งเป็นคำถามความรู้
 * ไม่ใช่สัตว์หมดสติอยู่ตรงหน้า
 */
const COLLAPSE_FALSE_POSITIVES = [
    /(ยาสลบ|ดมยา|วางยาสลบ|วางยา ?สลบ|ฉีดยาสลบ|ยาซึม)/,
];
/**
 * กันเคส "ลูกสัตว์แรกเกิดยังเดินไม่ได้" ซึ่งเป็นพัฒนาการปกติ ไม่ใช่อัมพาต
 * (ลูกหมาลูกแมวแรกเกิดยังเดินไม่ได้อยู่แล้ว — ยิงฉุกเฉินใส่จะทำให้คนตกใจฟรี)
 */
const PARALYSIS_FALSE_POSITIVES = [
    /(แรกเกิด|ยังไม่ลืมตา|เพิ่งคลอด|เพิ่งเกิด)/,
    /(กี่วันถึง|กี่สัปดาห์ถึง|เมื่อไห?ร่ถึงจะ|อายุเท่าไห?ร่ถึงจะ)/,
];
/** อาการเดินไม่ได้ที่ข้อความยืนยันว่าเป็นเรื้อรัง → ให้ triage นัดตรวจ ไม่ตีเป็น ER ทันที */
const PARALYSIS_CHRONIC_CONTEXT = [
    /(มาพักนึง|มาสักพัก|มานาน|หลายเดือน|หลายปี|เรื้อรัง|ค่อย ?ๆ|ทีละน้อย)/,
];
const PARALYSIS_ACUTE_CONTEXT = [
    /(จู่ ?ๆ|กะทันหัน|ทันที|เพิ่ง|วันนี้|เมื่อกี้|หลังตก|หลังโดน|หลังชน|เจ็บมาก|ร้อง)/,
];
/**
 * คำถามแบบ "ขออนุญาต" — ยังไม่ได้ให้ ยังไม่ได้กิน
 *   "แมวกินยาคนได้ไหม" = ถามก่อนทำ → ควรให้กำแพงกัน (guard) ตอบ
 *                        เพราะคำตอบนั้นระบุเจาะจงกว่า (พาราในแมว + ลิงก์ Merck)
 *   "แมวกินยาคนไปแล้ว"  = เกิดขึ้นแล้ว → ต้องเป็นเหตุฉุกเฉิน
 */
const PERMISSION_FORM = /(ได้ไหม|ได้มั้ย|ได้รึเปล่า|ได้หรือเปล่า|กินได้|ให้ได้|ควรให้)/;
const ALREADY_HAPPENED = /(กินเข้าไป|กินไปแล้ว|เผลอ|แอบ|ให้ไปแล้ว|เพิ่งกิน|กินแล้ว|ป้อนไปแล้ว|เลีย|กลืน|กัด|สัมผัส|โดน|ไปแล้ว)/;
// ชื่อสารเคมีอย่างเดียวไม่ใช่เหตุฉุกเฉินเสมอไป (เช่น ถามว่าเก็บตรงไหน)
// ต้องมีบริบทว่าได้รับ/สัมผัสจริงก่อน จึงยกธงพิษ เพื่อกัน false positive
// จากคำถามความรู้และการจัดเก็บในบ้าน
const TOXIN_EXPOSURE = /โดนวางยา|ถูกวางยา|วางยาเบื่อ|(?:กิน|เลีย|กลืน|เผลอ|แอบ|ป้อน|ให้(?:กิน|ยา|ดื่ม|เลีย)|โดน|ถูก|สัมผัส|สูด|ดื่ม|กัด|เข้าตา|หกใส่|ได้รับ).{0,24}(?:ยาเบื่อ|ยาฆ่า|ฟูราดาน|ยาคน|ยาเจ้าของ|ยาเกิน|น้ำยา|ผงซักฟอก|สารเคมี|แอมโมเนีย|น้ำมันหอมระเหย|น้ำมันเครื่อง|แอนตี้ฟรีซ|antifreeze)|(?:ยาเบื่อ|ยาฆ่า|ฟูราดาน|ยาคน|ยาเจ้าของ|ยาเกิน|น้ำยา|ผงซักฟอก|สารเคมี|แอมโมเนีย|น้ำมันหอมระเหย|น้ำมันเครื่อง|แอนตี้ฟรีซ|antifreeze).{0,24}(?:กิน|เลีย|กลืน|เผลอ|แอบ|ป้อน|ให้(?:กิน|ยา|ดื่ม|เลีย)|โดน|ถูก|สัมผัส|สูด|ดื่ม|กัด|เข้าตา|หกใส่)/;
/** อาการร่วมที่ใช้ยืนยันกฎ sudden_change (ต้องเจออย่างน้อย 1 ตัว) */
const SUDDEN_CHANGE_COMPANIONS = [
    /ไม่(ยอม)?(กิน|ทาน)(ข้าว|อาหาร|น้ำ)?/,
    /(อ้วก|อาเจียน|ขย้อน)/,
    /ท้องเสีย|ถ่ายเหลว/,
    /ไม่(ยอม)?ลุก|ไม่เดิน|เดินเซ/,
    /ตัวสั่น|สั่น/,
    /ไม่เล่น|ไม่ร่าเริง|นอนทั้งวัน/,
];
// คำถามเชิงเกณฑ์หลังออกกำลัง/เรื่องฮีทสโตรกยังไม่มีเหตุฉุกเฉินยืนยัน
// ให้ปล่อยไปตอบความรู้หรือ handoff แทนการขึ้นธงแดงจากคำว่า "หอบ"/"ฮีทสโตรก" ลอย ๆ
const EXERCISE_BREATHING_QUERY = /หลังออกกำลัง|หลังวิ่ง|หลังเล่น/;
const SEVERE_BREATHING_CONTEXT = /ไม่หาย|อ้าปาก|ลิ้น|เหงือก|ทรุด|ล้ม|ยืนไม่ไหว|ตัวเขียว|หายใจไม่ทัน|ขาดอากาศ|หายใจแผ่ว/;
const BREATHING_INFO_QUERY = /ดูยังไง|ดูอย่างไร|สังเกต|แบบไหน|เช็ก|เช็ค|ต่างกันยังไง|รู้ได้ยังไง/;
// A general question earlier in the sentence cannot hide a simultaneous live
// breathing emergency. Keep this override bound to explicit current wording.
const CURRENT_BREATHING_REPORT = /(?:ตอนนี้|วันนี้|เมื่อกี้|กำลัง|เพิ่ง).{0,32}(?:หายใจไม่ออก|หายใจลำบาก)|(?:หายใจไม่ออก|หายใจลำบาก).{0,24}(?:ตอนนี้|อยู่ตอนนี้)/;
// "อันตรายไหม" ต่อท้ายคำถามเชิงข้อมูล = เจ้าของกำลังรายงานอาการจริงที่เห็นอยู่ตอนนี้
// ไม่ใช่ถามความรู้ทั่วไปเฉยๆ (ต่างจาก "หอบหืด อาการสังเกตยังไง" ที่ถามเรื่องโรคลอย ๆ)
// ใช้ร่วมกันทั้งกฎ breathing และ heatstroke เพราะเป็นรูปประโยคเดียวกัน
const ACTIVE_CONCERN_PHRASE = /อันตรายไหม|อันตรายรึเปล่า|อันตรายหรือเปล่า|อันตรายมั้ย|น่าเป็นห่วงไหม|เป็นอะไรไหม|เป็นอะไรมั้ย|ควรไปหาหมอ.{0,12}ไหม|ต้องพาไป.{0,12}ไหม/;
const HEATSTROKE_INFO_QUERY = /รู้ได้ยังไง|สังเกต|อาการ|แบบไหน|เช็กอาการ/;
const ACTIVE_HEATSTROKE_CONTEXT = /กำลัง|เป็นฮีทสโตรก|ตัวร้อน|หอบ|อาเจียน|น้ำลาย|ล้ม|หมดสติ/;
/** กฎ poisoning จะตอบข้อความนี้เองหรือไม่ (ใช้กันไม่ให้ intent เดิมของสารเคมีในบ้านเปลี่ยน) */
function poisoningFires(q) {
    const poisoning = exports.EMERGENCY_RULES.find((r) => r.id === 'poisoning');
    if (!poisoning || !poisoning.patterns.some((p) => p.test(q)))
        return false;
    if (!TOXIN_EXPOSURE.test(q))
        return false;
    return !(PERMISSION_FORM.test(q) && !ALREADY_HAPPENED.test(q));
}
/**
 * หา "ธงแดง" จากข้อความผู้ใช้
 * @param text  ข้อความดิบจากผู้ใช้
 * @param species  'dog' | 'cat' | undefined — ชนิดสัตว์ที่กำลังคุยถึง
 */
function matchEmergency(text, species) {
    const q = String(text || '').toLowerCase();
    if (!q)
        return null;
    // ถ้าในข้อความระบุชนิดสัตว์เอง ให้ยึดตามข้อความก่อน (เจ้าของอาจถามแทนตัวอื่น)
    const saidCat = /แมว|เหมียว|cat/.test(q);
    const saidDog = /หมา|สุนัข|dog/.test(q);
    const effSpecies = saidCat && !saidDog ? 'cat'
        : saidDog && !saidCat ? 'dog'
            : (species === 'cat' || species === 'dog') ? species
                : undefined;
    for (const rule of exports.EMERGENCY_RULES) {
        if (rule.species !== 'both') {
            // กฎเฉพาะสายพันธุ์ — ถ้าไม่รู้ว่าเป็นตัวอะไร ให้ข้าม (ปลอดภัยกว่าเดา)
            if (effSpecies !== rule.species)
                continue;
        }
        for (const p of rule.patterns) {
            const m = q.match(p);
            if (!m)
                continue;
            if (rule.id === 'sudden_change') {
                // ต้องมีอาการร่วมอย่างน้อย 1 อย่าง ไม่งั้น "ซึม" คำเดียวจะยิงมั่วเกินไป
                if (!SUDDEN_CHANGE_COMPANIONS.some((c) => c.test(q)))
                    continue;
            }
            if (rule.id === 'cat_anorexia') {
                // กันเคส "ไม่ยอมกินอาหารเม็ด กินแต่อาหารเปียก" ที่เป็นเรื่องความชอบ
                // แต่ถ้าเข้าข่าย "ไม่กินอะไรเลยสักอย่าง" ให้ยิงเสมอ (override ชนะตัวกรอง)
                const anorexiaOverride = ANOREXIA_OVERRIDE.some((c) => c.test(q));
                if (!anorexiaOverride && ANOREXIA_FALSE_POSITIVES.some((c) => c.test(q)))
                    continue;
                if (!anorexiaOverride && !ANOREXIA_URGENT_CONTEXT.some((c) => c.test(q)))
                    continue;
            }
            if (rule.id === 'poisoning') {
                if (!TOXIN_EXPOSURE.test(q))
                    continue;
                // ถามก่อนทำ (ยังไม่ได้ให้) → ปล่อยให้ guard human_medicine ตอบ ซึ่งเจาะจงกว่า
                if (PERMISSION_FORM.test(q) && !ALREADY_HAPPENED.test(q))
                    continue;
            }
            if (rule.id === 'human_medicine_ingestion') {
                // "ให้หมากินพาราได้ไหม" = ถามก่อน → guard human_medicine ตอบ · ยาของน้องเองตามที่หมอสั่ง = ไม่ใช่เหตุนี้
                if (!(0, ingestion_1.isAccidentalIngestionTh)(q, effSpecies))
                    continue;
                // สารเคมีในบ้าน/ยาเบื่อที่กฎ poisoning รู้จักอยู่แล้ว ให้กฎนั้นตอบ (ข้อความเดียวกัน · intent เดิม)
                if (!HUMAN_MEDICINE_INGESTION.test(q) && poisoningFires(q))
                    continue;
                if (!HUMAN_MEDICINE_INGESTION.test(q) && HOUSEHOLD_CHEMICAL.test(q)) {
                    const poisoning = exports.EMERGENCY_RULES.find((r) => r.id === 'poisoning');
                    if (poisoning)
                        return { rule: poisoning, matched: m[0] };
                }
            }
            if (rule.id === 'paracetamol_cat') {
                // ถามก่อนให้ยา → ให้ human_medicine guard ตอบ; เหตุฉุกเฉินเฉพาะกรณี
                // กิน/ป้อนไปแล้วหรือมีสัญญาณว่าได้รับยาแล้ว
                if (PERMISSION_FORM.test(q) && !ALREADY_HAPPENED.test(q))
                    continue;
            }
            if (rule.id === 'hind_limb_paralysis') {
                // ลูกสัตว์แรกเกิดยังเดินไม่ได้เป็นเรื่องปกติ ไม่ใช่อัมพาต
                if (PARALYSIS_FALSE_POSITIVES.some((c) => c.test(q)))
                    continue;
                if (PARALYSIS_CHRONIC_CONTEXT.some((c) => c.test(q)) && !PARALYSIS_ACUTE_CONTEXT.some((c) => c.test(q)))
                    continue;
            }
            if (rule.id === 'collapse') {
                // กันเคส "ดมยาสลบอันตรายไหม" ที่คำว่า "สลบ" มาจากชื่อยา ไม่ใช่อาการ
                if (COLLAPSE_FALSE_POSITIVES.some((c) => c.test(q)))
                    continue;
            }
            if (rule.id === 'breathing' && EXERCISE_BREATHING_QUERY.test(q) && !SEVERE_BREATHING_CONTEXT.test(q) && !CURRENT_BREATHING_REPORT.test(q))
                continue;
            if (rule.id === 'breathing' && BREATHING_INFO_QUERY.test(q) && !SEVERE_BREATHING_CONTEXT.test(q) && !ACTIVE_CONCERN_PHRASE.test(q) && !CURRENT_BREATHING_REPORT.test(q))
                continue;
            if (rule.id === 'heatstroke' && HEATSTROKE_INFO_QUERY.test(q) && !ACTIVE_HEATSTROKE_CONTEXT.test(q) && !ACTIVE_CONCERN_PHRASE.test(q))
                continue;
            return { rule, matched: m[0] };
        }
    }
    return null;
}
/** ท้ายข้อความฉุกเฉินทุกอัน — บังคับใส่เสมอ */
exports.EMERGENCY_FOOTER = '\n\n— ข้อมูลนี้เป็นการเตือนเบื้องต้นจากตำราสัตวแพทย์ ไม่ใช่การวินิจฉัย และไม่แทนการตรวจโดยสัตวแพทย์ค่ะ';

},
"redflags":function(require,module,exports){
"use strict";
// lib/smartBot/redflags.ts
// "อาการแบบไหนถึงต้องรีบพาไปหาหมอ" — คำถามเชิงเกณฑ์ ไม่ใช่การแจ้งอาการ
//
// ต่างจาก emergency.ts ตรงที่:
//   emergency.ts = ผู้ใช้ "กำลังเจออาการอยู่" → ต้องเตือนให้รีบไปเดี๋ยวนี้
//   redflags.ts  = ผู้ใช้ "ถามว่าแบบไหนถึงควรไป" → ตอบเป็นรายการสัญญาณเตือน
//
// ทำไมต้องแยก: ถ้าเอาไปยัดใน emergency.ts คนที่แค่ "ถาม" จะโดนขึ้น
// "🚨 ต้องรีบพาไปหาสัตวแพทย์" ทั้งที่ยังไม่มีอะไรเกิดขึ้น = เตือนหลอก
//
// ⚠️ ขอบเขตเดิมยังบังคับใช้ (docs/Pet-Knowledge-Base-Plan-2569-08-27.md §6):
//   การบอกว่า "เมื่อไหร่ควรพบสัตวแพทย์" ทำได้ (มันคือตรงข้ามกับข้อห้าม "บอกว่าไม่ต้องไปหาหมอ")
//   แต่ห้ามบอกวิธีรักษาเอง ห้ามบอกขนาดยา ห้ามวินิจฉัยว่าเป็นโรคอะไร
//
// ⚠️ ห้ามใส่คำแนะนำ "งดน้ำงดอาหาร 24 ชม." ที่อยู่บนหน้า Merck เดียวกัน
//    ถึงจะมีในตำราจริง แต่นั่นคือ "การรักษา" ซึ่งอยู่นอกขอบเขตที่ Smart Bot ตอบได้
//
// ทุกกฎต้องมี sourceUrl + verifiedAt + คำอ้างอิงต้นฉบับในคอมเมนต์ (กฎเดียวกับ emergency.ts)
Object.defineProperty(exports, "__esModule", { value: true });
exports.RED_FLAG_FOOTER = exports.RED_FLAG_RULES = exports.VOMIT_ANSWER = void 0;
exports.matchRedFlag = matchRedFlag;
const V = '2026-09-01';
// ── อาเจียน (ตรวจสอบ + ดึงข้อความจริงแล้ว 1 ก.ย. 2569) ──
//
// หน้า "Vomiting in Dogs":
//   "Long-term vomiting, vomiting that occurs more often than once or twice daily,
//    and vomiting accompanied by blood, abdominal pain, depression, dehydration,
//    weakness, fever, weight loss, or other signs requires a more detailed examination."
//   "When a dog has been vomiting for only a short time (less than 3 to 4 days)
//    and no other signs are present..."
//
// หน้า "Vomiting in Cats":
//   "Longterm vomiting, vomiting that occurs more often than once or twice daily,
//    and vomiting accompanied by blood, abdominal pain, depression, dehydration,
//    weakness, fever, weight loss, or other adverse signs requires a detailed
//    examination by your veterinarian."
//   "When a cat has been vomiting occasionally for only a short time
//    (less than 1 to 2 days) and no other signs of disease are present..."
//
// ⚠️ กรอบเวลา "ระยะสั้น" ของหมากับแมว **ไม่เท่ากัน** ในตำรา (หมา 3–4 วัน · แมว 1–2 วัน)
//    ห้ามยุบรวมเป็นตัวเลขเดียว
const M_VOMIT_DOG = 'https://www.merckvetmanual.com/dog-owners/digestive-disorders-of-dogs/vomiting-in-dogs';
const M_VOMIT_CAT = 'https://www.merckvetmanual.com/cat-owners/digestive-disorders-of-cats/vomiting-in-cats';
const M_EMERGENCY = 'https://www.merckvetmanual.com/special-pet-topics/emergencies/evaluation-and-initial-treatment-of-dog-and-cat-emergencies';
const C_EMERGENCY = 'https://www.vet.cornell.edu/hospitals/services/emergency-and-critical-care-0';
// export เพราะ triage.ts เอาไปใช้ซ้ำ (คำถามรูป "หมาอ้วก เกิดจากอะไร" ที่ไม่เข้า ASK_THRESHOLD)
// ⚠️ ห้ามคัดลอกข้อความนี้ไปวางซ้ำในไฟล์อื่น — แก้ที่เดียวต้องมีผลทุกที่
exports.VOMIT_ANSWER = 'ตำราสัตวแพทย์ Merck ระบุว่า **การอาเจียนที่ควรให้สัตวแพทย์ตรวจละเอียด** คือกรณีเหล่านี้ค่ะ\n\n' +
    '**1. ความถี่**\n' +
    '• อาเจียนบ่อยกว่า **วันละ 1–2 ครั้ง**\n' +
    '• อาเจียนเรื้อรัง เป็นต่อเนื่องยาวนาน\n\n' +
    '**2. มีอาการอื่นร่วมด้วย** (ข้อใดข้อหนึ่งก็ควรไป)\n' +
    '• มี **เลือด** ปนออกมา\n' +
    '• ปวดท้อง / ท้องแข็ง กดแล้วเจ็บ\n' +
    '• ซึม ไม่มีแรง อ่อนเพลีย\n' +
    '• มีภาวะขาดน้ำ\n' +
    '• มีไข้\n' +
    '• น้ำหนักลด\n\n' +
    '**3. กรอบเวลา — หมากับแมวไม่เท่ากัน**\n' +
    'ตำราแยกไว้คนละเกณฑ์: ในสุนัขนับว่า "ระยะสั้น" คือ **น้อยกว่า 3–4 วัน** ' +
    'แต่ในแมวคือ **น้อยกว่า 1–2 วัน** — แมวจึงมีเวลาให้รอน้อยกว่าค่ะ\n\n' +
    '🚨 **2 กรณีนี้ไม่ต้องรอเลย ให้ไปเดี๋ยวนี้**\n' +
    '• **ขย้อน/พยายามอาเจียนแต่ไม่มีอะไรออก ร่วมกับท้องกาง** โดยเฉพาะสุนัขพันธุ์ใหญ่อกลึก — เข้าได้กับภาวะกระเพาะบิดตัว (GDV) ที่ตำราระบุว่าคุกคามชีวิต\n' +
    '• **อาเจียนปนเลือด**\n\n' +
    '💡 ถ้าจะพาไป ช่วยจดไว้ด้วยจะช่วยหมอมาก: เริ่มอาเจียนตั้งแต่เมื่อไร · วันละกี่ครั้ง · ' +
    'สิ่งที่อาเจียนออกมาหน้าตาแบบไหน · ยังกินน้ำ/อาหารอยู่ไหม (บันทึกในแอปได้เลยค่ะ)';
exports.RED_FLAG_RULES = [
    {
        id: 'vomiting',
        labelTh: 'อาเจียนแบบไหนควรพาไปหาสัตวแพทย์',
        symptom: /(อ้วก|อาเจียน|ขย้อน|สำรอก)/,
        answerTh: exports.VOMIT_ANSWER,
        sourceUrl: M_VOMIT_DOG,
        verifiedAt: V,
    },
];
/** URL อ้างอิงเพิ่มเติมรายกฎ (กฎเดียวอาจอ้างได้หลายหน้า) */
const EXTRA_SOURCES = {
    vomiting: [M_VOMIT_CAT],
};
/**
 * รูปประโยค "ถามเกณฑ์" — ต้องเจอถึงจะนับว่าเป็นคำถามเชิงเกณฑ์
 *
 * ⚠️ ห้ามใส่คำว่า "อันตรายไหม" ลงในนี้
 *    เพราะ "แมวอ้วกเป็นเลือด อันตรายไหม" คือคนกำลังเจอเหตุจริง
 *    ต้องปล่อยให้ emergency.ts (ซึ่งทำงานก่อน) รับไป ไม่ใช่มาตอบเป็นรายการเกณฑ์
 */
const ASK_THRESHOLD = /(แบบไหน|ยังไงถึง|อย่างไรถึง|ลักษณะไหน|กี่ครั้งถึง|ขนาดไหนถึง|แค่ไหนถึง|เมื่อไห?ร่ถึง|ตอนไหนถึง|เมื่อไห?ร่ควร|ตอนไหนควร|สังเกต(ยังไง|อย่างไร|ได้ยังไง)|ดูยังไงว่า|รู้ได้ยังไงว่า)/;
/**
 * คำที่บอกว่า "ต้องรีบไปหาหมอ" — ใช้คู่กับ ASK_THRESHOLD
 * เพื่อกันประโยคเล่าเรื่องที่บังเอิญมีคำว่า "แบบไหน" ติดมา
 */
const VET_REFERENCE = /(หาหมอ|หาสัตวแพทย์|พาไป|ไปหาหมอ|ไปคลินิก|ไปโรงพยาบาล|ต้องรีบ|ควรไป|ต้องไป|ผิดปกติ|น่าเป็นห่วง|กังวล)/;
// คำถามเกณฑ์ทั่วไป เช่น quick chip “อาการที่ต้องพบหมอด่วน” ไม่มีอาการเฉพาะ
// จึงต้องมีคำตอบฟรีที่แยกจากกฎฉุกเฉินซึ่งใช้เมื่อกำลังเกิดเหตุจริง
// Merck และ Cornell ระบุการหายใจลำบาก หมดสติ/ล้ม ชัก เลือดออกมาก
// ปัสสาวะไม่ออก สงสัยสารพิษ และขย้อนโดยไม่ออกเป็นเหตุฉุกเฉิน
const GENERAL_EMERGENCY_QUESTION = /(?:อาการ|สัญญาณ).{0,36}(?:พบ(?:หมอ|สัตวแพทย์)ด่วน|(?:พบ|ไปหา|พาไปหา)(?:หมอ|สัตวแพทย์).{0,6}(?:ด่วน|ทันที)|ต้องรีบ.{0,14}(?:หมอ|สัตวแพทย์)|ควรรีบ.{0,14}(?:หมอ|สัตวแพทย์)|ฉุกเฉิน)|\b(?:symptoms?|signs?)\b.{0,30}\b(?:urgent|emergency)\b.{0,15}\b(?:vet|veterinarian)\b/i;
const GENERAL_EMERGENCY_RULE = {
    id: 'general_emergency',
    labelTh: 'สัญญาณที่ควรพบสัตวแพทย์ฉุกเฉิน',
    symptom: GENERAL_EMERGENCY_QUESTION,
    answerTh: 'ถ้าน้องกำลังมีอาการต่อไปนี้ **ให้พาไปโรงพยาบาลสัตว์ฉุกเฉินทันที** และโทรแจ้งระหว่างเดินทางหากทำได้ค่ะ\n\n' +
        '• หายใจลำบาก หรือเหงือกซีด/ม่วง\n' +
        '• หมดสติ ล้ม หรือชัก\n' +
        '• บาดเจ็บรุนแรง หรือเลือดออกมาก\n' +
        '• พยายามปัสสาวะแต่ไม่ออก\n' +
        '• สงสัยว่ากินยา สารพิษ หรือสิ่งอันตราย\n' +
        '• อาเจียนรุนแรง/ต่อเนื่อง หรือขย้อนแต่ไม่มีอะไรออก โดยเฉพาะเมื่อท้องกางหรือเจ็บท้อง\n\n' +
        'ถ้าอาการไม่อยู่ในรายการแต่ดูผิดปกติหรือไม่แน่ใจ ให้โทรปรึกษาสัตวแพทย์โดยเร็วค่ะ',
    sourceUrl: M_EMERGENCY,
    verifiedAt: '2026-09-29',
};
/**
 * จับเฉพาะ "คำถามเชิงเกณฑ์" เท่านั้น
 * ต้องครบ 3 อย่าง: มีอาการที่รู้จัก + เป็นรูปประโยคถามเกณฑ์ + อ้างถึงการไปหาหมอ
 *
 * ⚠️ ต้องเรียก **หลัง** matchEmergency เสมอ
 *    เพราะคนที่กำลังเจอเหตุจริงต้องได้คำเตือนฉุกเฉิน ไม่ใช่รายการเกณฑ์
 */
function matchRedFlag(text) {
    const q = String(text || '').toLowerCase();
    if (ASK_THRESHOLD.test(q) && VET_REFERENCE.test(q)) {
        for (const rule of exports.RED_FLAG_RULES) {
            if (rule.symptom.test(q)) {
                return { rule, sources: [rule.sourceUrl, ...(EXTRA_SOURCES[rule.id] || [])] };
            }
        }
    }
    if (GENERAL_EMERGENCY_QUESTION.test(q)) {
        return { rule: GENERAL_EMERGENCY_RULE, sources: [M_EMERGENCY, C_EMERGENCY] };
    }
    return null;
}
/** ท้ายข้อความทุกอัน — บังคับใส่เสมอ (ถ้อยคำเดียวกับฝั่งฉุกเฉิน) */
exports.RED_FLAG_FOOTER = '\n\n— ข้อมูลนี้เป็นเกณฑ์เบื้องต้นจากตำราสัตวแพทย์ ไม่ใช่การวินิจฉัย และไม่แทนการตรวจโดยสัตวแพทย์ค่ะ';

},
"triage":function(require,module,exports){
"use strict";
// lib/smartBot/triage.ts
// ─────────────────────────────────────────────────────────────────────────
// "อาการนี้ควรพาไปหาหมอเมื่อไหร่" — ตัวรับคำถามอาการแบบกว้าง
//
// ต่างจากอีก 2 ไฟล์ที่หน้าตาคล้ายกัน:
//   emergency.ts = ผู้ใช้กำลังเจอเหตุด่วน       → 🚨 ให้ไปเดี๋ยวนี้
//   redflags.ts  = ผู้ใช้ถาม "แบบไหนถึงควรไป"   → ต้องมีรูปประโยคถามเกณฑ์ครบ 3 ชั้น
//   triage.ts    = ผู้ใช้ถามลอย ๆ ว่า "เกิดจากอะไร / ทำไงดี" กับอาการที่รู้จัก
//                  → บอก "สัญญาณที่ต้องรีบไป" + "สิ่งที่จดไปให้หมอ" โดยไม่วินิจฉัย
//
// ทำไมต้องมีไฟล์นี้: จากคลังคำถามจริง 250 ข้อ กลุ่มที่บอทส่งต่อ Agent มากที่สุด
// คือคำถามรูป "แมวฉี่นอกกระบะทำไงดี" / "แมวไม่ถ่าย สาเหตุคืออะไร"
// ซึ่ง redflags.ts จับไม่ได้เพราะไม่มีคำว่า "แบบไหนถึงควรไปหาหมอ"
//   → ดู docs/SmartBot-Training-Round2-2569-09-01.md
//
// ⚠️ ขอบเขตเดิมยังบังคับใช้ (docs/Pet-Knowledge-Base-Plan-2569-08-27.md §6):
//   ✅ ทำได้: บอกว่าอาการแบบไหนควรพบสัตวแพทย์ · บอกว่าอาการนี้มีได้หลายสาเหตุ
//   ❌ ห้าม: ฟันธงว่าเป็นโรคอะไร · บอกวิธีรักษา · บอกขนาดยา · บอกว่าไม่ต้องไปหาหมอ
//
// ⚠️ ห้ามใส่ "ตัวเลขจำนวนวัน" ที่ไม่มีในตำรา
//    ตรวจแล้ว 1 ก.ย. 2569: Merck (ทั้งหน้าเจ้าของสัตว์และหน้าสัตวแพทย์) และ Cornell
//    **ไม่ได้ระบุ** ว่า "ไม่ถ่ายกี่วันถึงต้องไปหาหมอ" เลย
//    ตัวเลข 48–72 ชม. ที่เจอตามเว็บ มาจากเว็บพาณิชย์ (VCA/PetMD/Vetster) ไม่ใช่ตำรา
//    → ไฟล์นี้จึงใช้ "อาการร่วม" เป็นเกณฑ์แทนจำนวนวัน ห้ามเติมตัวเลขเอาเอง
//
// ทุกกฎต้องมี sourceUrl + verifiedAt + คำอ้างอิงต้นฉบับในคอมเมนต์ (กฎเดียวกับ emergency.ts)
// ─────────────────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.TRIAGE_FOOTER = exports.TRIAGE_RULES = void 0;
exports.matchTriage = matchTriage;
const redflags_1 = require("./redflags");
const V = '2026-09-01';
// ── แหล่งอ้างอิง (ดึงข้อความจริงแล้ว 1 ก.ย. 2569) ──
const CORNELL_FLUTD = 'https://vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/feline-lower-urinary-tract-disease';
const M_URO_CAT = 'https://www.merckvetmanual.com/cat-owners/kidney-and-urinary-tract-disorders-of-cats/noninfectious-diseases-of-the-urinary-system-of-cats';
const M_GI_CAT = 'https://www.merckvetmanual.com/cat-owners/digestive-disorders-of-cats/disorders-of-the-stomach-and-intestines-in-cats';
const M_GI_DOG = 'https://www.merckvetmanual.com/dog-owners/digestive-disorders-of-dogs/disorders-of-the-stomach-and-intestines-in-dogs';
const CORNELL_DIA_DOG = 'https://www.vet.cornell.edu/departments-centers-and-institutes/riney-canine-health-center/canine-health-topics/diarrhea';
const CORNELL_DIA_CAT = 'https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/diarrhea';
// เอกสารสำหรับเจ้าของแมวของสมาคมสัตวแพทย์แมวสหรัฐฯ (FelineVMA เดิมคือ AAFP) ร่วมกับ iCatCare
const FVMA_HOUSE_SOILING = 'https://catvets.com/wp-content/uploads/2025/02/FelineVMA-House-Soiling_BW.pdf';
const M_RINGWORM_CAT = 'https://www.merckvetmanual.com/cat-owners/skin-disorders-of-cats/ringworm-dermatophytosis-in-cats';
const M_RINGWORM_DOG = 'https://www.merckvetmanual.com/dog-owners/skin-disorders-of-dogs/ringworm-dermatophytosis-in-dogs';
const CORNELL_ZOONOTIC = 'https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/zoonotic-disease-what-can-i-catch-my-cat';
const M_ITCH_CAT = 'https://www.merckvetmanual.com/cat-owners/skin-disorders-of-cats/itching-pruritus-in-cats';
const M_ITCH_DOG = 'https://www.merckvetmanual.com/dog-owners/skin-disorders-of-dogs/itching-pruritus-in-dogs';
const M_FLEAS_CAT = 'https://www.merckvetmanual.com/cat-owners/skin-disorders-of-cats/fleas-of-cats';
const M_ALOPECIA_CAT = 'https://www.merckvetmanual.com/cat-owners/skin-disorders-of-cats/hair-loss-alopecia-in-cats';
const M_ALOPECIA_DOG = 'https://www.merckvetmanual.com/dog-owners/skin-disorders-of-dogs/hair-loss-alopecia-in-dogs';
const M_OTITIS_CAT = 'https://www.merckvetmanual.com/cat-owners/ear-disorders-of-cats/otitis-externa-in-cats';
const M_OUTER_EAR_CAT = 'https://www.merckvetmanual.com/cat-owners/ear-disorders-of-cats/disorders-of-the-outer-ear-in-cats';
const CORNELL_EARMITE = 'https://vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/ear-mites-tiny-critters-can-pose-major-threat';
const CORNELL_ANOREXIA = 'https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/anorexia';
const M_SPINAL_DOG = 'https://www.merckvetmanual.com/dog-owners/brain-spinal-cord-and-nerve-disorders-of-dogs/disorders-of-the-spinal-column-and-cord-in-dogs';
const ACVS_IVDD = 'https://www.acvs.org/small-animal/intervertebral-disc-disease/';
// ═════════════════════════════════════════════════════════════════════════
// 1) ฉี่นอกกระบะ / ไม่เข้ากระบะ
// ═════════════════════════════════════════════════════════════════════════
//
// Cornell Feline Health Center — "Feline Lower Urinary Tract Disease":
//   "A urethral obstruction is an absolute emergency, requiring immediate
//    veterinary treatment."
//   "The time from complete urinary obstruction until death may be less than
//    twenty-four to forty-eight hours, so immediate treatment is essential."
//   รายการอาการ (คัดมาตรงตัว):
//     "Inappropriate urination (that is, outside of the litter box)"
//     "Crying out while urinating"
//     "Blood in the urine"
//     "Frequent licking of the genital region"
//
// Merck (หน้าเจ้าของแมว) — "Noninfectious Diseases of the Urinary System of Cats":
//   "Signs of feline idiopathic cystitis include frequent urination, blood in
//    the urine, straining or distress while urinating, and urination in
//    inappropriate locations."
//   "A urinary tract obstruction may occur in male cats due to their longer and
//    narrower urethras; this should be considered a medical emergency and
//    requires immediate veterinary attention."
//   "Signs of this condition include frequent unsuccessful attempts to urinate,
//    vocalizing in the litter box, lethargy, loss of appetite, and reluctance to move."
//
// ⚠️ ตัวเลขเวลาของสองแหล่ง **ไม่ตรงกัน** (Merck 2–3 วัน · Cornell 24–48 ชม.)
//    ไฟล์นี้เลือกใช้ตัวเลข Cornell ที่สั้นกว่า เพราะฝั่งปลอดภัยกว่า
//    ห้ามเอาสองตัวเลขมาผสมกันเป็นช่วงใหม่
const LITTERBOX_ANSWER = 'การฉี่นอกกระบะ **ไม่ได้แปลว่าดื้อเสมอไป** ค่ะ ตำราสัตวแพทย์จัดให้ "ปัสสาวะไม่เป็นที่" ' +
    'เป็นหนึ่งใน**อาการของโรคทางเดินปัสสาวะส่วนล่างในแมว (FLUTD)** ด้วย ' +
    'เพราะแบบนี้จึงต้องตัดเรื่องสุขภาพออกก่อน แล้วค่อยไปแก้เรื่องกระบะ/สิ่งแวดล้อมค่ะ\n' +
    'เอกสารสำหรับเจ้าของแมวของสมาคมสัตวแพทย์แมวสหรัฐฯ เขียนไว้ตรง ๆ ว่า ' +
    '**แมวทุกตัวที่เริ่มขับถ่ายไม่เป็นที่ ควรได้รับการตรวจร่างกายอย่างละเอียดและตรวจปัสสาวะ** ' +
    'เพื่อคัดกรองปัญหาสุขภาพก่อน\n\n' +
    '🚨 **ถ้ามีข้อใดข้อหนึ่งนี้ ให้ไปโรงพยาบาลสัตว์เดี๋ยวนี้ ห้ามรอข้ามคืน**\n' +
    '• เข้ากระบะบ่อยมาก **เบ่งแล้วฉี่ออกน้อยหรือไม่ออกเลย**\n' +
    '• **ร้องขณะฉี่** หรือร้องในกระบะ\n' +
    '• **ฉี่มีเลือดปน**\n' +
    '• เลียอวัยวะเพศถี่ผิดปกติ\n' +
    '• ซึม ไม่กินข้าว ไม่ยอมขยับตัว\n' +
    'Cornell ระบุว่าท่อปัสสาวะอุดตันคือ **ภาวะฉุกเฉินเต็มรูปแบบ** และเวลาตั้งแต่อุดตันสมบูรณ์จนถึงเสียชีวิต ' +
    '**อาจน้อยกว่า 24–48 ชั่วโมง** — พบบ่อยที่สุดในแมวเพศผู้ เพราะท่อปัสสาวะยาวและแคบกว่าค่ะ\n\n' +
    '📋 **ถ้าไม่มีสัญญาณข้างบนเลย** ให้พาไปตรวจแบบไม่เร่งด่วนเพื่อตัดเรื่องโรคออกก่อน ' +
    'แล้วช่วยจดข้อมูลนี้ไปให้หมอด้วยจะช่วยได้มาก\n' +
    '• เริ่มฉี่นอกกระบะตั้งแต่เมื่อไร · มีอะไรเปลี่ยนในบ้านช่วงนั้นไหม (ย้ายของ · คนใหม่ · แมวใหม่)\n' +
    '• ฉี่นอกกระบะที่ตรงไหน · พื้นแบบไหน (ผ้า/พรม/พื้นเรียบ)\n' +
    '• ปริมาณฉี่แต่ละครั้ง มาก/น้อยกว่าปกติไหม\n' +
    '• เปลี่ยนทราย เปลี่ยนกระบะ หรือย้ายที่วางกระบะช่วงนี้หรือเปล่า\n' +
    '(บันทึกการขับถ่ายในแอปได้เลยค่ะ จะได้เห็นว่าเปลี่ยนไปตั้งแต่วันไหน)\n\n' +
    '🧺 **เรื่องกระบะ — เกณฑ์จากสมาคมสัตวแพทย์แมวสหรัฐฯ (FelineVMA/AAFP)**\n' +
    '• **จำนวน: 1 กระบะต่อแมว 1 ตัว + เพิ่มอีก 1 ใบ** และต้องวาง**แยกจุดกัน** ' +
    '(เลี้ยง 3 ตัว = 4 ใบ) เพราะแมวมองกระบะที่วางติดกันว่าเป็น "ใบใหญ่ใบเดียว"\n' +
    '• **ขนาด: ยาวประมาณ 1.5 เท่าของตัวแมว** วัดจากจมูกถึงโคนหาง\n' +
    '• **ที่วาง:** ที่เงียบ เป็นส่วนตัว ไม่ใช่ทางเดินพลุกพล่าน ไม่ใช่มุมอับที่หนีไม่ได้ · ' +
    '**อย่าวางชามน้ำ/อาหารใกล้กระบะ** · บ้านหลายชั้นให้มีกระบะทุกชั้น\n' +
    '• **ความสะอาด:** ตักของเสียออก**อย่างน้อยวันละครั้ง** · ล้างกระบะทุก 1–4 สัปดาห์ ' +
    'ด้วย**สบู่กับน้ำร้อนเท่านั้น** เลี่ยงน้ำยาแรงและทุกอย่างที่มีแอมโมเนีย\n\n' +
    '🚫 **ห้ามลงโทษน้องที่ฉี่นอกกระบะเด็ดขาด** — เอกสารฉบับเดียวกันระบุว่าการลงโทษทำให้เกิด' +
    'ความก้าวร้าวจากความกลัว ทำลายความสัมพันธ์ และทำให้ไปฉี่ในที่ที่ซ่อนกว่าเดิมค่ะ';
// ═════════════════════════════════════════════════════════════════════════
// 2) ท้องผูก / ไม่ถ่าย
// ═════════════════════════════════════════════════════════════════════════
//
// Merck (หน้าเจ้าของแมว) — "Disorders of the Stomach and Intestines in Cats":
//   "Constipation is the infrequent or difficult passage of feces. The fecal
//    material is often dry and hard."
//   "Obstipation is severe constipation with a mass of dry, hard feces that does not pass."
//   "Some cats with longterm constipation or obstipation may develop megacolon,
//    an enlarged intestine caused by a defect in the muscle strength of the colon."
//   "Signs of constipation include straining to defecate and the passage of firm,
//    dry feces. Some animals are quite ill and also have lethargy, depression,
//    loss of appetite, vomiting, and abdominal discomfort."
//   "Be sure to only provide your cat with the laxative prescribed by your
//    veterinarian. Laxatives formulated for human use can be very dangerous for pets."
//
// ⚠️ ตำราไม่ได้บอกจำนวนวัน — ห้ามเติมเอง (ดูหมายเหตุหัวไฟล์)
// ⚠️ ห้ามแนะนำสวนทวาร/ยาระบายทุกชนิด แม้แต่ที่ขายตามร้าน
//    หน้าสัตวแพทย์ของ Merck ระบุว่า enema ที่มีฟอสเฟตห้ามใช้ในแมวเพราะอาจถึงชีวิต
const CONSTIPATION_ANSWER = 'ตำราสัตวแพทย์ Merck นิยาม **ท้องผูก** ว่าคือการถ่ายยากหรือถ่ายห่างกว่าปกติ และอุจจาระมักแห้งแข็งค่ะ ' +
    'ถ้าปล่อยไว้นานอาจกลายเป็น **obstipation** (อุจจาระแข็งอัดแน่นจนถ่ายไม่ออกเลย) ' +
    'และในระยะยาวอาจนำไปสู่ **ลำไส้ใหญ่โป่งพอง (megacolon)** ซึ่งรักษายากกว่ามาก\n\n' +
    '🩺 **สัญญาณที่ตำราระบุว่าควรให้สัตวแพทย์ตรวจ**\n' +
    '• **เบ่งถ่ายแล้วไม่ออก** หรือถ่ายเป็นก้อนแห้งแข็ง\n' +
    '• ซึม ไม่มีแรง\n' +
    '• เบื่ออาหาร ไม่กินข้าว\n' +
    '• **อาเจียนร่วมด้วย**\n' +
    '• ท่าทางไม่สบายท้อง / กดท้องแล้วเจ็บ\n\n' +
    '⚠️ **สิ่งที่ห้ามทำเองเด็ดขาด**\n' +
    'Merck เขียนไว้ตรง ๆ ว่า **ให้ใช้ยาระบายที่สัตวแพทย์สั่งเท่านั้น ยาระบายของคนอันตรายมากกับสัตว์เลี้ยง** ' +
    'และการสวนทวารเองก็ห้ามทำ เพราะน้ำยาสวนบางชนิดทำให้เกลือแร่ในเลือดผิดปกติจนถึงชีวิตได้ในแมวค่ะ\n\n' +
    '❓ **เรื่อง "กี่วันถึงผิดปกติ" — หนูตอบเป็นตัวเลขไม่ได้ค่ะ**\n' +
    'หนูตรวจตำรา Merck และ Cornell แล้ว **ไม่มีที่ไหนระบุจำนวนวันไว้** ' +
    'ตัวเลขที่เห็นตามเว็บทั่วไปไม่ได้มาจากตำรา หนูเลยไม่เอามาบอกค่ะ ' +
    'ให้ดูที่ **อาการร่วม** ข้างบนแทน — ถ้ามีข้อไหนตรง ให้พาไปตรวจได้เลยโดยไม่ต้องนับวัน\n\n' +
    '💡 จดไปให้หมอด้วย: ถ่ายครั้งสุดท้ายเมื่อไร · ลักษณะอุจจาระ · ยังกินน้ำ/อาหารปกติไหม · ' +
    'เพิ่งเปลี่ยนอาหารหรือเปล่า (บันทึกการขับถ่ายในแอปได้ค่ะ)';
// ═════════════════════════════════════════════════════════════════════════
// 3) ท้องเสีย / ถ่ายเหลว
// ═════════════════════════════════════════════════════════════════════════
//
// Cornell Riney Canine Health Center — "Diarrhea" (หน้าสุนัข):
//   "If a pet stops eating, is lethargic, the diarrhea is black or tarry in
//    quality, there is associated vomiting, or the diarrhea doesn't resolve in
//    48-72 hours then veterinary care should be sought."
//   "Never try human medications such as Pepto Bismol (bismuth subsalicylate) or
//    Imodium (loperamide) unless directed by a veterinarian, as they can be
//    harmful to certain dogs and may not pair well with other medications."
//
// Cornell Feline Health Center — "Diarrhea" (หน้าแมว):
//   "If the diarrhea persists for longer than a day or two and the cat is also
//    showing systemic signs, such as poor appetite, lethargy, or vomiting, you
//    should seek veterinary care as soon as possible."
//   "...it is most important for a veterinarian to examine an affected animal as
//    soon as the clinical signs are noticed, as some over the counter medications
//    can be harmful to cats."
//
// Merck (หน้าเจ้าของสุนัข) — "Disorders of the Stomach and Intestines in Dogs":
//   "Laxatives formulated for humans can be very dangerous for animals, especially cats."
//   "Some animals require additional short-term use of antidiarrheal medications
//    until inflammation is brought under control, but do not use these medications
//    unless recommended by a veterinarian."
//
// ⚠️ กรอบเวลา "หมา 48–72 ชม." กับ "แมว เกิน 1–2 วัน" มาจากคนละหน้า ห้ามยุบรวมเป็นตัวเลขเดียว
// ⚠️ **ห้ามเขียนว่า "ลูกสัตว์ขาดน้ำเร็วกว่าตัวโต"** — ตรวจแล้ว 1 ก.ย. 2569
//    ไม่มีหน้าไหนในแหล่งที่ดึงข้อมูลได้จริงระบุประโยคนี้ (Cornell บอกแค่ว่าลูกแมว
//    "เสี่ยงเป็นท้องเสียมากกว่า" ซึ่งคนละเรื่องกับการขาดน้ำเร็วกว่า)
const DIARRHEA_ANSWER = '🩺 **สัญญาณที่ Cornell ระบุว่าควรพาไปหาสัตวแพทย์**\n' +
    '• **ไม่ยอมกินข้าว**\n' +
    '• **ซึม ไม่มีแรง**\n' +
    '• อุจจาระ**สีดำหรือเหนียวเหมือนยางมะตอย** (สัญญาณของเลือดในทางเดินอาหารส่วนต้น)\n' +
    '• **อาเจียนร่วมด้วย**\n\n' +
    '⏱️ **เรื่องเวลา — หมากับแมวคนละเกณฑ์ ห้ามใช้ตัวเลขเดียวกัน**\n' +
    '• **สุนัข:** ถ้าท้องเสีย**ไม่ดีขึ้นภายใน 48–72 ชั่วโมง** ควรพาไปหาสัตวแพทย์\n' +
    '• **แมว:** ถ้าท้องเสีย**เกิน 1–2 วัน** และมีอาการทั่วร่างกายร่วม (เบื่ออาหาร ซึม อาเจียน) ' +
    'ควรพาไปให้เร็วที่สุด\n\n' +
    '⚠️ **ห้ามให้ยาแก้ท้องเสียของคนเองเด็ดขาด**\n' +
    'Cornell ระบุชื่อยาไว้ตรง ๆ ว่า **ห้ามลองใช้ยาของคนอย่าง Pepto Bismol หรือ Imodium ' +
    'เว้นแต่สัตวแพทย์สั่ง** เพราะเป็นอันตรายกับสุนัขบางตัวและอาจตีกับยาอื่น ' +
    'ฝั่งแมวก็ระบุว่า**ยาที่ซื้อเองได้บางตัวเป็นอันตรายกับแมว** ' +
    'และ Merck เขียนว่า**ยาระบายของคนอันตรายมากกับสัตว์ โดยเฉพาะแมว**ค่ะ\n\n' +
    '💡 จดไปให้หมอด้วย: เริ่มเมื่อไร · วันละกี่ครั้ง · ลักษณะและสีอุจจาระ · มีเลือด/เมือกไหม · ' +
    'ยังกินน้ำอยู่ไหม · เพิ่งเปลี่ยนอาหารหรือกินอะไรแปลก ๆ หรือเปล่า';
// ═════════════════════════════════════════════════════════════════════════
// 4) เชื้อรา (ringworm) — ที่คนถามมากสุดคือ "ติดคนได้ไหม"
// ═════════════════════════════════════════════════════════════════════════
//
// Merck (หน้าเจ้าของแมว) — "Ringworm (Dermatophytosis) in Cats":
//   "The fungi spread to people primarily by contact with infected cats and
//    contaminated objects, such as furniture or grooming tools."
//   "Broken hairs with associated spores are important sources for spread of the disease."
//   "Veterinarians diagnose ringworm by fungal culture, examination with an
//    ultraviolet lamp, and direct microscopic examination of hair or skin scale."
//   "Your veterinarian can provide you with information about any treatment that may
//    be appropriate for your pet and advise you regarding precautions you should take
//    to avoid ringworm infection in yourself and members of your family."
//
// Merck (หน้าเจ้าของสุนัข) — "Ringworm (Dermatophytosis) in Dogs":
//   "People can easily be infected with these fungi."
//   "Fungal culture of hairs and scrapings from the affected areas is the most accurate method."
//
// Cornell — "Zoonotic Disease: What Can I Catch from My Cat?":
//   "Ringworm is transmitted by contact with an infected animal's skin or fur,
//    either directly or from a contaminated environment."
//   "For more information about specific risks, diagnosis, and treatment of zoonotic
//    diseases, contact your physician/health professional."
//
// ⚠️ ประโยค "เด็ก/ผู้สูงอายุ/ภูมิคุ้มกันต่ำเสี่ยงกว่า" ของ Cornell อยู่ในบริบท
//    "โรคติดจากสัตว์สู่คนโดยรวม" **ไม่ได้เจาะจงว่าเชื้อรา** → เขียนต้องระบุให้ตรงตามนั้น ห้ามยำรวม
const RINGWORM_ANSWER = '**ติดคนได้ค่ะ** — ตำรา Merck ระบุว่าเชื้อราชนิดนี้แพร่สู่คนได้ โดยหลัก ๆ มาจาก' +
    '**การสัมผัสตัวสัตว์ที่ติดเชื้อ และสัมผัสของที่ปนเปื้อน เช่น เฟอร์นิเจอร์หรืออุปกรณ์แปรงขน** ' +
    'ฝั่งหน้าสุนัขเขียนสั้น ๆ ว่า "คนติดเชื้อราพวกนี้ได้ง่าย" ค่ะ\n\n' +
    '🧼 **จุดที่คนมักมองข้าม: สิ่งแวดล้อม**\n' +
    'Merck ระบุว่า**เส้นขนที่หักร่วงพร้อมสปอร์เป็นแหล่งแพร่เชื้อสำคัญ** ' +
    'เพราะฉะนั้นการเก็บขนร่วง ซัก/ทำความสะอาดที่นอน ผ้า และอุปกรณ์แปรงขน สำคัญพอ ๆ กับการรักษาตัวน้องค่ะ\n\n' +
    '🔬 **ดูด้วยตาแล้วสรุปเองไม่ได้ และหนูก็ฟันธงแทนไม่ได้**\n' +
    'Cornell ระบุว่าเชื้อรามีหน้าตา**คล้ายโรคผิวหนังอื่น** จึงต้องตรวจแยกออกจากกันก่อน ' +
    'และ Merck ระบุว่าสัตวแพทย์วินิจฉัยด้วยการ**เพาะเชื้อรา · ส่องไฟอัลตราไวโอเลต · ' +
    'ดูเส้นขน/สะเก็ดผิวใต้กล้องจุลทรรศน์** — ทั้งหมดนี้ทำผ่านแชตไม่ได้ค่ะ\n\n' +
    '👨‍⚕️ **ถ้าคนในบ้านขึ้นผื่น** Cornell แนะนำให้**ปรึกษาแพทย์ของคนโดยตรง** ' +
    'ส่วนวิธีป้องกันไม่ให้ติดคนในบ้าน ให้สัตวแพทย์ที่รักษาน้องอยู่เป็นคนแนะนำ ' +
    'เพราะเขาเห็นว่าน้องเป็นชนิดไหนและรุนแรงแค่ไหนค่ะ';
// ═════════════════════════════════════════════════════════════════════════
// 5) คัน / เกาบ่อย / ขนร่วง
// ═════════════════════════════════════════════════════════════════════════
//
// Merck (หน้าเจ้าของแมว) — "Itching (Pruritus) in Cats"
// Merck (หน้าเจ้าของสุนัข) — "Itching (Pruritus) in Dogs"  ← ประโยคเดียวกันเป๊ะทั้งสองหน้า:
//   "The most common causes of itching are parasites, infections, and allergies."
//   "Your veterinarian will perform a thorough skin history and physical examination."
// หน้าสุนัขเพิ่ม:
//   "Parasites, including mites and fleas, are the first possible cause your
//    veterinarian will seek to exclude."
//
// Merck (หน้าเจ้าของแมว) — "Fleas of Cats":
//   "Many cats are allergic to flea saliva."
//   "Fleas may not be visible on extremely allergic cats due to grooming."
//   ⚠️ ประโยค "อาจมองไม่เห็นหมัด" นี้ **ยืนยันได้เฉพาะหน้าแมว** หน้าสุนัขไม่มี → ต้องระบุว่าเป็นของแมว
//
// Merck (หน้าเจ้าของแมว) — "Hair Loss (Alopecia) in Cats":
//   "Hair loss is a sign, and its underlying cause must be determined in order to be treated."
//   "The most common cause is flea allergy dermatitis."   ← เฉพาะแมว
//   "An accurate diagnosis of the cause of hair loss requires a detailed history and
//    physical examination."
// Merck (หน้าเจ้าของสุนัข) — "Hair Loss (Alopecia) in Dogs":
//   "Hair loss is a sign and its underlying cause must be determined for the condition
//    to be successfully treated."
//   "An accurate diagnosis of the cause of hair loss requires a detailed history and
//    physical examination."
//   ⚠️ หน้าสุนัข **ไม่ได้ระบุ** ว่าสาเหตุที่พบบ่อยที่สุดคืออะไร → ห้ามยกของแมวมาใส่ให้สุนัข
//
// ⚠️ ตรวจแล้ว 1 ก.ย. 2569: **ไม่มี** หน้าไหนของ Merck ฝั่งเจ้าของสัตว์ที่ให้เกณฑ์
//    "คันแบบไหนถึงต้องไปหาหมอ" เป็นข้อ ๆ → ห้ามแต่งเกณฑ์เอง
// ⚠️ ห้ามเขียนเรื่องพิษเพอร์เมทริน (ยาหมัดหมาใช้กับแมวไม่ได้) ในไฟล์นี้
//    ค้นแล้วยังหาแหล่งชั้นดีที่ดึงข้อความได้จริงไม่เจอ — ยังไม่มีสิทธิ์พูด
const ITCH_ANSWER = 'อาการคันและขนร่วง **เป็น "อาการ" ไม่ใช่ "โรค"** ค่ะ Merck เขียนไว้ว่า ' +
    '**ขนร่วงเป็นสัญญาณที่ต้องหาสาเหตุที่แท้จริงให้เจอก่อน ถึงจะรักษาให้หายได้** ' +
    'หนูจึงฟันธงแทนไม่ได้ว่าน้องเป็นอะไร\n\n' +
    '🔍 **สาเหตุที่ตำราระบุว่าพบบ่อยที่สุด** (เหมือนกันทั้งหน้าหมาและหน้าแมว)\n' +
    '• **ปรสิต** (ไร เห็บ หมัด) — เป็นกลุ่มแรกที่สัตวแพทย์จะตรวจตัดออกก่อน\n' +
    '• **การติดเชื้อ**\n' +
    '• **ภูมิแพ้**\n' +
    'เฉพาะในแมว Merck ระบุเพิ่มว่าสาเหตุขนร่วงที่พบบ่อยที่สุดคือ **ผิวหนังอักเสบจากแพ้น้ำลายหมัด** ' +
    '(หน้าสุนัขไม่ได้ระบุว่าสาเหตุไหนพบบ่อยที่สุด หนูเลยไม่เอามาใช้กับหมาค่ะ)\n\n' +
    '🐈 **จุดสำคัญที่คนพลาดบ่อย — "ไม่เห็นหมัด" ไม่ได้แปลว่าไม่มีหมัด**\n' +
    'Merck หน้าแมวเขียนว่า **แมวหลายตัวแพ้น้ำลายหมัด** และ ' +
    '**ในแมวที่แพ้รุนแรงอาจมองไม่เห็นตัวหมัดเลย เพราะแมวเลียขนเก็บออกไปหมด** ' +
    'ฉะนั้นการที่หาหมัดไม่เจอ ยังตัดเรื่องหมัดออกไม่ได้ค่ะ\n\n' +
    '🩺 **ควรให้สัตวแพทย์ตรวจ** — ตำราระบุว่าการหาสาเหตุที่ถูกต้องต้องอาศัย ' +
    '**ประวัติผิวหนังอย่างละเอียด + การตรวจร่างกาย** ซึ่งทำผ่านแชตไม่ได้\n\n' +
    '💡 จดไปให้หมอด้วยจะช่วยมาก: เริ่มคันตั้งแต่เมื่อไร · คันตรงไหนบ้าง · ขนแหว่งเป็นหย่อมหรือทั่วตัว · ' +
    'มีตุ่ม/สะเก็ด/แผลไหม · ใช้ยาป้องกันเห็บหมัดตัวไหน ครั้งล่าสุดเมื่อไร · ' +
    'มีสัตว์ตัวอื่นหรือคนในบ้านคันด้วยไหม (ถ่ายรูปจุดที่เป็นเก็บไว้ในแอปได้ค่ะ)';
// ═════════════════════════════════════════════════════════════════════════
// 6) หู — ขี้หูเยอะ / ไรหู / สะบัดหัว
// ═════════════════════════════════════════════════════════════════════════
//
// Merck (หน้าเจ้าของแมว) — "Otitis Externa (External Ear Infection) in Cats":
//   "Signs include head shaking, odor, redness, swelling, scratching, increased
//    discharge, and scaly skin."
//   "Pets shouldn't be treated with home remedies like hydrogen peroxide or vinegar.
//    These can irritate inflamed canals and increase secretions, which promote the
//    development of bacterial or yeast infections. Only use ear products and cleaning
//    methods recommended by your veterinarian."
//
// Merck (หน้าเจ้าของแมว) — "Disorders of the Outer Ear in Cats":
//   "Mites affect the ears and skin, causing redness, hair loss, itching, and general
//    inflammation."
//   "Diagnosis is based on symptoms, exposure history, exam findings, and identifying
//    mites on scrapings of skin examined under the microscope."
//
// Cornell — "Ear Mites: Tiny Critters that can Pose a Major Threat":
//   "If ear mite infestation is suspected, the cat owner should seek veterinary care
//    without delay."
//
// ⚠️ กฎนี้ตั้ง species = 'cat' โดยตั้งใจ — ทุกหน้าที่ดึงข้อความจริงมาได้เป็นหน้าแมวทั้งหมด
//    ยังไม่ได้ตรวจหน้าสุนัข → ยังไม่มีสิทธิ์ตอบให้เจ้าของหมา (ค้างไว้เป็นช่องโหว่ที่รู้ตัว)
const EAR_ANSWER = 'เรื่องหู หนูบอกไม่ได้ว่าเป็นไรหูหรือหูอักเสบค่ะ — Merck ระบุว่าการวินิจฉัยไรหูต้องอาศัย ' +
    '**การขูดผิวไปส่องกล้องจุลทรรศน์เพื่อหาตัวไร** ร่วมกับประวัติและการตรวจร่างกาย ' +
    'ซึ่งทั้งสองภาวะมีอาการทับซ้อนกันมาก (แดง คัน ขนร่วง อักเสบ)\n\n' +
    '🩺 **สัญญาณที่ตำราระบุว่าเข้าได้กับหูชั้นนอกอักเสบ**\n' +
    '• **สะบัดหัวบ่อย**\n' +
    '• **มีกลิ่น**\n' +
    '• หูแดง บวม\n' +
    '• **เกาหูตลอด**\n' +
    '• **ขี้หู/สารคัดหลั่งมากขึ้น**\n' +
    '• ผิวในหูเป็นสะเก็ด\n' +
    'Cornell ระบุว่า **ถ้าสงสัยว่าเป็นไรหู เจ้าของควรพาไปหาสัตวแพทย์โดยไม่ชักช้า** ค่ะ\n\n' +
    '⚠️ **ห้ามหยอด/เช็ดหูด้วยของที่หาเองที่บ้านเด็ดขาด**\n' +
    'Merck เขียนตรง ๆ ว่า **ห้ามใช้ของอย่างไฮโดรเจนเปอร์ออกไซด์หรือน้ำส้มสายชู** ' +
    'เพราะระคายช่องหูที่อักเสบอยู่แล้ว ทำให้สารคัดหลั่งมากขึ้น และยิ่งเปิดทางให้แบคทีเรีย/ยีสต์เติบโต ' +
    '**ให้ใช้เฉพาะผลิตภัณฑ์และวิธีทำความสะอาดที่สัตวแพทย์แนะนำเท่านั้น**\n\n' +
    '💡 จดไปให้หมอด้วย: เป็นข้างเดียวหรือสองข้าง · ขี้หูสีอะไร · มีกลิ่นไหม · ' +
    'เริ่มเมื่อไร · เคยหยอดยาอะไรไปแล้วบ้าง';
exports.TRIAGE_RULES = [
    {
        id: 'appetite_loss',
        labelTh: 'แมวไม่กินอาหาร — ต้องดูเวลาและอาการร่วม',
        species: 'cat',
        patterns: [
            /(?:ลูก)?แมว.{0,24}ไม่(?:ยอม)?(?:กิน|ทาน)(?!น้ำ)(?:ข้าว|อาหาร)?/,
            /(?:น้อง|เจ้า).{0,24}ไม่(?:ยอม)?(?:กิน|ทาน)(?!น้ำ)(?:ข้าว|อาหาร)?/,
            /ไม่(?:ยอม)?(?:กิน|ทาน)(?!น้ำ)(?:ข้าว|อาหาร)?.{0,24}(?:ลูก)?แมว/,
            /แมว.{0,18}(?:เบื่ออาหาร|ไม่แตะ(?:ข้าว|อาหาร)|ไม่แตะอะไร)/,
            /(?:น้อง|เจ้า|แมว).{0,18}เบื่ออาหาร/,
        ],
        answerTh: 'แมวไม่กินอาหารมีได้หลายสาเหตุและบอกโรคจากแชตไม่ได้ค่ะ Cornell ระบุว่า **แมวที่ไม่กินควรได้รับการตรวจจากสัตวแพทย์** และความเสี่ยงขึ้นกับอายุและระยะเวลา\n\n' +
            '🚨 **ติดต่อสัตวแพทย์ทันที** ถ้าแมวโตไม่กินใกล้หรือเกิน 24 ชั่วโมง, ลูกแมวอายุต่ำกว่า 6 สัปดาห์ไม่กินถึง 12 ชั่วโมง, หรือมีซึม อาเจียน ท้องเสีย หายใจผิดปกติร่วมด้วย\n\n' +
            'จดมื้อสุดท้ายที่กิน อายุ น้ำที่ดื่ม และอาการร่วมไว้ให้หมอค่ะ ห้ามกรอกอาหารหรือยาเองถ้าน้องอ่อนแรงหรือกลืนผิดปกติ',
        sourceUrl: CORNELL_ANOREXIA,
        verifiedAt: '2026-09-02',
    },
    {
        id: 'dog_appetite_loss',
        labelTh: 'สุนัขไม่กินอาหาร — ต้องดูเวลาและอาการร่วม',
        species: 'dog',
        patterns: [
            /(?:หมา|สุนัข).{0,24}ไม่(?:ยอม)?(?:กิน|ทาน)(?:ข้าว|อาหาร)?/,
            /(?:หมา|สุนัข|น้อง).{0,18}เบื่ออาหาร/,
        ],
        answerTh: 'สุนัขไม่กินอาหารมีได้หลายสาเหตุและบอกโรคจากแชตไม่ได้ค่ะ จดมื้อสุดท้าย ปริมาณที่กิน น้ำที่ดื่ม ระยะเวลาที่เป็น และอาการร่วม แล้วติดต่อสัตวแพทย์เพื่อประเมิน หากไม่กินต่อเนื่อง ซึม อาเจียน ท้องเสีย เจ็บ หรือมีโรคประจำตัว ไม่ควรรอดูเองนานค่ะ',
        sourceUrl: 'https://www.merckvetmanual.com/dog-owners/digestive-disorders-of-dogs/disorders-of-the-stomach-and-intestines-in-dogs',
        verifiedAt: '2026-09-14',
    },
    {
        id: 'chronic_mobility_loss',
        labelTh: 'เดินไม่ได้หรือขาอ่อนแรงมาระยะหนึ่ง',
        species: 'both',
        patterns: [
            /(?:เดิน|ยืน|ลุก).{0,5}ไม่ได้.{0,14}(?:มาพักนึง|มาสักพัก|มานาน|หลายเดือน|หลายปี|เรื้อรัง|ค่อย ?ๆ)/,
            /(?:มาพักนึง|มาสักพัก|มานาน|หลายเดือน|หลายปี|เรื้อรัง|ค่อย ?ๆ).{0,18}(?:เดิน|ยืน|ลุก).{0,5}ไม่ได้/,
        ],
        answerTh: 'อาการเดินไม่ได้หรือขาอ่อนแรง แม้เป็นมาระยะหนึ่งก็ **ต้องนัดสัตวแพทย์ตรวจโดยเร็ว** ค่ะ เพราะต้องตรวจระบบประสาทและแยกโรคกระดูกสันหลังหลายสาเหตุ หนูวินิจฉัยจากข้อความไม่ได้\n\n' +
            'ระหว่างรอตรวจ ให้ลดการกระโดดและการลื่น ขยับคอ/หลังให้น้อยและนุ่มนวล อย่านวดหรือให้ยาเพิ่มจากคำแนะนำในอินเทอร์เน็ตโดยไม่ถามหมอ\n\n' +
            '🚨 ถ้าเพิ่งทรุดกะทันหัน เจ็บร้อง ขยับขาไม่ได้มากขึ้น กลั้นปัสสาวะไม่ได้ หายใจผิดปกติ หรือล้ม ให้ไปโรงพยาบาลสัตว์ทันที',
        sourceUrl: M_SPINAL_DOG,
        extraSources: [ACVS_IVDD],
        verifiedAt: '2026-09-02',
    },
    {
        id: 'dark_stool',
        labelTh: 'อุจจาระสีดำหรือคล้ำผิดปกติ',
        species: 'both',
        patterns: [
            /(อึ|ขี้(?!หู)|อุจจาระ|ถ่าย).{0,10}(ดำ|สีดำ|ดำคล้ำ|ดำเหมือน|เหมือนยางมะตอย)/,
        ],
        answerTh: 'อุจจาระสีดำหรือเหนียวคล้ายยางมะตอยอาจเป็นสัญญาณเลือดออกในทางเดินอาหารค่ะ หนูบอกสาเหตุจากแชตไม่ได้ ให้ถ่ายรูปและจดเวลา/จำนวนครั้ง/อาหารหรือยาที่ได้รับ แล้วติดต่อสัตวแพทย์เพื่อประเมินโดยเร็ว\n\n' +
            '🚨 ถ้ามีซึม อ่อนแรง เหงือกซีด อาเจียน ไม่กินอาหาร หรือถ่ายดำซ้ำ ให้ไปโรงพยาบาลสัตว์ทันที และอย่าให้ยาแก้ปวดหรือยาแก้ท้องเสียของคนเองค่ะ',
        sourceUrl: CORNELL_DIA_DOG,
        extraSources: [CORNELL_DIA_CAT, M_GI_CAT, M_GI_DOG],
        verifiedAt: V,
    },
    {
        // ⚠️ ต้องอยู่ก่อน constipation — คำถามจริงหลายข้อมีทั้ง "ท้องเสีย" และ "ท้องผูก" ในประโยคเดียว
        //    (เช่น "ลูกแมวท้องเสียและท้องผูก ต้องดูแลยังไง") ให้ฝั่งท้องเสียชนะเพราะเสี่ยงขาดน้ำเร็วกว่า
        id: 'diarrhea',
        labelTh: 'ท้องเสีย / ถ่ายเหลว',
        species: 'both',
        patterns: [
            /ท้องเสีย|ท้องร่วง/,
            /(ถ่าย|อึ|ขี้|อุจจาระ).{0,6}(เหลว|เป็นน้ำ|ไม่เป็นก้อน)/,
            /(อุจจาระ|อึ|ขี้).{0,8}(นิ่ม|เละ)/,
        ],
        answerTh: DIARRHEA_ANSWER,
        sourceUrl: CORNELL_DIA_DOG,
        extraSources: [CORNELL_DIA_CAT, M_GI_DOG],
        verifiedAt: V,
    },
    {
        id: 'litterbox',
        labelTh: 'ฉี่นอกกระบะ / ไม่เข้ากระบะ',
        species: 'cat',
        patterns: [
            // ⚠️ ต้องมีทั้ง "ฉี่/อึ" และคำบอกว่า "ไม่เป็นที่" — ห้ามจับคำว่า "ฉี่" ลอย ๆ
            //    ไม่งั้นจะไปทับ activity:pee (ถามบันทึกในแอป) และ emergency:urinary_block
            /(ฉี่|ปัสสาวะ|เยี่ยว|อึ|ขี้|ขับถ่าย).{0,10}(นอกกระบะ|ไม่เป็นที่|ไม่ลงกระบะ|ข้างนอกกระบะ|ข้างกระบะ|ใส่ผ้าห่ม)/,
            /(ไม่ยอม|ไม่ค่อย|ไม่)\s?(เข้า|ใช้|ลง)กระบะ/,
            /(ฉี่|ปัสสาวะ|เยี่ยว|อึ|ขี้).{0,14}(บนที่นอน|บนเตียง|บนผ้า|บนโซฟา|บนพรม|นอกกระบะ)/,
            /(ฉี่|อึ|ขับถ่าย).{0,10}(ไม่เป็นที่|เลอะบ้าน|ทั่วบ้าน)/,
            /(แมว|น้อง).{0,12}(เลอะบ้าน|ปล่อยของเสียข้างนอก)/,
            /(นอกกระบะทราย|ฉี่นอกกระบะ)/,
            // ⚠️ ต้องมีคำนี้ ไม่งั้น "แมวไม่ยอมอึในกระบะทราย" จะไปโดนกฎท้องผูกจับ
            //    (กฎท้องผูกมี /(ไม่ยอม)\s?(อึ)/ อยู่) — กฎกระบะต้องอยู่ **ก่อน** ท้องผูกในอาร์เรย์เสมอ
            /(ไม่ยอม|ไม่ค่อย|ไม่).{0,8}(อึ|ฉี่|ขี้|ถ่าย|ปัสสาวะ|ขับถ่าย).{0,10}กระบะ/,
            /(เข้ากระบะ).{0,10}(ไม่ยอมใช้|ไม่ใช้)/,
            // จำนวนกระบะในบ้านที่เลี้ยงหลายตัว — ตอบด้วยเกณฑ์ FelineVMA ในคำตอบเดียวกัน
            /(กระบะ(ทราย)?).{0,10}(กี่อัน|กี่ใบ|กี่ที่|กี่กระบะ|จำนวน)/,
            /(กระบะ(ทราย)?).{0,12}(เท่าไห?ร่|เท่าไร)/,
            /(กี่|จำนวน).{0,6}กระบะ/,
        ],
        answerTh: LITTERBOX_ANSWER,
        sourceUrl: CORNELL_FLUTD,
        extraSources: [M_URO_CAT],
        verifiedAt: V,
    },
    {
        id: 'constipation',
        labelTh: 'ท้องผูก / ถ่ายไม่ออก',
        species: 'both',
        patterns: [
            /ท้องผูก/,
            // ⚠️ "ไม่ถ่าย" ต้องติดกับคำที่ยืนยันว่าเป็นการขับถ่าย ไม่ใช่ "ไม่ถ่ายรูป"
            /(ไม่|ยังไม่|ไม่ค่อย|ไม่ยอม)\s?(อึ|ขี้|ถ่ายหนัก|ขับถ่าย)/,
            /(อึ|ขี้|อุจจาระ|ถ่าย)\s?ไม่ออก/,
            /เบ่ง\s?(อึ|ขี้|อุจจาระ|ถ่าย)/,
            /(เข้า|นั่ง).{0,12}กระบะ.{0,12}(ไม่มี|ไม่เจอ).{0,6}(อึ|ขี้|ถ่าย)/,
            /(อึ|ขี้|อุจจาระ|ถ่าย).{0,12}(แข็ง|แห้ง).{0,12}(เบ่ง|ไม่ออก)/,
            /(อึ|ขี้).{0,8}ค้าง/,
            /(ไม่ถ่าย)(มา|เลย|หลายวัน|กี่วัน|สองวัน|\s|$)/,
        ],
        answerTh: CONSTIPATION_ANSWER,
        sourceUrl: M_GI_CAT,
        extraSources: [M_GI_DOG],
        verifiedAt: V,
    },
    {
        // ใช้คำตอบชุดเดียวกับ redflags.ts (import มา ไม่ก๊อป) — ต่างกันแค่ "รูปประโยคที่รับ"
        //   redflags: "อ้วกแบบไหนถึงต้องพาไปหาหมอ"  (ต้องครบ 3 ชั้น)
        //   triage  : "หมาอ้วก เกิดจากอะไร"           (ถามลอย ๆ)
        // ⚠️ ต้องอยู่ **หลัง** ท้องเสีย/ท้องผูก เพราะคำถามที่มีทั้งสองอย่าง
        //    (เช่น "ท้องเสีย ถ่ายเหลว อาเจียน") ควรได้คำตอบฝั่งท้องเสียซึ่งตรงกว่า
        id: 'vomiting',
        labelTh: 'อาเจียนแบบไหนควรพาไปหาสัตวแพทย์',
        species: 'both',
        patterns: [/(อ้วก|อาเจียน|ขย้อน|สำรอก)/],
        answerTh: redflags_1.VOMIT_ANSWER,
        sourceUrl: 'https://www.merckvetmanual.com/dog-owners/digestive-disorders-of-dogs/vomiting-in-dogs',
        extraSources: [
            'https://www.merckvetmanual.com/cat-owners/digestive-disorders-of-cats/vomiting-in-cats',
        ],
        verifiedAt: V,
    },
    {
        id: 'ringworm',
        labelTh: 'เชื้อรา (ringworm) และการติดสู่คน',
        species: 'both',
        patterns: [
            /เชื้อรา/,
            /ringworm|dermatophyt/,
            /(กลาก|เกลื้อน)/,
        ],
        answerTh: RINGWORM_ANSWER,
        sourceUrl: M_RINGWORM_CAT,
        extraSources: [M_RINGWORM_DOG, CORNELL_ZOONOTIC],
        verifiedAt: V,
    },
    {
        id: 'itch_hairloss',
        labelTh: 'คัน / เกาบ่อย / ขนร่วง',
        species: 'both',
        patterns: [
            /ขนร่วง|ขนแหว่ง|ขนบาง|หัวล้าน/,
            /เป็นขุย|ขุย\s*ๆ|ผิวลอก|ผิวหนังลอก|เป็นสะเก็ด/,
            // ⚠️ ห้ามใช้ /คัน/ ลอย ๆ — "คัน" เป็นลักษณนามของรถ ("รถคันไหน", "คันนี้")
            /คันมาก|คันตลอด|คันจน|อาการคัน|คันทั้งตัว|คันผิวหนัง|คันยุบยิบ/,
            /เกา(บ่อย|ตลอด|ทั้งวัน|จน|ไม่หยุด|แรง|เยอะ)/,
            /(เลีย|แทะ|กัด)(ตัวเอง|ขน).{0,10}(บ่อย|ตลอด|จน|ไม่หยุด)/,
            /เลียขนบ่อย|เลียจนขน/,
            /โรคผิวหนัง|ผิวหนังอักเสบ/,
        ],
        answerTh: ITCH_ANSWER,
        sourceUrl: M_ITCH_CAT,
        extraSources: [M_ITCH_DOG, M_FLEAS_CAT, M_ALOPECIA_CAT, M_ALOPECIA_DOG],
        verifiedAt: V,
    },
    {
        // ⚠️ species = 'cat' โดยตั้งใจ — แหล่งอ้างอิงที่ดึงข้อความจริงมาได้เป็นหน้าแมวล้วน
        //    ยังไม่ได้ตรวจหน้าสุนัข → เจ้าของหมาถามจะตกไป handoff ซึ่งถูกแล้วตามกฎ "ไม่รู้ = ไม่เดา"
        id: 'ear',
        labelTh: 'ขี้หูเยอะ / ไรหู / สะบัดหัว',
        species: 'cat',
        patterns: [
            // ⚠️ ห้ามใช้ /หู/ ลอย ๆ — ต้องผูกกับคำข้างเคียงเสมอ
            /ไรหู|ขี้หู|หูอักเสบ|หูแดง|หูมีกลิ่น|หูเหม็น|หู.{0,8}คราบดำ|คราบดำ.{0,8}หู|เกาหู|แคะหู|เช็ดหู|หยอดหู|ในหู|ช่องหู/,
            /(สะบัด|เขย่า|ส่าย)หัว/,
        ],
        answerTh: EAR_ANSWER,
        sourceUrl: M_OTITIS_CAT,
        extraSources: [M_OUTER_EAR_CAT, CORNELL_EARMITE],
        verifiedAt: V,
    },
];
/**
 * จับคำถามอาการแบบกว้าง
 *
 * ⚠️ ต้องเรียก **หลัง** matchEmergency · matchGuard · matchRedFlag เสมอ
 *    เพราะคนที่กำลังเจอเหตุจริงต้องได้คำเตือนฉุกเฉินก่อน
 *    และคำถามที่อยู่นอกขอบเขต (วินิจฉัย/ขนาดยา) ต้องโดนกำแพงกันก่อน
 *
 * @param species ชนิดสัตว์ของน้องที่เลือกอยู่ — ใช้กรองกฎที่เฉพาะกับแมว/หมา
 */
function matchTriage(text, species) {
    const q = String(text || '').toLowerCase();
    if (!q)
        return null;
    for (const rule of exports.TRIAGE_RULES) {
        // กฎเฉพาะสายพันธุ์ — ถ้ารู้ว่าเป็นคนละชนิด ให้ข้าม
        // (ถ้าไม่รู้ชนิด = ยังตอบ เพราะคำถามอาจไม่ได้ผูกกับน้องที่เลือกอยู่)
        if (rule.species !== 'both' && species && species !== rule.species)
            continue;
        for (const p of rule.patterns) {
            if (p.test(q)) {
                return { rule, sources: [rule.sourceUrl, ...(rule.extraSources || [])] };
            }
        }
    }
    return null;
}
/** ท้ายข้อความทุกอัน — ถ้อยคำเดียวกับฝั่ง red flags */
exports.TRIAGE_FOOTER = '\n\n— ข้อมูลนี้เป็นเกณฑ์เบื้องต้นจากตำราสัตวแพทย์ ไม่ใช่การวินิจฉัย และไม่แทนการตรวจโดยสัตวแพทย์ค่ะ';

},
"behavior":function(require,module,exports){
"use strict";
// lib/smartBot/behavior.ts
// ─────────────────────────────────────────────────────────────────────────
// "พฤติกรรมกวนใจ" — กลุ่มคำถามที่ค้างมากที่สุดรองจากสุขภาพ
// (16 ข้อจาก 250 · ดู docs/SmartBot-Training-Round2-2569-09-01.md)
//
// ⚠️ กฎเหล็กของไฟล์นี้
//   1. ทุกกฎต้องมี sourceUrl + verifiedAt และต้องมี "ข้อความต้นฉบับภาษาอังกฤษ"
//      กำกับไว้ในคอมเมนต์เหนือคำตอบ — ห้ามเขียนจากความจำ
//   2. ห้ามวินิจฉัย ห้ามระบุขนาดยา ห้ามบอกว่า "ไม่ต้องไปหาหมอ"
//   3. **ประตูความปลอดภัยของไฟล์นี้คือ "ตัดสาเหตุทางกายออกก่อน"** —
//      ตำรา Merck ระบุตรง ๆ ว่าความเจ็บปวดเป็นปัจจัยเสี่ยงสำคัญของปัญหาพฤติกรรม
//      ทุกคำตอบในไฟล์นี้จึงต้องมีบรรทัด "ถ้าเพิ่งเปลี่ยนไปกะทันหัน ให้หมอตรวจก่อน"
//
// ⚠️ สิ่งที่ **หาไม่เจอ** ตอนตรวจ 1 ก.ย. 2569 — ห้ามเติมเอาเอง
//   • "ต้องมีเสาลับเล็บกี่ต้น สูงกี่เซนติเมตร วางตรงไหน" — ตัวเลขที่เห็นตามเว็บ
//     มาจาก AAFP/ISFM Environmental Needs Guidelines 2013 ซึ่งเป็น PDF ที่
//     **เปิดอ่านอัตโนมัติไม่ได้** (ไฟล์เป็นภาพ) → ห้ามใส่ตัวเลขจนกว่าจะมีคนเปิดอ่านเอง
//   • "ห้ามใช้มือเล่นกับแมวเหมือนของเล่น" — เป็นคำแนะนำที่เจอทั่วไป แต่
//     **ไม่เจอเป็นประโยคจริง** ในหน้าที่เปิดอ่านได้ → ไม่ใส่
//   • "ย้ายบ้านแล้วแมวใช้เวลาปรับตัวกี่วัน" — **ไม่มีแหล่งไหนระบุจำนวนวัน**
//     → ห้ามตอบเป็นตัวเลขเด็ดขาด
// ─────────────────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.BEHAVIOR_FOOTER = exports.BEHAVIOR_RULES = void 0;
exports.matchBehavior = matchBehavior;
const C_BARK = 'https://www.vet.cornell.edu/departments-centers-and-institutes/riney-canine-health-center/canine-health-topics/excessive-barking';
const M_DOG_OWNER = 'https://www.merckvetmanual.com/dog-owners/behavior-of-dogs/behavior-problems-in-dogs';
const M_DOG_PRO = 'https://www.merckvetmanual.com/behavior/behavior-of-dogs/behavior-problems-of-dogs';
const M_CAT_OWNER = 'https://www.merckvetmanual.com/cat-owners/behavior-of-cats/behavior-problems-in-cats';
const M_CAT_PRO = 'https://www.merckvetmanual.com/behavior/behavior-of-cats/behavior-problems-of-cats';
const M_CAT_TREAT = 'https://www.merckvetmanual.com/cat-owners/behavior-of-cats/treatment-of-behavior-problems-in-cats';
const AAFP_DECLAW = 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11128892/';
const CATVETS_CLAW = 'https://catvets.com/resource/claw-friendly-toolkit-faq/';
const V = '2026-09-01';
// ─────────────────────────────────────────────────────────────────────────
// [C-BARK] Cornell Riney Canine Health Center — Excessive barking
//   "Attention seeking or demand barks — If you've heard this bark, your dog
//    really does seem to demand that you give them a treat."
//   "Territorial — This type of barking is motivated by the perceived need to
//    protect space."
//   "Boredom — If there's nothing else to do, why not bark? Barking due to
//    boredom is particularly common in high-energy dogs."
//   "You can also work with a veterinary behaviorist to further address barking
//    caused by fear or aggression."
// [M-DOG-OWNER] Merck (Dog Owners) — Behavior Problems in Dogs
//   "It causes intense anxiety and may lead the dog to bark, pace, or eliminate
//    inside the house."  (separation anxiety)
//   "An example of this would be a puppy that barks to get attention when it is
//    not being actively played with."
//   "Senility, which is also called cognitive dysfunction, is similar in some ways
//    to Alzheimer's disease in people. Signs include a decrease in social
//    interaction, loss of housetraining, disorientation (getting lost in familiar
//    surroundings), and changes in sleep patterns."
// [M-DOG-PRO] Merck — Behavior Problems of Dogs
//   "Pain, in particular, is an important risk factor for behavior problems."
//   "It is essential to rule out possible medical causes or factors contributing
//    to the behavior problem."
//   "Positive punishment should be avoided, because it can cause fear and anxiety
//    toward the owner or fear of the situation and surrounding triggers."
// ─────────────────────────────────────────────────────────────────────────
const BARKING_ANSWER = 'ศูนย์สุขภาพสุนัข Cornell แบ่ง "เสียงเห่า" ออกตาม **แรงจูงใจ** ค่ะ — แก้ให้ตรงเหตุถึงจะได้ผล\n\n' +
    '🔎 **เห่าเพราะอะไรได้บ้าง**\n' +
    '• **เรียกร้องความสนใจ** — เห่าเพื่อ "ทวง" ให้เราสนใจหรือให้ขนม ' +
    '(Merck ยกตัวอย่างลูกหมาที่เห่าเรียกความสนใจตอนไม่มีใครเล่นด้วย)\n' +
    '• **หวงพื้นที่** — Cornell ระบุว่าเป็นการเห่าที่มาจาก "ความรู้สึกว่าต้องปกป้องอาณาเขต" ' +
    'มักมีสิ่งกระตุ้นชัดเจน เช่น คนเดินผ่านหน้าบ้าน เสียงนอกรั้ว\n' +
    '• **เบื่อ** — Cornell บอกตรง ๆ ว่า "ถ้าไม่มีอะไรทำ ก็เห่าสิ" และพบบ่อยเป็นพิเศษใน**หมาที่พลังงานเยอะ**\n' +
    '• **กังวลตอนอยู่ตัวเดียว** — Merck ระบุว่าภาวะวิตกกังวลเมื่อถูกทิ้งไว้ลำพัง ' +
    'ทำให้หมา **เห่า เดินวนไปมา หรือขับถ่ายในบ้าน**\n\n' +
    '🩺 **ตรวจร่างกายก่อนเสมอ ถ้าเพิ่งเป็น** — Merck ระบุว่า **"ความเจ็บปวดเป็นปัจจัยเสี่ยงสำคัญของปัญหาพฤติกรรม"** ' +
    'และ **"จำเป็นอย่างยิ่งที่จะต้องตัดสาเหตุทางการแพทย์ออกไปก่อน"**\n' +
    '👴 ถ้าเป็น **หมาสูงวัยที่เพิ่งมาร้องตอนกลางคืน** ยิ่งควรให้หมอตรวจค่ะ — Merck ระบุว่าภาวะสมองเสื่อมในสุนัข ' +
    'มีสัญญาณคือ **เข้าสังคมน้อยลง ลืมที่ขับถ่าย สับสนหลงทางในที่คุ้นเคย และรูปแบบการนอนเปลี่ยนไป**\n\n' +
    '🚫 **สิ่งที่ไม่ควรทำ** — Merck ระบุว่า **ควรเลี่ยงการลงโทษ เพราะทำให้เกิดความกลัวและความวิตกกังวลต่อเจ้าของ** ' +
    'และเกือบทุกกรณี **การลงโทษทางร่างกาย รวมถึงปลอกคอหนามและปลอกคอช็อตไฟฟ้า ทำให้หมาที่ก้าวร้าวอยู่แล้วแย่ลง**\n\n' +
    '👩‍⚕️ ถ้าลองแล้วยังไม่ดีขึ้น Cornell แนะนำให้ **ทำงานร่วมกับสัตวแพทย์ผู้เชี่ยวชาญด้านพฤติกรรม** โดยเฉพาะเมื่อเห่าจากความกลัวหรือความก้าวร้าวค่ะ';
// ─────────────────────────────────────────────────────────────────────────
// [AAFP-DECLAW] AAFP Position Statement: Declawing
//   "scratching is a normal feline behavior; it is both inherited and learned."
//   "The primary reason for scratching is to maintain the necessary claw motion
//    used in hunting and climbing."
//   "The American Association of Feline Practitioners (AAFP) strongly opposes
//    declawing (onychectomy) as an elective procedure."
//   "Onychectomy is not a medically necessary procedure for the cat in most instances."
// [CATVETS-CLAW] catvets.com — Claw Friendly Toolkit FAQ
//   "Cats need to scratch to maintain the necessary claw motion used in hunting and
//    climbing, remove the old nail, stretch their body, and as a means of visual and
//    olfactory, or scent, communication."
// [M-CAT-PRO] Merck — Behavior Problems of Cats
//   "Destruction from scratching is a common cat owner complaint, because cats have a
//    physical and behavioral need to scratch surfaces. Meeting the cat's needs to
//    scratch is often sufficient to prevent destructive scratching. Ideally, this
//    behavior should be supported by providing scratching posts or surfaces that match
//    the cat's preferred material, shape, and size, and placing them in locations that
//    the cat finds appealing."
// [M-CAT-TREAT] Merck (Cat Owners) — Treatment of Behavior Problems in Cats
//   "studies have shown that punishment and confrontational training techniques are
//    more likely to lead to fear, avoidance, and increased aggression."
//
// ⚠️ ห้ามใส่ตัวเลข "เสากี่ต้น สูงกี่นิ้ว" — ดูหมายเหตุหัวไฟล์
// ─────────────────────────────────────────────────────────────────────────
const SCRATCHING_ANSWER = 'ข่าวดีคือ **น้องไม่ได้ดื้อค่ะ** — สมาคมสัตวแพทย์แมวอเมริกัน (AAFP) ระบุว่า ' +
    '**"การข่วนเป็นพฤติกรรมปกติของแมว เป็นทั้งสัญชาตญาณและการเรียนรู้"**\n\n' +
    '🐾 **แมวข่วนไปทำไม** — catvets.com ระบุ 4 เหตุผล: ' +
    '**รักษาการทำงานของเล็บที่ใช้ล่าและปีน · ลอกเล็บชั้นเก่าออก · ยืดเส้นยืดสาย · และใช้เป็นการสื่อสารทั้งด้วยภาพและด้วยกลิ่น**\n\n' +
    '✅ **วิธีที่ตำราแนะนำ (ไม่ต้องดุเลยค่ะ)** — Merck ระบุว่า ' +
    '**"การตอบสนองความต้องการข่วนของแมว มักเพียงพอที่จะป้องกันการข่วนทำลายข้าวของ"** ' +
    'โดยให้จัด **ที่ลับเล็บที่ตรงกับวัสดุ รูปทรง และขนาดที่แมวชอบ แล้ววางไว้ในจุดที่แมวรู้สึกน่าใช้**\n' +
    '💡 แปลเป็นภาษาบ้าน ๆ: ถ้าน้องข่วนโซฟา ให้เอาที่ลับเล็บไปตั้ง **ตรงโซฟานั่นแหละ** ' +
    'และลองหลายแบบ (ตั้งพื้น/แนวตั้ง/พาดแนวนอน · เชือกป่าน/กระดาษลัง/พรม) ดูว่าน้องเลือกอันไหน\n\n' +
    '🚫 **อย่าดุ — และเจ้าของก็คิดถูกแล้วที่ไม่อยากดุค่ะ** ' +
    'Merck ระบุว่า **"มีการศึกษาพบว่าการลงโทษและการฝึกแบบเผชิญหน้า มีแนวโน้มทำให้เกิดความกลัว การหลบหนี และความก้าวร้าวมากขึ้น"**\n\n' +
    '✂️ **เรื่องผ่าตัดถอดเล็บ (declaw)** — AAFP **"คัดค้านอย่างชัดเจน"** ต่อการผ่าตัดถอดเล็บแมวเพื่อความสะดวก ' +
    'และระบุว่าโดยส่วนใหญ่ **ไม่ใช่หัตถการที่จำเป็นทางการแพทย์สำหรับแมว**\n\n' +
    '🩺 ถ้าน้อง **เพิ่งเริ่มข่วนหนักขึ้นกะทันหัน** หรือข่วนตัวเองด้วย ควรให้สัตวแพทย์ตรวจก่อนค่ะ — อาจไม่ใช่เรื่องพฤติกรรมล้วน ๆ';
// ─────────────────────────────────────────────────────────────────────────
// [M-CAT-OWNER] Merck (Cat Owners) — Behavior Problems in Cats
//   "Pain aggression is a defensive reaction that occurs when a cat is in pain...
//    Certain illnesses and diseases can also lead to aggression. This is why
//    veterinarians rule out medical causes of aggression."
//   "If you notice behavioral changes in your older cat, schedule an appointment with
//    your veterinarian, who will rule out medical conditions and develop an appropriate
//    treatment plan."
//   "Punishment should be avoided, because it can cause your cat to become scared of
//    you and, at best, will stop the undesirable behavior only when you are present."
// [M-CAT-PRO] Merck — Behavior Problems of Cats
//   "Misdirected play or predation aggression: In cats, play is a normal ritualized
//    aggressive behavior that can persist into adulthood as a result of genetics and
//    learning."
//   "Fear-related aggression: Some cats display aggression to increase distance from
//    people."
// ─────────────────────────────────────────────────────────────────────────
const AGGRESSION_ANSWER = '🩺 **เรื่องแรกสุด และสำคัญที่สุด: ให้หมอตรวจตัดสาเหตุทางกายออกก่อนค่ะ**\n' +
    'Merck ระบุว่า **"ความก้าวร้าวจากความเจ็บปวด คือปฏิกิริยาป้องกันตัวที่เกิดขึ้นเมื่อแมวเจ็บ ... ' +
    'และโรคบางอย่างก็ทำให้ก้าวร้าวได้ นี่คือเหตุผลที่สัตวแพทย์ต้องตัดสาเหตุทางการแพทย์ออกไปก่อน"**\n' +
    'ถ้าน้อง **เพิ่งเปลี่ยนไปกะทันหัน** จากเดิมไม่เคยดุ — ข้อนี้ยิ่งสำคัญค่ะ ' +
    'และถ้าเป็น **แมวสูงวัย** Merck แนะนำให้ **นัดสัตวแพทย์เมื่อสังเกตเห็นพฤติกรรมเปลี่ยน**\n\n' +
    '🔎 **ความก้าวร้าวในแมวไม่ได้มีแบบเดียว** — Merck แยกไว้อย่างน้อยสองแบบที่พบบ่อย\n' +
    '• **จากการเล่นที่เล็งผิดเป้า** — ในแมว "การเล่นคือพฤติกรรมก้าวร้าวตามธรรมชาติในรูปแบบพิธีกรรม ' +
    'ซึ่งอาจติดตัวมาจนโตได้" มักเป็นการพุ่งงับ ไล่ ตะครุบ แล้วปล่อย\n' +
    '• **จากความกลัว** — "แมวบางตัวแสดงความก้าวร้าวเพื่อเพิ่มระยะห่างจากคน" — ' +
    'นี่คือแมวที่กำลังบอกว่า "อย่าเข้ามา" ไม่ใช่แมวนิสัยไม่ดี\n' +
    '  Merck ยังระบุว่าแมวที่กัดตอนถูกลูบ **อาจไม่ชอบการสัมผัส** และบางตัวกัดเพื่อกันไม่ให้คนแตะ ' +
    'ตอนกำลังพัก นอน หรือกินอยู่\n\n' +
    '🚫 **ห้ามลงโทษ** — Merck ระบุว่า **"ควรเลี่ยงการลงโทษ เพราะทำให้แมวกลัวเรา ' +
    'และอย่างดีที่สุดก็แค่หยุดพฤติกรรมนั้นเฉพาะตอนที่เราอยู่ตรงนั้น"**\n\n' +
    '⚠️ ถ้ามีคนในบ้านถูกกัดจนเป็นแผล ให้ล้างแผลและ **ไปพบแพทย์ (ของคน)** ด้วยนะคะ — แผลแมวกัดติดเชื้อง่ายค่ะ';
// ─────────────────────────────────────────────────────────────────────────
// [M-CAT-OWNER] Merck (Cat Owners) — Behavior Problems in Cats
//   "Cats may fear unfamiliar people, unfamiliar cats, dogs, noises, or places and
//    situations such as car rides, veterinary visits, and unfamiliar environments."
//   "Fearful cats should be kept away from anything that causes their fear, at least in
//    the short term...This generally involves housing the cat in its own room with
//    litter, toys, bedding, and food."
//   "Punishment should be avoided, because it can cause your cat to become scared of
//    you and, at best, will stop the undesirable behavior only when you are present."
//
// ⚠️ ห้ามตอบว่า "ใช้เวลา X วันก็ปรับตัวได้" — ตรวจแล้วไม่มีแหล่งไหนระบุจำนวนวัน
// ─────────────────────────────────────────────────────────────────────────
const HIDING_ANSWER = 'เป็นเรื่องที่อธิบายได้ค่ะ — Merck ระบุว่าแมวอาจ **กลัวคนแปลกหน้า แมวแปลกหน้า หมา เสียง ' +
    'หรือสถานที่และสถานการณ์ที่ไม่คุ้นเคย** เช่น การนั่งรถ การไปหาหมอ และ **สภาพแวดล้อมที่ไม่คุ้นเคย** — ' +
    'บ้านใหม่เข้าข่ายข้อสุดท้ายเต็ม ๆ\n\n' +
    '🏠 **สิ่งที่ตำราแนะนำ: ให้ห้องเดียวก่อน อย่าเพิ่งเปิดทั้งบ้าน**\n' +
    'Merck ระบุว่าแมวที่กลัวควร **ถูกกันออกจากสิ่งที่ทำให้กลัว อย่างน้อยในระยะสั้น** ' +
    'ซึ่งโดยทั่วไปคือ **จัดให้อยู่ในห้องของตัวเอง พร้อมกระบะทราย ของเล่น ที่นอน และอาหาร**\n' +
    'พอน้องเริ่มออกมาเองแล้วค่อย ๆ ขยายพื้นที่ทีละส่วนค่ะ\n\n' +
    '🚫 **อย่าลากออกมาจากที่ซ่อน และอย่าดุ** — Merck ระบุว่า ' +
    '**"ควรเลี่ยงการลงโทษ เพราะทำให้แมวกลัวเรา"** การบังคับจะยิ่งยืดเวลาออกไป\n\n' +
    '⏱️ **ใช้เวลากี่วันถึงจะปกติ — หนูตอบเป็นตัวเลขไม่ได้ค่ะ** ' +
    'หนูไปหาในตำราแล้วไม่มีที่ไหนระบุจำนวนวันไว้ และหนูเลือกที่จะไม่เดา\n\n' +
    '🩺 **แต่มีจุดที่ต้องพาไปหาหมอนะคะ** — ถ้าน้อง **ไม่กินอาหาร ไม่ดื่มน้ำ หรือไม่ขับถ่าย** ' +
    'อันนั้นไม่ใช่แค่เรื่องปรับตัวแล้ว โดยเฉพาะแมวที่ไม่กินข้าว ถือเป็นเรื่องเร่งด่วนกว่าที่คิดค่ะ';
// ─────────────────────────────────────────────────────────────────────────
// [M-DOG/CAT] Merck — Behavior Problems of Dogs/Cats
//   "Pain, in particular, is an important risk factor for behavior problems."
//   "It is essential to rule out possible medical causes or factors contributing
//    to the behavior problem."
// [CATGARDEN] ใช้เป็นแหล่งตั้งหัวข้อเท่านั้น: ภาษาคนเลี้ยงเรียกการวิ่งพล่านว่า
//   zoomies; คำตอบด้านสุขภาพยังยึด Merck และไม่วินิจฉัยจากคำว่า "คึก" อย่างเดียว
// ─────────────────────────────────────────────────────────────────────────
const HIGH_AROUSAL_ANSWER = 'คำว่า **อเลิทจัด/วิ่งไม่พัก** ในภาษาคนเลี้ยงมักหมายถึงน้องคึกหรือพลังงานล้นค่ะ ' +
    'ถ้ายังหยุดพักได้ กินน้ำอาหารปกติ ไม่หอบ ไม่เจ็บ และเป็นช่วง ๆ อาจเป็นพฤติกรรมเล่นหรือวิ่งระบายพลังงานได้\n\n' +
    'ลองจดว่าเกิดช่วงไหน มีเสียงหรือสิ่งกระตุ้นอะไร เล่นแล้วหยุดพักได้ไหม และถ่ายคลิปจากระยะปลอดภัยไว้เทียบกับปกติค่ะ ' +
    'จัดพื้นที่ให้วิ่งโดยไม่ชนของอันตราย แล้วให้มีช่วงพักเอง\n\n' +
    '🩺 ถ้าเพิ่งเปลี่ยนกะทันหัน ควบคุมตัวเองไม่ได้ หอบมาก เดินเซ ร้องเหมือนเจ็บ ทำร้ายตัวเอง หรือกิน/ดื่ม/นอนเปลี่ยนไป ให้สัตวแพทย์ตรวจ เพราะต้องตัดสาเหตุทางกายออกก่อน ไม่ควรสรุปว่าแค่ซนค่ะ';
// ─────────────────────────────────────────────────────────────────────────
// [M-DOG/CAT] Merck — pain and medical causes must be ruled out when behavior changes.
// คำว่า "แสบ" เป็นคำกำกวม: ในโซเชียลใช้หมายถึงซน/กวน แต่ก็อาจหมายถึงแสบผิว ตา
// หรือแสบตอนปัสสาวะ จึงตอบแบบแยกความหมายและไม่ฟันธงว่าเป็นพฤติกรรม
// ─────────────────────────────────────────────────────────────────────────
const AMBIGUOUS_SLANG_ANSWER = 'คำว่า **แสบมาก/สุดจัด** ขอแยกความหมายก่อนนะคะ 😄 ถ้าหมายถึง **ซน กวน หรือตัวแสบ** เล่าว่าน้องทำอะไร เช่น วิ่งชนของ กัด หรือปีนที่สูงได้เลย จะได้แนะนำตรงพฤติกรรมค่ะ\n\n' +
    'แต่ถ้า “แสบ” หมายถึง **แสบตา แสบผิว แสบแผล หรือแสบตอนฉี่** ให้บอกตำแหน่งและอาการร่วมทันที เพราะเป็นคนละเรื่องกัน ถ้ามีเจ็บมาก เลือด ซึม หอบ ฉี่ไม่ออก หรืออาการเปลี่ยนกะทันหัน ให้ติดต่อสัตวแพทย์ค่ะ';
exports.BEHAVIOR_RULES = [
    {
        // ⚠️ ต้องมาก่อนกฎอื่นไม่สำคัญ แต่ "เห่า" เป็นคำเฉพาะ ชนกับใครยาก
        id: 'dog_barking',
        labelTh: 'หมาเห่ามาก / เห่ากลางคืน',
        species: 'dog',
        patterns: [
            /เห่า/,
            /(หอน|โหยหวน).{0,10}(กลางคืน|ตอนกลางคืน|ทั้งคืน|ตลอด|บ่อย)/,
            /(กลางคืน|ตอนกลางคืน|ทั้งคืน).{0,10}(หอน|โหยหวน)/,
            // เจ้าของบางคนใช้ "ร้อง" แทน "เห่า/หอน" เวลาเล่าว่าหมาส่งเสียงตอนกลางคืน
            /ร้อง.{0,40}กลางคืน|กลางคืน.{0,20}ร้อง/,
        ],
        answerTh: BARKING_ANSWER,
        sourceUrl: C_BARK,
        extraSources: [M_DOG_OWNER, M_DOG_PRO],
        verifiedAt: V,
    },
    {
        // ⚠️ ต้องมี "คำกริยาข่วน" + "ของในบ้าน" ทั้งคู่
        //    ห้ามใช้ /เกา/ เด็ดขาด — "เกา" เป็นอาการคัน (ไปที่ triage:itch_hairloss)
        //    และห้ามใส่ "ประตู" ในรายการของ เพราะเคสจริง "แมวชอบเกาประตูรถคันนี้"
        //    ต้องยังคงตกไป handoff (เป็นเรื่องรถ ไม่ใช่เรื่องเล็บ)
        id: 'cat_scratching',
        labelTh: 'แมวข่วนเฟอร์นิเจอร์',
        species: 'cat',
        patterns: [
            /(ข่วน|ตะกุย|ฝนเล็บ|ลับเล็บ).{0,12}(โซฟา|เก้าอี้|เฟอร์นิเจอร์|ที่นอน|เตียง|พรม|ผ้าม่าน|ม่าน|โต๊ะ|ตู้|วอลเปเปอร์|ผนัง|กำแพง|เบาะ)/,
            /(โซฟา|เก้าอี้|เฟอร์นิเจอร์|พรม|ผ้าม่าน|เบาะ).{0,12}(ข่วน|ตะกุย|พัง|ขาด).{0,6}(เพราะ|จาก)?/,
            /(ที่|เสา)?ลับเล็บ|ที่ฝนเล็บ|scratching post/,
            /(ผ่าตัด)?ถอดเล็บ|ตัดเล็บออก|declaw/,
        ],
        answerTh: SCRATCHING_ANSWER,
        sourceUrl: AAFP_DECLAW,
        extraSources: [CATVETS_CLAW, M_CAT_PRO, M_CAT_TREAT],
        verifiedAt: V,
    },
    {
        // ⚠️ ต้องมาก่อน cat_hiding — แมวก้าวร้าวมักมีคำว่า "ขู่/หลบ" ปนอยู่ด้วย
        //    และคำตอบเรื่องก้าวร้าวมีประตูความปลอดภัย (ให้หมอตรวจ) ที่สำคัญกว่า
        id: 'cat_aggression',
        labelTh: 'แมวก้าวร้าว / กัด / ขู่',
        species: 'cat',
        patterns: [
            /ก้าวร้าว|ดุร้าย|ดุมาก|หงุดหงิดใส่/,
            /(ชอบ|ชอบจะ|มัก|เอาแต่)?(กัด|ข่วน|ขู่|ตบ|ฟัด).{0,10}(คน|เจ้าของ|มือ|เท้า|ขา|ลูก|เด็ก|แขน)/,
            /(กัด|ข่วน|ขู่).{0,6}(ตอน|เวลา|เมื่อ).{0,10}(ลูบ|อุ้ม|จับ|เล่น)/,
            /ลูบ.{0,20}(กัด|งับ|ข่วน|ฟัด)|(จับ|แตะ)(ท้อง|หาง|เท้า).{0,10}(กัด|งับ|ขู่|ฟ่อ)|อุ้ม.{0,20}(กัด|งับ|ขู่)|เกาคาง.{0,20}(กัด|งับ)/,
            /ไม่ให้แตะตัว|แตะตัวไม่ได้/,
            /(ขู่|ฟ่อ|ขู่ฟ่อ|คำราม)(ใส่|บ่อย|ตลอด|ทุกครั้ง)/,
            /แมว.{0,6}(ชอบ)?(กัด|ข่วน).{0,4}(บ่อย|มาก|ตลอด|แรง)/,
        ],
        answerTh: AGGRESSION_ANSWER,
        sourceUrl: M_CAT_OWNER,
        extraSources: [M_CAT_PRO, M_CAT_TREAT],
        verifiedAt: V,
    },
    {
        id: 'cat_hiding',
        labelTh: 'แมวหลบซ่อน / ไม่ออกมา',
        species: 'cat',
        patterns: [
            /(ไม่ออกจาก|ไม่ยอมออกจาก|มุดอยู่|ซ่อนอยู่|หลบอยู่|อยู่).{0,8}(ใต้ตู้|ใต้เตียง|ใต้โซฟา|ในตู้|ตู้|มุมห้อง|ใต้รถ|ที่ซ่อน)/,
            /(หลบ|ซ่อน|มุด|ไม่ออกมา).{0,14}(ย้ายบ้าน|บ้านใหม่|ที่ใหม่|เพิ่งรับมา|เพิ่งมาอยู่)/,
            /(ย้ายบ้าน|บ้านใหม่|ที่ใหม่|เพิ่งรับมา).{0,16}(หลบ|ซ่อน|มุด|ไม่ออกมา|กลัว|ไม่ออกจาก)/,
            /(ไม่ยอม)?ออกจากที่ซ่อน|ไม่ยอมออกมา(เลย)?/,
            /(เรียกแล้ว|เรียกน้อง).{0,12}(ไม่ออกจากตู้|ไม่ออกจากที่ซ่อน|ไม่ยอมออกมา)/,
            /แมว.{0,10}(หลบซ่อน|ซ่อนตัว|หลบอยู่).{0,10}(ตลอด|บ่อย|ทำไง|ยังไง|ไม่ออก)/,
        ],
        answerTh: HIDING_ANSWER,
        sourceUrl: M_CAT_OWNER,
        extraSources: [M_CAT_TREAT],
        verifiedAt: V,
    },
    {
        id: 'high_arousal_zoomies',
        labelTh: 'น้องคึกจัด / วิ่งพล่านไม่พัก',
        species: 'both',
        patterns: [
            /อเลิทจัด|อเลิร์ทจัด|วิ่งไม่พัก|วิ่งพล่าน|คึกจัด|พลังงานล้น|วิ่งเป็นบ้า|วิ่งทั้งบ้าน|วิ่ง.*ไม่หยุด|คึก.*หยุดไม่ลง|ตื่นตัวทุกเสียง|ซนพลังงานเยอะ|zoomies/,
        ],
        answerTh: HIGH_AROUSAL_ANSWER,
        sourceUrl: M_CAT_OWNER,
        extraSources: [M_DOG_OWNER],
        verifiedAt: V,
    },
    {
        id: 'ambiguous_colloquial_slang',
        labelTh: 'คำภาษาพูดที่ต้องแยกบริบท',
        species: 'both',
        patterns: [
            /แสบมาก|แสบจัด|แสบสุด|ตัวแสบ|สุดจัด|กวนจัด|ซนเวอร์|ป่วนบ้าน|ตัวกวน|แสบจน|ซนเกิน/,
        ],
        answerTh: AMBIGUOUS_SLANG_ANSWER,
        sourceUrl: M_CAT_OWNER,
        extraSources: [M_DOG_OWNER],
        verifiedAt: V,
    },
    {
        // [M-DOG-OWNER] Merck — Behavior Problems in Dogs
        //   "It is essential to rule out possible medical causes or factors
        //    contributing to the behavior problem."
        // [DOGILIKE] ใช้เป็นแหล่งตั้งหัวข้อวัยรุ่น/กัดแทะ/หนีบ้านเท่านั้น
        id: 'dog_juvenile_mischief',
        labelTh: 'หมาซนจัด / กัดแทะ / พยายามหนี',
        species: 'dog',
        patterns: [
            /กัดแทะ|แทะข้าวของ|แทะโต๊ะ|คาบของ|พังของ|ทำลายของ|บ้านเละ|หนีออกบ้าน|ปีนรั้ว|ไฮเปอร์|ซนมาก|ซนจัด|กัดของไม่หยุด|รื้อของ/,
        ],
        answerTh: 'ภาษาคนเลี้ยงที่ว่า **หมาซนจัด/กัดแทะ/พยายามหนี** อาจเป็นพฤติกรรมวัยเด็ก วัยรุ่น ความเบื่อ หรือความกังวลได้ค่ะ ลองเก็บของที่กลืนได้ ป้องกันทางหนี ให้กิจกรรมที่เหมาะกับน้อง และฝึกด้วยรางวัลโดยไม่ลงโทษหรือไล่จับแบบทำให้กลัว\n\n' +
            'จดว่าเกิดตอนไหน อยู่ลำพังหรือมีสิ่งกระตุ้นอะไร และถ่ายคลิปไว้ ถ้าเพิ่งเปลี่ยนกะทันหัน กัดของจนเจ็บตัว กินของเข้าไป ก้าวร้าว หอบ หรือพฤติกรรมรุนแรงขึ้น ให้สัตวแพทย์ตรวจและช่วยวางแผนพฤติกรรมค่ะ',
        sourceUrl: M_DOG_OWNER,
        extraSources: [M_DOG_PRO],
        verifiedAt: V,
    },
];
/**
 * จับคำถามพฤติกรรม
 * ⚠️ ต้องเรียก **หลัง** emergency · guard · food · records · triage เสมอ
 *    เหตุผล: "แมวกัดคน" ที่มาพร้อมคำว่าบาดแผล/เลือด ต้องไปเข้ากฎฉุกเฉินก่อน
 */
function matchBehavior(text, species) {
    const q = String(text || '').toLowerCase();
    if (!q)
        return null;
    // ยึดชนิดสัตว์จากตัวข้อความก่อน (เจ้าของอาจถามแทนสัตว์ตัวอื่นที่ไม่ใช่ของตัวเอง)
    const saidCat = /แมว|เหมียว|cat/.test(q);
    const saidDog = /หมา|สุนัข|dog/.test(q);
    // ถ้าพูดถึงสองชนิดในประโยคเดียว ให้ดูผู้กระทำก่อน เช่น "หมาเห่าแมว"
    // คือคำถามพฤติกรรมของหมา ไม่ใช่คำถามกำกวมที่ต้องทิ้งไป handoff
    const dogSubject = /(?:^|\s)(?:น้อง|เจ้า)?(?:หมา|สุนัข)/.test(q);
    const catSubject = /(?:^|\s)(?:น้อง|เจ้า)?(?:แมว|เหมียว)/.test(q);
    const effSpecies = saidCat && saidDog && dogSubject && !catSubject ? 'dog'
        : saidCat && saidDog && catSubject && !dogSubject ? 'cat'
            : saidCat && !saidDog ? 'cat'
                : saidDog && !saidCat ? 'dog'
                    : (species === 'cat' || species === 'dog') ? species
                        : undefined;
    for (const rule of exports.BEHAVIOR_RULES) {
        // กฎเฉพาะชนิด — ไม่รู้ว่าเป็นตัวอะไร = ข้าม (ปลอดภัยกว่าเดา)
        if (rule.species !== 'both' && effSpecies !== rule.species)
            continue;
        // "แสบ" เป็น slang ได้ แต่เมื่อมีตำแหน่ง/สัญญาณทางกายร่วมต้องปล่อยให้
        // care/triage จับความหมายสุขภาพก่อน เช่น "ฉี่แล้วแสบมาก"
        if (rule.id === 'ambiguous_colloquial_slang' &&
            /(ฉี่|ปัสสาวะ|เยี่ยว|แสบตา|แสบผิว|แสบแผล|เลือด|บวม|อวัยวะ)/.test(q))
            continue;
        for (const p of rule.patterns) {
            if (p.test(q)) {
                return { rule, sources: [rule.sourceUrl, ...(rule.extraSources || [])] };
            }
        }
    }
    return null;
}
exports.BEHAVIOR_FOOTER = '\n\n— ข้อมูลนี้มาจากตำราสัตวแพทย์ ไม่ใช่การวินิจฉัย ' +
    'ถ้าพฤติกรรมเปลี่ยนไปกะทันหัน ควรให้สัตวแพทย์ตรวจร่างกายก่อนเสมอค่ะ';

},
"knowledge":function(require,module,exports){
"use strict";
// คลังคำตอบ deterministic ที่ตรวจย้อนกลับได้ — ไม่เรียก LLM/เน็ตขณะใช้งาน
Object.defineProperty(exports, "__esModule", { value: true });
exports.KNOWLEDGE_RULES = void 0;
exports.matchKnowledge = matchKnowledge;
const V = '2026-09-03';
const BMA = 'https://webportal.bangkok.go.th/VPH/page/sub/23336/%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%81%E0%B8%B2%E0%B8%A8/2/info/476772/%E0%B8%A1%E0%B8%B1%E0%B8%94%E0%B8%A3%E0%B8%A7%E0%B8%A1-9-%E0%B8%84%E0%B8%B3%E0%B8%96%E0%B8%B2%E0%B8%A1%E0%B8%AE%E0%B8%B4%E0%B8%95-QampA-%E0%B8%82%E0%B9%89%E0%B8%AD%E0%B8%9A%E0%B8%B1%E0%B8%8D%E0%B8%8D%E0%B8%B1%E0%B8%95%E0%B8%B4%E0%B8%AF-%E0%B9%83%E0%B8%AB%E0%B8%A1%E0%B9%88-%E0%B9%80%E0%B8%A3%E0%B8%B7%E0%B9%88%E0%B8%AD%E0%B8%87%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%84%E0%B8%A7%E0%B8%9A%E0%B8%84%E0%B8%B8%E0%B8%A1%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B9%80%E0%B8%A5%E0%B8%B5%E0%B9%89%E0%B8%A2%E0%B8%87%E0%B8%AB%E0%B8%A3%E0%B8%B7%E0%B8%AD%E0%B8%9B%E0%B8%A5%E0%B9%88%E0%B8%AD%E0%B8%A2%E0%B8%AA%E0%B8%B1%E0%B8%95%E0%B8%A7%E0%B9%8C-%E0%B8%9E%E0%B8%A8-2567';
const AAHA_VAX = 'https://www.aaha.org/resources/2022-aaha-canine-vaccination-guidelines/';
const CAT_VAX = 'https://catvets.com/resource/aaha-aafp-feline-vaccination-guidelines/';
const VAX_REACTION = 'https://www.aaha.org/resources/2020-aahaaafp-feline-vaccination-guidelines/adverse-postvaccination-reactions/';
const MERCK_DOG = 'https://www.merckvetmanual.com/behavior/behavior-of-dogs/behavior-problems-of-dogs';
const MERCK_CAT = 'https://www.merckvetmanual.com/behavior/behavior-of-cats/behavior-problems-of-cats';
const WSAVA = 'https://wsava.org/global-guidelines/global-nutrition-guidelines/';
const FDA_RAW = 'https://www.fda.gov/animal-veterinary/animal-health-literacy/get-facts-raw-pet-food-diets-can-be-dangerous-you-and-your-pet';
const AAHA_PREVENT = 'https://www.aaha.org/resources/preventive-healthcare-for-pets/';
const MERCK_CAT_GESTATION = 'https://www.merckvetmanual.com/behavior/behavior-of-cats/social-behavior-of-cats';
const MERCK_DOG_GESTATION = 'https://www.merckvetmanual.com/dog-owners/reproductive-disorders-of-dogs/management-of-reproduction-in-dogs';
exports.KNOWLEDGE_RULES = [
    {
        id: 'cat_gestation_general', labelTh: 'ระยะตั้งท้องของแมว', species: 'cat',
        patterns: [/(?:แมว|น้องแมว).{0,12}(?:ตั้งท้อง|ตั้งครรภ์|ท้อง(?!เสีย)).{0,15}(?:กี่เดือน|กี่วัน|นานเท่าไหร่|เช็กอาการ|ดูยังไง)/],
        answerTh: 'ตาม Merck แมวตั้งท้องโดยทั่วไปประมาณ **63–66 วัน** หรือราว 2 เดือนค่ะ แต่แชทยืนยันไม่ได้ว่าน้องตั้งท้องจริงหรือกำหนดคลอดวันไหน หากสงสัยหรือมีอาการผิดปกติ ให้สัตวแพทย์ตรวจโดยตรงค่ะ',
        sourceUrl: MERCK_CAT_GESTATION, verifiedAt: '2026-09-29',
    },
    {
        id: 'dog_gestation_general', labelTh: 'ระยะตั้งท้องของสุนัข', species: 'dog',
        patterns: [/(?:หมา|สุนัข|น้องหมา).{0,12}(?:ตั้งท้อง|ตั้งครรภ์|ท้อง(?!เสีย)).{0,15}(?:กี่เดือน|กี่วัน|นานเท่าไหร่|ดูยังไง)/],
        answerTh: 'ตาม Merck สุนัขตั้งท้องโดยทั่วไปประมาณ **62–64 วัน** หรือราว 2 เดือนค่ะ วันผสมไม่จำเป็นต้องตรงกับวันปฏิสนธิ จึงไม่ควรใช้ข้อความแชทเดากำหนดคลอด หากสงสัยหรือมีอาการผิดปกติ ให้สัตวแพทย์ตรวจโดยตรงค่ะ',
        sourceUrl: MERCK_DOG_GESTATION, verifiedAt: '2026-09-29',
    },
    {
        id: 'bkk_microchip_registration', labelTh: 'ไมโครชิปและทะเบียนสัตว์ในกรุงเทพฯ', species: 'both',
        patterns: [/(กฎหมาย|ข้อบังคับ|กทม|กรุงเทพ).{0,30}(ไมโครชิป|ฝังชิ[ปพ]|ลงทะเบียน)/, /(ไมโครชิป|ฝังชิ[ปพ]|ลงทะเบียน).{0,30}(กฎหมาย|บังคับ|กทม|กรุงเทพ|ต้องไหม|จำเป็นไหม)/],
        answerTh: '**ข้อมูลนี้เฉพาะกรุงเทพมหานคร ณ 3 ก.ย. 2569 ค่ะ** ข้อบัญญัติ กทม. มีผลตั้งแต่ 10 ม.ค. 2569 และกำหนดให้สุนัข/แมวในกรุงเทพฯ ฝังไมโครชิปและจดทะเบียน เจ้าของทำได้ที่คลินิกเอกชน (มีค่าใช้จ่าย) หรือคลินิกสัตวแพทย์ กทม. (บริการฟรีตามเงื่อนไข) การจดทะเบียนทำที่คลินิกสัตวแพทย์ กทม. หรือสำนักงานเขต โดยเตรียมบัตรประชาชน ทะเบียนบ้าน และเอกสารประกอบตามกรณี เช่น หนังสือยินยอมเจ้าของพื้นที่หากเช่าอยู่\n\nถ้าอยู่นอกกรุงเทพฯ ต้องตรวจข้อกำหนดของเทศบาล/อบต. ในพื้นที่อีกครั้ง เพราะบอทไม่ควรเอากฎหมาย กทม. ไปตอบแทนทั้งประเทศค่ะ',
        sourceUrl: BMA, verifiedAt: V,
    },
    {
        id: 'vaccine_aftercare', labelTh: 'อาการหลังฉีดวัคซีน', species: 'both',
        patterns: [/(หลัง|เพิ่ง).{0,12}(ฉีดวัคซีน|วัคซีน).{0,30}(ซึม|ไม่กิน|ไม่ค่อยกิน|เบื่ออาหาร|ไข้|บวม|เจ็บ|อ้วก|อาเจียน|หน้า|หายใจ)/, /(ซึม|ไม่กิน|ไม่ค่อยกิน|เบื่ออาหาร|บวม|เจ็บ).{0,20}(หลัง|เพิ่ง).{0,10}(วัคซีน|ฉีดวัคซีน)/, /(ฉีดวัคซีน|วัคซีน).{0,12}(แล้ว|เสร็จ).{0,12}(ซึม|ง่วง|ไม่กิน|ไม่ค่อยกิน|เบื่ออาหาร|ไข้|บวม|เจ็บ|ปกติ)/],
        answerTh: 'หลังวัคซีนอาจพบอาการเล็กน้อย เช่น ซึม เบื่ออาหาร มีไข้ต่ำ หรือเจ็บ/บวมบริเวณฉีดได้ช่วงสั้น ๆ ค่ะ แต่ถ้าอาการ **แย่ลงหรือไม่ดีขึ้นภายใน 1–2 วัน** ให้ติดต่อคลินิกที่ฉีด\n\n🚨 ถ้ามี **หายใจลำบาก หน้าหรือปากบวม ลมพิษ อาเจียน/ท้องเสียรุนแรง ทรุดหรือล้ม** ให้ไปโรงพยาบาลสัตว์ทันที เพราะเป็นสัญญาณปฏิกิริยารุนแรงที่ต้องให้สัตวแพทย์ประเมินค่ะ',
        sourceUrl: VAX_REACTION, extraSources: [AAHA_VAX, CAT_VAX], verifiedAt: V,
    },
    {
        id: 'vaccine_principles', labelTh: 'หลักการวางแผนวัคซีน', species: 'both',
        patterns: [/(วัคซีน|ฉีดวัคซีน).{0,25}(อะไรบ้าง|จำเป็น|ควรฉีด|หลัก|เลือก|ครบไหม)/],
        answerTh: 'แนวทางวัคซีนแบ่งเป็น **วัคซีนหลัก** และวัคซีนที่เลือกตามความเสี่ยงค่ะ แต่ชนิดและเวลาที่เหมาะกับแต่ละตัวขึ้นกับอายุ ประวัติวัคซีน สุขภาพ การออกนอกบ้าน พื้นที่ และการสัมผัสสัตว์อื่น\n\nบอทจึงช่วยเช็ก **ประวัติที่บันทึกไว้** และทำรายการคำถามไปคุยกับสัตวแพทย์ได้ แต่จะไม่สร้างตารางจำนวนเข็มหรือวันฉีดเฉพาะตัวโดยเดา หากมีสมุดวัคซีน ให้บันทึกชื่อวัคซีน วันที่ฉีด คลินิก และวันนัดจากเอกสารจริงค่ะ',
        sourceUrl: AAHA_VAX, extraSources: [CAT_VAX], verifiedAt: V,
    },
    {
        id: 'dog_resource_guarding', labelTh: 'สุนัขหวงของ/อาหารและงับเจ้าของ', species: 'dog',
        patterns: [/(หมา|สุนัข|น้อง).{0,25}(หวงอาหาร|หวงของ|หวงของเล่น|หวงกระดูก|กัดเจ้าของ|งับเจ้าของ)/, /(กัด|งับ).{0,20}(ตอนแย่ง|เวลาแย่ง|เวลาเอา|ตอนกิน|เข้าใกล้ชาม)/],
        answerTh: 'พฤติกรรมนี้อาจเกี่ยวกับ **การปกป้องทรัพยากร ความกลัว ความขัดแย้ง หรือความเจ็บปวด** จึงไม่ควรทดสอบด้วยการเอามือแย่งของค่ะ\n\nทำทันที: แยกเด็ก/ผู้สูงอายุออกจากสถานการณ์, ไม่เข้าใกล้ชามหรือของที่กำลังหวง, ใช้ประตูหรือระยะห่างจัดการพื้นที่ และ **ห้ามตี ขู่ กดตัว หรือเผชิญหน้า** เพราะการลงโทษอาจเพิ่มความกลัวและการกัด ถ้าเพิ่งเปลี่ยนพฤติกรรมกะทันหัน ให้สัตวแพทย์ตรวจตัดความเจ็บปวดก่อน และถ้าเคยกัดจริง/รุนแรง ให้ขอผู้เชี่ยวชาญพฤติกรรมที่ใช้วิธีให้รางวัลช่วยวางแผนค่ะ',
        sourceUrl: MERCK_DOG, verifiedAt: V,
    },
    {
        id: 'dog_stress_signs', labelTh: 'สัญญาณความเครียดในสุนัข', species: 'dog',
        patterns: [/(หมา|สุนัข|น้อง).{0,20}(เครียด|กังวล).{0,15}(ดูยังไง|อาการ|สัญญาณ|ไหม)/, /(หาว|เลียปาก|เดินวน|หอบ).{0,25}(เครียด|กังวล)/],
        answerTh: 'สัญญาณที่พบร่วมกับความเครียด/กลัวในสุนัขได้ ได้แก่ **ตัวต่ำ หูไปข้างหลัง หางจุก เลียปากหรือหาวทั้งที่ไม่ง่วง หอบ เดินวน ส่งเสียง หลบ/ถอย และกินน้อยลง** ค่ะ ให้จดว่าเกิดเมื่อไร มีสิ่งกระตุ้นอะไร นานเท่าไร และถ่ายวิดีโอจากระยะปลอดภัย\n\nสัญญาณเดียวไม่ยืนยันสาเหตุ และความเจ็บปวดก็ทำให้พฤติกรรมเปลี่ยนได้ ถ้าเกิดกะทันหัน รุนแรง กินไม่ได้ ทำร้ายตัวเอง/คน หรือสงบไม่ได้ ให้สัตวแพทย์ตรวจก่อนค่ะ',
        sourceUrl: MERCK_DOG, verifiedAt: V,
    },
    {
        id: 'cat_stress_signs', labelTh: 'สัญญาณความเครียดในแมว', species: 'cat',
        patterns: [/(แมว|น้อง).{0,20}(เครียด|กังวล).{0,15}(ดูยังไง|อาการ|สัญญาณ|ไหม)/, /(หลบ|ซ่อน|เลียขน|ฉี่นอก|พ่นฉี่).{0,25}(เครียด|กังวล)/],
        answerTh: 'สัญญาณความเครียด/กลัวในแมวอาจมี **หลบซ่อน หมอบ หูลู่ ส่งเสียงหรือพ่นฉี่ เลียขนมากจนขนบาง หรือดูแลขนน้อยลง กิน/ดื่มเปลี่ยน และขับถ่ายนอกกระบะ** ค่ะ ให้จดเวลา สถานที่ คน/สัตว์/เสียงที่เกิดก่อนหน้า การกินน้ำอาหาร และการขับถ่าย\n\nอาการเหล่านี้ทับซ้อนกับความเจ็บปวดและโรคได้ โดยเฉพาะการเลียขนมากหรือฉี่นอกกระบะ ถ้าเพิ่งเกิดกะทันหัน กินน้อย อาเจียน/ท้องเสีย หรือขับถ่ายผิดปกติ ให้สัตวแพทย์ตรวจก่อนค่ะ',
        sourceUrl: MERCK_CAT, verifiedAt: V,
    },
    {
        id: 'food_selection', labelTh: 'เลือกอาหารหลักให้หมา/แมว', species: 'both',
        patterns: [/(เลือก|ซื้อ|เปลี่ยน).{0,15}(อาหารหมา|อาหารสุนัข|อาหารแมว|อาหารเม็ด|อาหารหลัก).{0,20}(ยังไง|แบบไหน|ยี่ห้อไหนดี)/, /(อาหารหมา|อาหารสุนัข|อาหารแมว).{0,20}(ยี่ห้อไหนดี|เลือกยังไง|ดูฉลาก)/],
        answerTh: 'เวลาเลือกอาหารหลัก อย่าตัดสินจากรายชื่อวัตถุดิบหรือคำโฆษณาอย่างเดียวค่ะ แนวทาง WSAVA แนะนำให้เช็กว่าอาหารระบุว่า **ครบถ้วนและสมดุลสำหรับชนิดสัตว์และช่วงวัยที่ตรงกับน้อง**, ผู้ผลิตมีผู้เชี่ยวชาญโภชนาการ กระบวนการควบคุมคุณภาพ งานวิจัยรองรับ และช่องทางติดต่อที่ตอบข้อมูลโภชนาการได้\n\nบอทไม่จัดอันดับยี่ห้อโดยไม่มีข้อมูล ตรวจฉลากจริงแล้วจดชื่อสูตร ช่วงวัย พลังงานต่อหน่วย ปริมาณที่ให้ น้ำหนัก และอาการหลังเปลี่ยนอาหารไว้เปรียบเทียบค่ะ',
        sourceUrl: WSAVA, verifiedAt: V,
    },
    {
        id: 'raw_food_risk', labelTh: 'ความเสี่ยงอาหารดิบ', species: 'both',
        patterns: [/(อาหารดิบ|บาร์ฟ|barf|เนื้อดิบ|ไข่ดิบ).{0,20}(ดีไหม|ได้ไหม|ปลอดภัย|ควรให้|อันตราย)/],
        answerTh: 'FDA ระบุว่าอาหารสัตว์ดิบมีความเสี่ยงปนเปื้อนเชื้อก่อโรคต่อทั้งสัตว์และคนมากกว่าอาหารที่ผ่านกระบวนการ และการจัดการอาหารอาจปนเปื้อนมือ ชาม และพื้นผิวได้ค่ะ\n\nบอทจึงไม่รับรองสูตรดิบหรือจัดสูตรเอง โดยเฉพาะบ้านที่มีเด็ก ผู้สูงอายุ ผู้ตั้งครรภ์ หรือผู้มีภูมิคุ้มกันต่ำ ควรคุยกับสัตวแพทย์/นักโภชนาการสัตวแพทย์ก่อน และยึดสุขอนามัยการเก็บ-เตรียม-ล้างภาชนะอย่างเคร่งครัดค่ะ',
        sourceUrl: FDA_RAW, verifiedAt: V,
    },
    {
        id: 'preventive_checkup', labelTh: 'การดูแลเชิงป้องกัน', species: 'both',
        patterns: [/(ดูแล|ตรวจสุขภาพ|เช็กสุขภาพ).{0,20}(หมา|สุนัข|แมว|น้อง).{0,20}(อะไรบ้าง|ยังไง|บ่อยแค่ไหน)/, /(หมา|สุนัข|แมว).{0,20}(ตรวจสุขภาพ|ดูแลประจำ).{0,15}(บ่อย|กี่ครั้ง|ยังไง)/],
        answerTh: 'การดูแลเชิงป้องกันควรครอบคลุม **ตรวจร่างกาย น้ำหนัก/สภาพร่างกาย ฟันและช่องปาก โภชนาการ พฤติกรรม วัคซีน การควบคุมปรสิต และไมโครชิป/ข้อมูลติดต่อ** ค่ะ แนวทาง AAHA แนะนำตรวจอย่างน้อยปีละครั้ง และสัตว์สูงวัยมักเหมาะกับทุก 6 เดือน แต่สัตวแพทย์ต้องปรับตามวัย สุขภาพ และวิถีชีวิตของแต่ละตัว\n\nในแอปให้เก็บวันที่ตรวจ น้ำหนัก สิ่งผิดปกติ ผลตรวจ วัคซีน/ยา วันนัดครั้งถัดไป และเอกสารจากคลินิกจริงค่ะ',
        sourceUrl: AAHA_PREVENT, verifiedAt: V,
    },
];
function matchKnowledge(text, species) {
    const q = String(text || '').toLowerCase();
    for (const rule of exports.KNOWLEDGE_RULES) {
        if (rule.species !== 'both' && species && rule.species !== species)
            continue;
        if (rule.patterns.some((p) => p.test(q)))
            return rule;
    }
    return null;
}

},
"riskBoundary":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalVomitingThresholdReply = generalVomitingThresholdReply;
exports.applyRiskBoundary = applyRiskBoundary;
const clinicalDecision_1 = require("./clinicalDecision");
const clinicalReportContext_1 = require("./clinicalReportContext");
const AAHA_EMERGENCY = 'https://www.aaha.org/resources/help-is-this-a-pet-emergency/';
const CORNELL_HOUSE_SOILING = 'https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/feline-behavior-problems-house-soiling';
const ACTIVE_SYMPTOM = /(?:ไม่กิน(?:อาหาร|ข้าว|อะไรเลย)|ไม่ยอมกิน(?:อาหาร|ข้าว)|หยุดกิน|กินน้อยลง|กินอาหารน้อย|อาเจียน|อ้วก|ท้องเสีย|ถ่ายเหลว|ไม่อึ|อึไม่ออก|ขี้ไม่ออก|ไม่ถ่าย|ท้องผูก|ถ่ายยาก|ฉี่(?:นอกกระบะ|ตามมุม|ผิดที่|ที่เดิม)|ปัสสาวะ(?:นอกกระบะ|ผิดที่)|อึ(?:นอกกระบะ|ผิดที่)|ขับถ่าย(?:นอกกระบะ|ผิดที่)|หายใจ(?:ลำบาก|เร็ว|แรง|อ้าปาก)|หอบ|ไอ|จาม|ซึม|ชัก|หมดสติ|ล้ม|เลือดออก|ฉี่ไม่ออก|ปัสสาวะไม่ออก|ถ่ายไม่ออก|เจ็บ|ปวด|บวม|เดินเซ|เดินกะเผลก|น้ำหนักลด|ก้อน|ตุ่ม)/;
const RISK_SUBSTANCE = '(?:ช็อกโกแลต|ยาคน|ยาเบื่อ|ยาฆ่า|ยาเม็ด|ยานอนหลับ|ยาหยอดเห็บหมัด|ยาหยดเห็บหมัด|ยากำจัดเห็บหมัด|ยาฆ่าเห็บหมัด|ซาร่า|พารา|สารพิษ|องุ่น|ลูกเกด|หัวหอม|ของเล่น|กระดูก|สิ่งแปลกปลอม)';
const CURRENT_EXPOSURE = new RegExp(`(?:เผลอ|กินเข้าไป|กินไปแล้ว|กินแล้ว|กลืน|เลีย).{0,70}${RISK_SUBSTANCE}|${RISK_SUBSTANCE}.{0,85}(?:เผลอ|กินเข้าไป|กินไปแล้ว|กินแล้ว|กลืน|เลีย)`);
const PLAIN_FOOD_EXPOSURE = /กิน\s*(?:ช็อกโกแลต|ช็อคโกแลต|ชอกโกแลต|องุ่น|ลูกเกด|หัวหอม)/;
function reportedExposure(q) {
    if (CURRENT_EXPOSURE.test(q))
        return true;
    const match = PLAIN_FOOD_EXPOSURE.exec(q);
    if (!match)
        return false;
    const after = q.slice(match.index + match[0].length).trimStart();
    const before = q.slice(Math.max(0, match.index - 40), match.index);
    // "Can eat?" and prevention/non-exposure statements retain food guidance.
    if (/^(?:ได้|ไหม|มั้ย|ดีไหม|หรือเปล่า)/.test(after))
        return false;
    if (/(?:ไม่(?:เคย|ได้|ให้|อยากให้)|ห้าม|ป้องกัน).{0,25}$/.test(before))
        return false;
    return true;
}
const MEDICINE_PRODUCT = /(?:ยาฆ่าเห็บหมัด|ยากำจัดเห็บหมัด|ยาเห็บหมัด|ยาหยอดเห็บหมัด|ยาหยดเห็บหมัด)/;
// Swallowed poisons, medicines or objects: keep the poisoning rule's own caution
// (same wording as emergency.ts) when the reply is shortened below.
const INGESTION_EMERGENCY = /^emergency:(?:poisoning|human_medicine_ingestion|paracetamol_cat|reported_exposure|lily_exposure)$/;
const NO_HOME_VOMITING_TH = '\n\n⚠️ อย่าพยายามทำให้อาเจียนเองโดยไม่ได้รับคำสั่งจากสัตวแพทย์ค่ะ';
const LITTER_COUNT = /(?:กระบะ(?:ทราย)?.{0,14}(?:กี่|จำนวน|เท่าไหร่|เท่าไร)|(?:กี่|จำนวน|เท่าไหร่|เท่าไร).{0,14}กระบะ)/;
const HYPOTHETICAL = /^(?:ถ้า|หาก|สมมติ|โดยทั่วไป|อาการแบบไหน|สัญญาณอะไร|อยากทราบว่า)/;
const CURRENT_MARKER = /(?:ตอนนี้|วันนี้|เมื่อกี้|เพิ่ง|เริ่ม|อยู่|มา\s*\d|ตั้งแต่|น้อง|ลูกหมา|ลูกแมว|แมว|หมา|สุนัข|สัตว์เลี้ยง)/;
/** An explicit threshold question is not a report that vomiting happened.
 * Any simultaneous actual symptom keeps the original clinical routing. */
function generalVomitingThresholdReply(question, language) {
    const q = question.normalize('NFC').toLowerCase();
    const threshold = language === 'th'
        ? /(?:อาเจียน|อ้วก).{0,24}(?:แบบไหน|กี่ครั้ง|แค่ไหน|นานแค่ไหน).{0,36}(?:หาหมอ|พบหมอ|สัตวแพทย์|ฉุกเฉิน)/.test(q)
        : /\bwhat (?:kinds?|types?) of vomiting\b.{0,50}\b(?:require|need|warrant)\b.{0,35}\b(?:veterinar\w*|vet|emergency)\b/.test(q);
    const actual = /(?:ตอนนี้|วันนี้|เมื่อกี้|เพิ่ง|ตั้งแต่|กำลัง|หมาของ(?:ผม|ฉัน)|แมวของ(?:ผม|ฉัน)|อาเจียน.{0,24}(?:ไปแล้ว|แล้ว|หลายครั้ง|ไม่หยุด|เป็นเลือด|มีเลือด))|\b(?:now|today|just|currently|since|my (?:dog|cat|pet) (?:is|has|was|keeps)|vomit\w*.{0,25}(?:repeatedly|blood|won't stop))\b/.test(q);
    if (!threshold || actual || (0, clinicalReportContext_1.hasExplicitCurrentClinicalReport)(q))
        return null;
    return {
        text: language === 'en'
            ? 'For this general question: if vomiting occurs, contact a veterinarian to decide when your pet needs an examination. If vomiting is repeated or persistent, especially with blood or weakness, seek prompt veterinary care. If the pet also struggles to breathe or becomes unresponsive, contact an emergency veterinarian immediately. I cannot diagnose or recommend medicines or treatment in chat.'
            : 'สำหรับคำถามเกณฑ์ทั่วไป: หากน้องอาเจียน ให้ติดต่อสัตวแพทย์โดยตรงเพื่อประเมินว่าต้องตรวจเมื่อใด หากอาเจียนซ้ำหรือไม่หยุด โดยเฉพาะมีเลือดหรืออ่อนแรง ให้พบสัตวแพทย์โดยเร็ว หากหายใจลำบากหรือไม่ตอบสนองร่วมด้วย ให้ติดต่อสัตวแพทย์ฉุกเฉินทันที ผมไม่วินิจฉัยหรือแนะนำยาและการรักษาผ่านแชท',
        kind: 'red_flags', intent: 'medical:general_vomiting_threshold', confidence: 1, suggestAgent: false, sources: [AAHA_EMERGENCY],
    };
}
function hasActiveRisk(q) {
    if (reportedExposure(q))
        return true;
    if (!ACTIVE_SYMPTOM.test(q))
        return false;
    if (HYPOTHETICAL.test(q) && !CURRENT_MARKER.test(q))
        return false;
    return true;
}
/** Keep risk replies short. Only a clinician may interpret symptoms or choose care. */
function applyRiskBoundaryCore(question, reply) {
    if (reply.kind === 'human_safety')
        return reply; // Human exposure has its own clinician route.
    const q = String(question || '').normalize('NFC').toLowerCase();
    const hypotheticalOnly = /สมมติ|ไม่ได้บอกว่าเกิดขึ้นจริง/.test(q) && !(0, clinicalReportContext_1.hasExplicitCurrentClinicalReport)(q);
    if (reply.kind === 'emergency' && /^other_species:(?:rabbit_digestive|bird_breathing)$/.test(reply.intent)) {
        return hypotheticalOnly
            ? { ...reply, text: `ถ้าอาการที่สมมตินี้เกิดขึ้น ${reply.text}` }
            : reply;
    }
    if (reply.kind === 'emergency' || reportedExposure(q)) {
        const intent = reply.kind === 'emergency' ? reply.intent : 'emergency:reported_exposure';
        return {
            ...reply,
            text: hypotheticalOnly
                ? 'ถ้าเหตุหรืออาการที่สมมตินี้เกิดขึ้น **ติดต่อสัตวแพทย์ฉุกเฉินหรือโรงพยาบาลสัตว์ทันที** ค่ะ หนูไม่วินิจฉัยหรือแนะนำการรักษาผ่านแชท และไม่ได้บันทึกคำถามนี้เป็นอาการหรือการให้ยาค่ะ'
                : '🚨 อาการหรือเหตุที่เล่าอาจเป็นเหตุฉุกเฉินค่ะ **ติดต่อสัตวแพทย์ฉุกเฉินหรือโรงพยาบาลสัตว์ และพาน้องไปทันที** หนูไม่วินิจฉัยหรือบอกวิธีรักษาผ่านแชทค่ะ'
                    + (INGESTION_EMERGENCY.test(intent) ? NO_HOME_VOMITING_TH : ''),
            kind: 'emergency',
            intent,
            suggestAgent: false,
            sources: reply.sources?.length ? reply.sources : [AAHA_EMERGENCY],
        };
    }
    if (reply.intent === 'triage:litterbox') {
        return {
            ...reply,
            text: LITTER_COUNT.test(q)
                ? 'โดยทั่วไปเตรียมกระบะทราย **จำนวนแมว + 1 ใบ** และวางแยกจุดค่ะ ถ้ามีตัวไหนเริ่มขับถ่ายผิดที่ ให้ติดต่อสัตวแพทย์เพื่อตรวจสุขภาพก่อนสรุปว่าเป็นพฤติกรรมค่ะ'
                : 'อาการขับถ่ายผิดที่ควรให้ **สัตวแพทย์ตรวจโดยตรงโดยเร็ว** ค่ะ หนูไม่วินิจฉัยหรือแนะนำวิธีรักษาจากแชท ถ้าเบ่งแล้วฉี่ไม่ออก ให้พาไปโรงพยาบาลสัตว์ฉุกเฉินทันทีค่ะ',
            kind: LITTER_COUNT.test(q) ? 'guidance' : 'out_of_scope',
            suggestAgent: false,
            sources: [CORNELL_HOUSE_SOILING],
        };
    }
    if (MEDICINE_PRODUCT.test(q)) {
        return {
            ...reply,
            text: 'ยาเห็บหมัดมีความเสี่ยงถ้าเลือกหรือใช้ไม่ตรงกับสัตว์ค่ะ **ติดต่อสัตวแพทย์ก่อนใช้** หนูไม่เลือกยา ขนาด หรือวิธีใช้ให้ผ่านแชทค่ะ',
            kind: 'out_of_scope',
            intent: 'medical:medicine_product_referral',
            suggestAgent: false,
        };
    }
    if (reply.intent.startsWith('guard:')) {
        return {
            ...reply,
            text: 'เรื่องนี้ต้องให้ **สัตวแพทย์ประเมินโดยตรง** ค่ะ หนูไม่วินิจฉัย เลือกยา ขนาดยา วิธีรักษา หรือตารางวัคซีนเฉพาะตัวผ่านแชทค่ะ',
            suggestAgent: false,
        };
    }
    const generalThreshold = generalVomitingThresholdReply(q, 'th');
    if (generalThreshold)
        return generalThreshold;
    if (!hasActiveRisk(q))
        return reply;
    // Do not replace a more specific species or senior referral with generic text.
    if (/^(?:other_species:|senior:|medical:vet_)/.test(reply.intent))
        return reply;
    return {
        ...reply,
        text: 'อาการที่เล่าควรให้ **สัตวแพทย์ประเมินโดยตรงโดยเร็ว** ค่ะ หนูไม่วินิจฉัยหรือแนะนำยาและการรักษาจากข้อความแชทค่ะ',
        kind: 'out_of_scope',
        intent: 'symptom_referral:active_risk',
        suggestAgent: false,
        sources: reply.sources?.length ? reply.sources : [AAHA_EMERGENCY],
    };
}
function applyRiskBoundary(question, reply) {
    return (0, clinicalDecision_1.withMultiPetIllnessContext)(question, applyRiskBoundaryCore(question, reply), 'th');
}

},
"compoundRecords":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withCompoundSavedFacts = withCompoundSavedFacts;
const petScope_1 = require("./petScope");
const bookingView_1 = require("./bookingView");
const dateFormat_1 = require("./dateFormat");
const clinicalReportContext_1 = require("./clinicalReportContext");
const validDate = (date) => /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(Date.parse(`${date}T00:00:00Z`)) && new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) === date;
const unitEnglish = (unit) => ({ 'มื้อ': 'meals', 'ครั้ง': 'times', 'มล.': 'ml', 'กรัม': 'g', 'ชม.': 'hrs' }[unit] || unit);
/** Add requested saved facts to a care/risk answer. This never creates a record,
 * infers a dose from a prescription, or treats a hypothetical concern as an event. */
function withCompoundSavedFacts(message, base, selected, context) {
    const q = message.normalize('NFC').toLowerCase();
    const en = context?.language === 'en';
    // This is a distinction about the user's report and our limits, never a
    // clinical finding or a fabricated saved incident/profile dump.
    const asksKnownUnknown = /(?:what (?:the )?app knows|what is known|what(?:'s| is) known).{0,100}unknown|(?:แอป(?:รู้|ทราบ)|ข้อมูลที่รู้|ข้อมูลที่ทราบ).{0,100}(?:ไม่รู้|ไม่ทราบ|ยังไม่ทราบ)|อะไรรู้จริง\s*[,،]?\s*อะไร(?:ยัง)?ไม่รู้/.test(q);
    const clinical = ['emergency', 'out_of_scope', 'red_flags'].includes(base.kind);
    if (asksKnownUnknown && clinical) {
        const hypothetical = /สมมติ|ถ้าเกิด|หากเกิด|\bhypothetical(?:ly)?\b|\bif (?:my |a |the )?(?:cat|dog|rabbit|bird)\b/.test(q) && !(0, clinicalReportContext_1.hasExplicitCurrentClinicalReport)(q);
        const known = hypothetical
            ? (en ? 'Known: you asked about a hypothetical situation; this is not a saved or verified incident.' : 'ข้อมูลที่ทราบ: คุณถามสถานการณ์สมมติ ไม่ใช่เหตุการณ์ที่บันทึกหรือยืนยันว่าเกิดขึ้นแล้ว')
            : (en ? 'Known: you reported this situation in your message. The app has not independently verified the incident.' : 'ข้อมูลที่ทราบ: คุณเล่าสถานการณ์นี้ในข้อความ แอปยังไม่ได้ยืนยันเหตุการณ์จากการตรวจจริง');
        const lilyReport = /(?:กิน|กัด|เคี้ยว|แทะ|เลีย|ดื่ม|สัมผัส)\s*(?:ดอก|ใบ|ต้น|เกสร)?\s*ลิลลี่/.test(q.replace(/(?:ไม่ได้|ไม่เคย|ยังไม่)(?:กิน|กัด|เคี้ยว|แทะ|เลีย|ดื่ม|สัมผัส)/g, ''));
        const unknown = base.intent.includes('lily') || lilyReport
            ? (en ? `Unknown: the plant identity, exposure amount, clinical severity and diagnosis cannot be confirmed in chat. ${hypothetical ? 'If exposure occurs, follow the emergency referral above without waiting for symptoms or every detail.' : 'Contact the veterinarian now; do not wait to establish these details.'}` : `ข้อมูลที่ยังไม่ทราบ: แชทยืนยันชนิดพืช ปริมาณที่สัมผัส ความรุนแรงทางคลินิก หรือการวินิจฉัยไม่ได้ ${hypothetical ? 'หากเกิดการสัมผัส ให้ติดต่อสัตวแพทย์ฉุกเฉินตามคำแนะนำข้างต้นโดยไม่รออาการหรือข้อมูลครบ' : 'ติดต่อสัตวแพทย์ทันที ไม่ต้องรอให้ทราบรายละเอียดครบ'}`)
            : (en ? 'Unknown: the clinical severity and diagnosis cannot be confirmed in chat. Follow the veterinary referral above without waiting for more information.' : 'ข้อมูลที่ยังไม่ทราบ: แชทยืนยันความรุนแรงทางคลินิกหรือการวินิจฉัยไม่ได้ ติดต่อสัตวแพทย์ตามคำแนะนำข้างต้นโดยไม่รอข้อมูลเพิ่มเติม');
        base = { ...base, text: `${base.text}\n\n${known}\n${unknown}` };
    }
    const summaryRequest = /^(?:please\s+)?show(?:\s+me)?\s+(?:(?:my|the selected pet's|this pet's)\s+)?(?:saved|activity)\s+records[.!?]*$|^what do (?:my |the )?(?:saved|activity) records say[.!?]*$/.test(q.trim());
    const saved = /บันทึกจริง|ข้อมูลที่บันทึก|ข้อมูลจริง|ประวัติแพ้|\b(?:saved|recorded|actually recorded)\b/.test(q);
    const food = summaryRequest || /อาหาร|\bfood\b/.test(q), water = summaryRequest || /น้ำ|\bwater\b/.test(q);
    const doses = summaryRequest || /การให้ยา|\bmedicine administration\b/.test(q);
    const allergies = summaryRequest || /แพ้อะไร|ประวัติแพ้|\ballerg(?:y|ies)\b/.test(q);
    const species = /ชนิดสัตว์|ประเภทสัตว์|(?:ขอ|บอก|แสดง)\s*ชนิด(?=\s*(?:[,،]\s*)?(?:วันเกิด|ประวัติแพ้|นัด(?:หมาย)?|สัตว์))|\bspecies\b/.test(q);
    const birthday = /วันเกิด|เกิดวันไหน|\b(?:date of birth|birth date|birthday|dob)\b/.test(q);
    const appointment = /นัด(?:หมาย)?(?:ถัดไป|ต่อไป|ครั้งหน้า)|\bnext (?:appointment|booking)\b/.test(q);
    // Ordinary single-topic records keep their existing routes; compose only an
    // explicit separate concern or a compound record request with multiple fields.
    const compound = /สมมติ|ขั้นต่อไป|แมวใหม่|ถามเฉพาะ|\b(?:also|hypothetical|this question concerns|litterbox difficulties)\b/.test(q) || [food, water, doses, allergies, species, birthday, appointment].filter(Boolean).length > 1;
    if ((!saved && !summaryRequest) || !compound || !(food || water || doses || allergies || species || birthday || appointment))
        return base;
    const profiles = context?.ownerProfiles || (selected ? [selected] : []);
    const ref = (0, petScope_1.petReferenceText)(message, profiles).normalize('NFC').toLowerCase();
    const { matchedProfiles: full, remainingText: remaining } = (0, petScope_1.matchCanonicalPetNames)(ref, profiles);
    const named = [...full, ...profiles.filter(p => !full.includes(p) && (p.aliases || []).some(a => a && (0, petScope_1.mentionsPetName)(remaining, a)))];
    const scope = (0, petScope_1.resolveNamedPetScope)(message, named, selected, context?.explicitPetSelection);
    if (!scope.target || scope.ambiguous || scope.speciesConflict || (profiles.length && !profiles.some(p => p.id === scope.target?.id))) {
        const clarification = en ? 'Saved facts: please select the specific pet before I read its records. I cannot combine records from similar names.' : 'ข้อมูลบันทึกจริง: กรุณาเลือกสัตว์ตัวที่ต้องการก่อนอ่านบันทึก ผมจะไม่รวมข้อมูลของตัวชื่อคล้ายกัน';
        return { ...base, text: `${base.text}\n\n${clarification}` };
    }
    const pet = scope.target;
    const lines = [en ? `Saved facts for ${pet.name} (separate from the care or hypothetical concern):` : `ข้อมูลบันทึกจริงของ ${pet.name} (แยกจากคำถามการดูแลหรือสมมติ):`];
    const unknownFields = [];
    if (species) {
        const recorded = pet.species?.trim();
        const label = { dog: en ? 'dog' : 'สุนัข', cat: en ? 'cat' : 'แมว', rabbit: en ? 'rabbit' : 'กระต่าย', bird: en ? 'bird' : 'นก' }[recorded] || recorded;
        lines.push(recorded ? (en ? `Recorded species: ${label}.` : `ชนิดสัตว์ที่บันทึก: ${label}`) : (en ? 'Species: unavailable in the saved profile.' : 'ชนิดสัตว์: ยังไม่มีข้อมูลในโปรไฟล์ที่บันทึก'));
        if (!recorded)
            unknownFields.push(en ? 'species' : 'ชนิดสัตว์');
    }
    if (birthday) {
        const date = pet.birthday?.trim();
        lines.push(date && validDate(date) ? (en ? `Recorded date of birth: ${(0, dateFormat_1.formatDate)(date, 'en')}.` : `วันเกิดที่บันทึก: ${(0, dateFormat_1.formatDate)(date, 'th')}`) : (en ? 'Date of birth: unavailable in the saved profile; age does not establish a birth date.' : 'วันเกิด: ยังไม่มีข้อมูลวันที่เกิดที่ยืนยันได้ในโปรไฟล์ อายุไม่ใช่หลักฐานวันเกิด'));
        if (!date || !validDate(date))
            unknownFields.push(en ? 'date of birth' : 'วันเกิด');
    }
    if (allergies)
        lines.push(pet.allergies?.trim()
            ? (en ? `Recorded allergies: ${pet.allergies}.` : `ข้อมูลการแพ้ที่บันทึก: ${pet.allergies}`)
            : (en ? 'No allergy information is recorded in the profile. This does not mean the pet is allergy-free.' : 'ยังไม่มีข้อมูลการแพ้ในโปรไฟล์ ไม่ได้หมายความว่าน้องไม่มีอาการแพ้'));
    if (allergies && !pet.allergies?.trim())
        unknownFields.push(en ? 'allergy history' : 'ประวัติแพ้');
    if (appointment) {
        const next = (0, bookingView_1.nextUpcomingAppointment)(pet.bookings || [], Date.now());
        if (next)
            lines.push(en ? `Next saved appointment: ${next.title}, ${(0, dateFormat_1.formatDateTime)(next.date, 'en', next.time)}${next.place ? `, ${next.place}` : ''}.${base.kind === 'emergency' ? ' This future appointment does not replace emergency care now.' : ''}` : `นัดถัดไปที่บันทึก: ${next.title}, ${(0, dateFormat_1.formatDateTime)(next.date, 'th', next.time)}${next.place ? `, ${next.place}` : ''}${base.kind === 'emergency' ? ' นัดในอนาคตไม่ใช่เหตุผลให้รอเมื่อมีเหตุฉุกเฉินตอนนี้' : ''}`);
        else {
            lines.push(!pet.bookings ? (en ? 'Next appointment: the appointment records are unavailable in this chat context.' : 'นัดถัดไป: ยังอ่านบันทึกนัดหมายไม่ได้ในบริบทแชทนี้') : (en ? 'Next appointment: no valid future appointment with an upcoming status is available in the loaded records.' : 'นัดถัดไป: ยังไม่พบนัดในอนาคตที่มีวันเวลาและสถานะรอนัดในรายการที่โหลด'));
            unknownFields.push(en ? 'next appointment' : 'นัดถัดไป');
        }
    }
    if (unknownFields.length && /\bfollow[- ]up question\b|ถาม.{0,16}(?:คำถาม|เพิ่ม)|คำถามต่อ/.test(q))
        lines.push(en ? `One follow-up${clinical ? ', after contacting the veterinarian' : ''}: can you confirm the missing ${unknownFields.join(' and ')} from your own records?${clinical ? ' Do not delay care to answer.' : ''}` : `คำถามต่อหนึ่งข้อ${clinical ? ' หลังติดต่อสัตวแพทย์แล้ว' : ''}: คุณยืนยันข้อมูลที่ยังไม่มี (${unknownFields.join(' และ ')}) จากบันทึกของคุณได้ไหม?${clinical ? ' ไม่ต้องรอตอบก่อนพาน้องไปพบแพทย์' : ''}`);
    for (const [requested, type, label] of [[food, 'food', en ? 'Food' : 'อาหาร'], [water, 'water', en ? 'Water' : 'น้ำ']]) {
        if (!requested)
            continue;
        if (!pet.activityRecords) {
            lines.push(en ? `${label}: the individual activity records are unavailable in this chat context; weekly totals cannot identify the latest entry.` : `${label}: ยังอ่านบันทึกกิจกรรมรายรายการไม่ได้ในบริบทแชทนี้ ยอดรวมรายสัปดาห์ไม่ใช่รายการล่าสุด`);
            continue;
        }
        const today = new Date();
        const dateNow = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        const rows = pet.activityRecords.filter(r => r.petId === pet.id && r.type === type && r.id && validDate(r.date) && r.date <= dateNow && Number.isFinite(r.value));
        const lastDate = rows.map(r => r.date).sort().at(-1);
        if (!lastDate) {
            lines.push(en ? `${label}: no saved entry is available. This does not mean it was not provided.` : `${label}: ยังไม่พบรายการที่บันทึก ไม่ได้หมายความว่าไม่ได้ให้`);
            continue;
        }
        // Multiple entries on one date without an actual recorded time cannot be
        // ordered honestly. Show that date's rows rather than inventing a last time.
        const latestDay = rows.filter(r => r.date === lastDate).sort((a, b) => (a.time || '').localeCompare(b.time || ''));
        const created = latestDay.every(r => r.createdAt && Number.isFinite(Date.parse(r.createdAt)));
        const lastSaved = created ? Math.max(...latestDay.map(r => Date.parse(r.createdAt))) : undefined;
        const timed = latestDay.every(r => /^\d{2}:\d{2}$/.test(r.time || ''));
        const latest = created ? latestDay.filter(r => Date.parse(r.createdAt) === lastSaved) : timed ? latestDay.filter(r => r.time === latestDay.at(-1)?.time) : latestDay;
        for (const r of latest) {
            const time = r.time ? (0, dateFormat_1.formatTime)(r.time, en ? 'en' : 'th') : (en ? 'time not recorded' : 'ไม่บันทึกเวลา');
            const status = r.mealStatus === 'pending' ? (en ? '; marked pending, not confirmed eaten' : '; สถานะรอ ไม่ใช่ยืนยันว่ากินแล้ว') : '';
            lines.push(`${label}: ${r.value} ${en ? unitEnglish(r.unit) : r.unit}, ${(0, dateFormat_1.formatDate)(r.date, en ? 'en' : 'th')} ${time}${status}${r.grams != null && Number.isFinite(r.grams) ? `, ${r.grams} g` : ''}.`);
        }
        if (!created && !timed && latestDay.length > 1)
            lines.push(en ? 'These are entries on the latest recorded date; missing times prevent identifying the last entry within that date.' : 'แสดงรายการในวันที่บันทึกล่าสุด เพราะเวลาไม่ครบ จึงระบุไม่ได้ว่ารายการไหนเป็นรายการสุดท้ายในวันนั้น');
    }
    if (doses) {
        if (!pet.medicineAdministrations)
            lines.push(en ? 'Medicine administration: the dose log is not supplied to this chat context. I cannot confirm the latest medicine given; the prescription list does not prove administration. Check the medicine history and graph.' : 'การให้ยา: บริบทแชทนี้ยังไม่มีบันทึกการให้ยารายครั้ง จึงยืนยันรายการยาที่ให้ล่าสุดไม่ได้ รายการยาที่สั่งไม่ใช่หลักฐานว่าให้แล้ว ตรวจได้ในประวัติยาและกราฟ');
        else {
            const today = new Date();
            const dateNow = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            const rows = pet.medicineAdministrations.filter(r => r.petId === pet.id && r.id && r.medicineId && validDate(r.date) && r.date <= dateNow && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(r.scheduledTime) && Number.isFinite(r.givenAt) && r.givenAt > 0 && r.givenAt <= Date.now()).sort((a, b) => b.date.localeCompare(a.date) || b.scheduledTime.localeCompare(a.scheduledTime) || b.givenAt - a.givenAt);
            const latest = rows[0];
            if (latest)
                for (const r of rows.filter(r => r.date === latest.date && r.scheduledTime === latest.scheduledTime))
                    lines.push(en ? `Latest recorded administration (30-day history): ${r.name}, recorded dose date ${(0, dateFormat_1.formatDate)(r.date, 'en')}, scheduled ${(0, dateFormat_1.formatTime)(r.scheduledTime, 'en')}; confirmation saved at ${(0, dateFormat_1.formatDateTime)(r.givenAt, 'en')}. This is a saved record, not dosing advice.` : `การให้ยาที่บันทึกล่าสุด (ประวัติ 30 วัน): ${r.name}, วันที่บันทึกให้ยา ${(0, dateFormat_1.formatDate)(r.date, 'th')} รอบกำหนด ${(0, dateFormat_1.formatTime)(r.scheduledTime, 'th')} ยืนยันบันทึกเมื่อ ${(0, dateFormat_1.formatDateTime)(r.givenAt, 'th')} เป็นข้อมูลย้อนหลัง ไม่ใช่คำแนะนำขนาดยา`);
            else
                lines.push(en ? 'No confirmed administration receipt is available in the last 30 days. This does not mean medicine was not given.' : 'ยังไม่พบหลักฐานบันทึกการให้ยาในช่วง 30 วัน ไม่ได้หมายความว่าไม่ได้ให้ยา');
        }
    }
    // Keep clinician/urgent referral and care text first, including its sources.
    if (summaryRequest && !['emergency', 'human_safety', 'out_of_scope'].includes(base.kind))
        return { text: lines.join('\n'), kind: 'records', intent: 'records:saved_summary', confidence: 1, suggestAgent: false };
    return { ...base, text: `${base.text}\n\n${lines.join('\n')}` };
}

},
"clinicalDecision":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLINICAL_DECISION_REVIEW = exports.CLINICAL_DECISION_SOURCES = void 0;
exports.matchLilyExposure = matchLilyExposure;
exports.matchVetReassessment = matchVetReassessment;
exports.matchClinicalDecision = matchClinicalDecision;
exports.withMultiPetIllnessContext = withMultiPetIllnessContext;
const clinicalReportContext_1 = require("./clinicalReportContext");
// Reviewed, source-backed corrections from actual native Social pilot failures.
// This is an offline rule update, not automatic knowledge ingestion or model training.
exports.CLINICAL_DECISION_SOURCES = {
    medicine: 'https://www.fda.gov/animal-veterinary/animal-health-literacy/medications-your-pet-questions-your-vet',
    vaccine: 'https://www.aaha.org/resources/2020-aahaaafp-feline-vaccination-guidelines/faqs-5/',
    anorexia: 'https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/anorexia',
    lily: 'https://www.fda.gov/animal-veterinary/animal-health-literacy/lovely-lilies-and-curious-cats-dangerous-combination',
    vomiting: 'https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/vomiting',
};
exports.CLINICAL_DECISION_REVIEW = {
    verifiedAt: '2026-10-04',
    actualCaseIds: ['SOCIAL2-SOC-04-01', 'SOCIAL2-SOC-05-01', 'SOCIAL2-SOC-10-01'],
    scope: 'Veterinarian handoff for uncertain medicine administration, vaccine catch-up and continuing feline symptoms after assessment; no treatment protocol.',
};
const TH_MEDICINE = /(?:ยา(?:ที่|ปฏิชีวนะ|เม็ด|น้ำ|ป้องกัน|ประจำ|รายเดือน|เห็บ|พยาธิ)|(?:ให้|กิน|ป้อน|ฉีด|คาย|ลืม|ขาด|รับ|แพ้|เพิ่ม|ลด|หยุด|เรื่อง|รายการ|ประวัติ).{0,16}ยา(?!ก)|อินซูลิน)/;
const EN_MEDICINE = /\b(?:medicines?|medications?|tablets?|pills?|antibiotics?|insulin|injections?|monthly prevention|heartworm prevention)\b/;
const TH_UNCERTAINTY = /(?:คาย|อาเจียน|อ้วก|ลืม|พลาด|ขาด|จำไม่ได้|ไม่แน่ใจ|ไม่ยอม(?:กิน|รับ)|ป้อนไม่ได้|ให้ไม่ได้|กินไม่ได้|ฉีดไม่เข้า|ฉีดแล้ว.{0,24}ไม่|ฉีดซ้ำ|ให้ซ้ำ|ให้ชดเชย|เพิ่ม.{0,8}(?:สองเท่า|2เท่า)|บดยา)/;
const EN_UNCERTAINTY = /\b(?:miss(?:ed|ing)?|forgot|forgotten|forget|uncertain|unsure|not sure|can(?:not|'t) remember|spit(?:s)?|spat|vomit(?:s|ed|ing)?|refus(?:e|es|ed|ing)|won't take|will not take|wouldn't take|cannot give|can't give|did not go in|repeat|re[- ]?dose|double|crush)\b/;
const DECISION = /(?:ต้อง|ควร|ได้ไหม|ได้มั้ย|ได้หรือ|ทำไง|ยังไง|อย่างไร|ชดเชย|ให้ซ้ำ|ฉีดซ้ำ|เริ่มใหม่|เพิ่ม.{0,8}เท่า|\b(?:should|can i|can we|may i|what (?:should|do)|how (?:do|can|should)|repeat|re[- ]?dose|double|restart|start over|catch[- ]?up)\b)/;
const RECORD_LOOKUP = /(?:ประวัติ|บันทึก|กราฟ|รายการ|สถานะ).{0,30}ยา|ยา.{0,30}(?:ประวัติ|บันทึก|กราฟ|รายการ|สถานะ)|(?:วันนี้|เมื่อวาน).{0,16}(?:ให้|กิน|ป้อน)ยา.{0,12}(?:อะไร|กี่|เมื่อ|ตอนไหน|แล้ว|บ้าง)|\b(?:history|records?|logged|saved|chart|graph|list|show)\b.{0,35}\b(?:medicines?|medications?|doses?)\b|\b(?:medicines?|medications?|doses?)\b.{0,35}\b(?:history|records?|logged|saved|chart|graph)\b/;
const PERSONAL_UNCERTAINTY = /(?:จำไม่ได้ว่า|ไม่แน่ใจว่า|คายยา|อาเจียน.{0,20}ยา|ยา.{0,20}อาเจียน|\b(?:i|we)\b.{0,20}\b(?:forgot|can't remember|cannot remember|am not sure|are not sure)\b|\b(?:spit|spat|vomited)\b)/;
const REPEATED_VOMITING = /(?:อาเจียน|อ้วก)(?:\s|ๆ|อยู่|มา|แบบ)*(?:ซ้ำ|หลายครั้ง|หลายรอบ|บ่อย|ต่อเนื่อง|ไม่หยุด)|(?:อาเจียน|อ้วก)ซ้ำ|(?:อาเจียน|อ้วก)\s+หลาย(?:ครั้ง|รอบ)|\bvomit\w*\s+(?:repeatedly|multiple times|again and again|non[- ]stop|continuously)\b|\b(?:repeatedly|repeated|keeps?|continuously)\s+vomit\w*\b/i;
function hasRepeatedVomitingConcern(question) {
    const historicRead = /^(?:(?:please\s+)?(?:show|list|display)\b|แสดง|ดู(?:บันทึก|ประวัติ))/i.test(question) && /\b(?:records?|history|saved|logged|chart)\b|บันทึก|ประวัติ|กราฟ/i.test(question) && !/(?:ควร|ได้ไหม|ให้ซ้ำ|ฉีดซ้ำ|\b(?:should|can i|may i|repeat|double|crush)\b)/i.test(question) && !(0, clinicalReportContext_1.hasExplicitCurrentClinicalReport)(question);
    if (historicRead)
        return false;
    const positive = question.replace(/[’‘]/g, "'").replace(/\b(?:(?:do|does|did|is|are|was|were|has|have|had)\s+not|(?:do|does|did|is|are|was|were|has|have|had)n'?t|not|never|no|without)\s+(?:(?:have|had|been|being|ever|normally|usually|currently|actually|really|longer|repeated(?:ly)?)\s+)*vomit\w*\b/gi, '').replace(/(?:ไม่ได้|ไม่มี|ไม่เคย|ไม่)(?:มีอาการ)?(?:อาเจียน|อ้วก)/g, '');
    return REPEATED_VOMITING.test(positive);
}
const INJECTION_CONTEXT = /(?:ฉีด|อินซูลิน|\b(?:insulin|injections?|shots?|jabs?)\b)/i;
const HUMAN_MEDICINE = /(?:ยาคน|ยา(?:ของ|สำหรับ)คน|\bhuman[- ](?:medicines?|medications?|drugs?|pills?)\b)/i;
const HUMAN_MEDICINE_REQUEST = /(?:ใช้|ให้|แทน|เปลี่ยน|\b(?:use|give|replace|substitute|swap|instead)\b)/i;
const TH_VACCINE = /วัคซีน/;
const EN_VACCINE = /\b(?:vaccines?|vaccination|vaccinations?|vax|booster)\b/;
const VACCINE_CATCHUP = /(?:ลืม|พลาด|เลยกำหนด|เกินกำหนด|ค้าง|ช้า|เลื่อน|เริ่มใหม่|ฉีดใหม่|กี่เข็ม|เว้นกี่|\b(?:miss(?:ed|ing)?|late|overdue|restart|start over|catch[- ]?up|revaccinat\w*|how many (?:shots|doses|boosters))\b)/;
const VACCINE_RECORD_LOOKUP = /(?:ประวัติ|บันทึก|ครั้งล่าสุด|ล่าสุดเมื่อ|นัดถัดไป|นัดครั้งหน้า|\b(?:saved|recorded|history|records?|latest|last|next saved appointment)\b)/;
// "Is <pet>'s vaccine overdue?" asks for the saved status, not a catch-up plan (gate case 14 Oct 2026).
const VACCINE_STATUS_QUESTION = /(?:เลย|เกิน|ครบ|ถึง)กำหนด(?:แล้ว)?(?:ไหม|มั้ย|หรือยัง|รึยัง|หรือเปล่า)|\b(?:is|are)\b.{0,40}\b(?:overdue|due)\b(?: yet)?\s*\??$/;
const MISSED_VACCINE_EVENT = /(?:ลืม|พลาด)นัด|\b(?:vaccin\w* appointment (?:was )?missed|missed (?:a |the )?(?:vaccin\w*|booster)(?: appointment)?)\b/;
function matchLilyExposure(question, species, language) {
    const q = String(question || '').normalize('NFC').toLowerCase();
    if (!/ลิลลี่|ลิลลี|ลิลลิ|\b(?:lily|lilies|daylily|daylilies)\b/.test(q))
        return null;
    if (/หมา|สุนัข|\bdogs?\b/.test(q) && !/แมว|\bcats?\b/.test(q))
        return null;
    if (species !== 'cat' && !/แมว|\b(?:cat|kitten)s?\b/.test(q))
        return null;
    const withoutNegated = q.replace(/\bprevent(?:ing|ion)?\s+(?:lily\s+)?exposure\b/g, '').replace(/\bno (?:known )?exposure\b/g, '').replace(/\b(?:did not|didn't|has not|hasn't|never)\s+(?:eat|ate|eaten|chew|chewed|lick|licked|drink|drunk|ingest|ingested)\b/g, '').replace(/(?:ไม่ได้|ไม่เคย|ยังไม่)(?:กิน|กัด|เคี้ยว|เลีย|ดื่ม|สัมผัส)/g, '');
    const exposure = /(?:กิน|กัด|เคี้ยว|เลีย|ดื่ม|สัมผัส).{0,40}(?:ลิล|เกสร|แจกัน)|(?:ลิล|เกสร|แจกัน).{0,40}(?:กิน|กัด|เคี้ยว|เลีย|ดื่ม|ติดขน)|\b(?:ate|eaten|chewed|licked|drank|drunk|ingested|swallowed|exposed|exposure)\b|\bpollen\b.{0,25}\b(?:fur|coat)\b/.test(withoutNegated);
    if (!exposure)
        return null;
    return {
        text: language === 'en'
            ? 'Possible lily exposure can be an emergency for a cat. Contact a veterinarian or emergency animal hospital immediately, even without symptoms. Tell them about the plant, pollen or vase water exposure and bring a photo if available without delaying care. Do not induce vomiting or give home treatment. I cannot identify the plant or diagnose poisoning from chat.'
            : 'แมวอาจสัมผัสลิลลี่เป็นเหตุฉุกเฉินได้ค่ะ **ติดต่อสัตวแพทย์หรือโรงพยาบาลสัตว์ฉุกเฉินทันที แม้ยังไม่มีอาการ** แจ้งเรื่องต้นไม้ เกสรหรือน้ำแจกัน ถ้ามีรูปนำให้หมอดูโดยไม่ชะลอการไป อย่าทำให้อาเจียนหรือรักษาเอง หนูไม่ยืนยันชนิดต้นไม้หรือวินิจฉัยพิษผ่านแชทค่ะ',
        kind: 'emergency', intent: 'emergency:lily_exposure', confidence: 1,
        suggestAgent: false, sources: [exports.CLINICAL_DECISION_SOURCES.lily],
    };
}
/** Continuing symptoms after an assessment still require prompt reassessment.
 * Cornell supports immediate appetite-loss consultation and prompt assessment of
 * vomiting with reduced appetite. Never infer a cause or a duration from a post.
 */
function matchVetReassessment(question, species, language) {
    const q = String(question || '').normalize('NFC').toLowerCase();
    const cat = /แมว|\b(?:cat|kitten)s?\b/.test(q) || (species === 'cat' && !/หมา|สุนัข|\b(?:dog|puppy|rabbit|bird)s?\b/.test(q));
    const vomiting = /อาเจียน|อ้วก|\bvomit\w*\b/.test(q);
    const noFood = /ไม่(?:ยอม)?กิน(?:อาหาร)?|ไม่ทาน|\b(?:not eating|won't eat|will not eat|refus\w* (?:food|to eat))\b/.test(q);
    const previousAssessment = /(?:หมอ|สัตวแพทย์|ตรวจ).{0,25}(?:แล้ว|ก่อน|ปกติ)|(?:ไปหา|พาไป).{0,12}(?:หมอ|ตรวจ)|\b(?:vet|veterinarian|clinic|assessment|exam)\b.{0,35}\b(?:already|normal|earlier|before)|\b(?:already|previously|earlier|saw|seen|seeing|visited)\b.{0,35}\b(?:vet|veterinarian|clinic|exam)\b/.test(q);
    const continuing = /ยัง|ไม่ดีขึ้น|ไม่หาย|เป็นต่อ|\b(?:still|continu\w*|not improv\w*|no improv\w*|not better)\b/.test(q);
    if (!cat || !vomiting || !noFood || !continuing)
        return null;
    return {
        text: language === 'en'
            ? `${previousAssessment ? 'Because these symptoms continue after an earlier assessment, contact the veterinarian again now for urgent reassessment.' : 'For continuing vomiting and refusal to eat, contact a veterinarian now for urgent assessment.'} Tell the clinic what you observed, when symptoms started or changed, and any previous visits or prescribed medicines. Do not wait to collect every detail. I cannot determine the cause, prescribe treatment or recommend force-feeding in chat.`
            : `${previousAssessment ? 'ถ้ายังอาเจียนและไม่กินอาหารแม้ตรวจมาแล้ว **ติดต่อสัตวแพทย์อีกครั้งตอนนี้เพื่อประเมินซ้ำโดยเร่งด่วน**' : 'ถ้าอาเจียนและไม่กินอาหารต่อเนื่อง **ติดต่อสัตวแพทย์ตอนนี้เพื่อประเมินเร่งด่วน**'} ค่ะ แจ้งอาการที่สังเกตจริง เวลาเริ่มหรือเปลี่ยนแปลง รวมถึงการตรวจครั้งก่อนหรือยาที่หมอสั่งถ้ามี ไม่ต้องรอเก็บรายละเอียดครบก่อนติดต่อ หนูไม่สรุปสาเหตุ สั่งยา หรือแนะนำฝืนป้อนอาหารผ่านแชทค่ะ`,
        kind: 'out_of_scope', intent: 'medical:vet_reassessment', confidence: 1,
        suggestAgent: false, sources: [exports.CLINICAL_DECISION_SOURCES.anorexia, exports.CLINICAL_DECISION_SOURCES.vomiting],
    };
}
/** Explicit clinical decisions only; plain saved-record queries keep their existing route. */
function matchClinicalDecision(question, language) {
    const q = String(question || '').normalize('NFC').toLowerCase();
    const injection = INJECTION_CONTEXT.test(q) && !TH_VACCINE.test(q) && !EN_VACCINE.test(q);
    const medicine = TH_MEDICINE.test(q.replace(/พยายาม/g, ' ')) || EN_MEDICINE.test(q) || injection;
    const humanMedicineRequest = HUMAN_MEDICINE.test(q) && HUMAN_MEDICINE_REQUEST.test(q) && (DECISION.test(q) || /\b(?:is it (?:ok|okay|safe))\b/.test(q));
    // "ไม่แน่ใจว่ากดถูกไหม" is unsure about a button, not about the medicine itself.
    const uiUnsure = /ไม่แน่ใจว่ากด(?:ถูก|ปุ่ม)?(?:ไหม|มั้ย|หรือเปล่า|รึเปล่า)?|กดไม่ถูก/g;
    const uncertain = TH_UNCERTAINTY.test(q.replace(uiUnsure, ' ')) || EN_UNCERTAINTY.test(q);
    // A no-write instruction is not a request to inspect saved medication records.
    const concern = q.replace(/\b(?:do not|don't)\s+(?:save|record)\b.*$/, '').replace(/(?:ห้าม|ไม่ต้อง|อย่า)\s*บันทึก.*$/, '').replace(uiUnsure, ' ');
    // Forgetting to log a known given dose is a UI correction. Forgetting
    // whether the dose was administered still requires the prescribing vet.
    // "ลืมติ๊ก/ติ๊กผิด" names the in-app tick itself, so it is a log correction too.
    const loggingCorrection = ((/(?:ลืม(?:ลง|จด|บันทึก)|\bforgot to (?:record|log)\b)/.test(concern)
        && /(?:ให้(?:ยา)?(?:จริง)?แล้ว|\bmark\b.{0,35}\bas given\b)/.test(concern))
        || /(?:ลืม(?:กด)?ติ๊ก|ติ๊ก(?:ยา)?(?:ผิด|พลาด)|(?:ยกเลิก|แก้)(?:การ)?ติ๊ก|\bforgot to (?:tick|mark)\b)/.test(concern)
        // "ลืมใส่จำนวนยา" forgot to fill an app field (stock/time/end date), not a missed dose.
        || /ลืม(?:ใส่|กรอก|ตั้ง|เลือก|เพิ่ม)\s*(?:จำนวน|เวลา|สต็อก|วัน(?:จบ|สุดท้าย)|ความถี่|ระยะเวลา)|\bforgot to (?:enter|set|add) (?:the )?(?:stock|count|time|end date|frequency)\b/.test(concern))
        && /(?:ยังไง|ไง|ตรงไหน|แก้|\b(?:where|how)\b)/.test(concern)
        && !/(?:ไม่แน่ใจ|จำไม่ได้ว่า|คาย|อาเจียน|อ้วก|ให้ซ้ำ|ฉีดซ้ำ|ชดเชย|ขนาดยา|\b(?:unsure|uncertain|whether|spit|spat|vomit\w*|repeat|double|crush|dosage|how much)\b)/.test(concern);
    const recordOnly = loggingCorrection || (RECORD_LOOKUP.test(concern) && !DECISION.test(concern) && !PERSONAL_UNCERTAINTY.test(concern));
    if (((medicine && uncertain) || humanMedicineRequest) && !recordOnly) {
        const repeatedVomiting = hasRepeatedVomitingConcern(q);
        const hypothetical = /(?:สมมติ|ถ้าเกิด|หากเกิด)|\b(?:hypothetical(?:ly)?|if (?:my |a |the )?(?:cat|kitten|dog|pet)\b)/i.test(q) && !(0, clinicalReportContext_1.hasExplicitCurrentClinicalReport)(q);
        const symptomLead = repeatedVomiting
            ? (language === 'en'
                ? `${hypothetical ? 'If repeated vomiting occurs, contact' : 'For the repeated vomiting you describe, contact'} a veterinarian now for urgent assessment. Do not delay contacting the clinic while deciding about medicines. `
                : `${hypothetical ? 'หากเกิดอาเจียนซ้ำ ' : 'อาการอาเจียนซ้ำที่เล่าควรประเมินเร่งด่วนค่ะ '}ติดต่อสัตวแพทย์ตอนนี้ อย่ารอตัดสินใจเรื่องยาก่อนติดต่อคลินิกค่ะ `)
            : '';
        const humanWarning = humanMedicineRequest
            ? (language === 'en' ? ' Do not give human medicines or substitute them unless the prescribing veterinarian directs you to.' : ' อย่าให้ยาคนหรือใช้แทนยาเดิม เว้นแต่สัตวแพทย์ที่สั่งยาจะสั่งให้โดยตรงค่ะ')
            : '';
        return {
            text: symptomLead + (language === 'en'
                ? injection
                    ? 'If you are unsure whether insulin or an injection was administered or delivered, contact the prescribing veterinarian directly before deciding what to give next. Do not repeat or double a dose on your own. I cannot set a dose or catch-up schedule in chat.'
                    : uncertain
                        ? 'If medicine was spat out, vomited, missed, or its administration is uncertain, contact the prescribing veterinarian directly before deciding what to give next. Do not repeat or double a dose, crush medicine, or force administration on your own. I cannot set a dose or catch-up schedule in chat.'
                        : 'Contact the prescribing veterinarian directly before choosing or substituting any medicine. I cannot choose a medicine or set a dose in chat.'
                : injection
                    ? 'ถ้าไม่แน่ใจว่าได้ให้อินซูลินหรือฉีดยาไปแล้ว หรือไม่แน่ใจว่ายาเข้า **ติดต่อสัตวแพทย์หรือคลินิกที่สั่งยาโดยตรง** ก่อนตัดสินใจให้ครั้งถัดไปค่ะ อย่าฉีดซ้ำหรือเพิ่มสองเท่าเอง หนูไม่กำหนดขนาดยาหรือตารางชดเชยผ่านแชทค่ะ'
                    : uncertain
                        ? 'ถ้าคายหรืออาเจียนยา ลืมให้ยา หรือไม่แน่ใจว่าให้ไปแล้ว **ติดต่อสัตวแพทย์หรือคลินิกที่สั่งยาโดยตรง** ก่อนตัดสินใจให้ครั้งถัดไปค่ะ อย่าให้ซ้ำ เพิ่มสองเท่า บดยาหรือฝืนป้อนเอง หนูไม่กำหนดขนาดยาหรือตารางชดเชยผ่านแชทค่ะ'
                        : 'ติดต่อสัตวแพทย์หรือคลินิกที่สั่งยาโดยตรงก่อนเลือกหรือเปลี่ยนยาค่ะ หนูไม่เลือกยาหรือกำหนดขนาดยาผ่านแชทค่ะ') + humanWarning,
            kind: 'out_of_scope', intent: 'medical:vet_medicine_administration', confidence: 1,
            suggestAgent: false, sources: [exports.CLINICAL_DECISION_SOURCES.medicine, ...(repeatedVomiting ? [exports.CLINICAL_DECISION_SOURCES.vomiting] : [])],
        };
    }
    const vaccineStatusOnly = VACCINE_STATUS_QUESTION.test(q) && !DECISION.test(q) && !/ลืม|พลาด|\b(?:forgot|missed)\b/.test(q);
    if ((TH_VACCINE.test(q) || EN_VACCINE.test(q)) && VACCINE_CATCHUP.test(q) && !vaccineStatusOnly &&
        !(VACCINE_RECORD_LOOKUP.test(q) && !DECISION.test(q) && !MISSED_VACCINE_EVENT.test(q))) {
        return {
            text: language === 'en'
                ? 'For a missed or overdue vaccination, contact your veterinarian and bring the saved vaccination history. The clinic needs to review the previous vaccines and your pet before deciding whether to resume or restart. I cannot choose a catch-up schedule or number of doses in chat.'
                : 'ถ้าลืมนัดหรือวัคซีนเลยกำหนด **ติดต่อสัตวแพทย์พร้อมประวัติวัคซีนที่มี** ค่ะ หมอต้องดูวัคซีนเดิมและข้อมูลน้องก่อนตัดสินใจว่าจะต่อหรือเริ่มใหม่ หนูไม่กำหนดตารางชดเชยหรือจำนวนเข็มผ่านแชทค่ะ',
            kind: 'out_of_scope', intent: 'medical:vet_vaccine_catchup', confidence: 1,
            suggestAgent: false, sources: [exports.CLINICAL_DECISION_SOURCES.vaccine],
        };
    }
    return null;
}
const MULTI_ILL_TH = /(?:เพิ่มทีละตัว|ป่วย.{0,12}(?:หลายตัว|ทุกตัว|ทั้งสอง|ทีละตัว)|(?:หลายตัว|ทุกตัว|ทั้งสอง).{0,24}(?:ป่วย|อาเจียน|ซึม|ถ่ายเหลว)|(?:ตัวอื่น|อีกตัว)ก็.{0,15}(?:ป่วย|อาเจียน|ซึม|ถ่ายเหลว))/;
const MULTI_ILL_EN = /\b(?:several|multiple|both|two|three|2|3)\b.{0,18}\b(?:cats|dogs|pets|animals)\b.{0,40}\b(?:vomit\w*|letharg\w*|ill|sick|diarrh\w*|symptoms?)\b/;
const ONE_ONLY_EN = /\b(?:only|just) (?:one|1)\b/;
/** Add multi-pet context after the urgent referral, never before it or instead of it. */
function withMultiPetIllnessContext(question, reply, language) {
    if (reply.kind !== 'emergency' && reply.kind !== 'out_of_scope')
        return reply;
    const q = String(question || '').normalize('NFC').toLowerCase();
    if (!MULTI_ILL_TH.test(q) && !(MULTI_ILL_EN.test(q) && !ONE_ONLY_EN.test(q)))
        return reply;
    const note = language === 'en'
        ? 'Tell the veterinary team how many animals are affected and each animal’s symptoms and when they started. Do not delay contacting the clinic while gathering this information; I cannot infer a shared cause.'
        : 'แจ้งทีมสัตวแพทย์ว่าป่วยกี่ตัว แต่ละตัวมีอาการอะไรและเริ่มเมื่อไรค่ะ ไม่ต้องรอเก็บข้อมูลครบก่อนติดต่อคลินิก หนูไม่สรุปว่ามีสาเหตุเดียวกันค่ะ';
    return { ...reply, text: `${reply.text}\n\n${note}`, suggestAgent: false };
}

},
"catNightVocalization":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.catNightVocalizationReply = catNightVocalizationReply;
// Merck, reviewed 2026-10-04: nocturnal activity/vocalization needs a
// behavioral history and medical causes excluded before behavior diagnosis.
// No inferred cause, sedatives, food restriction, or fixed recovery time.
const SOURCES = [
    'https://www.merckvetmanual.com/behavior/behavior-of-cats/behavior-problems-of-cats',
    'https://www.merckvetmanual.com/cat-owners/behavior-of-cats/diagnosing-behavior-problems-in-cats',
];
function catNightVocalizationReply(question, species, language = 'th') {
    const q = String(question || '').normalize('NFC').toLowerCase();
    const catMentioned = /แมว|\bcat\b|\bkitten\b/.test(q);
    if (!catMentioned && (species !== 'cat' || /หมา|สุนัข|\bdog\b/.test(q)))
        return null;
    if (!/ร้อง.{0,40}(?:กลางคืน|ทั้งคืน|ตอนดึก)|(?:กลางคืน|ทั้งคืน|ตอนดึก).{0,40}ร้อง|\b(?:meow\w*|yowl\w*|vocaliz\w*)\b.{0,50}\b(?:night|overnight)\b|\bnight\b.{0,50}\b(?:meow\w*|yowl\w*|vocaliz\w*)\b/.test(q))
        return null;
    return {
        text: language === 'en'
            ? 'Nighttime meowing can have several causes; I cannot identify the cause from chat. If this is new, worsening, or accompanied by changes in eating, drinking, or toileting, contact your veterinarian. Record when it happens and any routine changes. Check access to water, a litter box, and a comfortable resting area, and offer suitable play while your cat is awake. Avoid punishment. If it persists, ask your veterinarian for a behavior assessment.'
            : 'แมวร้องกลางคืนอาจมีหลายสาเหตุค่ะ หนูบอกสาเหตุจากแชทไม่ได้ ถ้าเพิ่งเริ่ม ร้องมากขึ้น หรือการกิน ดื่มน้ำ และขับถ่ายเปลี่ยนไป ให้ติดต่อสัตวแพทย์ค่ะ จดเวลาที่ร้องและสิ่งที่เปลี่ยนในกิจวัตร ตรวจว่ามีน้ำ กระบะทราย และที่พักสบาย พร้อมจัดกิจกรรมเล่นที่เหมาะสมช่วงน้องตื่น ไม่ดุหรือลงโทษ หากยังร้องต่อเนื่องให้ปรึกษาสัตวแพทย์เรื่องพฤติกรรมค่ะ',
        kind: 'guidance', intent: 'behavior:cat_night_vocalization', confidence: 0.85,
        suggestAgent: false, sources: SOURCES,
    };
}

},
"feedingManagement":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FEEDING_MANAGEMENT_SOURCES = void 0;
exports.feedingManagementReply = feedingManagementReply;
// Reviewed 2026-10-04 after actual native SOC11/SOC12 intent failures.
exports.FEEDING_MANAGEMENT_SOURCES = {
    feeding: 'https://catvets.com/resource/how-to-feed-how-to-feed-a-cat-consensus-statement/',
    weight: 'https://www.aaha.org/resources/weight-management/',
};
/** Household care guidance only: no diet, calorie, target-weight or BCS prescription. */
function feedingManagementReply(question, species, language) {
    const q = String(question || '').normalize('NFC').toLowerCase();
    const explicitOther = /หมา|สุนัข|กระต่าย|นก|\b(?:dog|puppy|rabbit|bird)s?\b/.test(q);
    if (/กระต่าย|นก|\b(?:rabbit|bird)s?\b/.test(q) && !/แมว|หมา|สุนัข|\b(?:cat|dog)s?\b/.test(q))
        return null;
    const cat = /แมว|\b(?:cat|kitten)s?\b/.test(q) || (species === 'cat' && !explicitOther);
    const recordRead = /(?:ประวัติ|บันทึก|กราฟ|แสดง|ล่าสุด|เท่าไหร่|เท่าไร)|\b(?:saved|recorded|history|records?|chart|graph|show|last|latest|how much does .{0,20}weigh)\b/.test(q);
    const asksPlan = /(?:ควร|ทำไง|ยังไง|วางแผน|ลดน้ำหนัก|จัดมื้อ)|\b(?:should|manage|management|plan|need|lose|loss|reduce|different|separate)\b/.test(q);
    if (recordRead && !asksPlan)
        return null;
    if (cat && /(?:หลายตัว|สองตัว|ทั้งสอง)|\b(?:several|multiple|both|two|three|2|3)\b/.test(q) &&
        /อาหาร|\b(?:foods?|diets?|feed\w*)\b/.test(q) && /อาหาร.{0,24}(?:ต่างกัน|คนละ|เฉพาะ|หมอสั่ง)|(?:หมอสั่ง|ต่างกัน|คนละ|เฉพาะ).{0,24}อาหาร|\b(?:different|prescribed|prescription|special)\b.{0,24}\b(?:foods?|diets?)\b|\b(?:foods?|diets?)\b.{0,24}\b(?:different|prescribed|prescription|special)\b|\bseparate (?:feed\w*|meals?)\b/.test(q)) {
        return {
            text: language === 'en'
                ? 'For cats with different prescribed foods, keep each cat on the diet agreed with its veterinarian. Use separate safe feeding spaces and supervise access so cats cannot eat each other’s food. Check and record what each cat actually eats. Ask the clinic before changing or sharing prescribed diets, and contact the veterinarian if a cat refuses food or its intake changes.'
                : 'ถ้าแมวแต่ละตัวกินอาหารที่หมอสั่งต่างกัน ให้ใช้อาหารตามแผนของสัตวแพทย์รายตัวค่ะ แยกพื้นที่กินที่ปลอดภัยและดูแลไม่ให้แย่งอาหารกัน เช็คและบันทึกว่าตัวไหนกินได้จริงเท่าไร ติดต่อคลินิกก่อนเปลี่ยนหรือใช้สูตรร่วมกัน ถ้ามีตัวไหนไม่กินหรือกินเปลี่ยนไปให้ติดต่อสัตวแพทย์ค่ะ',
            kind: 'guidance', intent: 'care:individual_prescribed_feeding', confidence: 1,
            suggestAgent: false, sources: [exports.FEEDING_MANAGEMENT_SOURCES.feeding, exports.FEEDING_MANAGEMENT_SOURCES.weight],
        };
    }
    if ((cat || species === 'dog' || /สุนัข|หมา|\bdogs?\b/.test(q)) &&
        /(?:ลดน้ำหนัก|คุมน้ำหนัก|ควบคุมน้ำหนัก)|\b(?:weight (?:management|loss|control)|lose weight|reduce weight|manage .{0,16}weight)\b/.test(q)) {
        return {
            text: language === 'en'
                ? 'Ask your veterinarian to assess the individual pet and agree a weight-management plan and target. A saved weight alone cannot determine body condition or a suitable diet. Follow the clinic’s portions and review plan; do not starve the pet or copy another pet’s diet. In a multi-pet home, supervise separate food access and track each pet’s actual intake and recorded weight over time. I cannot set calories or a target weight in chat.'
                : 'ให้สัตวแพทย์ประเมินน้องรายตัวและตกลงแผนควบคุมน้ำหนักกับเป้าหมายค่ะ น้ำหนักที่บันทึกเพียงอย่างเดียวบอกสภาพร่างกายหรือสูตรอาหารที่เหมาะไม่ได้ ทำตามปริมาณและแผนติดตามของคลินิก ไม่อดอาหารหรือใช้แผนของตัวอื่น ถ้าเลี้ยงหลายตัวให้แยกการเข้าถึงอาหารและติดตามปริมาณที่กินจริงกับน้ำหนักที่บันทึกของแต่ละตัว หนูไม่กำหนดแคลอรีหรือน้ำหนักเป้าหมายผ่านแชทค่ะ',
            kind: 'guidance', intent: 'care:vet_weight_management', confidence: 1,
            suggestAgent: false, sources: [exports.FEEDING_MANAGEMENT_SOURCES.weight],
        };
    }
    return null;
}

},
"catHouseholdCare":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CAT_HOUSEHOLD_SOURCES = void 0;
exports.catHouseholdCareReply = catHouseholdCareReply;
// Primary caregiver resources reviewed 2026-10-04 after actual SOC16-18 failures.
exports.CAT_HOUSEHOLD_SOURCES = {
    introduction: 'https://catfriendly.com/wp-content/uploads/2024/07/Step-by-Step-Handout_FINAL.pdf',
    litter: 'https://catfriendly.com/wp-content/uploads/2022/05/AAFPHouseSoilingBrochure.pdf',
    behavior: 'https://www.merckvetmanual.com/behavior/behavior-of-cats/behavior-problems-of-cats',
};
function catHouseholdCareReply(question, species, language) {
    const q = String(question || '').normalize('NFC').toLowerCase();
    if (!/แมว|\b(?:cat|kitten)s?\b/.test(q) && (species !== 'cat' || /หมา|สุนัข|กระต่าย|นก|\b(?:dog|rabbit|bird)s?\b/.test(q)))
        return null;
    const recordRead = /ประวัติ|บันทึก|กราฟ|\b(?:saved|recorded|records?|history|chart)\b/.test(q);
    const onlyRecordRequest = /^(?:แสดง|ดู(?:ประวัติ|บันทึก)|(?:show|list|get)\b)/.test(q) && !/\balso\b|แล้วถ้า|สมมติว่า/.test(q);
    if (recordRead && onlyRecordRequest)
        return null;
    // Match the care concern even when an identity/record clarification follows it.
    // Pure record questions still retain their existing data route.
    const explicitConcern = /ย้ายบ้าน|ลับเล็บ.{0,15}(?:โซฟา|เฟอร์นิเจอร์)|ข่วน.{0,15}(?:โซฟา|เฟอร์นิเจอร์)|(?:แมวเก่า|แมวใหม่).{0,25}ขู่|\b(?:mov(?:e|es|ing) (?:to |into )?(?:another |a new |new )?home|moving house|scratch\w*.{0,20}(?:sofa|furniture|couch)|hiss\w*)\b/.test(q);
    if (recordRead && !explicitConcern && !/ควร|ทำไง|ยังไง|ทำขั้น|เตรียมอะไร|\b(?:should|help|plan|hisses?|avoid\w*|difficult\w*|problem\w*)\b/.test(q))
        return null;
    let intent, text, source;
    if (/ย้ายบ้าน|\b(?:mov(?:e|es|ing) (?:to |into )?(?:another |a new |new )?home|moving house)\b/.test(q)) {
        intent = 'care:cat_moving_home';
        source = exports.CAT_HOUSEHOLD_SOURCES.behavior;
        text = language === 'en'
            ? 'Prepare a quiet safe room in the new home with familiar bedding, hiding places, clean water, food and litter. Let the cat explore gradually at its own pace, keep exits secure and preserve familiar routines. Do not force exploration or set a fixed settling deadline. Contact your veterinarian if eating, drinking, elimination or behavior changes persist or the cat seems unwell.'
            : 'เตรียมห้องปลอดภัยเงียบในบ้านใหม่ มีที่นอนคุ้นเคย ที่ซ่อน น้ำสะอาด อาหารและกระบะค่ะ ให้น้องค่อยสำรวจตามจังหวะของตัวเอง ดูแลประตูไม่ให้หลุดและรักษากิจวัตร ไม่บังคับหรือกำหนดวันปรับตัวตายตัว ถ้าการกิน ดื่ม ขับถ่ายหรือพฤติกรรมเปลี่ยนต่อเนื่องหรือดูป่วยให้ติดต่อสัตวแพทย์ค่ะ';
    }
    else if (/(?:ลับเล็บ|ข่วน).{0,15}(?:โซฟา|เฟอร์นิเจอร์)|\bscratch\w*\b.{0,20}\b(?:sofa|furniture|couch)\b/.test(q)) {
        intent = 'care:cat_scratching_outlets';
        source = exports.CAT_HOUSEHOLD_SOURCES.behavior;
        text = language === 'en'
            ? 'Offer stable scratching posts or pads with different surfaces near the furniture the cat scratches, and reward use of those outlets. Protect the sofa while the cat learns. Do not punish scratching or declaw the cat. If scratching changes abruptly, seems painful or causes injury, ask a veterinarian to assess the cat.'
            : 'วางเสาหรือแผ่นลับเล็บที่มั่นคงหลายพื้นผิวใกล้เฟอร์นิเจอร์ที่น้องข่วน ให้รางวัลเมื่อใช้และปกป้องโซฟาระหว่างเรียนรู้ค่ะ ไม่ทำโทษหรือถอนเล็บ ถ้าพฤติกรรมเปลี่ยนทันที ดูเจ็บหรือเกิดบาดแผลให้สัตวแพทย์ประเมินค่ะ';
        // Hissing alone (e.g. at the owner) is not an introduction problem; it falls through to
        // behavior.ts cat_aggression. Introduction needs a newcomer/other-cat context (gate case 14 Oct 2026).
        // "เพิ่ม pet ตัวใหม่ใช้ยังไง" / "สร้างโปรไฟล์แมวใหม่" is adding a profile in the app
        // (26 Oct 2026 app-help audit), not introducing a newcomer cat.
    }
    else if (/แมวใหม่|ตัวใหม่|สมาชิกใหม่|(?:แมวเก่า|แมวอีกตัว).{0,25}ขู่|ขู่.{0,25}(?:แมวเก่า|แมวอีกตัว)|\b(?:newcomer|resident|introduc\w*|new cat)\b|\bhiss\w*\b.{0,40}\b(?:other|new|resident) cat\b|\b(?:other|new|resident) cat\b.{0,40}\bhiss\w*/.test(q)
        && !(/(?:เพิ่ม|สร้าง|สมัคร|ลงทะเบียน|ใส่ข้อมูล|โปรไฟล์|\bpet\b|ในแอป|เข้าแอป|\bprofile\b)/.test(q) && !/ขู่|แนะนำตัว|เจอกัน|ทะเลาะ|เข้ากัน|ปรับตัว|แมวเก่า|ตัวเก่า|ห้องแยก|\b(?:introduc\w*|hiss\w*|resident)\b/.test(q))) {
        intent = 'care:cat_introduction';
        source = exports.CAT_HOUSEHOLD_SOURCES.introduction;
        text = language === 'en'
            ? 'Slow the introduction if either cat hisses or seems uncomfortable. Give the newcomer a separate safe room with its own food, water, litter and hiding places. Keep contact gradual and supervised; do not force them together or punish hissing. Move forward only when both are comfortable, with no fixed deadline. Ask your veterinarian about persistent conflict, and contact them promptly if either cat stops eating, is injured or develops illness signs.'
            : 'ถ้าแมวขู่หรือไม่สบายใจ ให้ชะลอการแนะนำตัวค่ะ จัดห้องปลอดภัยแยกให้น้องใหม่ มีอาหาร น้ำ กระบะทรายและที่ซ่อนของตัวเอง ค่อยเพิ่มการพบกันโดยดูแลใกล้ชิด ไม่บังคับให้เจอหรือทำโทษการขู่ เดินหน้าต่อเมื่อทั้งคู่สบายใจโดยไม่กำหนดวันตายตัว ถ้าขัดแย้งต่อเนื่องปรึกษาสัตวแพทย์ และติดต่อหมอโดยเร็วถ้าไม่กิน บาดเจ็บหรือมีอาการป่วยค่ะ';
    }
    else if (/น้ำพุ|\bfountain\b/.test(q)) {
        intent = 'care:cat_water_access';
        source = exports.CAT_HOUSEHOLD_SOURCES.introduction;
        text = language === 'en'
            ? 'A fountain does not need to be the only water source. Keep clean water bowls available in quiet, accessible, separated locations and let the cat choose; do not force use or remove familiar water access. Check what the cat actually drinks and any change in intake or urination. Contact your veterinarian promptly if the cat is not drinking, seems unwell or its drinking or urination changes.'
            : 'ไม่จำเป็นต้องให้น้ำพุเป็นแหล่งน้ำเดียวค่ะ จัดชามน้ำสะอาดในจุดเงียบ เข้าถึงได้และแยกหลายจุด ให้น้องเลือก ไม่บังคับหรือเอาแหล่งน้ำที่คุ้นเคยออก เช็คว่าดื่มได้จริงและการดื่มหรือปัสสาวะเปลี่ยนไปไหม ถ้าไม่ดื่ม ดูป่วย หรือดื่ม/ปัสสาวะเปลี่ยนไปให้ติดต่อสัตวแพทย์โดยเร็วค่ะ';
    }
    else if (/กระบะ|\blitter\s?box(?:es)?\b/.test(q) && /หลายตัว|ปัญหา|ลำบาก|ไม่ใช้|\b(?:several|multiple|difficult\w*|problem\w*|avoid\w*|won't use)\b/.test(q)) {
        intent = 'care:cat_litter_access';
        source = exports.CAT_HOUSEHOLD_SOURCES.litter;
        text = language === 'en'
            ? 'Observe the affected cat’s elimination and what changed separately; do not assume other cats share one cause. Provide clean litter boxes in separate quiet, accessible locations so another cat cannot block access, and avoid punishment. In a multi-cat home, provide one box per cat plus an extra. Arrange veterinary assessment for ongoing house-soiling or elimination changes. Straining with little or no urine needs emergency veterinary care immediately.'
            : 'สังเกตการขับถ่ายและสิ่งที่เปลี่ยนของน้องรายตัว ไม่สรุปว่าทุกตัวมีสาเหตุเดียวกันค่ะ จัดกระบะสะอาดแยกหลายจุดที่เงียบ เข้าถึงง่ายและไม่มีตัวอื่นขวาง ไม่ทำโทษ บ้านหลายตัวควรมีกระบะหนึ่งใบต่อตัวและเพิ่มอีกหนึ่งใบ ถ้าขับถ่ายนอกกระบะหรือการขับถ่ายเปลี่ยนต่อเนื่องให้สัตวแพทย์ประเมิน ถ้าเบ่งแล้วฉี่น้อยหรือไม่ออกให้ไปโรงพยาบาลสัตว์ฉุกเฉินทันทีค่ะ';
    }
    else
        return null;
    return { text, kind: 'guidance', intent, confidence: 1, suggestAgent: false, sources: [source] };
}

},
"socialSpeciesCare":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOCIAL_SPECIES_SOURCES = void 0;
exports.birdUrgencyReply = birdUrgencyReply;
exports.rabbitUrgencyReply = rabbitUrgencyReply;
exports.socialSpeciesCareReply = socialSpeciesCareReply;
const clinicalReportContext_1 = require("./clinicalReportContext");
exports.SOCIAL_SPECIES_SOURCES = {
    rabbit: 'https://www.merckvetmanual.com/all-other-pets/rabbits/digestive-disorders-of-rabbits',
    rabbitHome: 'https://www.rspca.org.uk/adviceandwelfare/pets/rabbits/indoors',
    bird: 'https://www.merckvetmanual.com/exotic-and-laboratory-animals/pet-birds/management-of-pet-birds',
    dogTraining: 'https://www.rspca.org.uk/adviceandwelfare/pets/dogs/training',
};
function birdUrgencyReply(question, language) {
    const q = question.toLowerCase();
    const observed = q.replace(/(?:ไม่ได้|ไม่มี|ไม่เคย)(?:มีอาการ)?(?:หายใจลำบาก|หายใจไม่ออก|หายใจไม่ทัน|หายใจอ้าปาก|อ้าปาก(?:เหมือน)?หายใจไม่ทัน)/g, '');
    if (!/(?:^|\s|น้อง|ลูก|เลี้ยง|ตอนนี้)นก|\b(?:bird|parrot|budgie|cockatiel)\b/.test(q) || !/หายใจ(?:ลำบาก|ไม่ออก|ไม่ทัน|อ้าปาก)|\b(?:struggl\w* (?:to breathe|breathing)|difficulty breathing|trouble breathing|cannot breathe|can't breathe|open[- ]mouth breathing|breath\w*.{0,35}mouth open)\b/.test(observed))
        return null;
    const hypothetical = /\bhypothetical\b|\bnot reporting (?:an? |the )?(?:actual )?event\b/.test(q) && !(0, clinicalReportContext_1.hasExplicitCurrentClinicalReport)(q);
    return { text: language === 'en'
            ? `${hypothetical ? 'If this hypothetical breathing difficulty occurs, a bird' : 'A bird'} struggling to breathe needs emergency veterinary attention now. Contact an avian veterinarian or emergency animal hospital immediately and tell them the bird is having difficulty breathing. Avoid unnecessary handling while arranging care. I cannot diagnose the cause or recommend medicines in chat.`
            : 'นกหายใจลำบากต้องให้สัตวแพทย์ดูฉุกเฉินตอนนี้ค่ะ **ติดต่อสัตวแพทย์ที่รับนกหรือโรงพยาบาลสัตว์ฉุกเฉินทันที** แจ้งว่าหายใจลำบาก ลดการจับที่ไม่จำเป็นระหว่างจัดการไปพบหมอ หนูไม่วินิจฉัยสาเหตุหรือแนะนำยาผ่านแชทค่ะ',
        kind: 'emergency', intent: 'other_species:bird_breathing', confidence: 1, suggestAgent: false, sources: [exports.SOCIAL_SPECIES_SOURCES.bird] };
}
function rabbitUrgencyReply(question, language) {
    const q = question.toLowerCase();
    if (!/กระต่าย|\b(?:rabbit|bunny)\b/.test(q) || !/ไม่อึ|อึไม่ออก|หยุดถ่าย|ไม่ถ่าย|\b(?:no (?:stool|droppings|poop)|not (?:pooping|defecating|eating)|stopped (?:eating|pooping|passing droppings)|hasn't (?:pooped|eaten))\b/.test(q))
        return null;
    return { text: language === 'en'
            ? 'Contact a veterinarian who treats rabbits now for urgent assessment if your rabbit has stopped passing droppings or eating. Tell them when the change began and what food, water and droppings you observed; do not delay to gather every detail. I cannot diagnose the cause or advise medicines or force-feeding in chat.'
            : 'กระต่ายไม่อึหรือหยุดกินควร **ติดต่อสัตวแพทย์ที่รับกระต่ายตอนนี้เพื่อประเมินเร่งด่วน** ค่ะ แจ้งเวลาที่เริ่มเปลี่ยน อาหาร น้ำและมูลที่สังเกตจริง ไม่ต้องรอเก็บรายละเอียดครบ หนูไม่วินิจฉัยสาเหตุหรือแนะนำยา/ฝืนป้อนอาหารผ่านแชทค่ะ',
        kind: 'emergency', intent: 'other_species:rabbit_digestive', confidence: 1, suggestAgent: false, sources: [exports.SOCIAL_SPECIES_SOURCES.rabbit] };
}
function socialSpeciesCareReply(question, species, language) {
    const q = question.toLowerCase();
    if (/กระต่าย|\b(?:rabbit|bunny)\b/.test(q) && /หลบ|ซ่อน|ไม่เล่น|เพิ่งมา|\b(?:hid\w*|new home|just arrived|settle|not playing)\b/.test(q) &&
        !/ไม่กิน|หยุดกิน|ไม่อึ|ซึม|เจ็บ|หายใจ|\b(?:not eating|won't eat|no droppings|pain|letharg\w*|breath\w*)\b/.test(q)) {
        return { text: language === 'en'
                ? 'For a newly arrived rabbit, provide a quiet safe enclosure with hiding places and familiar items, plus normal food and water access. Let it explore and approach at its own pace; do not chase it or force handling. Hiding alone cannot tell me whether it is afraid or ill. Watch actual eating, drinking and droppings; contact a rabbit veterinarian promptly for changes, and urgently if it stops eating or passing droppings.'
                : 'กระต่ายเพิ่งมาอยู่ควรมีพื้นที่ปลอดภัยเงียบ มีที่ซ่อนและของคุ้นเคย พร้อมอาหารกับน้ำที่เข้าถึงได้ค่ะ ให้น้องสำรวจและเข้าหาตามจังหวะของตัวเอง ไม่ไล่จับหรือฝืนอุ้ม การหลบอย่างเดียวบอกไม่ได้ว่ากลัวหรือป่วย ให้ดูการกิน ดื่มและมูลจริง ถ้าเปลี่ยนไปให้ติดต่อหมอที่รับกระต่ายโดยเร็ว ถ้าหยุดกินหรือไม่อึให้ติดต่อเร่งด่วนค่ะ',
            kind: 'guidance', intent: 'care:rabbit_new_home', confidence: 1, suggestAgent: false, sources: [exports.SOCIAL_SPECIES_SOURCES.rabbitHome] };
    }
    if ((/หมา|สุนัข|\bdogs?\b/.test(q) || (species === 'dog' && !/แมว|กระต่าย|\b(?:cat|rabbit)\b/.test(q))) &&
        /ดึงสาย|ดึงเชือก|หลุดสาย|หลุดสายรัด|\b(?:pulls?|pulling|escap\w*)\b/.test(q) && /สาย|เดิน|\b(?:harness|lead|leash|walk\w*)\b/.test(q)) {
        return { text: language === 'en'
                ? 'If the dog escapes the harness, pause walks using that equipment and ask a qualified professional to check its fit and security before going near traffic. Practise walking calmly in a safe enclosed area, reward a loose lead and use short gradual sessions. Do not jerk the lead or punish pulling. Seek a qualified reward-based trainer for persistent pulling or escape; contact a veterinarian if pain or breathing changes occur.'
                : 'ถ้าน้องหลุดสายรัด ให้พักการเดินด้วยอุปกรณ์นั้นและให้ผู้เชี่ยวชาญตรวจความพอดีกับความปลอดภัยก่อนเข้าใกล้ถนนค่ะ ฝึกเดินสงบในพื้นที่ปิดปลอดภัย ให้รางวัลตอนสายไม่ตึงและฝึกสั้นๆ ค่อยเพิ่ม ไม่กระชากสายหรือทำโทษการดึง ถ้าดึงหรือหลุดต่อเนื่องปรึกษาครูฝึกที่ใช้รางวัล ถ้ามีอาการเจ็บหรือหายใจเปลี่ยนให้ติดต่อสัตวแพทย์ค่ะ',
            kind: 'guidance', intent: 'care:dog_loose_lead', confidence: 1, suggestAgent: false, sources: [exports.SOCIAL_SPECIES_SOURCES.dogTraining] };
    }
    return null;
}

},
"costs":function(require,module,exports){
"use strict";
// lib/smartBot/costs.ts
// ─────────────────────────────────────────────────────────────────────────
// "ค่ารักษา/ค่าเลี้ยงเท่าไหร่" — กลุ่มคำถามที่เจอบ่อยเป็นอันดับต้น ๆ ในคลังจริง
// (15 ข้อจาก 250 · ดู docs/SmartBot-Training-Round2-2569-09-01.md)
//
// ⚠️ ไฟล์นี้ **ไม่ตอบเป็นตัวเลข** โดยตั้งใจ และห้ามมีใครมาเติมตัวเลขทีหลัง
//    เหตุผล:
//      1) ราคาสัตวแพทย์ไทยไม่มีแหล่งกลางที่อ้างอิงได้ — ต่างกันตามจังหวัด สถานพยาบาล
//         น้ำหนักตัว วิธีดมยา และรายการที่รวม/ไม่รวม
//      2) กฎเหล็กของโปรเจกต์คือ "ห้ามเดา" — ตัวเลขที่เดามาแล้วผู้ใช้เอาไปวางแผนจริง
//         คือความเสียหายที่ย้อนกลับมาที่แอป
//      3) ราคาเปลี่ยนตลอด ฝังไว้ในโค้ดวันหนึ่งก็ผิดวันถัดไป
//
//    ⚠️ ถ้าวันหนึ่งอยากตอบเป็นตัวเลขจริง ๆ ต้องมี "ตารางราคาที่แอปเก็บเอง"
//       (เช่น ราคาที่คลินิกพาร์ตเนอร์แจ้งไว้ + วันที่อัปเดต) ไม่ใช่ค่าคงที่ในไฟล์นี้
//
// สิ่งที่ไฟล์นี้ทำแทน: บอกตรง ๆ ว่าไม่รู้ + บอกวิธีหาคำตอบที่ใช้ได้จริงใน 5 นาที
// ─────────────────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.PET_LIVING_COST_ANSWER = exports.COST_ANSWER = void 0;
exports.isPetLivingCostQuestion = isPetLivingCostQuestion;
exports.isCostQuestion = isCostQuestion;
/**
 * ต้องเป็นคำถาม "ราคา/ค่าใช้จ่าย" จริง ๆ
 *
 * ⚠️ ห้ามใช้ /เท่าไห?ร่/ ลอย ๆ เด็ดขาด
 *    "น้ำหนักเท่าไหร่" · "ให้ยาไปกี่ครั้ง" คือคำถามขอดูบันทึกในแอป (intents.ts)
 *    ถ้าจับกว้างเกินจะไปขโมยคำถามพวกนั้นมาตอบเรื่องเงิน
 */
// ⚠️ กับดักภาษาไทย (เจอจริงตอนรันเทสรอบเทรน 2 — ห้ามถอยกลับ)
//    ห้ามใส่ /งบ/ ลอย ๆ เด็ดขาด เพราะคำว่า "ยังไงบ้าง" มี "งบ" ซ่อนอยู่ตรงกลาง
//      (ยั-ง-ไ-ง-บ-้-า-ง)  → "วิธีอาบน้ำหมา มีขั้นตอนยังไงบ้าง" เคยถูกตอบเป็นคำถามราคา
//    ต้องผูก "งบ" กับคำข้างเคียงเสมอ
const MONEY_WORD = /(ราคา|ค่าใช้จ่าย|ค่ารักษา|ค่าหมอ|ค่าวัคซีน|ค่าทำหมัน|ค่าอาหาร|ค่าฝาก|ค่าเลี้ยง|กี่บาท|เท่าไห?ร่บาท|งบประมาณ|งบเท่าไห?ร่|มีงบ|ตั้งงบ|เรื่องเงิน|เตรียมเงิน|แพงไหม|แพงมั้ย|แพงกว่า|ถูกกว่า|จ่ายจริง|หมดเงิน|หมดค่า)/;
/** ต้องมีบริบทว่ากำลังพูดถึงสัตว์เลี้ยง/บริการสัตวแพทย์ ไม่ใช่ราคาของทั่วไป */
const PET_CONTEXT = /(หมา|สุนัข|แมว|น้อง|สัตว์เลี้ยง|ทำหมัน|วัคซีน|เห็บ|หมัด|ถ่ายพยาธิ|คลินิก|โรงพยาบาลสัตว์|รพ\.?สัตว์|เลี้ยง|อาหารเม็ด|อาหารเปียก|ฝากเลี้ยง|อาบน้ำ|ตัดขน)/;
exports.COST_ANSWER = '💰 เรื่อง **ราคา หนูตอบเป็นตัวเลขให้ไม่ได้จริง ๆ ค่ะ** — และหนูเลือกที่จะไม่เดา\n\n' +
    'ค่ารักษาสัตว์ในไทยไม่มีราคากลาง ต่างกันได้หลายเท่าตัวจาก:\n' +
    '• **จังหวัด/ทำเล** และประเภทสถานพยาบาล (คลินิก · โรงพยาบาลเอกชน · โรงพยาบาลสัตว์ของคณะสัตวแพทย์)\n' +
    '• **น้ำหนักตัว** ของน้อง (ยาและยาสลบคิดตามน้ำหนัก)\n' +
    '• **สิ่งที่รวมอยู่ในราคา** — ค่าตรวจก่อนผ่า ค่าเลือด ค่ายากลับบ้าน ค่าปลอกคอกันเลีย ' +
    'บางที่รวม บางที่แยกบิล\n' +
    '• ราคาที่ใครสักคนโพสต์ไว้เมื่อปีก่อน มักใช้ไม่ได้แล้วในวันนี้\n\n' +
    '☎️ **วิธีได้ตัวเลขจริงใน 5 นาที**\n' +
    'โทรถามคลินิกใกล้บ้าน 2–3 ที่ แล้วถามให้ตรงแบบนี้ค่ะ\n' +
    '1. "น้องหนัก ___ กก. อายุ ___ ทำ ___ ราคาเท่าไหร่คะ"\n' +
    '2. **"ราคานี้รวมอะไรบ้าง มีอะไรที่ต้องจ่ายเพิ่มไหม"** ← ข้อนี้สำคัญที่สุด\n' +
    '3. "ต้องนัดล่วงหน้าไหม ต้องอดน้ำอดอาหารก่อนไหม"\n\n' +
    '💡 ถ้ากังวลเรื่องงบ ลองถามคลินิกด้วยว่ามี**หน่วยทำหมัน/วัคซีนเคลื่อนที่**ในพื้นที่ช่วงไหน — ' +
    'หลายจังหวัดมีจัดเป็นรอบ ๆ ค่ะ\n\n' +
    'หนูช่วยได้ตรงนี้: **ค้นหาคลินิกใกล้ตัว ดูเบอร์และแผนที่** แล้วคุณโทรสอบถามราคาและนัดหมายกับร้านเองได้ค่ะ 🐾';
exports.PET_LIVING_COST_ANSWER = '💰 ค่าเลี้ยงน้องต่างกันตามอาหาร ขนาดตัว และของใช้ค่ะ หนูไม่มีรายจ่ายจริงของบ้านคุณ จึงไม่เดาเป็นตัวเลขนะคะ\n\n' +
    'ลองแยกงบเป็นค่าอาหาร ของใช้ประจำ และเงินสำรองสำหรับการพบสัตวแพทย์ แล้วจดรายจ่ายจริงแต่ละเดือน ' +
    'จะเห็นค่าเฉลี่ยที่ใช้วางแผนกับน้องของคุณได้ค่ะ';
/** แยกค่าดูแลประจำจากค่ารักษาหรือค่าบริการครั้งเดียว */
function isPetLivingCostQuestion(text) {
    const q = String(text || '').toLowerCase();
    if (!isCostQuestion(q))
        return false;
    const monthly = /(ต่อเดือน|เดือนละ|เดือนๆ|เดือนหนึ่ง|รายเดือน)/.test(q) &&
        /(ค่าใช้จ่าย|ค่าเลี้ยง|ค่าอาหาร|จ่ายจริง|หมดค่า|หมดเงิน)/.test(q);
    const living = /(ค่าใช้จ่าย|ค่าเลี้ยง).{0,18}(?:ในการเลี้ยง|เลี้ยงแมว|เลี้ยงหมา|เลี้ยงสุนัข)/.test(q);
    return monthly || living;
}
/** จับคำถามราคา — ต้องเจอทั้งคำเรื่องเงิน และบริบทสัตว์เลี้ยง */
function isCostQuestion(text) {
    const q = String(text || '').toLowerCase();
    if (!q)
        return false;
    return MONEY_WORD.test(q) && PET_CONTEXT.test(q);
}

},
"services":function(require,module,exports){
"use strict";
// lib/smartBot/services.ts
// ─────────────────────────────────────────────────────────────────────────
// "แอปนี้มีบริการ ___ ไหม" — คำถามเรื่อง **ความสามารถของแอป** ไม่ใช่คำถามการแพทย์
// (5 ข้อจากคลังจริง 250 ข้อ · ดู docs/SmartBot-Training-Round2-2569-09-01.md)
//
// ⚠️ กฎเหล็กของไฟล์นี้: **ห้ามโฆษณาเกินจริงเด็ดขาด**
//    ไฟล์นี้เป็นที่เดียวในบอตที่พูดถึง "สิ่งที่แอปทำได้" ถ้าเขียนเกินจริง
//    ผู้ใช้จะไปกดหาแล้วไม่เจอ → เสียความเชื่อถือทั้งแอป
//    ทุกประโยคที่บอกว่า "แอปทำได้" ต้องชี้ไปที่หน้าจอที่มีอยู่จริงในโค้ดวันนี้
//
// ขอบเขต 13 ก.ย. 2569: ค้นหาสถานที่ ดูแผนที่/เบอร์ และลูกค้าโทรติดต่อเอง
// ไม่มีร้านคู่สัญญาหรือการยืนยันจองจากร้านในแอป
//
// ❌ สิ่งที่แอป **ไม่มี** (ห้ามบอกว่ามี):
//    • ไม่มีสัตวแพทย์เวรตอบแชต 24 ชม. — บอตตัวนี้ไม่ใช่หมอ และ Agent ก็ไม่ใช่หมอ
//    • ไม่มีบริการ Pet Taxi รับ-ส่ง
//    • ไม่มีระบบเปรียบเทียบ/ขายประกันสัตว์เลี้ยง
// ─────────────────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.SERVICE_RULES = void 0;
exports.matchService = matchService;
exports.SERVICE_RULES = [
    {
        id: 'nearby_search',
        labelTh: 'ค้นหาสถานที่ใกล้ตัว',
        patterns: [
            /(แนะนำ|ช่วยหา|หาร้าน).{0,12}ร้าน.{0,12}(ใกล้ฉัน|ใกล้บ้าน|ใกล้ตัว|แถวนี้|ใกล้)/,
            /(ใกล้ฉัน|ใกล้บ้าน|ใกล้ตัว|แถวนี้).{0,12}ร้าน/,
            /(แนะนำ|หาร้าน|หารพ|หาคลินิก|ช่วยหา|มี).{0,18}(คลินิก|โรงพยาบาลสัตว์|ร้านสัตว์|ร้านอาบน้ำ|กรูมมิ่ง|ฝากเลี้ยง).{0,18}(ใกล้ฉัน|ใกล้บ้าน|ใกล้ตัว|แถวนี้|ใกล้)/,
            /(คลินิก|โรงพยาบาลสัตว์|ร้านสัตว์|ร้านอาบน้ำ|กรูมมิ่ง|ฝากเลี้ยง).{0,18}(ใกล้ฉัน|ใกล้บ้าน|ใกล้ตัว|แถวนี้|ใกล้)/,
            /(ใกล้ฉัน|ใกล้บ้าน|ใกล้ตัว|แถวนี้).{0,18}(คลินิก|โรงพยาบาล|ร้าน|กรูมมิ่ง)/,
            /(คลินิก|โรงพยาบาลสัตว์|ร้านสัตว์|ร้านอาบน้ำ|กรูมมิ่ง).{0,12}แผนที่/,
            /แผนที่.{0,12}(คลินิก|โรงพยาบาลสัตว์|ร้านสัตว์|ร้านอาบน้ำ|กรูมมิ่ง)/,
            /(?:หา|อยากหา|ช่วยหา).{0,14}(?:ร้าน)?(?:อาบน้ำ|ตัดขน|กรูมมิ่ง).{0,24}(ใกล้ฉัน|ใกล้บ้าน|ใกล้ตัว|แถวนี้|ใกล้)/,
        ],
        answerTh: 'ได้ค่ะ แอปช่วยค้นหาคลินิก/โรงพยาบาลสัตว์หรือร้านบริการใกล้ตัวได้ โดยเปิดหน้าค้นหาสถานที่แล้วเลือกหมวดที่ต้องการ จากนั้นดูแผนที่และเบอร์โทรเพื่อโทรสอบถามเวลาเปิดบริการและรายละเอียดกับร้านโดยตรงนะคะ แอปไม่ได้ยืนยันคิวหรือจองแทนร้านค่ะ',
    },
    {
        // S062 "มีบริการฉุกเฉินตลอด 24 ชั่วโมงไหม"
        // ⚠️ ข้อนี้ติดป้าย emergency ในคลังคำถาม และเดิม "ตกไป handoff" คือบอตเงียบ
        //    คนถามข้อนี้มักกำลังจะมีเรื่องด่วน ปล่อยเงียบคือแย่ที่สุด
        id: 'emergency_24h',
        labelTh: 'บริการฉุกเฉิน 24 ชั่วโมง',
        patterns: [
            /(ฉุกเฉิน|เร่งด่วน|ด่วน).{0,10}(24|ยี่สิบสี่).{0,6}(ชม|ชั่วโมง)/,
            /(24|ยี่สิบสี่).{0,4}(ชม|ชั่วโมง).{0,10}(ฉุกเฉิน|เปิด|บริการ|รับ)/,
            /(มี|หา|อยากได้).{0,10}(รพ|โรงพยาบาล|คลินิก).{0,10}(24|ฉุกเฉิน)/,
            /(รพ|โรงพยาบาล|คลินิก).{0,8}(เปิด)?.{0,4}(24|ยี่สิบสี่).{0,4}(ชม|ชั่วโมง)/,
            /(กลางคืน|ดึก|ตีสาม|ตีสอง|เที่ยงคืน).{0,12}(หาหมอ|พาไปหาหมอ|คลินิก|รพ|โรงพยาบาล).{0,8}(ไหน|ที่ไหน|ยังไง)/,
        ],
        answerTh: '🚨 **แอปนี้ไม่ใช่สถานพยาบาลค่ะ** — ไม่มีสัตวแพทย์เวรนั่งตอบแชต 24 ชั่วโมง ' +
            'และหนูก็ไม่ใช่หมอนะคะ หนูรักษาหรือสั่งยาแทนไม่ได้เลย\n\n' +
            '**แต่แอปช่วยให้เจอที่รักษาได้เร็วขึ้นค่ะ** — เปิดส่วนค้นหาสถานที่แล้วเลือก ' +
            '**คลินิก/โรงพยาบาลสัตว์** ตรวจข้อมูลเวลาเปิดและโทรยืนยันว่ายังรับฉุกเฉินก่อนเดินทาง ' +
            'ดูแผนที่และเบอร์โทรเพื่อติดต่อสถานพยาบาลเองได้ค่ะ\n\n' +
            '💡 **สิ่งที่อยากให้ทำวันนี้ ตอนที่ยังไม่มีเรื่องด่วน**\n' +
            'หาโรงพยาบาลสัตว์ 24 ชม. ที่ใกล้บ้านที่สุดไว้ล่วงหน้า **แล้วเซฟเบอร์ไว้ในมือถือ** ' +
            'ตอนเกิดเรื่องจริงตอนตีสาม จะไม่มีเวลามานั่งหาค่ะ\n\n' +
            '📞 และก่อนออกจากบ้าน **โทรบอกเขาก่อนเสมอ**ว่ากำลังพาอะไรไป มีอาการอะไร — ' +
            'เขาจะได้เตรียมของรอ และจะได้ยืนยันว่าคืนนี้มีหมออยู่จริง',
    },
    {
        // S174 "มีบริการ Telemedicine ปรึกษาหมอออนไลน์ไหม"
        // ⚠️ ห้ามให้ผู้ใช้เข้าใจผิดว่าแชตในแอป (ทั้งบอตและ Agent) คือการปรึกษาสัตวแพทย์
        //    นี่คือประเด็นความรับผิดทางกฎหมาย ไม่ใช่แค่เรื่องความสุภาพ
        id: 'telemedicine',
        labelTh: 'ปรึกษาสัตวแพทย์ออนไลน์',
        patterns: [
            /telemedicine|เทเลเมด/,
            /(ปรึกษา|คุยกับ|ถาม).{0,10}(หมอ|สัตวแพทย์).{0,10}(ออนไลน์|ผ่านแอป|ทางไกล|วิดีโอ|วีดีโอ)/,
            /(หมอ|สัตวแพทย์).{0,6}(ออนไลน์|ตัวจริง).{0,10}(ไหม|มั้ย|มีไหม)/,
            /(วิดีโอคอล|วีดีโอคอล|วิดีโอ ?call).{0,10}(หมอ|สัตวแพทย์)/,
        ],
        answerTh: '**แอปนี้ยังไม่มีบริการปรึกษาสัตวแพทย์ตัวจริงแบบออนไลน์ค่ะ** — ขอบอกตรง ๆ ไม่อ้อมค้อม\n\n' +
            '⚠️ และอยากให้ชัดเจนมาก ๆ ว่า **หนู (แชตในแอป) ไม่ใช่สัตวแพทย์** ' +
            'ไม่ว่าจะเป็นโหมดฟรีหรือโหมด Agent ก็ตาม — การคุยกับหนู**ไม่นับเป็นการปรึกษาหมอ** ' +
            'และไม่ควรใช้แทนการพาน้องไปตรวจค่ะ\n\n' +
            '**สิ่งที่ได้ผลกว่าและทำได้เลยตอนนี้:**\n' +
            '• **โทรหาคลินิกที่น้องเคยไปรักษา** — เขามีประวัติน้องอยู่แล้ว หลายที่ยินดีให้คำแนะนำเบื้องต้นทางโทรศัพท์\n' +
            '• คลินิกหลายแห่งมี LINE ให้ส่งรูป/คลิปไปถามได้\n' +
            '• ในหน้าค้นหาสถานที่มีคลินิกใกล้ตัวพร้อมเบอร์โทร กดโทรได้เลยค่ะ\n\n' +
            '💡 สิ่งที่หนูช่วยได้จริงคือ **เตรียมข้อมูลให้พร้อมก่อนคุยกับหมอ** — ' +
            'บันทึกอาการ วันที่เริ่มเป็น น้ำหนัก ยาที่ให้อยู่ ถ่ายรูป/คลิปเก็บไว้ ' +
            'หมอจะวินิจฉัยได้แม่นขึ้นมากค่ะ 🐾',
    },
    {
        // S037 "มีบริการ Pet Taxi รับ-ส่งสัตว์เลี้ยงไหม"
        id: 'pet_taxi',
        labelTh: 'บริการรับ-ส่งสัตว์เลี้ยง',
        patterns: [
            /pet ?taxi|เพ็ท ?แท็กซี่|pettaxi/,
            /(รับ-?ส่ง|รับส่ง|ขนส่ง|เรียกรถ).{0,10}(สัตว์เลี้ยง|หมา|แมว|น้อง)/,
            /(แท็กซี่|taxi|รถ).{0,10}(รับ|พา).{0,6}(สัตว์|หมา|แมว|น้อง)/,
        ],
        answerTh: '**แอปนี้ยังไม่มีบริการ Pet Taxi รับ-ส่งค่ะ** — ยังไม่มีจริง ๆ ไม่อยากให้เข้าใจผิดแล้วไปหาในแอปนะคะ\n\n' +
            '**ทางที่พอช่วยได้:**\n' +
            '• **ถามคลินิก/โรงพยาบาลสัตว์ที่จะไปก่อน** — บางแห่งมีรถรับ-ส่งของตัวเอง หรือมีเบอร์คนขับที่เขาใช้ประจำแนะนำให้\n' +
            '• ร้านอาบน้ำ-ตัดขนหลายร้านมีบริการรับ-ส่งด้วย\n' +
            '• ถ้าเรียกรถทั่วไป ควร**แจ้งคนขับก่อนตอนจอง**ว่ามีสัตว์เลี้ยงไปด้วย และควรอยู่ในกรง/กระเป๋าเสมอ ' +
            'ทั้งเพื่อความปลอดภัยของน้องเองและเพื่อไม่ให้ถูกปฏิเสธกลางทาง\n\n' +
            '🐾 ค้นหาคลินิกใกล้ตัวแล้วใช้เบอร์โทรติดต่อถามเรื่องรถรับ-ส่งเองได้ค่ะ',
    },
    {
        // S025 / S038 — ถามว่าประกันสัตว์เลี้ยงเจ้าไหนดี / เคลมเร็วไหม
        // ⚠️ ห้ามเอ่ยชื่อบริษัท ห้ามเปรียบเทียบ ห้ามบอกเบี้ย — แอปไม่ได้ขายประกัน
        //    และไม่มีข้อมูลที่อ้างอิงได้ว่าเจ้าไหนเคลมเร็วกว่าเจ้าไหน (กฎห้ามเดา)
        id: 'pet_insurance',
        labelTh: 'ประกันสัตว์เลี้ยง',
        patterns: [
            /ประกัน.{0,10}(สัตว์เลี้ยง|หมา|แมว|น้อง)/,
            /(สัตว์เลี้ยง|หมา|แมว).{0,10}ประกัน.{0,10}(ไหน|เจ้าไหน|บริษัทไหน|ดีไหม|คุ้มไหม)/,
            /(เคลม|เครม).{0,12}ประกัน.{0,12}(สัตว์|หมา|แมว|น้อง)/,
            /ประกัน.{0,14}(เคลม|เครม).{0,10}(เร็ว|ช้า|ยาก|ง่าย)/,
        ],
        answerTh: '**หนูแนะนำบริษัทประกันให้ไม่ได้ค่ะ** — แอปไม่ได้ขายประกัน และหนูไม่มีข้อมูลที่เชื่อถือได้ว่า ' +
            'เจ้าไหนเคลมเร็วกว่าเจ้าไหน ถ้าเดาแล้วคุณเสียเงินจริงตามที่หนูเดา นั่นไม่โอเคเลยค่ะ\n\n' +
            '💡 แต่ขอแลกเป็น **สิ่งที่ควรอ่านให้ละเอียดก่อนเซ็นทุกเจ้า** นะคะ — ส่วนใหญ่คนพลาดตรงนี้:\n' +
            '• **โรคที่เป็นมาก่อนทำประกัน (pre-existing)** — เกือบทุกกรมธรรม์ไม่คุ้มครอง ' +
            'ถ้าน้องเคยรักษาอะไรมาแล้ว ต้องถามให้ชัดว่าจะถูกยกเว้นไหม\n' +
            '• **ระยะรอคอย (waiting period)** — ทำวันนี้มักยังเคลมไม่ได้ทันที\n' +
            '• **ข้อยกเว้น** — ทำหมัน วัคซีน ขูดหินปูน ตั้งท้อง โรคทางพันธุกรรมของสายพันธุ์ มักไม่รวม\n' +
            '• **วงเงินต่อครั้ง / ต่อปี** และ **ส่วนที่เราต้องร่วมจ่ายเอง**\n' +
            '• **ช่วงอายุที่รับทำ และรับต่ออายุถึงกี่ปี** — หลายเจ้าไม่ต่อให้ตอนน้องแก่ ' +
            'ซึ่งเป็นช่วงที่ค่ารักษาแพงที่สุดพอดี\n' +
            '• **ต้องสำรองจ่ายก่อนไหม** หรือเคลมตรงกับโรงพยาบาลในเครือได้เลย\n\n' +
            '📄 ขอ**กรมธรรม์ฉบับเต็ม**มาอ่านก่อนตัดสินใจเสมอ อย่าดูแค่โบรชัวร์นะคะ 🐾',
    },
];
/**
 * จับคำถาม "แอปมีบริการ ___ ไหม"
 *
 * ⚠️ ต้องรันหลังฉุกเฉินและหลังกำแพงกันตอบเกินขอบเขตเสมอ
 *    "แมวชักเกร็ง ตีสามจะพาไปไหน" ต้องได้คำเตือนฉุกเฉินก่อน ไม่ใช่ข้อมูลบริการ
 */
function matchService(text) {
    const q = String(text || '').toLowerCase();
    if (!q)
        return null;
    for (const rule of exports.SERVICE_RULES) {
        for (const p of rule.patterns) {
            if (p.test(q))
                return { rule };
        }
    }
    return null;
}

},
"appHelp":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isClinicalDosingQuestion = isClinicalDosingQuestion;
exports.scoreAppHelpFallback = scoreAppHelpFallback;
exports.appHelpMenu = appHelpMenu;
exports.matchAppHelp = matchAppHelp;
const appHelpContent_1 = require("./appHelpContent");
const food_1 = require("./food");
const guard_1 = require("./guard");
const services_1 = require("./services");
const emergency_1 = require("./emergency");
const FREE_FOOTER = '\n\nถ้าบอกว่าติดอยู่หน้าจอไหน หนูจะบอกขั้นถัดไปให้ได้ค่ะ';
// Specific topics first. app_overview is last so "มือใหม่ … เพิ่มยายังไง" gets the
// medicine steps instead of the generic overview (26 Oct 2026).
const HELP_PRIORITY = [
    'reminder_troubleshoot', 'save_problem', 'medicine_history', 'medicine_manage', 'account_delete', 'unavailable_features', 'buddy', 'camera_ai', 'tutorial', 'appointment_manage', 'appointments', 'pet_card', 'certificates', 'privacy', 'switch_pet', 'location_permission', 'nearby_vet', 'medicine', 'notification_settings', 'quick_records', 'vaccine', 'health_history', 'weight', 'activity', 'records', 'add_pet',
    'password_reset', 'membership', 'auth_register', 'delete_pet', 'edit_pet', 'language_settings',
    'chat_context', 'chat_mode', 'paw_coin', 'referral', 'date_time_pickers', 'app_overview',
];
const rank = (id) => { const at = HELP_PRIORITY.indexOf(id); return at < 0 ? HELP_PRIORITY.length : at; };
// "ยา" without the words ยาก/ยาว/ยาง/ยาม(but ยามา)/ยาย(grandma)/ยาน — Thai has no spaces, so
// "เพิ่มยายังไง" must still read as เพิ่ม + ยา + ยังไง (ยา + ย followed by ั is allowed).
const MED = String.raw `(?:ยา(?!ก|ว|ง|ม(?!า)|ย(?!ั)|น(?!้ำ))|อาหารเสริม|medicine|medication)`;
// A how/where cue that makes a short Thai action phrase an app instruction request.
const HOW_TH = String.raw `(?:ยังไง|ทำไง|ไง|อย่างไร|ตรงไหน|ที่ไหน|อยู่ไหน|หน้าไหน|เมนูไหน|ปุ่มไหน|กดอะไร|ในแอป|เข้าแอป|ในระบบ|เข้าระบบ|ไม่เป็น)`;
const re = (source) => new RegExp(source, 'i');
// Dose amounts or a request to change, stop or start a medicine on one's own is a
// clinical decision for the guard, not an app instruction — unless the user names an
// app control (e.g. "ช่องขนาดยาในแอปกรอกยังไง").
const DOSE_AMOUNT = /\d+(?:[.,]\d+)?\s*(?:เม็ด|ซีซี|cc|มล|ml|มก|mg|หยด|ช้อน|แคปซูล|หลอด|ยูนิต|units?\b|iu\b)|ครึ่ง(?:เม็ด|หนึ่ง|ซอง|ช้อน|ขวด|โดส)|ทีละครึ่ง|แบ่ง(?:ยา|เม็ด)|แบ่ง.{0,8}ครึ่ง|หัก(?:ยา|เม็ด)|บด(?:ยา|เม็ด)|(?:สอง|2)\s*เท่า|กี่(?:เม็ด|หยด|ซีซี|cc|มล|มิล|ช้อน|โดส)|ขนาดยา(?:เท่า|ที่ควร|ที่เหมาะ)|โดส/i;
const DOSE_PERMISSION = /(?:เพิ่ม|ลด|หยุด|เลิก|งด|เปลี่ยน|ให้|ใช้|กิน|เติม)(?:ให้|การ)?\s*ยา(?!ก|ว|ง|ม|ย(?!ั)).{0,16}(?:ได้ไหม|ได้มั้ย|ได้หรือ(?:เปล่า|ไม่)|ได้รึเปล่า|ดีไหม|ดีมั้ย|ดีกว่า|ควร|เอง|มากขึ้น|น้อยลง|เยอะขึ้น|เพิ่มขึ้น|ลดลง)|(?:ควร|ต้อง).{0,10}(?:เพิ่ม|ลด|หยุด|เลิก|เปลี่ยน)(?:ให้)?ยา/;
// "เพิ่มยาเป็นวันละ 3 ครั้งได้มั้ย" / "ให้ยา 2 เม็ด" — a changed frequency or a number of units is a dose decision.
const DOSE_FREQUENCY = /(?:เพิ่ม|ลด|เปลี่ยน|ปรับ|ให้|กิน|ป้อน)(?:ให้|การ)?\s*(?:กิน|ให้)?\s*ยา(?!ก|ว|ง|ม(?!า)|ย(?!ั)).{0,14}(?:วันละ|ทุก)\s*(?:\d+|หนึ่ง|สอง|สาม|สี่|ห้า)\s*(?:ครั้ง|มื้อ|ชั่วโมง|ชม)|(?:เพิ่ม|ลด)(?:เป็น|เหลือ)\s*(?:วันละ|ทุก)\s*(?:\d+|สอง|สาม|สี่)/;
// "ให้ยาแค่ครึ่งเดียว / บางส่วน / 1/4 เม็ด" — giving part of a tablet is a dose decision (26 Oct 2026 round 5).
const DOSE_PART = /ยา(?!ก|ว|ง|ม|ย(?!ั)).{0,24}(?:ครึ่งเดียว|แค่ครึ่ง|ครึ่ง\s?ๆ|บางส่วน|ส่วนหนึ่ง|เศษ\s?(?:หนึ่ง|1)\s?ส่วน|หนึ่งในสี่|เสี้ยว|\d\s*\/\s*[2-4]\s*(?:ของ)?\s*เม็ด)|(?:ครึ่งเดียว|แค่ครึ่ง|บางส่วน|ส่วนหนึ่ง|หนึ่งในสี่|เสี้ยว|\d\s*\/\s*[2-4]\s*(?:ของ)?\s*เม็ด).{0,12}ยา(?!ก|ว|ง|ม|ย(?!ั))/;
const MEDICINE_CONTEXT = /ยา(?!ก|ว|ง|ม|ย(?!ั))|medicine|medication|\bdos(?:e|age)\b|เม็ด|หยด/i;
const APP_UI = /แอป|ในระบบ|เข้าระบบ|ปุ่ม|กด|หน้าจอ|หน้ายา|เมนู|แท็บ|สต็อก|ช่อง|ฟอร์ม|เตือน|บันทึก|จด|กรอก|ติ๊ก|\b(?:app|button|tap|screen|tab|stock|field|reminders?)\b/i;
const SELF_DECISION = /(?:หยุด|เลิก|งด|เพิ่ม|ลด|เปลี่ยน)(?:ให้|การ)?\s*(?:กิน|ให้)?\s*ยา(?!ก|ว|ง|ม(?!า)|ย(?!ั)).{0,8}เอง|ควร(?:จะ)?(?:หยุด|เลิก|เพิ่ม|ลด|เปลี่ยน)(?:ให้)?\s*(?:กิน)?ยา/;
// Controls on screen (not "เตือน/บันทึก", which also appear in clinical requests).
const APP_CONTROL = /แอป|ในระบบ|เข้าระบบ|ปุ่ม|กด|หน้าจอ|เมนู|แท็บ|สต็อก|ช่อง|ฟอร์ม|ติ๊ก|\b(?:app|button|tap|screen|tab|stock|field)\b/i;
/** True for dosing / stop-start decisions that must reach the clinical guard. */
function isClinicalDosingQuestion(message) {
    const q = String(message || '').normalize('NFC').toLowerCase();
    if (!MEDICINE_CONTEXT.test(q))
        return false;
    // Deciding to stop/change a medicine on one's own stays clinical even next to an app word
    // ("หยุดยาเองได้ไหม อย่าเตือนนะ").
    if (SELF_DECISION.test(q))
        return true;
    if (APP_UI.test(q))
        return false;
    if (DOSE_AMOUNT.test(q) || DOSE_FREQUENCY.test(q) || DOSE_PART.test(q))
        return true;
    // "เพิ่มยาแล้วไม่ขึ้นทำไง ได้ไหม" / "สลับน้องก่อนเพิ่มยาอย่างไร ได้ไหม" still ask how to use
    // the app; only a bare permission question ("เพิ่มยาได้ไหม") is a dosing decision.
    return DOSE_PERMISSION.test(q) && !/(?:ยังไง|ทำไง|อย่างไร|ตรงไหน|ที่ไหน|อยู่ไหน|ไม่ขึ้น|หาย|ไม่สำเร็จ|ผิดพลาด|error|sync|บันทึก)/i.test(q);
}
// ต้องมีเจตนาใช้ระบบก่อน จึงไม่เอาคำถามสุขภาพที่บังเอิญมีคำว่า น้ำหนัก/ยา ไปตอบเป็นคู่มือ
const HELP_CUE = /(?:วิธี|ทำ(?:อย่าง)?ไง|ยังไง|อย่างไร|ตรงไหน|ที่ไหน|อยู่ไหน|กดอะไร|เริ่ม(?:จาก)?ไหน|ใช้(?:งาน)?(?:ยังไง|อย่างไร)?|ช่วยบอก|ช่วยสอน|help|how|where|can't|cannot|unable|not working|doesn't work|stuck|problem|issue|ไม่(?:ได้|เจอ|เป็น)|หาไม่(?:เจอ|พบ)|ติด|อยาก|ต้องการ|พึ่ง|เพิ่ง|มือใหม่)/i;
const SYSTEM_SCOPE = /(?:petcare|แอป|ระบบ|ฟีเจอร์|เมนู|หน้าหลัก|หน้าสุขภาพ|home|health|chat|agent|paw|record|save|sync|timeline|profile|ปุ่ม|กด(?:ที่|ปุ่ม|อะไร|ตรงไหน|เพื่อ|แล้ว|บันทึก)|เพิ่มน้อง|น้องตัวใหม่)/i;
const RECORDING_ACTION = /(?:บันทึก|จด|เพิ่ม|ลง|record|log|กรอก|ใส่|ชั่ง|ตั้งเตือน|filter|กรอง)/i;
const ENGLISH_HELP_TOPICS = [
    ['reminder_troubleshoot', /\bwhy\b.{0,30}\b(?:no|not|didn'?t|don'?t|doesn'?t|isn'?t|aren'?t|haven'?t)\b.{0,30}\b(?:notif\w*|remind\w*|alerts?|alarms?)|\b(?:no|not getting|not receiving|missing|never got)\s+(?:any\s+)?(?:notifications?|reminders?|alerts?)\b|\b(?:notifications?|reminders?)\b.{0,20}\b(?:not working|don'?t work|stopped|keeps? (?:coming|going)|still (?:coming|going|on))\b|\bstill\b.{0,20}\bremind\w*\b.{0,30}\b(?:out of|ran out|empty|no stock)\b/i],
    ['save_problem', /(?:not sav|did not sav|cannot sav|can't sav|missing record)/i],
    ['account_delete', /(?:delete|remove|close).{0,12}account/i],
    ['unavailable_features', /\bcommunity\b|\bpaw cup\b|\bcontests?\b|\badopt\w*\b|\b(?:sign|log)\s?in\b.{0,12}\b(?:google|apple|line)\b|\b(?:google|apple|line)\b.{0,12}\b(?:sign|log)\s?in\b/i],
    ['medicine_history', /\bmark\w*\b.{0,25}\b(?:doses?|medicines?|medications?)?\b.{0,15}\bas given\b|\bdoses?\b.{0,10}\bas given\b/i],
    ['medicine_manage', /\b(?:edit|change|update|adjust|stop|end|refill|restock|top up|delete|remove)\b.{0,25}\b(?:medicines?|medications?|supplements?|dose times?|reminder times?|medicine stock|stock)\b|\b(?:medicines?|medications?)\b.{0,20}\b(?:stock|refill|restock)\b/i],
    ['appointment_manage', /\b(?:reschedule|cancel|edit|change|move|postpone)\b.{0,20}\bappointments?\b/i],
    ['delete_pet', /delete.{0,12}(?:pet|profile)|\bremove\s+(?:my |a |the |this )?(?:pet|dog|cat|puppy|kitten)\b/i],
    ['edit_pet', /(?:edit|rename|change).{0,15}(?:\bpet\b|profile|\bname\b|photo)/i],
    ['switch_pet', /switch.{0,15}pet/i],
    ['language_settings', /language|switch.{0,10}english/i],
    ['medicine', /\b(?:add|log|record|set(?: up)?|create)\b.{0,25}\b(?:medicines?|medications?|supplements?|pill)\b/i],
    ['notification_settings', /notification|reminder/i],
    ['location_permission', /location|gps/i],
    ['nearby_vet', /find.{0,20}(?:vet|clinic|groom|hotel|shop)/i],
    ['password_reset', /(?:reset|forgot|forget|lost).{0,12}password/i],
    ['membership', /membership|subscription|free trial|\btrial\b/i],
    ['app_overview', /\bwhat (?:can|does) (?:this|the) app do\b|\bget started\b/i],
    ['auth_register', /sign up|register|create.{0,12}account/i],
    ['medicine_history', /(?:medicine|medication).{0,20}(?:chart|graph|history)|(?:correct|fix).{0,20}(?:given|medicine)/i],
    ['medicine', /(?:add|log|record|set).{0,25}(?:medicine|medication|supplement)|(?:medicine|medication|supplement).{0,15}(?:page|screen|menu)/i],
    ['weight', /weight|weighing/i],
    ['activity', /(?:log|record|add).{0,25}(?:food|water|walk|sleep|meal|activity)/i],
    ['vaccine', /vaccin/i],
    ['health_history', /checkup|check-up|health check|vet visit/i],
    ['records', /records|record history|timeline|filter/i],
    ['membership', /membership|subscription/i],
    ['referral', /invite|referral/i],
    ['paw_coin', /paw coin|coin balance/i],
    ['chat_context', /chat.{0,20}(?:context|remember|pet data)/i],
    ['chat_mode', /free chat|chat mode|agent/i],
    ['date_time_pickers', /\b(?:pick|choose|select|enter|type|change)\b.{0,15}\b(?:a |the )?(?:date|time)\b|\bcalendar\b|\bback-?date\b/i],
];
const HELP_RULES = [
    { id: 'medicine_history', patterns: [/(?:ให้(?:ยา)?(?:จริง)?แล้ว).{0,20}ลืม(?:ลง|จด|บันทึก).{0,20}(?:ยังไง|แก้|ตรงไหน)|(?:how|where).{0,35}mark.{0,25}(?:medicine|medication).{0,15}as given/i] },
    { id: 'pet_card', patterns: [/(?:การ์ดน้อง|pet card).{0,25}(?:สร้าง|ดู|แก้|ตรงไหน|ยังไง)|(?:สร้าง|ดู|เปิด).{0,15}การ์ดน้อง|(?:how|where).{0,30}pet card/i] },
    { id: 'certificates', patterns: [/(?:ใบเซอร์|certificate).{0,25}(?:ดู|เปิด|ตรงไหน|ยังไง)|(?:ดู|เปิด).{0,15}ใบเซอร์|(?:how|where).{0,30}certificates?/i] },
    { id: 'privacy', patterns: [/(?:นโยบาย|ความเป็นส่วนตัว|ข้อกำหนด).{0,20}(?:อ่าน|ดู|ตรงไหน)|(?:อ่าน|ดู|เปิด).{0,15}(?:นโยบาย|ความเป็นส่วนตัว|ข้อกำหนด)|(?:how|where).{0,30}(?:privacy|terms)/i] },
    { id: 'medicine_history', patterns: [/(?:กราฟ|ประวัติ).{0,18}(?:ยา|อาหารเสริม).{0,25}(?:ยังไง|ตรงไหน|ดู|แก้)|(?:ดู|เปิด|แก้|ลืมบันทึก).{0,25}(?:กราฟยา|การให้ยา)|(?:ให้ยา|ยา).{0,22}(?:ลงผิด|บันทึกผิด|กราฟไม่ขึ้น)|(?:how|where).{0,45}(?:medicine|medication).{0,25}(?:chart|graph|log|history)|(?:how|where).{0,25}(?:correct|fix).{0,25}(?:given|medicine)/i] },
    { id: 'account_delete', patterns: [/(?:วิธี|ยังไง|ตรงไหน|how|where).{0,25}(?:ลบบัญชี|delete.{0,10}account)|ลบบัญชี.{0,20}(?:ยังไง|ตรงไหน)/i] },
    { id: 'buddy', patterns: [/(?:buddy|บัดดี้|ตัวลอย).{0,35}(?:บัง|เลื่อน|ลาก|ย้าย|move|drag|cover)|(?:move|drag).{0,18}buddy/i] },
    { id: 'camera_ai', patterns: [/(?:camera\s*ai|กล้อง\s*ai).{0,30}(?:ใช้|เปิด|สแกน|ยังไง|ได้ไหม|how|use|available|work)|(?:how|can|where).{0,30}camera\s*ai/i] },
    { id: 'tutorial', patterns: [/(?:เปิด|หา|ดู).{0,20}(?:คู่มือ|ช่วยเหลือ)|(?:how|where).{0,30}(?:tutorial|app help)|(?:คู่มือ|ช่วยเหลือ).{0,20}(?:ตรงไหน|อยู่ไหน)/i] },
    { id: 'appointments', patterns: [/(?:วิธี|ยังไง|ตรงไหน).{0,20}(?:บันทึก|เพิ่ม|ลง).{0,15}นัด|(?:บันทึก|เพิ่ม|ลง).{0,15}นัด.{0,30}(?:ยังไง|ตรงไหน)|(?:how|where).{0,35}(?:appointment|booking)|(?:booking).{0,20}(?:ใช้ยังไง|บันทึก)/i] },
    { id: 'app_overview', patterns: [/(?:มือใหม่|เริ่มใช้).{0,25}(?:แอป|petcare).{0,20}(?:ยังไง|ตรงไหน|ทำอะไร)|(?:how).{0,25}(?:get started|start using|does petcare work)/i] },
    {
        id: 'add_pet',
        patterns: [/(?:เพิ่ม|สร้าง|ลงทะเบียน|สมัคร)\s*(?:สัตว์เลี้ยง|สัตว์|\bpet\b|หมา|แมว|น้องหมา|น้องแมว)(?:ใหม่)?/i, /เพิ่มน้อง(?:\s|$)/i, /น้องตัวใหม่/i, /\bnew\s+(?:dog|cat)\s+profile\b/i, /\bhow\b.{0,12}\b(?:add|create)\b.{0,12}\b(?:pet|dog|cat|puppy|kitten)s?\b/i],
        topic: /\b(?:add|create)\s+(?:a\s+)?(?:new\s+)?(?:pet|dog|cat)\b|\bnew\s+(?:dog|cat)\s+profile\b|(?:เพิ่ม|สร้าง|ลงทะเบียน|ใส่ข้อมูล|เริ่มใช้งาน).{0,22}(?:สัตว์เลี้ยง|สัตว์|\bpet\b|น้องหมา|น้องแมว|น้องตัวใหม่|โปรไฟล์(?:หมา|แมว|สัตว์))|\bpet\b.{0,16}(?:new|add|create)/i,
    },
    {
        id: 'weight',
        patterns: [/(?:วิธี|ทำไง|ยังไง|how).{0,20}(?:บันทึก|เพิ่ม|ลง).{0,16}(?:น้ำหนัก|weight)/i, /(?:บันทึก|เพิ่ม).{0,12}(?:น้ำหนัก|weight).{0,20}(?:ยังไง|อย่างไร|how)/i, /\bweight\s+graph\b/i, /กรอก.{0,12}(?:น้ำหนัก|weight|กิโล)|(?:น้ำหนัก|weight).{0,12}(?:กดอะไร|ตรงไหน|ลงไว้.*หาไม่เจอ)|(?:ดู|เปิด).{0,16}(?:กราฟ|ประวัติ).{0,16}(?:น้ำหนัก|weight)/i],
        topic: /(?:บันทึก|เพิ่ม|record|log|กราฟ|จด|ชั่ง|กด|ใส่).{0,22}(?:น้ำหนัก|weight|กิโล)|(?:น้ำหนัก|weight|กิโล|ชั่ง).{0,22}(?:บันทึก|เพิ่ม|record|log|กราฟ|จด|กด|ใส่|วันนี้|ย้อนหลัง)|(?:ดู|เปิด).{0,16}(?:กราฟ|ประวัติ).{0,16}(?:น้ำหนัก|weight)/i,
    },
    {
        id: 'activity',
        patterns: [/(?:วิธี|ทำไง|ยังไง|how).{0,16}(?:บันทึก|จด|record|ลง(?=(?:อาหาร|น้ำ|เดิน|นอน|กิจกรรม|record|log|ในแอป|ในระบบ|ข้อมูล|บันทึก|\s))).{0,16}(?:อาหาร|น้ำ|เดิน|กิจกรรม|นอน)/i, /(?:บันทึก|จด|เพิ่ม|ลง(?=(?:อาหาร|น้ำ|เดิน|นอน|กิจกรรม|record|log|ในแอป|ในระบบ|ข้อมูล|บันทึก|\s))).{0,16}(?:อาหาร|น้ำ|เดิน|กิจกรรม|นอน|record).{0,20}(?:ยังไง|อย่างไร|how)/i, /กรอก.{0,14}(?:ปริมาณ)?(?:อาหาร|น้ำ)|จดมื้อ(?:เช้า|เย็น)?|น้ำดื่มต้องลง|สองมื้อ.*ลง/i],
        topic: /(?:บันทึก|จด|เพิ่ม|ลง(?=(?:อาหาร|น้ำ|เดิน|นอน|กิจกรรม|record|log|ในแอป|ในระบบ|ข้อมูล|บันทึก|\s))|record|log|กด(?:ที่|ปุ่ม|อะไร|แล้ว|บันทึก|ลง)|ใส่|กรอก).{0,24}(?:อาหาร|น้ำ(?!หนัก)|เดิน|นอน|กิจกรรม|meal|water|walk|sleep|มื้อ)|(?:อาหาร|น้ำ(?!หนัก)|เดิน|นอน|กิจกรรม|meal|water|walk|sleep|มื้อ).{0,24}(?:บันทึก|จด|เพิ่ม|ลง(?=(?:อาหาร|น้ำ|เดิน|นอน|กิจกรรม|record|log|ในแอป|ในระบบ|ข้อมูล|บันทึก|\s))|record|log|กด(?:ที่|ปุ่ม|อะไร|แล้ว|บันทึก|ลง)|ใส่|กรอก|ในแอป|ในระบบ)/i,
    },
    {
        id: 'medicine',
        patterns: [/(?:ใช้|เปิด).{0,12}(?:หน้ายา|เมนูยา|ฟีเจอร์ยา).{0,25}(?:ยังไง|ตรงไหน|หน้าหลัก)|(?:เพิ่ม|บันทึก).{0,12}(?:ยาอาหารเสริม|ยา–อาหารเสริม|อาหารเสริม).{0,20}(?:ยังไง|ตรงไหน)/i, /(?:วิธี|ทำไง|ยังไง|how).{0,20}(?:เพิ่ม|บันทึก|ลง).{0,16}(?:ยา(?=\s|ให้|ของ|ใน|ใหม่|$)|medicine)/i, /(?:เพิ่ม|บันทึก)\s*(?:ยา(?=\s|ให้|ของ|ใน|ใหม่|$)|medicine).{0,20}(?:ยังไง|อย่างไร|how)/i, /ตั้ง(?:เวลา)?เตือนยา|ใส่ชื่อยา|เพิ่มรายการเตือนยา/i],
        topic: /\b(?:add|record|log)\s+(?:a\s+)?medicine\b|(?:เพิ่ม|บันทึก|รายการ|ตั้งเตือน|record|log|ใส่|กด)\s*(?:ยา(?=\s|ให้|ของ|ใน|ใหม่|$)|medicine)|(?:ชื่อยา|รายการยา|medicine).{0,20}(?:ในแอป|ในระบบ|รายการ|เตือน|บันทึก|เพิ่ม|list|หาไม่เจอ|เข้าระบบ)|(?:ตั้ง(?:เวลา)?เตือนยา)/i,
    },
    {
        id: 'health_history',
        patterns: [/(?:วิธี|ทำไง|ยังไง|how).{0,24}(?:ประวัติสุขภาพ|ตรวจสุขภาพ|พบหมอ|health history|checkup)/i, /(?:บันทึก|เพิ่ม|ลง).{0,18}(?:ประวัติสุขภาพ|ตรวจสุขภาพ|พบหมอ|checkup).{0,20}(?:ยังไง|อย่างไร|how)/i, /หลังไป(?:คลินิก|หาหมอ).{0,16}(?:กดอะไร|ยังไง|บันทึก)|(?:ตรวจสุขภาพ|checkup).{0,18}(?:ลงรายการ|ลงข้อมูล|ที่ไหน)/i],
        topic: /\b(?:record|log)\s+(?:a\s+)?checkup\b|(?:บันทึก|เพิ่ม|record|log|จด|กด|ใส่).{0,28}(?:ประวัติสุขภาพ|ตรวจสุขภาพ|พบหมอ|สัตวแพทย์|health history|checkup|ใบตรวจ|โน้ตหมอ)|(?:ประวัติสุขภาพ|ตรวจสุขภาพ|พบหมอ|สัตวแพทย์|health history|checkup|ใบตรวจ|โน้ตหมอ|ประวัติการรักษา).{0,28}(?:บันทึก|เพิ่ม|record|log|ในแอป|ตรงไหน|ยังไง|กด)/i,
    },
    {
        id: 'vaccine',
        patterns: [/(?:วิธี|ทำไง|ยังไง|how).{0,20}(?:บันทึก|เพิ่ม).{0,16}(?:วัคซีน|vaccine)/i, /(?:บันทึก|เพิ่ม).{0,12}(?:วัคซีน|vaccine).{0,20}(?:ยังไง|อย่างไร|how)/i, /(?:วัคซีน|vaccine).{0,18}(?:ปุ่ม|อยู่ไหน|record|log|ลงไว้.*หาไม่เจอ)|ฉีดวัคซีนแล้ว.{0,18}(?:บันทึก|ลง)|ชื่อวัคซีน(?:ใส่|กรอก)/i],
        topic: /\b(?:add|record|log)\s+(?:a\s+)?vaccine\b|(?:บันทึก|เพิ่ม|record|log|กด|ใส่).{0,20}(?:วัคซีน|vaccine|วันฉีด|เข็มใหม่)|(?:วัคซีน|vaccine|วันฉีด|เข็มใหม่).{0,20}(?:บันทึก|เพิ่ม|record|log|ในแอป|ในระบบ)/i,
    },
    {
        id: 'nearby_vet',
        patterns: [/(?:วิธี|ทำไง|ยังไง|how).{0,26}(?:หา|ค้นหา|ดู).{0,16}(?:คลินิก|โรงพยาบาล|หมอ|vet|nearby)/i, /(?:คลินิก|โรงพยาบาล|vet).{0,22}(?:ใกล้ฉัน|ใกล้บ้าน|nearby)/i, /หมอสัตว์.{0,18}(?:แถวนี้|ใกล้|หา)|แผนที่ไม่ขึ้น.*หาหมอ/i],
        topic: /\b(?:find|search).{0,18}(?:vet|clinic|hospital)\b|(?:หา|ค้นหา|ดู|แผนที่|map|เปิด).{0,24}(?:คลินิก|โรงพยาบาล|สัตวแพทย์|vet|เบอร์คลินิก)|(?:คลินิก|โรงพยาบาล|สัตวแพทย์|vet).{0,24}(?:ใกล้ฉัน|ใกล้บ้าน|nearby|แผนที่|map|ตรงไหน|ยังไง|หา|ค้นหา)|\b(?:nearby\s+(?:clinic|vet|hospital)|vet\s+search)\b/i,
    },
    {
        id: 'records',
        patterns: [/(?:วิธีใช้|ใช้).{0,12}records?.{0,20}(?:ขั้นตอน|ยังไง)|(?:วิธี|ทำไง|ยังไง|how).{0,22}(?:ดู|เปิด).{0,16}(?:ประวัติ|record|บันทึก)/i, /(?:ประวัติ|record|บันทึก).{0,20}(?:อยู่ไหน|ตรงไหน|where)/i, /(?:ดู|เปิด).{0,18}(?:timeline|history|รายการที่ผ่านมา)|history.{0,14}(?:เปิด|ที่ไหน)/i],
        topic: /\b(?:view|open).{0,18}(?:record|history|timeline)\b|(?:ดู|เปิด|หา|filter).{0,24}(?:ไทม์ไลน์|ประวัติ|record|records|บันทึก|history|log|timeline)|(?:ไทม์ไลน์|ประวัติ|record|records|บันทึก|history|log|timeline).{0,24}(?:อยู่ไหน|ตรงไหน|where|ในแอป|หาไม่เจอ|ยังไง|กด)|\b(?:record|records|history|timeline)\s+(?:help|where)\b/i,
    },
    {
        id: 'chat_mode',
        patterns: [/(?:chat|แชท).{0,22}(?:ธรรมดา|agent|paw|ต่างกัน|เลือก|ฟรี|ตอบเรื่อง|กลับ)|(?:agent|paw).{0,22}(?:ใช้|แชท|chat|ต่างกัน|ฟรี|ผิดพลาด)/i],
        topic: /(?:chat|แชท|agent|paw).{0,24}(?:ธรรมดา|agent|paw|ต่างกัน|เลือก|ฟรี|คำถาม|ตอบเรื่อง|กลับ)|(?:chat|แชท).{0,18}ฟรี/i,
    },
    {
        id: 'switch_pet',
        patterns: [/(?:เปลี่ยน|สลับ|เลือก).{0,14}(?:สัตว์|\bpets?\b|profile|น้อง(?:ตัว|ที่))|สลับ(?:จาก)?.{0,18}(?:น้อง|chat|แชท)|(?:ข้อมูล|ประวัติ).{0,16}(?:ปน|สลับ|ผิดตัว|ข้ามตัว)|(?:เลือกน้อง|เลือกชื่อ).{0,18}แชท|(?:สลับน้อง|เปลี่ยนตัว).{0,18}แชท/i],
        topic: /\b(?:switch|change).{0,16}(?:pets?|dog|cat|profile)\b|(?:เปลี่ยน|สลับ|เลือก).{0,20}(?:สัตว์|\bpets?\b|profile|น้อง(?:ตัว|ที่))|สลับ(?:จาก)?.{0,18}(?:น้อง|chat|แชท)|(?:ข้อมูล|ประวัติ).{0,20}(?:ปน|สลับ|ผิดตัว|ข้ามตัว)|(?:ดู|แชท).{0,20}(?:อีกตัว|คนละตัว)/i,
    },
    {
        id: 'save_problem',
        patterns: [/(?:บันทึก|save|sync).{0,22}(?:ไม่ขึ้น|หาย|ไม่ได้|error|ผิดพลาด|ไม่สำเร็จ)|เพิ่ม(?:ยา|วัคซีน|กิจกรรม|น้ำหนัก).{0,22}(?:ไม่ขึ้น|หาย|ไม่ได้|error|ผิดพลาด|ไม่สำเร็จ)|(?:ข้อมูล|รายการ).{0,20}(?:หาย|ไม่ขึ้น|ไม่เจอ|ไม่ sync|ไม่อัปเดต)/i],
        topic: /(?:บันทึก|save|sync|ข้อมูล|รายการ|record).{0,24}(?:ไม่ขึ้น|หาย|ไม่ได้|error|ผิดพลาด|ไม่สำเร็จ|ไม่เจอ|ไม่ sync|problem)|(?:ไม่ขึ้น|หาย|ไม่ได้|error|ผิดพลาด|ไม่สำเร็จ|ไม่เจอ|ไม่ sync|problem).{0,24}(?:บันทึก|save|sync|ข้อมูล|รายการ|record)|เพิ่ม(?:ยา|วัคซีน|กิจกรรม|น้ำหนัก).{0,24}(?:ไม่ขึ้น|หาย|ไม่ได้|error|ผิดพลาด|ไม่สำเร็จ)/i,
    },
    {
        id: 'auth_register',
        patterns: [/(?:สมัคร|สร้าง).{0,18}(?:บัญชี|account).{0,18}(?:ยังไง|อย่างไร|ตรงไหน|ไหน)/i, /(?:register|sign up).{0,18}(?:petcare|app|account)?/i, /สมัคร(?:ใช้)?แอป.{0,18}(?:ยังไง|อย่างไร|ไหน)/i, /(?:ยืนยัน|ส่ง).{0,18}อีเมล.{0,18}(?:สมัคร|บัญชี|account)/i],
        topic: /(?:สมัคร|สร้างบัญชี|register|sign up).{0,24}(?:แอป|petcare|account|ใช้งาน)|(?:แอป|petcare).{0,18}(?:สมัคร|register|sign up)|(?:ยืนยัน|ส่ง).{0,18}อีเมล.{0,18}(?:สมัคร|บัญชี|account)/i,
    },
    {
        id: 'password_reset',
        patterns: [/(?:ลืม|รีเซ็ต|เปลี่ยน).{0,18}(?:รหัสผ่าน|รหัส|password)/i, /ลิงก์.{0,14}(?:รีเซ็ต|ตั้ง).{0,14}(?:รหัสผ่าน|รหัส)|(?:forgot|reset).{0,16}password/i],
        topic: /(?:รหัสผ่าน|รหัส|password).{0,20}(?:ลืม|รีเซ็ต|เปลี่ยน|ไม่ได้|ไม่เข้า)|(?:ลืม|รีเซ็ต|เปลี่ยน).{0,20}(?:รหัสผ่าน|รหัส|password)|ลิงก์.{0,14}(?:รีเซ็ต|ตั้ง).{0,14}(?:รหัสผ่าน|รหัส)/i,
    },
    {
        id: 'edit_pet',
        patterns: [/(?:แก้ไข|แก้ชื่อ|เปลี่ยน).{0,18}(?:ชื่อ|รูป|พันธุ์|น้ำหนัก|ข้อมูล|profile|โปรไฟล์)(?:ของ)?(?:น้อง|สัตว์|pet|profile|โปรไฟล์)?/i, /(?:แก้ข้อมูล|edit).{0,18}(?:น้อง|สัตว์|pet|profile)/i],
        topic: /(?:แก้ไข|แก้ข้อมูล|แก้ชื่อ|edit|เปลี่ยนชื่อ).{0,24}(?:น้อง|สัตว์|pet|profile|โปรไฟล์)|(?:ชื่อ|รูป|พันธุ์|น้ำหนัก|ข้อมูล|profile|โปรไฟล์).{0,20}(?:น้อง|สัตว์|pet|profile).{0,18}(?:แก้ไข|แก้|เปลี่ยน|edit)/i,
    },
    {
        id: 'delete_pet',
        patterns: [/(?:ลบ|เอาออก).{0,18}(?:น้อง|สัตว์|pet|profile|โปรไฟล์)/i, /delete.{0,18}(?:pet|profile)/i],
        topic: /(?:ลบ|เอาออก|delete).{0,24}(?:น้อง|สัตว์|pet|profile|โปรไฟล์)/i,
    },
    {
        id: 'notification_settings',
        patterns: [/(?:เปิด|ปิด|ตั้งค่า|ไม่ขึ้น).{0,20}(?:แจ้งเตือน|notification|เตือนยา|เตือนวัคซีน)/i, /(?:แจ้งเตือน|notification|เตือนยา|เตือนวัคซีน).{0,20}(?:ตรงไหน|ยังไง|ไม่ขึ้น|ไม่ได้)|(?:เปิด|ปิด).{0,12}เตือน(?:ยา|วัคซีน)?/i],
        topic: /(?:แจ้งเตือน|notification|เตือนยา|เตือนวัคซีน).{0,24}(?:เปิด|ปิด|ตั้งค่า|ไม่ขึ้น|ไม่ได้|ตรงไหน|ยังไง)|(?:เปิด|ปิด|ตั้งค่า).{0,20}(?:แจ้งเตือน|notification|เตือนยา|เตือนวัคซีน)/i,
    },
    {
        id: 'language_settings',
        patterns: [/(?:เปลี่ยน|สลับ|ตั้งค่า).{0,18}(?:ภาษา(?:ไทย|อังกฤษ)?|english|language)/i, /(?:language).{0,18}(?:change|setting|where)/i],
        topic: /(?:ภาษาไทย|ภาษาอังกฤษ|english|language).{0,24}(?:เปลี่ยน|สลับ|ตั้งค่า|ไทย|english|ตรงไหน|ยังไง)|(?:เปลี่ยน|สลับ|ตั้งค่า).{0,18}ภาษา(?:ไทย|อังกฤษ)?/i,
    },
    {
        id: 'location_permission',
        patterns: [/(?:อนุญาต|เปิด|ไม่เจอ|ไม่ได้).{0,20}(?:ตำแหน่ง|location|gps)/i, /(?:ตำแหน่ง|location|gps).{0,20}(?:อนุญาต|เปิด|ไม่เจอ|ไม่ได้|ยังไง)/i],
        topic: /(?:ตำแหน่ง|location|gps).{0,24}(?:อนุญาต|เปิด|ไม่เจอ|ไม่ได้|ยังไง|ตรงไหน)|(?:อนุญาต|เปิด).{0,20}(?:ตำแหน่ง|location|gps)/i,
    },
    {
        id: 'chat_context',
        patterns: [/how does chat.{0,20}remember/i, /(?:ช่วยจำ|จำได้|จำข้อมูล|จดจำ|memory|บริบท|context).{0,24}(?:แชท|chat|น้อง|ข้อมูล)/i, /(?:ข้อมูล|แชท).{0,24}(?:ปน|ผิดตัว|คนละตัว|จำได้|จดจำ|จำข้อมูล)/i],
        topic: /(?:แชท|chat).{0,24}(?:จำได้|จดจำ|memory|บริบท|context|ปน|ผิดตัว|คนละตัว)|(?:ช่วยจำ|จำได้|จดจำ|memory|บริบท|context).{0,24}(?:แชท|chat|น้อง|ข้อมูล)/i,
    },
    {
        id: 'paw_coin',
        patterns: [/(?:paw|เหรียญ).{0,22}(?:เหลือ|ดู|เติม|ซื้อ|ใช้|หาย|ตรงไหน)/i, /(?:เติม|ซื้อ|ดู).{0,18}(?:paw|เหรียญ)/i],
        topic: /(?:paw coin|paw|เหรียญ).{0,24}(?:เหลือ|ดู|เติม|ซื้อ|ใช้|ประวัติ|ตรงไหน|ยังไง)|(?:เติม|ซื้อ|ดู).{0,20}(?:paw coin|paw|เหรียญ)/i,
    },
    {
        id: 'membership',
        patterns: [/(?:แพ็กเกจ|membership|ทดลองใช้ฟรี|รายเดือน|รายปี).{0,24}(?:ยังไง|ราคา|สมัคร|ยกเลิก|ตรงไหน|ไหน|สถานะ)/i, /(?:สมัคร|ยกเลิก|กู้คืน).{0,18}(?:แพ็กเกจ|membership|รายเดือน|รายปี|สิทธิ์?สมาชิก)/i, /(?:สมาชิก).{0,18}(?:ยกเลิก|สถานะ|กู้คืน|ต่ออายุ)|ยกเลิก.{0,18}สมาชิก|กู้คืน.{0,18}(?:สิทธิ์)?สมาชิก/i],
        topic: /(?:แพ็กเกจ|membership|ทดลองใช้ฟรี|รายเดือน|รายปี).{0,24}(?:ยังไง|ราคา|สมัคร|ยกเลิก|ตรงไหน|ไหน|สถานะ)|(?:สมัคร|ยกเลิก|สถานะ|กู้คืน).{0,18}(?:แพ็กเกจ|membership|รายเดือน|รายปี|สิทธิ์?สมาชิก)|สมาชิก.{0,18}(?:ยกเลิก|สถานะ|กู้คืน|ต่ออายุ)|ยกเลิก.{0,18}สมาชิก|กู้คืน.{0,18}(?:สิทธิ์)?สมาชิก/i,
    },
    {
        id: 'referral',
        patterns: [/(?:ชวนเพื่อน|แนะนำเพื่อน|invite|referral|โค้ดชวน).{0,24}(?:ยังไง|ตรงไหน|ไหน|ใช้|กรอก|รับ|รางวัล|แท็บ)/i, /(?:กรอก|ใช้).{0,18}(?:โค้ด|code).{0,18}(?:เพื่อน|invite|referral)/i, /รางวัล.{0,18}(?:ชวนเพื่อน|แนะนำเพื่อน|invite|referral)/i],
        topic: /(?:ชวนเพื่อน|แนะนำเพื่อน|invite|referral|โค้ดชวน).{0,24}(?:ยังไง|ตรงไหน|ไหน|ใช้|กรอก|รับ|รางวัล|แท็บ)|(?:กรอก|ใช้).{0,18}(?:โค้ด|code).{0,18}(?:เพื่อน|invite|referral)|รางวัล.{0,18}(?:ชวนเพื่อน|แนะนำเพื่อน|invite|referral)/i,
    },
];
// ── 26 Oct 2026: topics for the medicine edit/stop/refill screen, reminder
// troubleshooting, appointment editing, pet-page quick records and features that
// are switched off. Patterns are exact phrasings (no HELP_CUE needed) and are kept
// tight so clinical questions still reach the guards. ──
HELP_RULES.unshift({
    id: 'reminder_troubleshoot',
    patterns: [
        re(String.raw `ทำไม.{0,24}(?:ไม่|ไม่มี|ไม่ได้|ไม่ยอม)(?:การ)?(?:แจ้ง)?เตือน`),
        re(String.raw `(?:แจ้ง)?เตือน(?:ยา|นัด|วัคซีน)?\s*ไม่(?:ดัง|มา|ทำงาน|ตรงเวลา|เตือน)|(?:แจ้ง)?เตือน(?:ยา|นัด)?\s*(?:มา)?ช้า`),
        re(String.raw `(?:แอป|ระบบ|มือถือ|เครื่อง).{0,8}ไม่(?:ยอม)?(?:แจ้ง)?เตือน|^ไม่(?:ยอม)?(?:แจ้ง)?เตือน|ไม่มี(?:การ)?แจ้งเตือน(?:ยา|นัด|วัคซีน)?(?:เลย|มา|ขึ้น)`),
        re(String.raw `${MED}\s*(?:หมด|เป็น\s*0).{0,12}(?:ยัง|ก็ยัง|แต่)(?:มี)?(?:แจ้ง)?เตือน|(?:ยัง|ก็ยัง)(?:มี)?(?:แจ้ง)?เตือน.{0,20}${MED}\s*หมด`),
    ],
}, {
    id: 'medicine_manage',
    patterns: [
        re(String.raw `(?:แก้ไข|แก้|เปลี่ยน|ปรับ|เลื่อน)\s*(?:เวลา(?:แจ้ง)?(?:เตือน)?(?:ให้|กิน)?|ความถี่|วันจบ(?:คอร์ส)?|วันสุดท้าย|จำนวน|สต็อก|ระยะเวลา(?:ให้|กิน)?)\s*(?:การ)?(?:ให้|กิน)?(?:ของ)?\s*${MED}`),
        re(String.raw `(?:แก้ไข|แก้|ลบ|หยุด|เลิก)(?:ให้)?(?:การ)?(?:ข้อมูล|รายการ)?\s*${MED}.{0,24}${HOW_TH}`),
        re(String.raw `(?:เติม|เพิ่มจำนวน)(?:จำนวน)?\s*(?:${MED}|เม็ด).{0,24}${HOW_TH}|ซื้อ\s*${MED}.{0,12}เพิ่ม.{0,30}(?:แอป|จำนวน|สต็อก)|สต็อก(?:ยา)?.{0,12}(?:เพิ่ม|เติม|แก้).{0,16}${HOW_TH}`),
        re(String.raw `ปุ่ม\s*(?:หยุด|แก้ไข|เติม|ลบ)\s*${MED}|(?:หมอ|สัตวแพทย์).{0,16}หยุด(?:ให้)?ยา.{0,30}(?:กด|ทำ|แอป|ไง|ตรงไหน)`),
        re(String.raw `${MED}\s*(?:หมด|เป็น\s*0).{0,12}(?:ติ๊ก|กด|บันทึก).{0,10}ไม่ได้|ติ๊ก.{0,12}ไม่ได้.{0,12}หมด|ยาที่ต้องแก้|(?:ไม่|ไม่อยาก)(?:ให้)?(?:แอป)?นับ(?:จำนวน)?(?:${MED}|เม็ด)|ไม่นับจำนวน|จำนวน(?:ยา)?(?:ใน)?(?:แอป)?(?:เป็น)?\s*0(?!\d)`),
        /\b(?:edit|change|update|adjust|stop|end|refill|restock|delete|remove)\b.{0,25}\b(?:medicines?|medications?|supplements?|dose times?|reminder times?|medicine stock)\b/i,
    ],
}, {
    id: 'unavailable_features',
    patterns: [
        re(String.raw `(?:ชุมชน|คอมมูนิตี้|community|ประกวด(?:น้อง)?|paw\s*cup)(?:ใน|ของ)?(?:แอป|petcare)?\s*(?:อยู่)?(?:ตรงไหน|ที่ไหน|อยู่ไหน|หาย|ไม่เจอ|ยังไง|ไง|ใช้(?:ยังไง|ได้ไหม|ได้มั้ย)|เปิด(?:ยังไง|ตรงไหน|ได้ไหม)?|เข้า(?:ยังไง|ตรงไหน)|มีไหม|มีมั้ย)`),
        re(String.raw `(?:หน้า|แท็บ|เมนู)\s*(?:ชุมชน|community|ประกวด|paw\s*cup|หาบ้าน)|paw\s*cup`),
        re(String.raw `(?:ลง)?(?:ประกาศ)?หาบ้านให้(?:น้อง|หมา|แมว|สุนัข)?.{0,12}(?:${HOW_TH}|ได้ไหม|ได้มั้ย)`),
        re(String.raw `(?:ล็อกอิน|ล็อคอิน|login|log in|เข้าสู่ระบบ|สมัคร|sign in|sign up).{0,20}(?:google|กูเกิล|กูเกิ้ล|apple|แอปเปิล|แอปเปิ้ล|\bline\b|ไลน์)|(?:google|กูเกิล|กูเกิ้ล|apple id|แอปเปิล|แอปเปิ้ล|\bline\b|ไลน์).{0,12}(?:ล็อกอิน|ล็อคอิน|login|เข้าสู่ระบบ|sign in)`),
    ],
}, {
    id: 'appointment_manage',
    patterns: [
        re(String.raw `(?:แก้|แก้ไข|เปลี่ยน|เลื่อน|ยกเลิก|ลบ)\s*(?:วัน|เวลา)?\s*(?:การ)?นัด(?:หมาย|หมอ)?(?!.{0,24}(?:วัคซีน|เข็ม)).{0,24}${HOW_TH}`),
        re(String.raw `(?:นัด|นัดหมาย)(?:หมอ)?.{0,12}(?:แก้|แก้ไข|เลื่อน|ยกเลิก|ลบ).{0,12}${HOW_TH}|(?:วัน|เวลา)นัด.{0,10}(?:แก้|เปลี่ยน|เลื่อน).{0,12}${HOW_TH}`),
        /\b(?:reschedule|cancel|edit|change|move|postpone)\b.{0,20}\bappointments?\b/i,
    ],
}, {
    id: 'date_time_pickers',
    patterns: [
        re(String.raw `(?:ใส่|เลือก|พิมพ์|กรอก|เปลี่ยน|แก้)\s*(?:วันที่|ปี|เดือน)(?!นัด).{0,16}(?:${HOW_TH}|ไม่ได้)|ปฏิทิน.{0,12}(?:${HOW_TH}|ไม่ได้|ไม่ขึ้น)|(?:เลือก|ใส่|ตั้ง)\s*เวลา(?:อื่น|เอง).{0,10}(?:${HOW_TH}|ได้ไหม|ได้มั้ย)`),
    ],
}, {
    id: 'quick_records',
    patterns: [
        re(String.raw `(?:บันทึก|ลง|จด|เพิ่ม|ใส่)\s*(?:ข้อมูล)?(?:การ)?\s*(?:กรูมมิ่ง|grooming|อาบน้ำ(?:ตัดขน)?|ตัดขน|ตัดเล็บ).{0,24}${HOW_TH}`),
        re(String.raw `บันทึกด่วน|หน้าข้อมูลน้อง.{0,16}(?:บันทึก|ปุ่ม)`),
        /\b(?:log|record|add)\b.{0,15}\bgrooming\b/i,
    ],
});
// Extra exact phrasings for existing topics (casual Thai without spaces, back-dating,
// UI labels). Keep each one anchored to an app action or a how/where cue.
const EXTRA_PATTERNS = {
    medicine: [
        re(String.raw `(?:เพิ่ม|บันทึก|ลง|ใส่|กรอก|จด)(?:รายการ|ข้อมูล)?\s*${MED}.{0,24}${HOW_TH}`),
        re(String.raw `ปุ่ม\s*(?:เพิ่ม|บันทึก)?\s*${MED}.{0,10}(?:อยู่)?(?:ไหน|ตรงไหน)|(?:รายการ|หน้า|เมนู)\s*${MED}.{0,8}(?:อยู่ไหน|ตรงไหน|ที่ไหน)`),
        re(String.raw `ตั้ง(?:เวลา)?(?:แจ้ง)?เตือน(?:ให้)?(?:กิน)?ยา|เพิ่ม(?:รายการ)?(?:แจ้ง)?เตือน(?:กิน)?ยา`),
        re(String.raw `(?:ตั้ง|กำหนด|เลือก)\s*(?:วันจบ(?:คอร์ส)?|วันสุดท้าย|ระยะเวลา)(?:ของ|ให้|กิน)?\s*(?:คอร์ส)?${MED}|${MED}\s*\d+\s*วัน.{0,12}(?:ตั้ง|ใส่|เลือก).{0,10}${HOW_TH}|(?:เวลา|นาที).{0,16}ไม่มีในปุ่ม|เวลาอื่น.{0,12}${HOW_TH}`),
        re(String.raw `${MED}(?:ที่หมอ(?:ให้|สั่ง)(?:มา)?)?.{0,12}(?:ในแอป|เข้าแอป|เข้าระบบ).{0,12}(?:ไง|อย่างไร|ตรงไหน|ที่ไหน|กดอะไร)`),
    ],
    medicine_history: [
        re(String.raw `ติ๊ก(?:ยา)?(?:ผิด|พลาด)|ลืมติ๊ก|(?:ยกเลิก|แก้)(?:การ)?ติ๊ก|ติ๊กย้อนหลัง`),
        /\bmark\w*\b.{0,25}\bas given\b/i,
    ],
    weight: [
        re(String.raw `(?:บันทึก|ลง|ใส่|กรอก|จด)\s*(?:ค่า)?(?:น้ำหนัก|weight|กิโล).{0,20}(?:${HOW_TH}|ย้อนหลัง|เมื่อวาน|ได้ไหม|ได้มั้ย)`),
        re(String.raw `(?:แก้|แก้ไข|ลบ)\s*(?:ค่า)?(?:น้ำหนัก|weight).{0,16}(?:ผิด|ที่ลง|ที่บันทึก|${HOW_TH})`),
        /\b(?:record|log)\s*(?:the\s+)?weight\b.{0,12}(?:อยู่ไหน|ตรงไหน|ที่ไหน|\bwhere\b)/i,
        re(String.raw `ชั่ง(?:น้อง|น้ำหนัก)?.{0,12}(?:แล้ว)?\s*(?:ลง|บันทึก|ใส่|กรอก|จด).{0,16}${HOW_TH}|(?:เริ่ม|ทำ)\s*กราฟน้ำหนัก|ปุ่ม\s*(?:บันทึก)?\s*น้ำหนัก|(?:น้ำหนัก|weight).{0,12}ย้อนหลัง.{0,12}(?:${HOW_TH}|ได้ไหม|ได้มั้ย)`),
    ],
    activity: [
        re(String.raw `(?:บันทึก|ลง|จด|ใส่|กรอก)\s*(?:การ)?(?:นอน|เดิน(?:เล่น)?|อาหาร|มื้อ|น้ำ(?!หนัก)|กิจกรรม)(?:ของน้อง|ย้อนหลัง|เมื่อวาน)?.{0,16}${HOW_TH}`),
    ],
    vaccine: [
        re(String.raw `(?:บันทึก|เพิ่ม|ลง|ใส่|กรอก)\s*(?:ข้อมูล|ประวัติ)?(?:การ)?(?:ฉีด)?\s*(?:วัคซีน|vaccine|เข็ม(?:ใหม่)?|วันฉีด).{0,24}(?:${HOW_TH}|how|where)`),
        re(String.raw `ฉีด(?:วัคซีน)?(?:มา)?แล้ว.{0,16}(?:บันทึก|ลง|ใส่).{0,12}${HOW_TH}|ฉีด(?:วัคซีน)?(?:มา)?แล้ว.{0,10}(?:ต้อง)?กดอะไร`),
        re(String.raw `(?:ดู|เปิด|หา)\s*(?:หน้า)?(?:ตาราง|โปรแกรม)\s*วัคซีน.{0,16}${HOW_TH}|(?:หน้า|การ์ด)\s*(?:ตาราง|โปรแกรม)วัคซีน.{0,12}${HOW_TH}|(?:ลง|ใส่)\s*คลินิก.{0,12}ฉีด.{0,16}${HOW_TH}`),
    ],
    health_history: [
        re(String.raw `(?:บันทึก|เพิ่ม|ลง|จด|เก็บ|ใส่)\s*(?:ข้อมูล|ประวัติ|ผล)?(?:การ)?(?:พบ|ไปหา|ตรวจ)?\s*(?:หมอ|สัตวแพทย์|สุขภาพ|ใบตรวจ|ผลตรวจ|โน้ตหมอ|checkup).{0,24}${HOW_TH}`),
    ],
    records: [
        re(String.raw `คะแนน(?:สุขภาพ|การดูแล|การบันทึก)|health score|care (?:record )?score`),
        re(String.raw `(?:ลบ|แก้|แก้ไข)\s*(?:รายการ|บันทึก|ข้อมูล)?\s*(?:วัคซีน|พบหมอ|ตรวจสุขภาพ|กิจกรรม|เดิน(?:เล่น)?|อาหาร|การนอน|กรูมมิ่ง|ประวัติ|ไทม์ไลน์|timeline).{0,24}(?:${HOW_TH}|ผิด|ได้ไหม|ได้มั้ย)`),
    ],
    appointments: [
        re(String.raw `ปุ่ม\s*(?:\+|บวก).{0,20}(?:นัด|appointments?)|(?:นัด|appointments?).{0,20}ปุ่ม\s*(?:\+|บวก)`),
        re(String.raw `(?:จอง|นัด)(?:คิว)?.{0,12}(?:คลินิก|หมอ|ร้าน).{0,12}(?:ในแอป|ผ่านแอป).{0,10}(?:ได้ไหม|ได้มั้ย|${HOW_TH})`),
        re(String.raw `^(?:จะ)?(?:นัด|ทำนัด|ลงนัด|บันทึกนัด|เพิ่มนัด)(?:หมอ|สัตวแพทย์|คลินิก)?\s*(?:ยังไง|ไง|ตรงไหน|อย่างไร|ที่ไหน)`),
    ],
    nearby_vet: [
        re(String.raw `(?:หา|ค้นหา|ดู|เปิด)\s*(?:ร้าน)?(?:คลินิก|คลินิค|โรงพยาบาล(?:สัตว์)?|สัตวแพทย์|หมอ(?:สัตว์)?|vet|รพ\.?\s*สัตว์|ร้านอาบน้ำ|ร้านตัดขน|โรงแรม(?:สัตว์|หมา|แมว)?)\S{0,12}.{0,8}${HOW_TH}`),
        re(String.raw `(?:แผนที่|map).{0,12}(?:คลินิก|สัตวแพทย์|หมอ|vet|โรงพยาบาล).{0,12}${HOW_TH}|(?:คลินิก|สัตวแพทย์|vet).{0,8}(?:บน)?(?:แผนที่|map).{0,12}${HOW_TH}|vet search|nearby (?:clinic|vet)`),
    ],
    edit_pet: [
        re(String.raw `(?:แก้|แก้ไข|เปลี่ยน)\s*(?:ชื่อ|รูป|สายพันธุ์|พันธุ์|สี)(?:ขน)?(?:เล่น|เรียก)?(?:ของ)?\s*(?:น้อง|สัตว์|หมา|แมว|สุนัข|pet)`),
        re(String.raw `ชื่อเรียก(?:ในแช[ตท])?.{0,16}${HOW_TH}|(?:ตั้ง|ใส่|เพิ่ม)\s*ชื่อ(?:เล่น|เรียก)(?:ให้)?(?:น้อง)?.{0,10}${HOW_TH}|(?:แก้|เพิ่ม|ใส่)\s*(?:ข้อมูล)?(?:อาการ)?(?:แพ้|ข้อห้าม)(?:ของ)?(?:น้อง)?.{0,12}${HOW_TH}`),
    ],
    delete_pet: [
        re(String.raw `ลบ\s*(?:น้อง)?(?:หมา|แมว|สุนัข|สัตว์เลี้ยง|โปรไฟล์)(?:ตัว\S{0,6})?\s*(?:ออก)?.{0,16}${HOW_TH}|เอา\s*(?:น้อง|หมา|แมว|สัตว์เลี้ยง)(?:ตัว\S{0,6})?\s*ออกจาก(?:แอป|บัญชี|ระบบ|รายชื่อ)`),
    ],
    add_pet: [
        re(String.raw `เพิ่มน้อง(?:ใหม่|อีก(?:ตัว|คน))?\s*(?:${HOW_TH}|ได้ไหม|ได้มั้ย)`),
        re(String.raw `(?:สร้าง|เพิ่ม)\s*โปรไฟล์(?:น้อง|หมา|แมว|สุนัข|สัตว์(?:เลี้ยง)?)?(?:ใหม่)?.{0,10}${HOW_TH}`),
    ],
    account_delete: [
        re(String.raw `ลบ\s*(?:บัญชี|แอคเค้าท์|แอคเคาท์|แอคเคาน์|account)|(?:กู้คืน|ยกเลิกการลบ)\s*บัญชี`),
    ],
    password_reset: [
        re(String.raw `(?:เข้าสู่ระบบ|ล็อกอิน|ล็อคอิน|login)\s*ไม่ได้|เข้าแอปไม่ได้`),
    ],
    membership: [
        re(String.raw `^(?:จะ|อยาก)?สมัคร(?:เป็น)?สมาชิก(?:petcare|แอป)?\s*(?:ยังไง|ไง|ตรงไหน|ที่ไหน|อย่างไร|ได้ที่ไหน)`),
        re(String.raw `(?:ราคา|ค่า)\s*(?:สมาชิก|แพ็กเกจ|แพ็คเกจ)|สมาชิก.{0,12}(?:ราคา|เท่าไหร่|เท่าไร|กี่บาท)|(?:เริ่ม|กด)\s*(?:ทดลองใช้|ใช้ฟรี)`),
    ],
    buddy: [
        re(String.raw `(?:เปลี่ยน|เลือก)\s*(?:เพื่อนซี้|บัดดี้|buddy|เพื่อนคู่ใจ|ตัวลอย|น้องลอย)|(?:ซ่อน|ปิด|เอาออก)\s*(?:ตัวลอย|น้องลอย|บัดดี้|buddy)|(?:ตัวลอย|น้องลอย).{0,12}(?:บัง|ซ่อน|ปิด|ลาก|ย้าย)`),
    ],
    camera_ai: [
        re(String.raw `สแกน(?!ใบเซอร์|เอกสาร)(?:สุขภาพ|อาการ|โรค)?(?:น้อง)?\s*(?:ด้วย|จาก|ผ่าน)?\s*(?:กล้อง|รูป|ภาพ).{0,16}(?:${HOW_TH}|ได้ไหม|ได้มั้ย)|ปุ่ม\s*ตรวจสุขภาพ|ตรวจสุขภาพ.{0,10}(?:coming soon|กดไม่ได้|ใช้ไม่ได้)`),
    ],
    chat_mode: [
        re(String.raw `(?:ใช้|เปิด|เลือก|สลับ(?:เป็น|ไป)?)\s*(?:โหมด)?\s*(?:agent|เอเจนต์)|(?:ให้|ใช้)\s*(?:ai|agent|แชท|แชต|chat)\s*(?:ช่วย)?บันทึก|บันทึก(?:ข้อมูล)?(?:ผ่าน|ใน|ทาง)\s*(?:แชท|แชต|chat|ai|agent).{0,12}(?:${HOW_TH}|ได้ไหม|ได้มั้ย)`),
    ],
    app_overview: [
        re(String.raw `แอป(?:นี้)?\s*(?:ทำ|ใช้)\s*อะไรได้(?:บ้าง)?|(?:แอป|petcare)(?:นี้)?\s*มี(?:ฟีเจอร์|ฟังก์ชัน)(?:อะไร)?(?:บ้าง)?`),
    ],
};
for (const helpRule of HELP_RULES)
    helpRule.patterns.push(...(EXTRA_PATTERNS[helpRule.id] || []));
// English questions that are clearly app support even without "how do/where".
const EN_EXTRA_HELP = /\bwhy\b.{0,40}\b(?:notif\w*|remind\w*|alerts?|alarms?)\b|\b(?:no|not getting|not receiving|missing|never got)\s+(?:any\s+)?(?:notifications?|reminders?)\b|\breminders?\b.{0,20}\b(?:keeps?|still|stopped|not working)\b|\bwhat (?:can|does) (?:this|the) app do\b|\bi (?:forgot|lost|can'?t remember) my password\b|\bforgot (?:my )?password\b|\bhow much (?:is|does|are) (?:the )?(?:membership|subscription)\b|\bis there (?:a )?(?:community|paw cup|contest)\b|\bcan i (?:sign|log) ?in with\b|^(?:please\s+)?(?:delete|remove|close) (?:my )?account[.!?]*$|^(?:delete|remove) (?:my )?(?:pet|dog|cat)[.!?]*$|^(?:reset|forgot) (?:my )?password[.!?]*$|^(?:cancel|reschedule) (?:an? |my )?appointment[.!?]*$/i;
const EN_HOW = /\b(?:how (?:do|can|to|should)|where (?:do|can|is|are)|instructions|tutorial|how does chat|can i use camera ai)\b/i;
// ── Keyword-scored fallback (26 Oct 2026, round 2) ──────────────────────────
// Runs only when no exact rule matched. It scores topics by feature nouns plus
// action/problem words so new phrasings still reach the right steps. It never runs
// when the message carries a clinical, symptom, food or saved-data-read signal —
// those keep their guard / emergency / record routes.
const FB_USAGE_CUE = /ยังไง|ทำไง|ไง|อย่างไร|ได้ไหม|ได้มั้ย|ไหม|มั้ย|ตรงไหน|ที่ไหน|อยู่ไหน|ทำไม|หรือเปล่า|รึเปล่า|ไม่เป็น|ไม่ได้|ไม่ขึ้น|ไม่มา|ไม่ดัง|ไม่(?:แจ้ง|เตือน|เด้ง|ทำงาน|ตรง|โชว์|แสดง|สั่น|มีเสียง)|เงียบ|หายไป|ต้องทำ|กดอะไร|ขั้นตอน|วิธี|อยาก|ต้องการ|กี่|เท่าไหร่|เท่าไร|บัง(?:ปุ่ม|จอ|หน้าจอ|ข้อมูล|อยู่)|กดไม่ได้|กดไม่โดน|\b(?:how|can i|could i|can we|where|why|is it possible|am i able|help|is there|are there|covers?|covering|blocking|in the way|is there (?:a|any) way|i need to|i want to|i'd like to|i would like to|want to|need to|do i (?:have|need) to|is it free|does it cost)\b|^(?:is|are|does|do|can|could|will|would)\b|\b(?:not|never|no longer|stopped|missing|disappeared)\b|n't\b/i;
const FB_CLINICAL = /แบ่งครึ่ง|ให้(?:หมา|แมว|น้อง|สุนัข|ลูก)(?:กิน)?.{0,8}(?:ได้ไหม|ได้มั้ย|ได้รึเปล่า|ได้หรือเปล่า)|ยาแก้\S{0,6}ของคน|อาการ|ป่วย|อาเจียน|อ้วก|ท้องเสีย|ถ่ายเหลว|ซึม|เบื่ออาหาร|ไม่ยอมกิน|ไม่กินข้าว|ไม่กินอาหาร|ไอ(?!ดี|คอน|โฟน|แพด)|จาม|ไข้|ชัก|หายใจ|เลือด|บาดเจ็บ|แผล|บวม|คัน|ปวด|เจ็บ|กะเผลก|ตัวสั่น|น้ำลายไหล|เกินขนาด|พิษ|เผลอกิน|กินเข้าไป|ผื่น|ขนร่วง|ปกติไหม|ปกติมั้ย|ผิดปกติ|เหมาะสม|อ้วน|ผอม|ควรหนัก|ขนาดยา|กี่เม็ด|โดส|วินิจฉัย|\b(?:vomit\w*|diarrh\w*|letharg\w*|seiz\w*|bleed\w*|blood|cough\w*|sneez\w*|fever|pain\w*|limp\w*|itch\w*|sick|ill|injur\w*|poison\w*|toxic|overdose|swallow\w*|ingest\w*|ate|eaten|not eating|won't eat|breath\w*|diagnos\w*|dosage|mg|wound|swollen|rash|normal|healthy|overweight|underweight|ideal)\b|\bdoses?\b(?!\s*times?)|\b(?:\d+|one|two|three|four|half|another|extra|double)\s+(?:tablets?|pills?|capsules?|drops?|ml)\b/i;
// "ยกเลิกนัดอาบน้ำวันเสาร์": an appointment object + manage verb is an app action even without a how-cue.
const FB_IMPERATIVE_ACTION = /^(?:บันทึก|จด|ลง)(?:ไว้)?(?:ว่า|ด้วยว่า)|(?:เปลี่ยน|สลับ|แปลง|ตั้ง|ทำ)(?:ให้)?\s*(?:หน้า)?(?:แอป|จอ|เมนู)?\s*(?:ให้)?เป็นภาษา|\b(?:switch|change|set|translate)\b.{0,20}\b(?:to|into) (?:thai|english)\b|(?:ยกเลิก|เลื่อน|แก้ไข|แก้|เปลี่ยน|ลบ)\s*(?:วัน|เวลา)?\s*(?:การ)?นัด|\b(?:cancel|reschedule|move|postpone)\b.{0,15}\b(?:appointments?|bookings?)\b/i;
// "ฝากจด… / …ให้หน่อย" asks the bot to write for the owner — keep the write notice.
const FB_DO_FOR_ME = /ฝาก|ให้หน่อย|ให้ที|ให้ด้วย|ช่วย\s*(?:จด|บันทึก|ลง|เพิ่ม|แก้|ลบ|ตั้ง|ใส่)|\bplease (?:log|record|save|add|update|delete|set)\b|\bfor me\b/i;
// "ขอดู… / เท่าไหร่ / ล่าสุด / which / when" asks for saved data, not instructions.
const FB_RECORD_NOUN = /ยา(?!ก|ว|ง|ม(?!า)|ย(?!ั))|น้ำหนัก|วัคซีน|นัด|ประวัติ|บันทึก|ตรวจ|อาหาร|มื้อ|น้ำ(?!หนัก)|เดิน|นอน|กิจกรรม|\b(?:medicines?|medications?|meds|pills?|weights?|weigh\w*|vaccin\w*|appointments?|records?|history|meals?|walks?|sleep|food|water)\b/i;
const FB_DATA_READ = /^ขอดู|^มี|(?:มี|เคย).{0,24}(?:ไหม|มั้ย|หรือเปล่า|หรือยัง)|ขอ(?:ข้อมูล|รายการ)|อยากรู้ว่า|มีอะไรบ้าง|เท่าไหร่|เท่าไร|กี่(?:ครั้ง|ตัว|วัน|โดส)|เมื่อไหร่|เมื่อไร|วันไหน|ล่าสุด|หรือยัง|^(?:what|which|when)\b|\b(?:what|which) (?:is|are|was|were|did|does|medicines?|vaccin\w*)\b|\bwhen (?:is|was|did|does|do|will)\b|\b(?:how many|how much|show me|tell me|do i have|did (?:i|we|she|he|it)|has (?:she|he|it))\b/i;
const FB_MED = String.raw `(?:ยา(?!ก|ว|ง|ม(?!า)|ย(?!ั))|เม็ด(?!เลือด)|อาหารเสริม|วิตามิน|\b(?:medicines?|medications?|meds|pills?|tablets?|supplements?)\b)`;
const FB_LOG = String.raw `(?:เพิ่ม|บันทึก|ลง|ใส่|กรอก|จด|ตั้ง|\b(?:add|log|record|enter|set(?: up)?|create)\b)`;
// Fixing something entered earlier ("ลืมตั้งเวลา…แก้ทีหลัง", "ใส่ผิด") is an edit, not a new entry.
const FB_CORRECTION = String.raw `ลืม(?:ตั้ง|ใส่|กรอก|เลือก)|ทีหลัง|ภายหลัง|(?:ใส่|ตั้ง|ลง|กรอก|เลือก)ผิด|\b(?:later|afterwards|forgot to (?:set|add|enter)|wrong|by mistake)\b`;
// "ดูประวัติวัคซีนได้ที่ไหน" asks where a screen is, which supports the object's topic.
const FB_VIEW_WHERE = String.raw `(?:ดู|เปิด|หา)\S{0,20}.{0,20}(?:ได้)?(?:ที่ไหน|ตรงไหน|อยู่ไหน|หน้าไหน)|\bwhere (?:can|do) i (?:see|view|find|open)\b`;
const FB_BACKDATE = String.raw `(?:เมื่อวาน|ย้อนหลัง|วันก่อน|อาทิตย์ที่แล้ว|สัปดาห์ที่แล้ว|\b(?:yesterday|earlier|past|previous|last week|back-?date|another day|different date)\b)`;
/** First feature is the anchor (the feature noun); a topic scores 0 without it. */
const FALLBACK_TOPICS = [
    ['unavailable_features', [
            [re(String.raw `(?:google|กูเกิล|กูเกิ้ล|apple|แอปเปิ้?ล|\bline\b|ไลน์|facebook|เฟซบุ๊ก|เฟสบุ๊ค|เฟสบุ้ค|\bfb\b).{0,20}(?:เข้า|ล็อกอิน|ล็อคอิน|login|log ?in|sign ?in|sign ?up|register|สมัคร|ลงทะเบียน|บัญชี|account)|(?:เข้า|ล็อกอิน|ล็อคอิน|login|log ?in|sign ?in|sign ?up|register|สมัคร|ลงทะเบียน|บัญชี|account).{0,20}(?:google|กูเกิล|กูเกิ้ล|apple|แอปเปิ้?ล|\bline\b|ไลน์|facebook|เฟซบุ๊ก|เฟสบุ๊ค|เฟสบุ้ค|\bfb\b)|ชุมชน|คอมมูนิตี้|ประกวด|paw\s*cup|หาบ้านให้|\b(?:community|contest|adopt\w*)\b`), 2],
            [re(String.raw `(?:google|กูเกิล|กูเกิ้ล|apple|แอปเปิ้?ล|\bline\b|ไลน์|facebook|เฟซบุ๊ก|เฟสบุ๊ค|เฟสบุ้ค|\bfb\b)(?!\s*(?:map|แมพ|แผนที่))`), 1],
            [re(String.raw `เข้า|เปิด|ใช้|โพสต์|แท็บ|เมนู|แอป|อยู่ไหน|ตรงไหน|ที่ไหน|\b(?:open|join|post|where|tab|menu|app)\b`), 1],
        ]],
    ['unavailable_features', [
            [re(String.raw `(?:ย้าย|โอน)\s*(?:น้อง|หมา|แมว|สุนัข|สัตว์เลี้ยง|ข้อมูลน้อง|โปรไฟล์)?.{0,12}(?:ไป|ให้|เข้า)?\s*(?:อีก)?(?:บัญชี|แอคเค้าท์|account)|(?:ย้าย|โอน)\s*(?:น้อง|หมา|แมว|สุนัข|สัตว์เลี้ยง|ข้อมูลน้อง|โปรไฟล์).{0,12}(?:ให้|ไป(?:ให้)?|ไปที่)\s*(?:คนอื่น|แฟน|ครอบครัว|เพื่อน|พ่อ|แม่|ลูก|สามี|ภรรยา|เจ้าของใหม่|อีกคน)|\b(?:transfer|move)\b.{0,20}\b(?:pets?|dogs?|cats?)\b.{0,25}\b(?:another|other|new|different|(?:my )?(?:wife|husband|partner|family)'?s?) accounts?\b`), 3],
        ]],
    ['unavailable_features', [
            [re(String.raw `ชุมชน|คอมมู\S*|กระทู้|(?:กลุ่ม|ห้อง)(?:คุย|แชท|แชต|ไลน์|เฟส)?.{0,12}(?:คนเลี้ยง|เจ้าของ|ทาส|เพื่อน|สมาชิก)|(?:คุย|แลกเปลี่ยน|แชร์|รวมตัว|เจอ)(?:กับ)?.{0,6}(?:คนเลี้ยง|เจ้าของ|ทาส)(?:แมว|หมา|สัตว์)?|\b(?:community|forum|group chat|other (?:cat |dog |pet )?owners)\b`), 2],
            [re(String.raw `มี|ไหม|มั้ย|แอป|ใช้|เข้า|\b(?:is there|app|join|use)\b`), 1],
        ]],
    ['camera_ai', [[re(String.raw `camera\s*ai|กล้อง|สแกน(?!ใบเซอร์|เอกสาร)|\bscan\w*\b`), 2], [re(String.raw `สุขภาพ|โรค|รูป|ภาพ|ตรวจ|\b(?:health|photo|picture)\b`), 1]]],
    ['reminder_troubleshoot', [
            [re(String.raw `เตือน|แจ้ง(?!ความ|ปัญหา|ข้อมูล|ชื่อ)|(?:มือถือ|โทรศัพท์|เครื่อง|แอป|ไอโฟน|iphone|android).{0,12}(?:สั่น|ดัง|เด้ง|มีเสียง|ขึ้นจอ)|ถึงเวลา(?:ให้|กิน|ป้อน)?ยา|\bnotif\w*|\bremind\w*|\balerts?\b|\balarms?\b|\b(?:vibrat\w*|buzz\w*|pop(?:s|ped)? ?up)\b`), 2],
            [re(String.raw `ไม่(?!เป็น|รู้|แน่ใจ|ต้อง)|หาย|เงียบ|(?:มา|เตือน|แจ้ง|เด้ง)ช้า|ช้าไป|ช้ากว่า|ยังเตือน|\b(?:not|never|no longer|stopped|missing|late|keeps?|still)\b|n't\b`), 3],
            [re(String.raw `ทำไม|\bwhy\b`), 1],
        ]],
    ['notification_settings', [[re(String.raw `แจ้งเตือน|\bnotifications?\b`), 2], [re(String.raw `เปิด|ปิด|ตั้งค่า|สวิตช์|อนุญาต|\b(?:turn (?:on|off)|enable|disable|settings?|permission|allow)\b`), 2]]],
    ['medicine_manage', [
            [re(FB_MED), 2],
            [re(String.raw `แก้(?!แพ้|ปวด|ไอ|อักเสบ|ท้อง|เมา|คัน|หวัด|ไข้)|เปลี่ยน|ปรับ|หยุด|เลิก|เอาออก|เอา\S{0,12}ออก|ลบ|เติม|ยกเลิก|\b(?:edit|change|update|stop|end|ended|finished|remove|delete|refill|restock|cancel|quit|take (?:it |\w+ )?off|done with)\b`), 2],
            [re(String.raw `จำนวน|สต็อก|หมด|เหลือ|ติ๊ก|นับ|\b(?:stock|count|ran out|run out|out of|tick|left)\b`), 2],
            [re(FB_CORRECTION), 2],
        ]],
    ['medicine', [
            [re(FB_MED), 2],
            [re(FB_LOG), 1],
            [re(String.raw `เตือน|เวลา|โมง|นาฬิกา|ทุ่ม|ตอนเช้า|ตอนเย็น|ก่อนนอน|ครึ่ง|\d{1,2}[:.]\d{2}|\b(?:reminders?|alarm|times?|o'?clock|am|pm|morning|evening)\b`), 2],
            [re(FB_CORRECTION), -2],
        ]],
    ['appointment_manage', [[re(String.raw `นัด|\b(?:appointments?|bookings?)\b`), 2], [re(String.raw `เลื่อน|ยกเลิก|แก้|เปลี่ยน|\b(?:reschedule|cancel|edit|change|move|postpone)\b`), 2]]],
    ['appointments', [[re(String.raw `นัด|\b(?:appointments?|bookings?)\b`), 2], [re(String.raw `${FB_LOG}|จอง|\bbook\b`), 1]]],
    ['weight', [[re(String.raw `น้ำหนัก|กิโล|ชั่ง|\b(?:weight|weigh\w*|kg)\b`), 2], [re(FB_LOG), 1], [re(FB_VIEW_WHERE), 1], [re(FB_BACKDATE), 2], [re(String.raw `กราฟ|\b(?:graph|chart)\b`), 1]]],
    ['quick_records', [[re(String.raw `กรูมมิ่ง|อาบน้ำ|ตัดขน|ตัดเล็บ|\bgroom\w*\b`), 2], [re(FB_LOG), 2]]],
    ['activity', [[re(String.raw `อาหาร|มื้อ|น้ำ(?!หนัก)|เดิน|นอน|\b(?:food|meals?|water|walks?|sleep|activit\w*)\b`), 2], [re(FB_LOG), 1], [re(FB_BACKDATE), 1], [re(String.raw `กราฟ|\b(?:graph|chart)\b`), 1]]],
    ['vaccine', [[re(String.raw `วัคซีน|เข็ม|\bvaccin\w*\b`), 2], [re(FB_LOG), 1], [re(FB_VIEW_WHERE), 1]]],
    ['health_history', [[re(String.raw `ตรวจสุขภาพ|ประวัติ(?:สุขภาพ|การรักษา|พบหมอ|พบสัตวแพทย์|ตรวจ)|พบสัตวแพทย์|การรักษา|พบหมอ|ไปหาหมอ|ใบตรวจ|ผลตรวจ|โน้ตหมอ|ตรวจเลือด|ผลเลือด|เจาะเลือด|ผลแล็บ|แล็บ|เอกซเรย์|เอ็กซเรย์|อัลตราซาวด์|ไปตรวจ|ไปคลินิก|ไปโรงพยาบาล|ทำหมัน|ผ่าตัด|ขูดหินปูน|\b(?:checkups?|check-ups?|vet visits?|lab (?:work|results?)|blood (?:test|work)|x-?rays?|ultrasound|spay\w*|neuter\w*|surgery|dental cleaning)\b`), 2], [re(String.raw `บันทึก|ลง(?:ผล|ข้อมูล|ประวัติ)?(?!ไป|มา)|จด|เก็บ(?:ผล|ข้อมูล|ไว้)|กรอก|\b(?:log|record|enter|save|add)\b`), 1]]],
    ['save_problem', [[re(String.raw `บันทึก|เซฟ|ข้อมูล|รายการ|\b(?:save|saved|sync|entry|entries)\b`), 1], [re(String.raw `ไม่ขึ้น|หาย|ไม่สำเร็จ|ผิดพลาด|error|ไม่เจอ|หาไม่เจอ|ไม่อัปเดต|\b(?:not (?:showing|saved|saving)|missing|disappeared|failed|lost)\b`), 3]]],
    ['records', [[re(String.raw `ประวัติ|ไทม์ไลน์|\b(?:records?|history|timeline)\b`), 2], [re(FB_VIEW_WHERE), 1], [re(String.raw `ตัวกรอง|กรอง|หน้าประวัติ|\b(?:filter|timeline)\b`), 1], [re(String.raw `ลบ|แก้|\b(?:delete|remove|edit)\b`), 1]]],
    ['membership', [[re(String.raw `สมาชิก|แพ็กเกจ|แพ็คเกจ|ทดลอง|ช่วงฟรี|(?:จ่าย(?:เงิน)?|เสียเงิน|เก็บเงิน|เสียค่า|ค่าบริการ).{0,24}(?:3|สาม)\s*เดือน|(?:ฟรี|ครบ|หลัง|หมด)\s*(?:3|สาม)\s*เดือน|ค่าแอป|(?:ใช้)?แอป(?:นี้)?\s*(?:ฟรี|เสียเงิน|ต้องจ่าย)|(?:สมัคร|ใช้แอป|ใช้งาน)(?:แล้ว)?.{0,10}(?:ต้อง)?(?:เสีย|จ่าย)(?:เงิน|ค่า)|\b(?:membership|subscription|subscribe|premium|trial|is the app free|after (?:the )?(?:3|three) months)\b`), 2], [re(String.raw `จ่าย|เงิน|ราคา|ค่า|ฟรี|ยกเลิก|ต่ออายุ|สมัคร|เท่าไหร่|เท่าไร|กี่บาท|\b(?:pay|price|cost|free|charge|cancel|renew|how much)\b`), 1], [re(String.raw `จ่าย|เงิน|\b(?:pay|charge)\b`), 1]]],
    ['paw_coin', [[re(String.raw `เหรียญ|\bpaw\s*coins?\b|\bcoins?\b`), 2], [re(String.raw `เติม|ซื้อ|เช็คอิน|เช็กอิน|check-?in|รับ|หมด|ฟรี|ทุกวัน|รายวัน|เพิ่ม|ได้|เก็บ|สะสม|หา|\b(?:collect|save up)\b|\b(?:buy|top ?up|earn|get|spend|balance|free|daily|every day|more)\b`), 1]]],
    ['account_delete', [[re(String.raw `บัญชี|แอคเค้าท์|แอคเคาท์|แอคเคาน์|\baccount\b`), 2], [re(String.raw `ลบ|ปิด|ยกเลิก|กู้คืน|\b(?:delete|remove|close|deactivate|restore|recover)\b`), 2]]],
    ['password_reset', [[re(String.raw `รหัสผ่าน|รหัส|พาสเวิร์ด|\bpassword\b|เข้าสู่ระบบไม่ได้|ล็อกอินไม่ได้|ล็อคอินไม่ได้|\bcan'?t (?:log|sign) ?in\b`), 2], [re(String.raw `ลืม|เปลี่ยน|รีเซ็ต|ตั้งใหม่|ไม่ได้|\b(?:forgot|forget|reset|change|lost)\b|n't\b`), 2]]],
    ['add_pet', [[re(String.raw `(?:เพิ่ม|สร้าง|ลงทะเบียน|ใส่ข้อมูล)\s*(?:ข้อมูล)?\s*(?:น้อง|สัตว์|หมา|แมว|โปรไฟล์|\bpet\b)|น้องตัวใหม่|ตัวที่สอง|\b(?:add|create|new)\b.{0,12}\b(?:pet|dog|cat|profile)\b`), 3]]],
    ['edit_pet', [[re(String.raw `(?:แก้|แก้ไข|เปลี่ยน)\s*(?:ข้อมูล)?\s*(?:ชื่อ|รูป|สายพันธุ์|พันธุ์|สี|วันเกิด|อายุ|เพศ|ไมโครชิป|แพ้|ข้อห้าม|โน้ต)|ชื่อเรียก|\b(?:edit|change|rename|update)\b.{0,15}\b(?:pet|name|photo|breed|profile|birthday)\b`), 3]]],
    ['delete_pet', [
            [re(String.raw `(?:ลบ|เอาออก)\s*(?:น้อง|สัตว์เลี้ยง|หมา|แมว|โปรไฟล์|\bpet\b)|(?:น้อง|สัตว์เลี้ยง|หมา|แมว).{0,10}ออกจาก(?:แอป|บัญชี|รายชื่อ)|\b(?:delete|remove)\b.{0,15}\b(?:pet|dog|cat|profile)\b|(?:ลบ|เอา\S{0,12}ออก)(?:ออก)?\s*(?:จาก)?\s*(?:แอป|บัญชี|รายชื่อ|ระบบ)|\b(?:delete|remove)\b.{0,20}\b(?:from|off)\b.{0,10}\b(?:the )?(?:app|account|list)\b`), 2],
            [re(String.raw `(?:ลบ|เอาออก)\s*(?:น้อง|สัตว์เลี้ยง|หมา|แมว|โปรไฟล์|\bpet\b)|(?:น้อง|สัตว์เลี้ยง|หมา|แมว).{0,10}ออกจาก(?:แอป|บัญชี|รายชื่อ)|\b(?:delete|remove)\b.{0,15}\b(?:pet|dog|cat|profile)\b`), 1],
            [re(String.raw `น้อง|หมา|แมว|สุนัข|สัตว์เลี้ยง|\b(?:pets?|dogs?|cats?|puppy|kitten)\b`), 1],
            [re(String.raw `เสีย(?:แล้ว|ชีวิต)|ตาย|จากไป|สิ้นใจ|ไปสวรรค์|สะพานสายรุ้ง|\b(?:passed away|died|dead|rainbow bridge|put to sleep|put down)\b`), 2],
        ]],
    ['switch_pet', [[re(String.raw `(?:สลับ|เปลี่ยน|เลือก)\s*(?:น้อง|ตัว|สัตว์|หมา|แมว|โปรไฟล์|\bpet\b)|\b(?:switch|change)\b.{0,12}\b(?:pets?|dogs?|cats?)\b`), 2], [re(String.raw `แชท|แชต|ข้อมูล|ปน|\b(?:chat|data|records?|active)\b`), 1]]],
    ['nearby_vet', [[re(String.raw `คลินิก|คลินิค|โรงพยาบาลสัตว์|รพ\.?\s*สัตว์|สัตวแพทย์|หมอสัตว์|ร้านอาบน้ำ|ร้านตัดขน|โรงแรม(?:สัตว์|หมา|แมว)|ฝากเลี้ยง|ร้านอุปกรณ์|\b(?:vets?|clinics?|animal hospital|groomers?|pet hotels?|pet shops?|boarding)\b`), 2], [re(String.raw `หา|ค้นหา|ใกล้|แถว|แผนที่|เบอร์|โทร|\b(?:find|search|near|nearby|map|phone|call|closest)\b`), 2]]],
    ['location_permission', [[re(String.raw `ตำแหน่ง|gps|\blocation\b`), 2], [re(String.raw `อนุญาต|เปิด|ปิด|ไม่ขึ้น|ไม่ได้|\b(?:allow|enable|turn on|permission|not working)\b`), 2]]],
    ['language_settings', [[re(String.raw `ภาษา(?:ไทย|อังกฤษ|แอป|ในแอป|เมนู)|(?:เปลี่ยน|สลับ|ตั้ง)\s*(?:เป็น)?ภาษา|\blanguage\b|english|อังกฤษ`), 2], [re(String.raw `เปลี่ยน|สลับ|ตั้ง|แปลง|ทำ(?:ให้)?เป็น|เป็นภาษา|ใช้ภาษา|\b(?:change|switch|set|translate|in thai|in english|to thai|to english)\b`), 2]]],
    ['buddy', [[re(String.raw `บัดดี้|บั๊ดดี้|เพื่อนซี้|ตัวลอย|น้องลอย|เพื่อนคู่ใจ|ลอยอยู่|ที่ลอย|ลอยไปมา|ตัวการ์ตูน|มาสคอต|\b(?:buddy|companion|floating|mascot)\b`), 3]]],
    ['pet_card', [[re(String.raw `การ์ดน้อง|บัตรน้อง|\bpet ?cards?\b`), 3]]],
    ['certificates', [[re(String.raw `ใบเซอร์|ทะเบียนพันธุ์|\bcertificates?\b|\bpedigree\b`), 3]]],
    ['privacy', [[re(String.raw `นโยบาย|ความเป็นส่วนตัว|เงื่อนไขการใช้|\b(?:privacy|terms)\b`), 3]]],
    ['referral', [[re(String.raw `ชวนเพื่อน|แนะนำเพื่อน|โค้ดชวน|โค้ดแนะนำ|\b(?:invite|referral|refer)\b`), 3]]],
    ['chat_mode', [[re(String.raw `agent|เอเจนต์|แชทธรรมดา|แชตธรรมดา|chat ธรรมดา|free chat|chat mode`), 2], [re(String.raw `ใช้|เลือก|สลับ|ต่างกัน|บันทึก|ฟรี|เสีย|\b(?:use|switch|difference|free|cost|save)\b`), 1]]],
    ['date_time_pickers', [[re(String.raw `วันที่|ปฏิทิน|\b(?:date|calendar)\b`), 2], [re(String.raw `เลือก|ใส่|พิมพ์|กรอก|เปลี่ยน|ไม่ได้|\b(?:pick|choose|select|type|enter|change)\b`), 1]]],
    ['tutorial', [[re(String.raw `คู่มือ|ช่วยเหลือ|\bfaq\b|\b(?:tutorial|guide)\b`), 3]]],
    ['app_overview', [[re(String.raw `แอป|petcare|\bapp\b`), 1], [re(String.raw `ทำอะไรได้|มีอะไร|ฟีเจอร์|เริ่มใช้|เริ่มต้น|\b(?:what can|features?|get started)\b`), 2]]],
];
const FALLBACK_MIN_SCORE = 3;
// Function-level topics; on a tie the object topic (medicine, weight, appointment…) wins.
const GENERIC_TOPICS = new Set(['reminder_troubleshoot', 'notification_settings', 'save_problem', 'records', 'switch_pet', 'app_overview', 'chat_mode', 'date_time_pickers', 'tutorial']);
const RESOLVABLE_TOPICS = new Set([...GENERIC_TOPICS].filter((id) => id !== 'save_problem' && id !== 'reminder_troubleshoot'));
const HUMAN_MEDICINE_NAME = new RegExp(emergency_1.HUMAN_PAINKILLER_NAMES, 'i');
/** Best app-help topic by keyword score, or null when the signal is weak or clinical. */
function scoreAppHelpFallback(message) {
    const q = String(message || '').normalize('NFC').toLowerCase().trim();
    if (!q || !(FB_USAGE_CUE.test(q) || FB_IMPERATIVE_ACTION.test(q)) || (FB_DATA_READ.test(q) && FB_RECORD_NOUN.test(q)))
        return null;
    if (FB_DO_FOR_ME.test(q) || hasClinicalSignal(q))
        return null;
    // Weak keyword evidence never overrides a clinical guard or the place-search answer,
    // unless the owner names an app control ("เอาออกจากแอป", "กดติ๊ก").
    if (((0, guard_1.matchGuard)(q) && !APP_CONTROL.test(q)) || (0, services_1.matchService)(q))
        return null;
    const scores = new Map();
    for (const [id, features] of FALLBACK_TOPICS) {
        if (!features[0][0].test(q))
            continue;
        const score = features.reduce((sum, [pattern, weight]) => sum + (pattern.test(q) ? weight : 0), 0);
        if (score >= FALLBACK_MIN_SCORE && score > (scores.get(id) ?? -Infinity))
            scores.set(id, score);
    }
    const ranked = [...scores].sort((a, b) => b[1] - a[1] || rank(a[0]) - rank(b[0]));
    if (!ranked.length)
        return null;
    const [top, second] = ranked;
    // A tie is ambiguous. Prefer the topic about a concrete object (medicine, weight…) over a
    // general one (reminders, records…); two of the same kind get the topic menu instead.
    if (second && second[1] === top[1]) {
        const topGeneric = GENERIC_TOPICS.has(top[0]), secondGeneric = GENERIC_TOPICS.has(second[0]);
        if (topGeneric === secondGeneric)
            return null;
        return appHelpContent_1.APP_HELP_CONTENT[topGeneric ? second[0] : top[0]] ? (topGeneric ? second[0] : top[0]) : null;
    }
    return appHelpContent_1.APP_HELP_CONTENT[top[0]] ? top[0] : null;
}
/** Whether the message's main object is one this topic is about (topics without keywords: yes). */
function topicObjectMatches(id, q) {
    const entries = FALLBACK_TOPICS.filter(([topic]) => topic === id);
    return !entries.length || entries.some(([, features]) => features[0][0].test(q));
}
function hasClinicalSignal(q) {
    // "ตรวจเลือด/ผลเลือด" is a clinic test to record, not bleeding.
    const clinicalText = q.replace(/ตรวจเลือด|ผลเลือด|เจาะเลือด|\bblood (?:test|work)\b/g, ' ');
    return FB_CLINICAL.test(clinicalText) || HUMAN_MEDICINE_NAME.test(q) || isClinicalDosingQuestion(q) || (0, food_1.matchFoods)(q).length > 0;
}
// ── Topic menu: app-related messages that no topic matched get a list of help topics
// instead of the generic "ระบุหมาหรือแมว · อายุ" reply. Used at the end of the pipeline only. ──
const MENU_TH = 'หนูช่วยบอกวิธีใช้แอปได้ค่ะ เลือกเรื่องที่ต้องการแล้วพิมพ์ถามได้เลย\n• เพิ่ม แก้ไข หรือลบข้อมูลน้อง\n• ยาและการเตือนยา (เพิ่มยา แก้เวลา หยุดยา เติมจำนวน)\n• แจ้งเตือนไม่มาหรือไม่ดัง\n• บันทึกน้ำหนัก อาหาร น้ำ เดิน นอน (ย้อนหลังได้)\n• วัคซีน ตรวจสุขภาพ และประวัติน้อง (Records)\n• นัดหมาย (บันทึก เลื่อน ยกเลิก)\n• ค้นหาคลินิกและร้าน\n• บัญชี รหัสผ่าน ภาษา สมาชิก และ Paw Coin\n\nพิมพ์สั้น ๆ เช่น “แก้เวลาเตือนยายังไง” หรือ “ลบบัญชียังไง” ได้เลยค่ะ';
const MENU_EN = 'I can explain how to use the app. Pick a topic and ask about it:\n• Add, edit or delete a pet\n• Medicines and reminders (add, change times, stop, restock)\n• Reminders not arriving\n• Log weight, food, water, walks or sleep (past dates allowed)\n• Vaccinations, checkups and Records\n• Appointments (record, reschedule, cancel)\n• Find clinics and businesses\n• Account, password, language, membership and Paw Coin\n\nFor example: “How do I change a medicine reminder time?” or “How do I delete my account?”';
const MENU_STRONG = /แอป|ปุ่ม|หน้าจอ|เมนู|แท็บ|แจ้งเตือน|สมาชิก|เหรียญ|paw|บัญชี|ภาษา(?:ไทย|อังกฤษ|แอป|ในแอป|เมนู)|(?:เปลี่ยน|สลับ|ตั้ง)\s*(?:เป็น)?ภาษา|ล็อกอิน|ล็อคอิน|เข้าสู่ระบบ|สมัคร|ตั้งค่า|โปรไฟล์|การ์ดน้อง|ฟีเจอร์|\b(?:app|button|screen|page|menu|tab|notifications?|reminders?|account|password|log ?in|sign ?(?:in|up)|settings?|profile|membership|coins?|features?)\b/i;
const MENU_DATA_ACTION = /(?:บันทึก|ลง|กรอก|ลบ|แก้ไข|แก้|เปลี่ยน|ย้าย|ตั้ง|เพิ่ม)\s*(?:ข้อมูล|รายการ|ประวัติ|น้ำหนัก|วัคซีน|นัด|รูป|ชื่อ|โปรไฟล์|เวลา(?:เตือน)?|ยา(?!ก|ว|ง|ม(?!า)|ย(?!ั)))|(?:ลบ|เพิ่ม)\s*น้อง|^(?:บันทึก|จด)(?:ไว้)?ว่า|\b(?:log|record|enter|delete|remove|edit|change|update|add)\b.{0,12}\b(?:data|entry|entries|medicines?|weights?|vaccin\w*|appointments?|photos?|names?|records?|profile)\b/i;
function menuReply(language) {
    return { text: language === 'en' ? MENU_EN : MENU_TH, kind: 'app_info', intent: 'app_help:clarify', confidence: 0.6, suggestAgent: false };
}
/** Topic menu for an app-related message that nothing else answered; never for clinical, food or saved-data reads. */
function appHelpMenu(message, language = 'th') {
    const q = String(message || '').normalize('NFC').toLowerCase().trim();
    if (!q)
        return null;
    if (!(MENU_STRONG.test(q) || MENU_DATA_ACTION.test(q)))
        return null;
    if (hasClinicalSignal(q) || (0, guard_1.matchGuard)(q) || (FB_DATA_READ.test(q) && FB_RECORD_NOUN.test(q)))
        return null;
    // "ควรพาไปตรวจ…ได้ไหม" asks for advice; the menu is only for using the app.
    if (/ควร|ดีไหม|ดีมั้ย|ดีกว่า|อะไรดี|ไหนดี|ยังไงดี|แบบไหนดี|\bshould\b|\bis it (?:ok|okay|safe|normal)\b/i.test(q) && !/แอป|ปุ่ม|เมนู|แท็บ|\b(?:app|button|menu|tab)\b/i.test(q))
        return null;
    return menuReply(language);
}
/** Returns a concise, UI-verified help response for the free chat, otherwise null. */
function matchAppHelp(message, language = 'th') {
    const q = String(message || '').normalize('NFC').toLowerCase().trim();
    if (!q)
        return null;
    // English record questions such as “How much does my pet weigh?” or
    // “Which medicine is saved?” must reach the saved-data readers.
    const englishHelpIntent = EN_HOW.test(q) || EN_EXTRA_HELP.test(q);
    // Outside the strict English gate only the scored fallback may answer (it refuses
    // saved-data reads such as "How much does my pet weigh?").
    const strictAllowed = !(language === 'en' && !/[ก-๙]/.test(q) && !englishHelpIntent);
    // Mixed-language instructions must not bypass the clinical safety route.
    if (/(?:หายใจไม่ออก|หมดสติ|ฉี่ไม่ออก|อาเจียน|ท้องเสีย|ไม่กินอาหาร|หยุดกิน|เลือดออกมาก|กินดอกลิลลี่|ขนาดยาเท่า|ยาอะไรดี)/.test(q))
        return null;
    // Dose amounts or "can I add/stop medicine?" belong to the clinical guard.
    if (isClinicalDosingQuestion(q))
        return null;
    // A dated value request is a records read even when social filler contains
    // “มือใหม่/อยาก/ตรงไหน”; only an explicit save instruction is app help.
    if (/(?:ชั่ง)?น้ำหนักล่าสุดเมื่อไหร่/.test(q) && !/(?:วิธี|ทำไง|ยังไง|บันทึก|เพิ่ม|กรอก).{0,15}น้ำหนัก/.test(q))
        return null;
    // คำถามดูแลสุขภาพที่มีคำว่า “เก็บประวัติ” ไม่ใช่คำถามใช้แอป หากไม่ได้ระบุ UI ให้ความรู้สุขภาพเป็นคนตอบ
    if (/(?:เห็บ|หมัด)/.test(q) && /ดูแล/.test(q) && !SYSTEM_SCOPE.test(q))
        return null;
    // “ขอดู/เช็ก” คือขออ่านบันทึกจริง ไม่ใช่ถามวิธีใช้งาน ให้ record intent ตอบจากข้อมูลน้อง
    if (/(?:เช็ก|ดู).{0,18}(?:รายการยา|ยาของน้อง)|ยาอะไรอยู่ในแอป|อยากจดการกินน้ำ/.test(q))
        return null;
    // อาการบันทึกหาย/ไม่สำเร็จ ต้องชนะหัวข้อข้อมูล เพื่อให้ผู้ใช้ได้วิธีแก้ก่อน
    const orderedRules = [...HELP_RULES].sort((a, b) => rank(a.id) - rank(b.id));
    // "กรอง / filter" หมายถึงการดูไทม์ไลน์ แม้มีคำว่า "น้ำหนัก" อยู่ด้วย
    // ให้ route ไป Record ก่อน ไม่ตอบขั้นตอนเพิ่มน้ำหนักผิดหน้าจอ
    const recordsRule = HELP_RULES.find((candidate) => candidate.id === 'records');
    const englishTopic = englishHelpIntent
        ? ENGLISH_HELP_TOPICS.find(([, pattern]) => pattern.test(q))?.[0] : undefined;
    const strictMatches = strictAllowed ? orderedRules.filter(candidate => candidate.patterns.some(pattern => pattern.test(q))) : [];
    // "เปลี่ยนสายพันธุ์น้องที่ใส่ผิด" matches switch_pet and edit_pet; the breed (edit_pet's object) decides.
    // Only function-level topics give way; problem topics (save/reminder) keep their deliberate priority.
    const exactRule = strictMatches.length > 1 && RESOLVABLE_TOPICS.has(strictMatches[0].id) && !topicObjectMatches(strictMatches[0].id, q)
        ? strictMatches.find(candidate => FALLBACK_TOPICS.some(([topic]) => topic === candidate.id) && topicObjectMatches(candidate.id, q)) || strictMatches[0]
        : strictMatches[0];
    const rule = !strictAllowed ? undefined : exactRule || (englishTopic ? HELP_RULES.find(candidate => candidate.id === englishTopic) : undefined) || (/(?:กรอง|filter).{0,24}(?:ประวัติ|record|timeline|บันทึก)|(?:ประวัติ|record|timeline|บันทึก).{0,24}(?:กรอง|filter)/i.test(q) ? recordsRule : undefined) || orderedRules.find((candidate) => candidate.patterns.some((pattern) => pattern.test(q)) ||
        (!!candidate.topic && HELP_CUE.test(q) && (SYSTEM_SCOPE.test(q) || RECORDING_ACTION.test(q)) && candidate.topic.test(q)));
    if (!rule) {
        // No exact rule: try the keyword-scored fallback before asking a follow-up.
        const scoredTopic = scoreAppHelpFallback(q);
        if (scoredTopic)
            return helpReply(scoredTopic, language, 0.85);
        // คำถามใช้งานที่จับหมวดไม่ได้: ตอบเป็นทางเลือกในโหมดฟรี ไม่เดาเรื่องสุขภาพ
        if (strictAllowed && HELP_CUE.test(q) && SYSTEM_SCOPE.test(q)) {
            return menuReply(language);
        }
        return null;
    }
    return helpReply(rule.id, language, 0.98);
}
function helpReply(id, language, confidence) {
    return {
        text: appHelpContent_1.APP_HELP_CONTENT[id][language] + (language === 'en' ? '\n\nTell me which screen you are on if you need the next step.' : FREE_FOOTER),
        kind: 'app_info',
        intent: `app_help:${id}`,
        confidence,
        suggestAgent: false,
    };
}

},
"guard":function(require,module,exports){
"use strict";
// lib/smartBot/guard.ts
// ─────────────────────────────────────────────────────────────────────────
// "กำแพงกันตอบเกินขอบเขต" — ต้องทำงาน **ก่อน** ตัวตอบทุกตัว (ยกเว้นฉุกเฉิน)
//
// ขอบเขตห้าม (จาก docs/Pet-Knowledge-Base-Plan-2569-08-27.md §6):
//   ❌ วินิจฉัยโรค
//   ❌ สั่ง/ระบุขนาดยา
//   ❌ บอกให้หยุดยา
//   ❌ บอกว่า "ไม่ต้องพบสัตวแพทย์"
//   ❌ ให้ตารางวัคซีน / จำนวนเข็ม
//
// ข้อสำคัญ: เรื่องพวกนี้ห้ามส่งต่อให้ Agent ให้ตอบแทนด้วย (suggestAgent = false)
// เพราะเป็นขอบเขตที่ทั้งระบบห้ามตอบ ไม่ใช่แค่ "โหมดฟรีตอบไม่ได้"
// ─────────────────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.GUARD_CLOSING = exports.GUARD_RULES = void 0;
exports.isStockReadQuestion = isStockReadQuestion;
exports.matchGuard = matchGuard;
const CLOSING = '\n\nข้อมูลจากแอปนี้ไม่แทนการตรวจโดยสัตวแพทย์ค่ะ 🐾';
exports.GUARD_RULES = [
    {
        id: 'serious_condition',
        patterns: [
            /(?:แมว|น้อง|ลูก).{0,14}(?:ป่วยเป็น|เป็น|วินิจฉัยว่าเป็น)\s*fip\b/i,
            /fip\s*(?:แบบ)?\s*(?:เปียก|แห้ง)/i,
            /(?:หมา|สุนัข|น้อง).{0,14}(?:เป็น|ป่วยเป็น|วินิจฉัยว่าเป็น).{0,8}พยาธิในเม็ดเลือด/,
        ],
        replyTh: 'โรคที่ระบุมานี้ **ต้องให้สัตวแพทย์ดูแลและติดตามโดยตรงค่ะ** หนูไม่สามารถยืนยันการวินิจฉัย เลือกยา หรือบอกขนาดยาแทนหมอได้\n\n' +
            '• ถ้าเป็น **FIP**: Merck ระบุว่าอาจมีน้ำในช่องท้อง/ช่องอก เบื่ออาหาร น้ำหนักลด และหายใจลำบากได้ — ติดต่อสัตวแพทย์ที่รักษาอยู่ **วันนี้**; ถ้าหายใจลำบาก เหงือกเขียว/ซีด ชัก หรือหมดสติ ให้ไปโรงพยาบาลสัตว์ทันที\n' +
            '• ถ้าเป็น **พยาธิในเม็ดเลือด**: Merck ระบุว่าความรุนแรงมีได้ตั้งแต่เล็กน้อยถึงโลหิตจางรุนแรงและเสียชีวิต ต้องตรวจเลือดยืนยันและให้หมอเลือกการรักษา; ถ้าอ่อนแรงมาก เหงือกซีด/เหลือง ปัสสาวะแดง หายใจลำบาก หรือล้ม ให้ไปฉุกเฉินทันที\n\n' +
            'แหล่งอ้างอิง: https://www.merckvetmanual.com/infectious-diseases/feline-infectious-peritonitis/feline-infectious-peritonitis · https://www.merckvetmanual.com/dog-owners/blood-disorders-of-dogs/blood-parasites-of-dogs',
    },
    {
        id: 'drug_dosage',
        patterns: [
            /(ให้|กิน|ป้อน|ฉีด).{0,10}ยา.{0,12}(กี่|เท่าไห?ร่|ขนาด|โดส|ปริมาณ|มิลลิ|มก|mg|ซีซี|cc|เม็ด)/,
            /ขนาดยา|โดสยา|กี่โดส|ครบโดส|กี่เม็ด|กี่ ?cc|กี่มิลลิ/,
            /ยา.{0,6}(กี่|เท่าไห?ร่).{0,6}(ครั้ง|วัน|มื้อ)/,
            /ยา.{0,12}(กี่ครั้ง|วันละกี่|กี่วัน|กี่มื้อ)/,
            /คำนวณ.{0,12}(โดส|ขนาดยา|ปริมาณยา)/,
            /สูตร.{0,12}(คำนวณ|โดส|ยา)/,
            /ยา.{0,12}กี่\s*(มิล|ซีซี|cc|มก)/,
            /เพิ่มยา|ลดยา|ยา.{0,8}(สองเท่า|ซ้ำ)|แบ่งครึ่ง/,
            // "ยาฆ่าเห็บให้กี่หยด" / "เติมยาให้เยอะขึ้นได้ไหม" (26 Oct 2026 app-help audit)
            /ยา.{0,16}กี่\s*(หยด|ช้อน|ซีซี|มล)|(เติม|ให้)ยา.{0,12}(มากขึ้น|เยอะขึ้น|เพิ่มขึ้น)/,
        ],
        replyTh: 'เรื่อง **ขนาดยาและวิธีให้ยา** หนูตอบแทนไม่ได้เลยค่ะ — ขนาดยาขึ้นกับน้ำหนัก อายุ โรคประจำตัว และตัวยาที่ใช้ ถ้าคำนวณผิดอาจเป็นอันตรายถึงชีวิต\n\nต้องให้ **สัตวแพทย์ที่ได้ตรวจตัวจริง** เป็นคนกำหนดเท่านั้นค่ะ\n\nสิ่งที่หนูช่วยได้: บันทึกยาที่หมอสั่งไว้ในแอป เตือนเวลาให้ยา และสรุปว่าให้ครบหรือยัง — ลองถามว่า "ยาของน้องมีอะไรบ้าง" ได้เลยค่ะ',
    },
    {
        id: 'unsafe_exposure',
        patterns: [
            /(น้ำยา|ผงซักฟอก|สารเคมี|ยาเบื่อ|ยาฆ่าแมลง).{0,24}(ได้ไหม|ได้มั้ย|ได้รึเปล่า|ได้หรือเปล่า|กินได้|ดื่มได้)/,
        ],
        replyTh: 'อย่าให้น้องกินหรือสัมผัสน้ำยา/สารเคมี/ยาเบื่อเด็ดขาดค่ะ — หนูช่วยยืนยันวิธีใช้สิ่งพวกนี้กับสัตว์ไม่ได้\n\n' +
            'ถ้ายังไม่ได้เกิดขึ้น ให้เก็บสารนั้นให้พ้นมือและใช้ผลิตภัณฑ์ที่สัตวแพทย์แนะนำเท่านั้น; ถ้าน้องกินหรือสัมผัสไปแล้ว ให้พาไปโรงพยาบาลสัตว์ทันที พร้อมฉลากหรือรูปผลิตภัณฑ์ค่ะ',
    },
    {
        id: 'stop_medicine',
        patterns: [
            // ⚠️ กับดักภาษาไทย (เจอจริง 1 ก.ย. 2569 รอบเทรน 2 — ห้ามถอยกลับเป็น .{0,6})
            //    เดิมเป็น /(หยุด|เลิก|งด).{0,6}ยา/ ซึ่งกว้างเกินจนกินคำถามคนละเรื่อง
            //    "แมวชอบข่วนโซฟา ทำไ|งดี ไม่อยา|กดุมัน" → "งด" มาจาก "ไงดี" + "ยา" มาจาก "อยาก"
            //    ⇒ ต้องผูก "หยุด/เลิก/งด" ติดกับคำว่า "ยา" โดยมีได้แค่คำเชื่อมที่กำหนดไว้
            //    และต้องกัน "ยาก" / "ยาว" ด้วย negative lookahead
            /(หยุด|เลิก|งด)\s?(กิน|ทาน|ให้|ป้อน|ฉีด|ใช้|การให้|การกิน)?\s?ยา(?=ก่อน|เอง|แล้ว|ต่อ|เลย|ได้|ไม่|หน่อย|นะ|ที|เพราะ|ดีขึ้น|อาการ|$|\s|[ๆ,.!?])/,
            /ยา.{0,8}(หยุดได้|เลิกได้|ไม่ต้องกิน|ไม่กินต่อ)/,
            /กินยาไม่ครบ.{0,12}(ได้ไหม|ได้มั้ย|เป็นไร)/,
        ],
        replyTh: 'การ **หยุดยาก่อนครบกำหนด** หนูบอกแทนไม่ได้ค่ะ ยาบางชนิดถ้าหยุดกลางคันจะทำให้เชื้อดื้อยาหรืออาการกลับมาหนักกว่าเดิม\n\nกรุณาโทรถามคลินิกที่สั่งยาให้ก่อนตัดสินใจนะคะ — และถ้าน้องมีอาการข้างเคียง (อาเจียน ซึม ไม่กินข้าว) ให้แจ้งหมอทันทีค่ะ',
    },
    {
        id: 'human_medicine',
        patterns: [
            /(ให้|กิน|ป้อน).{0,10}(ยาคน|ยาของคน|ยาแก้ปวดคน)/,
            /ยาแก้แพ้ของคน|ยาคน.{0,20}(ให้|เอา|ใช้)/,
            /ยาหยอดตาคน|ยาฆ่าเชื้อของคน/,
            /ยานอนหลับ(?:ของคน)?|ยาสลบของคน/,
            /(วิตามิน|อาหารเสริม|supplement).{0,18}(ของคน|คน|หมา|แมว|น้อง|ได้ไหม|ได้มั้ย|กิน|ให้|ป้อน)/,
            /(พารา|ซาร่า|ไอบูโพรเฟน|ibuprofen|แอสไพริน|aspirin|ยาแก้อักเสบของคน|ยาลดไข้คน).{0,24}(ได้ไหม|ได้มั้ย|ได้รึเปล่า|ได้หรือเปล่า|กินได้)/,
            /(ยาคน|ยาของคน).{0,10}(ได้ไหม|ได้มั้ย|ได้รึเปล่า|ได้หรือเปล่า)/,
        ],
        replyTh: '⚠️ **ห้ามให้ยาหรือวิตามิน/อาหารเสริมของคนกับหมาแมวเองเด็ดขาดค่ะ**\n\nยาแก้ปวด/ลดไข้ของคนหลายตัวเป็นพิษต่อสัตว์เลี้ยง โดยเฉพาะ **พาราเซตามอลในแมว** ที่ตำราสัตวแพทย์ Merck ระบุว่าห้ามใช้ เพราะทำให้เกิดภาวะเลือดผิดปกติที่ถึงตายได้\n\nถ้าน้องเจ็บหรือมีไข้ หรืออยากเสริมวิตามิน กรุณาให้สัตวแพทย์เลือกผลิตภัณฑ์และวิธีใช้ที่ถูกต้องค่ะ — และถ้า **ให้ไปแล้ว** ให้ติดต่อโรงพยาบาลสัตว์ทันที\n\nแหล่งอ้างอิง: https://www.merckvetmanual.com/toxicology/toxicoses-from-human-analgesics/toxicoses-from-human-analgesics-in-animals',
    },
    {
        id: 'vaccine_schedule',
        patterns: [
            // ⚠️ ขยายช่องว่างจาก .{0,14} เป็น .{0,24} (1 ก.ย. 2569 รอบเทรน 2)
            //    เดิมพลาดคำถามที่มีคำขั้นกลางยาว เช่น
            //    "วัคซีนน้องหมาและน้องแมว ต้องฉีดอะไรบ้าง" (คั่น 18 ตัวอักษร)
            //    "ขอความรู้ ฉีดวัคซีนให้ลูกหมา ควรมีความถี่เท่าไรกันแน่"
            //    → เดิมตกไป handoff คือบอตเงียบ ทั้งที่ควรตอบด้วยกำแพงกันตอบเกินขอบเขต
            /(วัคซีน|เข็ม).{0,24}(กี่เข็ม|กี่ครั้ง|กี่ชนิด|กี่แบบ|ตอนอายุ|อายุเท่าไห?ร่|ความถี่|ทุกกี่|ต้องฉีดอะไร|ฉีดอะไรบ้าง|มีอะไรบ้าง|ครบทุกช่วงวัย)/,
            /ตารางวัคซีน|โปรแกรมวัคซีน|ตารางฉีด(วัคซีน)?/,
            /(ควร|ต้อง|จำเป็นต้อง).{0,10}ฉีดวัคซีน.{0,12}(เมื่อไห?ร่|ตอนไหน|อายุ|ไหม|มั้ย|เลยได้)/,
            // ⚠️ ห้ามใส่ "เท่าไร/เท่าไหร่" เดี่ยว ๆ ตรงนี้ — จะไปกิน "ฉีดวัคซีนสุนัข ราคาเท่าไหร่"
            //    ซึ่งเป็นคำถามราคา ต้องให้ตัวตอบเรื่องค่าใช้จ่ายจัดการ (cost:no_price_data)
            /ฉีดวัคซีน.{0,16}(ความถี่|บ่อยแค่ไหน|กี่ครั้ง)/,
            /ฉีดวัคซีน.{0,20}(ข้ามเข็ม|ข้ามนัด|เลื่อนได้|ได้ไหม|ได้มั้ย)/,
            /(ข้ามเข็ม|ข้ามนัด).{0,12}วัคซีน/,
            /วัคซีน.{0,20}(เข็มต่อไป|ครั้งต่อไป).{0,12}(เลื่อน|ข้าม)/,
            // "วัคซีนหมาสำคัญยังไง มีกี่ชนิด ป้องกันโรคอะไรได้บ้าง"
            /วัคซีน.{0,20}(ป้องกันโรคอะไร|กันโรคอะไร)/,
        ],
        replyTh: 'ตารางวัคซีน (ฉีดกี่เข็ม · เข็มไหนตอนอายุเท่าไร · กระตุ้นเมื่อไร) หนูให้ไม่ได้ค่ะ — โปรแกรมวัคซีนต่างกันตามชนิดวัคซีนที่คลินิกใช้ อายุ สุขภาพ และประวัติเดิมของน้อง ถ้าอิงตารางผิดจะเสียทั้งเงินและภูมิคุ้มกัน\n\nให้ **สัตวแพทย์ประจำตัว** เป็นคนวางโปรแกรมนะคะ\n\nสิ่งที่หนูทำให้ได้: เก็บ **วัคซีนที่ฉีดไปแล้ว** และ **วันนัดครั้งถัดไปที่หมอให้มา** แล้วเตือนก่อนถึงวัน — ลองถามว่า "วัคซีนของน้องนัดวันไหน" ได้เลยค่ะ',
    },
    {
        id: 'diagnosis',
        patterns: [
            /(เป็น|ป่วยเป็น).{0,10}โรคอะไร/,
            /(นี่|อันนี้|อาการนี้).{0,8}(คือ|เป็น).{0,6}โรค/,
            /(ใช่|เป็น(?!อาหาร|เม็ด|เปียก|ที่|เวลา|เพื่อน|ประจำ|ไง|ยังไง|อย่างไร)).{0,14}(หรือเปล่า|รึเปล่า|ไหม|มั้ย).{0,4}$/,
            /วินิจฉัย|เป็นอะไรกันแน่|เป็นอะไรคะ|เป็นอะไรครับ/,
            /เป็นอะไรแน่|เป็นอะไรเลย|เป็นอะไร\s*กันแน่/,
            /เป็นอะไร(?:\s|$|หน่อย|ที|เลย|นะ)/,
            /(ช่วย)?ดู(ให้)?หน่อย.{0,10}เป็นอะไร/,
            /(ก้อน|ตุ่ม|บวม).{0,12}(ผิวหนัง|ตัว|คอ|ท้อง).{0,8}(คืออะไร|เป็นอะไร|อันตรายไหม|ทำไง)/,
            /(หายไหม|หายมั้ย|หายหรือเปล่า|จะหายไหม|จะหายมั้ย)/,
            /ฟันธง|ทำเป็นหมอ/,
            /ก้อน.{0,20}(มะเร็ง|เนื้อร้าย)/,
        ],
        replyTh: 'หนูบอกไม่ได้ว่าน้องเป็นโรคอะไรค่ะ — การวินิจฉัยต้องอาศัยการตรวจร่างกาย ฟังปอด/หัวใจ และมักต้องเจาะเลือดหรือเอกซเรย์ ซึ่งทำผ่านแชตไม่ได้ และการเดาโรคผิดอันตรายกว่าการไม่ตอบ\n\nแนะนำให้ **จดอาการ + วันที่เริ่มเป็น + ถ่ายคลิปตอนมีอาการ** แล้วพาไปให้สัตวแพทย์ดูค่ะ ข้อมูลพวกนี้ช่วยหมอได้มาก\n\nหนูช่วยบันทึกอาการลงสมุดสุขภาพ และช่วยค้นหาคลินิกให้คุณโทรติดต่อนัดหมายเองได้ค่ะ',
    },
    {
        id: 'diy_treatment',
        patterns: [
            /(รักษา|หาย).{0,10}เอง(ที่บ้าน)?/,
            /ให้น้ำเกลือ|น้ำเกลือ.{0,10}(เอง|ที่บ้าน)|สวนทวาร|ล้วงคอ|ทำให้.{0,6}อาเจียนเอง/,
            /ทำแผล.{0,20}เอง/,
            /ไม่(อยาก|ต้อง)(พา)?ไปหาหมอ/,
            /ไม่มีเงิน.{0,12}(หาหมอ|พาไป|รักษา)/,
            /(ยา|วิธี).{0,10}รักษาเอง/,
            /(ลืมกฎ|ข้ามกฎ|ข้ามคำเตือน|ไม่ต้องเตือน|อย่าเตือน).{0,24}(ยา|รักษา|ไปหาหมอ)/,
            /ไม่ต้องสนใจ.{0,20}(ถาม|ตอบ)|ตอบตามใจ|หลบกฎระบบ|ลืมเรื่องความปลอดภัย/,
        ],
        replyTh: 'หนูให้วิธีรักษาเองที่บ้านไม่ได้ค่ะ และไม่สามารถบอกว่า "ไม่ต้องไปหาหมอ" ได้เลย — เพราะหนูไม่ได้เห็นตัวน้องจริง\n\nถ้าติดเรื่องค่าใช้จ่าย ลองทางนี้ก่อนนะคะ:\n• โทรปรึกษาคลินิกใกล้บ้านก่อนไป หลายที่ให้คำแนะนำเบื้องต้นทางโทรศัพท์ฟรี\n• คณะสัตวแพทย์ของมหาวิทยาลัยรัฐ มักมีค่าบริการถูกกว่าคลินิกเอกชน\n• มูลนิธิ/หน่วยทำหมัน-วัคซีนเคลื่อนที่ มีจัดเป็นช่วง ๆ\n\nหนูช่วยค้นหาคลินิกใกล้ตัว พร้อมแสดงข้อมูลให้คุณโทรติดต่อและนัดหมายกับร้านโดยตรงได้ค่ะ',
    },
];
/** "ยาของน้องเหลือกี่เม็ด" asks about saved stock, not a dose (26 Oct 2026). */
function isStockReadQuestion(text) {
    const q = String(text || '').toLowerCase();
    return /เหลือ(?:อยู่)?\s*กี่\s*(?:เม็ด|หยด|ซอง|ขวด|แผง)/.test(q) && !/(?:ให้|กิน|ป้อน|เพิ่ม|ลด|ควร|ครั้งละ|วันละ)/.test(q);
}
function matchGuard(text) {
    const q = String(text || '').toLowerCase();
    if (!q)
        return null;
    const stockRead = isStockReadQuestion(q);
    for (const rule of exports.GUARD_RULES) {
        if (stockRead && rule.id === 'drug_dosage')
            continue;
        for (const p of rule.patterns) {
            const m = q.match(p);
            if (m)
                return { rule, matched: m[0] };
        }
    }
    return null;
}
exports.GUARD_CLOSING = CLOSING;

},
"food":function(require,module,exports){
"use strict";
// lib/smartBot/food.ts
// ตอบคำถาม "กินได้ไหม / ห้ามกินอะไร" จากตารางเดียวกับ DB (sql/094)
// ข้อมูลมาจาก lib/smartBot/foodSafety.generated.ts ซึ่ง generate จาก SQL โดยตรง
// → ห้ามพิมพ์ข้อมูลอาหารใหม่ในไฟล์นี้เด็ดขาด ถ้าจะเพิ่มต้องแก้ที่ sql/094 แล้ว regenerate
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchFoods = matchFoods;
exports.isGeneralFoodQuestion = isGeneralFoodQuestion;
exports.formatFoodAnswer = formatFoodAnswer;
exports.formatToxicList = formatToxicList;
const foodSafety_generated_1 = require("./foodSafety.generated");
/** คำพ้อง/คำที่คนไทยพิมพ์จริง → ชื่อในตาราง (nameEn) */
const ALIASES = {
    Chocolate: ['ช็อค', 'ช็อก', 'ช็อคโกแลต', 'ช็อกโกแลต', 'โกโก้', 'บราวนี่', 'chocolate'],
    Xylitol: ['ไซลิทอล', 'หมากฝรั่ง', 'xylitol', 'ลูกอมไม่มีน้ำตาล'],
    'Grapes and raisins': ['องุ่น', 'ลูกเกด', 'เรซิน'],
    Onion: ['หัวหอม', 'หอมใหญ่', 'หอมหัวใหญ่', 'หอมแดง'],
    Garlic: ['กระเทียม'],
    'Chives and leeks': ['กุยช่าย', 'ต้นหอม', 'หอมแบ่ง'],
    Alcohol: ['เหล้า', 'เบียร์', 'ไวน์', 'แอลกอฮอล์', 'สุรา'],
    'Macadamia nuts': ['แมคคาเดเมีย', 'มะคาเดเมีย'],
    'Coffee and caffeine': ['กาแฟ', 'คาเฟอีน', 'ชาเขียว', 'เครื่องดื่มชูกำลัง', 'กระทิงแดง'],
    'Raw yeast dough': ['แป้งโด', 'แป้งดิบ', 'โดว์', 'ยีสต์'],
    Avocado: ['อะโวคาโด', 'อโวคาโด', 'avocado'],
    'Salt and salty snacks': ['เกลือ', 'ของเค็ม', 'มันฝรั่งทอด', 'ขนมเค็ม', 'เค็มจัด'],
    'Raw or undercooked meat and eggs': ['เนื้อดิบ', 'ไข่ดิบ', 'หมูดิบ', 'ไก่ดิบ'],
    Bones: ['กระดูก', 'กระดูกไก่', 'ก้าง'],
    'Nuts (general)': ['ถั่ว', 'อัลมอนด์', 'วอลนัท', 'พีแคน'],
    'Milk and dairy': ['นม', 'นมวัว', 'ชีส', 'โยเกิร์ต', 'ผลิตภัณฑ์นม'],
    Citrus: ['ส้ม', 'มะนาว', 'เลมอน', 'เกรปฟรุต'],
    'Coconut and coconut oil': ['มะพร้าว', 'กะทิ', 'น้ำมันมะพร้าว'],
    'Cooked plain chicken': ['อกไก่', 'ไก่ต้ม', 'ไก่ต้มสุก', 'เนื้อไก่ต้ม'],
    Carrot: ['แครอท', 'แคร์รอต'],
    'Plain cooked rice': ['ข้าวสวย', 'ข้าวสุก', 'ข้าวเปล่า'],
    'Watermelon (seedless, no rind)': ['แตงโม'],
    'Apple (no seeds/core)': ['แอปเปิล', 'แอปเปิ้ล'],
    'Raw fish (regular feeding)': ['ปลาดิบ', 'ปลาสด', 'ซาชิมิ'],
};
const STATUS_LABEL = {
    toxic: '🔴 เป็นพิษ — ห้ามให้เด็ดขาด',
    avoid: '🟠 ควรเลี่ยง',
    limited: '🟡 ให้ได้น้อยมาก / ควรเลี่ยง',
    generally_safe: '🟢 โดยทั่วไปให้ได้ในปริมาณน้อย',
};
/** เลือกแถวที่ตรงกับสัตว์ตัวนี้ */
function appliesTo(row, species) {
    if (row.species === 'both')
        return true;
    return row.species === species;
}
/**
 * ⚠️ บั๊กที่เคยเจอจริง (แก้ 1 ก.ย. 2569 — ห้ามถอยกลับ)
 * ภาษาไทยไม่เว้นวรรค การใช้ `includes()` ตรง ๆ กับคำสั้นทำให้แมตช์ทับคำอื่น เช่น
 *   "กลับบ้านมา..." → "บ้าน|มา" มีลำดับตัวอักษร "นม" อยู่ข้างใน → เจอเป็น "นม (Milk)"
 *   "จนมาเมื่อคืน แมวตกจากชั้น 3" → เจอ "นม" เหมือนกัน
 * ผลคือคำตอบเรื่องอาหาร **ไปบังเคสฉุกเฉินจริง** (แมวตกตึก) ซึ่งอันตรายมาก
 *
 * วิธีกัน: ถ้าคำที่จะแมตช์สั้น (≤ 3 ตัวอักษร) ตัวอักษรถัดไปต้องไม่ใช่
 * "สระ/วรรณยุกต์ที่เกาะพยัญชนะตัวสุดท้าย" — เพราะถ้าเกาะ แปลว่าพยัญชนะตัวนั้น
 * ไปขึ้นพยางค์ใหม่ ไม่ใช่คำที่เราต้องการ
 *   "นม" + "า"  → "…นมา" (บ้านมา)  ตัดทิ้ง ✅
 *   "นม" + "ว"  → "นมวัว"           รับไว้ ✅
 *   "นม" + "ได้" → "นมได้ไหม"        รับไว้ ✅ (ไ = สระหน้า เกาะพยัญชนะตัวถัดไป)
 */
const SHORT_TERM_MAX = 3;
/** สระหลัง/สระบน/สระล่าง/วรรณยุกต์ — เกาะพยัญชนะ "ตัวก่อนหน้า" */
const THAI_TRAILING_MARK = /[ะ-ฺๅ-๎]/;
function isWordBoundaryOk(haystack, term, at) {
    // "ชา" in "ชาม"/"ชาติ" is not tea. Thai consonants alone are not
    // sufficient word boundaries; retain actual tea ingestion questions.
    // Thai substring: ขนม/สนาม are not milk ingestion.
    if (term === 'นม' && /(?:ข|ส)$/.test(haystack.slice(0, at)))
        return false;
    if (term === 'ชา' && /^(ม|ติ|ย|ร์)/.test(haystack.slice(at + term.length)))
        return false;
    if (term.length > SHORT_TERM_MAX)
        return true;
    const next = haystack[at + term.length];
    if (!next)
        return true;
    return !THAI_TRAILING_MARK.test(next);
}
/** หา term ในข้อความโดยเช็กขอบคำสำหรับคำสั้น (คืน index แรกที่ผ่าน) */
function findTerm(haystack, term) {
    let from = 0;
    for (;;) {
        const i = haystack.indexOf(term, from);
        if (i === -1)
            return -1;
        if (isWordBoundaryOk(haystack, term, i))
            return i;
        from = i + 1;
    }
}
/** หาอาหารที่ผู้ใช้พูดถึง (คืนได้หลายรายการ) */
function matchFoods(text, species) {
    const q = String(text || '').toLowerCase();
    if (!q)
        return [];
    const hits = [];
    const used = new Set();
    for (const row of foodSafety_generated_1.FOOD_SAFETY) {
        if (!appliesTo(row, species))
            continue;
        if (used.has(row.nameEn))
            continue;
        const terms = [
            ...(ALIASES[row.nameEn] || []),
            ...row.keywords,
            row.nameEn.toLowerCase(),
        ];
        for (const t of terms) {
            if (t.length < 2)
                continue;
            if (findTerm(q, t.toLowerCase()) !== -1) {
                hits.push({ row, matched: t });
                used.add(row.nameEn);
                break;
            }
        }
    }
    // เรียงให้ตัวที่อันตรายที่สุดมาก่อน
    const rank = { toxic: 0, avoid: 1, limited: 2, generally_safe: 3 };
    hits.sort((a, b) => rank[a.row.status] - rank[b.row.status]);
    return hits;
}
/** ผู้ใช้ถามเชิง "อะไรกินได้/ไม่ได้บ้าง" (ไม่ระบุอาหารเจาะจง) */
function isGeneralFoodQuestion(text) {
    const q = String(text || '').toLowerCase();
    return /(ห้ามกิน|กินไม่ได้|กินได้บ้าง|อาหารต้องห้าม|ของต้องห้าม|อาหารที่เป็นพิษ|เป็นพิษ.*(อาหาร)?|อะไรกินได้|อาหาร.{0,10}ต้องห้าม|ต้องห้าม.{0,10}อาหาร)/.test(q);
}
/** สร้างคำตอบสำหรับอาหารที่เจาะจงได้ */
function formatFoodAnswer(hits, petName) {
    const who = petName ? `น้อง${petName}` : 'น้อง';
    const lines = [];
    const sources = [];
    for (const { row } of hits) {
        lines.push(`**${row.nameTh}** — ${STATUS_LABEL[row.status]}\n${row.reasonTh}`);
        if (row.emergencyNoteTh)
            lines.push(`➡️ ${row.emergencyNoteTh}`);
        if (!sources.includes(row.sourceUrl))
            sources.push(row.sourceUrl);
    }
    const worst = hits[0]?.row.status;
    const head = worst === 'toxic'
        ? `⚠️ อันตรายค่ะ — เช็กจากตารางอาหารของแอปให้แล้ว`
        : worst === 'generally_safe'
            ? `เช็กให้แล้วค่ะ`
            : `เช็กให้แล้วค่ะ — รายการนี้ควรระวัง`;
    const tail = worst === 'toxic'
        ? `\n\nถ้า${who}**กินเข้าไปแล้ว** ให้ติดต่อสัตวแพทย์ทันที อย่ารอดูอาการค่ะ`
        : '';
    return {
        text: `${head}\n\n${lines.join('\n\n')}${tail}`,
        sources,
    };
}
/** สรุปรายการอาหารที่ห้าม (สำหรับคำถามกว้าง ๆ) */
function formatToxicList(species) {
    const rows = foodSafety_generated_1.FOOD_SAFETY.filter((r) => appliesTo(r, species) && r.status === 'toxic');
    const avoid = foodSafety_generated_1.FOOD_SAFETY.filter((r) => appliesTo(r, species) && r.status === 'avoid');
    const sources = [...new Set([...rows, ...avoid].map((r) => r.sourceUrl))];
    const label = species === 'cat' ? 'แมว' : species === 'dog' ? 'สุนัข' : 'หมาแมว';
    return {
        text: `รายการอาหารที่ **เป็นพิษต่อ${label}** (จากตารางในแอป อ้างอิง ASPCA + Merck Veterinary Manual):\n\n` +
            rows.map((r) => `🔴 ${r.nameTh}`).join('\n') +
            `\n\nกลุ่ม **ควรเลี่ยง**:\n` +
            avoid.map((r) => `🟠 ${r.nameTh}`).join('\n') +
            `\n\nอยากรู้รายละเอียดตัวไหน พิมพ์ชื่อมาได้เลยค่ะ เช่น "แมวกินนมได้ไหม"`,
        sources,
    };
}

},
"intents":function(require,module,exports){
"use strict";
// lib/smartBot/intents.ts
// ─────────────────────────────────────────────────────────────────────────
// จับ "เจตนา" ของคำถาม → แมปไปยังฟังก์ชันตอบใน answers.ts
//
// ⚠️ ขอบเขตของไฟล์นี้: **เฉพาะคำถามที่ตอบจากบันทึกในแอปได้เท่านั้น**
//    คำถามความรู้ทั่วไป (เลี้ยงยังไง · พันธุ์ไหนดี · ราคาเท่าไร) ต้องไม่ match
//    เพราะ Smart Bot ตอบไม่ได้ → ต้องส่งต่อ Agent (index.ts เป็นคนตัดสิน)
//
// สำนวนคำถามในนี้ ดึงจากคลังคำถามจริง 250 ข้อ
//   → scripts/smartbot-eval/scenarios.json (Pantip + FAQ โรงพยาบาลสัตว์)
// ─────────────────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.INTENT_RULES = exports.SAVED_WATER_TOPIC = void 0;
exports.looksGeneralKnowledge = looksGeneralKnowledge;
exports.matchIntent = matchIntent;
/**
 * สัญญาณว่า "กำลังถามถึงข้อมูลที่บันทึกไว้" ไม่ใช่ถามความรู้ทั่วไป
 * เช่น "น้ำหนักของน้องเท่าไหร่" (ถามบันทึก) vs "หมาอ้วนทำไงดี" (ถามความรู้)
 */
const RECORD_CUE = /(ของ(น้อง|เขา|มัน|เรา)|ในแอป|ที่บันทึก|บันทึกไว้|ประวัติ|ล่าสุด|ครั้งสุดท้าย|ตอนนี้|วันนี้|สัปดาห์นี้|อาทิตย์นี้|เดือนนี้|ที่ผ่านมา|เท่าไห?ร่|กี่ครั้ง|กี่โล|กี่กิโล|กี่ชั่วโมง|วันไหน|เมื่อไห?ร่|มีอะไรบ้าง|เหลือ|ครบยัง|ครบหรือยัง|ยังไม่|ขอดู|ดูหน่อย|เช็ค|สรุป)/;
/** คำสั่งเปิดประโยคที่แปลว่า "ขอดูข้อมูล" */
const ASK = '(ดู|ขอดู|เช็ค|เช็ก|สรุป|บอก|ขอ|แสดง|รายการ|ประวัติ)';
// Thai owners also ask for "ยอดน้ำ" or list "น้ำ อาหาร ...". Avoid
// treating weight, saliva, tears, mucus or flooding as drinking records.
exports.SAVED_WATER_TOPIC = /(?:กินน้ำ|ดื่มน้ำ|กินน้ํา|ดื่มน้ํา|ให้น้ำ|น้ำดื่ม|(?:ยอด|ปริมาณ|บันทึก|สรุป|เช็ก|เช็ค|ขอดู)น้ำ(?!หนัก|ลาย|ตา|มูก|ท่วม)|น้ำที่บันทึก|(?:^|\s)น้ำ(?=\s|$|[,/]))/;
exports.INTENT_RULES = [
    // ───────── น้ำหนัก ─────────
    {
        id: 'weight',
        strong: [
            /(?:latest|most recent|current)\s+(?:recorded\s+)?weight(?:\s+(?:for|of)\s+(?:this|the)\s+pet)?/i,
            /(?:weight|weigh-in).{0,32}(?:latest|most recent|current)/i,
            /น้ำหนัก.{0,12}(เท่า(?:ไหร่|ไร)|กี่โล|กี่กิโล|ล่าสุด|ตอนนี้|ปัจจุบัน|ขึ้นไหม|ลงไหม|เปลี่ยนไป)/,
            /น้ำหนัก.{0,24}(เป็นไง|เป็นอย่างไร|อ้วนขึ้น|ผอมลง|ขึ้นไหม|ลงไหม)/,
            new RegExp(`${ASK}.{0,8}น้ำหนัก`),
            /น้ำหนัก(ของ)?(น้อง|เขา|มัน|เรา)/,
            /(ชั่ง|บันทึก)น้ำหนัก.{0,10}(ล่าสุด|ไปแล้ว|เมื่อไห?ร่)/,
            // E2E 17 ต.ค. 69: "น้องหนักเท่าไหร่" / "จี๊ดหนักกี่โล" (no น้ำ) fell through to "not understood".
            /(?:^|[^ำ])หนัก\s*(?:เท่า(?:ไหร่|ไร)|กี่\s*(?:โล|กิโล|กก))/,
        ],
        topic: [/น้ำหนัก/],
    },
    // ───────── กิจกรรม: น้ำ ─────────
    {
        id: 'activity',
        activityType: 'water',
        strong: [
            /(กินน้ำ|ดื่มน้ำ|กินน้ํา|ดื่มน้ํา).{0,14}(เท่าไห?ร่|กี่|ล่าสุด|วันนี้|สัปดาห์|อาทิตย์|พอไหม|พอหรือยัง)/,
            new RegExp(`${ASK}.{0,10}(การ)?(กิน|ดื่ม)น้ำ`),
        ],
        topic: [exports.SAVED_WATER_TOPIC],
    },
    // ───────── กิจกรรม: อาหาร ─────────
    {
        id: 'activity',
        activityType: 'food',
        strong: [
            /(กินข้าว|กินอาหาร|ทานข้าว|ปริมาณอาหาร|มื้ออาหาร).{0,14}(เท่าไห?ร่|กี่|ล่าสุด|วันนี้|สัปดาห์|อาทิตย์|ครบ)/,
            new RegExp(`${ASK}.{0,10}(การ)?(กิน|ให้)(ข้าว|อาหาร)`),
        ],
        topic: [/(กินข้าว|กินอาหาร|ปริมาณอาหาร)/],
    },
    // ───────── กิจกรรม: นอน ─────────
    {
        id: 'activity',
        activityType: 'sleep',
        strong: [
            /(นอน|การนอน|ชั่วโมงนอน).{0,14}(กี่ชั่วโมง|กี่ ?ชม|เท่าไห?ร่|ล่าสุด|วันนี้|สัปดาห์|อาทิตย์)/,
            new RegExp(`${ASK}.{0,10}(การ)?นอน`),
        ],
        topic: [/(ชั่วโมงนอน|เวลานอน)/],
    },
    // ───────── กิจกรรม: เดิน/ออกกำลัง ─────────
    {
        id: 'activity',
        activityType: 'walk',
        strong: [
            /(พาเดิน|เดินเล่น|ออกกำลัง|วิ่ง|เดิน).{0,14}(กี่|เท่าไห?ร่|ล่าสุด|วันนี้|สัปดาห์|อาทิตย์|ครั้งสุดท้าย)/,
            new RegExp(`${ASK}.{0,10}(การ)?(เดิน|ออกกำลัง)`),
        ],
        topic: [/(พาเดิน|เดินเล่น|ออกกำลังกาย)/],
    },
    // ───────── กิจกรรม: เล่น ─────────
    {
        id: 'activity',
        activityType: 'play',
        strong: [
            /(เล่น|การเล่น).{0,12}(กี่|เท่าไห?ร่|ล่าสุด|วันนี้|สัปดาห์|อาทิตย์|ครั้งสุดท้าย)/,
            new RegExp(`${ASK}.{0,10}การเล่น`),
        ],
        topic: [/การเล่น/],
    },
    // ───────── กิจกรรม: อุจจาระ ─────────
    {
        id: 'activity',
        activityType: 'poop',
        strong: [
            /(อึ|อุจจาระ|ขับถ่าย|ถ่ายหนัก).{0,14}(กี่ครั้ง|เท่าไห?ร่|ล่าสุด|วันนี้|ครั้งสุดท้าย|เมื่อไห?ร่)/,
            /ถ่าย.{0,14}(กี่ครั้ง|เท่าไห?ร่|ล่าสุด|วันนี้|ครั้งสุดท้าย|เมื่อไห?ร่)/,
            new RegExp(`${ASK}.{0,10}(การ)?(ขับถ่าย|อึ)`),
        ],
        topic: [/(การขับถ่าย)/],
    },
    // ───────── กิจกรรม: ปัสสาวะ ─────────
    {
        id: 'activity',
        activityType: 'pee',
        strong: [
            /(ฉี่|ปัสสาวะ|เยี่ยว).{0,14}(กี่ครั้ง|เท่าไห?ร่|ล่าสุด|วันนี้|ครั้งสุดท้าย|เมื่อไห?ร่)/,
            new RegExp(`${ASK}.{0,10}(การ)?(ปัสสาวะ|ฉี่)`),
        ],
        topic: [],
    },
    // ───────── ยา (เฉพาะ "ยาที่บันทึกไว้" — ขนาดยา/หยุดยา guard ดักไปก่อนแล้ว) ─────────
    {
        id: 'medicine',
        // ⚠️ บั๊กที่เคยเจอจริง (แก้ 1 ก.ย. 2569 — ห้ามถอยกลับ)
        //    คำว่า "ยา" เป็นตัวอักษรย่อยของคำว่า "อยาก" ด้วย
        //    ประโยค "วันนี้อยากมาแชร์ประสบการ…" เคยถูกจับเป็น "ขอดูรายการยา"
        //    → ห้ามใช้ /ยา/ ลอย ๆ หรือ /ยา.{0,12}…/ ที่เว้นช่องกว้าง
        //      ต้องให้ "ยา" ติดกับคำที่ยืนยันว่าเป็นยาจริงเท่านั้น
        strong: [
            /มียาอะไร(?:บันทึก|อยู่|บ้าง)/,
            /วันนี้.*มี(?:ยา|ยาตัวไหน).*(?:ต้อง|กิน|ให้)/,
            /มี(?:ยา|ยาตัวไหน).{0,12}(?:ต้องกินวันนี้|กินวันนี้|ให้วันนี้)/,
            /ยา(ของ|ที่หมอ|ที่สัตวแพทย์|ที่ต้องกินวันนี้|ที่บันทึก|ประจำ|กิน|ฉีด|เม็ด|น้ำ|ตัวไหน)/,
            /(รายการ|ตาราง|ประวัติ)ยา/,
            /(ให้|กิน|ป้อน)ยา.{0,12}(ล่าสุด|ไปแล้ว|ยัง|ครบ|เมื่อไห?ร่)/,
            /(?:วันนี้|ตอนนี้).{0,10}(?:ต้อง|มี).{0,8}(?:ป้อน|ให้|กิน)ยา/,
            /ป้อนยา.{0,12}(อะไร|วันนี้|ให้น้อง)/,
            /ยา.{0,8}(?:น้อง|หมา|แมว).{0,12}(?:กิน|ให้|ป้อน).{0,10}(?:ครบ|ยัง|วันนี้)/,
            /ยาอะไร(?:อยู่|ใน|บันทึก)/,
            /ยา.{0,4}(หมดยัง|หมดหรือยัง|เหลือเท่าไห?ร่|เหลือกี่|เหลือ|ใกล้หมด|ครบยัง|มีอะไรบ้าง)/,
            new RegExp(`${ASK}(รายการ)?ยา`),
        ],
        topic: [/(ยากิน|ยาหยด|รายการยา)/],
    },
    // ───────── วัคซีน (จากบันทึกเท่านั้น · guard ดัก "ตารางวัคซีน/กี่เข็ม" ไปก่อน) ─────────
    {
        id: 'vaccine',
        strong: [
            /วัคซีน.{0,16}(ล่าสุด|ที่ฉีดไปแล้ว|ฉีดอะไรไปบ้าง|ฉีดไปแล้วบ้าง|ครบยัง|ครบหรือยัง|นัดวันไหน|นัดเมื่อไห?ร่|ถัดไป|ครั้งหน้า|เลยกำหนด|ครบกำหนด|ถึงกำหนด|หมดอายุ|ใกล้ถึง)/,
            // E2E 17 ต.ค. 69: "มะลิฉีดวัคซีนอะไรไปแล้ว" fell through to "not understood".
            /ฉีด(?:วัคซีน)?.{0,12}(?:ไปแล้ว|มาแล้ว)/,
            new RegExp(`${ASK}.{0,10}วัคซีน`),
            /วัคซีนของ(น้อง|เขา|มัน|เรา)/,
            /สมุดวัคซีน/,
        ],
        topic: [/วัคซีน/],
    },
    // ───────── นัดหมาย ─────────
    {
        id: 'booking',
        strong: [
            /(นัด|นัดหมาย|จอง|คิว|อัพพอยต์|appointment).{0,14}(วันไหน|เมื่อไห?ร่|มีไหม|มีมั้ย|ครั้งหน้า|ถัดไป|ล่าสุด|กี่โมง|ที่ไหน)/,
            /มีนัด(?:ไหม|มั้ย)/,
            new RegExp(`${ASK}.{0,8}(ตาราง)?นัด`),
            /นัดหมอ|นัดคลินิก|นัดโรงพยาบาล/,
        ],
        topic: [/(นัดหมาย|ตารางนัด)/],
    },
    // ───────── ข้อมูลตัวน้อง / โปรไฟล์ ─────────
    {
        id: 'profile',
        strong: [
            // ⚠️ ต้องมีคำถามกำกับเสมอ — เคยพลาดเพราะจับแค่ "อายุ…น้อง" แล้วไปโดน
            //    ประโยคเล่าเรื่อง "ลูกสาวอายุสี่เดือน น้องป่วยเป็น fip" (ไม่ใช่คำถามข้อมูล)
            /(อายุ|วันเกิด|สายพันธุ์|พันธุ์|ไมโครชิป|microchip|เลขชิป).{0,12}(เท่าไห?ร่|กี่ปี|กี่เดือน|กี่ขวบ|วันไหน|อะไร|ไหนนะ)/,
            /(น้อง|เขา|มัน).{0,8}(อายุเท่าไห?ร่|เกิดวันไหน|พันธุ์อะไร|สีอะไร|เพศอะไร)/,
            /ข้อมูล(ของ)?(น้อง|เขา|มัน|ตัวนี้)/,
            /ข้อมูลส่วนตัว/,
            /โปรไฟล์(ของ)?(น้อง|เขา|มัน)?/,
            /แพ้อะไร/,
            /(แพ้|ภูมิแพ้|อาการแพ้).{0,10}(อะไรบ้าง|อะไรอยู่|ที่บันทึก)/,
        ],
        topic: [/(ไมโครชิป|microchip|โปรไฟล์)/],
    },
    // ───────── ประวัติสุขภาพ ─────────
    {
        id: 'health_records',
        strong: [
            /ประวัติ(การ)?(รักษา|สุขภาพ|ป่วย|ไปหาหมอ|พบสัตวแพทย์)/,
            /สมุด(สุขภาพ|ประจำตัว)/,
            /(เคยป่วย|เคยรักษา|เคยผ่าตัด|เคยไปหาหมอ).{0,12}(อะไร|ไหม|มั้ย|บ้าง|เมื่อไห?ร่)/,
            new RegExp(`${ASK}.{0,10}ประวัติ`),
        ],
        topic: [/ประวัติ/],
    },
    // ───────── สรุปภาพรวม (ต้องอยู่ท้ายสุด — กว้างที่สุด) ─────────
    {
        id: 'summary',
        strong: [
            // ต้องมีกรรมชัดเจน — "สรุป" ลอย ๆ กลางประโยคเล่าเรื่องไม่ใช่คำสั่ง
            /(สรุป|ภาพรวม|รายงาน).{0,14}(ข้อมูล|น้อง|เขา|มัน|สุขภาพ|ทั้งหมด|ให้หน่อย|ให้ที|หน่อย)/,
            /(น้อง|เขา|มัน).{0,10}(เป็นยังไงบ้าง|เป็นไงบ้าง|สบายดีไหม|สบายดีมั้ย|โอเคไหม)/,
            /สุขภาพ.{0,10}(เป็นยังไง|เป็นไง|โดยรวม|ตอนนี้)/,
            /^(สรุปให้หน่อย|ภาพรวม)$/,
        ],
        topic: [],
    },
];
/**
 * ─── ตัวแยก "ถามความรู้ทั่วไป" ออกจาก "ขอดูข้อมูลน้องเรา" ───
 *
 * ข้อสังเกตจากคลังคำถามจริง: เวลาคนถามถึง **สัตว์ของตัวเอง** ในแอป
 * เขาจะพูดว่า "น้อง…" หรือไม่พูดชื่อชนิดเลย ("น้ำหนักล่าสุดเท่าไหร่")
 * แต่เวลาถาม **ความรู้ทั่วไป** เขาจะเอ่ยชื่อชนิดสัตว์ลอย ๆ
 *   "สุนัขอายุเท่าไหร่ถึงเรียกว่าแก่" · "ฉีดวัคซีนสุนัข ราคาเท่าไหร่"
 *   "9 สาเหตุที่ทำให้แมวไม่กินอาหาร"
 * ทั้ง 3 ข้อนี้เคยถูกตอบด้วย "ข้อมูลน้องในแอป" ซึ่งผิดฝาผิดตัว
 *
 * กฎ: ถ้าเอ่ยชื่อชนิดสัตว์ลอย ๆ โดยไม่มีคำแสดงความเป็นเจ้าของ → ไม่ใช่คำถามเรื่องบันทึก
 */
const SPECIES_NOUN = /(สุนัข|หมา|แมว|เหมียว)/;
const POSSESSIVE = /(ของเรา|ของผม|ของฉัน|ของหนู|ของน้อง|ที่บ้าน|ที่เลี้ยง|เลี้ยงไว้|(น้อง|หมา|แมว|สุนัข)(เรา|ผม|ฉัน|หนู))/;
/** คำถามเรื่องราคา/ค่าใช้จ่าย — ไม่มีในบันทึก ห้ามตอบด้วยข้อมูลน้อง */
const PRICE_QUESTION = /(ราคา|กี่บาท|เท่าไห?ร่บาท|ค่าใช้จ่าย|แพงไหม|ค่าบริการ)/;
/** true = เป็นคำถามความรู้ทั่วไป ไม่ใช่การขอดูบันทึก */
function looksGeneralKnowledge(text) {
    const q = String(text || '').toLowerCase();
    if (PRICE_QUESTION.test(q))
        return true;
    return SPECIES_NOUN.test(q) && !POSSESSIVE.test(q);
}
/**
 * หา intent ที่ตรงที่สุด
 * ลำดับ: ไล่ strong ทุกกฎก่อน → ถ้าไม่เจอค่อยไล่ topic (ต้องมี RECORD_CUE)
 * เหตุผล: กันไม่ให้ topic กว้าง ๆ ของกฎแรก ๆ ชนะ strong ของกฎหลัง
 */
function matchIntent(text, options) {
    const q = String(text || '').toLowerCase().trim();
    if (!q)
        return null;
    // “เก็บประวัติและดูแลเห็บยังไง” asks for care guidance, not a read of
    // existing records. A social preface about the pet being at home must not
    // turn it into a record lookup.
    if (/เก็บประวัติ.{0,30}(?:ดูแล|ยังไง|อย่างไร)/.test(q) && !/(?:ขอดู|ดูประวัติ|ที่บันทึกไว้)/.test(q))
        return null;
    // เอ่ยชื่อชนิดสัตว์ลอย ๆ / ถามราคา → เป็นคำถามความรู้ ไม่ใช่ขอดูบันทึก
    if (looksGeneralKnowledge(q) && !(options?.knownPetNamed && !PRICE_QUESTION.test(q)))
        return null;
    // คำว่า "ช่วยดู/ถามเรื่อง..." ในเคสจาก social มักเป็นการเล่าอาการ
    // ไม่ใช่การขออ่าน activity ที่บันทึกไว้ เช่น "ช่วยดูหน่อย น้องฉี่บ่อย"
    // และ "ช่วยดูหน่อย น้องไม่ยอมกินอาหาร" ต้องปล่อยให้ triage/care ตอบก่อน
    const liveSymptom = /(ฉี่|ปัสสาวะ|เยี่ยว).{0,18}(บ่อย|ถี่|ปวด|แสบ|เจ็บ|ไม่ออก|นิดเดียว|ตลอด|ร้อง|หลายรอบ|นอกกระบะ|ไม่เป็นที่|บนที่นอน|ผ้าห่ม)|(บ่อย|ถี่|ปวด|แสบ|เจ็บ|ไม่ออก|นิดเดียว|ตลอด|ร้อง).{0,18}(ฉี่|ปัสสาวะ|เยี่ยว)|(อึ|ขี้|ถ่าย).{0,18}(ไม่ออก|ไม่ถ่าย|แข็ง|เบ่ง|ค้าง|นอกกระบะ|ข้างกระบะ)|(ไม่ออก|ไม่ถ่าย|แข็ง|เบ่ง|ค้าง).{0,18}(อึ|ขี้|ถ่าย)|(ไม่กิน|ไม่ยอมกิน|ไม่แตะ|เบื่ออาหาร|กินน้อย|กินลดลง)|(ไม่กินน้ำ|ไม่ค่อยกินน้ำ|ไม่ยอมแตะชามน้ำ|กินน้ำน้อย|ดื่มน้ำน้อย|กินน้ำเยอะ|ดื่มน้ำเยอะ|กระหายน้ำ|กินน้ำจากก๊อก|ดื่มน้ำจากก๊อก)/.test(q);
    const liveBehavior = /(ถูหัว|ถูตัว|ถูหน้า|ถูแก้ม|เอาหัวมาชน|เอาหน้ามาถู|ถูขา|ถูโซฟา|ถูเฟอร์นิเจอร์|ถูของ|หัวชนเจ้าของ)/.test(q);
    for (const rule of exports.INTENT_RULES) {
        if ((liveSymptom && rule.activityType && ['pee', 'food', 'poop', 'water'].includes(rule.activityType)) ||
            (liveBehavior && rule.activityType === 'food'))
            continue;
        for (const p of rule.strong) {
            const m = q.match(p);
            if (m && m[0].length >= 2) {
                return { id: rule.id, activityType: rule.activityType, confidence: 0.9, matched: m[0] };
            }
        }
    }
    // ห้ามให้ RECORD_CUE ที่ตามหลังคำว่า "กินอาหาร/ฉี่/อึ" ดึงเคสอาการกลับไป
    // เป็นการอ่าน log เช่น "ตอนนี้ น้องไม่ยอมกินอาหาร" หรือ "ช่วยดูหน่อย น้องอึไม่ออก"
    if (liveSymptom || liveBehavior)
        return null;
    if (!RECORD_CUE.test(q))
        return null;
    for (const rule of exports.INTENT_RULES) {
        for (const p of rule.topic) {
            const m = q.match(p);
            if (m) {
                return { id: rule.id, activityType: rule.activityType, confidence: 0.7, matched: m[0] };
            }
        }
    }
    return null;
}

},
"petScope":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insideCommonThaiWord = insideCommonThaiWord;
exports.maskCommonThaiWords = maskCommonThaiWords;
exports.mentionsPetName = mentionsPetName;
exports.matchCanonicalPetNames = matchCanonicalPetNames;
exports.petReferenceText = petReferenceText;
exports.resolveNamedPetScope = resolveNamedPetScope;
// Thai is written without spaces, so a short pet name or nickname (น้ำ, ข้าว, วัน, นม)
// also sits inside everyday words. A name occurrence wholly inside one of these words
// is the word, not the pet: "น้ำหนักล่าสุด" never addresses a pet called น้ำ (audit B1, 26 Oct 2026).
const COMMON_THAI_WORDS = [
    'น้ำหนัก', 'น้ำดื่ม', 'น้ำเปล่า', 'กินน้ำ', 'ดื่มน้ำ', 'อาบน้ำ', 'น้ำมูก', 'น้ำลาย', 'น้ำตา', 'น้ำยา', 'น้ำมัน', 'น้ำเกลือ', 'ขาดน้ำ', 'ชามน้ำ', 'น้ำนม', 'ถ้วยน้ำ',
    'กินข้าว', 'ข้าวต้ม', 'ข้าวสวย', 'ข้าวเหนียว', 'มื้อข้าว',
    'วันนี้', 'วันไหน', 'วันที่', 'วันละ', 'ทุกวัน', 'รายวัน', 'กี่วัน', 'วันเกิด', 'วันก่อน', 'วันหลัง',
    'กินนม', 'ดื่มนม', 'นมผง', 'นมแพะ',
    'มีอะไร', 'มีนัด', 'มีไหม', 'มีบ้าง', 'มียา', 'มีวัคซีน', 'นัดหมาย',
];
function commonWordSpans(text) {
    const spans = [];
    for (const word of COMMON_THAI_WORDS)
        for (let at = text.indexOf(word); at >= 0; at = text.indexOf(word, at + 1))
            spans.push({ start: at, end: at + word.length });
    return spans;
}
/** True when [start,end) lies inside a longer everyday word (see COMMON_THAI_WORDS). */
function insideCommonThaiWord(text, start, end, spans = commonWordSpans(text)) {
    return spans.some(s => s.start <= start && end <= s.end && s.end - s.start > end - start);
}
/** Same text with everyday words blanked by '#', so substring alias checks cannot hit them. */
function maskCommonThaiWords(text) {
    const chars = text.split('');
    for (const s of commonWordSpans(text))
        for (let i = s.start; i < s.end; i++)
            chars[i] = '#';
    return chars.join('');
}
/** A nickname is mentioned only outside everyday words. */
function mentionsPetName(text, name) {
    const t = text.normalize('NFC').toLowerCase(), n = name.normalize('NFC').toLowerCase().trim();
    if (!n)
        return false;
    const spans = commonWordSpans(t);
    for (let at = t.indexOf(n); at >= 0; at = t.indexOf(n, at + 1))
        if (!insideCommonThaiWord(t, at, at + n.length, spans))
            return true;
    return false;
}
/** Longest complete canonical names own their text spans. A shorter name
 * inside a longer name is not a second pet; a separate mention still is.
 * Identical names retain every distinct profile, so selection remains explicit. */
function matchCanonicalPetNames(message, profiles) {
    const text = message.normalize('NFC').toLowerCase();
    const names = [...new Set(profiles.map(p => p.name.normalize('NFC').trim().toLowerCase()).filter(Boolean))].sort((a, b) => b.length - a.length);
    const spans = [];
    const everyday = commonWordSpans(text);
    for (const name of names) {
        let start = text.indexOf(name);
        while (start >= 0) {
            const end = start + name.length, before = text[start - 1] || '', after = text[end] || '';
            const complete = (!/^[a-z0-9]/.test(name) || !/[a-z0-9]/.test(before)) && (!/[a-z0-9]$/.test(name) || !/[a-z0-9]/.test(after));
            if (complete && !insideCommonThaiWord(text, start, end, everyday) && !spans.some(s => start < s.end && end > s.start))
                spans.push({ name, start, end });
            start = text.indexOf(name, start + 1);
        }
    }
    const matched = new Set(spans.map(s => s.name));
    const characters = text.split('');
    for (const span of spans)
        for (let i = span.start; i < span.end; i++)
            characters[i] = ' ';
    return { matchedProfiles: profiles.filter(p => matched.has(p.name.normalize('NFC').trim().toLowerCase())), remainingText: characters.join(''), spans };
}
/** Only reference matching uses this copy; the stored question is untouched.
 * Common instructions are not pet addressing. Complete profile names are
 * protected first; a standalone nickname still resolves normally. */
function petReferenceText(message, profiles) {
    let reference = message.normalize('NFC').toLowerCase();
    const protectedNames = [];
    for (const name of [...new Set(profiles.map(p => p.name.normalize('NFC').toLowerCase()).filter(Boolean))].sort((a, b) => b.length - a.length)) {
        if (!reference.includes(name))
            continue;
        const token = `__complete_pet_name_${protectedNames.length}__`;
        reference = reference.split(name).join(token);
        protectedNames.push([token, name]);
    }
    reference = reference
        .replace(/ช่วย\s*แยกข้อมูล(?=\s*(?:ที่บันทึก|จริง|ระหว่าง|กับ|ให้ชัด|ด้วย))/g, ' ')
        .replace(/\b(?:saved|recorded|activity|medical|health|medicine|vaccination|weight)\s+(?:(?:medical|health|activity)\s+)?records\b/g, 'saved entries');
    for (const [token, name] of protectedNames)
        reference = reference.split(token).join(name);
    return reference;
}
/** Resolve only profiles already supplied by the signed-in owner's context. */
function resolveNamedPetScope(message, matches, selected, explicitSelection) {
    if (!matches.length)
        return { target: selected, knownNamed: false, ambiguous: false, speciesConflict: false };
    const raw = message.normalize('NFC').toLowerCase();
    let descriptors = raw;
    const speciesAlias = /^(?:cat|kitten|dog|puppy|แมว|หมา|สุนัข)$/i;
    for (const p of matches)
        for (const name of [p.name, ...(p.aliases || []).filter(a => !speciesAlias.test(a))].filter(Boolean))
            descriptors = descriptors.split(name.normalize('NFC').toLowerCase()).join(' ');
    const cat = /แมว|\bcat\b|\bkitten\b/.test(descriptors), dog = /สุนัข|หมา(?!ย)|\bdog\b|\bpuppy\b/.test(descriptors);
    // An ambiguous nickname alone must not become a guessed species identity.
    const canonicalNamed = matches.some(p => raw.includes(p.name.normalize('NFC').toLowerCase()));
    const hint = canonicalNamed ? (cat && !dog ? 'cat' : dog && !cat ? 'dog' : undefined) : undefined;
    const candidates = hint ? matches.filter(p => p.species === hint) : [...matches];
    const asksMultiple = (cat && dog) || /ทั้งคู่|ทั้งสอง|ทั้ง\s*2|สองตัว|2\s*ตัว|\bboth\b|\btwo (?:pets|cats|dogs)\b/.test(descriptors);
    if (explicitSelection && selected?.id === explicitSelection.petId && matches.every(p => !!p.id && explicitSelection.candidateIds.includes(p.id)) && !asksMultiple) {
        if (!candidates.some(p => p.id === selected.id))
            return { target: undefined, knownNamed: false, ambiguous: false, speciesConflict: true };
        return { target: selected, knownNamed: true, ambiguous: false, speciesConflict: false };
    }
    if (!candidates.length)
        return { target: undefined, knownNamed: false, ambiguous: false, speciesConflict: true };
    if (candidates.length === 1)
        return { target: candidates[0], knownNamed: true, ambiguous: false, speciesConflict: false };
    const sameName = new Set(candidates.map(p => p.name.normalize('NFC').toLowerCase())).size === 1;
    if (sameName && !asksMultiple && selected && candidates.some(p => p.id === selected.id))
        return { target: selected, knownNamed: true, ambiguous: false, speciesConflict: false };
    return { target: undefined, knownNamed: false, ambiguous: true, speciesConflict: false };
}

},
"careKnowledge":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CARE_CARDS = void 0;
exports.careSpecies = careSpecies;
exports.matchCareKnowledge = matchCareKnowledge;
const CP = 'https://www.cats.org.uk';
const DT = 'https://www.dogstrust.org.uk';
const CORNELL = 'https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/';
const CHECKED = '2026-09-13';
const card = (id, title, species, groups, answer, ...sources) => ({ id, title, species, groups, answer, sources, checkedAt: CHECKED });
const cardNew = (id, title, species, groups, answer, ...sources) => ({ id, title, species, groups, answer, sources, checkedAt: '2026-09-29' });
exports.CARE_CARDS = [
    card('feeding_preference', 'น้องชอบกินอะไร', 'both', [/(ชอบกินอะไร|น้องกินอะไร|อาหารที่ชอบ|เมนูที่ชอบ|เมนูโปรด|เลือกกินอาหาร)/], 'หนูยังไม่เห็นบันทึกเมนูโปรดของน้องในแอป จึงบอกแทนน้องตัวนี้ไม่ได้ค่ะ ลองสังเกตว่าอาหารชนิดไหนกินได้สม่ำเสมอ ไม่ทำให้ถ่ายเหลวหรืออาเจียน และบันทึกชื่ออาหารกับปริมาณไว้ได้เลย อาหารหลักควรเป็นสูตรที่ครบถ้วนและเหมาะกับชนิดสัตว์/ช่วงวัยนะคะ ถ้าไม่กินอาหารเลย ซึม หรือมีอาการอื่นร่วม ให้ติดต่อสัตวแพทย์ค่ะ', 'https://wsava.org/global-guidelines/global-nutrition-guidelines/'),
    card('food_texture_choice', 'เลือกอาหารเม็ดหรืออาหารเปียก', 'both', [/(อาหารเม็ด|อาหารเปียก|อาหารหลัก)/, /(อะไรดี|ดีกว่า|ไหนดี|แบบไหน|เลือก|เปลี่ยน|ยังไง|อย่างไร|ดูอะไร|ครบ|สูตร|เหมาะ|เริ่มดู)/], 'ทั้งอาหารเม็ดและอาหารเปียกใช้เป็นอาหารหลักได้ ถ้าฉลากระบุว่าเป็นอาหารครบถ้วนและเหมาะกับชนิดสัตว์กับช่วงวัยค่ะ เลือกแบบที่น้องกินได้ดี รักษาน้ำหนักได้ และเจ้าของให้ปริมาณสม่ำเสมอ ถ้าจะเปลี่ยนสูตรให้ค่อย ๆ ผสม ไม่เปลี่ยนรวดเดียว และถ้าน้องมีโรคหรือใช้อาหารรักษาโรคให้ถามสัตวแพทย์ก่อนค่ะ', 'https://wsava.org/global-guidelines/global-nutrition-guidelines/'),
    card('water_habit', 'การดื่มน้ำเปลี่ยนไป', 'both', [/(ไม่กินน้ำ|ไม่ค่อยกินน้ำ|ไม่ยอมกินน้ำ|กินน้ำน้อย|ดื่มน้ำน้อย|กินน้ำเยอะ|ดื่มน้ำเยอะ|น้ำจากชาม|แตะชามน้ำ|กระหายน้ำ|กินน้ำจากก๊อก|ดื่มน้ำจากก๊อก|สังเกต.*กินน้ำ|เปลี่ยนน้ำ.*จุด)/], 'ลองเปลี่ยนน้ำให้สะอาด เติมหลายจุด และจดปริมาณที่ดื่มพร้อมอาหารเปียก/อาหารเม็ดไว้เทียบกับปกติค่ะ ถ้าไม่กินน้ำร่วมกับซึม อาเจียน ท้องเสีย เหงือกแห้ง หรือปัสสาวะน้อย/ไม่ออก ให้ติดต่อสัตวแพทย์ทันที การกินน้ำมากขึ้นต่อเนื่องก็ควรนัดตรวจ ไม่ควรสรุปสาเหตุเองนะคะ', 'https://www.aaha.org/resources/preventive-healthcare-for-pets/'),
    card('urine_color', 'ปัสสาวะสีเข้มหรือเปลี่ยนไป', 'both', [/(ฉี่|ปัสสาวะ|เยี่ยว).{0,12}(สีเข้ม|เข้มขึ้น|เปลี่ยนสี|สีแปลก)/], 'สีปัสสาวะที่เปลี่ยนไปควรเก็บตัวอย่างข้อมูลไว้ให้ชัดค่ะ จดว่าเริ่มเมื่อไร ปริมาณมากน้อยแค่ไหน มีเบ่ง ร้อง ฉี่บ่อย หรือมีเลือดไหม แล้วติดต่อสัตวแพทย์เพื่อประเมิน ถ้าฉี่ไม่ออก ออกทีละหยด มีเลือด ซึม หรือเจ็บ ให้ไปโรงพยาบาลสัตว์ทันที และอย่าให้ยาเองนะคะ', 'https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/feline-lower-urinary-tract-disease'),
    card('fast_eating', 'กินอาหารเร็วเกินไป', 'both', [/(กินเร็ว|กินไว|รีบกิน|กินฮุบ|สำลักตอนกิน)/], 'แบ่งอาหารเป็นมื้อเล็กลง ใช้ชามชะลอการกินหรือกระจายอาหารในอุปกรณ์ที่ปลอดภัย และให้น้องกินในพื้นที่สงบค่ะ อย่าใช้ของชิ้นเล็กที่อาจกลืนติดคอ ถ้ามีไอ สำลัก อาเจียน ท้องกาง หรือพฤติกรรมนี้เพิ่งเปลี่ยนกะทันหัน ให้สัตวแพทย์ตรวจค่ะ', 'https://www.aaha.org/resources/preventive-healthcare-for-pets/'),
    card('sleep_change', 'นอนเยอะหรือหลับทั้งวัน', 'both', [/(นอนทั้งวัน|นอนเยอะ|นอนมาก|หลับทั้งวัน)/], 'สัตว์แต่ละตัวนอนต่างกันได้ค่ะ ให้เทียบกับพฤติกรรมปกติของน้องและจดว่ากินน้ำ อาหาร เล่น และขับถ่ายเหมือนเดิมไหม ถ้าเพิ่งนอนมากขึ้นร่วมกับซึม ไม่กิน อาเจียน ท้องเสีย หายใจผิดปกติ หรือปลุกยาก ให้ติดต่อสัตวแพทย์ ไม่ควรสรุปว่าแค่ขี้เกียจนะคะ', 'https://www.aaha.org/resources/preventive-healthcare-for-pets/'),
    card('withdrawn_not_playing', 'แยกตัวหรือไม่เล่นเหมือนเดิม', 'both', [/(แยกตัว|ไม่เล่น|ไม่ร่าเริง)/], 'ถ้าน้องแยกตัวหรือไม่เล่นเหมือนเดิม ให้เทียบกับพฤติกรรมปกติและจดว่าเริ่มเมื่อไร ยังกินน้ำอาหาร ขับถ่าย และตอบสนองดีไหมค่ะ ความเปลี่ยนแปลงอย่างเดียวบอกสาเหตุไม่ได้ ถ้าเป็นต่อเนื่อง มีซึม ไม่กิน อาเจียน ท้องเสีย เจ็บ หรือหายใจผิดปกติ ให้สัตวแพทย์ประเมินโดยเร็ว ไม่สรุปว่าแค่อารมณ์หรือขี้เกียจนะคะ', 'https://www.merckvetmanual.com/special-pet-topics/emergencies/introduction-to-emergencies', 'https://pet.kapook.com/view303574.html'),
    card('fasting_safety', 'ไม่ควรอดอาหารเอง', 'both', [/(อดอาหาร|อดข้าว|ไม่ให้กิน)/, /(ได้ไหม|ได้มั้ย|หนึ่งวัน|1\s*วัน|กี่วัน|เปลี่ยนอาหาร)/], 'ไม่ควรอดอาหารน้องเองเพื่อให้น้องยอมกินอาหารแบบอื่นค่ะ โดยเฉพาะแมวที่การไม่กินต่อเนื่องอาจอันตรายได้ ให้มีน้ำสะอาดและอาหารที่เหมาะกับชนิด/วัย ถ้ากินลดลงหรือไม่กินเลยให้ติดต่อสัตวแพทย์ ไม่บังคับกรอกอาหารหรือกำหนดเวลาอดเองนะคะ', CORNELL + 'anorexia'),
    card('urine_frequency', 'ปัสสาวะบ่อยหรือเข้ากระบะบ่อย', 'both', [/(ฉี่บ่อย|ปัสสาวะบ่อย|เยี่ยวบ่อย|เข้ากระบะบ่อย|เข้ากระบะถี่|เข้ากระบะหลายรอบ|ปวดฉี่|ปวดปัสสาวะ|อยากฉี่ตลอด|อยากฉี่ทั้งวัน|ฉี่ตลอด)/], 'การฉี่หรือเข้ากระบะบ่อยกว่าปกติควรจดจำนวนครั้ง ปริมาณ การเบ่ง/ร้อง สีปัสสาวะ และน้ำที่ดื่มไว้ค่ะ อาจมีได้หลายสาเหตุและบอกโรคจากแชตไม่ได้ ถ้าฉี่ไม่ออก ออกทีละหยด มีเลือด เจ็บ ซึม หรืออาเจียน ให้ไปโรงพยาบาลสัตว์ทันที ไม่ให้ยาเองนะคะ', 'https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/feline-lower-urinary-tract-disease'),
    card('urine_discomfort', 'แสบหรือเจ็บตอนปัสสาวะ', 'both', [/(ฉี่|ปัสสาวะ|เยี่ยว).{0,12}(แสบ|เจ็บ)|(แสบ|เจ็บ).{0,12}(ฉี่|ปัสสาวะ|เยี่ยว)/], 'ถ้าน้องแสบหรือเจ็บตอนฉี่ ให้จดว่าเริ่มเมื่อไร ฉี่บ่อยไหม ปริมาณออกเท่าไร มีเบ่ง ร้อง หรือเลือดไหม แล้วติดต่อสัตวแพทย์เพื่อประเมินค่ะ ถ้าฉี่ไม่ออก ออกทีละหยด ร้องมาก ซึม หรืออาเจียน ให้ไปโรงพยาบาลสัตว์ทันที และอย่าให้ยาแก้ปวดหรือยาปฏิชีวนะเองนะคะ', 'https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/feline-lower-urinary-tract-disease'),
    card('cat_grass', 'แมวกินหญ้าได้ไหม', 'cat', [/(แมว|เหมียว).{0,12}หญ้า/, /(กิน|ให้|ได้ไหม|ได้มั้ย)/], 'ถ้าจะให้แมวกินหญ้า ควรเป็นหญ้าที่ปลูกสะอาดและยืนยันว่าไม่มียาฆ่าแมลงหรือปุ๋ยอันตรายค่ะ หลีกเลี่ยงพืชที่ไม่รู้ชนิดและอย่าบังคับให้กิน เพราะพืชบางชนิดเป็นพิษ ถ้ากินแล้วอาเจียนซ้ำ น้ำลายมาก ซึม หรือมีอาการผิดปกติ ให้ติดต่อสัตวแพทย์ทันที', 'https://www.aspca.org/pet-care/animal-poison-control/cats-plant-list'),
    card('noise_fear', 'น้องกลัวเสียงดัง', 'both', [/(?:(กลัว|ตกใจ|ผวา).{0,8}(เสียงดัง|ฟ้าร้อง|ประทัด|พลุ|เสียง)|(?:ประทัด|พลุ|ฟ้าร้อง|ดูดฝุ่น|เสียงข้างนอก|เสียงดัง).{0,18}(ทำไง|ยังไง|ช่วย|ปลอบ|สั่น|เครียด|มุมปลอดภัย|ทำอะไร)|(?:ช่วย|ปลอบ|จัดมุมปลอดภัย).{0,18}(แมว|น้อง).{0,18}(เสียง|ประทัด|พลุ|ฟ้าร้อง)|(?:แมว|น้อง).{0,18}(เสียงข้างนอก|เสียงดูดฝุ่น|เสียงดัง).{0,18}(เครียด|ผวา|ตกใจ|กลัว|สั่น))/], 'พาน้องไปอยู่ในห้องที่ปลอดภัย ปิดหน้าต่าง/ม่าน เปิดเสียงพื้นหลังเบา ๆ และจัดที่ซ่อนให้เลือกเองค่ะ อย่าลากออกมา อย่าลงโทษ และอย่าฝืนกอดถ้าน้องกำลังตื่นกลัว ถ้ากลัวรุนแรง ทำร้ายตัวเอง หอบผิดปกติ หรือพฤติกรรมเพิ่งเปลี่ยนกะทันหัน ให้สัตวแพทย์ประเมิน', 'https://www.merckvetmanual.com/cat-owners/behavior-of-cats/behavior-problems-of-cats'),
    card('coughing', 'ไอเป็นพัก ๆ', 'both', [/(ไอ|ไอแห้ง|ไอมีเสมหะ)/, /(เป็นพักๆ|เป็นพัก ๆ|บ่อย|ทำไง|ยังไง|เกิดจาก|ปกติไหม)/], 'ไอเป็นพัก ๆ มีได้หลายสาเหตุและบอกโรคจากแชตไม่ได้ค่ะ จดว่าไอเมื่อไร นานแค่ไหน มีเสียงหอบ น้ำมูก อาเจียน หรือสิ่งกระตุ้นอะไร และถ่ายคลิปจากระยะปลอดภัยไว้ให้หมอ ถ้าหายใจลำบาก เหงือกซีด/เขียว อ้าปากหายใจ ล้ม หรือไอไม่หยุด ให้ไปโรงพยาบาลสัตว์ทันที ไม่ให้ยาแก้ไอของคนเองนะคะ', 'https://www.merckvetmanual.com/cat-owners/lung-and-airway-disorders-of-cats/coughing-in-cats'),
    card('implausible_weight', 'น้ำหนักที่ควรตรวจสอบหน่วย', 'both', [/(แมว|หมา|สุนัข|น้อง).{0,12}(?:[2-9]\d{2,}|\d{4,})\s*(?:กิโล|กก|kg)/], 'ตัวเลขนี้ดูสูงผิดปกติสำหรับสัตว์เลี้ยงทั่วไปค่ะ ลองตรวจว่าพิมพ์หน่วยหรือจุดทศนิยมผิดไหม และอย่าเปลี่ยนอาหารหรือลดอาหารเองจากตัวเลขเดียว หากเป็นน้ำหนักที่ชั่งได้จริงให้นำข้อมูลกับรูปแบบการชั่งไปให้สัตวแพทย์ตรวจโดยเร็ว', 'https://www.aaha.org/resources/weight-management/'),
    card('cat_reduced_appetite', 'แมวกินน้อยลง', 'cat', [/(กินน้อยลง|กินลดลง|เบื่ออาหาร)/], 'อย่าเหมารวมว่าเป็นเพราะเปลี่ยนอาหารค่ะ จดอายุ ระยะเวลาที่กินลดลง ปริมาณที่กินจริง และอาการอื่น แล้วติดต่อสัตวแพทย์เพื่อประเมิน โดยเฉพาะลูกแมว ถ้าไม่กินเลย ซึม หรืออาเจียน ให้ติดต่อทันที ไม่รอให้ครบจำนวนวันและไม่บังคับกรอกอาหารเองค่ะ', CORNELL + 'anorexia'),
    card('cat_no_forced_fasting', 'ไม่อดอาหารเพื่อบังคับแมวเปลี่ยนสูตร', 'cat', [/(อดอาหาร|อดข้าว|ไม่ให้กิน)/, /(อาหารเม็ด|อาหารเปียก|เปลี่ยน|หันมา|ยอมกิน)/], 'ไม่ควรอดอาหารเพื่อบังคับให้แมวเปลี่ยนสูตรค่ะ ถ้ายังกินอาหารเดิมได้ ให้คุยเรื่องแผนเปลี่ยนอาหารกับสัตวแพทย์ หากกินลดลงหรือไม่กินเลยให้ติดต่อคลินิกเพื่อประเมิน ไม่รอให้หิวจนยอมและไม่บังคับกรอกอาหารเองค่ะ', CORNELL + 'anorexia'),
    card('senior_dog', 'ดูแลสุนัขสูงวัยที่บ้าน', 'dog', [/(แก่|สูงวัย|สูงอายุ|senior)/, /(ดูแล|อาหาร|จัดบ้าน|เตรียม|บันทึก|สังเกต)/], 'จัดพื้นไม่ลื่นและทางขึ้นลงที่เหมาะกับการเคลื่อนไหว ให้กิจกรรมเบา ๆ ตามสภาพร่างกาย เก็บประวัติน้ำหนัก อาหาร การเดิน และพฤติกรรมที่เปลี่ยนไป ปรึกษาสัตวแพทย์เรื่องอาหารและการตรวจ ไม่ถือว่าซึมหรือเจ็บเป็นเรื่องปกติของความแก่ค่ะ', 'https://www.aaha.org/resources/aging-with-grace-how-to-support-your-senior-pet/'),
    card('anesthesia_questions', 'เตรียมคำถามก่อนวางยาสลบ', 'both', [/(ดมยาสลบ|วางยาสลบ|ดมยา|anesthesia)/], 'การวางยาสลบมีความเสี่ยงและต้องประเมินเฉพาะตัว เตรียมประวัติยา โรคเดิม และปฏิกิริยาจากครั้งก่อน ถามคลินิกเรื่องการประเมินก่อนทำ ผู้เฝ้าระวัง ระยะฟื้น และอาการที่ต้องกลับมาพบหมอ ขอคำสั่งงดอาหารน้ำและยาจากทีมรักษาโดยตรงค่ะ', 'https://www.aaha.org/resources/2020-aaha-anesthesia-and-monitoring-guidelines-for-dogs-and-cats/phase-1-preanesthesia/step-2-client-education/'),
    card('cat_heat', 'แมวติดสัดและการป้องกันผสมโดยไม่ตั้งใจ', 'cat', [/(ติดสัด|เป็นสัด|ฮีต|เป็นฮีท|ร้องหาคู่|ร้องเรียกตัวผู้|หาคู่|ผสมพันธุ์|หนีไปหาคู่)/], 'แมวที่ยังไม่ทำหมันอาจร้องและพยายามออกไปหาคู่ จัดพื้นที่ปลอดภัยและแยกจากตัวผู้ที่ยังไม่ทำหมัน ปรึกษาสัตวแพทย์เรื่องทำหมัน ไม่ให้ยาคุมหรือฮอร์โมนเอง ถ้าซึม เจ็บ หรือมีสิ่งคัดหลั่งผิดปกติ อย่าเหมารวมว่าเป็นเพราะติดสัด ให้ตรวจค่ะ', CP + '/help-and-advice/pregnancy-and-kitten-care/cat-reproduction'),
    card('cat_other_cat_contact', 'แมวเอาแต่ไปหาแมวข้างนอก', 'cat', [/(ติดแมว|เอาแต่ไปหาแมว|อยากออกไปหาแมว|อยากหนีไปหาแมว|ร้องหาแมว|ตามแมว|ตามหาแมว(บ้าน|ข้าง|นอก)|ไปหาแมว|ห่วงแมว|จ้องแมว|ดมประตู.*แมว|เห็นแมวใหม่|เฝ้าบ้านข้าง|เล่นกับแมว|ดูแมวข้างนอก|กลิ่นแมวนอกบ้าน)/], 'คำว่า “ติดแมวที่อื่น” อาจหมายถึงน้องอยากออกไปหาแมว ช่วงติดสัด หรือแค่สนใจแมวตัวอื่นค่ะ ข้อความสั้น ๆ ยังแยกสาเหตุไม่ได้ ลองกันประตูหน้าต่างให้มิดชิดและสังเกตว่ามีร้องเรียก ถูตัว ยกก้น ทำเครื่องหมาย หรือพยายามหนีร่วมไหม ถ้ายังไม่ทำหมันให้คุยกับสัตวแพทย์เรื่องทำหมัน และถ้ามีการกัดกันหรือสัมผัสใกล้ชิดกับแมวนอกบ้านให้ถามหมอเรื่องการตรวจและป้องกันโรคตามความเสี่ยง ไม่ให้ยาหรือฮอร์โมนเองนะคะ', CP + '/help-and-advice/pregnancy-and-kitten-care/cat-reproduction', 'https://www.merckvetmanual.com/cat-owners/behavior-of-cats/behavior-problems-of-cats'),
    card('cat_kneading', 'แมวชอบนวด / ย่ำผ้า', 'cat', [/(ชอบนวด|แมวนวด|นวดผ้า|นวดตัก|ย่ำผ้า|ทำบิสกิต|กางเล็บนวด|นวด.*เบาะ|นวด.*แขน)/], 'การนวดหรือย่ำผ้ามักเป็นพฤติกรรมปกติที่เกี่ยวกับความสบายใจและพฤติกรรมวัยลูกแมวค่ะ ปล่อยให้น้องเลือกทำบนผ้านุ่ม ๆ ได้ ตัดปลายเล็บอย่างเหมาะสมถ้าเล็บเกี่ยว และอย่าฝืนจับเท้าหรือดุ ถ้าเพิ่งนวดมากขึ้นพร้อมเจ็บ ซึม เลียตัวผิดปกติ หรือพฤติกรรมอื่นเปลี่ยนกะทันหัน ให้สัตวแพทย์ตรวจค่ะ', 'https://www.stkc.go.th/node/5071', 'https://www.petmd.com/cat/behavior/why-do-cats-knead'),
    card('cat_scent_rubbing', 'แมวถูหัว / เอาหน้ามาชน', 'cat', [/(ถูหัว|เอาหัวมาชน|เอาหน้ามาถู|ถูขา|ถูโซฟา|ถูตัว|ถูหน้า|ถูแก้ม|ถูเฟอร์นิเจอร์|ถูของ|หัวชนเจ้าของ)/], 'การถูหัวหรือเอาหน้ามาชนคนและของมักเป็นการทักทาย สร้างกลิ่นร่วม หรือทำให้น้องรู้สึกปลอดภัยค่ะ ปล่อยให้น้องเข้าหาเองและอย่าฝืนจับหน้า ถ้าพฤติกรรมที่เคยทำหายไปพร้อมซึม ไม่กิน หรือมีพฤติกรรมเปลี่ยนหลายอย่าง ให้สัตวแพทย์ตรวจ ไม่สรุปว่าเป็นแค่อารมณ์นะคะ', 'https://vcahospitals.com/resources/behavior-cat/why-do-cats-rub-their-faces-on-you-and-objects'),
    card('cat_head_nestling', 'แมวนอนซุกหรือพิงกำแพง', 'cat', [/(หน้าซุกกำแพง|ซุกหน้ากำแพง|เอาหน้าพิง(กำแพง|ผนัง)|นอนเอาหน้าชน|นอนพิงกำแพง|ซุกหน้ากับมุม)/], 'ถ้าน้องแค่เอาหน้าซุกหรือพิงแล้วนอนในท่าผ่อนคลาย ยังแยกจากอาการ “ดันหน้าผากค้างกับกำแพง” ไม่ได้จากประโยคสั้น ๆ ค่ะ ลองดูว่าน้องเรียกแล้วหัน ตอบสนอง เดิน และกินปกติไหม ถ้าดันหน้าผากค้าง เดินวน ทรงตัวไม่ดี สับสน หรือเรียกไม่ตอบ ให้ไปโรงพยาบาลสัตว์ทันทีค่ะ', 'https://www.merckvetmanual.com/digestive-system/hepatic-diseases-of-small-animals/hepatic-encephalopathy-in-small-animals', 'https://www.merckvetmanual.com/cat-owners/brain-spinal-cord-and-nerve-disorders-of-cats/the-neurologic-evaluation-of-cats'),
    card('cat_body_language', 'ภาษากายแมว', 'cat', [/(กระพริบตา|ตาปรือ|หูแบน|หางฟาด|หางพอง|พองขน|ฟ่อ|หางม้วน|หางชี้)/], 'อ่านภาษากายแมวต้องดูหลายสัญญาณพร้อมกันค่ะ กระพริบตาช้าและท่าผ่อนคลายต่างจากหูแบน หางฟาด พองขน หรือฟ่อที่บอกว่าน้องไม่สบายใจ/อยากให้ถอย ให้หยุดมือ เว้นระยะ และให้น้องเลือกเข้าหาเอง ไม่ลงโทษหรือฝืนอุ้ม ถ้าเปลี่ยนจากเดิมกะทันหัน มีเจ็บ ซึม หรือไม่กิน ให้สัตวแพทย์ตรวจค่ะ', 'https://vcahospitals.com/resources/behavior-cat/communication/true-or-false-cats-talk-to-each-other', 'https://pet.kapook.com/view98026.html'),
    card('cat_communication', 'แมวสื่อสารด้วยเสียงและท่าทาง', 'cat', [/(ร้องเหมียว|ร้องเรียก|ครางเบา|ทำเสียงครืด|เอาหางพันขา|ถูหน้ากัน|ร้องฟ่อ|มองหน้าแล้วกระพริบ|หันหน้าหนี|ใช้หางบอก)/], 'แมวสื่อสารทั้งด้วยเสียง กลิ่น การสัมผัส และภาษากายค่ะ เสียงครางหรือร้องเรียกต้องดูท่าทางร่วมด้วย ส่วนหาง หู ตา และการถูตัวช่วยบอกว่าน้องกำลังทักทาย ผ่อนคลาย ไม่มั่นใจ หรืออยากให้เว้นระยะ ลองสังเกตเหตุการณ์ก่อนหน้าแล้วตอบสนองแบบไม่ฝืน\n\nถ้าการร้องหรือท่าทางเปลี่ยนกะทันหัน ร้องเหมือนเจ็บ ไม่กิน ซึม หรือหายใจผิดปกติ ให้สัตวแพทย์ตรวจค่ะ', 'https://vcahospitals.com/resources/behavior-cat/communication/true-or-false-cats-talk-to-each-other', 'https://pet.kapook.com/view98026.html'),
    card('cat_beginner_health_check', 'เช็กสุขภาพแมวเบื้องต้นสำหรับมือใหม่', 'cat', [/(ขี้ตาเกรอะกรัง|น้ำมูก|ตาไม่สดใส|ผิวมีแผล|ตัวสั่น|คราบอึติด|ขนไม่สะอาด|ขนสกปรก|ขน.{0,6}(ไม่สะอาด|สกปรก))/], 'สัญญาณอย่างขี้ตาเกรอะกรัง น้ำมูก ตาไม่สดใส แผลที่ผิว ตัวสั่น หรือมีคราบอึติดก้น ควรจดว่าเริ่มเมื่อไร กินน้ำอาหารและขับถ่ายปกติไหม แล้วติดต่อสัตวแพทย์เพื่อประเมินค่ะ อย่าใช้ยาคนหรือยาทาที่เหลือเอง ถ้าซึม หายใจลำบาก ไม่กิน เลือดออก หรืออาการแย่ลง ให้ไปโรงพยาบาลสัตว์ทันที', 'https://pet.kapook.com/view38383.html', 'https://www.merckvetmanual.com/special-pet-topics/emergencies/what-to-do-in-a-dog-or-cat-emergency'),
    card('neuter_planning', 'เตรียมคุยเรื่องทำหมัน', 'both', [/(ทำหมัน|ทำหมั[นณ]|ตอนหมา)/], 'เวลาที่เหมาะขึ้นกับชนิดสัตว์ เพศ ขนาด พันธุ์ และสุขภาพ จึงไม่ใช้เลขอายุเดียวกับทุกตัว เตรียมอายุ น้ำหนัก ประวัติยา และประวัติติดสัดไปคุยกับสัตวแพทย์ ขอคำสั่งเตรียมก่อนผ่าตัดและดูแลหลังผ่าตัดจากคลินิกโดยตรง ไม่กำหนดเวลางดน้ำอาหารเองค่ะ', 'https://www.aaha.org/resources/spay-or-neuter/'),
    card('dog_weight_management', 'วางแผนดูแลน้ำหนักสุนัข', 'dog', [/(อ้วน|ผอม|ลดน้ำหนัก|ลดอ้วน|ควบคุมน้ำหนัก|หุ่น.*กลม|น้ำหนักขึ้น|ขนม.*เยอะ)/], 'บันทึกอาหารหลัก ขนม และของที่สมาชิกในบ้านให้เพิ่ม ชั่งด้วยวิธีเดิมและนำข้อมูลไปให้สัตวแพทย์ประเมินรูปร่างและกำหนดเป้าหมาย การดูน้ำหนักอย่างเดียวบอกไม่ได้ว่าควรลดกี่กิโล ไม่ลดอาหารหรือเพิ่มการออกกำลังหนักทันทีค่ะ', 'https://www.aaha.org/resources/weight-management/'),
    card('indoor_cat', 'จัดบ้านสำหรับแมวระบบปิด', 'cat', [/(คอนโด|ระบบปิด|ระเบียง|หน้าต่าง|เลี้ยงในห้อง)/], 'จัดที่ซ่อน ที่สูง จุดลับเล็บ และเวลาเล่น ตรวจตาข่ายและช่องประตูหน้าต่างให้แน่นหนา ระเบียงเปิดเสี่ยงตกหรือหนีได้แม้แมวคล่องตัว ถามเจ้าของห้องหรือนิติบุคคลเรื่องข้ออนุญาตของอาคารโดยตรง บอตไม่ยืนยันสิทธิ์เลี้ยงแทนอาคารค่ะ', CP + '/help-and-advice/home-and-environment/indoor-cats'),
    card('cat_introduction', 'พาแมวใหม่เข้าบ้าน', 'cat', [/(แมวใหม่|แมวเก่า|เพิ่ม.*แมว|อีกตัว|สองตัว|หลายตัว|ตัวใหม่|ตัวเก่า|แนะนำ.*แมว|เริ่มให้แมว)/, /(เข้า.{0,4}บ้าน|เข้ากัน|ทะเลาะ|ขู่|กัดกัน|แนะนำ|ปรับตัว|อยู่ด้วย|เริ่ม|เตรียม|เจอกัน|ให้เจอ|เห็นหน้า|แยก|รับ|ยอมรับ)/], 'เริ่มจากห้องแยกที่มีของใช้ครบ สลับผ้าที่มีกลิ่นของแต่ละตัว แล้วค่อยให้เห็นกันผ่านที่กั้น เมื่อทั้งคู่สงบจึงพบกันช่วงสั้นโดยมีทางหนี ไม่จับเผชิญหน้าหรือบังคับให้อยู่ด้วยกัน ถ้าเครียดให้ย้อนขั้น ไม่มีกำหนดจำนวนวันที่รับประกันว่าจะเข้ากันได้ค่ะ', CP + '/help-and-advice/cat-behaviour/introducing-cats'),
    card('multi_cat_resources', 'จัดของใช้ในบ้านหลายแมว', 'cat', [/(หลายตัว|หลายแมว|สองตัว|สามตัว|แต่ละตัว|\d+\s*ตัว|แยกชาม|แยก.*อาหาร|แย่ง.*อาหาร|กระบะ.*กี่|กี่.*กระบะ)/, /(ชาม|อาหาร|กระบะ|ทราย|ของใช้|ที่นอน|แย่ง|กีดกัน|วาง)/], 'แยกจุดอาหาร น้ำ ที่นอน และกระบะให้เข้าถึงได้โดยไม่ต้องผ่านอีกตัว ใช้หลักของใช้หนึ่งชุดต่อแมวหนึ่งตัวและมีสำรอง กระจายคนละตำแหน่ง ไม่วางรวมจนตัวหนึ่งเฝ้ากั้นได้ ถ้ากินอาหารคนละสูตรให้แยกเวลากินหรือพื้นที่ และดูปริมาณที่แต่ละตัวกินจริงค่ะ', CP + '/help-and-advice/cat-behaviour/introducing-cats'),
    card('dog_toilet', 'ฝึกขับถ่ายด้วยรางวัล', 'dog', [/(ขับถ่าย|ฉี่|อึ|ห้องน้ำ|แผ่นรอง|รางวัล)/, /(ฝึก|สอน|เป็นที่|บนผ้า|แผ่น|ผิดที่|ไม่ตรง|ทั่วบ้าน|เวลาไหนดี|ตอนไหน|รางวัล)/], 'พาไปจุดเดิมหลังตื่น หลังอาหาร และหลังเล่น สังเกตการดมหรือวนตัว แล้วให้รางวัลทันทีเมื่อขับถ่ายถูกจุด ถ้าพลาดอย่าตีหรือดุย้อนหลัง ทำความสะอาดกลิ่นด้วยผลิตภัณฑ์เหมาะกับสัตว์และฝึกสม่ำเสมอ หากเคยทำได้แล้วเปลี่ยนทันทีหรือมีอาการเจ็บ ให้สัตวแพทย์ตรวจค่ะ', DT + '/dog-advice/training/basics/house-or-toilet-training'),
    card('dog_separation', 'สุนัขลำบากใจเมื่ออยู่ลำพัง', 'dog', [/(อยู่.*(?:คนเดียว|ลำพัง)|เจ้าของไม่อยู่|ออกจากบ้าน|ออกไปทำงาน|แยกจาก|ทิ้งไว้)/, /(ร้อง|เห่า|เครียด|กังวล|กลัว|พัง|ฝึก|ทำไง|ทำอย่างไร|ช่วย|ไม่ยอม)/], 'จดว่าเริ่มร้องหรือกระวนกระวายเมื่อไรและนานแค่ไหน วิดีโอช่วงที่ไม่อยู่ช่วยให้ผู้เชี่ยวชาญประเมินได้ อย่าลงโทษหรือขังเพื่อให้ร้องจนหยุด จัดพื้นที่ที่น้องรู้สึกปลอดภัยและขอแผนฝึกทีละขั้นจากสัตวแพทย์หรือผู้เชี่ยวชาญพฤติกรรม โดยเฉพาะถ้ามีการทำร้ายตัวเองค่ะ', DT + '/dog-advice/training/unwanted-behaviours/separation-anxiety'),
    card('dental_care', 'เริ่มดูแลฟัน', 'both', [/(แปรงฟัน|ยาสีฟัน|ดูแล.*ฟัน|ขูดหินปูน|หินปูน|กลิ่นปาก|ปากมีกลิ่น|ช่องปาก|จับปาก|เหงือก.*บวม|กินลำบาก.*ปาก)/], 'ใช้แปรงขนนุ่มและยาสีฟันสำหรับสัตว์ ค่อย ๆ ฝึกให้ยอมรับการสัมผัสปากแล้วเพิ่มเวลาทีละน้อย เป้าหมายคือแปรงทุกวัน ห้ามใช้ยาสีฟันคน การแปรงไม่เอาหินปูนที่เกาะแล้วออก ถ้าเจ็บ เหงือกบวม มีกลิ่นผิดปกติหรือกินลำบาก ให้ตรวจฟันก่อนฝืนแปรงค่ะ', 'https://www.aaha.org/resources/your-pets-dental-care/'),
    card('cat_bathing', 'แมวจำเป็นต้องอาบน้ำหรือไม่', 'cat', [/(อาบน้ำ|แชมพู|ล้างตัว|กลัวน้ำ)/], 'แมวส่วนใหญ่ดูแลความสะอาดตัวเองได้ จึงไม่ต้องตั้งตารางอาบน้ำเหมือนกันทุกตัว ลองแปรงขนหรือเช็ดด้วยผ้าหมาดก่อน ลูกแมวเล็กต้องระวังหนาวและจมน้ำ หากต้องอาบตามคำแนะนำหมอ ใช้ผลิตภัณฑ์สำหรับแมวและเช็ดให้แห้ง ไม่ใช้แชมพูคนหรือสุนัขค่ะ', CP + '/cats-blog/should-i-bathe-my-cat'),
    card('cat_grooming', 'หวีขนและขนพันกัน', 'cat', [/(หวีขน|แปรงขน|ขนพัน|ขนสังกะตัง|ขนยาว|ดูแลขน)/], 'เริ่มหวีช่วงสั้นเมื่อน้องผ่อนคลาย ใช้แปรงที่เหมาะกับความยาวขนและหยุดเมื่อไม่สบายใจ อย่าดึงก้อนขนหรือตัดชิดผิวหนังเอง ถ้าขนพันแน่น เจ็บ หรือเลียขนลดลง ให้สัตวแพทย์หรือผู้ดูแลขนที่เหมาะสมช่วยค่ะ', CP + '/help-and-advice/cat-behaviour/grooming'),
    card('senior_cat', 'จัดบ้านและบันทึกสำหรับแมวสูงวัย', 'cat', [/(แก่|สูงวัย|สูงอายุ|แมวชรา|senior)/, /(ดูแล|จัดบ้าน|เตรียม|บันทึก|สังเกต)/], 'จัดที่นอนสบายและกระบะขอบเตี้ยที่เข้าถึงง่าย ลดการเปลี่ยนแปลงในบ้าน จดน้ำหนัก ความอยากอาหาร การดื่มน้ำ ขับถ่าย และการเคลื่อนไหวเทียบกับเดิม ถ้าพฤติกรรมเปลี่ยนอย่าสรุปว่าเป็นเพราะแก่ ให้สัตวแพทย์ประเมินและนัดตรวจตามความเสี่ยงค่ะ', CORNELL + 'special-needs-senior-cat'),
    card('cat_weight_management', 'วางแผนดูแลน้ำหนักแมว', 'cat', [/(อ้วน|ผอม|ลดน้ำหนัก|ลดอ้วน|ควบคุมน้ำหนัก|หุ่นดี|น้ำหนักขึ้น)/], 'ชั่งและจดน้ำหนักด้วยวิธีเดิม เก็บข้อมูลอาหารและขนมที่ได้รับจริง แล้วให้สัตวแพทย์ช่วยกำหนดน้ำหนักเป้าหมายและปริมาณอาหาร ไม่ตัดอาหารรวดเร็วหรือให้อดเพื่อให้ผอมลง เพราะแมวต้องได้รับสารอาหารครบและลดน้ำหนักอย่างเหมาะสมค่ะ', CORNELL + 'feeding-your-cat'),
    card('cat_feeding', 'อาหารหลักสำหรับแมว', 'cat', [/(อาหารเม็ด|อาหารเปียก|เปลี่ยนอาหาร|อาหารลูกแมว|อาหาร.*แมวแก่)/, /(เลือก|เปลี่ยน|เริ่ม|ต่าง|แทน|ยังไง|อย่างไร|ได้ไหม|ควร|เคี้ยว)/], 'เลือกอาหารที่ระบุว่าเป็นอาหารครบถ้วนและเหมาะกับช่วงวัย ทั้งแบบเม็ดและเปียกอาจใช้เป็นอาหารหลักได้เมื่อสารอาหารครบ อย่าตัดสินจากรูปวัตถุดิบบนถุงอย่างเดียว บันทึกสูตรและปริมาณที่กิน หากมีโรคหรืออาหารรักษาโรคให้ปรึกษาหมอก่อนเปลี่ยนค่ะ', CORNELL + 'feeding-your-cat'),
    card('flea_prevention', 'เลือกผลิตภัณฑ์เห็บหมัดอย่างปลอดภัย', 'both', [/(เห็บ|หมัด)/, /(ป้องกัน|เลือก|กำจัด|ดูแล|ปลอดภัย|ใช้ยังไง|มีพิษ|ประวัติ)/], 'เลือกตามชนิดสัตว์ อายุ และช่วงน้ำหนักบนฉลาก ห้ามนำผลิตภัณฑ์สุนัขไปใช้กับแมวหรือแบ่งขนาดเอง แจ้งหมอเรื่องยาที่ใช้อยู่ การตั้งท้อง และอาการป่วย จดชื่อผลิตภัณฑ์ วันที่ใช้ และอาการหลังใช้แยกแต่ละตัว ถ้ามีอาการผิดปกติหลังใช้ให้ติดต่อสัตวแพทย์ทันทีค่ะ', 'https://www.fda.gov/consumers/consumer-updates/safe-use-flea-and-tick-products-pets'),
    card('heartworm_prevention', 'ป้องกันพยาธิหนอนหัวใจ', 'both', [/(หนอนหัวใจ|heartworm)/], 'พยาธิหนอนหัวใจติดต่อผ่านยุง การอยู่ในบ้านจึงไม่ได้ตัดความเสี่ยงทั้งหมด ให้สัตวแพทย์วางแผนตรวจและเลือกการป้องกันที่เหมาะกับชนิดสัตว์ จดวันที่ได้รับผลิตภัณฑ์ตามแผน หากขาดช่วงให้ถามคลินิกก่อนเริ่มต่อ ไม่เพิ่มหรือชดเชยขนาดเองค่ะ', 'https://www.heartwormsociety.org/pet-owner-resources/heartworm-basics'),
    card('lost_cat', 'เริ่มตามหาแมวหาย', 'cat', [/(แมวหาย|แมว.*หลง|หาแมวไม่เจอ|ตามหาแมว|แมว.{0,12}หนีออกจากบ้าน)/], 'เริ่มตรวจจุดซ่อนในบ้านและรอบบ้าน ขอเพื่อนบ้านช่วยดูห้องเก็บของหรือโรงรถ เตรียมรูปปัจจุบัน จุดและเวลาที่พบล่าสุด แล้วแจ้งคลินิกและกลุ่มท้องถิ่น ตรวจช่องทางติดต่อที่ผูกกับไมโครชิปให้เป็นปัจจุบัน บอตยังไม่ได้โพสต์หรือติดต่อใครแทนคุณค่ะ', CP + '/help-and-advice/lost-found-and-feral-cats/lost-a-cat'),
    card('moving_cat', 'ย้ายบ้านกับแมว', 'cat', [/(ย้ายบ้าน|ย้ายห้อง|ย้ายคอนโด|ย้ายมา.{0,25}บ้าน|บ้านใหม่.{0,20}แมว)/], 'เตรียมห้องสงบที่ปิดมิดชิดและของคุ้นกลิ่น ก่อนเคลื่อนย้ายให้ใส่กระเป๋าหรือกรงที่ปิดได้แน่น เมื่อถึงบ้านใหม่ให้สำรวจทีละพื้นที่ ตรวจประตูหน้าต่างและอัปเดตข้อมูลติดต่อ อย่าปล่อยออกนอกบ้านทันทีค่ะ', CP + '/help-and-advice/home-and-environment/moving-home-with-your-cat'),
    cardNew('cat_house_soiling', 'แมวขับถ่ายนอกกระบะ', 'cat', [/(ฉี่|ปัสสาวะ|ขับถ่าย).{0,35}(นอก|ข้างนอก|ไม่เป็นที่|กลิ่น|ตามมุม|พื้น|ที่เดิม)|(กลิ่นฉี่|กลิ่นปัสสาวะ)/], 'ทำความสะอาดบริเวณที่เปื้อนให้หมดกลิ่นด้วยผลิตภัณฑ์ที่เหมาะกับสัตว์ และตรวจว่ากระบะทรายสะอาด อยู่ในจุดสงบ เข้าถึงได้ค่ะ หากพฤติกรรมเพิ่งเปลี่ยน เบ่ง ฉี่บ่อย เจ็บ มีเลือด หรือฉี่ไม่ออก ให้ติดต่อสัตวแพทย์ทันที เพราะข้อความอย่างเดียวบอกสาเหตุไม่ได้ค่ะ', CORNELL + 'feline-behavior-problems-house-soiling'),
    cardNew('senior_age', 'ช่วงวัยสูงอายุของสุนัขและแมว', 'both', [/(อายุ|แก่|สูงวัย|สูงอายุ|senior)/, /(เท่าไหร่ถึง|เทียบ.*อายุคน|อายุคน|เรียกว่าแก่)/], 'อายุที่เริ่มเป็นสัตว์สูงวัยไม่ใช่ตัวเลขเดียวสำหรับทุกตัวค่ะ สุนัขต่างกันตามขนาด สายพันธุ์ และอายุขัย ส่วนการเทียบเป็นอายุคนด้วยสูตรเดียวอาจทำให้เข้าใจผิด ถ้าบอกชนิดสัตว์ อายุ และขนาดตัว หนูช่วยจัดข้อมูลไปคุยเรื่องการดูแลตามวัยกับสัตวแพทย์ได้ค่ะ', 'https://www.aaha.org/resources/2023-aaha-senior-care-guidelines-for-dogs-and-cats/defining-the-senior-patient/'),
    cardNew('dog_bathing_steps', 'อาบน้ำสุนัขอย่างปลอดภัย', 'dog', [/(อาบน้ำ|สระขน)/, /(วิธี|ขั้นตอน|ยังไง|อย่างไร)/], 'เตรียมแชมพูสำหรับสุนัข ผ้าขนหนู และพื้นกันลื่น แปรงขนก่อน ใช้น้ำอุ่นพอดี ระวังตาและหู ล้างแชมพูออกให้หมดแล้วเช็ดหรือเป่าให้แห้งโดยไม่ใช้ความร้อนสูงค่ะ ถ้ามีแผลหรือโรคผิวหนังให้ถามสัตวแพทย์ก่อนใช้ผลิตภัณฑ์ค่ะ', 'https://www.akc.org/expert-advice/health/its-bath-time-towels-brushes-dog-shampoo-and-more/'),
    cardNew('cat_cooked_egg', 'ไข่ต้มสำหรับแมว', 'cat', [/(ไข่ต้ม|ไข่สุก|ไข่ดิบ)/, /(กิน|ให้|ได้ไหม|ได้มั้ย)/], 'ไข่ที่ปรุงสุก ไม่ใส่เกลือหรือเครื่องปรุง อาจให้เป็นขนมเล็กน้อยได้ แต่ไม่แทนอาหารหลักที่ครบถ้วนค่ะ หลีกเลี่ยงไข่ดิบ หากน้องมีโรคหรืออาหารรักษาโรค ให้ถามสัตวแพทย์ก่อนเพิ่มอาหารใหม่ค่ะ', 'https://www.aspca.org/pet-care/cat-care/cat-nutrition-tips'),
    card('fireworks', 'เตรียมรับเสียงพลุสำหรับสุนัข', 'dog', [/(พลุ|ประทัด|ฟ้าร้อง|เสียงดัง)/, /(กลัว|ตกใจ|เตรียม|เครียด|หลบ|สั่น)/], 'เตรียมที่หลบคุ้นเคยภายในบ้านและป้องกันการหนี พาเดินก่อนช่วงเสียงดัง ปิดม่านและอยู่เป็นเพื่อนอย่างสงบ ไม่พาไปเผชิญเสียงหรือบังคับให้ออกจากที่หลบ หากกลัวมากให้คุยกับสัตวแพทย์ล่วงหน้าเพื่อวางแผนเฉพาะตัว ไม่ให้ยาคนเองค่ะ', DT + '/about-us/what-we-do/stories/preparing-for-fireworks'),
    card('puppy_socialisation', 'พาลูกสุนัขรู้จักโลกอย่างค่อยเป็นค่อยไป', 'dog', [/(ลูกหมา|ลูกสุนัข|puppy)/, /(เข้าสังคม|เจอคน|เจอหมา|เสียง|สิ่งใหม่|พาออก)/], 'ให้พบคน เสียง และสิ่งแวดล้อมใหม่ทีละน้อยในระดับที่ยังผ่อนคลาย จับคู่กับประสบการณ์ดีและให้ถอยได้ ไม่บังคับให้ทนจนกลัว ถามสัตวแพทย์เรื่องพื้นที่และการสัมผัสสัตว์อื่นให้เหมาะกับแผนวัคซีนค่ะ', DT + '/dog-advice/puppy/puppy-socialisation-introduction'),
    card('new_cat', 'เตรียมบ้านรับแมว', 'cat', [/(รับเลี้ยง|รับแมว.*(?:เข้าบ้าน|ตัวแรก|มาเลี้ยง)|เลี้ยงแมวครั้งแรก|แมวตัวแรก|เตรียม.*แมว|เพิ่ง.*แมว)/], 'เตรียมห้องสงบ อาหารและน้ำ กระบะทราย ที่ซ่อน และที่ลับเล็บ ให้สำรวจเองโดยไม่บังคับอุ้ม ตรวจทางหนีและเก็บของอันตราย เก็บประวัติเดิมและนัดตรวจสุขภาพกับสัตวแพทย์ ถ้ามีสัตว์อยู่แล้วต้องแนะนำตัวอย่างค่อยเป็นค่อยไปค่ะ', CP + '/help-and-advice/home-and-environment/bringing-a-cat-home'),
    card('fiv_education', 'รู้จัก FIV โดยไม่วินิจฉัยจากอาการ', 'cat', [/(เอดส์แมว|\bfiv\b)/, /(คือ|ติดต่อ|หายไหม|ดูแล|ตรวจ|ป้องกัน)/], 'FIV เป็นไวรัสของแมว การตรวจและตีความผลต้องอาศัยสัตวแพทย์ อาการหรือข้อความแชทอย่างเดียวบอกไม่ได้ว่าเป็นหรือไม่ แมวติดเชื้อจำนวนหนึ่งอยู่ได้อีกหลายปีเมื่อดูแลเหมาะสม ควรหลีกเลี่ยงการกัดต่อสู้และติดตามสุขภาพตามแผนหมอค่ะ', CORNELL + 'feline-immunodeficiency-virus'),
    card('felv_education', 'รู้จัก FeLV', 'cat', [/(ลิวคีเมีย|ลูคีเมีย|\bfelv\b)/, /(คือ|ติดต่อ|อาการ|ดูแล|ตรวจ|ป้องกัน)/], 'FeLV เป็นไวรัสที่กระทบสุขภาพแมวและแพร่ระหว่างแมวที่สัมผัสใกล้ชิดได้ ต้องตรวจเพื่อประเมิน ไม่วินิจฉัยจากอาการอย่างเดียว ก่อนนำแมวมาอยู่ร่วมกันให้คุยกับสัตวแพทย์เรื่องการตรวจ การแยกพื้นที่ และแผนป้องกันตามความเสี่ยงค่ะ', 'https://www.vet.cornell.edu/departments/cornell-feline-health-center/health-information/feline-health-topics/feline-leukemia-virus'),
];
/** Explicit species in the question wins over a selected pet for general facts.
 * No pet specified and no explicit species => ask instead of assuming cat/dog.
 */
function careSpecies(q, selected) {
    const cat = /แมว|\bcat\b|\bkitten\b/i.test(q);
    const dog = /สุนัข|หมา(?!ย)|\bdog\b|\bpuppy\b/i.test(q);
    if (cat && dog)
        return 'both';
    if (cat)
        return 'cat';
    if (dog)
        return 'dog';
    return selected || undefined;
}
function matchCareKnowledge(q, selected) {
    // Explicit record requests must not be replaced with generic advice.
    if (/(?:ขอดู|ดูประวัติ|อ่านบันทึก|(?:ประวัติ|บันทึก|ล่าสุด).{0,30}(?:มีอะไร|เมื่อไหร่|วันไหน|ที่บันทึก))/.test(q))
        return null;
    // Do not answer procedure/price/personal experience questions with a generic
    // care card merely because they mention the same treatment.
    if (/(ราคา|กี่บาท|ค่าใช้จ่าย|มีใครเคย|ใครเคย|ที่ไหนดี|คลินิกไหน)/.test(q))
        return null;
    const species = careSpecies(q, selected);
    if (species && !['dog', 'cat', 'both'].includes(species))
        return null;
    const matches = exports.CARE_CARDS.filter(c => c.groups.every(p => p.test(q)) &&
        (!species || c.species === 'both' || c.species === species));
    if (!matches.length)
        return null;
    if (!species && matches.some(c => c.species !== 'both'))
        return {
            text: 'คำถามนี้เกี่ยวกับสุนัขหรือแมวคะ? ช่วยระบุชนิดสัตว์และถามเรื่องเดิมอีกครั้ง เพื่อไม่ให้คำแนะนำผิดชนิดค่ะ',
            kind: 'no_data', intent: 'care:clarify_species', confidence: 1, suggestAgent: false,
        };
    // Keep a new-cat introduction and a lost-cat query from being mislabeled as
    // outdoor-cat fixation merely because the same sentence says "ตามหา/ไปหา".
    const refinedMatches = matches.filter(c => {
        if (c.id === 'cat_communication' && matches.some(m => m.id === 'cat_kneading'))
            return false;
        if (c.id === 'cat_communication' && matches.some(m => m.id === 'cat_heat'))
            return false;
        if (c.id === 'new_cat' && matches.some(m => m.id === 'cat_bathing'))
            return false;
        if (c.id === 'new_cat' && matches.some(m => m.id === 'moving_cat') && !/(รับเลี้ยง|รับแมว)/.test(q))
            return false;
        if (c.id === 'moving_cat' && matches.some(m => m.id === 'cat_house_soiling') && /(ฉี่|ปัสสาวะ|ขับถ่าย)/.test(q))
            return false;
        if (c.id === 'indoor_cat' && /แอบเลี้ยง/.test(q))
            return false;
        if (c.id === 'cat_introduction' && matches.some(m => m.id === 'multi_cat_resources'))
            return false;
        if (c.id === 'cat_other_cat_contact' && /(แมวใหม่.{0,12}เข้าบ้าน|ตัวเก่า|เพิ่งรับแมว)/.test(q))
            return false;
        if (c.id === 'lost_cat' && matches.some(m => m.id === 'cat_other_cat_contact') &&
            !/(แมวหาย|แมวหลง|หาแมวไม่เจอ)/.test(q))
            return false;
        return true;
    });
    if (!refinedMatches.length)
        return null;
    // Return at most two independently supported topics. Never concatenate
    // unlimited paragraphs just because a long message contains many keywords.
    const chosen = refinedMatches.slice(0, 2);
    return {
        text: chosen.map(c => `**${c.title}**\n${c.answer}`).join('\n\n'),
        kind: 'guidance', intent: `care:${chosen.map(c => c.id).join('+')}`,
        confidence: 0.8, suggestAgent: false,
        sources: [...new Set(chosen.flatMap(c => c.sources))],
    };
}

},
"medicalFallback":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchUnrecognizedMedical = matchUnrecognizedMedical;
const CORNELL_EMERGENCY = 'https://www.vet.cornell.edu/hospitals/services/emergency-and-critical-care-0';
const TREATMENT_OR_PLAN = /(ถ่ายพยาธิ|ผ่าตัด|รักษา|วิธีให้ยา|ความถี่ในการให้ยา|(?:ข้อห้าม|วิธี|ดูแล|เลี้ยง).{0,20}ลูกแมวแรกเกิด|วัคซีน.{0,24}(?:กี่เข็ม|ต้องฉีด|ครบไหม|ต่อยังไง))/;
const SYMPTOM_OR_DISEASE = /(อาการ|ป่วย|โรค|ไอ|จาม|ขี้ตา|ตาอักเสบ|หอบหืด|หายใจ|อาเจียน|อ้วก|ท้องเสีย|ถ่ายเหลว|ไข้หวัด|หัดแมว|เป็นไข้|ชัก|ซึม|บวม|เจ็บ|ปวด|เลือดออก|ถูกกัด|โดนกัด|กัด(?:หมา|แมว|น้อง)|แมวท้อง|หมาท้อง|ลูกแมวแรกเกิด)/;
function matchUnrecognizedMedical(text) {
    const q = String(text || '').toLowerCase();
    if (TREATMENT_OR_PLAN.test(q)) {
        return {
            text: 'เรื่องวิธีรักษา การให้ยา/ถ่ายพยาธิ การผ่าตัด หรือแผนดูแลลูกสัตว์ ต้องให้สัตวแพทย์ประเมินจากตัวน้องและประวัติจริงค่ะ หนูไม่กำหนดวิธีหรือความถี่แทนหมอ\n\nถ้ามีอาการอยู่ตอนนี้ ให้ติดต่อสัตวแพทย์โดยตรงและแจ้งอายุ อาการที่เห็น เวลาเริ่มเป็น และยาที่ได้รับค่ะ',
            kind: 'out_of_scope', intent: 'medical:vet_plan', confidence: 0.75, suggestAgent: false,
        };
    }
    if (SYMPTOM_OR_DISEASE.test(q)) {
        return {
            text: 'จากข้อความนี้หนูบอกไม่ได้ว่าน้องเป็นโรคอะไรหรือควรรักษาอย่างไรค่ะ **ติดต่อสัตวแพทย์โดยตรง** พร้อมแจ้งอาการที่เห็น เวลาเริ่มเป็น และประวัติที่บันทึกไว้\n\nถ้าหายใจลำบาก หมดสติ ชัก เลือดออกมาก หรือปัสสาวะไม่ออก **ให้ไปโรงพยาบาลสัตว์ฉุกเฉินทันที** ค่ะ',
            kind: 'out_of_scope', intent: 'medical:vet_assessment', confidence: 0.7,
            suggestAgent: false, sources: [CORNELL_EMERGENCY],
        };
    }
    return null;
}

},
"socialConversation":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchSocialConversation = matchSocialConversation;
const reply = (text, intent, sources = []) => ({
    text, kind: 'guidance', intent: `social:${intent}`, confidence: 0.8,
    suggestAgent: false, sources,
});
function matchSocialConversation(q) {
    if (/(?:เจอ|พบ|เก็บ).{0,28}แมว.{0,45}(?:เดินตาม|กลับบ้าน|ไม่มีเจ้าของ|ไม่มีกระบะ|ช่วยอย่างไร)/.test(q)) {
        return reply('ถ้าน้องปลอดภัยและคุณรับไว้ชั่วคราวได้ ให้เตรียมน้ำ อาหารแมว กระบะทราย และมุมสงบก่อนค่ะ อย่าเพิ่งสรุปว่าไม่มีเจ้าของ ลองถามคนละแวกนั้น แจ้งกลุ่มสัตว์หายในพื้นที่ และให้คลินิกช่วยอ่านไมโครชิป ถ้าน้องบาดเจ็บหรือดูป่วยให้ติดต่อสัตวแพทย์ค่ะ บอตยังไม่ได้ติดต่อใครแทนคุณ', 'found_cat', ['https://www.cats.org.uk/help-and-advice/lost-found-and-feral-cats/found-a-cat']);
    }
    if (/เพื่อนบ้าน.{0,35}(?:รำคาญ|บ่น).{0,20}(?:เสียงหมา|หมา).{0,12}(?:ของเรา|ที่บ้าน)|(?:เสียงหมา|หมา).{0,30}(?:ของเรา|ที่บ้าน).{0,30}เพื่อนบ้าน/.test(q)) {
        return reply('เริ่มจดช่วงเวลาและสิ่งที่ทำให้น้องเห่า แล้วลดสิ่งกระตุ้นที่จัดการได้ เช่น มุมมองหน้าต่าง ให้กิจกรรมที่เหมาะและชมเมื่อสงบค่ะ คุยกับเพื่อนบ้านถึงช่วงเวลาที่รบกวนเพื่อดูว่าดีขึ้นไหม อย่าลงโทษหรือทำให้น้องกลัว หากพฤติกรรมเพิ่งเปลี่ยนกะทันหันหรือมีอาการเจ็บ ให้สัตวแพทย์ตรวจค่ะ', 'own_dog_barking_neighbor', ['https://www.dogstrust.org.uk/dog-advice/training/unwanted-behaviours/stop-your-dog-barking']);
    }
    if (/(ใครเคย|มีใครเคย).{0,80}(รพ\.?|โรงพยาบาล|คลินิก|ขูดหินปูน)/.test(q)) {
        return reply('หนูไม่มีประสบการณ์พาน้องไปโรงพยาบาลเอง จึงรับรองประสบการณ์หรือผลการรักษาของที่ใดไม่ได้ค่ะ ถ้ากำลังเลือกสถานที่ ลองติดต่อโรงพยาบาลสัตว์นั้นโดยตรงเพื่อถามขั้นตอน การประเมินโดยสัตวแพทย์ และค่าใช้จ่ายก่อนตัดสินใจค่ะ', 'no_personal_clinic_experience');
    }
    if (/(แอบเลี้ยง|เลี้ยง.*(?:คอนโด|หอพัก).*(?:ได้ไหม|ทำยังไง))/.test(q)) {
        return reply('ลองตรวจข้อบังคับคอนโดหรือสัญญาเช่าก่อนค่ะ หากไม่อนุญาต ให้คุยกับนิติบุคคลหรือเจ้าของห้องเรื่องทางเลือกที่ถูกกฎ เพื่อให้น้องมีบ้านที่มั่นคงและไม่เสี่ยงต้องย้ายกะทันหันค่ะ', 'housing_rules');
    }
    // A story without a request needs one focused follow-up, not a made-up diagnosis.
    const hasQuestion = /[?？]|(?:ไหม|มั้ย|หรือเปล่า|รึเปล่า|อย่างไร|ยังไง|ทำไง|ควร|อยากรู้|ขอคำแนะนำ|เท่าไหร่|เท่าไร|อะไร|ทำไม)/.test(q);
    if (/(วัคซีน|ฉีดเข็ม).{0,80}(เข็ม|ครั้ง)|(?:เข็ม|ครั้ง).{0,80}วัคซีน/.test(q)) {
        return reply('รับทราบประวัติที่เล่ามาค่ะ ถ้าต้องการเช็กว่าน้องยังต้องรับวัคซีนอะไรหรือเมื่อไร ช่วยระบุชื่อวัคซีน วันที่ในสมุด และอายุของน้อง แล้วนำสมุดให้สัตวแพทย์วางแผนต่อค่ะ หนูไม่กำหนดตารางจากจำนวนเข็มอย่างเดียว', 'clarify_vaccine_story');
    }
    if (/(แม่แมว|แมวจร).{0,100}(คลอดลูก|ลูกแมว|หลายคอก)/.test(q)) {
        return reply('ขอบคุณที่เล่าเรื่องแม่แมวค่ะ อยากให้ช่วยเรื่องอาหาร ที่พัก ความปลอดภัยของลูกแมว หรือการหาหน่วยช่วยเหลือใกล้บ้านคะ? ถ้าแม่หรือลูกมีอาการผิดปกติ ให้ติดต่อสัตวแพทย์โดยตรงค่ะ', 'clarify_stray_family');
    }
    if (/(เลี้ยง|มี).{0,30}(หมา|สุนัข|แมว).{0,100}(ตัว|ปี)/.test(q)) {
        return reply('รับทราบข้อมูลน้อง ๆ ค่ะ อยากถามเรื่องการดูแล พฤติกรรม อาหาร หรือข้อมูลที่บันทึกไว้ของตัวไหนคะ? ระบุชื่อน้องกับเรื่องที่อยากรู้ได้เลยค่ะ', 'clarify_household_story');
    }
    if (hasQuestion)
        return null;
    return null;
}

},
"otherSpecies":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchOtherSpecies = matchOtherSpecies;
const MERCK_RABBIT = 'https://www.merckvetmanual.com/all-other-pets/rabbits/digestive-disorders-of-rabbits';
const OTHER_SPECIES = /(กระต่าย|แฮมสเตอร์|หนูแฮม|หนูตะเภา|กินีพิ[กค]|ปลาทอง|ปลาหมอสี|เต่า|กิ้งก่า|งู|สัตว์เลื้อยคลาน)/;
// One-syllable species names cannot be substring-matched: “วันนึง” and
// “วัคซีนกับ” both contain นก, while ปลา can be a cat's food.
const BIRD_SUBJECT = /(?:^|[\s(]|น้อง|ลูก|ตัว|เลี้ยง|ของ)นก(?=$|\s|ไม่|มี|กิน|บิน|เป็น|ป่วย|หาย|ตัว|ซึม|เจ็บ)/;
const FISH_SUBJECT = /(?:^|[\s(]|น้อง|ตัว|เลี้ยง|ของ|ฝูง)ปลา(?=$|\s|ไม่|มี|กิน|ว่าย|เป็น|ป่วย|หาย|ตัว|จุด|ซึม|ตาย)/;
const RABBIT_DIGESTIVE = /(กระต่าย.{0,65}(?:ไม่กิน|หยุดกิน|ไม่ถ่าย|ไม่อึ|อึไม่ออก|อึน้อย|ถ่ายน้อย|หยุดถ่าย)|(?:ไม่กิน|หยุดกิน|ไม่ถ่าย|ไม่อึ|อึไม่ออก|อึน้อย|ถ่ายน้อย|หยุดถ่าย).{0,65}กระต่าย)/;
const HEALTH = /(ไม่กิน|หยุดกิน|กินน้อย|กิน.{0,8}น้อย|นอนมาก|หลับมาก|ซึม|หายใจ|จุดขาว|เลือด|อ้วก|อาเจียน|เจ็บ|ป่วย|โรค|ผิดปกติ|อาการ|ยา|รักษา|ฉี่|อึ|ถ่าย)/;
function matchOtherSpecies(q) {
    const match = OTHER_SPECIES.exec(q);
    const bird = BIRD_SUBJECT.test(q);
    const fish = FISH_SUBJECT.test(q) && !/(?:แมว|หมา|สุนัข).{0,24}(?:กิน|ให้|อาหาร).{0,10}ปลา/.test(q);
    if (!match && !bird && !fish)
        return null;
    const species = match?.[1] || (bird ? 'นก' : 'ปลา');
    if (RABBIT_DIGESTIVE.test(q))
        return {
            text: '🚨 กระต่ายที่หยุดกินหรือถ่ายน้อยลงควร **ติดต่อสัตวแพทย์ที่รับกระต่ายโดยเร็วทันที** ค่ะ หนูไม่วินิจฉัยสาเหตุหรือแนะนำการป้อนยา/อาหารเอง ระหว่างติดต่อให้บอกเวลาที่เริ่มผิดปกติ อาหาร น้ำ และจำนวนมูลที่สังเกตได้',
            kind: 'emergency', intent: 'other_species:rabbit_digestive', confidence: 0.9,
            suggestAgent: false, sources: [MERCK_RABBIT],
        };
    if (HEALTH.test(q))
        return {
            text: `เรื่องสุขภาพของ${species}ต้องให้สัตวแพทย์ที่ดูแลสัตว์ชนิดนี้ประเมินค่ะ **ติดต่อสัตวแพทย์โดยตรง** และแจ้งอาการ เวลาเริ่มเป็น อาหาร น้ำ และสิ่งแวดล้อมที่เปลี่ยนไป หนูไม่ใช้เกณฑ์ของหมาหรือแมวมาวินิจฉัยหรือเลือกยาให้ค่ะ`,
            kind: 'out_of_scope', intent: 'other_species:vet_assessment', confidence: 0.85,
            suggestAgent: false,
        };
    return {
        text: `ตอนนี้คลังคำตอบฟรียังไม่มีข้อมูลที่ตรวจสอบแล้วสำหรับ${species}ค่ะ ช่วยระบุชนิด อายุ และเรื่องที่อยากทราบให้ชัดเจน หรือถามสัตวแพทย์ที่ดูแลสัตว์ชนิดนี้โดยตรงได้ค่ะ หนูจะไม่เอาคำแนะนำของหมาแมวมาปรับใช้เอง`,
        kind: 'out_of_scope', intent: 'other_species:no_sourced_guide', confidence: 0.8,
        suggestAgent: false,
    };
}

},
"seniorChange":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchSeniorChange = matchSeniorChange;
const AAHA_SENIOR = 'https://www.aaha.org/resources/supporting-your-senior-pet-veterinary-care-recommendations/';
const SENIOR = /(สูงวัย|สูงอายุ|หมาแก่|สุนัขแก่|แมวแก่|อายุ.{0,8}(?:[7-9]|1\d)\s*(?:ปี|ขวบ))/;
const ACTIVE_CHANGE = /(?:เริ่ม|เพิ่ง|จู่.?ๆ).{0,55}(?:ร้อง|ไม่กิน|กิน.{0,7}น้อย|ไม่ยอมอยู่ลำพัง|ดื่มน้ำมาก|กินน้ำมาก|พฤติกรรมเปลี่ยน|ฉี่ผิดที่)|(?:ไม่กิน|กิน.{0,7}น้อย|ดื่มน้ำมาก|กินน้ำมาก|ร้อง.{0,15}กลางคืน|พฤติกรรมเปลี่ยน|ฉี่ผิดที่)/;
function matchSeniorChange(q) {
    if (!SENIOR.test(q) || !ACTIVE_CHANGE.test(q))
        return null;
    return {
        text: 'พฤติกรรมหรือการกินดื่มที่เปลี่ยนไปในน้องสูงวัย **ควรติดต่อสัตวแพทย์โดยตรงเพื่อนัดประเมิน** ค่ะ หนูบอกสาเหตุจากข้อความไม่ได้ ระหว่างติดต่อให้จดว่าเริ่มเมื่อไร กินอาหารและน้ำเท่าไร ขับถ่ายอย่างไร และมีอาการเจ็บหรือเดินเปลี่ยนไปไหม ไม่ควรสรุปว่าเป็นเพราะอายุอย่างเดียวค่ะ',
        kind: 'out_of_scope', intent: 'senior:vet_assessment', confidence: 0.85,
        suggestAgent: false, sources: [AAHA_SENIOR],
    };
}

},
"answers":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.answerWeight = answerWeight;
exports.answerActivity = answerActivity;
exports.answerMedicine = answerMedicine;
exports.answerVaccine = answerVaccine;
exports.answerBooking = answerBooking;
exports.answerProfile = answerProfile;
exports.answerHealthRecords = answerHealthRecords;
exports.answerSummary = answerSummary;
const petDisplay_1 = require("./petDisplay");
const activityDisplay_1 = require("./activityDisplay");
const bookingView_1 = require("./bookingView");
const appointmentReminder_1 = require("./appointmentReminder");
const dateFormat_1 = require("./dateFormat");
// วันที่ในคำตอบใช้รูปแบบเดียวกับทั้งแอป "26 ต.ค. 2569" (lib/dateFormat)
const D = (iso) => (iso ? (0, dateFormat_1.formatDate)(String(iso).slice(0, 10), 'th') : '-');
const todayISO = () => new Date().toISOString().slice(0, 10);
const daysBetween = (a, b) => Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
/** ────────── น้ำหนัก ────────── */
function answerWeight(pet) {
    const rows = [...(pet.recentWeight || [])].sort((a, b) => b.date.localeCompare(a.date));
    const n = pet.name;
    if (rows.length === 0) {
        if (Number.isFinite(pet.weight) && pet.weight > 0) {
            return {
                hasData: true,
                text: `โปรไฟล์น้อง${n}ระบุน้ำหนัก **${pet.weight} กก.** ค่ะ แต่ยังไม่มีบันทึกวันที่ชั่ง จึงยืนยันว่าเป็นน้ำหนักล่าสุดหรือเทียบแนวโน้มไม่ได้ค่ะ`,
            };
        }
        return {
            hasData: false,
            text: `ยังไม่มีบันทึกน้ำหนักของน้อง${n}ในแอปเลยค่ะ\n\nลองชั่งแล้วบันทึกสัก 2–3 ครั้งห่างกันสัปดาห์ละครั้ง แล้วหนูจะเทียบแนวโน้มให้ได้ค่ะ 🐾`,
        };
    }
    const newest = rows[0];
    if (rows.length === 1) {
        return {
            hasData: true,
            text: `น้ำหนักล่าสุดของน้อง${n} = **${newest.weight} กก.** เมื่อ ${D(newest.date)} ค่ะ\n\n` +
                (pet.recordTotals && pet.recordTotals.weight > 1
                    ? `แสดง 1 จาก ${pet.recordTotals.weight} บันทึกที่โหลดในแชต จึงยังเทียบแนวโน้มจากข้อมูลชุดนี้ไม่ได้ค่ะ`
                    : 'มีบันทึกอยู่ครั้งเดียว เลยยังเทียบแนวโน้มขึ้น/ลงไม่ได้นะคะ'),
        };
    }
    // หาจุดอ้างอิงย้อนหลังราว 28 วัน ถ้าไม่มีก็ใช้ตัวเก่าสุด
    const cutoff = new Date(Date.now() - 28 * 86400000).toISOString().slice(0, 10);
    const baseline = rows.find((r) => r.date <= cutoff) || rows[rows.length - 1];
    const diff = +(newest.weight - baseline.weight).toFixed(2);
    const pct = baseline.weight > 0 ? (diff / baseline.weight) * 100 : 0;
    const gap = daysBetween(baseline.date, newest.date);
    const trend = diff === 0
        ? 'เท่าเดิม'
        : `${diff > 0 ? 'เพิ่มขึ้น' : 'ลดลง'} ${Math.abs(diff)} กก. (${Math.abs(pct).toFixed(1)}%)`;
    // ⚠️ ไม่ตีความว่า "อ้วน/ผอม/ป่วย" — บอกแค่ตัวเลขและชวนให้หมอดูถ้าเปลี่ยนเยอะ
    const flag = Math.abs(pct) >= 10
        ? `\n\n⚠️ เปลี่ยนไปเกิน 10% ใน ${gap} วัน — ควรเอาตัวเลขชุดนี้ให้สัตวแพทย์ดูค่ะ หนูประเมินสาเหตุแทนไม่ได้`
        : '';
    return {
        hasData: true,
        text: `น้ำหนักน้อง${n}\n` +
            `• ล่าสุด **${newest.weight} กก.** (${D(newest.date)})\n` +
            `• เทียบกับ ${baseline.weight} กก. (${D(baseline.date)} · ${gap} วันก่อน) → ${trend}\n` +
            `• แสดง ${rows.length} จาก ${pet.recordTotals?.weight ?? rows.length} บันทึก${flag}`,
    };
}
/** ────────── กิจกรรม 7 วัน (น้ำ/อาหาร/นอน/เดิน) ────────── */
const ACTIVITY_LABEL = {
    water: 'การดื่มน้ำ',
    food: 'การกินอาหาร',
    sleep: 'การนอน',
    walk: 'การเดิน/ออกกำลัง',
    play: 'การเล่น',
    poop: 'การขับถ่าย (อุจจาระ)',
    pee: 'การปัสสาวะ',
};
function answerActivity(pet, type, question = '') {
    const n = pet.name;
    const label = ACTIVITY_LABEL[type] || type;
    if (/วันนี้|today/i.test(question)) {
        const now = new Date();
        const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const daily = pet.activityDaily?.find(a => a.date === date && a.type === type);
        return daily ? {
            hasData: true,
            text: `${label}ของน้อง${n}\n• วันนี้ รวม **${daily.totalValue} ${(0, activityDisplay_1.displayActivityUnit)(daily.unit, 'th')}** จาก ${daily.count} รายการ\n\nเป็นยอดจากบันทึกในแอปค่ะ หากกังวลเรื่องสุขภาพให้ติดต่อสัตวแพทย์`,
        } : { hasData: false, text: `ยังไม่มีบันทึก${label}ของน้อง${n}สำหรับวันนี้ในข้อมูลที่แชทอ่านได้ค่ะ` };
    }
    const agg = (pet.activities || []).find((a) => a.type === type);
    const trend = (pet.activityTrend || []).find((a) => a.type === type);
    if (!agg && !trend) {
        return {
            hasData: false,
            text: `ยังไม่มีบันทึก${label}ของน้อง${n}ใน 7 วันล่าสุดค่ะ\n\nบันทึกไว้สักหน่อย แล้วหนูจะสรุปยอดรวมและเทียบสัปดาห์ก่อนให้ได้ค่ะ`,
        };
    }
    const lines = [];
    if (agg)
        lines.push(`• 7 วันล่าสุด รวม **${agg.totalValue} ${(0, activityDisplay_1.displayActivityUnit)(agg.unit, 'th')}** จาก ${agg.count} รายการ`);
    if (trend) {
        const d = trend.thisWeek - trend.lastWeek;
        const pct = trend.lastWeek > 0 ? (d / trend.lastWeek) * 100 : 0;
        const word = d === 0 ? 'เท่าเดิม' : d > 0 ? 'มากขึ้น' : 'น้อยลง';
        lines.push(`• สัปดาห์นี้ ${trend.thisWeek} ${(0, activityDisplay_1.displayActivityUnit)(trend.unit, 'th')} · สัปดาห์ก่อน ${trend.lastWeek} ${(0, activityDisplay_1.displayActivityUnit)(trend.unit, 'th')} → **${word}**` +
            (trend.lastWeek > 0 ? ` ${Math.abs(pct).toFixed(0)}%` : ''));
    }
    return {
        hasData: true,
        text: `${label}ของน้อง${n}\n${lines.join('\n')}\n\n(เป็นตัวเลขจากบันทึกในแอปล้วน ๆ นะคะ หนูไม่ได้ประเมินว่าปกติหรือผิดปกติ)`,
    };
}
/** ────────── ยา ────────── */
function answerMedicine(pet) {
    const n = pet.name;
    const meds = pet.medicines || [];
    if (meds.length === 0) {
        return { hasData: false, text: `ยังไม่มียาที่บันทึกไว้สำหรับน้อง${n}ค่ะ` };
    }
    const low = meds.filter((m) => typeof m.stock === 'number' && m.stock > 0 && m.stock <= 3);
    const out = meds.filter((m) => m.stock === 0);
    return {
        hasData: true,
        text: `ยาของน้อง${n} (ตามที่บันทึกไว้):\n` +
            meds.map((m) => `• ${m.name}${m.dosage ? ` — ${m.dosage}` : ''}${typeof m.stock === 'number' ? ` · คงเหลือ ${m.stock}` : ''}`).join('\n') +
            (out.length ? `\n\n🔴 หมดแล้ว: ${out.map((m) => m.name).join(', ')}` : '') +
            (low.length ? `\n🟠 ใกล้หมด: ${low.map((m) => m.name).join(', ')}` : '') +
            `\n\n(ขนาดยาที่แสดงคือค่าที่เจ้าของบันทึก ระบบไม่ได้ตรวจสอบคำสั่งสัตวแพทย์ ถ้าจะเปลี่ยนขนาดหรือหยุดยา ต้องถามสัตวแพทย์ก่อนนะคะ)`,
    };
}
/** ────────── วัคซีน (จากบันทึกเท่านั้น · ไม่ให้ตารางวัคซีน) ────────── */
function answerVaccine(pet) {
    const n = pet.name;
    const vs = pet.vaccines || [];
    if (vs.length === 0) {
        return {
            hasData: false,
            text: `ยังไม่มีวัคซีนที่บันทึกไว้สำหรับน้อง${n}ค่ะ\n\nถ้ามีสมุดวัคซีน ลองบันทึกชื่อวัคซีน + วันที่ฉีด + วันนัดถัดไปที่หมอเขียนให้ แล้วหนูจะเตือนก่อนถึงวันนัดค่ะ`,
        };
    }
    const done = [...vs].sort((a, b) => String(b.date).localeCompare(String(a.date)));
    const today = todayISO();
    const upcoming = vs
        .filter((v) => v.nextDue && String(v.nextDue) >= today)
        .sort((a, b) => String(a.nextDue).localeCompare(String(b.nextDue)));
    const overdue = vs
        .filter((v) => v.nextDue && String(v.nextDue) < today)
        .sort((a, b) => String(b.nextDue).localeCompare(String(a.nextDue)));
    const parts = [`วัคซีนของน้อง${n} (จากสมุดบันทึกในแอป)`];
    parts.push(`\n**แสดง ${done.length} จาก ${pet.recordTotals?.vaccines ?? done.length} รายการที่บันทึก** ล่าสุด: ${done[0].name} · ${D(done[0].date)}${done[0].clinic ? ` · ${done[0].clinic}` : ''}`);
    if (upcoming.length) {
        const u = upcoming[0];
        parts.push(`\n📅 **นัดครั้งถัดไป:** ${u.name} · ${D(u.nextDue)} (อีก ${daysBetween(today, String(u.nextDue))} วัน)`);
    }
    if (overdue.length) {
        const o = overdue[0];
        parts.push(`\n🔴 **เลยกำหนดแล้ว:** ${o.name} · ครบกำหนด ${D(o.nextDue)} (เลยมา ${daysBetween(String(o.nextDue), today)} วัน) — ควรโทรถามคลินิกค่ะ`);
    }
    // E2E 17 ต.ค. 69: no typed due date → show the booster date the Vaccine Program page (and the reminders) use.
    const boosters = vs.filter((v) => !v.nextDue && v.boosterDue)
        .sort((a, b) => String(a.boosterDue).localeCompare(String(b.boosterDue)));
    if (!upcoming.length && !overdue.length && boosters.length) {
        const b = boosters.find((v) => String(v.boosterDue) >= today) || boosters[boosters.length - 1];
        const due = String(b.boosterDue);
        parts.push(due >= today
            ? `\n📅 **กระตุ้นครั้งถัดไป (ตามโปรแกรมวัคซีนของแอป):** ${b.name} · ${D(due)} (${due === today ? 'วันนี้' : `อีก ${daysBetween(today, due)} วัน`})`
            : `\n🔴 **เลยกำหนดกระตุ้นแล้ว (ตามโปรแกรมวัคซีนของแอป):** ${b.name} · ครบกำหนด ${D(due)} (เลยมา ${daysBetween(due, today)} วัน) — ควรโทรถามคลินิกค่ะ`);
    }
    if (!upcoming.length && !overdue.length && !boosters.length) {
        parts.push(pet.recordTotals && pet.recordTotals.vaccines > vs.length
            ? `\nไม่พบวันนัดถัดไปใน ${vs.length} รายการล่าสุดที่โหลดในแชตค่ะ ตรวจประวัติเต็มในหน้าวัคซีนได้`
            : `\nยังไม่มีวันนัดถัดไปที่บันทึกไว้ค่ะ`);
    }
    parts.push(`\n\n(หนูอ่านจากที่บันทึกไว้เท่านั้น — โปรแกรมวัคซีนว่าต้องฉีดอะไรอีกกี่เข็ม ต้องให้สัตวแพทย์เป็นคนกำหนดนะคะ)`);
    return { hasData: true, text: parts.join('') };
}
/** ────────── นัดหมาย ────────── */
function answerBooking(pet) {
    const n = pet.name;
    const bs = pet.bookings || [];
    if (bs.length === 0) {
        return { hasData: false, text: `ยังไม่มีนัดที่บันทึกไว้สำหรับน้อง${n}ค่ะ — ถ้าต้องการ หนูช่วยค้นหาคลินิกใกล้ตัว พร้อมแสดงข้อมูลให้คุณโทรติดต่อและนัดหมายกับร้านโดยตรงได้ค่ะ` };
    }
    const now = Date.now();
    const up = (0, bookingView_1.upcomingAppointmentList)(bs, now);
    const past = bs.filter(b => { const at = (0, appointmentReminder_1.parseAppointmentDateTime)(b.date, b.time || ''); return at && at.getTime() < now; }).sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`));
    const closedFuture = bs.filter(b => (b.status === 'cancelled' || b.status === 'completed') && ((0, appointmentReminder_1.parseAppointmentDateTime)(b.date, b.time || '')?.getTime() || 0) >= now);
    const fmt = (b) => `• ${b.title} — ${D(b.date)}${b.time ? ` ${b.time} น.` : ''}${b.place ? ` · ${b.place}` : ''}${b.doctor ? ` · ${b.doctor}` : ''}`;
    const out = [];
    if (up.length)
        out.push(`นัดที่จะถึงของน้อง${n}:\n${up.slice(0, 5).map(fmt).join('\n')}`);
    else
        out.push(pet.recordTotals && pet.recordTotals.bookings > bs.length
            ? `ไม่พบนัดที่จะถึงใน ${bs.length} รายการที่โหลดในแชตของน้อง${n}ค่ะ ตรวจรายการเต็มในหน้านัดหมายได้`
            : `ไม่มีนัดที่จะถึงของน้อง${n}ค่ะ`);
    if (past.length)
        out.push(`\nนัดที่ผ่านมาล่าสุด:\n${past.slice(0, 3).map(fmt).join('\n')}`);
    if (closedFuture.length)
        out.push(`\nรายการที่บันทึกสถานะแล้ว:\n${closedFuture.slice(0, 3).map(b => `${fmt(b)} · ${b.status === 'cancelled' ? 'ยกเลิก' : 'เสร็จสิ้น'}`).join('\n')}`);
    return { hasData: true, text: out.join('\n') };
}
/** ────────── ข้อมูลตัวน้อง ────────── */
function answerProfile(pet, question = '') {
    const n = pet.name;
    const sp = pet.species === 'dog' ? 'สุนัข' : pet.species === 'cat' ? 'แมว' : 'สัตว์เลี้ยง';
    const gender = pet.gender === 'male' ? 'ผู้' : pet.gender === 'female' ? 'เมีย' : '';
    const cleanValue = (value) => {
        const s = String(value ?? '').trim();
        return /^(ไม่ระบุ|ไม่ทราบ|ไม่มีข้อมูล|ยังไม่มีข้อมูล|unknown|n\/a|-)$/i.test(s) ? '' : s;
    };
    const breed = cleanValue(pet.breed);
    const age = cleanValue((0, petDisplay_1.displayPetAge)(pet.age, 'th', pet.birthday));
    const birthday = cleanValue(pet.birthday);
    const color = cleanValue(pet.color);
    const microchip = cleanValue(pet.microchip);
    const allergies = cleanValue(pet.allergies);
    const weight = typeof pet.weight === 'number' && pet.weight > 0 ? pet.weight : undefined;
    // Some imported profiles use the species label as a placeholder breed.
    const actualBreed = breed === sp ? '' : breed;
    const q = String(question || '').toLowerCase();
    const asked = {
        age: /(อายุ|กี่ปี|กี่เดือน|กี่ขวบ)/.test(q),
        birthday: /(วันเกิด|เกิดวันไหน)/.test(q),
        breed: /(พันธุ์|สายพันธุ์)/.test(q),
        gender: /เพศ/.test(q),
        weight: /น้ำหนัก/.test(q),
        color: /สี/.test(q),
        microchip: /(ไมโครชิป|microchip|เลขชิป)/.test(q),
        allergies: /(แพ้|ภูมิแพ้|อาการแพ้)/.test(q),
    };
    const hasQuestion = Object.values(asked).some(Boolean);
    const missing = (label) => `• ${label}: ยังไม่มีข้อมูลที่บันทึกไว้`;
    const rows = [];
    rows.push(`• ชนิด: ${sp}${actualBreed ? ` · พันธุ์ ${actualBreed}` : ''}`);
    if (!actualBreed && asked.breed)
        rows.push(missing('พันธุ์'));
    if (age)
        rows.push(`• อายุ: ${age}`);
    else if (asked.age)
        rows.push(missing('อายุ'));
    if (birthday)
        rows.push(`• วันเกิด: ${D(birthday)}`);
    else if (asked.birthday)
        rows.push(missing('วันเกิด'));
    if (gender)
        rows.push(`• เพศ: ${gender}`);
    else if (asked.gender)
        rows.push(missing('เพศ'));
    if (weight)
        rows.push(`• น้ำหนักในโปรไฟล์: ${weight} กก.`);
    else if (asked.weight)
        rows.push(missing('น้ำหนัก'));
    if (color)
        rows.push(`• สี: ${color}`);
    else if (asked.color)
        rows.push(missing('สี'));
    if (microchip)
        rows.push(`• ไมโครชิป: ${microchip}`);
    else if (asked.microchip)
        rows.push(missing('ไมโครชิป'));
    if (allergies)
        rows.push(`• แพ้: ${allergies}`);
    else if (asked.allergies)
        rows.push(missing('ประวัติแพ้'));
    if (pet.notes)
        rows.push(`• หมายเหตุ: ${pet.notes}`);
    const requestedFields = Object.entries(asked).filter(([, value]) => value).map(([key]) => key);
    const hasRequestedData = requestedFields.some((key) => {
        if (key === 'age')
            return Boolean(age);
        if (key === 'birthday')
            return Boolean(birthday);
        if (key === 'breed')
            return Boolean(actualBreed);
        if (key === 'gender')
            return Boolean(gender);
        if (key === 'weight')
            return Boolean(weight);
        if (key === 'color')
            return Boolean(color);
        if (key === 'microchip')
            return Boolean(microchip);
        if (key === 'allergies')
            return Boolean(allergies);
        return false;
    });
    return { hasData: hasQuestion ? hasRequestedData : true, text: `ข้อมูลน้อง${n}\n${rows.join('\n')}` };
}
/** ────────── ประวัติสุขภาพ ────────── */
function answerHealthRecords(pet) {
    const n = pet.name;
    const rs = [...(pet.healthRecords || [])].sort((a, b) => String(b.date).localeCompare(String(a.date)));
    if (rs.length === 0) {
        return { hasData: false, text: `ยังไม่มีประวัติสุขภาพที่บันทึกไว้สำหรับน้อง${n}ค่ะ` };
    }
    return {
        hasData: true,
        text: `ประวัติสุขภาพน้อง${n} (ล่าสุด ${Math.min(rs.length, 5)} จาก ${pet.recordTotals?.healthRecords ?? rs.length} รายการ)\n` +
            rs.slice(0, 5).map((r) => `• ${D(r.date)} — ${r.title}${r.clinic ? ` · ${r.clinic}` : ''}${r.description ? `\n   ${r.description}` : ''}`).join('\n'),
    };
}
/** ────────── สรุปภาพรวม ────────── */
function answerSummary(pet) {
    const n = pet.name;
    const today = todayISO();
    const bits = [];
    const w = [...(pet.recentWeight || [])].sort((a, b) => b.date.localeCompare(a.date))[0];
    bits.push(w ? `• น้ำหนักล่าสุด ${w.weight} กก. (${D(w.date)})`
        : pet.weight > 0 ? `• น้ำหนักในโปรไฟล์ ${pet.weight} กก. (ไม่ทราบวันที่ชั่ง)`
            : '• ยังไม่มีบันทึกน้ำหนัก');
    const meds = pet.medicines || [];
    bits.push(meds.length ? `• ยาที่ใช้อยู่ ${meds.length} รายการ: ${meds.map((m) => m.name).join(', ')}` : '• ไม่มียาที่บันทึกไว้');
    const nextVac = (pet.vaccines || [])
        .filter((v) => v.nextDue && String(v.nextDue) >= today)
        .sort((a, b) => String(a.nextDue).localeCompare(String(b.nextDue)))[0];
    const overdueVac = (pet.vaccines || []).filter((v) => v.nextDue && String(v.nextDue) < today);
    bits.push(overdueVac.length ? `• 🔴 วัคซีนเลยกำหนด ${overdueVac.length} รายการ`
        : nextVac ? `• วัคซีนนัดถัดไป ${nextVac.name} · ${D(nextVac.nextDue)}`
            : '• ไม่มีวันนัดวัคซีนที่บันทึกไว้');
    const nextBook = (0, bookingView_1.nextUpcomingAppointment)(pet.bookings || [], Date.now());
    bits.push(nextBook ? `• นัดถัดไป ${nextBook.title} · ${D(nextBook.date)}` : '• ไม่มีนัดที่จะถึง');
    const acts = pet.activities || [];
    if (acts.length) {
        bits.push(`• กิจกรรม 7 วัน: ${acts.map((a) => `${ACTIVITY_LABEL[a.type] || a.type} ${a.totalValue} ${(0, activityDisplay_1.displayActivityUnit)(a.unit, 'th')}`).join(' · ')}`);
    }
    else {
        bits.push('• ยังไม่มีบันทึกกิจกรรมใน 7 วันล่าสุด');
    }
    return {
        hasData: true,
        text: `สรุปข้อมูลน้อง${n}จากในแอปค่ะ\n${bits.join('\n')}\n\n` +
            'นี่คือการอ่านข้อมูลที่บันทึกไว้ ไม่ใช่การประเมินสุขภาพค่ะ',
    };
}

},
"types":function(require,module,exports){
"use strict";
// lib/smartBot/types.ts
// ชนิดข้อมูลกลางของ Smart Bot (โหมดแชตฟรี)
//
// หลักการ (ยึดจาก docs/Pet-Knowledge-Base-Plan-2569-08-27.md §6):
//   Smart Bot ตอบได้เฉพาะ
//     1) ข้อมูลที่ "บันทึกไว้ในแอปแล้ว" ของสัตว์ตัวนั้น
//     2) ตารางอาหารปลอดภัย/เป็นพิษ ที่มีแหล่งอ้างอิงกำกับทุกแถว (ASPCA / Merck)
//     3) การเตือนให้รีบพบสัตวแพทย์ เมื่อเจอสัญญาณฉุกเฉินที่มีแหล่งอ้างอิง
//   ห้ามเด็ดขาด: วินิจฉัยโรค · สั่ง/ระบุขนาดยา · บอกให้หยุดยา ·
//                บอกว่า "ไม่ต้องไปหาหมอ" · ให้ตารางวัคซีน/จำนวนเข็ม
//   ถ้าไม่มั่นใจ → ต้อง "ส่งต่อ" ไม่ใช่ "เดา"
//
// Smart Bot ทำงานออฟไลน์ 100% — ห้ามเรียกเน็ต ห้ามเรียก LLM ห้ามหัก Pew
Object.defineProperty(exports, "__esModule", { value: true });

},
"handoff":function(require,module,exports){
"use strict";
// lib/smartBot/handoff.ts
// ─────────────────────────────────────────────────────────────────────────
// กติกา "ชวนใช้ Agent ตอนบอทฟรีตอบไม่ได้" — ให้ไม่รำคาญ
//
// ที่มา: docs/SmartBot-Memory-And-Handoff-Plan-2569-09-01.md §4, §5.4
//   • NN/g (30 มิ.ย. 2562) — ผู้ใช้กดปิดป๊อปอัปแบบอัตโนมัติโดยไม่อ่าน
//     → ห้ามใช้ modal/ป๊อปอัป ให้ฝังเป็นการ์ดใต้ข้อความแทน
//   • Alert fatigue ทางการแพทย์ — อัตรากดข้ามการเตือน 49–96%
//     → ยิ่งเตือนบ่อย ยิ่งไม่มีใครอ่าน
//   • MISQ (Gnewuch & Reinkemeier) "collaborative repair" —
//     ขอโทษ + บอกว่าทำไมตอบไม่ได้ + เสนอทางเลือก ได้ผลดีกว่าขอโทษเฉย ๆ
//
// ⚠️ ตัวเลขเพดานด้านล่าง (1/session · 2/วัน) **ไม่มีงานวิจัยรองรับโดยตรง**
//    ไม่มีใครตีพิมพ์ว่า "เด้งกี่ครั้งถึงเรียกว่ามากไป" — เลือกค่าที่ปลอดภัยไว้ก่อน
//    ต้องวัดจริงหลังเปิดใช้แล้วปรับ ห้ามอ้างว่าเป็นค่าที่พิสูจน์แล้ว
//
// ไฟล์นี้เป็นฟังก์ชันบริสุทธิ์ล้วน ๆ (ไม่แตะ storage ไม่แตะ UI) เพื่อให้เทสได้
// ─────────────────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.EMPTY_NUDGE_STATE = exports.DISMISS_SILENCE_AT = exports.HIGHLIGHT_MAX_PER_DAY = exports.HIGHLIGHT_MAX_PER_SESSION = void 0;
exports.rollNudgeState = rollNudgeState;
exports.isHighValueQuestion = isHighValueQuestion;
exports.decideNudge = decideNudge;
exports.nudgeCopy = nudgeCopy;
/** เพดานการชวนแบบเด่น (ค่าที่เลือกไว้ก่อน ยังไม่ได้พิสูจน์ — ดูหัวไฟล์) */
exports.HIGHLIGHT_MAX_PER_SESSION = 1;
exports.HIGHLIGHT_MAX_PER_DAY = 2;
/** ปัดกี่ครั้งถึงเงียบทั้งวัน */
exports.DISMISS_SILENCE_AT = 2;
exports.EMPTY_NUDGE_STATE = {
    dateKey: '',
    highlightsToday: 0,
    dismissesToday: 0,
};
/** รีเซ็ตตัวนับเมื่อข้ามวัน — เรียกก่อนใช้เสมอ */
function rollNudgeState(state, todayKey) {
    if (!state || state.dateKey !== todayKey) {
        return { dateKey: todayKey, highlightsToday: 0, dismissesToday: 0 };
    }
    return state;
}
// ─────────────────────────────────────────────────────────────────────────
// คำถามแบบไหน "คุ้มที่จะชวนให้จ่าย"
//
// เกณฑ์: เป็นเรื่องที่ Agent ตอบได้ดีกว่าบอทจริง ๆ = อาการ · ยา · พฤติกรรมผิดปกติ
// ห้ามชวนตอน: ทักทาย ขอบคุณ ถามข้อมูลในแอป ถามอาหาร (บอทตอบเองได้อยู่แล้ว)
//
// ⚠️ ภาษาไทยไม่มีเว้นวรรค → ห้ามใส่คำสั้นลอย ๆ
//    "ยา" ลอย ๆ จะไปโดน "อยาก" "ยาก" "ยาว" "ระยะ" → ต้องผูกกับคำข้างเคียงเสมอ
//    "ไอ" ลอย ๆ จะไปโดน "ไอติม" "ไอ้" → ตัดทิ้งดีกว่าจับผิด
// ─────────────────────────────────────────────────────────────────────────
/** อาการ/ความผิดปกติทางร่างกาย */
const SYMPTOM = /(ป่วย|ไม่สบาย|อาการ|อ้วก|อาเจียน|ขย้อน|ท้องเสีย|ถ่ายเหลว|ท้องผูก|ท้องอืด|ซึม|เบื่ออาหาร|ไม่ยอมกิน|ไม่กินข้าว|ไม่กินอาหาร|ผอมลง|น้ำหนักลด|บวม|แผล|เลือดออก|เป็นเลือด|ชัก|เกร็ง|หอบ|หายใจ|เจ็บ|ปวด|ขาเป๋|เดินไม่|ตาแฉะ|ตาขุ่น|หูอักเสบ|ผื่น|ตุ่ม|ขนร่วง|คันมาก|เกาตลอด|กลิ่นปาก|ฉี่ไม่ออก|ถ่ายไม่ออก|ปัสสาวะ|ตัวร้อน|เป็นไข้|สั่น|อ่อนแรง|ล้มลง|ท้องกาง|เหงือกซีด|ลิ้นม่วง)/;
/** ยา/วัคซีน — ต้องผูกคำข้างเคียงเพื่อกัน "อยาก/ยาก/ยาว" */
const MEDICINE = /(กินยา|ให้ยา|ป้อนยา|กรอกยา|แพ้ยา|ขนาดยา|โดสยา|ยาแก้|ยาหยด|ยาถ่าย|ยาคุม|ยาฆ่า|ยาตัวไหน|ยาอะไร|ยาชนิด|ยาที่|วัคซีน|ถ่ายพยาธิ|เห็บ|หมัด|ทำหมัน|ฉีดยา)/;
/** พฤติกรรมเปลี่ยนไปแบบน่ากังวล */
const BEHAVIOR = /(ก้าวร้าว|กัดคน|ขู่|ร้องไม่หยุด|ร้องทั้งคืน|เลียตัวเอง|กัดตัวเอง|ซ่อนตัว|ไม่เล่น|นอนทั้งวัน|เดินวน|กระวนกระวาย)/;
/** คำที่บ่งว่ากำลังเดือดร้อนจริง ไม่ใช่ถามเล่น */
const DISTRESS = /(ช่วยด้วย|ทำไงดี|ทำยังไงดี|กังวล|เป็นห่วง|น่าเป็นห่วง|ผิดปกติ|ไม่รู้จะทำ)/;
/**
 * คำถามนี้คุ้มที่จะชวนให้เสีย Paw ไหม
 * — คืน false = ยังโชว์ปุ่มเงียบได้ แต่ห้ามโชว์การ์ดเด่น
 */
function isHighValueQuestion(text) {
    const q = String(text || '').toLowerCase().trim();
    if (q.length < 6)
        return false; // สั้นเกินไป มักเป็นคำทักทาย/คำเดียว
    return SYMPTOM.test(q) || MEDICINE.test(q) || BEHAVIOR.test(q) || DISTRESS.test(q);
}
/**
 * ตัดสินว่าจะชวนระดับไหน
 *
 * ลำดับการตัด (เข้มก่อน หลวมทีหลัง):
 *   1. บอทตอบจบแล้ว / อยู่โหมด Agent อยู่แล้ว → ไม่ชวน
 *   2. ปัดครบ 2 ครั้งวันนี้ → เงียบทั้งวัน (เหลือแค่ปุ่มเงียบ)
 *   3. คำถามไม่ใช่เรื่องสุขภาพ → ปุ่มเงียบ
 *   4. เกินเพดาน session/วัน → ปุ่มเงียบ
 *   5. ผ่านหมด → การ์ดเด่น
 */
function decideNudge(input) {
    const { suggestAgent, question, highlightsThisSession, state, alreadyOnAgent } = input;
    if (!suggestAgent || alreadyOnAgent)
        return { level: 'none', consumesHighlight: false };
    // ปัดบ่อย = ไม่อยากให้ชวน → เคารพ ไม่ต้องเด่นอีกทั้งวัน
    if (state.dismissesToday >= exports.DISMISS_SILENCE_AT)
        return { level: 'quiet', consumesHighlight: false };
    if (!isHighValueQuestion(question))
        return { level: 'quiet', consumesHighlight: false };
    if (highlightsThisSession >= exports.HIGHLIGHT_MAX_PER_SESSION)
        return { level: 'quiet', consumesHighlight: false };
    if (state.highlightsToday >= exports.HIGHLIGHT_MAX_PER_DAY)
        return { level: 'quiet', consumesHighlight: false };
    return { level: 'highlight', consumesHighlight: true };
}
/**
 * คำอธิบายบนการ์ดเด่น — เขียนแบบ "collaborative repair"
 * บอกตรง ๆ ว่าตอบไม่ได้ + บอกว่าอีกโหมดต่างยังไง + ไม่กดดัน
 *
 * ⚠️ ห้ามเขียนว่า "Agent ตอบได้แน่นอน" — เดาไม่ได้ และเป็นการอวยเกินจริง
 */
function nudgeCopy(cost, balance) {
    const enough = balance >= cost;
    return {
        title: 'คำถามนี้เกินที่หนูตอบเองได้ค่ะ',
        body: enough
            ? `โหมดนี้หนูดูได้แค่บันทึกในแอปกับตารางอาหาร ส่วน **Agent** จะอ่านข้อมูลน้องแล้ววิเคราะห์ต่อให้ได้ละเอียดกว่า (ไม่ใช่การวินิจฉัยนะคะ)\nใช้ ${cost} Paw · ตอนนี้มี ${balance} Paw`
            : `โหมด **Agent** วิเคราะห์ต่อให้ได้ละเอียดกว่า แต่ตอนนี้ Paw ไม่พอค่ะ (ต้องใช้ ${cost} · มี ${balance})`,
        cta: enough ? `ถาม Agent · ${cost} Paw` : 'เติม Paw',
    };
}

},
"petDisplay":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.displayPetAge = displayPetAge;
exports.displayKnownPlaceholder = displayKnownPlaceholder;
exports.displayPetBreed = displayPetBreed;
const petAge_1 = require("./petAge");
/** Derive current age when a valid birthday is known; preserve legacy age text otherwise. */
function displayPetAge(value, language, birthday, now = new Date()) {
    const current = (0, petAge_1.petAgeFromBirthday)(birthday, language, now);
    if (current !== null)
        return current;
    const raw = String(value || '').trim();
    if (language !== 'en')
        return raw;
    if (!raw || raw === 'ไม่ระบุ' || raw === 'ยังไม่ระบุ')
        return 'Not specified';
    if (raw === 'แรกเกิด')
        return 'Newborn';
    return raw
        .replace(/(\d+)\s*ปี/g, (_, n) => `${n} ${Number(n) === 1 ? 'year' : 'years'}`)
        .replace(/(\d+)\s*เดือน/g, (_, n) => `${n} ${Number(n) === 1 ? 'month' : 'months'}`)
        .replace(/(\d+)\s*วัน/g, (_, n) => `${n} ${Number(n) === 1 ? 'day' : 'days'}`);
}
function displayKnownPlaceholder(value, language) {
    const raw = String(value || '').trim();
    if (language === 'en' && (raw === 'ไม่ระบุ' || raw === 'ยังไม่ระบุ'))
        return 'Not specified';
    return raw;
}
/** Only translate the three generic species labels written by the app during pet creation. */
function displayPetBreed(value, language) {
    const raw = String(value || '').trim();
    if (language !== 'en')
        return raw;
    return { 'สุนัข': 'Dog', 'แมว': 'Cat', 'อื่นๆ': 'Other' }[raw] || raw;
}

},
"bookingView":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upcomingAppointmentList = upcomingAppointmentList;
exports.nextUpcomingAppointment = nextUpcomingAppointment;
exports.appointmentPhase = appointmentPhase;
exports.filterBookingList = filterBookingList;
const appointmentReminder_1 = require("./appointmentReminder");
/** Only a valid, future appointment with an explicit upcoming status is next. */
function upcomingAppointmentList(bookings, now) {
    return bookings.map(booking => ({ booking, at: booking.status === 'upcoming' ? (0, appointmentReminder_1.parseAppointmentDateTime)(booking.date || '', booking.time || '')?.getTime() : undefined }))
        .filter(row => row.at !== undefined && row.at >= now)
        .sort((a, b) => a.at - b.at).map(row => row.booking);
}
function nextUpcomingAppointment(bookings, now) {
    return upcomingAppointmentList(bookings, now)[0];
}
/** Time passing does not prove attendance; keep the stored outcome unchanged. */
function appointmentPhase(booking, now) {
    const at = (0, appointmentReminder_1.parseAppointmentDateTime)(booking.date, booking.time);
    return booking.status === 'upcoming' && at && at.getTime() < now ? 'elapsed' : booking.status;
}
function filterBookingList(bookings, filter, date, now) {
    const order = { upcoming: 0, elapsed: 1, completed: 2, cancelled: 3 };
    return bookings.filter(b => (!date || b.date === date) && (filter === 'all' || appointmentPhase(b, now) === filter))
        .sort((a, b) => order[appointmentPhase(a, now)] - order[appointmentPhase(b, now)] ||
        `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
}

},
"ingestion":function(require,module,exports){
"use strict";
/**
 * Accidental ingestion of something that is not pet food (26 Oct 2026, round 5 of the
 * Free Chat audit). Structural, not a list of product names. A report needs all three:
 *   1) an exposure verb (กิน เลีย แทะ กัด เคี้ยว กลืน คาบ ได้รับ โดน … / ate licked chewed
 *      swallowed got into had some of …),
 *   2) a product that is not pet food: a medicine, a human-use product class (cream, gel,
 *      oil, spray, toothpaste, cosmetics …) or something a person owns ("ของแม่", "my"),
 *   3) wording that says it happened, not a permission, plan or prevention question.
 * Medicines and supplements can be the pet's own, so for those an accident sign is also
 * needed (a person's or another pet's product, "เผลอ/แอบ", a chewed pack, a whole bottle,
 * more than prescribed …). Only the pet's own vet-prescribed medicine at the prescribed
 * amount is excluded. The caller routes a match to the existing poisoning copy.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HUMAN_PAINKILLER_NAMES = exports.HUMAN_TOPICAL_NAMES = void 0;
exports.isAccidentalIngestionTh = isAccidentalIngestionTh;
exports.isAccidentalIngestionEn = isAccidentalIngestionEn;
/** ยาทา/ครีม/เจล/ยาหม่อง/น้ำมันหอมระเหย/ยาปลูกผมของคน (ชื่อเฉพาะ · ใช้ร่วมกับ appHelp) */
exports.HUMAN_TOPICAL_NAMES = String.raw `(?:ยาทา(?:\S{0,8})?|ยาแก้ปวดแบบทา|ยาหม่อง|ยานวด|ครีม(?:ทา\S{0,6}|บำรุง\S{0,6}|กันแดด|แก้\S{0,6}|ยา|ของ(?:คน|ฉัน|ผม|แม่|พ่อ|เรา))|ยาครีม|เจล(?!ลี่)|โลชั่น|น้ำมันหอมระเหย|ทีทรีออยล์|ยาปลูกผม|ยาลดผมร่วง|ไมนอกซิดิล|แผ่นแปะ(?:แก้ปวด|นิโคติน)|กันแดด|ยาสีฟัน(?!(?:สำหรับ)?(?:สัตว์|หมา|แมว|สุนัข))|น้ำยาบ้วนปาก|\b(?:minoxidil|sunscreen|sunblock|mouthwash|rogaine|ointments?|lotions?|essential oils?|tea tree oil|tiger balm|deep heat|voltaren|bengay|icy hot)\b)`;
/** ยาแก้ปวด/ลดไข้ของคน หรือ "ยาคน/ยาเจ้าของ" (ชื่อไทยและอังกฤษ) */
exports.HUMAN_PAINKILLER_NAMES = String.raw `(?:พารา(?:เซตามอล|เซต)?(?!กอน|ไดซ์|ไดส์|ชู|มิเตอร์|ฟิน|ลิมปิก)|ยาซาร่า|ไทลินอล|พานาดอล|อะเซตามิโนเฟน|ไอบูโพรเฟน|ไอบู|บรูเฟน|นูโรเฟน|แอดวิล|นาพรอกเซน|แอสไพริน|ยาแก้ปวด(?:ของ)?คน|ยาลดไข้(?:ของ)?คน|ยา(?:ของ)?คน(?!ละ)|ยาเจ้าของ|ยาของ(?:พ่อ|แม่|ยาย|ฉัน|ผม)|\b(?:paracetamol|acetaminophen|tylenol|panadol|ibuprofen|advil|nurofen|motrin|brufen|naproxen|aleve|aspirin)\b|${exports.HUMAN_TOPICAL_NAMES})`;
// ───────────────────────── Thai ─────────────────────────
// Words that contain ยา/ครีม/เจล/น้ำมัน but are not a medicine or a human product.
const TH_NOT_PRODUCT = /พยาธิ|พยาบาล|พยากรณ์|พยายาม|อยาก|ขยาย|ภรรยา|บรรยากาศ|ปฏิกิริยา|กิริยา|มารยาท|วิทยา|จรรยา|ยาว(?![ิีึืุู])|ยาง(?![ิีึืุู])|ยาม(?![ิีุูะ])|ยาย(?!่)|ยาก(?!ัน|ำจัด|ิน)|ไอศ?ครีม|ไอติม|วิปครีม|ครีมชีส|ครีมเทียม|ครีมสด|ซาวร์ครีม|บัตเตอร์ครีม|ครีมซุป|ซุปครีม|ชูครีม|ครีมพัฟ|ครีมพาย|ครีม(?:ใน|บน|จาก|ของ)?(?:กาแฟ|เค้ก|ขนม|ชา|โกโก้|นม)|เจลลี่|เจลาติน|ซิลิก้?าเจล|น้ำมัน(?:พืช|หมู|ทอด|มะกอก|มะพร้าว|รำข้าว|ปาล์ม|ถั่ว|งา|หอย|ไก่)/g;
/** Products people use that a pet should never swallow or lick (any exposure verb counts). */
const TH_HUMAN_PRODUCT = new RegExp(String.raw `(?:ครีม|เจล|โลชั่น|เซรั่ม|ยาหม่อง|ยานวด|ยาดม|ยาสระผม|ยาสีฟัน|น้ำยา|น้ำมัน(?!ปลา|ตับปลา)|ออยล์|สเปรย์|เครื่องสำอาง|ลิปสติก|ลิปมัน|ลิปบาล์ม|รองพื้น|มาสคาร่า|อายไลเนอร์|ยาทาเล็บ|สีทาเล็บ|น้ำหอม|โรลออน|ระงับกลิ่น|ยาย้อมผม|ยาดัดผม|ยาปลูกผม|ยาลดผมร่วง|ไมนอกซิดิล|แผ่นแปะ|บุหรี่|นิโคติน|กันแดด|ยากันยุง|ยาจุดกันยุง|โฟมล้างหน้า|แอลกอฮอล์|เจลล้างมือ|ยาเสพติด|ยาบ้า|ยาไอซ์|กัญชา|${exports.HUMAN_PAINKILLER_NAMES})`);
/** Medicines (could be the pet's own). */
const TH_MEDICINE = /ยา|แคปซูล/;
/** Supplements and grooming products (could be the pet's own). */
const TH_SUPPLEMENT = /วิตามิน|อาหารเสริม|น้ำมันปลา|น้ำมันตับปลา|คอลลาเจน|แชมพู|สบู่/;
/** "…สำหรับแมว", "ยาสีฟันหมา": made for pets, so it needs an accident sign like a medicine. */
const TH_PET_MADE = /^\S{0,10}?(?:สำหรับ|ของ|ใช้กับ)?(?:สัตว์|ลูกหมา|ลูกแมว|หมา|แมว|สุนัข|น้อง(?!สาว|ชาย))(?!\S{0,2}(?:เลีย|กิน|แทะ|กัด|คาบ|เคี้ยว|กลืน|ไป|เผลอ|แอบ|ขโมย))/;
const TH_VERB = /กิน|ทาน|เลีย|แทะ|กัด|เคี้ยว|กลืน|คาบ|ดื่ม|ซด|ขโมย|คุ้ย|ฉีก|ได้รับ|โดน|ป้อน/g;
/** A person's product: "ของแม่", "ยาพ่อ", "ยาที่ผมกิน", "ยาสำหรับคน", "ที่หมอสั่งให้แม่". */
const TH_PERSON = String.raw `(?:คน(?!ละ)|แม่(?!หมา|แมว|สุนัข|พันธุ์)|พ่อ(?!หมา|แมว|สุนัข|พันธุ์)|ยาย|ตา(?=\s|$|ไป|แล้ว|ที่|กิน)|ปู่|ย่า|พี่(?!หมา|แมว|สุนัข)|ลูก(?!หมา|แมว|สุนัข)|ผม|หนู|ฉัน|ดิฉัน|เรา|เจ้าของ|สามี|ภรรยา|แฟน|เพื่อน|คุณ(?!หมอ)|ป้า|ลุง|น้า|อา(?!หาร)|หลาน|ปะป๊า|หม่าม้า|ม๊า|ป๊า|น้องสาว|น้องชาย|พี่สาว|พี่ชาย|ผู้ใหญ่|เด็ก|แขก|ข้างบ้าน)`;
const TH_PERSON_OWNED = new RegExp(String.raw `ของ\s?${TH_PERSON}|(?:สำหรับ|ใช้กับ)\s?คน(?!ละ)|(?:สั่ง|จ่าย)ให้\s?${TH_PERSON}|ที่\s?${TH_PERSON}\s?(?:กิน|ทาน|ใช้|ทา)`);
/** Product word followed directly by a family member: "ยาแม่", "ยาความดันพ่อ". */
const TH_BARE_OWNER = /^\S{0,14}?(?:คน(?!ละ)|แม่(?!หมา|แมว|สุนัข|พันธุ์)|พ่อ(?!หมา|แมว|สุนัข|พันธุ์)|ยาย|ปู่|ย่า|เจ้าของ|สามี|ภรรยา|แฟน)/;
/** Another pet's product ("ยาของแมวอีกตัว", "ยาพี่หมา"). */
const TH_OTHER_PET = /(?:ของ|ยา)\s?(?:น้อง)?(?:หมา|แมว|สุนัข)?\s?(?:อีกตัว|ตัวอื่น|ตัวพี่|ตัวน้อง|ตัวโต|ตัวเล็ก)/;
/** A product of (or made for) one species: "ยาของแมว", "ยาหยอดเห็บหมัดสำหรับหมา". */
const TH_SPECIES_PRODUCT = /(?:ยา|ของ|สำหรับ)\s?(?:น้อง)?(หมา|สุนัข|แมว)/g;
const thSpecies = (w) => (w === 'แมว' ? 'cat' : 'dog');
/** The other species' medicine: the pet (profile or the other animal named) is not that species. */
function thaiOtherSpecies(q, species) {
    for (const m of q.matchAll(TH_SPECIES_PRODUCT)) {
        const owner = thSpecies(m[1]);
        if (species === 'cat' || species === 'dog') {
            if (species !== owner)
                return true;
            continue;
        }
        const rest = q.slice(0, m.index) + ' '.repeat(m[0].length) + q.slice((m.index || 0) + m[0].length);
        const subject = rest.match(/หมา|สุนัข|แมว/);
        if (subject && thSpecies(subject[0]) !== owner)
            return true;
    }
    return false;
}
/** Signs that the pet got something it should not have (or more than prescribed). */
const TH_ACCIDENT = /เผลอ|แอบ|ขโมย|ไม่ได้ตั้งใจ|โดยไม่ตั้งใจ|ตก(?:พื้น|อยู่|ลง)|หล่น|ทำหก|คุ้ย|ถังขยะ|แทะ|ฉีก|(?:กัด|เคี้ยว).{0,12}(?:แผง|ขวด|ซอง|กระปุก|หลอด|กล่อง|ถุง|ฝา)|ทั้ง(?:แผง|ขวด|หลอด|กระปุก|ซอง|กล่อง|ถุง|กระป๋อง)|หมด(?:แผง|ขวด|หลอด|กระปุก|ซอง|กล่อง)|หลาย(?:เม็ด|แคปซูล|ซอง|แผง)|เกิน|ผิดตัว|ผิดยา|ยาผิด/;
/** Licking, biting or carrying a medicine is not how a pet takes its own medicine. */
const TH_MEDICINE_ACCIDENT_VERB = /เลีย|กัด|คาบ/;
/** The pet's own prescribed medicine at the prescribed amount. */
const TH_VET_OWN = /(?:ตาม|ที่)\s?(?:คุณ)?(?:หมอ|สัตวแพทย์|แพทย์)\s?(?:สั่ง|ให้|จ่าย|บอก|แนะนำ)|ตามใบสั่ง|ตามฉลาก|ตามขนาด/;
/** It happened: perfective wording, a time just past, or a count. */
const TH_HAPPENED = /แล้ว|เข้าไป|ไป(?:หมด|ทั้ง|\s*\d|หลาย|ครึ่ง|นิด|บ้าง|เยอะ|กี่|เกือบ|ซะ|ละ|หนึ่ง|สอง|สาม|แผง|เม็ด|ขวด|หลอด|เคี้ยว|กิน)|ไป(?=\s|$|[!?.,]|ค่ะ|คะ|ครับ|จ้า|อะ|เลย)|เมื่อกี้|เมื่อกี๊|ตะกี้|เมื่อเช้า|เมื่อคืน|เมื่อวาน|เมื่อสักครู่|เพิ่ง|เผลอ|แอบ|ขโมย|หายไป|ไม่ได้ตั้งใจ|ทั้ง(?:แผง|ขวด|หลอด|กระปุก|ซอง|กล่อง)|\d+\s*(?:เม็ด|แคปซูล|ซอง)|ครึ่งเม็ด/;
/** Permission, plan, hypothetical, habit or prevention: not a report. */
const TH_NOT_REPORT = /ได้ไหม|ได้มั้ย|ได้ม้าย|ได้รึเปล่า|ได้หรือเปล่า|ได้หรือไม่|ได้ป่ะ|ได้ปะ|ได้ป่าว|ได้เปล่า|ได้บ้าง|กินได้|ให้ได้|ใช้ได้|ทาได้|ควร|จะให้|อยากให้|ลองให้|ถ้า|หาก|สมมติ|เผื่อ|ป้องกัน|ไม่ให้|กันไม่ให้|ห้าม|อย่าให้|วิธี|ชอบ|มัก|จะ(?:กิน|เลีย|แทะ|กัด)/;
/** Spat the pill out / would not take it. */
const TH_NOT_SWALLOWED = /คาย|บ้วน|ไม่ยอม(?:กลืน|กินยา|ทานยา)|ป้อน(?:ยา)?ไม่(?:ได้|เข้า)/;
function thaiProducts(masked) {
    const found = [];
    const scan = (re, group) => {
        const g = new RegExp(re.source, 'g');
        for (let m = g.exec(masked); m; m = g.exec(masked)) {
            if (!m[0]) {
                g.lastIndex += 1;
                continue;
            }
            const end = m.index + m[0].length;
            // "ยาสีฟัน" inside a matched human product is the same word, not a separate medicine.
            if (found.some((f) => m.index >= f.index && m.index < f.end))
                continue;
            // Made for pets ("ยาสีฟันหมา", "แชมพูแมว") → needs an accident sign like a supplement.
            const petMade = group === 'human' && TH_PET_MADE.test(masked.slice(end));
            found.push({ group: petMade ? 'supplement' : group, index: m.index, end });
        }
    };
    scan(TH_HUMAN_PRODUCT, 'human');
    scan(TH_MEDICINE, 'medicine');
    scan(TH_SUPPLEMENT, 'supplement');
    return found;
}
/** Thai report that a cat or dog swallowed, licked or chewed a non-food product. */
function isAccidentalIngestionTh(text, species) {
    const q = String(text || '').normalize('NFC').toLowerCase();
    if (!q)
        return false;
    const masked = q.replace(TH_NOT_PRODUCT, (w) => ' '.repeat(w.length));
    const products = thaiProducts(masked);
    if (!products.length)
        return false;
    const verbs = [];
    const verbRe = new RegExp(TH_VERB.source, 'g');
    for (let m = verbRe.exec(masked); m; m = verbRe.exec(masked))
        verbs.push(m.index);
    // The verb and the product must belong to the same clause.
    const near = products.filter((p) => verbs.some((v) => (v < p.index && p.index - v <= 32) || (v >= p.end && v - p.end <= 28)));
    if (!near.length)
        return false;
    // A report, not "ได้ไหม / ควร / ถ้า / ป้องกัน / ชอบ…" (unless it also says it already happened).
    if (!TH_HAPPENED.test(q) && TH_NOT_REPORT.test(q))
        return false;
    const personOwned = TH_PERSON_OWNED.test(q) || near.some((p) => TH_BARE_OWNER.test(q.slice(p.end)));
    const otherPet = TH_OTHER_PET.test(q) || thaiOtherSpecies(masked, species);
    const accident = TH_ACCIDENT.test(q.replace(/ไม่เกิน/g, ''));
    // Own prescribed medicine at the prescribed amount is not an accident.
    if (TH_VET_OWN.test(q) && !personOwned && !otherPet && !accident)
        return false;
    if (near.some((p) => p.group === 'human'))
        return true;
    if (personOwned || otherPet || accident)
        return true;
    // A pet licking, biting or carrying the medicine itself ("เลียยาหยอด", not "เลียขนหลังหยอดยา"),
    // and not spitting out a pill it was given.
    if (TH_NOT_SWALLOWED.test(q))
        return false;
    return near.some((p) => p.group === 'medicine' && new RegExp(String.raw `(?:${TH_MEDICINE_ACCIDENT_VERB.source})\S{0,10}$`).test(masked.slice(Math.max(0, p.index - 16), p.index)));
}
// ───────────────────────── English ─────────────────────────
const EN_NOT_PRODUCT = /\b(?:ice cream|whipped cream|sour cream|cream cheese|cream sauce|creamer|heavy cream|clotted cream|cream puffs?|buttercream|silica gel|gel food|jelly|gelatine?|(?:olive|coconut|vegetable|cooking|canola|sunflower|sesame|peanut|corn|palm|avocado) oil|cooking spray|bacon grease|appointments?|coffee cream|cream (?:off|from|in|on|of) (?:my |the |a |her |his )?(?:coffee|tea|cake|cupcake|pie|plate|bowl|cereal|dessert|donut|pastry|scone|latte))\b/g;
/** Products people use that a pet should never swallow or lick. */
const EN_HUMAN_PRODUCT = new RegExp(String.raw `\b(?:creams?|gels?|lotions?|ointments?|balms?|salves?|serums?|sunscreen|sunblock|sun cream|toothpaste|mouthwash|(?:hand )?sanitizer|deodorant|antiperspirant|perfume|cologne|make-?up|lipstick|lip balm|chapstick|mascara|nail polish(?: remover)?|hair (?:dye|spray|gel)|hairspray|essential oils?|(?:tea tree|eucalyptus|peppermint|lavender|clove|cinnamon|wintergreen|citrus|pine|massage|baby|hair|body) oils?|vapou?r ?rub|vicks|tiger balm|deep heat|voltaren|bengay|icy hot|minoxidil|rogaine|(?:nicotine|pain|fentanyl|hormone|estrogen|lidocaine|birth control|motion sickness) patch(?:es)?|nicotine|cigarettes?|cigars?|vapes?|vape (?:juice|liquid|pen)|e-?cig(?:arette)?s?|e-?liquid|bug spray|(?:insect|mosquito|bug) repellent|repellent|deet|sprays?|marijuana|cannabis|edibles?|thc|cocaine|adderall|xanax|ambien|zolpidem|zoloft|sertraline|alprazolam|oxycodone|percocet|vicodin|hydrocodone|codeine|metformin|birth control(?: pills?)?|contraceptives?|antidepressants?|sleeping (?:pills?|tablets?|meds|medication)|sleep aids?|cold (?:medicine|meds|tablets|pills)|cough (?:syrup|drops|medicine)|decongestants?|sudafed|pseudoephedrine|nyquil|dayquil|human (?:meds|medicines?|medications?|pills?|tablets?)|painkillers?|pain relievers?|paracetamol|acetaminophen|tylenol|panadol|ibuprofen|advil|nurofen|motrin|brufen|naproxen|aleve|aspirin)\b`);
const EN_MEDICINE = /\b(?:pills?|tablets?|capsules?|caplets?|meds|medications?|medicines?|drugs?|antibiotics?|steroids?|prednison(?:e|olone)|insulin|(?:eye|ear) ?drops|syrup|pill ?(?:organi[sz]er|box|bottle|case)|pillbox|medicine (?:cabinet|bag|box|bottle))\b/;
const EN_SUPPLEMENT = /\b(?:vitamins?|multivitamins?|supplements?|gumm(?:y|ies)(?: vitamins?)?|(?:fish|salmon|krill|cod liver) oil|omega(?:-?3)?s?|melatonin|probiotics?|glucosamine|collagen|shampoo|soap|conditioner|body wash)\b/;
/** "dog toothpaste", "his flea spray", "paw balm": made for or belonging to the pet. */
const EN_PET_MADE = /\b(?:dog|dogs'?|cat|cats'?|pet|pets'?|puppy|kitten|canine|feline|enzymatic|paw|nose)(?:-safe|-friendly)?\s+(?:(?!(?:ate|bit|got|had|took|stole|drank|into|some|the|a|an|my|his|her)\b)(?![a-z-]*(?:ed|ing)\b)[a-z-]+\s+)?$/;
const EN_VERB = /\b(?:ate|eaten|eating|licked|licking|chewed|chewing|bit(?! of)|bitten|biting|swallowed|swallowing|ingested|consumed|drank|drunk|drinking|lapped|gobbled|wolfed|scarfed|stole|snatched|took|taken|munched|nibbled|got (?:into|hold of|ahold of|at|some)|gotten into|getting into|had (?:some|a bit|a little|a lick|a taste|a few|a couple|one|two|half)|helped (?:him|her|it)self)\b/g;
const EN_PERSON_OWNED = /\b(?:my|our|mom'?s|mum'?s|mother'?s|dad'?s|father'?s|grandma'?s|grandpa'?s|granny'?s|nana'?s|wife'?s|husband'?s|partner'?s|son'?s|daughter'?s|kid'?s|kids'|child'?s|children'?s|baby'?s|roommate'?s|friend'?s|brother'?s|sister'?s|boyfriend'?s|girlfriend'?s|guest'?s|someone'?s|somebody'?s|the family'?s|human|people'?s|person'?s|adult)\s+(?:(?!(?:dog|dogs|cat|cats|puppy|kitten|pet|pets|kitty|pup)\b)[a-z'-]+\s+){0,3}?$/;
const EN_OTHER_PET = /\b(?:other|another|the other|our other) (?:dog|cat|pet|puppy|kitten)'?s?\b/;
/** "the cat's pills" eaten by the dog (or the pet profile is the other species). */
const EN_SPECIES_OWNED = /\b(cat|dog|kitten|puppy)(?:'s|s')\s/g;
const enSpecies = (w) => (w === 'cat' || w === 'kitten' ? 'cat' : 'dog');
function englishOtherSpecies(q, species) {
    for (const m of q.matchAll(EN_SPECIES_OWNED)) {
        const owner = enSpecies(m[1]);
        if (species === 'cat' || species === 'dog') {
            if (species !== owner)
                return true;
            continue;
        }
        const rest = q.slice(0, m.index) + ' '.repeat(m[0].length) + q.slice((m.index || 0) + m[0].length);
        const subject = rest.match(/\b(cat|dog|kitten|puppy)\b/);
        if (subject && enSpecies(subject[1]) !== owner)
            return true;
    }
    return false;
}
const EN_ACCIDENT = /\b(?:accidentally|by accident|by mistake|snuck|sneaked|stole|snatched|got into|gotten into|getting into|got (?:hold|ahold) of|chewed (?:up|open|through)|bit (?:open|into|through)|(?:off|from) the (?:counter|table|floor|nightstand|bed|shelf|trash|bin|garbage|purse|bag|cabinet|drawer|kitchen|bathroom)|on the floor|dropped|fell|overdose|too many|extra|double|several|multiple|a bunch|a handful|whole|entire|all (?:of )?(?:the|his|her|its|my)|the rest of|bottle|pack|packet|box|tube|jar|container|blister|strip|organi[sz]er|pillbox|wasn'?t (?:supposed|meant)|weren'?t (?:supposed|meant))\b/;
/** Licking or biting a medicine or cream is not how a pet takes its own medicine. */
const EN_MEDICINE_ACCIDENT_VERB = /\b(?:licked|licking|bit(?! of)|bitten|biting|chewed|chewing)\b/;
const EN_VET_OWN = /\bas (?:prescribed|directed)\b|\bprescribed (?:by|for) (?:the |our |his |her |its )?(?:vet|veterinarian)\b|\b(?:the|our|his|her) (?:vet|veterinarian) (?:prescribed|gave|recommended)\b|\b(?:his|her|its) (?:prescribed|prescription)\b|\bvet[- ]prescribed\b|\bfrom the vet\b/;
/** Past-tense ingestion wording: a report even inside a question ("should I worry, she licked…"). */
const EN_PAST = /\b(?:ate|eaten|licked|chewed|bit(?! of)|bitten|swallowed|ingested|consumed|drank|drunk|lapped|gobbled|wolfed|scarfed|stole|snatched|munched|nibbled|got into|gotten into|got (?:hold|ahold) of|had (?:some|a bit|a little|a lick|a taste|a few|a couple|one|two|half))\b/;
/** Permission, plan or prevention questions. */
const EN_NOT_REPORT = /\b(?:can|could|may|should|shall|would)\s+(?:i|we|you|my|our|the|a|he|she|it|they)\b|\bis it (?:ok|okay|safe|fine|bad)\b|\bwhat if\b|\bhow (?:do|can|to)\b.{0,20}\b(?:stop|prevent|keep)\b|\b(?:stop|prevent|keep|discourage|deter)\b.{0,30}\b(?:from|away)\b/;
const EN_NOT_SWALLOWED = /\bspat (?:it |them )?out\b|\bspit (?:it |them )?out\b|\bwon'?t (?:take|swallow)\b|\brefus(?:ed|es) (?:to (?:take|swallow)|the pill)\b/;
function englishProducts(masked) {
    const found = [];
    const scan = (re, group) => {
        const g = new RegExp(re.source, 'g');
        for (let m = g.exec(masked); m; m = g.exec(masked)) {
            if (found.some((f) => m.index >= f.index && m.index < f.end))
                continue;
            // "dog toothpaste", "paw balm": made for pets → needs an accident sign like a supplement.
            const petMade = group === 'human' && EN_PET_MADE.test(masked.slice(Math.max(0, m.index - 40), m.index));
            found.push({ group: petMade ? 'supplement' : group, index: m.index, end: m.index + m[0].length });
        }
    };
    scan(EN_HUMAN_PRODUCT, 'human');
    scan(EN_MEDICINE, 'medicine');
    scan(EN_SUPPLEMENT, 'supplement');
    return found;
}
/** English report that a cat or dog swallowed, licked or chewed a non-food product. */
function isAccidentalIngestionEn(text, species) {
    const q = String(text || '').normalize('NFC').toLowerCase();
    if (!q)
        return false;
    const masked = q.replace(EN_NOT_PRODUCT, (w) => ' '.repeat(w.length));
    const products = englishProducts(masked);
    if (!products.length)
        return false;
    const verbs = [];
    const verbRe = new RegExp(EN_VERB.source, 'g');
    for (let m = verbRe.exec(masked); m; m = verbRe.exec(masked))
        verbs.push(m.index);
    const near = products.filter((p) => verbs.some((v) => (v < p.index && p.index - v <= 60) || (v >= p.end && v - p.end <= 40)));
    if (!near.length)
        return false;
    if (!EN_PAST.test(q) && EN_NOT_REPORT.test(q))
        return false;
    const personOwned = near.some((p) => EN_PERSON_OWNED.test(masked.slice(Math.max(0, p.index - 60), p.index)));
    const otherPet = EN_OTHER_PET.test(q) || englishOtherSpecies(q, species);
    const accident = EN_ACCIDENT.test(q);
    // Own prescribed medicine at the prescribed amount is not an accident.
    if (EN_VET_OWN.test(q) && !personOwned && !otherPet && !accident)
        return false;
    if (near.some((p) => p.group === 'human'))
        return true;
    if (personOwned || otherPet || accident)
        return true;
    // Licking or biting the medicine itself (not spitting out a pill it was given).
    if (EN_NOT_SWALLOWED.test(q))
        return false;
    return near.some((p) => p.group === 'medicine' && new RegExp(String.raw `(?:${EN_MEDICINE_ACCIDENT_VERB.source})(?:\s+(?:up|on|at|into|through|off))?\s+(?:(?:some|a|an|the|his|her|its|of|bit|little|few)\s+){0,3}(?:[a-z-]+\s+){0,2}$`).test(masked.slice(Math.max(0, p.index - 60), p.index)));
}

},
"dateFormat":function(require,module,exports){
"use strict";
// ============================================================
// dateFormat.ts — รูปแบบวันที่/เวลาเดียวทั้งแอป (มติบอส 26 ต.ค. 2569)
// ============================================================
// วันที่: ไทย "26 ต.ค. 2569" (ปี พ.ศ.) · อังกฤษ "26 Oct 2026" · ที่แคบตัดปีได้ "26 ต.ค."
// เวลา: 24 ชม. ไทย "15:00 น." · อังกฤษ "15:00"
// ไม่ใช้ Intl/toLocaleDateString — Hermes บางเครื่องไม่มีปฏิทินไทย (ปีออกมาเป็น ค.ศ.)
// แผน: docs/Date-Time-Format-and-Pickers-Plan-2569-10-26.md
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.displayYear = exports.dateLang = exports.EN_DAYS_SHORT = exports.TH_DAYS_SHORT = exports.EN_MONTHS_FULL = exports.EN_MONTHS_SHORT = exports.TH_MONTHS_FULL = exports.TH_MONTHS_SHORT = void 0;
exports.toLocalDate = toLocalDate;
exports.formatDate = formatDate;
exports.formatMonthYear = formatMonthYear;
exports.normalizeHHmm = normalizeHHmm;
exports.formatTime = formatTime;
exports.formatDateTime = formatDateTime;
exports.TH_MONTHS_SHORT = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
exports.TH_MONTHS_FULL = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
exports.EN_MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
exports.EN_MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
exports.TH_DAYS_SHORT = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
exports.EN_DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const dateLang = (language) => (language === 'en' ? 'en' : 'th');
exports.dateLang = dateLang;
/** 'YYYY-MM-DD' → วันนั้นตามเวลาเครื่อง (ไม่ใช่ UTC) · timestamp/Date → ตามเดิม · ไม่ถูกต้อง → null */
function toLocalDate(input) {
    if (input == null || input === '')
        return null;
    if (input instanceof Date)
        return Number.isNaN(input.getTime()) ? null : input;
    if (typeof input === 'number') {
        const d = new Date(input);
        return Number.isNaN(d.getTime()) ? null : d;
    }
    const text = String(input).trim();
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
    if (m) {
        // OCR/AI text may carry a Buddhist-era year ("2567-05-10") — read it as 2024, never add 543 twice
        const y = Number(m[1]) > 2400 ? Number(m[1]) - 543 : Number(m[1]);
        const [mo, day] = [Number(m[2]), Number(m[3])];
        const d = new Date(y, mo - 1, day);
        return d.getFullYear() === y && d.getMonth() === mo - 1 && d.getDate() === day ? d : null;
    }
    // Only full ISO timestamps; "2024-05" or free text stays as written instead of inventing a day
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(text))
        return null;
    const d = new Date(text);
    return Number.isNaN(d.getTime()) ? null : d;
}
const displayYear = (year, lang) => (lang === 'en' ? year : year + 543);
exports.displayYear = displayYear;
/** "26 ต.ค. 2569" / "26 Oct 2026" · year:false → "26 ต.ค." · weekday → "จ 26 ต.ค. 2569" · ข้อมูลผิดรูปแบบคืนข้อความเดิม */
function formatDate(input, lang, opts = {}) {
    const d = toLocalDate(input);
    if (!d)
        return typeof input === 'string' ? input : '';
    const en = lang === 'en';
    let text = `${d.getDate()} ${(en ? exports.EN_MONTHS_SHORT : exports.TH_MONTHS_SHORT)[d.getMonth()]}`;
    if (opts.year !== false)
        text += ` ${(0, exports.displayYear)(d.getFullYear(), lang)}`;
    if (opts.weekday)
        text = `${(en ? exports.EN_DAYS_SHORT : exports.TH_DAYS_SHORT)[d.getDay()]} ${text}`;
    return text;
}
/** หัวปฏิทิน "ตุลาคม 2569" / "October 2026" (monthIndex 0–11) */
function formatMonthYear(year, monthIndex, lang) {
    return `${(lang === 'en' ? exports.EN_MONTHS_FULL : exports.TH_MONTHS_FULL)[monthIndex]} ${(0, exports.displayYear)(year, lang)}`;
}
/** "8:5"/"08:05"/"8:05" → "08:05" · ชั่วโมง 0–23 นาที 0–59 · ไม่ถูกต้อง → null */
function normalizeHHmm(value) {
    const m = /^(\d{1,2}):(\d{1,2})$/.exec(String(value ?? '').trim());
    if (!m)
        return null;
    const [h, min] = [Number(m[1]), Number(m[2])];
    if (h > 23 || min > 59)
        return null;
    return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}
/** "15:00 น." / "15:00" · รับ 'HH:mm' หรือ Date/timestamp */
function formatTime(input, lang) {
    let hhmm;
    if (typeof input === 'string' && !/^\d{4}-/.test(input))
        hhmm = normalizeHHmm(input);
    else {
        const d = toLocalDate(input);
        hhmm = d ? `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` : null;
    }
    if (!hhmm)
        return typeof input === 'string' ? input : '';
    return lang === 'en' ? hhmm : `${hhmm} น.`;
}
/** "26 ต.ค. 2569 · 15:00 น." · ส่งเวลาแยกมาได้ (เช่น นัดหมายเก็บวันกับเวลาแยกช่อง) */
function formatDateTime(input, lang, time, opts = {}) {
    const date = formatDate(input, lang, opts);
    const clock = time != null && time !== '' ? formatTime(time, lang) : (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input.trim()) ? '' : formatTime(input, lang));
    return clock ? `${date} · ${clock}` : date;
}

},
"clinicalReportContext":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasExplicitCurrentClinicalReport = hasExplicitCurrentClinicalReport;
/** A separate explicit live clinical clause overrides an earlier hypothetical
 * clause. Mentioning "now" inside the hypothetical itself is not a live report. */
function hasExplicitCurrentClinicalReport(question) {
    const q = question.normalize('NFC').toLowerCase();
    const clauses = q.split(/[.!?;\n]|แต่|\bbut\b|\bhowever\b/);
    return clauses.some(clause => {
        if (/สมมติ|ถ้าเกิด|หากเกิด|\bhypothetical(?:ly)?\b|\bif (?:my |a |the )?(?:cat|dog|rabbit|bird)\b/.test(clause) && !/เกิดขึ้นจริง|จริงตอนนี้|\b(?:actually|in fact)\b/.test(clause))
            return false;
        if (!/ตอนนี้|วันนี้|เมื่อกี้|เพิ่ง|กำลัง|\b(?:now|today|just|currently|actually|my (?:cat|dog|pet|rabbit|bird) (?:is|has|was|keeps))\b/.test(clause))
            return false;
        const positive = clause
            .replace(/(?:ไม่ได้|ไม่มี|ไม่เคย)(?:มีอาการ)?(?:หายใจลำบาก|หายใจไม่ออก|หายใจไม่ทัน|หายใจอ้าปาก)/g, '')
            .replace(/\b(?:is not|isn't|has no|without)\s+(?:having\s+)?(?:difficulty breathing|trouble breathing|open[- ]mouth breathing|breathing with (?:its |the )?mouth open)\b/g, '')
            .replace(/\b(?:did not|didn't|has not|hasn't|never)\s+(?:eat|ate|eaten|chew|chewed|lick|licked|ingest|ingested)\b/g, '');
        return /อาเจียน|อ้วก|หายใจ(?:ไม่ออก|ลำบาก|ไม่ทัน|อ้าปาก)|อ้าปาก.{0,24}หายใจ|ฉี่ไม่ออก|ปัสสาวะไม่ออก|ไม่กินอาหาร|ไม่อึ|ไม่ถ่าย|(?:กิน|กัด|เคี้ยว|แทะ|เลีย|ดื่ม|สัมผัส).{0,40}ลิล|\b(?:vomit\w*|cannot breathe|can't breathe|difficulty breathing|trouble breathing|breath\w*.{0,35}mouth open|open[- ]mouth breathing|cannot pee|can't pee|cannot urinate|not eating|no droppings|stopped (?:eating|passing droppings)|chew\w*.{0,30}lil(?:y|ies)|ate.{0,30}lil(?:y|ies))\b/.test(positive);
    });
}

},
"foodSafety.generated":function(require,module,exports){
"use strict";
// ⚠️ ไฟล์นี้ถูกสร้างอัตโนมัติ — ห้ามแก้ด้วยมือ
// สร้างจาก: sql/094_knowledge_base.sql (ตาราง food_safety_reference)
// สร้างด้วย: node scripts/gen-food-safety.mjs
// แหล่งข้อมูลต้นทาง: ASPCA + Merck Veterinary Manual (ดู sourceUrl รายแถว)
Object.defineProperty(exports, "__esModule", { value: true });
exports.FOOD_SAFETY = void 0;
/** 24 รายการ — ตรงกับ sql/094_knowledge_base.sql เป๊ะ */
exports.FOOD_SAFETY = [
    {
        nameEn: "Chocolate",
        nameTh: "ช็อกโกแลต/โกโก้",
        species: "both",
        status: "toxic",
        reasonTh: "มีเมทิลแซนทีน (ธีโอโบรมีน/คาเฟอีน) ทำให้อาเจียน ท้องเสีย กระหายน้ำ หัวใจเต้นผิดจังหวะ ชัก — ยิ่งช็อกโกแลตเข้ม/ดาร์ก ยิ่งอันตราย",
        emergencyNoteTh: "สงสัยว่ากิน ให้ติดต่อสัตวแพทย์ทันที พร้อมข้อมูลชนิดและปริมาณที่กิน",
        sourceUrl: "https://www.aspca.org/pet-care/aspca-poison-control/people-foods-avoid-feeding-your-pets",
        reviewedAt: "2026-08-27",
        keywords: ["ช็อกโกแลต", "โกโก้"],
    },
    {
        nameEn: "Xylitol",
        nameTh: "ไซลิทอล (สารให้ความหวานในหมากฝรั่ง/ลูกอม/ยาสีฟัน/ขนมอบ)",
        species: "dog",
        status: "toxic",
        reasonTh: "กระตุ้นอินซูลินในสุนัข ทำให้น้ำตาลในเลือดต่ำรุนแรง และอาจทำลายตับ — อาการ: อาเจียน ซึม เดินเซ ชัก (Merck: รายงานพิษเฉพาะในสุนัข)",
        emergencyNoteTh: "พาไปโรงพยาบาลสัตว์ทันที อาการอาจเกิดภายในไม่กี่นาทีถึงชั่วโมง",
        sourceUrl: "https://www.merckvetmanual.com/toxicology/food-hazards/xylitol-toxicosis-in-dogs",
        reviewedAt: "2026-08-27",
        keywords: ["ไซลิทอล"],
    },
    {
        nameEn: "Grapes and raisins",
        nameTh: "องุ่น/ลูกเกด",
        species: "both",
        status: "toxic",
        reasonTh: "ทำให้ไตวายเฉียบพลันได้ (สงสัยว่าเกิดจากกรดทาร์ทาริก) อาการเริ่ม: อาเจียน/ท้องเสียใน 6–12 ชม. ซึม เบื่ออาหาร กระหายน้ำ",
        emergencyNoteTh: "แม้ปริมาณน้อยก็เสี่ยง — ติดต่อสัตวแพทย์ทันที",
        sourceUrl: "https://www.merckvetmanual.com/special-pet-topics/poisoning/food-hazards",
        reviewedAt: "2026-08-27",
        keywords: ["องุ่น", "ลูกเกด"],
    },
    {
        nameEn: "Onion",
        nameTh: "หัวหอม (ทุกรูปแบบ ดิบ/สุก/ผง)",
        species: "both",
        status: "toxic",
        reasonTh: "พืชตระกูล Allium ทำลายเม็ดเลือดแดง ทำให้โลหิตจาง — แมวไวมาก (Merck: หอมสุกไม่ถึงช้อนชาก็มีรายงานพิษในแมว)",
        emergencyNoteTh: "สงสัยว่ากิน ติดต่อสัตวแพทย์ อาการโลหิตจางอาจแสดงช้าหลายวัน",
        sourceUrl: "https://www.merckvetmanual.com/toxicology/food-hazards/garlic-and-onion-allium-spp-toxicosis-in-animals",
        reviewedAt: "2026-08-27",
        keywords: ["หัวหอม"],
    },
    {
        nameEn: "Garlic",
        nameTh: "กระเทียม",
        species: "both",
        status: "toxic",
        reasonTh: "ตระกูล Allium เช่นเดียวกับหัวหอม ทำลายเม็ดเลือดแดง ก่อโลหิตจาง และระคายเคืองทางเดินอาหาร",
        emergencyNoteTh: "สงสัยว่ากินปริมาณมาก ติดต่อสัตวแพทย์",
        sourceUrl: "https://www.merckvetmanual.com/toxicology/food-hazards/garlic-and-onion-allium-spp-toxicosis-in-animals",
        reviewedAt: "2026-08-27",
        keywords: ["กระเทียม"],
    },
    {
        nameEn: "Chives and leeks",
        nameTh: "กุยช่าย/ต้นหอม/หอมแบ่ง",
        species: "both",
        status: "toxic",
        reasonTh: "ตระกูล Allium — ผลเช่นเดียวกับหัวหอมและกระเทียม",
        emergencyNoteTh: "สงสัยว่ากิน ติดต่อสัตวแพทย์",
        sourceUrl: "https://www.aspca.org/pet-care/aspca-poison-control/people-foods-avoid-feeding-your-pets",
        reviewedAt: "2026-08-27",
        keywords: ["กุยช่าย", "ต้นหอม", "หอมแบ่ง"],
    },
    {
        nameEn: "Alcohol",
        nameTh: "แอลกอฮอล์ทุกชนิด (รวมอาหาร/ขนมที่ผสม)",
        species: "both",
        status: "toxic",
        reasonTh: "กดระบบประสาทและการหายใจ อาเจียน เดินเซ สั่น ระดับเลือดเป็นกรด อาจถึงขั้นโคม่า",
        emergencyNoteTh: "ห้ามให้เด็ดขาด — สงสัยว่ากิน พาไปโรงพยาบาลสัตว์ทันที",
        sourceUrl: "https://www.aspca.org/pet-care/aspca-poison-control/people-foods-avoid-feeding-your-pets",
        reviewedAt: "2026-08-27",
        keywords: ["แอลกอฮอล์ทุกชนิด"],
    },
    {
        nameEn: "Macadamia nuts",
        nameTh: "ถั่วแมคคาเดเมีย",
        species: "dog",
        status: "toxic",
        reasonTh: "ในสุนัขทำให้อ่อนแรง เดินเซ ซึม อาเจียน สั่น ตัวร้อน — อาการมักเกิดใน 12 ชม.",
        emergencyNoteTh: "สงสัยว่ากิน ติดต่อสัตวแพทย์",
        sourceUrl: "https://www.aspca.org/pet-care/aspca-poison-control/people-foods-avoid-feeding-your-pets",
        reviewedAt: "2026-08-27",
        keywords: ["ถั่วแมคคาเดเมีย"],
    },
    {
        nameEn: "Coffee and caffeine",
        nameTh: "กาแฟ/ชา/เครื่องดื่มชูกำลัง (คาเฟอีน)",
        species: "both",
        status: "toxic",
        reasonTh: "เมทิลแซนทีนเช่นเดียวกับช็อกโกแลต — กระวนกระวาย หายใจเร็ว ใจสั่น กล้ามเนื้อสั่น",
        emergencyNoteTh: "สงสัยว่ากินปริมาณมาก (เช่น กากกาแฟ/เม็ดกาแฟ) ติดต่อสัตวแพทย์ทันที",
        sourceUrl: "https://www.aspca.org/pet-care/aspca-poison-control/people-foods-avoid-feeding-your-pets",
        reviewedAt: "2026-08-27",
        keywords: ["กาแฟ", "ชา", "เครื่องดื่มชูกำลัง"],
    },
    {
        nameEn: "Raw yeast dough",
        nameTh: "แป้งโดดิบ (มียีสต์)",
        species: "both",
        status: "toxic",
        reasonTh: "ยีสต์ทำให้แป้งพองในกระเพาะ เสี่ยงกระเพาะบิด และหมักเป็นแอลกอฮอล์ในท้อง",
        emergencyNoteTh: "สงสัยว่ากิน ติดต่อสัตวแพทย์ทันที",
        sourceUrl: "https://www.merckvetmanual.com/special-pet-topics/poisoning/food-hazards",
        reviewedAt: "2026-08-27",
        keywords: ["แป้งโดดิบ"],
    },
    {
        nameEn: "Avocado",
        nameTh: "อะโวคาโด",
        species: "both",
        status: "avoid",
        reasonTh: "มีสารเพอร์ซิน ในหมาแมวมักก่ออาเจียน/ท้องเสีย และเมล็ดเสี่ยงติดคอ/อุดตันลำไส้",
        emergencyNoteTh: null,
        sourceUrl: "https://www.aspca.org/pet-care/aspca-poison-control/people-foods-avoid-feeding-your-pets",
        reviewedAt: "2026-08-27",
        keywords: ["อะโวคาโด"],
    },
    {
        nameEn: "Salt and salty snacks",
        nameTh: "เกลือ/ขนมเค็มจัด (มันฝรั่งทอด เพรตเซล ป๊อปคอร์นปรุงรส)",
        species: "both",
        status: "avoid",
        reasonTh: "โซเดียมมากเกิน ทำให้กระหายน้ำ ปัสสาวะบ่อย รุนแรงถึงอาเจียน ท้องเสีย ซึม สั่น ชัก",
        emergencyNoteTh: null,
        sourceUrl: "https://www.aspca.org/pet-care/aspca-poison-control/people-foods-avoid-feeding-your-pets",
        reviewedAt: "2026-08-27",
        keywords: ["เกลือ", "ขนมเค็มจัด"],
    },
    {
        nameEn: "Raw or undercooked meat and eggs",
        nameTh: "เนื้อดิบ/ไข่ดิบ",
        species: "both",
        status: "avoid",
        reasonTh: "เสี่ยงเชื้อ Salmonella/E. coli และไข่ขาวดิบมีอะวิดินที่ขัดขวางการดูดซึมไบโอติน",
        emergencyNoteTh: null,
        sourceUrl: "https://www.aspca.org/pet-care/aspca-poison-control/people-foods-avoid-feeding-your-pets",
        reviewedAt: "2026-08-27",
        keywords: ["เนื้อดิบ", "ไข่ดิบ"],
    },
    {
        nameEn: "Bones",
        nameTh: "กระดูก (โดยเฉพาะกระดูกสุก/กระดูกไก่)",
        species: "both",
        status: "avoid",
        reasonTh: "เสี่ยงติดคอ แตกเป็นเสี้ยนทิ่มทางเดินอาหาร",
        emergencyNoteTh: null,
        sourceUrl: "https://www.aspca.org/pet-care/aspca-poison-control/people-foods-avoid-feeding-your-pets",
        reviewedAt: "2026-08-27",
        keywords: ["กระดูก"],
    },
    {
        nameEn: "Nuts (general)",
        nameTh: "ถั่วเปลือกแข็งอื่นๆ (อัลมอนด์ พีแคน วอลนัท)",
        species: "both",
        status: "avoid",
        reasonTh: "ไขมันสูง เสี่ยงอาเจียน ท้องเสีย และตับอ่อนอักเสบ",
        emergencyNoteTh: null,
        sourceUrl: "https://www.aspca.org/pet-care/aspca-poison-control/people-foods-avoid-feeding-your-pets",
        reviewedAt: "2026-08-27",
        keywords: ["ถั่วเปลือกแข็งอื่นๆ"],
    },
    {
        nameEn: "Milk and dairy",
        nameTh: "นมวัว/ผลิตภัณฑ์นม",
        species: "both",
        status: "limited",
        reasonTh: "หมาแมวโตส่วนใหญ่ย่อยแล็กโทสได้จำกัด — มักท้องเสีย/ปวดท้อง ควรเลี่ยงหรือให้น้อยมาก",
        emergencyNoteTh: null,
        sourceUrl: "https://www.aspca.org/pet-care/aspca-poison-control/people-foods-avoid-feeding-your-pets",
        reviewedAt: "2026-08-27",
        keywords: ["นมวัว", "ผลิตภัณฑ์นม"],
    },
    {
        nameEn: "Citrus",
        nameTh: "ผลไม้ตระกูลส้ม (เปลือก/เมล็ด/ใบ/ลำต้น)",
        species: "both",
        status: "limited",
        reasonTh: "กรดซิตริกและน้ำมันหอมระเหยระคายเคือง กินมากอาจกดประสาท — เนื้อผลปริมาณน้อยมักแค่ท้องไส้ปั่นป่วน",
        emergencyNoteTh: null,
        sourceUrl: "https://www.aspca.org/pet-care/aspca-poison-control/people-foods-avoid-feeding-your-pets",
        reviewedAt: "2026-08-27",
        keywords: ["ผลไม้ตระกูลส้ม"],
    },
    {
        nameEn: "Coconut and coconut oil",
        nameTh: "มะพร้าว/น้ำมันมะพร้าว/กะทิ",
        species: "both",
        status: "limited",
        reasonTh: "ปริมาณน้อยมักไม่อันตรายร้ายแรง แต่ไขมันสูงอาจทำท้องเสีย — น้ำมะพร้าวโพแทสเซียมสูง ไม่ควรให้",
        emergencyNoteTh: null,
        sourceUrl: "https://www.aspca.org/pet-care/aspca-poison-control/people-foods-avoid-feeding-your-pets",
        reviewedAt: "2026-08-27",
        keywords: ["มะพร้าว", "น้ำมันมะพร้าว", "กะทิ"],
    },
    {
        nameEn: "Cooked plain chicken",
        nameTh: "อกไก่ต้มสุก ไม่ปรุงรส",
        species: "both",
        status: "generally_safe",
        reasonTh: "ให้เป็นของว่างปริมาณน้อยได้ ต้องสุก ไม่ปรุงรส ไม่มีกระดูก — ไม่ใช่อาหารหลักแทนอาหารครบโภชนาการ",
        emergencyNoteTh: null,
        sourceUrl: "https://www.merckvetmanual.com/special-pet-topics/poisoning/food-hazards",
        reviewedAt: "2026-08-27",
        keywords: ["อกไก่ต้มสุก ไม่ปรุงรส"],
    },
    {
        nameEn: "Carrot",
        nameTh: "แครอทต้มสุก/ชิ้นเล็ก",
        species: "dog",
        status: "generally_safe",
        reasonTh: "ของว่างแคลอรีต่ำสำหรับสุนัข หั่นชิ้นเล็กกันติดคอ — ปริมาณพอประมาณ",
        emergencyNoteTh: null,
        sourceUrl: "https://www.aspca.org/pet-care/aspca-poison-control/people-foods-avoid-feeding-your-pets",
        reviewedAt: "2026-08-27",
        keywords: ["แครอทต้มสุก", "ชิ้นเล็ก"],
    },
    {
        nameEn: "Plain cooked rice",
        nameTh: "ข้าวสวยไม่ปรุงรส",
        species: "both",
        status: "generally_safe",
        reasonTh: "ให้ปริมาณน้อยร่วมกับอาหารหลักได้ — ไม่ทดแทนอาหารครบโภชนาการ",
        emergencyNoteTh: null,
        sourceUrl: "https://www.merckvetmanual.com/special-pet-topics/poisoning/food-hazards",
        reviewedAt: "2026-08-27",
        keywords: ["ข้าวสวยไม่ปรุงรส"],
    },
    {
        nameEn: "Watermelon (seedless, no rind)",
        nameTh: "แตงโม (เอาเมล็ด/เปลือกออก)",
        species: "both",
        status: "generally_safe",
        reasonTh: "ของว่างน้ำเยอะ ให้ชิ้นเล็กปริมาณพอประมาณ — เมล็ดและเปลือกเสี่ยงอุดตัน",
        emergencyNoteTh: null,
        sourceUrl: "https://www.aspca.org/pet-care/aspca-poison-control/people-foods-avoid-feeding-your-pets",
        reviewedAt: "2026-08-27",
        keywords: ["แตงโม"],
    },
    {
        nameEn: "Apple (no seeds/core)",
        nameTh: "แอปเปิล (เอาเมล็ด/แกนออก)",
        species: "both",
        status: "generally_safe",
        reasonTh: "เนื้อแอปเปิลชิ้นเล็กให้ได้ — เมล็ดมีสารกลุ่มไซยาไนด์และแกนเสี่ยงติดคอ",
        emergencyNoteTh: null,
        sourceUrl: "https://www.aspca.org/pet-care/aspca-poison-control/people-foods-avoid-feeding-your-pets",
        reviewedAt: "2026-08-27",
        keywords: ["แอปเปิล"],
    },
    {
        nameEn: "Raw fish (regular feeding)",
        nameTh: "ปลาดิบ (ให้ประจำ)",
        species: "cat",
        status: "avoid",
        reasonTh: "เสี่ยงแบคทีเรีย และเอนไซม์ไทอะมิเนสในปลาดิบทำลายวิตามินบี 1 หากกินประจำ",
        emergencyNoteTh: null,
        sourceUrl: "https://www.merckvetmanual.com/special-pet-topics/poisoning/food-hazards",
        reviewedAt: "2026-08-27",
        keywords: ["ปลาดิบ"],
    },
];

},
"activityDisplay":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.displayActivityUnit = displayActivityUnit;
/** Localize known activity units without changing saved quantities or user text. */
function displayActivityUnit(unit, language) {
    const raw = unit.trim();
    const english = {
        'ชม.': 'hrs', 'ชม': 'hrs', 'ชั่วโมง': 'hrs', 'นาที': 'min',
        'มื้อ': 'meals', 'ครั้ง': 'times', 'มล.': 'ml', 'กรัม': 'g',
        'กม.': 'km', 'เมตร': 'm',
    };
    const thai = {
        hrs: 'ชม.', hr: 'ชม.', hours: 'ชม.', hour: 'ชม.',
        min: 'นาที', minutes: 'นาที', meals: 'มื้อ', meal: 'มื้อ',
        times: 'ครั้ง', time: 'ครั้ง',
    };
    return (language === 'en' ? english : thai)[raw] || raw;
}

},
"appointmentReminder":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_REMINDER_DAYS = void 0;
exports.validReminderDays = validReminderDays;
exports.reminderDays = reminderDays;
exports.parseAppointmentDateTime = parseAppointmentDateTime;
exports.appointmentAdvanceTime = appointmentAdvanceTime;
exports.DEFAULT_REMINDER_DAYS = 1;
function validReminderDays(value) {
    return Number.isInteger(value) && value >= 0 && value <= 365;
}
function reminderDays(value) {
    return value != null && validReminderDays(value) ? value : exports.DEFAULT_REMINDER_DAYS;
}
/** Strict local calendar parsing; reject rollover dates and invalid times. */
function parseAppointmentDateTime(date, time) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time))
        return null;
    const [y, m, d] = date.split('-').map(Number);
    const [h, min] = time.split(':').map(Number);
    const result = new Date(y, m - 1, d, h, min, 0);
    return result.getFullYear() === y && result.getMonth() === m - 1 && result.getDate() === d && result.getHours() === h && result.getMinutes() === min ? result : null;
}
function appointmentAdvanceTime(at, days) {
    const result = new Date(at);
    result.setDate(result.getDate() - reminderDays(days));
    return result;
}

},
"petAge":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.petAgeParts = petAgeParts;
exports.petAgeFromBirthday = petAgeFromBirthday;
/** Calendar age from a date-only birthday. Never change the saved profile. */
function petAgeParts(birthday, now = new Date()) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(birthday || ''));
    if (!match || !Number.isFinite(now.getTime()))
        return null;
    const year = Number(match[1]), month = Number(match[2]) - 1, day = Number(match[3]);
    const birth = new Date(Date.UTC(year, month, day));
    if (year < 100 || birth.getUTCFullYear() !== year || birth.getUTCMonth() !== month || birth.getUTCDate() !== day)
        return null;
    const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    if (birth.getTime() > today)
        return null;
    let elapsed = (now.getFullYear() - year) * 12 + now.getMonth() - month;
    // Clamp a monthly anniversary to its month's last day (Jan 31 → Feb 28).
    const anniversary = (months) => {
        const first = new Date(Date.UTC(year, month + months, 1));
        const last = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
        return Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), Math.min(day, last));
    };
    if (anniversary(elapsed) > today)
        elapsed--;
    return { years: Math.floor(elapsed / 12), months: elapsed % 12, days: Math.round((today - anniversary(elapsed)) / 86400000) };
}
function petAgeFromBirthday(birthday, language, now = new Date()) {
    const age = petAgeParts(birthday, now);
    if (!age)
        return null;
    const parts = [];
    for (const [value, th, en] of [[age.years, 'ปี', 'year'], [age.months, 'เดือน', 'month'], [age.days, 'วัน', 'day']]) {
        if (value > 0)
            parts.push(language === 'en' ? `${value} ${en}${value === 1 ? '' : 's'}` : `${value} ${th}`);
    }
    return parts.join(' ') || (language === 'en' ? 'Newborn' : 'แรกเกิด');
}

}};const C={};const r=(id)=>{const n=id.replace(/^\.\//,'').replace(/\.js$/,'');if(!S[n])throw new Error('missing '+id);if(C[n])return C[n].exports;const m=C[n]={exports:{}};S[n](r,m,m.exports);return m.exports;};window.PawHelp=r("paw-help-web");})();
