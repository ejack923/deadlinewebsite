export const CHARGE_SUBDIVISIONS = [
  "A20 Assault and related offences",
  "A30 Sexual offences",
  "B30 Burglary/Break and enter",
  "B40 Theft",
  "B50 Deception",
  "C10 Drug dealing and trafficking",
  "C30 Drug use and possession",
  "D10 Weapons and explosives offences",
  "D20 Disorderly and offensive conduct",
];

export const CHARGE_DATA = {
  "A20 Assault and related offences": {
    "A21 Serious assault": [
      "INTENTIONALLY CAUSE SERIOUS INJURY",
      "RECKLESSLY CAUSE SERIOUS INJURY",
      "INTENTIONALLY CAUSE INJURY",
      "RECKLESSLY CAUSE INJURY",
      "ASSAULT WITH WEAPON",
    ],
    "A23 Common assault": [
      "COMMON ASSAULT",
      "UNLAWFUL ASSAULT",
      "ASSAULT POLICE",
    ],
  },
  "A30 Sexual offences": {
    "A31 Rape": ["RAPE", "ATTEMPTED RAPE"],
    "A32 Indecent assault": ["SEXUAL ASSAULT", "INDECENT ASSAULT"],
    "A34 Sexual offences against children": [
      "GROOM CHILD UNDER 16 FOR SEXUAL OFFENCE",
      "POSSESS CHILD ABUSE MATERIAL",
    ],
  },
  "B30 Burglary/Break and enter": {
    "B31 Aggravated burglary": ["AGGRAVATED BURGLARY", "HOME INVASION"],
    "B32 Non-aggravated burglary": ["BURGLARY", "ENTER BUILDING WITH INTENT TO STEAL"],
  },
  "B40 Theft": {
    "B41 Motor vehicle theft": ["THEFT OF A MOTOR VEHICLE"],
    "B42 Steal from a motor vehicle": ["THEFT FROM MOTOR VEHICLE"],
    "B49 Other theft": ["THEFT", "SHOP STEALING"],
  },
  "B50 Deception": {
    "B53 Obtain benefit by deception": [
      "OBTAIN PROPERTY BY DECEPTION",
      "OBTAIN FINANCIAL ADVANTAGE BY DECEPTION",
      "FALSE ACCOUNTING",
    ],
  },
  "C10 Drug dealing and trafficking": {
    "C12 Drug trafficking": [
      "TRAFFICK DRUG OF DEPENDENCE",
      "TRAFFICK CANNABIS",
      "TRAFFICK METHYLAMPHETAMINE",
    ],
  },
  "C30 Drug use and possession": {
    "C31 Drug use": ["USE CANNABIS", "USE METHYLAMPHETAMINE"],
    "C32 Drug possession": ["POSSESS CANNABIS", "POSSESS A DRUG OF DEPENDENCE", "POSSESS METHYLAMPHETAMINE"],
  },
  "D10 Weapons and explosives offences": {
    "D11 Firearms offences": ["POSSESS FIREARM WITHOUT LICENCE", "PROHIBITED PERSON POSSESS A FIREARM"],
    "D12 Prohibited and controlled weapons offences": ["POSSESS CONTROLLED WEAPON WITHOUT EXCUSE"],
  },
  "D20 Disorderly and offensive conduct": {
    "D21 Riot and affray": ["AFFRAY", "VIOLENT DISORDER"],
    "D23 Offensive conduct": ["BEHAVE IN AN OFFENSIVE MANNER", "USE OFFENSIVE LANGUAGE"],
  },
};
