"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { readPdf } from "lib/parse-resume-from-pdf/read-pdf";
import type { ResumeSectionToLines, TextItems } from "lib/parse-resume-from-pdf/types";
import { groupTextItemsIntoLines } from "lib/parse-resume-from-pdf/group-text-items-into-lines";
import { groupLinesIntoSections } from "lib/parse-resume-from-pdf/group-lines-into-sections";
import { extractResumeFromSections } from "lib/parse-resume-from-pdf/extract-resume-from-sections";
import { ResumeDropzone } from "components/ResumeDropzone";
import { cx } from "lib/cx";
import { Heading, Link, Paragraph } from "components/documentation";
import { FlexboxSpacer } from "components/FlexboxSpacer";
import { saveStateToLocalStorage } from "lib/redux/local-storage";
import { Provider } from "react-redux";
import { store } from "lib/redux/store";
import { ResumeForm } from "components/ResumeForm";
import { Resume } from "lib/redux/types";
import { useAddResumeToUser, useAppSelector, useGetResume, useUpdateResume } from "lib/redux/hooks";
import { Button } from "components/Button";
import { Resume as ResumeViewer } from "components/Resume";
import { initialResumeState, selectResume } from "lib/redux/resumeSlice";
import { initialSettings } from "lib/redux/settingsSlice";
import { ToastContainer, toast } from 'react-toastify';

