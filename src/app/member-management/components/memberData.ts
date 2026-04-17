export type MemberStatus = 'active' | 'inactive' | 'new' | 'transferred';
export type TitheStatus = 'tithe-faithful' | 'tithe-irregular' | 'tithe-none';

export interface Member {
  id: string;
  memberId: string;
  name: string;
  photo: string;
  photoAlt: string;
  phone: string;
  email: string;
  gender: 'Male' | 'Female';
  dob: string;
  age: number;
  status: MemberStatus;
  titheStatus: TitheStatus;
  cellGroup: string;
  /** Primary ministry name (first in the list) — kept for display/filter compatibility */
  ministry: string;
  /** All ministry names this member belongs to */
  ministries: string[];
  joinDate: string;
  lastAttendance: string;
  attendanceRate: number;
  totalGiving: number;
  address: string;
  maritalStatus: 'Single' | 'Married' | 'Widowed' | 'Divorced';
  occupation: string;
  emergencyContact: string;
  baptised: boolean;
  attendanceHistory: { week: string; present: boolean }[];
  recentGiving: { date: string; type: string; amount: number }[];
}

export const members: Member[] = [
  {
    id: 'member-001', memberId: 'GWC-0001', name: 'Kwabena Osei-Mensah', photo: 'https://i.pravatar.cc/48?img=3',
    photoAlt: 'Kwabena Osei-Mensah, male church member profile photo', phone: '+233 24 456 7890',
    email: 'kwabena.osei@gmail.com', gender: 'Male', dob: '15/03/1987', age: 39, status: 'active',
    titheStatus: 'tithe-faithful', cellGroup: 'Bethel Cell — Dansoman', ministry: 'Worship Team',
    ministries: ['Worship Team'],
    joinDate: '12/01/2018', lastAttendance: '13 Apr 2026', attendanceRate: 92, totalGiving: 18450,
    address: 'Dansoman, Accra', maritalStatus: 'Married', occupation: 'Accountant',
    emergencyContact: '+233 24 111 2233', baptised: true,
    attendanceHistory: [
      { week: '16 Mar', present: true }, { week: '23 Mar', present: true }, { week: '30 Mar', present: false },
      { week: '06 Apr', present: true }, { week: '13 Apr', present: true },
    ],
    recentGiving: [
      { date: '13 Apr', type: 'Tithe', amount: 850 }, { date: '06 Apr', type: 'Offering', amount: 200 },
      { date: '30 Mar', type: 'Tithe', amount: 850 },
    ],
  },
  {
    id: 'member-002', memberId: 'GWC-0042', name: 'Adwoa Amponsah', photo: 'https://i.pravatar.cc/48?img=5',
    photoAlt: 'Adwoa Amponsah, female church member profile photo', phone: '+233 20 234 5678',
    email: 'adwoa.amponsah@yahoo.com', gender: 'Female', dob: '22/07/1993', age: 32, status: 'active',
    titheStatus: 'tithe-faithful', cellGroup: 'Grace Cell — Tema', ministry: 'Ushering',
    ministries: ['Ushering'],
    joinDate: '05/06/2019', lastAttendance: '13 Apr 2026', attendanceRate: 88, totalGiving: 9200,
    address: 'Community 9, Tema', maritalStatus: 'Single', occupation: 'Nurse',
    emergencyContact: '+233 20 999 8877', baptised: true,
    attendanceHistory: [
      { week: '16 Mar', present: true }, { week: '23 Mar', present: true }, { week: '30 Mar', present: true },
      { week: '06 Apr', present: false }, { week: '13 Apr', present: true },
    ],
    recentGiving: [
      { date: '13 Apr', type: 'Offering', amount: 200 }, { date: '06 Apr', type: 'Tithe', amount: 600 },
      { date: '30 Mar', type: 'Tithe', amount: 600 },
    ],
  },
  {
    id: 'member-003', memberId: 'GWC-0093', name: 'Fiifi Mensah-Bonsu', photo: 'https://i.pravatar.cc/48?img=7',
    photoAlt: 'Fiifi Mensah-Bonsu, male church member profile photo', phone: '+233 27 876 5432',
    email: 'fiifi.mensah@gmail.com', gender: 'Male', dob: '08/11/1980', age: 45, status: 'active',
    titheStatus: 'tithe-faithful', cellGroup: 'Zion Cell — Legon', ministry: 'Finance Committee',
    ministries: ['Finance Committee'],
    joinDate: '18/03/2015', lastAttendance: '13 Apr 2026', attendanceRate: 95, totalGiving: 42800,
    address: 'East Legon, Accra', maritalStatus: 'Married', occupation: 'Engineer',
    emergencyContact: '+233 27 555 4433', baptised: true,
    attendanceHistory: [
      { week: '16 Mar', present: true }, { week: '23 Mar', present: true }, { week: '30 Mar', present: true },
      { week: '06 Apr', present: true }, { week: '13 Apr', present: true },
    ],
    recentGiving: [
      { date: '13 Apr', type: 'Tithe', amount: 1200 }, { date: '06 Apr', type: 'Pledge', amount: 500 },
      { date: '30 Mar', type: 'Tithe', amount: 1200 },
    ],
  },
  {
    id: 'member-004', memberId: 'GWC-0178', name: 'Akua Boateng', photo: 'https://i.pravatar.cc/48?img=9',
    photoAlt: 'Akua Boateng, female church member profile photo', phone: '+233 55 123 4567',
    email: 'akua.boateng@hotmail.com', gender: 'Female', dob: '30/04/2000', age: 25, status: 'new',
    titheStatus: 'tithe-irregular', cellGroup: 'Faith Cell — Accra Central', ministry: 'Youth Ministry',
    ministries: ['Youth Ministry'],
    joinDate: '02/03/2026', lastAttendance: '06 Apr 2026', attendanceRate: 72, totalGiving: 850,
    address: 'Osu, Accra', maritalStatus: 'Single', occupation: 'Student',
    emergencyContact: '+233 55 444 3322', baptised: false,
    attendanceHistory: [
      { week: '16 Mar', present: false }, { week: '23 Mar', present: true }, { week: '30 Mar', present: true },
      { week: '06 Apr', present: true }, { week: '13 Apr', present: false },
    ],
    recentGiving: [
      { date: '06 Apr', type: 'Offering', amount: 50 }, { date: '30 Mar', type: 'Tithe', amount: 200 },
    ],
  },
  {
    id: 'member-005', memberId: 'GWC-0215', name: 'Yaw Asante-Frimpong', photo: 'https://i.pravatar.cc/48?img=11',
    photoAlt: 'Yaw Asante-Frimpong, male church member profile photo', phone: '+233 24 999 1234',
    email: 'yaw.asante@gmail.com', gender: 'Male', dob: '14/09/1975', age: 50, status: 'active',
    titheStatus: 'tithe-faithful', cellGroup: 'Canaan Cell — Adenta', ministry: 'Elders Board',
    ministries: ['Elders Board'],
    joinDate: '09/07/2012', lastAttendance: '13 Apr 2026', attendanceRate: 97, totalGiving: 76500,
    address: 'Adenta, Accra', maritalStatus: 'Married', occupation: 'Business Owner',
    emergencyContact: '+233 24 777 6655', baptised: true,
    attendanceHistory: [
      { week: '16 Mar', present: true }, { week: '23 Mar', present: true }, { week: '30 Mar', present: true },
      { week: '06 Apr', present: true }, { week: '13 Apr', present: true },
    ],
    recentGiving: [
      { date: '13 Apr', type: 'Tithe', amount: 2500 }, { date: '06 Apr', type: 'Tithe', amount: 2500 },
      { date: '30 Mar', type: 'Pledge', amount: 5000 },
    ],
  },
  {
    id: 'member-006', memberId: 'GWC-0331', name: 'Abena Frimpong-Manso', photo: 'https://i.pravatar.cc/48?img=15',
    photoAlt: 'Abena Frimpong-Manso, female church member profile photo', phone: '+233 26 555 8901',
    email: 'abena.frimpong@gmail.com', gender: 'Female', dob: '03/12/1990', age: 35, status: 'active',
    titheStatus: 'tithe-irregular', cellGroup: 'Hope Cell — Madina', ministry: 'Children Ministry',
    ministries: ['Children Ministry'],
    joinDate: '20/09/2020', lastAttendance: '06 Apr 2026', attendanceRate: 65, totalGiving: 4300,
    address: 'Madina, Accra', maritalStatus: 'Married', occupation: 'Teacher',
    emergencyContact: '+233 26 333 2211', baptised: true,
    attendanceHistory: [
      { week: '16 Mar', present: false }, { week: '23 Mar', present: true }, { week: '30 Mar', present: false },
      { week: '06 Apr', present: true }, { week: '13 Apr', present: false },
    ],
    recentGiving: [
      { date: '06 Apr', type: 'Offering', amount: 150 }, { date: '23 Mar', type: 'Tithe', amount: 400 },
    ],
  },
  {
    id: 'member-007', memberId: 'GWC-0415', name: 'Kofi Darko-Mensah', photo: 'https://i.pravatar.cc/48?img=17',
    photoAlt: 'Kofi Darko-Mensah, male church member profile photo', phone: '+233 50 777 2345',
    email: 'kofi.darko@yahoo.com', gender: 'Male', dob: '19/06/1998', age: 27, status: 'active',
    titheStatus: 'tithe-none', cellGroup: 'Shalom Cell — Ashaiman', ministry: 'Media & Tech',
    ministries: ['Media & Tech'],
    joinDate: '11/02/2023', lastAttendance: '30 Mar 2026', attendanceRate: 55, totalGiving: 1200,
    address: 'Ashaiman, Greater Accra', maritalStatus: 'Single', occupation: 'Graphic Designer',
    emergencyContact: '+233 50 888 9900', baptised: true,
    attendanceHistory: [
      { week: '16 Mar', present: true }, { week: '23 Mar', present: false }, { week: '30 Mar', present: true },
      { week: '06 Apr', present: false }, { week: '13 Apr', present: false },
    ],
    recentGiving: [
      { date: '30 Mar', type: 'Offering', amount: 100 }, { date: '02 Mar', type: 'Offering', amount: 80 },
    ],
  },
  {
    id: 'member-008', memberId: 'GWC-0502', name: 'Ama Owusu-Barimah', photo: 'https://i.pravatar.cc/48?img=20',
    photoAlt: 'Ama Owusu-Barimah, female church member profile photo', phone: '+233 23 444 6789',
    email: 'ama.owusu@gmail.com', gender: 'Female', dob: '28/02/1985', age: 41, status: 'inactive',
    titheStatus: 'tithe-none', cellGroup: 'Bethel Cell — Dansoman', ministry: 'Prayer Ministry',
    ministries: ['Prayer Ministry'],
    joinDate: '15/05/2017', lastAttendance: '16 Feb 2026', attendanceRate: 28, totalGiving: 3800,
    address: 'Dansoman, Accra', maritalStatus: 'Divorced', occupation: 'Trader',
    emergencyContact: '+233 23 111 0099', baptised: true,
    attendanceHistory: [
      { week: '16 Mar', present: false }, { week: '23 Mar', present: false }, { week: '30 Mar', present: false },
      { week: '06 Apr', present: false }, { week: '13 Apr', present: false },
    ],
    recentGiving: [
      { date: '16 Feb', type: 'Offering', amount: 100 },
    ],
  },
  {
    id: 'member-009', memberId: 'GWC-0587', name: 'Nana Agyei-Boafo', photo: 'https://i.pravatar.cc/48?img=22',
    photoAlt: 'Nana Agyei-Boafo, male church member profile photo', phone: '+233 24 321 0987',
    email: 'nana.agyei@gmail.com', gender: 'Male', dob: '05/08/1992', age: 33, status: 'active',
    titheStatus: 'tithe-faithful', cellGroup: 'Zion Cell — Legon', ministry: 'Evangelism Team',
    ministries: ['Evangelism Team'],
    joinDate: '08/10/2021', lastAttendance: '13 Apr 2026', attendanceRate: 83, totalGiving: 7650,
    address: 'Legon, Accra', maritalStatus: 'Married', occupation: 'Lecturer',
    emergencyContact: '+233 24 654 3210', baptised: true,
    attendanceHistory: [
      { week: '16 Mar', present: true }, { week: '23 Mar', present: false }, { week: '30 Mar', present: true },
      { week: '06 Apr', present: true }, { week: '13 Apr', present: true },
    ],
    recentGiving: [
      { date: '13 Apr', type: 'Tithe', amount: 700 }, { date: '06 Apr', type: 'Offering', amount: 200 },
      { date: '30 Mar', type: 'Tithe', amount: 700 },
    ],
  },
  {
    id: 'member-010', memberId: 'GWC-0634', name: 'Efua Asiedu-Manu', photo: 'https://i.pravatar.cc/48?img=25',
    photoAlt: 'Efua Asiedu-Manu, female church member profile photo', phone: '+233 27 654 3210',
    email: 'efua.asiedu@hotmail.com', gender: 'Female', dob: '17/01/1970', age: 56, status: 'active',
    titheStatus: 'tithe-faithful', cellGroup: 'Canaan Cell — Adenta', ministry: 'Women Ministry',
    ministries: ['Women Ministry'],
    joinDate: '03/02/2010', lastAttendance: '13 Apr 2026', attendanceRate: 91, totalGiving: 54200,
    address: 'Adenta Frafraha, Accra', maritalStatus: 'Married', occupation: 'Retired Civil Servant',
    emergencyContact: '+233 27 111 2345', baptised: true,
    attendanceHistory: [
      { week: '16 Mar', present: true }, { week: '23 Mar', present: true }, { week: '30 Mar', present: true },
      { week: '06 Apr', present: false }, { week: '13 Apr', present: true },
    ],
    recentGiving: [
      { date: '13 Apr', type: 'Tithe', amount: 1500 }, { date: '06 Apr', type: 'Pledge', amount: 2000 },
      { date: '30 Mar', type: 'Tithe', amount: 1500 },
    ],
  },
  {
    id: 'member-011', memberId: 'GWC-0712', name: 'Kweku Sarpong-Oti', photo: 'https://i.pravatar.cc/48?img=27',
    photoAlt: 'Kweku Sarpong-Oti, male church member profile photo', phone: '+233 20 876 5432',
    email: 'kweku.sarpong@gmail.com', gender: 'Male', dob: '25/10/2001', age: 24, status: 'new',
    titheStatus: 'tithe-none', cellGroup: 'Faith Cell — Accra Central', ministry: 'Youth Ministry',
    ministries: ['Youth Ministry'],
    joinDate: '18/01/2026', lastAttendance: '13 Apr 2026', attendanceRate: 78, totalGiving: 450,
    address: 'Accra Central', maritalStatus: 'Single', occupation: 'University Student',
    emergencyContact: '+233 20 222 3344', baptised: false,
    attendanceHistory: [
      { week: '16 Mar', present: true }, { week: '23 Mar', present: true }, { week: '30 Mar', present: false },
      { week: '06 Apr', present: true }, { week: '13 Apr', present: true },
    ],
    recentGiving: [
      { date: '13 Apr', type: 'Offering', amount: 50 }, { date: '06 Apr', type: 'Offering', amount: 50 },
    ],
  },
  {
    id: 'member-012', memberId: 'GWC-0789', name: 'Adjoa Darkwa-Nyarko', photo: 'https://i.pravatar.cc/48?img=29',
    photoAlt: 'Adjoa Darkwa-Nyarko, female church member profile photo', phone: '+233 55 345 6789',
    email: 'adjoa.darkwa@gmail.com', gender: 'Female', dob: '11/05/1983', age: 42, status: 'transferred',
    titheStatus: 'tithe-irregular', cellGroup: 'Shalom Cell — Ashaiman', ministry: 'Hospitality',
    ministries: ['Hospitality'],
    joinDate: '22/11/2016', lastAttendance: '23 Mar 2026', attendanceRate: 44, totalGiving: 12800,
    address: 'Ashaiman New Town', maritalStatus: 'Married', occupation: 'Pharmacist',
    emergencyContact: '+233 55 987 6543', baptised: true,
    attendanceHistory: [
      { week: '16 Mar', present: false }, { week: '23 Mar', present: true }, { week: '30 Mar', present: false },
      { week: '06 Apr', present: false }, { week: '13 Apr', present: false },
    ],
    recentGiving: [
      { date: '23 Mar', type: 'Tithe', amount: 800 },
    ],
  },
];