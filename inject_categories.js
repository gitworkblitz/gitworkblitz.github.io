const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'frontend', 'src', 'utils', 'dummyData.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const catMap = {
  j1:'Technology', j2:'Technology', j3:'Design', j4:'Marketing',
  j5:'Technology', j6:'Technology', j7:'Technology', j8:'Data & Analytics',
  j9:'Writing & Content', j10:'Technology', j11:'Data & Analytics', j12:'Technology',
  j13:'Technology', j14:'Cybersecurity', j15:'Management', j16:'Design',
  j17:'Sales', j18:'Human Resources', j19:'Finance', j20:'Technology',
  j21:'Operations', j22:'Technology', j23:'Marketing', j24:'Technology',
  j25:'Sales', j26:'Technology', j27:'Data & Analytics', j28:'Technology',
  j29:'Sales', j30:'Design', j31:'Technology', j32:'Writing & Content',
  j33:'Marketing', j34:'Marketing', j35:'Technology', j36:'Finance',
  j37:'Design', j38:'Design', j39:'Human Resources', j40:'Operations',
  j41:'Technology', j42:'Marketing', j43:'Data & Analytics', j44:'Technology',
  j45:'Legal', j46:'Technology', j47:'Technology', j48:'Management',
  j49:'Marketing', j50:'Data & Analytics', j51:'Marketing', j52:'Technology',
  j53:'Data & Analytics', j54:'Technology', j55:'Technology', j56:'Technology',
  j57:'Writing & Content', j58:'Technology', j59:'Technology', j60:'Management',
  j61:'Cybersecurity', j62:'Technology', j63:'Operations', j64:'Technology',
  j65:'Education', j66:'Marketing', j67:'Cybersecurity', j68:'Operations',
  j69:'Finance', j70:'Technology', j71:'Technology', j72:'Engineering',
  j73:'Marketing', j74:'Healthcare', j75:'Design', j76:'Data & Analytics',
  j77:'Operations', j78:'Operations', j79:'Customer Support', j80:'Technology',
  j81:'Technology', j82:'Human Resources', j83:'Data & Analytics', j84:'Technology',
  j85:'Cybersecurity', j86:'Marketing', j87:'Technology', j88:'Finance',
  j89:'Technology', j90:'Technology', j91:'Sales', j92:'Technology',
  j93:'Finance', j94:'Technology', j95:'Management', j96:'Healthcare',
  j97:'Education', j98:'Technology', j99:'Operations', j100:'Technology',
};

// Only inject category if not already present
let changed = 0;
for (const [id, cat] of Object.entries(catMap)) {
  const alreadyHas = new RegExp(`{ id: '${id}', category:`).test(content);
  if (alreadyHas) continue;
  content = content.replace(
    new RegExp(`\\{ id: '${id}',`, 'g'),
    `{ id: '${id}', category: '${cat}',`
  );
  changed++;
}

fs.writeFileSync(filePath, content, 'utf8');
console.log(`Done — categories injected for ${changed} jobs.`);
