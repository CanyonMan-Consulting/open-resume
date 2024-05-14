"use client";
import { useState } from "react";
import {
  useAppSelector,
  useSaveStateToLocalStorageOnChange,
  useSetInitialStore,
} from "lib/redux/hooks";
import { ShowForm, selectFormsOrder } from "lib/redux/settingsSlice";
import { ProfileForm } from "components/ResumeForm/ProfileForm";
import { WorkExperiencesForm } from "components/ResumeForm/WorkExperiencesForm";
import { EducationsForm } from "components/ResumeForm/EducationsForm";
import { ProjectsForm } from "components/ResumeForm/ProjectsForm";
import { SkillsForm } from "components/ResumeForm/SkillsForm";
import { ThemeForm } from "components/ResumeForm/ThemeForm";
import { CustomForm } from "components/ResumeForm/CustomForm";
import { FlexboxSpacer } from "components/FlexboxSpacer";
import { cx } from "lib/cx";
import { Resume } from "lib/redux/types";
import { loadStateFromLocalStorage } from "lib/redux/local-storage";
import { Input } from "./Form/InputGroup";

const formTypeToComponent: { [type in ShowForm]: () => JSX.Element } = {
  workExperiences: WorkExperiencesForm,
  educations: EducationsForm,
  projects: ProjectsForm,
  skills: SkillsForm,
  custom: CustomForm,
};

export const ResumeForm = (props: { resumeTitle: string, setResumeTitle: any }) => {
  useSetInitialStore();
  useSaveStateToLocalStorageOnChange();

  const formsOrder = useAppSelector(selectFormsOrder);
  const [isHover, setIsHover] = useState(false);
  // const [resumeTitle, setResumeTitle] = useState('')
  const handleTitleChange = (e, f) => {
    console.log('e', e, f)
    props.setResumeTitle(f)
  }

  return (
    <div
      className={cx(
        "flex justify-center scrollbar scrollbar-track-gray-100 scrollbar-w-3 md:h-[calc(100vh-var(--top-nav-bar-height))] md:justify-end md:overflow-y-scroll",
        isHover && "scrollbar-thumb-gray-200"
      )}
    >
      <section className="flex max-w-2xl flex-col gap-8 p-[var(--resume-padding)]">
        <Input
          label="Resume Title"
          labelClassName="col-span-full"
          name="resumeTitle"
          value={props.resumeTitle}
          placeholder="My resume title"
          onChange={handleTitleChange}
        />
        <ProfileForm />
        {formsOrder.map((form) => {
          const Component = formTypeToComponent[form];
          return <Component key={form} />;
        })}
      </section>
    </div>
  );
};
