import axios, { AxiosRequestConfig } from 'axios';
import { Resume } from './types';

export type ResumeInDatabase = {
  resume_id: number,
  user_id: number,
  resume_title: string,
  resume_file_id: string,
  resume_file_json_document: Resume
}

export async function addResumeToUser(user_id: number, resume_title: string, resume: Resume): Promise<ResumeInDatabase> {
  const config: AxiosRequestConfig = {
    baseURL: 'http://localhost:3000/api',
    url: '/resumes',
    method:'POST',
    data: {
      user_id: user_id,
      resume_title: resume_title,
      resume: resume
    }
  }
  const response = await axios.request<ResumeInDatabase>(config)
  return response.data;
}

export async function updateResume(user_id: number, resume_title: string, resume_id: number, resume: Resume): Promise<ResumeInDatabase> {
  const config: AxiosRequestConfig = {
    baseURL: 'http://localhost:3000/api',
    url: `/resumes/${resume_id}`,
    method:'PUT',
    data: {
      user_id: user_id,
      resume_title: resume_title,
      resume: resume
    }
  }
  const response = await axios.request<ResumeInDatabase>(config)
  return response.data;
}

export async function getResume(user_id: number, resume_id: number): Promise<ResumeInDatabase> {
  const config: AxiosRequestConfig = {
    baseURL: 'http://localhost:3000/api',
    url: `/resumes/${resume_id}`,
    method:'GET',
  }
  const response = await axios.request<ResumeInDatabase>(config)
  return response.data;
}