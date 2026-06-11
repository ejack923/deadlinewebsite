import { createPageUrl } from "@/utils";
import { ArrowLeft } from "lucide-react";

const calculatorHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>VLA Means Test Quick Calculator</title>
  <style>
    :root {
      --bg: #f6f8fb;
      --panel: #ffffff;
      --muted: #5b6472;
      --text: #172033;
      --border: #dbe2ea;
      --accent: #2459ff;
      --ok: #0f8a4b;
      --warn: #b26a00;
      --bad: #b42318;
      --soft-ok: #ecfdf3;
      --soft-warn: #fff7e6;
      --soft-bad: #fff1f3;
      --shadow: 0 12px 32px rgba(16, 24, 40, 0.08);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 24px;
      font-family: Inter, Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
    }
    .wrap {
      max-width: 1120px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 24px;
    }
    .card {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 20px;
      box-shadow: var(--shadow);
      padding: 22px;
    }
    h1 { margin: 0 0 8px; font-size: 30px; line-height: 1.1; }
    .sub { margin: 0 0 20px; color: var(--muted); line-height: 1.5; }
    h2 { font-size: 18px; margin: 20px 0 12px; }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
    .grid-3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
    label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; }
    input, select {
      width: 100%;
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 12px 14px;
      font-size: 15px;
      color: var(--text);
      background: #fff;
    }
    .help { margin-top: 5px; font-size: 12px; color: var(--muted); line-height: 1.35; }
    .pill { display: inline-flex; align-items: center; padding: 8px 12px; border-radius: 999px; font-weight: 700; font-size: 14px; }
    .ok { background: var(--soft-ok); color: var(--ok); }
    .warn { background: var(--soft-warn); color: var(--warn); }
    .bad { background: var(--soft-bad); color: var(--bad); }
    .result-box { border-radius: 18px; padding: 18px; margin-bottom: 16px; border: 1px solid var(--border); }
    .metric { display: flex; justify-content: space-between; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--border); }
    .metric:last-child { border-bottom: none; }
    .metric span:first-child { color: var(--muted); }
    .metric strong { text-align: right; }
    .small { font-size: 13px; color: var(--muted); line-height: 1.5; }
    .note { background: #f8fafc; border: 1px solid var(--border); border-radius: 14px; padding: 14px; font-size: 13px; line-height: 1.5; color: var(--muted); margin-top: 14px; }
    .section-title { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    .muted { color: var(--muted); }
    .help-btn {
      display: inline-flex; align-items: center; justify-content: center;
      width: 18px; height: 18px; border-radius: 50%;
      background: var(--border); color: var(--muted);
      font-size: 11px; font-weight: 700; cursor: pointer; border: none;
      margin-left: 6px; vertical-align: middle; line-height: 1;
    }
    .help-btn:hover { background: var(--accent); color: #fff; }
    .modal-overlay {
      display: none; position: fixed; inset: 0;
      background: rgba(16,24,40,0.4); z-index: 1000;
      align-items: center; justify-content: center;
    }
    .modal-overlay.open { display: flex; }
    .modal {
      background: #fff; border-radius: 20px; padding: 28px;
      max-width: 480px; width: 90%; box-shadow: var(--shadow);
    }
    .modal h3 { margin: 0 0 16px; font-size: 18px; }
    .modal-close {
      float: right; background: none; border: none; font-size: 20px;
      cursor: pointer; color: var(--muted); margin: -4px -4px 0 0;
    }
    .cost-item { margin-bottom: 14px; }
    .cost-item strong { display: block; margin-bottom: 4px; font-size: 14px; }
    .cost-item p { margin: 0; font-size: 13px; color: var(--muted); line-height: 1.5; }
    @media (max-width: 920px) {
      .wrap { grid-template-columns: 1fr; }
      .grid, .grid-3 { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <h1>VLA Means Test Quick Calculator</h1>
      <p class="sub">Fast internal guide for whether a client appears to meet the financial side of Victoria Legal Aid's means test. This is a practical screening tool only, not a substitute for the Handbook or a grant decision.</p>

      <div id="partnerModal" class="modal-overlay">
        <div class="modal">
          <button class="modal-close" onclick="document.getElementById('partnerModal').classList.remove('open')">&#x2715;</button>
          <h3>What counts as a partner?</h3>
          <div class="cost-item">
            <strong>Spouse or de facto partner</strong>
            <p>A person is considered a partner if they are married to the applicant, or are in a de facto relationship — meaning they live together on a genuine domestic basis, regardless of gender.</p>
          </div>
          <div class="cost-item">
            <strong>When partner income is included</strong>
            <p>VLA includes a partner's income in the means assessment unless the matter involves family violence, a dispute between the partners, or it would otherwise be unreasonable or inappropriate to do so.</p>
          </div>
          <div class="cost-item">
            <strong>When partner income is excluded</strong>
            <p>Leave the partner income field at $0 if the matter involves family violence or a dispute between the applicant and their partner, or if VLA has otherwise determined partner income should not be counted.</p>
          </div>
        </div>
      </div>

      <div id="costModal" class="modal-overlay">
        <div class="modal">
          <button class="modal-close" onclick="document.getElementById('costModal').classList.remove('open')">&#x2715;</button>
          <h3>Matter cost categories</h3>
          <div class="cost-item">
            <strong>Low cost</strong>
            <p>Matters expected to cost up to approximately $1,555 in legal fees. Typically simple, brief legal proceedings such as minor criminal matters or straightforward applications.</p>
          </div>
          <div class="cost-item">
            <strong>Medium cost</strong>
            <p>Matters expected to cost between approximately $1,555 and $6,559 in legal fees. Includes matters requiring more preparation, hearings, or moderate complexity.</p>
          </div>
          <div class="cost-item">
            <strong>High cost</strong>
            <p>Matters expected to exceed approximately $6,559 in legal fees. Typically serious criminal trials, complex family law proceedings, or matters requiring extensive preparation and court time.</p>
          </div>
          <div class="cost-item">
            <strong>Custom legal matter cost</strong>
            <p>Use this when you know the specific estimated cost of the matter and want to apply that figure directly as the threshold.</p>
          </div>
          <div class="cost-item">
            <strong>Special circumstances</strong>
            <p>Some matters may be granted outside the standard means test thresholds under special circumstances provisions. These include matters involving family violence intervention orders, personal safety intervention orders, applications under the Crimes (Mental Impairment and Unfitness to be Tried) Act, sexual offence proceedings, matters involving Aboriginal or Torres Strait Islander clients in certain circumstances, and other matters where VLA determines it is in the interests of justice to grant aid regardless of financial means. Eligibility is determined on a case-by-case basis by VLA. Always confirm with the current VLA Handbook.</p>
          </div>
        </div>
      </div>

      <h2>Matter settings</h2>
      <div class="grid-3">
        <div>
          <label for="matterCategory">Matter cost category <button class="help-btn" onclick="document.getElementById('costModal').classList.add('open')" title="What do these categories mean?">?</button></label>
          <select id="matterCategory" onchange="onMatterCategoryChange()">
            <option value="low">Low cost</option>
            <option value="medium">Medium cost</option>
            <option value="high">High cost</option>
            <option value="custom">Custom legal matter cost</option>
            <option value="special">Special circumstances</option>
          </select>
          <div class="help">Low, medium and high cost categories affect the income threshold.</div>
          <div id="specialCircsPanel" style="display:none;margin-top:10px;width:min(560px,calc(100vw - 48px));border:1px solid #d1d5db;border-radius:14px;overflow:hidden;font-size:12px;background:#fff;box-shadow:0 8px 20px rgba(15,23,42,0.06);position:relative;z-index:2;">
            <div style="padding:12px 14px 8px;border-bottom:1px solid #e5e7eb;">
              <span style="font-weight:700;color:#374151;display:block;">Review Guidelines (Matters are manually assessed)</span>
            </div>
            <div style="padding:10px 14px 14px;">
              <div style="margin-bottom:10px;">
                <select id="scGuideSelect" onchange="onScGuideChange()" style="width:100%;padding:10px 12px;background:#fff;border:1px solid #d1d5db;border-radius:10px;color:#374151;font-size:12px;font-weight:600;">
                  <option value="">Select guideline...</option>
                  <option value="state">State</option>
                  <option value="cwlth">Commonwealth</option>
                  <option value="docs">Requirements</option>
                </select>
              </div>
              <div id="scStateContent" style="display:none;padding:10px 12px;border:1px solid #e5e7eb;border-radius:10px;background:#fff;margin-bottom:8px;">
                  <p style="color:#78350f;margin:0 0 6px;line-height:1.5;">VLA may grant aid in a state matter if the person meets <strong>one</strong> of the following:</p>
                  <ul style="color:#78350f;margin:0 0 8px;padding-left:16px;line-height:1.7;">
                    <li>Is <strong>under 18 years old</strong></li>
                    <li>Has a <strong>reading or writing difficulty</strong></li>
                    <li>Has an <strong>intellectual disability</strong> (<em>Disability Act 2006</em> Vic)</li>
                    <li>Has a <strong>serious mental health issue</strong> and is receiving services from a designated mental health service (<em>Mental Health Act 2014</em> Vic)</li>
                  </ul>
                  <div style="background:#fef9c3;border-radius:8px;padding:7px 10px;color:#92400e;font-size:12px;">⚠️ Cannot be applied to traffic matters in the Magistrates' Court.</div>
              </div>
              <div id="scCwlthContent" style="display:none;padding:10px 12px;border:1px solid #e5e7eb;border-radius:10px;background:#fff;margin-bottom:8px;">
                  <p style="color:#78350f;margin:0 0 6px;line-height:1.5;"><strong>Criminal law:</strong> Person meets one of the State special circumstances above.</p>
                  <p style="color:#78350f;margin:0 0 6px;line-height:1.5;"><strong>Non-urgent family law:</strong> one of the following applies:</p>
                  <ul style="color:#78350f;margin:0;padding-left:16px;line-height:1.7;">
                    <li>Allegation of <strong>family violence</strong> - person is a victim or affected family member</li>
                    <li><strong>Likelihood of family violence</strong></li>
                    <li>Concerns about <strong>safety, welfare or wellbeing of a child</strong> needing investigation</li>
                    <li><strong>Reading or writing difficulty</strong></li>
                    <li><strong>Intellectual or physical disability</strong> or <strong>serious mental health issue</strong></li>
                    <li>Difficulty accessing legal assistance due to <strong>remote location</strong></li>
                    <li><strong>Aboriginal and/or Torres Strait Islander</strong> child/children</li>
                  </ul>
              </div>
              <div id="scDocsContent" style="display:none;padding:10px 12px;border:1px solid #e5e7eb;border-radius:10px;background:#fff;font-size:12px;color:#78350f;line-height:1.6;">
                  <p style="margin:0 0 6px;">Must provide VLA with: written description of circumstances and impact on self-representation; evidence as below; any additional supporting information.</p>
                  <p style="font-weight:700;margin:0;color:#92400e;">Reading or writing difficulty</p>
                  <p style="margin:0 0 6px;">Statutory declaration from a professional with personal knowledge, or documents from support services confirming the difficulty cannot be resolved by interpreter/translator services.</p>
                  <p style="font-weight:700;margin:0;color:#92400e;">Intellectual disability</p>
                  <p style="margin:0 0 6px;">Evidence of: disability services from a registered provider; DFFH Secretary determination; NDIS participation for intellectual disability; or nature of disability from registered provider/NDIS/DFFH.</p>
                  <div style="background:#fef9c3;border-radius:6px;padding:6px 9px;color:#92400e;">⚠️ A GP letter alone is <strong>not sufficient</strong>.</div>
                  <p style="font-weight:700;margin:6px 0 0;color:#92400e;">Serious mental health issue</p>
                  <p style="margin:0;">Evidence from a designated mental health service confirming the person is receiving services from that service.</p>
              </div>
            </div>
          </div>
        </div>
        <div id="customCostWrap" style="display:none;">
          <label for="customCost">Custom legal matter cost ($)</label>
          <input id="customCost" type="number" min="0" step="1" value="0" />
          <div class="help">Used only when "Custom legal matter cost" is selected.</div>
        </div>
        <div>
          <label for="region">Housing region</label>
          <select id="region">
            <option value="metro">Metropolitan</option>
            <option value="outer">Outer metro</option>
            <option value="regional">Regional</option>
          </select>
          <div class="help">Housing deduction cap: metro $400, outer metro $300, regional $240.</div>
        </div>
      </div>
      <div style="margin-top:16px;">
        <label>Does your client have a partner? <button class="help-btn" onclick="document.getElementById('partnerModal').classList.add('open')" title="What counts as a partner?">?</button></label>
        <div style="display:flex;gap:20px;margin-top:8px;">
          <label style="font-weight:400;display:flex;align-items:center;gap:6px;cursor:pointer;">
            <input type="radio" name="clientHasPartner" id="clientHasPartnerNo" value="no" checked onchange="onPartnerToggle()" /> No
          </label>
          <label style="font-weight:400;display:flex;align-items:center;gap:6px;cursor:pointer;">
            <input type="radio" name="clientHasPartner" id="clientHasPartnerYes" value="yes" onchange="onPartnerToggle()" /> Yes
          </label>
        </div>
      </div>

      <div id="incomeModal" class="modal-overlay">
        <div class="modal">
          <button class="modal-close" onclick="document.getElementById('incomeModal').classList.remove('open')">&#x2715;</button>
          <h3>What counts as weekly income?</h3>
          <div class="cost-item">
            <strong>All gross income is included</strong>
            <p>VLA assesses gross (before tax) weekly income from all sources. This includes wages and salary, self-employment income, Centrelink payments (e.g. JobSeeker, Youth Allowance, Parenting Payment, Disability Support Pension, Age Pension), workers compensation, rental income, and any other regular income.</p>
          </div>
          <div class="cost-item">
            <strong>Converting to weekly amounts</strong>
            <p>If income is paid fortnightly, divide by 2. If monthly, multiply by 12 then divide by 52. Enter the weekly equivalent in each field.</p>
          </div>
          <div class="cost-item">
            <strong>Excluded income</strong>
            <p>Certain payments are excluded, such as Family Tax Benefit, Carer Allowance, and some other supplementary Centrelink payments. Check the current VLA Handbook for the full exclusion list.</p>
          </div>
        </div>
      </div>

      <h2>Income / Pension <button class="help-btn" onclick="document.getElementById('incomeModal').classList.add('open')" title="What counts as income?">?</button></h2>
      <div class="grid">
        <div>
          <label for="appIncome">Applicant income ($)</label>
          <div style="display:flex;gap:8px;">
            <input id="appIncome" type="number" min="0" step="0.01" value="0" style="flex:1;" />
            <select id="appIncomeFreq" onchange="calculate()" style="width:130px;">
              <option value="weekly">Weekly</option>
              <option value="fortnightly">Fortnightly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>
        <div id="partnerIncomeRow" style="display:none">
          <label for="partnerIncome">Partner income ($)</label>
          <div style="display:flex;gap:8px;">
            <input id="partnerIncome" type="number" min="0" step="0.01" value="0" style="flex:1;" />
            <select id="partnerIncomeFreq" onchange="calculate()" style="width:130px;">
              <option value="weekly">Weekly</option>
              <option value="fortnightly">Fortnightly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>
      </div>

      <div id="mortgageModal" class="modal-overlay">
        <div class="modal">
          <button class="modal-close" onclick="document.getElementById('mortgageModal').classList.remove('open')">&#x2715;</button>
          <h3>Mortgage payments &amp; equitable charges</h3>
          <div class="cost-item">
            <strong>What is deductible</strong>
            <p>The weekly mortgage repayment amount (principal and interest) is an allowable housing deduction, subject to the regional cap (metro $400, outer metro $300, regional $240 per week).</p>
          </div>
          <div class="cost-item">
            <strong>Equitable charges</strong>
            <p>VLA may place an equitable charge on the applicant's principal residence as a condition of the grant. This means VLA can recover costs from the property if it is later sold or transferred. The charge is registered on the title and takes effect at the time of any future sale.</p>
          </div>
          <div class="cost-item">
            <strong>When a charge applies</strong>
            <p>A charge is typically imposed where the applicant owns or has equity in real property and is granted legal aid above a certain cost threshold. The existence of a mortgage does not prevent a charge — both can coexist on the title.</p>
          </div>
          <div class="cost-item">
            <strong>Tip</strong>
            <p>Enter the weekly mortgage repayment in the amount field. For monthly repayments, divide by 4.33 to get the weekly equivalent.</p>
          </div>
        </div>
      </div>

      <h2>Allowable deductions</h2>
      <div class="grid">
        <div>
          <label for="incomeTax">Income tax ($)</label>
          <input id="incomeTax" type="number" min="0" step="0.01" value="0" />
        </div>
        <div>
          <label for="medicare">Medicare levy ($)</label>
          <input id="medicare" type="number" min="0" step="0.01" value="0" />
        </div>
        <div>
          <label for="housingType">Housing payment type</label>
          <select id="housingType" onchange="onHousingTypeChange()">
            <option value="rent">Rent</option>
            <option value="mortgage">Mortgage</option>
          </select>
        </div>
        <div>
          <label for="housing">Housing payment amount ($) <span id="mortgageHelpBtn" style="display:none"><button class="help-btn" onclick="document.getElementById('mortgageModal').classList.add('open')" title="Mortgage and equitable charges">?</button></span></label>
          <div style="display:flex;gap:8px;">
            <input id="housing" type="number" min="0" step="0.01" value="0" style="flex:1;" />
            <select id="housingFreq" onchange="calculate()" style="width:130px;">
              <option value="weekly">Weekly</option>
              <option value="fortnightly">Fortnightly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>
        <div>
          <label for="otherAccomType">Other accommodation type</label>
          <select id="otherAccomType" onchange="calculate()">
            <option value="none">None</option>
            <option value="bond">Bond</option>
            <option value="rates">Rates</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label for="otherAccommodation">Other accommodation amount ($)</label>
          <div style="display:flex;gap:8px;">
            <input id="otherAccommodation" type="number" min="0" step="0.01" value="0" style="flex:1;" />
            <select id="otherAccomFreq" onchange="calculate()" style="width:130px;">
              <option value="weekly">Weekly</option>
              <option value="fortnightly">Fortnightly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div class="help">Half of this amount is counted as a deduction.</div>
        </div>
        <div>
          <label for="childcare">Childcare ($)</label>
          <div style="display:flex;gap:8px;">
            <input id="childcare" type="number" min="0" step="0.01" value="0" style="flex:1;" />
            <select id="childcareFreq" onchange="calculate()" style="width:130px;">
              <option value="weekly">Weekly</option>
              <option value="fortnightly">Fortnightly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div class="help">Capped at $310 per household.</div>
        </div>
        <div>
          <label for="businessExpenses">Business expenses ($)</label>
          <div style="display:flex;gap:8px;">
            <input id="businessExpenses" type="number" min="0" step="0.01" value="0" style="flex:1;" />
            <select id="businessExpensesFreq" onchange="calculate()" style="width:130px;">
              <option value="weekly">Weekly</option>
              <option value="fortnightly">Fortnightly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>
        <div>
          <label for="maintPerChild">Spousal maintenance / child support paid per child ($)</label>
          <div style="display:flex;gap:8px;">
            <input id="maintPerChild" type="number" min="0" step="0.01" value="0" style="flex:1;" />
            <select id="maintFreq" onchange="calculate()" style="width:130px;">
              <option value="weekly">Weekly</option>
              <option value="fortnightly">Fortnightly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div class="help">Capped at $130 per child.</div>
        </div>
        <div>
          <label for="childSupportChildren">Number of children paid for</label>
          <input id="childSupportChildren" type="number" min="0" step="1" value="0" />
        </div>
      </div>

      <div id="partnerDeductionsSection" style="display:none">
        <h2>Partner's allowable deductions</h2>
        <div class="grid">
          <div>
            <label for="pIncomeTax">Income tax ($)</label>
            <input id="pIncomeTax" type="number" min="0" step="0.01" value="0" />
          </div>
          <div>
            <label for="pMedicare">Medicare levy ($)</label>
            <input id="pMedicare" type="number" min="0" step="0.01" value="0" />
          </div>
          <div>
            <label for="pHousingType">Housing payment type</label>
            <select id="pHousingType" onchange="onPartnerHousingTypeChange()">
              <option value="rent">Rent</option>
              <option value="mortgage">Mortgage</option>
            </select>
          </div>
          <div>
            <label for="pHousing">Housing payment amount ($) <span id="pMortgageHelpBtn" style="display:none"><button class="help-btn" onclick="document.getElementById('mortgageModal').classList.add('open')" title="Mortgage and equitable charges">?</button></span></label>
            <div style="display:flex;gap:8px;">
              <input id="pHousing" type="number" min="0" step="0.01" value="0" style="flex:1;" />
              <select id="pHousingFreq" onchange="calculate()" style="width:130px;">
                <option value="weekly">Weekly</option>
                <option value="fortnightly">Fortnightly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>
          <div>
            <label for="pOtherAccomType">Other accommodation type</label>
            <select id="pOtherAccomType" onchange="calculate()">
              <option value="none">None</option>
              <option value="bond">Bond</option>
              <option value="rates">Rates</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label for="pOtherAccommodation">Other accommodation amount ($)</label>
            <div style="display:flex;gap:8px;">
              <input id="pOtherAccommodation" type="number" min="0" step="0.01" value="0" style="flex:1;" />
              <select id="pOtherAccomFreq" onchange="calculate()" style="width:130px;">
                <option value="weekly">Weekly</option>
                <option value="fortnightly">Fortnightly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div class="help">Half of this amount is counted as a deduction.</div>
          </div>
          <div>
            <label for="pChildcare">Childcare ($)</label>
            <div style="display:flex;gap:8px;">
              <input id="pChildcare" type="number" min="0" step="0.01" value="0" style="flex:1;" />
              <select id="pChildcareFreq" onchange="calculate()" style="width:130px;">
                <option value="weekly">Weekly</option>
                <option value="fortnightly">Fortnightly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div class="help">Capped at $310 per household.</div>
          </div>
          <div>
            <label for="pBusinessExpenses">Business expenses ($)</label>
            <div style="display:flex;gap:8px;">
              <input id="pBusinessExpenses" type="number" min="0" step="0.01" value="0" style="flex:1;" />
              <select id="pBusinessExpensesFreq" onchange="calculate()" style="width:130px;">
                <option value="weekly">Weekly</option>
                <option value="fortnightly">Fortnightly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>
          <div>
            <label for="pMaintPerChild">Spousal maintenance / child support paid per child ($)</label>
            <div style="display:flex;gap:8px;">
              <input id="pMaintPerChild" type="number" min="0" step="0.01" value="0" style="flex:1;" />
              <select id="pMaintFreq" onchange="calculate()" style="width:130px;">
                <option value="weekly">Weekly</option>
                <option value="fortnightly">Fortnightly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div class="help">Capped at $130 per child.</div>
          </div>
          <div>
            <label for="pChildSupportChildren">Number of children paid for</label>
            <input id="pChildSupportChildren" type="number" min="0" step="1" value="0" />
          </div>
        </div>
      </div>

      <select id="hasPartner" style="display:none"><option value="no">No</option><option value="yes">Yes</option></select>
      <input id="dependants" type="number" value="0" style="display:none" />

      <h2>Assets</h2>
      <div class="grid">
        <div>
          <label for="cashSavings">Cash savings ($)</label>
          <input id="cashSavings" type="number" min="0" step="0.01" value="0" />
          <div class="help">Exclusion: up to $1,095 if single, or $2,190 if partner and/or dependants.</div>
        </div>
        <div>
          <label for="vehicleEquity">Vehicle equity ($)</label>
          <input id="vehicleEquity" type="number" min="0" step="0.01" value="0" />
          <div class="help">Exclusion: up to $20,000 total vehicle equity.</div>
        </div>
        <div>
          <label for="homeEquity">Principal residence equity ($)</label>
          <input id="homeEquity" type="number" min="0" step="0.01" value="0" />
          <div class="help">Exclusion: up to $500,000 equity.</div>
        </div>
        <div>
          <label for="otherAssets">Other assessable assets ($)</label>
          <input id="otherAssets" type="number" min="0" step="0.01" value="0" />
          <div class="help">Use this for assets not otherwise excluded. Farm/business exclusions are not auto-calculated here.</div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="section-title">
        <h2 style="margin: 0;">Quick result</h2>
        <div id="statusPill" class="pill warn">Needs inputs</div>
      </div>

      <div id="resultBox" class="result-box">
        <div id="headline" style="font-size: 22px; font-weight: 800; margin-bottom: 8px;">Enter figures to assess eligibility</div>
        <div id="summary" class="small">The calculator will compare assessable weekly income and assessable assets against the selected matter threshold.</div>
      </div>

      <div class="metric"><span>Combined weekly income</span><strong id="mCombinedIncome">$0.00</strong></div>
      <div class="metric"><span>Total allowable deductions</span><strong id="mDeductions">$0.00</strong></div>
      <div class="metric"><span>Assessable weekly income</span><strong id="mAssessableIncome">$0.00</strong></div>
      <div class="metric"><span>Assessable assets</span><strong id="mAssessableAssets">$0.00</strong></div>
      <div class="metric"><span>Income threshold used</span><strong id="mIncomeThreshold">—</strong></div>
      <div class="metric"><span>Asset threshold used</span><strong id="mAssetThreshold">—</strong></div>

      <div class="note" id="breakdown"></div>
      <div class="note">
        <strong>Important limits of this quick tool</strong><br />
        It does not decide guideline eligibility, merits, urgency, contribution amount, every exemption, or every asset rule. It also does not auto-handle youth exemptions, crimes mental impairment reviews, war veterans' matters, NDIS administrative appeals matters, Aboriginal or Torres Strait Islander contribution exemptions, or the special farm/business exclusions. Always check the current VLA Handbook before relying on the outcome.
      </div>
    </div>
  </div>

  <script>
    const $ = (id) => document.getElementById(id);
    function onScGuideChange() {
      const selected = $('scGuideSelect').value;
      const sections = ['state', 'cwlth', 'docs'];
      sections.forEach((key) => {
        const content = $({ state: 'scStateContent', cwlth: 'scCwlthContent', docs: 'scDocsContent' }[key]);
        content.style.display = key === selected ? 'block' : 'none';
      });
    }
    function onMatterCategoryChange() {
      const matterCategory = $('matterCategory').value;
      const isSpecial = matterCategory === 'special';
      const isCustom = matterCategory === 'custom';
      $('specialCircsPanel').style.display = isSpecial ? 'block' : 'none';
      $('customCostWrap').style.display = isCustom ? 'block' : 'none';
      if (!isSpecial && $('scGuideSelect')) {
        $('scGuideSelect').value = '';
        onScGuideChange();
      }
      calculate();
    }
    const ids = ['matterCategory','customCost','region','appIncome','appIncomeFreq','partnerIncome','partnerIncomeFreq','incomeTax','medicare','housingType','housing','housingFreq','otherAccomType','otherAccommodation','otherAccomFreq','childcare','childcareFreq','businessExpenses','businessExpensesFreq','maintPerChild','maintFreq','childSupportChildren','hasPartner','dependants','cashSavings','vehicleEquity','homeEquity','otherAssets','pIncomeTax','pMedicare','pHousingType','pHousing','pHousingFreq','pOtherAccomType','pOtherAccommodation','pOtherAccomFreq','pChildcare','pChildcareFreq','pBusinessExpenses','pBusinessExpensesFreq','pMaintPerChild','pMaintFreq','pChildSupportChildren'];
    ids.forEach((id) => { const el = $(id); if (el) { el.addEventListener('input', calculate); el.addEventListener('change', calculate); } });
    document.querySelectorAll('input[name="clientHasPartner"]').forEach(r => r.addEventListener('change', onPartnerToggle));
    function onPartnerToggle() {
      const hasPartner = document.querySelector('input[name="clientHasPartner"]:checked').value === 'yes';
      $('partnerIncomeRow').style.display = hasPartner ? 'block' : 'none';
      $('partnerDeductionsSection').style.display = hasPartner ? 'block' : 'none';
      $('hasPartner').value = hasPartner ? 'yes' : 'no';
      calculate();
    }
    function onHousingTypeChange() {
      const isMortgage = $('housingType').value === 'mortgage';
      $('mortgageHelpBtn').style.display = isMortgage ? 'inline' : 'none';
      if (isMortgage) { document.getElementById('mortgageModal').classList.add('open'); }
      calculate();
    }
    function onPartnerHousingTypeChange() {
      const isMortgage = $('pHousingType').value === 'mortgage';
      $('pMortgageHelpBtn').style.display = isMortgage ? 'inline' : 'none';
      if (isMortgage) { document.getElementById('mortgageModal').classList.add('open'); }
      calculate();
    }
    function num(id) { return Math.max(0, Number($(id).value) || 0); }
    function money(n) { return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(n || 0); }
    function calculate() {
      const matterCategory = $('matterCategory').value;
      const customCost = num('customCost');
      const region = $('region').value;
      function toWeekly(amount, freq) {
        if (freq === 'fortnightly') return amount / 2;
        if (freq === 'monthly') return (amount * 12) / 52;
        if (freq === 'yearly') return amount / 52;
        return amount;
      }
      const appIncomeFreq = $('appIncomeFreq') ? $('appIncomeFreq').value : 'weekly';
      const partnerIncomeFreq = $('partnerIncomeFreq') ? $('partnerIncomeFreq').value : 'weekly';
      const appIncome = toWeekly(num('appIncome'), appIncomeFreq);
      const partnerIncome = toWeekly(num('partnerIncome'), partnerIncomeFreq);
      const hasPartner = $('hasPartner').value === 'yes';
      const incomeTax = num('incomeTax');
      const medicare = num('medicare');
      const housing = toWeekly(num('housing'), $('housingFreq') ? $('housingFreq').value : 'weekly');
      const otherAccommodation = toWeekly(num('otherAccommodation'), $('otherAccomFreq') ? $('otherAccomFreq').value : 'weekly');
      const childcare = toWeekly(num('childcare'), $('childcareFreq') ? $('childcareFreq').value : 'weekly');
      const businessExpenses = toWeekly(num('businessExpenses'), $('businessExpensesFreq') ? $('businessExpensesFreq').value : 'weekly');
      const maintPerChild = toWeekly(num('maintPerChild'), $('maintFreq') ? $('maintFreq').value : 'weekly');
      const childSupportChildren = Math.floor(num('childSupportChildren'));
      const pIncomeTax = hasPartner ? num('pIncomeTax') : 0;
      const pMedicare = hasPartner ? num('pMedicare') : 0;
      const pHousing = hasPartner ? toWeekly(num('pHousing'), $('pHousingFreq') ? $('pHousingFreq').value : 'weekly') : 0;
      const pOtherAccommodation = hasPartner ? toWeekly(num('pOtherAccommodation'), $('pOtherAccomFreq') ? $('pOtherAccomFreq').value : 'weekly') : 0;
      const pChildcare = hasPartner ? toWeekly(num('pChildcare'), $('pChildcareFreq') ? $('pChildcareFreq').value : 'weekly') : 0;
      const pBusinessExpenses = hasPartner ? toWeekly(num('pBusinessExpenses'), $('pBusinessExpensesFreq') ? $('pBusinessExpensesFreq').value : 'weekly') : 0;
      const pMaintPerChild = hasPartner ? toWeekly(num('pMaintPerChild'), $('pMaintFreq') ? $('pMaintFreq').value : 'weekly') : 0;
      const pChildSupportChildren = hasPartner ? Math.floor(num('pChildSupportChildren')) : 0;
      const dependants = Math.floor(num('dependants'));
      const cashSavings = num('cashSavings');
      const vehicleEquity = num('vehicleEquity');
      const homeEquity = num('homeEquity');
      const otherAssets = num('otherAssets');
      const combinedIncome = appIncome + partnerIncome;
      const housingCap = region === 'metro' ? 400 : region === 'outer' ? 300 : 240;
      const housingAllowed = Math.min(housing, housingCap) + (otherAccommodation / 2);
      const childcareAllowed = Math.min(childcare, 310);
      const maintenanceAllowed = Math.min(maintPerChild, 130) * childSupportChildren;
      const pHousingAllowed = hasPartner ? Math.min(pHousing, housingCap) + (pOtherAccommodation / 2) : 0;
      const pChildcareAllowed = hasPartner ? Math.min(pChildcare, 310) : 0;
      const pMaintenanceAllowed = hasPartner ? Math.min(pMaintPerChild, 130) * pChildSupportChildren : 0;
      const familyAllowanceCount = (hasPartner ? 1 : 0) + dependants;
      let familyAllowance = 0;
      if (familyAllowanceCount > 0) {
        familyAllowance = 130;
        if (familyAllowanceCount > 1) { familyAllowance += (familyAllowanceCount - 1) * 125; }
      }
      const deductions = incomeTax + medicare + housingAllowed + childcareAllowed + businessExpenses + maintenanceAllowed + familyAllowance + pIncomeTax + pMedicare + pHousingAllowed + pChildcareAllowed + pBusinessExpenses + pMaintenanceAllowed;
      const assessableIncome = Math.max(0, combinedIncome - deductions);
      const cashExclusion = (hasPartner || dependants > 0) ? 2190 : 1095;
      const assessableAssets = Math.max(0, cashSavings - cashExclusion) + Math.max(0, vehicleEquity - 20000) + Math.max(0, homeEquity - 500000) + otherAssets;
      let incomeThresholdText = '';
      let assetThresholdText = '';
      let eligible = false;
      let contribution = false;
      let reason = '';
      if (assessableIncome < 360 && assessableAssets < 1095) {
        eligible = true; contribution = false;
        incomeThresholdText = '< $360/week'; assetThresholdText = '< $1,095';
        reason = 'Below the lowest income and asset thresholds.';
      } else {
        if (matterCategory === 'low') {
          incomeThresholdText = '$361–$469/week'; assetThresholdText = '$1,095 up to matter cost';
          eligible = assessableIncome >= 361 && assessableIncome <= 469 && assessableAssets >= 1095 && assessableAssets <= 1555;
          contribution = eligible;
          reason = eligible ? 'Within the low-cost contribution band.' : (assessableIncome > 469 || assessableAssets > 1555) ? 'Above the low-cost matter threshold.' : 'Does not fit the low-cost contribution band. Check if the client falls under the lower no-contribution band.';
        } else if (matterCategory === 'medium') {
          incomeThresholdText = '$361–$540/week'; assetThresholdText = '$1,095 up to matter cost';
          eligible = assessableIncome >= 361 && assessableIncome <= 540 && assessableAssets >= 1095 && assessableAssets <= 6559;
          contribution = eligible;
          reason = eligible ? 'Within the medium-cost contribution band.' : (assessableIncome > 540 || assessableAssets > 6559) ? 'Above the medium-cost matter threshold.' : 'Does not fit the medium-cost contribution band. Check if the client falls under the lower no-contribution band.';
        } else if (matterCategory === 'special') {
          incomeThresholdText = 'Special circumstances — no standard threshold';
          assetThresholdText = 'Special circumstances — no standard threshold';
          eligible = true; contribution = false;
          reason = 'Special circumstances matters are not subject to the standard means test thresholds. Eligibility is determined on a case-by-case basis by VLA. Always confirm with the current VLA Handbook.';
        } else {
          const matterCost = matterCategory === 'high' ? Infinity : customCost;
          incomeThresholdText = matterCategory === 'high' ? '$361/week up to matter cost' : '$361/week up to custom matter cost';
          assetThresholdText = matterCategory === 'high' ? '$1,095 up to matter cost' : '$1,095 up to custom matter cost';
          if (matterCategory === 'high') {
            eligible = assessableIncome >= 361 && assessableAssets >= 1095;
            contribution = eligible;
            reason = eligible ? 'Likely within the high-cost contribution band. Confirm actual matter cost and category.' : 'Check lower no-contribution band or exact matter settings.';
          } else {
            eligible = assessableIncome >= 361 && assessableIncome <= matterCost && assessableAssets >= 1095 && assessableAssets <= matterCost;
            contribution = eligible;
            reason = eligible ? 'Within the custom matter-cost contribution band.' : (assessableIncome > matterCost || assessableAssets > matterCost) ? 'Above the custom matter-cost threshold.' : 'Does not fit the custom contribution band. Check whether the client is actually in the lower no-contribution band.';
          }
        }
        if (!eligible && assessableIncome < 360 && assessableAssets < 1095) {
          eligible = true; contribution = false;
          incomeThresholdText = '< $360/week'; assetThresholdText = '< $1,095';
          reason = 'Below the lowest income and asset thresholds.';
        }
      }
      const statusPill = $('statusPill');
      const resultBox = $('resultBox');
      const headline = $('headline');
      const summary = $('summary');
      if (eligible && !contribution) {
        statusPill.className = 'pill ok'; statusPill.textContent = 'Likely eligible';
        resultBox.style.background = 'var(--soft-ok)';
        headline.textContent = 'Likely eligible with no contribution'; summary.textContent = reason;
      } else if (eligible && contribution) {
        statusPill.className = 'pill warn'; statusPill.textContent = 'Likely eligible';
        resultBox.style.background = 'var(--soft-warn)';
        headline.textContent = 'Likely eligible, contribution likely'; summary.textContent = reason;
      } else {
        statusPill.className = 'pill bad'; statusPill.textContent = 'Likely not eligible';
        resultBox.style.background = 'var(--soft-bad)';
        headline.textContent = 'Likely not financially eligible'; summary.textContent = reason;
      }
      $('mCombinedIncome').textContent = money(combinedIncome);
      $('mDeductions').textContent = money(deductions);
      $('mAssessableIncome').textContent = money(assessableIncome);
      $('mAssessableAssets').textContent = money(assessableAssets);
      $('mIncomeThreshold').textContent = incomeThresholdText;
      $('mAssetThreshold').textContent = assetThresholdText;
      $('breakdown').innerHTML = '<strong>How this result was worked out</strong><br />Housing counted: ' + money(housingAllowed) + ' (cap applied from region setting).<br />Childcare counted: ' + money(childcareAllowed) + '.<br />Maintenance / child support counted: ' + money(maintenanceAllowed) + '.<br />Partner / dependant allowance counted: ' + money(familyAllowance) + '.<br />Cash savings exclusion used: ' + money(cashExclusion) + '.<br />Vehicle exclusion used: ' + money(Math.min(vehicleEquity, 20000)) + '.<br />Principal residence exclusion used: ' + money(Math.min(homeEquity, 500000)) + '.';
    }
    calculate();
  </script>
</body>
</html>`;

export default function MeansCalculator() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-4">
        <a
          href={createPageUrl("Home")}
          className="flex items-center gap-2 text-slate-600 hover:text-purple-600 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Portal
        </a>
      </div>
      <iframe
        srcDoc={calculatorHtml}
        className="flex-1 w-full"
        style={{ minHeight: "calc(100vh - 49px)", border: "none" }}
        title="VLA Means Test Quick Calculator"
      />
    </div>
  );
}

