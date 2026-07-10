// api/admin/operators.js

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const operators = [
    { id: "AM", full_name: "Ashlee McPhail" },
    { id: "EJ", full_name: "Emma Jackson" },
    { id: "EO", full_name: "Erin de Burgh-O'Brien" },
    { id: "EM", full_name: "Ellen Murphy" },
    { id: "BJ", full_name: "Britt Jeffs" }
  ];

  res.status(200).json(operators);
}
