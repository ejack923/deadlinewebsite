import React from 'react';
import { TextField, RadioField, CheckboxGroup, SectionHeader } from './FormField';

const ENGLISH_LEVEL = [
  { value: "Very well", label: "Very well" }, { value: "Well", label: "Well" },
  { value: "Not well", label: "Not well" }, { value: "Not at all", label: "Not at all" },
];

const DISABILITY_OPTIONS = [
  { value: "acquired_brain_injury", label: "Acquired brain injury" },
  { value: "chronic_illness", label: "Chronic Illness (e.g. cancer, chronic fatigue, diabetes)" },
  { value: "deafblind", label: "Deafblind" },
  { value: "developmental_delay", label: "Developmental delay (in children)" },
  { value: "learning_difficulty", label: "Learning difficulty (including dyslexia)" },
  { value: "mental_health", label: "Mental health issues (psychosocial)" },
  { value: "cognitive", label: "Cognitive (including intellectual disability)" },
  { value: "speech_sensory", label: "Speech and sensory" },
  { value: "blind_vision", label: "Blind or vision-impaired" },
  { value: "deaf_hearing", label: "Deaf or hearing-impaired" },
  { value: "physical", label: "Physical" },
  { value: "neurological", label: "Neurological (e.g. Alzheimer's, Parkinson's, multiple sclerosis)" },
  { value: "neurodiverse", label: "Neurodiverse (e.g. autism spectrum disorder, ADHD)" },
];

const SUPPORT_OPTIONS = [
  { value: "carer_present", label: "Carer or third-party present" },
  { value: "quiet_space", label: "Quiet space" },
  { value: "plain_english", label: "Plain English version of correspondence" },
  { value: "screen_reader", label: "Screen-reader" },
  { value: "building_access", label: "Access to buildings (e.g. wheelchair, crutches, walker)" },
  { value: "text_phone", label: "Text/phone" },
  { value: "hearing_loop", label: "Hearing loop" },
  { value: "video_conference", label: "Video conference/facetime" },
  { value: "low_lighting", label: "Low lighting" },
  { value: "auslan", label: "Auslan Interpreter" },
];

export default function Step2LanguageHealth({ data, onChange }) {
  return (
    <div className="space-y-8">
      {/* Section 4 */}
      <div>
        <SectionHeader number="4" title="Language" />
        <div className="space-y-5">
          <RadioField label="Do you speak a language other than English at home?" name="other_language" value={data.other_language} onChange={onChange} options={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]} />
          {data.other_language === "Yes" && (
            <>
              <TextField label="Which language?" name="which_language" value={data.which_language} onChange={onChange} />
              <RadioField label="How well do you speak English?" name="english_level" value={data.english_level} onChange={onChange} options={ENGLISH_LEVEL} />
              <RadioField label="Do you need an interpreter?" name="need_interpreter" value={data.need_interpreter} onChange={onChange} options={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]} />
              {data.need_interpreter === "Yes" && (
                <TextField label="Which language?" name="interpreter_language" value={data.interpreter_language} onChange={onChange} />
              )}
            </>
          )}
        </div>
      </div>

      {/* Section 5 */}
      <div>
        <SectionHeader number="5" title="Disability and mental health" />
        <div className="space-y-5">
          <RadioField label="Do you have a disability?" name="has_disability" value={data.has_disability} onChange={onChange} options={[{value:"Yes",label:"Yes"},{value:"No",label:"No"},{value:"Not disclosed",label:"Not disclosed"}]} />
          {data.has_disability === "Yes" && (
            <>
              <CheckboxGroup label="What kind of disability? (you can select more than one)" name="disability_types" values={data.disability_types} onChange={onChange} options={DISABILITY_OPTIONS} />
              <TextField label="Other disability (please specify)" name="disability_other" value={data.disability_other} onChange={onChange} />
            </>
          )}
        </div>
      </div>

      {/* Section 6 */}
      {data.has_disability === "Yes" && (
        <div>
          <SectionHeader number="6" title="Disability and mental health support" />
          <div className="space-y-5">
            <RadioField label="Do you require disability or mental health support?" name="need_support" value={data.need_support} onChange={onChange} options={[{value:"Yes",label:"Yes"},{value:"No",label:"No"},{value:"Not disclosed",label:"Not disclosed"}]} />
            {data.need_support === "Yes" && (
              <>
                <CheckboxGroup label="What support do you require? (you can select more than one)" name="support_types" values={data.support_types} onChange={onChange} options={SUPPORT_OPTIONS} />
                <TextField label="Other support (please specify)" name="support_other" value={data.support_other} onChange={onChange} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}