declare global {
  interface Window {
    appzi?: {
      openSurvey: (surveyId: string) => void;
    };
  }
}

export function useAppzi() {
  function openNpsModal() {
    if (window?.appzi) {
      window?.appzi.openSurvey('ca7039b5-a8b9-410b-b746-4071893a6d7e');
    }
  }

  return { openNpsModal };
}
