const fs = require('fs');
const path = require('path');

const dummyDataPath = path.join(__dirname, 'frontend', 'src', 'utils', 'dummyData.jsx');
let content = fs.readFileSync(dummyDataPath, 'utf8');

// Rich diverse datasets
const jobTitles = [
  'Senior Frontend Developer', 'Backend Software Engineer', 'Product Designer', 'Full Stack Developer',
  'DevOps Engineer', 'React Native Mobile Developer', 'Data Scientist', 'Machine Learning Engineer',
  'Marketing Manager', 'Content Strategist', 'SEO Specialist', 'HR Business Partner', 'Financial Analyst',
  'Customer Support Lead', 'Sales Executive', 'Business Analyst', 'Systems Administrator', 'Network Engineer',
  'Cloud Architect', 'Cybersecurity Analyst', 'Quality Assurance Tester', 'Project Manager', 'Scrum Master',
  'Operations Manager', 'Graphic Designer', 'UI/UX Lead', 'Blockchain Developer', 'Python Developer',
  'Java Spring Boot Engineer', 'Golang Backend Developer', 'Database Administrator', 'IT Support Specialist',
  'Account Manager', 'Public Relations Executive', 'Legal Counsel', 'Data Analyst', 'Technical Writer'
];

const companies = [
  'Google India', 'Microsoft', 'Amazon', 'Flipkart', 'Paytm', 'Zomato', 'Swiggy', 'Infosys', 'TCS',
  'Wipro', 'HCL Technologies', 'Accenture', 'Cognizant', 'IBM', 'Tech Mahindra', 'Capgemini', 'Deloitte',
  'PwC', 'KPMG', 'EY', 'Goldman Sachs', 'Morgan Stanley', 'JPMorgan Chase', 'Citibank', 'Barclays',
  'Standard Chartered', 'HSBC', 'Deutsche Bank', 'Credit Suisse', 'UBS', 'BNP Paribas', 'Societe Generale',
  'Crédit Agricole', 'Wells Fargo', 'Bank of America'
];

const locations = [
  'Bangalore, Karnataka', 'Mumbai, Maharashtra', 'Pune, Maharashtra', 'Hyderabad, Telangana',
  'Chennai, Tamil Nadu', 'Gurugram, Haryana', 'Noida, Uttar Pradesh', 'Delhi, Delhi',
  'Remote (Anywhere)', 'Remote (India only)'
];

const jobDescriptions = [
  "We are seeking a highly motivated professional to join our fast-paced product team. You will be responsible for leading development cycles, collaborating with cross-functional teams, and implementing scalable solutions that impact millions of users.",
  "Join our award-winning tech team! This role involves diving deep into cutting-edge technologies, resolving complex architectural problems, and mentoring junior engineers. Strong problem-solving skills and a passion for engineering excellence are a must.",
  "Looking for a creative and analytical mind to drive our upcoming flagship projects. You will work closely with stakeholders to gather requirements, design robust workflows, and ensure on-time delivery of high-quality software features.",
  "An exciting opportunity to be part of a rapidly growing startup. You'll have end-to-end ownership of critical modules, enjoy massive growth potential, and help shape the engineering culture from the ground up.",
  "Are you passionate about building accessible and fast user experiences? We want you on our team! Focus on performance tuning, building reusable components, and contributing to our open-source repositories."
];

const skillsMatrix = [
  ['React.js', 'TypeScript', 'Tailwind CSS'],
  ['Python', 'Django', 'PostgreSQL'],
  ['Node.js', 'Express', 'MongoDB'],
  ['Java', 'Spring Boot', 'Microservices'],
  ['AWS', 'Docker', 'Kubernetes'],
  ['Figma', 'Adobe XD', 'Prototyping'],
  ['SEO', 'Google Analytics', 'Content Writing'],
  ['Agile', 'Jira', 'Scrum'],
];

const requiredCategories = [
  'Web Development', 'App Development', 'AI/ML', 'Python',
  'Digital Marketing', 'UI/UX Design', 'Data Science'
];

const gigCategories = [...requiredCategories, 'Video Editing', 'Content Writing'];

const gigTitles = [
  "Build a fully responsive WordPress website", "Design a modern minimalist logo", "Write 5 SEO optimized blog posts",
  "Edit your YouTube videos with motion graphics", "Develop a cross-platform React Native app", "Create engaging social media posts for 30 days",
  "Professional voice over for your commercial", "Convert Figma designs to pixel-perfect HTML/CSS", "Setup and manage your Google Ads campaign",
  "Translate your 5000-word document from English to Spanish", "Design a custom character illustration", "Provide virtual assistant services for 20 hours",
  "Perform keyword research and SEO audit", "Edit and mix your podcast episodes", "Write compelling copy for your landing page",
  "Create a 60-second 2D explainer animation", "Scrape data from any website into Excel"
];

const gigDescriptions = [
  "I will deliver high-quality work tailored precisely to your requirements. With over 5 years of industry experience and a proven track record, I ensure timely delivery and 100% satisfaction. Unlimited revisions included until you are completely happy.",
  "Need this done fast? I specialize in quick turnarounds without compromising on quality. I will communicate with you throughout the process to make sure the final result perfectly represents your vision.",
  "Professional, clean, and modern results guaranteed. I use the latest tools and follow industry best practices. Let's collaborate to take your project to the next level!",
  "Are you looking for outstanding quality on a budget? Look no further. I offer premium services that will make your brand stand out from the competition. Check out my portfolio and let's get started today.",
  "I bring creativity and technical expertise to every project. Whether it's a small task or a massive undertaking, my attention to detail guarantees exceptional outcomes. Contact me to discuss your specific needs."
];

