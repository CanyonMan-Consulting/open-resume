"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { readPdf } from "lib/parse-resume-from-pdf/read-pdf";
import type { TextItems } from "lib/parse-resume-from-pdf/types";
import { groupTextItemsIntoLines } from "lib/parse-resume-from-pdf/group-text-items-into-lines";
import { groupLinesIntoSections } from "lib/parse-resume-from-pdf/group-lines-into-sections";
import { extractResumeFromSections } from "lib/parse-resume-from-pdf/extract-resume-from-sections";
import { ResumeDropzone } from "components/ResumeDropzone";
import { cx } from "lib/cx";
import { Heading, Link, Paragraph } from "components/documentation";
import { ResumeTable } from "resume-parser/ResumeTable";
import { FlexboxSpacer } from "components/FlexboxSpacer";
import { ResumeParserAlgorithmArticle } from "resume-parser/ResumeParserAlgorithmArticle";
import { loadStateFromLocalStorage, saveStateToLocalStorage } from "lib/redux/local-storage";
import { Provider } from "react-redux";
import { store } from "lib/redux/store";
import { ResumeForm } from "components/ResumeForm";
import { Resume } from "lib/redux/types";
import { useAddResumeToUser, useAppSelector, useGetResume, useUpdateResume } from "lib/redux/hooks";
import { Button } from "components/Button";
import { Resume as ResumeViewer } from "components/Resume";
import { selectResume } from "lib/redux/resumeSlice";


