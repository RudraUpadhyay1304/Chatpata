/**
 * Sample Initial Data for FindIt AI Campus Lost & Found Platform
 * Seed data for localStorage initialization.
 * No real personal data is used.
 */

export const INITIAL_USER = {
  id: "user-101",
  name: "Alex Chen",
  initials: "AC",
  email: "alex.chen@university.edu",
  studentId: "STU-84920",
  department: "Computer Science & Engineering",
  role: "Student",
  avatarUrl: null,
  phone: "+1 (555) 382-9401",
  joinedDate: "Fall 2024"
};

export const CAMPUS_ZONES = [
  { id: "all", name: "All Campus Zones" },
  { id: "library", name: "Main University Library" },
  { id: "student-union", name: "Student Union Center" },
  { id: "sports", name: "Rec Sports Complex" },
  { id: "science", name: "Science & Engineering" },
  { id: "dining", name: "Dining Commons" },
  { id: "east-quad", name: "East Quad Pavilion" }
];

export const CATEGORIES = [
  "All Categories",
  "Electronics & Audio",
  "Student ID & Cards",
  "Water Bottles & Tumblers",
  "Wallets & Keys",
  "Clothing & Backpacks",
  "Books & Notebooks"
];

export const INITIAL_ITEMS = [
  {
    id: "item-1",
    title: "AirPods Pro in Case",
    type: "found", // "lost" or "found"
    category: "Electronics & Audio",
    location: "Main Library 2nd Floor",
    zone: "library",
    date: "2026-11-06T20:30:00Z",
    timeAgo: "35 mins ago",
    description: "White Apple AirPods Pro 2nd Gen in silicone case. Found on quiet study desk #24 near window. Has a small teal carabiner clip attached.",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAZ2Qsz4Dwun9cLA3_6Ldw8AprW7cQ5-L1WZzhPq2_7AOhlhQTzVoKSOOrhcr8hzFpUPTlCJYBCxOAXk7_J4jF-CuS-jHx9mxXHd_gkjH15Vp0mf0j3dbh85x_6I5eP-68U6zrRAzOGwn1MjpVsJeLFU6wYdswvq9dsMA5CpYO6ZbIXSe9OGYKKi2vzl3_tOGOHbx-KmTWTHPIDyKJ9uNib0byHeIp7sCE_3WZkeN8",
    reporterName: "Library Helpdesk Staff",
    reporterContact: "library-lostfound@university.edu",
    status: "active", // "active", "claimed", "resolved"
    matchConfidence: 96,
    isSecurityDesk: false,
    ownerUserId: "staff-01"
  },
  {
    id: "item-2",
    title: "Hydro Flask 32oz Yellow",
    type: "lost",
    category: "Water Bottles & Tumblers",
    location: "Student Union Cafe",
    zone: "student-union",
    date: "2026-11-06T19:45:00Z",
    timeAgo: "1 hour ago",
    description: "Mustard yellow wide-mouth Hydro Flask 32oz with black flex cap. Features an ACM coding sticker and National Parks vinyl decal.",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCVdiARXHJLSLqNod61WHZ7KBuhUdClgc6E0Jaz-RqvTuQIyHT4CBf72oEa7tYyksqv7Fz7SFqDEyXxTqW9copWLOX5NnjpRPx_QLrS0w1qHoSItQo0PKC6fXPV1OWJNfRxbUM644h2kFCLC8ith1T9sanabS-BDEo30RtB1iOeR3EbYp6MzRXqGykUOw-8Stvi7ZV2-Q0eugo47mFGFzFIVqPcJZtsoukIlbliP2I",
    reporterName: "Alex Chen",
    reporterContact: "alex.chen@university.edu",
    status: "active",
    matchConfidence: null,
    isSecurityDesk: false,
    ownerUserId: "user-101"
  },
  {
    id: "item-3",
    title: "Student ID - Emma Watson",
    type: "found",
    category: "Student ID & Cards",
    location: "Science Atrium Desk",
    zone: "science",
    date: "2026-11-06T18:15:00Z",
    timeAgo: "2 hours ago",
    description: "Official Campus Student ID Card for Emma Watson (Bioengineering '27). Secured at the main reception security desk. Student must show photo ID or student portal login for pickup.",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCH0Bo6H5ewQqkv7BbR98DiZ7vzzcdohDzHUOLVAMLYwN_GxxOYwEMcDmOMrEslp0g332d0vROJ4eJ6LdbCJBVjVakxD_4hqb9W9kcrOaSVfcfYa0xqoa2pfxXoRAHZONAC4tHfCphuJst74Qim_dAAncxNWe0MDDj6GNnJ3w4RBhrOM0Z2zbUwt5WkLRZD8KCR5MGEadGCKqqD-jEOlebmvZtVm0CN_pexhlAdQxs",
    reporterName: "Campus Safety Officer Miller",
    reporterContact: "campus-safety@university.edu",
    status: "active",
    matchConfidence: null,
    isSecurityDesk: true,
    ownerUserId: "safety-desk"
  },
  {
    id: "item-4",
    title: "Brown Leather Bi-Fold Wallet",
    type: "found",
    category: "Wallets & Keys",
    location: "East Quad Pavilion",
    zone: "east-quad",
    date: "2026-11-06T16:00:00Z",
    timeAgo: "4 hours ago",
    description: "Vintage distressed brown leather bifold wallet. Found on brick ledge near the fountain. Contains campus dining card and transit pass. Cash intact.",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBOs2USZyPDLNl_jhAEx3rRoymrIbFyr_uaQ2vZPNAzZLJTAX8c-FjGm0U1sI-RwOkXKM2Rgs1ZvHAyAa2tlLOkvFEWE7NbxlXjI8GmsLk1EJvcV9tBNSuh7qvAwwZTU3UaTM11K8-bFrg9ey1OOEsJZfz0dCdVU8UNRLREfJhjFKlg66DeaNQd5kAqnnCFY9NmuDM2OzkQq15bcX81c8Q1jNw-AMfyQ8kLgs3nUqg",
    reporterName: "Marcus Vance",
    reporterContact: "marcus.v@university.edu",
    status: "active",
    matchConfidence: null,
    isSecurityDesk: false,
    ownerUserId: "user-102"
  },
  {
    id: "item-5",
    title: "Black Sony Wireless Earbuds",
    type: "lost",
    category: "Electronics & Audio",
    location: "Rec Sports Complex Gym",
    zone: "sports",
    date: "2026-11-06T15:00:00Z",
    timeAgo: "5 hours ago",
    description: "Sony WF-1000XM4 noise cancelling earbuds in black matte charging case. Left on treadmill console #8 or near locker room entrance.",
    imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80",
    reporterName: "Alex Chen",
    reporterContact: "alex.chen@university.edu",
    status: "active",
    matchConfidence: 89,
    isSecurityDesk: false,
    ownerUserId: "user-101"
  },
  {
    id: "item-6",
    title: "Blue Stainless Water Bottle",
    type: "found",
    category: "Water Bottles & Tumblers",
    location: "Dining Commons Booth 4",
    zone: "dining",
    date: "2026-11-06T14:20:00Z",
    timeAgo: "6 hours ago",
    description: "Cobalt blue double-wall insulated tumbler bottle with straw lid. Found on dining booth table during lunch turnover.",
    imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80",
    reporterName: "Dining Commons Supervisor",
    reporterContact: "dining@university.edu",
    status: "active",
    matchConfidence: null,
    isSecurityDesk: false,
    ownerUserId: "staff-02"
  },
  {
    id: "item-7",
    title: "Calculus III Spiral Notebook",
    type: "lost",
    category: "Books & Notebooks",
    location: "Science Complex Lecture Hall B",
    zone: "science",
    date: "2026-11-05T17:00:00Z",
    timeAgo: "1 day ago",
    description: "Thick Five-Star 3-subject spiral notebook in dark navy blue. Contains hand-written multivariable calculus lecture notes and exam formulas. Urgent for midterms!",
    imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
    reporterName: "Sarah Jenkins",
    reporterContact: "s.jenkins@university.edu",
    status: "active",
    matchConfidence: null,
    isSecurityDesk: false,
    ownerUserId: "user-103"
  },
  {
    id: "item-8",
    title: "North Face Borealis Backpack",
    type: "found",
    category: "Clothing & Backpacks",
    location: "Main Library Study Carrel 14",
    zone: "library",
    date: "2026-11-05T14:10:00Z",
    timeAgo: "1 day ago",
    description: "Black North Face backpack with bungee cord front and reflective straps. Turned into Library Security Lost & Found desk on 1st floor.",
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
    reporterName: "Library Circulation Desk",
    reporterContact: "library-lostfound@university.edu",
    status: "active",
    matchConfidence: 82,
    isSecurityDesk: true,
    ownerUserId: "safety-desk"
  },
  {
    id: "item-9",
    title: "Brass Keychain with Dorm Key",
    type: "lost",
    category: "Wallets & Keys",
    location: "East Quad Pavilion Benches",
    zone: "east-quad",
    date: "2026-11-04T19:00:00Z",
    timeAgo: "2 days ago",
    description: "Brass keyring with dormitory room key #314, mailbox key, and a small green woven lanyard tag with 'EST 1898'.",
    imageUrl: "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80",
    reporterName: "David Kim",
    reporterContact: "dkim@university.edu",
    status: "active",
    matchConfidence: null,
    isSecurityDesk: false,
    ownerUserId: "user-104"
  },
  {
    id: "item-10",
    title: "Bose QuietComfort 45 Headphones",
    type: "found",
    category: "Electronics & Audio",
    location: "Student Union 3rd Floor Lounge",
    zone: "student-union",
    date: "2026-11-04T16:30:00Z",
    timeAgo: "2 days ago",
    description: "Over-ear Bose QC45 wireless headphones in smoke white with hard zippered carrying case and auxiliary cable. Handed in at the Student Union Info Booth.",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
    reporterName: "Info Booth Coordinator",
    reporterContact: "union-info@university.edu",
    status: "active",
    matchConfidence: 78,
    isSecurityDesk: true,
    ownerUserId: "safety-desk"
  }
];

export const INITIAL_CLAIMS = [
  {
    id: "claim-1",
    itemId: "item-1",
    itemTitle: "AirPods Pro in Case",
    itemLocation: "Main Library 2nd Floor",
    itemType: "found",
    claimantId: "user-101",
    claimantName: "Alex Chen",
    claimantEmail: "alex.chen@university.edu",
    date: "2026-11-06T21:10:00Z",
    proofDescription: "The case has a small teal carabiner and when connected via Bluetooth it is named 'Alex's AirPods Pro'. Serial number ends in 492X.",
    status: "pending", // "pending", "approved", "rejected"
    reviewerNotes: "Verification in progress by Main Library Circulation Desk."
  },
  {
    id: "claim-2",
    itemId: "item-3",
    itemTitle: "Student ID - Emma Watson",
    itemLocation: "Science Atrium Desk",
    itemType: "found",
    claimantId: "user-105",
    claimantName: "Emma Watson",
    claimantEmail: "e.watson@university.edu",
    date: "2026-11-06T19:00:00Z",
    proofDescription: "Matched with official student directory photo. Picked up at Science Atrium Desk with passport verification.",
    status: "approved",
    reviewerNotes: "Verified and returned on Nov 6, 2026."
  }
];