const clientNames = ['Rahul T.', 'Sneha P.', 'Aman G.', 'Vikram M.', 'Pooja R.', 'Neha K.', 'Arjun S.', 'Karan V.', 'Riya D.'];

let newJobs = [];
for(let i=0; i<105; i++) {
  const isRemote = Math.random() > 0.6;
  const location = isRemote ? 'Remote' : locations[Math.floor(Math.random() * locations.length)];
  const title = jobTitles[Math.floor(Math.random() * jobTitles.length)];
  const company = companies[Math.floor(Math.random() * companies.length)];
  const minSalary = Math.floor(Math.random() * 20 + 3) * 100000;
  
  newJobs.push({
    id: `j20${i}`,
    title: title,
    company: company,
    location: location,
    category: requiredCategories[Math.floor(Math.random() * requiredCategories.length)],
    type: Math.random() > 0.8 ? 'contract' : 'full_time',
    employment_type: Math.random() > 0.8 ? 'contract' : 'full_time',
    salary_min: minSalary,
    salary_max: minSalary + Math.floor(Math.random() * 10 + 2) * 100000,
    description: jobDescriptions[Math.floor(Math.random() * jobDescriptions.length)],
    skills_required: skillsMatrix[Math.floor(Math.random() * skillsMatrix.length)],
    experience_required: ['Fresher', '1-3 years', '3-5 years', '5+ years'][Math.floor(Math.random() * 4)],
    responsibilities: ['Collaborate with teams', 'Deliver high-quality work', 'Maintain documentation'],
    perks: ['Health Insurance', 'Flexible hours', 'Work from home options'],
    about_company: `${company} is a leading organization known for innovation, employee satisfaction, and delivering world-class products.`,
    is_active: true,
    employer_id: `e1`,
    posted_by: 'HR Team',
    createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
    updatedAt: new Date().toISOString()
  });
}

let newGigs = [];
for(let i=0; i<105; i++) {
  const cat = requiredCategories[Math.floor(Math.random() * requiredCategories.length)];
  const title = gigTitles[Math.floor(Math.random() * gigTitles.length)];
  const duration = ['3 days', '5 days', '1 week', '2 weeks', '1 month'][Math.floor(Math.random()*5)];
  
  newGigs.push({
    id: `g20${i}`,
    title: title,
    description: gigDescriptions[Math.floor(Math.random() * gigDescriptions.length)],
    budget: Math.floor(Math.random() * 500 + 10) * 100,
    price: Math.floor(Math.random() * 500 + 10) * 100,
    category: cat,
    services: [cat],
    status: 'open',
    client_details: { 
      name: clientNames[Math.floor(Math.random() * clientNames.length)], 
      rating: Number((Math.random() * 1 + 4).toFixed(1)), 
      jobs_posted: Math.floor(Math.random() * 50 + 1), 
      member_since: ['2020', '2021', '2022', '2023'][Math.floor(Math.random()*4)] 
    },
    duration: duration,
    deadline: new Date(Date.now() + Math.random() * 10000000000).toISOString(),
    employer_id: `e1`,
    location: 'Remote',
    createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
    updatedAt: new Date().toISOString()
  });
}

const injectData = (arrName, newItems) => {
  const startKeyword = `export const ${arrName} = [`;
  const startIdx = content.indexOf(startKeyword);
  if (startIdx === -1) return;
  
  let nextIdx = content.indexOf('export const ', startIdx + 1);
  if (nextIdx === -1) nextIdx = content.length;
  
  const block = content.slice(startIdx, nextIdx);
  const endIdxOffset = block.lastIndexOf('];');
  if (endIdxOffset === -1) return;
  
  const endIdx = startIdx + endIdxOffset;
  
  let itemsStr = newItems.map(item => {
    let str = "  {\n";
    for(let key in item) {
      let val = item[key];
      if(typeof val === 'string') {
        str += `    ${key}: '${val.replace(/'/g, "\\'")}',\n`;
      } else if (Array.isArray(val)) {
        let arrStr = val.map(v => typeof v === 'string' ? `'${v.replace(/'/g, "\\'")}'` : v).join(', ');
        str += `    ${key}: [${arrStr}],\n`;
      } else if (typeof val === 'object' && val !== null) {
        let objStr = "{ " + Object.keys(val).map(k => `${k}: '${val[k]}'`).join(", ") + " }";
        str += `    ${key}: ${objStr},\n`;
      } else {
        str += `    ${key}: ${val},\n`;
      }
    }
    str += "  }";
    return str;
  }).join(",\n");
  
  // To avoid duplicate appends when running multiple times, let's just clear the original array items if we wanted to replace.
  // Actually, we will just completely replace the interior of the array to inject a fresh 100 items instead of appending to identical clones.
  content = content.slice(0, startIdx + startKeyword.length) + "\n" + itemsStr + "\n" + content.slice(endIdx);
}

injectData('dummyJobs', newJobs);
injectData('dummyGigs', newGigs);

fs.writeFileSync(dummyDataPath, content, 'utf8');
console.log('Successfully replaced jobs and gigs with 100+ highly realistic dummy entries!');