export default function ResumeParser() {
  const searchParams = useSearchParams();
  const [fileUrl, setFileUrl] = useState<string>();
  const [textItems, setTextItems] = useState<TextItems>([]);
  const [lines, setLines] = useState<any>([]);
  const [sections, setSections] = useState<ResumeSectionToLines>();
  const [resume, setResume] = useState<Resume>(initialResumeState);
  const [showForm, setShowForm] = useState(false)
  const [showOriginal, setShowOriginal] = useState<boolean>(false);
  const [resumeTitle, setResumeTitle] = useState('')
  const [resumeId, setResumeId] = useState<number>(0);
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
  const resumeIdParam = parseInt(searchParams.get('resume-id') || '0');
  const [resumeUploaded, setResumeUploaded] = useState(false)
  const [resumeLoadedFromDatabase, setResumeLoadedFromDatabase] = useState(false);
  const [resumeParsed, setResumeParsed] = useState(false);
  const [editMode, setEditMode] = useState<string>()
  useEffect(() => {
    if (resumeIdParam && resumeIdParam !== 0) {
      setResumeId(resumeIdParam);
      setEditMode('update')
    } else {
      setEditMode('upload')
    }
  }, [])

  useEffect(() => {
    const test = async () => {
      if (fileUrl) {
        const textItems = await readPdf(fileUrl);
        setTextItems(textItems);
      } else {
        setTextItems([])
        setShowForm(false);
      }
    }
    if (resumeUploaded === true) test();
  }, [fileUrl]);

  useEffect(() => {
    let lines;
    if (textItems && textItems.length > 0) lines = groupTextItemsIntoLines(textItems)
    if (lines && lines.length > 0) setLines(lines);
  }, [textItems]);

  useEffect(() => {
    let sections;
    if (lines && lines.length > 0) sections = groupLinesIntoSections(lines);
    if (sections && Object.keys(sections).length > 0) setSections(sections)
  }, [lines])

  useEffect(() => {
    let extractedResume;
    if (sections && Object.keys(sections).length > 0) extractedResume = extractResumeFromSections(sections)
    if (extractedResume && Object.keys(extractedResume).length > 0) {
      setResumeParsed(true);
      setResume(extractedResume)
    }
  }, [sections])

  useEffect(() => {
    // if (resume && resume?.workExperiences?.length !== 0) {
    if (resume && (resumeParsed || resumeLoadedFromDatabase)) {
      saveStateToLocalStorage({ resume: resume, settings: initialSettings })
      setShowForm(true)
    }
    if (resumeId === 0) {
      setShowOriginal(true)
    }
  }, [resume])

  useEffect(() => {
    if (resumeInDatabaseFromQuery && resumeInDatabaseFromQuery?.resume_id) {
      setResume(resumeInDatabaseFromQuery.resume_file_json_document)
      setResumeId(resumeInDatabaseFromQuery?.resume_id || 0)
      setResumeTitle(resumeInDatabaseFromQuery?.resume_title || '')
      setResumeLoadedFromDatabase(true);
      setResumeParsed(true);
    }
  }, [resumeInDatabaseFromQuery])

  useEffect(() => {
    if (resumeInDatabase && resumeInDatabase?.resume_id) {
      setResume(resumeInDatabase?.resume_file_json_document)
      setResumeId(resumeInDatabase?.resume_id || 0)
      setResumeTitle(resumeInDatabase?.resume_title || '')
      setResumeLoadedFromDatabase(true);
      setResumeParsed(true);
    }
  }, [resumeInDatabase])

  useEffect(() => {
    if (resumeInDatabaseAfterUpdate && resumeInDatabaseAfterUpdate?.resume_id) {
      setResume(resumeInDatabaseAfterUpdate.resume_file_json_document)
      setResumeId(resumeInDatabaseAfterUpdate?.resume_id || 0)
      setResumeTitle(resumeInDatabaseAfterUpdate?.resume_title || '')
      setResumeLoadedFromDatabase(true);
      setResumeParsed(true);
    }
    setResumeUploaded(false);

  }, [resumeInDatabaseAfterUpdate])

  useEffect(() => {
    if (isAddResumeSuccessful) {
      const Msg = ({ }) => (
        <div>
          <p>Resume successfully added.</p>
          <br />
          <p>Now, you can edit your resume and see how your resume will appear to recruiters in the View your resume section.</p>
        </div>
      )
      toast.success(<Msg />, {
        position: 'top-center'
      })
    }

  }, [isAddResumeSuccessful])

  useEffect(() => {
    if (isUpdateResumeSuccessful === true) {
      toast.success('Resume successfully updated', {
        position: 'top-center'
      })
    }

  }, [isUpdateResumeSuccessful])

  const handleCloseClick = (e: any) => {
    if (typeof window !== "undefined") {
      window.opener = null;
      window.open("", "_self");
      window.close();
    }
  }

  const handleAddClick = (e: any) => {
    if (!resumeTitle || resumeTitle.trim() === '') {
      toast.error('Resume title required', {
        position: 'top-center'
      })
      return false;
    }
    setShowOriginal(false)
    addResumeToUser({
      user_id: user_id, resume_title: resumeTitle, resume: resume || initialResumeState
    })
  }

  const AddUpdateButton = () => {
    const updatedResume = useAppSelector(selectResume);
    const handleUpdateClick = (e: any) => {
      if (!resumeTitle || resumeTitle.trim() === '') {
        toast.error('Resume title required', {
          position: 'top-center'
        })
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
      <div className="grid md:grid-cols-6 md:h-[90vh]">
        {showOriginal === true && resumeUploaded === true ?
          (
            <div className="flex px-2 text-gray-900 md:col-span-3  md:overflow-y-scroll">
              <section className="grow px-4 md:px-0">
                <Heading level={2} className="!mt-[1.2em]">
                  See your original resume
                </Heading>
                <div className="aspect-h-[8.0] aspect-w-7">
                  {typeof fileUrl !== 'undefined' && fileUrl?.length !== 0 ?
                    <iframe src={`${fileUrl}#navpanes=0`} className="h-full w-full" />
                    :
                    null
                  }
                </div>
              </section>
            </div>
          )
          :
          null
        }
        {editMode === 'upload' ?
          (
            <div className="flex px-6 text-gray-900 md:col-span-3 md:h-[90vh] md:overflow-y-scroll">
              <section className="grow">
                <Heading level={2} className="!mt-[1.2em]">
                  Upload your resume
                </Heading>
                <div className="mt-3">
                  <ResumeDropzone
                    onFileUrlChange={(fileUrl) => {
                      setFileUrl(fileUrl)
                      setResumeUploaded(true);
                      setEditMode('update')
                      const Msg = ({ }) => (
                        <div>
                          <p>Resume successfully uploaded.</p>
                          <br />
                          <li>Give your resume a title. </li>
                          <li>Confirm the information was extracted correctly and placed in the correct fields.</li>
                          <li>Use the form to edit and match your resume as best as possible.</li>
                          <li>When done, click Save.</li>
                          <li>You may close this tab.</li>
                        </div>
                      )
                      toast.success(<Msg />, {
                        position: 'top-center'
                      })

                    }
                    }
                    playgroundView={true}
                  />
                </div>
              </section>
            </div>
          )
          :
          null
        }
        {showForm && resumeParsed && (resumeUploaded === true || resumeLoadedFromDatabase === true) ?
          <div className="flex px-2 text-gray-900 md:col-span-3  md:overflow-y-scroll">
            <section className="grow">
              <Heading level={2} className="!mt-[1.2em]">
                Edit your resume
              </Heading>
              <Provider store={store}>
                <ResumeForm resumeTitle={resumeTitle} setResumeTitle={setResumeTitle} />
              </Provider>
            </section>
          </div>
          :
          null
        }
        {resumeLoadedFromDatabase === true ?
          (
            <div className="flex px-6 text-gray-900 md:col-span-3 md:h-[90vh] md:overflow-y-scroll">
              <section className="grow">
                <Provider store={store}>
                  <div className={cx(
                    "scrollbar scrollbar-track-gray-100 scrollbar-w-3 md:h-[calc(100vh-var(--top-nav-bar-height))] md:overflow-y-scroll",
                    isHover && "scrollbar-thumb-gray-200"
                  )} style={{ minWidth: '700px' }}>
                    <section className="max-w-[700px] grow">
                      <Heading level={2} className="!mt-[1.2em]">
                        View your resume
                      </Heading>
                      <ResumeViewer privateView={privateView} setPrivateView={setPrivateView} />
                    </section>
                  </div>
                </Provider>
              </section>
            </div>
          )
          :
          null
        }
      </div>
      <div style={{ width: '100%', textAlign: 'right', paddingRight: '10px', paddingTop: '10px' }}>
        {(resumeLoadedFromDatabase || resumeUploaded) &&
          <Provider store={store}>
            <AddUpdateButton></AddUpdateButton>
          </Provider>
        }
        {/* <Button className="btn btn-primary" onClick={handleCloseClick}>Close</Button> */}
      </div>
      <ToastContainer />
    </main>
  );
}