export default function ResumeParser() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [fileUrl, setFileUrl] = useState('');
  const [textItems, setTextItems] = useState<TextItems>([]);
  const [lines, setLines] = useState<any>([]);
  const [sections, setSections] = useState<any>([]);
  const [resume, setResume] = useState<Resume>();
  const [showForm, setShowForm] = useState(false)
  const [showOriginal, setShowOriginal] = useState(false);
  const [resumeTitle, setResumeTitle] = useState('')
  const [resumeId, setResumeId] = useState<number>(parseInt(searchParams.get('resume-id') || '0'));
  const user_id: number = parseInt(searchParams.get('user-id') || '0');
  const { mutate: addResumeToUser,
    data: resumeInDatabase,
    isSuccess: isAddResumeSuccessful,
    isError: isAddResumeError,
    error: addResumeError } = useAddResumeToUser();
  const { mutate: updateResume,
    data: resumeInDatabaseAfterUpdate,
    isSuccess: isUpdateResumeSuccessful,
    isError: isUpdateResumeError,
    error: updateResumeError } = useUpdateResume();
  const { data: resumeInDatabaseFromQuery,
    isSuccess: isGetResumeSuccessful,
    isError: isGetResumeError,
    error: getResumeError } = useGetResume(user_id, resumeId)
  const [privateView, setPrivateView] = useState(true);
  const [isHover, setIsHover] = useState(false);

  useEffect(() => {
    async function test() {
      if (fileUrl !== '') {
        const textItems = await readPdf(fileUrl);
        setTextItems(textItems);
      } else {
        setTextItems([])
        setShowForm(false);
      }
    }
    test();
  }, [fileUrl]);

  useEffect(() => {
    if (textItems && textItems.length > 0) setLines(groupTextItemsIntoLines(textItems))
  }, [textItems]);

  useEffect(() => {
    if (lines && lines.length > 0) setSections(groupLinesIntoSections(lines))
  }, [lines])

  useEffect(() => {
    if (sections) setResume(extractResumeFromSections(sections))
  }, [sections])

  useEffect(() => {
    if (resume && resume?.workExperiences?.length !== 0) {
      saveStateToLocalStorage({ resume: resume })
      setShowForm(true)
    }
    if (resumeId === 0) {
      setShowOriginal(true)
    }
  }, [resume])

  useEffect(() => {
    if (resumeId) {

    }
  }, [resumeId])

  useEffect(() => {
    if (resumeInDatabaseFromQuery && resumeInDatabaseFromQuery?.resume_id) {
      console.log('search param and in database', resumeInDatabaseFromQuery?.resume_id)
      setResume(resumeInDatabaseFromQuery.resume_file_json_document)
      setResumeId(resumeInDatabaseFromQuery?.resume_id || 0)
      setResumeTitle(resumeInDatabaseFromQuery?.resume_title || '')
    } else if (resumeInDatabase && resumeInDatabase?.resume_id) {
      console.log('no search param and in database', resumeInDatabase?.resume_id)
      setResume(resumeInDatabase?.resume_file_json_document)
      setResumeId(resumeInDatabase?.resume_id || 0)
      setResumeTitle(resumeInDatabase?.resume_title || '')
    } else if (resumeInDatabaseAfterUpdate && resumeInDatabaseAfterUpdate?.resume_id) {
      console.log('search param and in database', resumeInDatabaseFromQuery?.resume_id)
      setResume(resumeInDatabaseAfterUpdate.resume_file_json_document)
      setResumeId(resumeInDatabaseAfterUpdate?.resume_id || 0)
      setResumeTitle(resumeInDatabaseAfterUpdate?.resume_title || '')
    }

  }, [resumeInDatabase, resumeInDatabaseFromQuery, resumeInDatabaseAfterUpdate])

  const handleAddClick = (e) => {
    if (!resumeTitle || resumeTitle.trim() === '') {
      alert('Resume Title required');
      return false;
    }
    setShowOriginal(false)
    addResumeToUser({
      user_id: user_id, resume_title: resumeTitle, resume
    })
  }

  const AddUpdateButton = (props: { setResume: any }) => {
    const updatedResume = useAppSelector(selectResume);
    const handleUpdateClick = (e) => {
      if (!resumeTitle || resumeTitle.trim() === '') {
        alert('Resume Title required');
        return false;
      }
      updateResume({
        user_id: user_id, resume_title: resumeTitle, resume_id: resumeId, resume: updatedResume
      })
    }

    return resumeId === 0 ? <Button className="btn btn-primary" onClick={handleAddClick}>Save</Button> : <Button className="btn btn-primary" onClick={handleUpdateClick}>Update</Button>
  }

  return (
    <main className="h-full w-full overflow-clip" style={{ maxHeight: '100vh' }}>
      <div className="grid md:grid-cols-6">
        {showOriginal === true ?
          (
            <div className="flex justify-center px-2 md:col-span-3 md:h-[calc(100vh-var(--top-nav-bar-height))] md:justify-end">
              <section className="mt-5 grow px-4 md:max-w-[600px] md:px-0">
                <div className="aspect-h-[9.5] aspect-w-7">
                  {fileUrl !== '' ?
                    <iframe src={`${fileUrl}#navpanes=0`} className="h-full w-full" />
                    :
                    null
                  }
                </div>
              </section>
              <FlexboxSpacer maxWidth={45} className="hidden md:block" />
            </div>
          )
          :
          null
        }
        <div className="flex px-6 text-gray-900 md:col-span-3 md:h-[calc(100vh-var(--top-nav-bar-height))] md:overflow-y-scroll">
          <FlexboxSpacer maxWidth={45} className="hidden md:block" />
          <section className="max-w-[600px] grow">
            {!showForm && resumeId === 0 ?
              (
                <>
                  <Heading className="text-primary !mt-4">
                    Upload your resume
                  </Heading>
                  <div className="mt-3">
                    <ResumeDropzone
                      onFileUrlChange={(fileUrl) =>
                        setFileUrl(fileUrl)
                      }
                      playgroundView={true}
                    />
                  </div>
                </>
              )
              :
              null
            }
            <Heading level={2} className="!mt-[1.2em]">
              Edit your resume
            </Heading>
            <Provider store={store}>
              {showForm ? <ResumeForm resumeTitle={resumeTitle} setResumeTitle={setResumeTitle} /> : null}
            </Provider>
          </section>
        </div>
        {!showOriginal ?
          (
            <Provider store={store}>
              <div className={cx(
                "flex justify-center scrollbar scrollbar-track-gray-100 scrollbar-w-3 md:h-[calc(100vh-var(--top-nav-bar-height))] md:justify-end md:overflow-y-scroll",
                isHover && "scrollbar-thumb-gray-200"
              )} style={{ minWidth: '700px' }}>
                <ResumeViewer privateView={privateView} setPrivateView={setPrivateView} />
                <FlexboxSpacer maxWidth={45} className="hidden md:block" />
              </div>
            </Provider>
          )
          :
          null
        }

      </div>
      <Provider store={store}>
        <AddUpdateButton></AddUpdateButton>
      </Provider>
    </main>
  );
}
