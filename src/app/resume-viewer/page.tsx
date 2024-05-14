"use client";
import { Provider } from "react-redux";
import { store } from "lib/redux/store";
import { ResumeForm } from "components/ResumeForm";
import { useEffect, useState } from "react";
import { Resume as ResumeViewer } from "components/Resume";
import { useAppSelector, useGetResume } from "lib/redux/hooks";
import { useSearchParams } from "next/navigation";
import { Resume } from "lib/redux/types";
import { saveStateToLocalStorage } from "lib/redux/local-storage";
import { ResumePDF } from "components/Resume/ResumePDF";
import { Settings, initialSettings } from "lib/redux/settingsSlice";

export default function Create() {
  const searchParams = useSearchParams();
  const [privateView, setPrivateView] = useState(true);
  const [resumeId, setResumeId] = useState<number>(parseInt(searchParams.get('resume-id') || '0'));
  const user_id: number = parseInt(searchParams.get('user-id') || '0');
  const [resume, setResume] = useState<Resume>();
  const settings: Settings = {
    themeColor: '#1D6ADD',
    fontFamily: 'Arial',
    fontSize: '10pt',
    documentSize: 'letter',
    formToShow: {
      workExperiences: true,
      educations: true,
      projects: true,
      skills: true,
      custom: false,
    },
    formToHeading: {
      workExperiences: 'Work Experience',
      educations: 'Education',
      projects: 'Projects',
      skills: 'Skills',
      custom: 'Custom',
    },
    formsOrder: ['workExperiences', 'educations', 'projects', 'skills'],
    showBulletPoints: {
      educations: true,
      projects: true,
      skills: true,
      custom: false,
    }
  };

  const {
    data: resumeInDatabaseFromQuery,
    isSuccess: isGetResumeSuccessful,
    isError: isGetResumeError,
    error: getResumeError
  } = useGetResume(user_id, resumeId)

  useEffect(() => {
    if (searchParams.get('resume-id') && resumeInDatabaseFromQuery && resumeInDatabaseFromQuery?.resume_id) {
      setResume(resumeInDatabaseFromQuery.resume_file_json_document)
      saveStateToLocalStorage({ resume: resumeInDatabaseFromQuery.resume_file_json_document, settings: initialSettings })
    }
  }, [resumeInDatabaseFromQuery])

  return (
    <main style={{ width: '100vw', maxHeight: '100vh', overflowY: 'scroll' }}>
      <div>
        {resumeInDatabaseFromQuery &&
          <ResumePDF
            resume={resumeInDatabaseFromQuery.resume_file_json_document}
            settings={settings}
            isPDF={false}
            privateView={true}
          />}
      </div>
    </main>
  );
}
