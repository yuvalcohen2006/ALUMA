import { JSDOM } from 'jsdom';
import createDOMPurify from 'dompurify';
const w = new JSDOM('').window;
const DOMPurify = createDOMPurify(w);

const cases = {
  emailAngle: `שלושה חומרים, שלוש התנהגויות שונות בשמש.

טיק מזדקן לאפור כסוף. אלומיניום נשאר יציב לאורך שנים.

לשאלות אפשר לכתוב ל <info@alumaoutdoor.com> ונחזור אליכם.`,
  plainNoAngle: `פסקה ראשונה.

פסקה שנייה.`,
  lessThanSpace: `הרוחב קטן מ < 5 ס"מ.

פסקה שנייה.`,
};

for (const [name, content] of Object.entries(cases)) {
  const isHtml = /<\/?[a-z][\s\S]*>/i.test(content);
  const html = isHtml ? content : content.split(/\n{2,}/).map(p => `<p>${p.replace(/\n/g,'<br/>')}</p>`).join('');
  const out = DOMPurify.sanitize(html);
  console.log('==', name, '| regexMatched:', isHtml);
  console.log(JSON.stringify(out));
  console.log('');
}
