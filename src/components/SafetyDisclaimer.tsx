"use client";

import React from "react";

const TERMS_URL = "https://www.simpleallergyalert.com/terms.html";
const PRIVACY_URL = "https://www.simpleallergyalert.com/privacy-policy.html";

const SafetyDisclaimer = () => {
  return (
    <div className="space-y-4 text-center text-gray-700 dark:text-gray-300 leading-relaxed">
      <div className="space-y-2">
        <p>          
          This app is not a medical device. It provides translated allergy alerts for convenience. Translations are machine-generated and may contain errors. Do not rely on this app as your sole means of communicating a life-threatening allergy. Always carry your prescribed medication. By using this app you agree to our <a href={TERMS_URL} target="_blank" rel="noopener noreferrer" className="underline text-red-600 dark:text-red-500">Terms &amp; Conditions</a> and <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer" className="underline text-red-600 dark:text-red-500">Privacy Policy</a>.
        </p>
      </div>
      <p className="font-bold text-red-600 dark:text-red-500">If in doubt, do no eat.</p>
    </div>
  );
};

export default SafetyDisclaimer;
