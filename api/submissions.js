// api/submissions.js
// Vercel serverless function for listing, getting, and updating submissions

let localSubmissions = [
  {
    id: "sub_1",
    client_id: "lacw",
    client_name: "LACW",
    subject: "New File: Alycia McCarthy",
    sender_email: "erin.deburgh@lacw.org.au",
    created_at: "2026-07-08T02:50:07Z",
    operator_id: "AM",
    status: "New",
    priority: "Normal",
    sla: "2026-07-21T00:00:00Z", // Next court date
    body: `Hi Ashlee, Please see the below regarding Alycia McCarthy new file.

Client: Alycia McCarthy
Custody Status: in community
Matter Type(s): Summary consol
Funding Type(s): VLA Certified by: AM
Confirmed Proof of Means: Yes/No (Centrelink details)
Assigned To: AM
Next Court Date: 21 July 2026
Court Location: Dandenong Magistrates Court
File No: 233847
Notes: @Emma Jackson can we please apply for consol GOA?

Kind regards,
Erin de Burgh-O'Brien (she/her)
Paralegal`,
    notes: "@Emma Jackson can we please apply for consol GOA?",
    attachments: [],
    comments: [
      {
        id: "com_1",
        commentText: "Assigned to Ashlee McPhail for triage.",
        created_at: "2026-07-08T03:00:00Z",
        operator_name: "System"
      }
    ]
  },
  {
    id: "sub_2",
    client_id: "lacw",
    client_name: "LACW",
    subject: "Urgent: Custody Intake - John Doe",
    sender_email: "intake@lacw.org.au",
    created_at: "2026-07-09T09:15:00Z",
    operator_id: "EJ",
    status: "Assigned",
    priority: "Urgent",
    sla: "2026-07-10T17:00:00Z",
    body: `Client: John Doe\nCustody Status: in custody\nMatter Type: Indictable\nNotes: Client is in custody, application needs urgent submission before tomorrow.`,
    notes: "Requires urgent means check.",
    attachments: [],
    comments: []
  }
];

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Handle comments path: POST /api/submissions/:id/comments
  if (req.method === "POST" && req.url.includes("/comments")) {
    const urlParts = req.url.split("?")[0].split("/");
    const commentsIndex = urlParts.indexOf("comments");
    const subId = commentsIndex > 0 ? urlParts[commentsIndex - 1] : null;
    
    const item = localSubmissions.find(s => s.id === subId);
    if (!item) {
      res.status(404).json({ error: "Submission not found for comments" });
      return;
    }
    const body = req.body || {};
    const newComment = {
      id: "com_" + Date.now(),
      commentText: body.commentText || "",
      created_at: new Date().toISOString(),
      operator_name: "Local Operator"
    };
    item.comments = item.comments || [];
    item.comments.push(newComment);
    res.status(200).json(newComment);
    return;
  }

  // Extract ID from path if present (e.g. /api/submissions/sub_1)
  const urlParts = req.url.split("?")[0].split("/").filter(Boolean);
  const subId = urlParts.length > 1 && urlParts[0] === "api" && urlParts[1] === "submissions" ? urlParts[2] : null;

  // GET /api/submissions/:id
  if (req.method === "GET" && subId) {
    const item = localSubmissions.find(s => s.id === subId);
    if (!item) {
      res.status(404).json({ error: "Submission not found" });
      return;
    }
    res.status(200).json(item);
    return;
  }

  // GET /api/submissions
  if (req.method === "GET") {
    const { status, priority, search } = req.query;
    let list = [...localSubmissions];

    if (status) {
      list = list.filter(s => s.status === status);
    }
    if (priority) {
      list = list.filter(s => s.priority === priority);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        s =>
          s.subject.toLowerCase().includes(q) ||
          s.body.toLowerCase().includes(q) ||
          s.notes.toLowerCase().includes(q)
      );
    }

    res.status(200).json(list);
    return;
  }

  // PATCH /api/submissions/:id
  if (req.method === "PATCH" && subId) {
    const item = localSubmissions.find(s => s.id === subId);
    if (!item) {
      res.status(404).json({ error: "Submission not found" });
      return;
    }

    const body = req.body || {};
    if (body.status !== undefined) item.status = body.status;
    if (body.priority !== undefined) item.priority = body.priority;
    if (body.operatorId !== undefined) item.operator_id = body.operatorId;
    if (body.sla !== undefined) item.sla = body.sla;
    if (body.notes !== undefined) item.notes = body.notes;

    res.status(200).json(item);
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
