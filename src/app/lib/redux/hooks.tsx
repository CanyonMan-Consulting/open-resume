import { useEffect } from "react";
import {
  useDispatch,
  useSelector,
  type TypedUseSelectorHook,
} from "react-redux";
import { store, type RootState, type AppDispatch } from "lib/redux/store";
import {
  loadStateFromLocalStorage,
  saveStateToLocalStorage,
} from "lib/redux/local-storage";
import { initialResumeState, setResume } from "lib/redux/resumeSlice";
import {
  initialSettings,
  setSettings,
  type Settings,
} from "lib/redux/settingsSlice";
import { deepMerge } from "lib/deep-merge";
import type { Resume } from "lib/redux/types";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import * as api from './apis'

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/**
 * Hook to save store to local storage on store change
 */
export const useSaveStateToLocalStorageOnChange = () => {
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      saveStateToLocalStorage(store.getState());
    });
    return unsubscribe;
  }, []);
};

export const useSetInitialStore = () => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    const state = loadStateFromLocalStorage();
    if (!state) return;
    if (state.resume) {
      // We merge the initial state with the stored state to ensure
      // backward compatibility, since new fields might be added to
      // the initial state over time.
      const mergedResumeState = deepMerge(
        initialResumeState,
        state.resume
      ) as Resume;
      dispatch(setResume(mergedResumeState));
    }
    if (state.settings) {
      const mergedSettingsState = deepMerge(
        initialSettings,
        state.settings
      ) as Settings;
      dispatch(setSettings(mergedSettingsState));
    }
  }, []);
};

export const useAddResumeToUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: { user_id: number, resume_title: string, resume: Resume }) => api.addResumeToUser(args.user_id, args.resume_title, args.resume),
    onSuccess: (data) => {
      // queryClient.invalidateQueries(['resume', { user_id: data?.user_id, resume_id: data?.resume_id }])
    }
  })
}

export const useUpdateResume = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: { user_id: number, resume_title: string, resume_id: number, resume: Resume }) => api.updateResume(args.user_id, args.resume_title, args.resume_id, args.resume),
    onSuccess: (data) => {
      // queryClient.invalidateQueries(['resume', { user_id: data?.user_id, resume_id: data?.resume_id }])
    }
  })
}

export const useGetResume = (user_id: number, resume_id: number) => {
  return useQuery({
    queryFn: async () => api.getResume(user_id, resume_id),
    queryKey: ['resume', { user_id, resume_id }]
  })
}
