import { GET_IEP_SECTION_TOOL, setExtractIepSectionsForTests } from "./getIepSection.js";

async function main() {
  // Inject a mock IEP extraction result
  setExtractIepSectionsForTests(async (_pdfPath: string) => {
    const rawText = [
      "ACCOMMODATIONS AND MODIFICATIONS",
      "Provide extended time and small-group setting.",
      "MEASURABLE ANNUAL GOALS",
      "Increase reading fluency to 120 wpm by June.",
      "ADDITIONAL INFORMATION",
      "N/A",
    ].join("\n");

    return {
      rawText,
      studentAndParentConcerns: "",
      studentVision: "",
      studentProfile: "",
      presentLevelsAcademics: "",
      presentLevelsBehavioralSocialEmotional: "",
      presentLevelsCommunication: "",
      presentLevelsAdditionalAreas: "",
      accommodationsAndModifications: "Provide extended time and small-group setting.",
      measurableAnnualGoals: "Increase reading fluency to 120 wpm by June.",
      participationGeneralEducation: "",
      serviceDelivery: "",
      assessmentsAndAccommodations: "",
      scheduleModification: "",
      additionalInformation: "N/A",
      placement: "",
    };
  });

  // 1) Resolve by section key
  const res1 = await GET_IEP_SECTION_TOOL.handler({ section: "accommodationsAndModifications" });
  const out1 = JSON.parse(res1.content[0].text);
  console.assert(out1.status === "ok", "status should be ok");
  console.assert(out1.match.key === "accommodationsAndModifications", "key should match");
  console.assert(
    typeof out1.result.sectionText === "string" && out1.result.sectionText.includes("extended time"),
    "sectionText should include accommodations content",
  );

  // 2) Resolve by partial heading
  const res2 = await GET_IEP_SECTION_TOOL.handler({ section: "ANNUAL GOALS" });
  const out2 = JSON.parse(res2.content[0].text);
  console.assert(out2.match.key === "measurableAnnualGoals", "should resolve to measurableAnnualGoals");
  console.assert(
    out2.result.sectionText.includes("120 wpm"),
    "sectionText should include goals content",
  );

  // 3) Goal snippet lookup
  const res3 = await GET_IEP_SECTION_TOOL.handler({ section: "measurableAnnualGoals", goalId: "120 wpm" });
  const out3 = JSON.parse(res3.content[0].text);
  console.assert(out3.result.goal && out3.result.goal.found === true, "goal snippet should be found");

  // Reset mock
  setExtractIepSectionsForTests(null);
  console.log("getIepSection.test.ts PASS");
}

main().catch((err) => {
  console.error("getIepSection.test.ts FAIL", err);
  process.exit(1);
});
