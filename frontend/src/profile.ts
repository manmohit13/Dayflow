import { BASE_URL } from './api';

export type ProfileImage = {
  url: string;
  alternativeText?: string | null;
};

export type UserProfile = {
  id: number;
  username: string;
  email: string;
  createdAt: string;
  image?: ProfileImage | null;
};

export function getProfileImageUrl(image?: ProfileImage | null) {
  return image?.url ? new URL(image.url, BASE_URL).toString() : null;
}
