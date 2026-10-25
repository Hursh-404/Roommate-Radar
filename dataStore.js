/**
 * dataStore.js - In-Memory & JSON Data Layer
 * Practical No. 04 (Server-Side Development: NodeJS - CO3)
 */

const INITIAL_ROOMMATES = [
  {
    id: 1,
    name: 'Tanvi G.',
    role: 'B.Tech IT, 2nd yr',
    area: 'Pimpri',
    budget: 7500,
    email: 'tanvi.g@mitaoe.ac.in',
    sleepSchedule: 'Early Bird (10:30 PM)',
    cleanliness: 'High',
    bio: 'Second year IT student. Usually studying till 10 PM. I keep my side of the room tidy and split supplies.',
    tags: ['Early Riser', 'Quiet Study', 'Non-Smoker'],
    axes: { sleep: 70, clean: 65, noise: 45, guests: 40, social: 35 },
    createdAt: '2026-10-06T10:00:00.000Z'
  },
  {
    id: 2,
    name: 'Vikram M.',
    role: 'B.Tech Mech, final yr',
    area: 'Wakad',
    budget: 8000,
    email: 'vikram.m@mitaoe.ac.in',
    sleepSchedule: 'Night Owl (2:30 AM)',
    cleanliness: 'Moderate',
    bio: 'Final year mechanical student. Up coding or doing thesis late night. Headphones mandatory, solid flatmate.',
    tags: ['Night Coder', 'Non-Smoker', 'Chill'],
    axes: { sleep: 0, clean: 65, noise: 55, guests: 45, social: 50 },
    createdAt: '2026-10-06T10:15:00.000Z'
  },
  {
    id: 3,
    name: 'Priya J.',
    role: 'BBA, 2nd yr',
    area: 'Baner',
    budget: 10500,
    email: 'priya.j@mitaoe.ac.in',
    sleepSchedule: 'Early Bird (10:00 PM)',
    cleanliness: 'Spotless',
    bio: 'Strict about cleanliness and quiet. My CGPA depends on a distraction-free home. Focused student.',
    tags: ['Early Bird', 'Spotless', 'Quiet Zone'],
    axes: { sleep: 90, clean: 95, noise: 20, guests: 20, social: 40 },
    createdAt: '2026-10-06T10:30:00.000Z'
  },
  {
    id: 4,
    name: 'Imran S.',
    role: 'B.Tech E&TC, final yr',
    area: 'Hinjewadi',
    budget: 8500,
    email: 'imran.s@mitaoe.ac.in',
    sleepSchedule: 'Night Owl (1:30 AM)',
    cleanliness: 'Relaxed',
    bio: 'Placement year student. Friends drop by for study sessions, food cooked at midnight, friendly vibe.',
    tags: ['Social', 'Night Owl', 'Non-Smoker'],
    axes: { sleep: 15, clean: 35, noise: 85, guests: 75, social: 70 },
    createdAt: '2026-10-06T11:00:00.000Z'
  },
  {
    id: 5,
    name: 'Sneha D.',
    role: 'MBA, 1st yr',
    area: 'Aundh',
    budget: 11000,
    email: 'sneha.d@mitaoe.ac.in',
    sleepSchedule: 'Early Bird (10:30 PM)',
    cleanliness: 'High',
    bio: 'MBA student with case presentations. Morning runner, clean kitchen enthusiast, open communication.',
    tags: ['Early Bird', 'Tidy', 'Gym'],
    axes: { sleep: 80, clean: 85, noise: 30, guests: 35, social: 55 },
    createdAt: '2026-10-06T11:30:00.000Z'
  },
  {
    id: 6,
    name: 'Arjun S.',
    role: 'B.Tech CSE, 3rd yr',
    area: 'Viman Nagar',
    budget: 9500,
    email: 'arjun.s@mitaoe.ac.in',
    sleepSchedule: 'Flexible (Midnight)',
    cleanliness: 'High',
    bio: 'Open source developer. Balanced lifestyle, quiet after midnight, respectful of personal space.',
    tags: ['Coder', 'Organized', 'Weekend Chill'],
    axes: { sleep: 40, clean: 75, noise: 55, guests: 70, social: 80 },
    createdAt: '2026-10-06T12:00:00.000Z'
  }
];

class DataStore {
  constructor() {
    this.roommates = JSON.parse(JSON.stringify(INITIAL_ROOMMATES));
    this.validationLogs = [];
  }

  getAll(filter = {}) {
    let result = [...this.roommates];
    if (filter.query) {
      const q = filter.query.toLowerCase();
      result = result.filter(
        r =>
          r.name.toLowerCase().includes(q) ||
          r.role.toLowerCase().includes(q) ||
          r.bio.toLowerCase().includes(q)
      );
    }
    if (filter.area && filter.area !== 'all') {
      result = result.filter(r => r.area === filter.area);
    }
    return result;
  }

  getById(id) {
    return this.roommates.find(r => r.id === Number(id));
  }

  add(data) {
    const newRecord = {
      id: Date.now(),
      name: data.name,
      email: data.email,
      role: data.role,
      area: data.area,
      budget: data.budget,
      sleepSchedule: data.sleepSchedule,
      cleanliness: data.cleanliness,
      bio: data.bio,
      axes: data.axes,
      tags: ['Verified Student', `${data.cleanliness} Clean`, 'Non-Smoker'],
      createdAt: new Date().toISOString()
    };
    this.roommates.unshift(newRecord);
    return newRecord;
  }

  logValidation(entry) {
    this.validationLogs.unshift({
      timestamp: new Date().toISOString(),
      ...entry
    });
    if (this.validationLogs.length > 50) {
      this.validationLogs.pop();
    }
  }

  getLogs() {
    return this.validationLogs;
  }

  reset() {
    this.roommates = JSON.parse(JSON.stringify(INITIAL_ROOMMATES));
    this.validationLogs = [];
    return this.roommates.length;
  }
}

module.exports = new DataStore();
